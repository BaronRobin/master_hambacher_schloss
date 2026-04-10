import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore, FACE_SIZES } from '../store/useEditorStore';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Eraser, Undo, Check } from 'lucide-react';

const availableColors = ['#000000', '#f8fafc', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#1e293b'];
const faces = [
  { id: 'front', labelKey: 'editor.outfacing' },
  { id: 'back', labelKey: 'Back' },
  { id: 'top', labelKey: 'Top' },
  { id: 'bottom', labelKey: 'Bottom' },
  { id: 'left', labelKey: 'Left' },
  { id: 'right', labelKey: 'Right' }
];

const Canvas2D = () => {
  const { t } = useTranslation();
  const { color, brushSize, activeFace, setColor, setBrushSize, setActiveFace, registerCanvas, lastUpdate } = useEditorStore();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // We only mount ONE visible canvas, but the Store manages the rendering to the texture. 
  // Wait, if we want to retain state across all 6 faces persistently within ThreeJS textures, 
  // it's better to render all 6 canvases in a hidden layer, and only show the 'active' one.
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '350px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t('editor.title')}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button onClick={() => useEditorStore.getState().undo()} className="btn" style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.1)' }} title="Undo"><Undo size={16} /></button>
           <button onClick={() => useEditorStore.getState().redo()} className="btn" style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.1)', transform: 'scaleX(-1)' }} title="Redo"><Undo size={16} /></button>
           <button onClick={() => useEditorStore.getState().clearFace(activeFace)} className="btn btn-danger" style={{ padding: '0.4rem' }} title="Clear Face"><Eraser size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {faces.map((f) => (
          <button 
             key={f.id} 
             onClick={() => setActiveFace(f.id)}
             style={{
               background: activeFace === f.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
               border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', color: 'white', cursor: 'pointer',
               flex: '1 1 30%', fontSize: '0.85rem'
             }}
          >
            {f.id === 'front' ? t(f.labelKey) : f.id.toUpperCase()} 
          </button>
        ))}
      </div>

      {/* Render the hidden canvases and the visible one */}
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
         {faces.map(f => (
            <FaceCanvas key={f.id} faceId={f.id} active={activeFace === f.id} />
         ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('editor.brush')} ({brushSize}px)</label>
        <input type="range" min="2" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
         {availableColors.map(c => (
           <div 
             key={c}
             onClick={() => setColor(c)}
             style={{
               width: '32px', height: '32px', borderRadius: '50%', background: c,
               cursor: 'pointer', border: color === c ? '3px solid white' : '3px solid transparent',
               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
             }}
           />
         ))}
         <input 
           type="color" 
           value={color} 
           onChange={(e) => setColor(e.target.value)} 
           style={{
             width: '36px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer',
             background: 'none', padding: 0
           }}
           title="Genaue Farbe wählen"
         />
      </div>
      
    </div>
  );
};

// Subcomponent to manage individual face canvases
const FaceCanvas = ({ faceId, active }) => {
  const canvasRef = useRef(null);
  const { registerCanvas, color, brushSize, lastUpdate } = useEditorStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const dims = FACE_SIZES[faceId];

  // Initialize and register canvas
  useEffect(() => {
    if (canvasRef.current) {
      registerCanvas(faceId, canvasRef.current);
      // Initialize background to white if empty
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dims.width, dims.height);
      // Trigger a store update so material catches the white background.
      useEditorStore.setState({ lastUpdate: Date.now() }); 
    }
  }, [faceId]);

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calculate accurate x/y
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    
    // Notify store that a manual update happened so ThreeJS updates textures
    useEditorStore.setState({ lastUpdate: Date.now() }); 
  };

  return (
    <canvas
      ref={canvasRef}
      width={dims.width}
      height={dims.height}
      style={{
        display: active ? 'block' : 'none',
        width: '100%',
        maxWidth: `${dims.width}px`,
        cursor: 'crosshair',
        aspectRatio: `${dims.width} / ${dims.height}`
      }}
      onMouseDown={(e) => { 
        useEditorStore.getState().saveHistoryState(faceId);
        setIsDrawing(true); 
        draw(e); 
      }}
      onMouseMove={draw}
      onMouseUp={() => setIsDrawing(false)}
      onMouseLeave={() => setIsDrawing(false)}
    />
  );
}

export default Canvas2D;
