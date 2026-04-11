import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../store/useEditorStore';

// Mapping face index to string identifier
const FACE_MAP = ['right', 'left', 'top', 'bottom', 'front', 'back'];

const PaintedBlock = ({ setEnableOrbit }) => {
  const meshRef = useRef();
  const faceDataRefs = useEditorStore(state => state.faceDataRefs);
  const paintOnFace = useEditorStore(state => state.paintOnFace);
  const setBrushSize = useEditorStore(state => state.setBrushSize);
  const color = useEditorStore(state => state.color);
  const lastUpdate = useEditorStore(state => state.lastUpdate);

  // Initialize CanvasTextures mapped to each face of the BoxGeometry
  const materials = useMemo(() => {
    return FACE_MAP.map(faceId => {
      // Create a blank white texture as fallback
      const blankCanvas = document.createElement('canvas');
      blankCanvas.width = 128;
      blankCanvas.height = 128;
      const ctx = blankCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,128,128);

      const tex = new THREE.CanvasTexture(blankCanvas);
      // Disable color space auto-srgb conversion if needed, but modern r3f defaults to sRGB
      tex.colorSpace = THREE.SRGBColorSpace;
      
      return new THREE.MeshStandardMaterial({ map: tex });
    });
  }, []);

  // Sync textures when lastUpdate changes (user paints in 2D or 3D)
  useEffect(() => {
    FACE_MAP.forEach((faceId, idx) => {
      const sourceCanvas = faceDataRefs[faceId];
      if (sourceCanvas && materials[idx].map.image !== sourceCanvas) {
        materials[idx].map = new THREE.CanvasTexture(sourceCanvas);
        materials[idx].map.colorSpace = THREE.SRGBColorSpace;
        materials[idx].needsUpdate = true;
      } else if (sourceCanvas) {
        materials[idx].map.needsUpdate = true;
      }
    });
  }, [faceDataRefs, lastUpdate, materials]);

  const isDrawingOnMesh = useRef(false);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    isDrawingOnMesh.current = true;
    setEnableOrbit(false);
    e.target.setPointerCapture(e.pointerId);

    if (e.uv && e.faceIndex !== undefined) {
      const faceIndex = Math.floor(e.faceIndex / 2);
      const faceStringId = FACE_MAP[faceIndex];
      useEditorStore.getState().saveHistoryState(faceStringId);
      draw(e);
    }
  };
  
  const handlePointerUp = (e) => {
    e.stopPropagation();
    isDrawingOnMesh.current = false;
    e.target.releasePointerCapture(e.pointerId);
    setEnableOrbit(true);
  };

  const draw = (e) => {
    // Only paint if this is an explicit drag / click, and valid UVs exist
    if (!e.uv) return;
    
    // faceIndex maps to the Box geometry face (0=right, 1=left, 2=top, etc)
    const faceIndex = Math.floor(e.faceIndex / 2); // BoxGeometry has 2 triangles per face (12 total face items)
    const faceStringId = FACE_MAP[faceIndex];
    
    paintOnFace(faceStringId, e.uv.x, e.uv.y);
  };

  return (
    <mesh 
      ref={meshRef} 
      onPointerDown={handlePointerDown} 
      onPointerMove={(e) => { 
        if (e.buttons === 1 && isDrawingOnMesh.current) draw(e); 
      }}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerOut={handlePointerUp}
      material={materials}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[4, 2, 2]} />
    </mesh>
  );
};

const ActiveFaceHighlighter = () => {
  const activeFace = useEditorStore(state => state.activeFace);
  const matRef = useRef();

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
    }
  });

  const faceConfig = {
    front: { pos: [0, 0, 1.01], rot: [0, 0, 0], size: [4, 2] },
    back: { pos: [0, 0, -1.01], rot: [0, Math.PI, 0], size: [4, 2] },
    top: { pos: [0, 1.01, 0], rot: [-Math.PI/2, 0, 0], size: [4, 2] },
    bottom: { pos: [0, -1.01, 0], rot: [Math.PI/2, 0, 0], size: [4, 2] },
    right: { pos: [2.01, 0, 0], rot: [0, Math.PI/2, 0], size: [2, 2] },
    left: { pos: [-2.01, 0, 0], rot: [0, -Math.PI/2, 0], size: [2, 2] },
  };

  const config = faceConfig[activeFace];
  if (!config) return null;

  return (
    <mesh position={config.pos} rotation={config.rot}>
      <planeGeometry args={config.size} />
      <meshBasicMaterial ref={matRef} transparent color="#c69c79" depthWrite={false} />
      <Edges color="#c69c79" />
    </mesh>
  );
};

const Canvas3D = () => {
  const [enableOrbit, setEnableOrbit] = useState(true);

  return (
    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
           position={[10, 15, 10]} 
           intensity={1} 
           castShadow 
           shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />
        
        <ActiveFaceHighlighter />
        <PaintedBlock setEnableOrbit={setEnableOrbit} />

        <OrbitControls 
           enabled={enableOrbit}
           enablePan={false} 
           enableZoom={false} 
           minPolarAngle={0} 
           maxPolarAngle={Math.PI / 1.8} 
        />
      </Canvas>
      <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', pointerEvents: 'none' }}>
         <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
           Drag to rotate • Draw on the block
         </div>
      </div>
    </div>
  );
};

export default Canvas3D;
