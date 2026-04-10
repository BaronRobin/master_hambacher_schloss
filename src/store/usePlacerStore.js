import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const STEP_X = 4;
const STEP_Y = 2; 
const STEP_Z = 2;
const GROUND_Y = 1;

export const usePlacerStore = create((set, get) => ({
  placedBlocks: [],
  activeTicket: null,
  
  setActiveTicket: (ticket) => set({ activeTicket: ticket }),

  fetchBlocks: async () => {
    const { data, error } = await supabase.from('blocks').select('*').eq('is_approved', true);
    if (!error && data) {
      const parsedBlocks = data.map(dbBlock => ({
        id: dbBlock.id,
        position: [dbBlock.x, dbBlock.y, dbBlock.z],
        textureUrl: dbBlock.texture_url,
        nickname: dbBlock.nickname,
        color: '#ffffff'
      }));
      set({ placedBlocks: parsedBlocks });
    }
  },

  previewPosition: null,

  setPreviewPosition: (pos) => set({ previewPosition: pos }),

  isValidPosition: (pos) => {
    const [x, y, z] = pos;
    if (y === GROUND_Y) return true;
    
    const { placedBlocks } = get();
    const hasSupport = placedBlocks.some(b => 
      b.position[0] === x && 
      b.position[1] === y - STEP_Y && 
      b.position[2] === z
    );
    
    const isOccupied = placedBlocks.some(b => 
      b.position[0] === x && 
      b.position[1] === y && 
      b.position[2] === z
    );

    return hasSupport && !isOccupied;
  },

  confirmPlacement: async (textureUrlStr, nicknameInput = 'Digital Contributor') => {
    const { previewPosition, placedBlocks, isValidPosition, activeTicket } = get();
    if (!previewPosition) return { success: false, reason: 'No block position actively selected' };
    if (!isValidPosition(previewPosition)) return { success: false, reason: 'Invalid placement physics / overlapping slot' };
    
    const [x, y, z] = previewPosition;

    // Insert block into Supabase
    const { data: newDbBlock, error } = await supabase.from('blocks').insert({
      ticket_id: activeTicket ? activeTicket.id : null,
      nickname: nicknameInput || 'Anonymous',
      x, y, z,
      texture_url: typeof textureUrlStr === 'string' ? textureUrlStr : '',
      is_approved: true // Allow immediate local rendering
    }).select().single();

    if (error) {
       console.error("Insertion failed:", error);
       return { success: false, reason: error.message || JSON.stringify(error) };
    }

    if (activeTicket) {
      const { error: ticketError } = await supabase.from('tickets').update({ is_used: true }).eq('id', activeTicket.id);
      if (ticketError) {
        return { success: false, reason: `Failed to mark ticket used: ${ticketError.message}` };
      }
    }

    // Append optimistically to local UI
    const newBlock = { 
      id: newDbBlock.id, 
      position: [x, y, z], 
      color: '#ffffff',
      textureUrl: typeof textureUrlStr === 'string' ? textureUrlStr : '',
      nickname: nicknameInput
    };
    
    set({
      placedBlocks: [...placedBlocks, newBlock],
      previewPosition: null,
      activeTicket: null
    });
    
    return { success: true };
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
