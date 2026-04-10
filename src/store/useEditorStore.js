import { create } from 'zustand';

// Faces of a 4x2x2 block
// Sizes in a ratio (e.g., 400x200 for a 4x2 face)
const FACE_SIZES = {
  front: { width: 400, height: 200 },
  back: { width: 400, height: 200 },
  top: { width: 400, height: 200 }, // Assuming depth is 2, top is 4x2
  bottom: { width: 400, height: 200 },
  left: { width: 200, height: 200 }, // 2x2 side
  right: { width: 200, height: 200 }, // 2x2 side
};

export const useEditorStore = create((set, get) => ({
  color: '#ffffff', // Default brush color
  brushSize: 10,
  activeFace: 'front', // The face currently selected in the 2D UI
  faceDataRefs: {
    front: null,
    back: null,
    top: null,
    bottom: null,
    left: null,
    right: null
  }, // Will hold HTMLCanvasElement refs
  
  setColor: (color) => set({ color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setActiveFace: (face) => set({ activeFace: face }),
  
  // Register a canvas element to a face so we can read/write its pixels
  registerCanvas: (face, canvasRef) => set((state) => ({
    faceDataRefs: { ...state.faceDataRefs, [face]: canvasRef }
  })),

  // Called when 3D raycaster paints on a block face
  paintOnFace: (face, uvX, uvY) => {
    const state = get();
    const canvas = state.faceDataRefs[face];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const x = uvX * canvas.width;
    // UV origin is bottom-left in ThreeJS, Canvas origin is top-left
    const y = (1 - uvY) * canvas.height;
    
    ctx.beginPath();
    ctx.arc(x, y, state.brushSize, 0, Math.PI * 2);
    ctx.fillStyle = state.color;
    ctx.fill();
    ctx.closePath();
    
    // We need to trigger a texture update in Three.js but Zustand 
    // doesn't inherently notify if deep objects mutate. 
    // We'll rely on the R3F component polling or event listening, 
    // or we can use a timestamp to force react reactivity.
    set({ lastUpdate: Date.now() });
  },

  lastUpdate: Date.now(),

  history: [],
  redoStack: [],
  
  saveHistoryState: (face) => {
    const canvas = get().faceDataRefs[face];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    set(state => ({
       history: [...state.history, { face, imageData }],
       redoStack: [] // clear redo on new action
    }));
  },

  undo: () => {
    const { history, redoStack, faceDataRefs } = get();
    if (history.length === 0) return;
    
    // pop the last action from history
    const lastAction = history[history.length - 1];
    const canvas = faceDataRefs[lastAction.face];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // save current state of this face for redo before replacing
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // restore last action
    ctx.putImageData(lastAction.imageData, 0, 0);
    
    set({ 
      history: history.slice(0, -1),
      redoStack: [...redoStack, { face: lastAction.face, imageData: currentData }],
      lastUpdate: Date.now() // trigger 3D texture update
    });
  },

  redo: () => {
    const { history, redoStack, faceDataRefs } = get();
    if (redoStack.length === 0) return;
    
    const nextAction = redoStack[redoStack.length - 1];
    const canvas = faceDataRefs[nextAction.face];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    ctx.putImageData(nextAction.imageData, 0, 0);
    
    set({
      redoStack: redoStack.slice(0, -1),
      history: [...history, { face: nextAction.face, imageData: currentData }],
      lastUpdate: Date.now()
    });
  },

  clearFace: (face) => {
    const canvas = get().faceDataRefs[face];
    if (!canvas) return;
    get().saveHistoryState(face);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    set({ lastUpdate: Date.now() });
  },

  // Flattens the front face into a WebP data URL for DB saving and Placer viewing
  exportFrontTextureWebP: () => {
    const canvas = get().faceDataRefs['front'];
    if (!canvas) return null;
    return canvas.toDataURL('image/webp', 0.8);
  }
}));

export { FACE_SIZES };
