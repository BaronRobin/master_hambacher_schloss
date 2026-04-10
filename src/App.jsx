import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Canvas2D from './components/Canvas2D';
import Canvas3D from './components/Canvas3D';
import Placer3D from './components/Placer3D';
import { usePlacerStore } from './store/usePlacerStore';
import { useEditorStore } from './store/useEditorStore';

const TopNavBar = () => {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
      <img 
         src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZOpG54erZLeSq7I4QsC-PZItWJdXr2mfb0Q&s" 
         alt="Hambacher Schloss Logo" 
         style={{ height: '60px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', pointerEvents: 'auto' }} 
      />
      
      <div style={{ pointerEvents: 'auto' }}>
        <select 
          className="input-field" 
          value={i18n.language} 
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{ width: 'auto', padding: '0.5rem', background: 'rgba(15, 23, 42, 0.8)' }}
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
};

const ViewMode = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ticketInput, setTicketInput] = useState('');
  
  const focusedBlockId = usePlacerStore(state => state.focusedBlockId);
  const setFocusedBlockId = usePlacerStore(state => state.setFocusedBlockId);
  const placedBlocks = usePlacerStore(state => state.placedBlocks);
  const focusedBlock = focusedBlockId ? placedBlocks.find(b => b.id === focusedBlockId) : null;

  const handleTicketSubmit = () => {
    if (!ticketInput.trim()) return;
    
    // MOCK DB LOGIC: 
    if (ticketInput.toUpperCase() === 'USED') {
       // Mock finding a block ID belonging to 'USED'
       // Just pick the first placed block as a mock.
       if (placedBlocks.length > 0) {
          setFocusedBlockId(placedBlocks[0].id);
       }
    } else {
       navigate('/editor');
    }
  };

  return (
    <div className="fullscreen-container" style={{ position: 'relative' }}>
      <Placer3D isViewMode={true} />
      
      <TopNavBar />

      {focusedBlock && (
        <div className="glass-panel animate-fade-in" style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', padding: '2rem', minWidth: '300px', pointerEvents: 'auto' }}>
           <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{focusedBlock.nickname || 'Castle Builder'}</h3>
           <p style={{ color: 'var(--text-muted)' }}>Ticket: ••••••••</p>
           <p style={{ color: 'var(--text-muted)' }}>Located at: [{focusedBlock.position[0]}, {focusedBlock.position[1]}, {focusedBlock.position[2]}]</p>
           <button className="btn mt-4" style={{ width: '100%', marginTop: '1rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => setFocusedBlockId(null)}>
             Close Details
           </button>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
         <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderRadius: '30px', pointerEvents: 'auto' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder={t('checkin.prompt')}
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTicketSubmit(); }}
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0.5rem 1.5rem', outline: 'none' }} 
            />
            <button className="btn btn-accent" style={{ borderRadius: '25px', padding: '0.5rem 1.5rem' }} onClick={handleTicketSubmit}>
              {t('checkin.button')}
            </button>
         </div>
      </div>
    </div>
  );
};

const EditorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="fullscreen-container" style={{ flexDirection: 'row' }}>
      <TopNavBar />
      <Canvas3D />
      <div className="overlay-ui" style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '2rem', paddingTop: '6rem' }}>
        <Canvas2D />
      </div>
      <div className="overlay-ui" style={{ alignItems: 'flex-end', justifyContent: 'flex-end', padding: '2rem' }}>
        <button className="btn btn-accent" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={() => navigate('/placer')}>
          {t('editor.confirm')}
        </button>
      </div>
    </div>
  );
};

const PlacerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirmPlacementStore = usePlacerStore(state => state.confirmPlacement);
  const previewPosition = usePlacerStore(state => state.previewPosition);
  const exportFrontTextureWebP = useEditorStore(state => state.exportFrontTextureWebP);

  const handleConfirm = () => {
    const webpUrl = exportFrontTextureWebP();
    if (confirmPlacementStore(webpUrl)) {
      navigate('/');
    }
  };

  return (
    <div className="fullscreen-container" style={{ flexDirection: 'row' }}>
      <TopNavBar />
      <Placer3D isViewMode={false} />
      
      <div className="overlay-ui" style={{ pointerEvents: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', pointerEvents: 'auto' }}>
          <button className="btn" onClick={() => navigate('/editor')} style={{ background: 'rgba(255,255,255,0.1)' }}>
            {t('placer.cancel')}
          </button>
          
          <button 
             className="btn btn-accent" 
             onClick={handleConfirm}
             disabled={!previewPosition}
             style={{ opacity: previewPosition ? 1 : 0.5, cursor: previewPosition ? 'pointer' : 'not-allowed' }}
          >
            {t('placer.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<ViewMode />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/placer" element={<PlacerPage />} />
    </Routes>
  );
}

export default App;
