import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { usePlacerStore } from '../store/usePlacerStore';
import * as THREE from 'three';

const PlacedBlock = ({ block, isViewMode, isFocused, isFaded, setFocusedBlockId }) => {
  const [materials, setMaterials] = React.useState(null);

  React.useEffect(() => {
    if (block.textureUrl) {
      new THREE.TextureLoader().load(block.textureUrl, (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        
        // Atlas dimensions: 1200 x 400
        // Helper to slice texture for each face
        const sliceTexture = (ox, oy, w, h) => {
           const tex = loadedTex.clone();
           tex.needsUpdate = true;
           tex.repeat.set(w / 1200, h / 400);
           // Y starting offset is from bottom-left natively in WebGL
           tex.offset.set(ox / 1200, 1 - (oy + h) / 400); 
           return new THREE.MeshStandardMaterial({ 
             map: tex, 
             transparent: isFaded, 
             opacity: isFaded ? 0.2 : 1 
           });
        };

        // BoxGeometry material array order: Right, Left, Top, Bottom, Front, Back
        // Right (+X) 2x2
        const matRight = sliceTexture(600, 0, 200, 200);
        // Left (-X) 2x2
        const matLeft = sliceTexture(0, 0, 200, 200);
        // Top (+Y) 4x2
        const matTop = sliceTexture(200, 200, 400, 200);
        // Bottom (-Y) 4x2
        const matBottom = sliceTexture(600, 200, 400, 200);
        // Front (+Z) 4x2
        const matFront = sliceTexture(200, 0, 400, 200);
        // Back (-Z) 4x2
        const matBack = sliceTexture(800, 0, 400, 200);

        setMaterials([matRight, matLeft, matTop, matBottom, matFront, matBack]);
      });
    } else {
      // Fallback block if no texture string exists
      const fallback = new THREE.MeshStandardMaterial({ 
        color: block.color, 
        transparent: isFaded, 
        opacity: isFaded ? 0.2 : 1 
      });
      setMaterials(fallback);
    }
  }, [block.textureUrl, isFaded, block.color]);

  return (
    <mesh 
      position={block.position} 
      castShadow 
      receiveShadow
      onClick={(e) => {
        if (isViewMode) {
          e.stopPropagation();
          setFocusedBlockId(isFocused ? null : block.id);
        }
      }}
      onPointerOver={(e) => {
        if (isViewMode) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (isViewMode) document.body.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[4, 2, 2]} />
      {materials 
        ? <primitive object={materials} attach="material" />
        : <meshStandardMaterial color={block.color || "#ffffff"} transparent={isFaded} opacity={isFaded ? 0.2 : 1} />
      }
      <Edges color="#1e293b" opacity={isFaded ? 0.05 : 0.3} transparent />
    </mesh>
  );
};

// Component rendering already locked-in blocks
const PlacedBlocks = ({ isViewMode }) => {
  const placedBlocks = usePlacerStore(state => state.placedBlocks);
  const focusedBlockId = usePlacerStore(state => state.focusedBlockId);
  const setFocusedBlockId = usePlacerStore(state => state.setFocusedBlockId);
  
  return (
    <>
      {placedBlocks.map((block) => (
        <PlacedBlock 
          key={block.id} 
          block={block} 
          isViewMode={isViewMode}
          isFocused={focusedBlockId === block.id}
          isFaded={focusedBlockId && focusedBlockId !== block.id}
          setFocusedBlockId={setFocusedBlockId}
        />
      ))}
    </>
  );
};

// Renders the transparent valid anchor slots
const GridAnchors = () => {
  const getValidAdjacentSpots = usePlacerStore(state => state.getValidAdjacentSpots);
  const setPreviewPosition = usePlacerStore(state => state.setPreviewPosition);
  const previewPosition = usePlacerStore(state => state.previewPosition);
  
  const validSpots = useMemo(() => getValidAdjacentSpots(), [getValidAdjacentSpots]);

  return (
    <>
      {validSpots.map((pos, idx) => {
        const isSelected = previewPosition && 
          pos[0] === previewPosition[0] && 
          pos[1] === previewPosition[1] && 
          pos[2] === previewPosition[2];

        return (
          <mesh 
            key={`anchor_${idx}`} 
            position={pos} 
            onClick={(e) => {
              e.stopPropagation();
              setPreviewPosition(pos);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <boxGeometry args={[4, 2, 2]} />
            <meshBasicMaterial 
              color={isSelected ? '#3b82f6' : '#94a3b8'} 
              transparent 
              opacity={isSelected ? 0.6 : 0.15} 
              depthWrite={false}
            />
            <Edges color={isSelected ? '#60a5fa' : '#ffffff'} />
          </mesh>
        );
      })}
    </>
  );
};

// Ground plane
const Ground = () => (
  <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#0f172a" />
    <gridHelper args={[100, 25, '#1e293b', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
  </mesh>
);

const Placer3D = ({ isViewMode = false }) => {
  return (
    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight 
           position={[10, 20, 10]} 
           intensity={1} 
           castShadow 
           shadow-mapSize={[2048, 2048]}
           shadow-camera-left={-20}
           shadow-camera-right={20}
           shadow-camera-top={20}
           shadow-camera-bottom={-20}
        />
        
        <Ground />
        <PlacedBlocks isViewMode={isViewMode} />
        {!isViewMode && <GridAnchors />}

        <OrbitControls 
           minPolarAngle={0} 
           maxPolarAngle={Math.PI / 2.1} // Prevent going too far under ground
           minDistance={5}
           maxDistance={50}
        />
      </Canvas>
    </div>
  );
};

export default Placer3D;
