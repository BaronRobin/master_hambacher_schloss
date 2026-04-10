import { create } from 'zustand';

// Assuming blocks are [4, 2, 2]
// Grid step sizes:
const STEP_X = 4;
const STEP_Y = 2; // Height
const STEP_Z = 2;

// The ground is at Y=0. A block with height 2 resting on the ground has its center at Y=1.
const GROUND_Y = 1;

export const usePlacerStore = create((set, get) => ({
  placedBlocks: [
    // Pre-place a few foundation blocks for context
    { id: 'b1', position: [0, GROUND_Y, 0], color: '#f59e0b' },
    { id: 'b2', position: [4, GROUND_Y, 0], color: '#3b82f6' },
  ],
  
  previewPosition: null, // The location the user has currently selected

  setPreviewPosition: (pos) => set({ previewPosition: pos }),

  // Basic Physics Validation
  // A position [x,y,z] is valid if:
  // 1. y === GROUND_Y (resting on floor)
  // 2. OR there is a block underneath it at [x, y - STEP_Y, z]
  isValidPosition: (pos) => {
    const [x, y, z] = pos;
    if (y === GROUND_Y) return true;
    
    const { placedBlocks } = get();
    // Check if there is a block exactly underneath
    const hasSupport = placedBlocks.some(b => 
      b.position[0] === x && 
      b.position[1] === y - STEP_Y && 
      b.position[2] === z
    );
    
    // Also ensuring no block is already there
    const isOccupied = placedBlocks.some(b => 
      b.position[0] === x && 
      b.position[1] === y && 
      b.position[2] === z
    );

    return hasSupport && !isOccupied;
  },

  confirmPlacement: (textureUrl) => {
    const { previewPosition, placedBlocks, isValidPosition } = get();
    if (!previewPosition || !isValidPosition(previewPosition)) return false;
    
    // In final version we read 'texture_url' after WebP upload to Supabase.
    // For now we mock it by fetching the 'front' face from useEditorStore directly
    const newBlock = { 
      id: `u_${Date.now()}`, 
      position: previewPosition, 
      color: textureUrl ? '#ffffff' : '#10b981',
      textureUrl: textureUrl,
      nickname: 'Anonymous Contributor'
    };
    
    set({
      placedBlocks: [...placedBlocks, newBlock],
      previewPosition: null
    });
    
    return true;
  },

  focusedBlockId: null,
  setFocusedBlockId: (id) => set({ focusedBlockId: id }),

  getValidAdjacentSpots: () => {
    const { placedBlocks, isValidPosition } = get();
    const spots = new Set();
    
    // Base foundation slots
    for (let x = -12; x <= 12; x += 4) {
      for (let z = -8; z <= 8; z += 2) {
         spots.add(`${x},${GROUND_Y},${z}`);
      }
    }

    // Surroundings of attached blocks
    placedBlocks.forEach(b => {
      const [x, y, z] = b.position;
      spots.add(`${x},${y + STEP_Y},${z}`); // above
      spots.add(`${x + STEP_X},${y},${z}`); // right
      spots.add(`${x - STEP_X},${y},${z}`); // left
      spots.add(`${x},${y},${z + STEP_Z}`); // front
      spots.add(`${x},${y},${z - STEP_Z}`); // back
    });

    // Filter by validity logic
    return Array.from(spots)
      .map(str => str.split(',').map(Number))
      .filter(pos => isValidPosition(pos));
  }
}));
