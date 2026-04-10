import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Canvas2D from './components/Canvas2D';
import Canvas3D from './components/Canvas3D';
import Placer3D from './components/Placer3D';
import { usePlacerStore } from './store/usePlacerStore';
import { useEditorStore } from './store/useEditorStore';
import changelogData from './data/changelog.json';
import { supabase } from './lib/supabase';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={onClose}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
         <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
         <div style={{ color: 'var(--text-muted)' }}>{children}</div>
         <button className="btn mt-4" style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const GlobalFooter = () => {
  const [modalContent, setModalContent] = useState(null);
  const currentVersion = changelogData[changelogData.length - 1].version;
  
  return (
    <>
      <div className="glass-panel" style={{ 
         position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', 
         width: 'calc(100% - 2rem)', maxWidth: '1800px',
         padding: '0.8rem 2rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
         pointerEvents: 'auto', zIndex: 50, borderRadius: '12px'
      }}>
         <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', alignItems: 'center', justifyContent: 'flex-start' }}>
           <span style={{ cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1 }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => setModalContent('privacy')}>Privacy Policy</span>
           <span style={{ lineHeight: 1 }}>·</span>
           <span style={{ cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1 }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => setModalContent('imprint')}>Imprint</span>
           <span style={{ lineHeight: 1 }}>·</span>
           <span style={{ cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1 }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => setModalContent('terms')}>Terms of Service</span>
         </div>
         
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           <button 
             onClick={() => setModalContent('changelog')}
             style={{ 
               background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
               color: 'var(--text-main)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', lineHeight: 1
             }}>v{currentVersion}</button>
         </div>

         <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', lineHeight: 1 }}>
           Hochschule Kaiserslautern - Robin Baron & Joel Rummer
         </div>
      </div>

      <SimpleModal isOpen={modalContent === 'privacy'} onClose={() => setModalContent(null)} title="Privacy Policy">
        <p>This is a mockup privacy policy. All physical block properties are anonymously tracked using the QR codes distributed at the check-in terminal. Optional display nicknames are completely private until explicitly resolved via the lookup interface.</p>
      </SimpleModal>

      <SimpleModal isOpen={modalContent === 'imprint'} onClose={() => setModalContent(null)} title="Imprint">
        <p><strong>Hambacher Schloss Democracy Simulator</strong><br/><br/>Hochschule Kaiserslautern<br/>Created and Implemented by Robin Baron & Joel Rummer</p>
      </SimpleModal>

      <SimpleModal isOpen={modalContent === 'terms'} onClose={() => setModalContent(null)} title="Terms of Service">
        <p>Mockup Terms of Service. Be respectful when creating textures. Administrative operators retain the right to permanently hide blocks via the Moderation override flagged inside the Database architecture.</p>
      </SimpleModal>

      <SimpleModal isOpen={modalContent === 'changelog'} onClose={() => setModalContent(null)} title="Application Changelog">
        {changelogData.slice().reverse().map((log, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>v{log.version}</h3>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{log.date}</span>
            </div>
            <ul style={{ paddingLeft: '1rem', lineHeight: '1.6', margin: 0 }}>
              {log.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </SimpleModal>
    </>
  );
};

const TopNavBar = () => {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
      <img 
         src="https://demokratie-gewinnt.rlp.de/wp-content/uploads/sites/17/2022/07/StiftungHambacherSchloss-Logo-sRGB-450x225.png" 
         alt="Hambacher Schloss Logo" 
         style={{ height: '60px', pointerEvents: 'auto' }} 
      />
      
      <div style={{ pointerEvents: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => i18n.changeLanguage('de')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.8rem', opacity: i18n.language === 'de' ? 1 : 0.4, transition: 'opacity 0.2s', padding: 0 }}
          title="Deutsch"
        >
          🇩🇪
        </button>
        <button 
          onClick={() => i18n.changeLanguage('en')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.8rem', opacity: i18n.language === 'en' ? 1 : 0.4, transition: 'opacity 0.2s', padding: 0 }}
          title="English"
        >
          🇺🇸
        </button>
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
  const fetchBlocks = usePlacerStore(state => state.fetchBlocks);
  const focusedBlock = focusedBlockId ? placedBlocks.find(b => b.id === focusedBlockId) : null;

  React.useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleTicketSubmit = async () => {
    if (!ticketInput.trim()) return;
    
    const formattedCode = ticketInput.trim().toUpperCase();
    
    if (formattedCode === 'TEST') {
       navigate('/editor');
       return;
    }
    
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('code', formattedCode)
      .maybeSingle();

    if (error || !ticket) {
       alert("Invalid ticket code.");
       return;
    }

    if (ticket.is_used) {
       const { data: block } = await supabase
         .from('blocks')
         .select('id')
         .eq('ticket_id', ticket.id)
         .maybeSingle();
         
       if (block && block.id) {
          setFocusedBlockId(block.id);
       } else {
          alert("Ticket marked used, but block is pending or removed.");
       }
    } else {
       usePlacerStore.getState().setActiveTicket(ticket);
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

      <div style={{ position: 'absolute', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
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
      
      <GlobalFooter />
    </div>
  );
};

const EditorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snapshotTextures = useEditorStore(state => state.snapshotTextures);

  const handleProceedToPlacer = () => {
    snapshotTextures();
    navigate('/placer');
  };

  return (
    <div className="fullscreen-container" style={{ flexDirection: 'row' }}>
      <TopNavBar />
      <Canvas3D />
      <div className="overlay-ui" style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '2rem', paddingTop: '6rem' }}>
        <Canvas2D />
      </div>
      <div className="overlay-ui" style={{ alignItems: 'flex-end', justifyContent: 'flex-end', padding: '2rem' }}>
        <button className="btn btn-accent" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={handleProceedToPlacer}>
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
  const savedTextureStr = useEditorStore(state => state.savedTextureStr);

  const [isPublishing, setIsPublishing] = useState(false);

  const handleConfirm = async () => {
    setIsPublishing(true);
    const { success, reason } = await confirmPlacementStore(savedTextureStr);
    setIsPublishing(false);
    
    if (success) {
      navigate('/');
    } else {
      alert("Uh oh! Failed to confirm block placement to database:\n" + reason);
    }
  };

  return (
    <div className="fullscreen-container" style={{ flexDirection: 'row' }}>
      <TopNavBar />
      <Placer3D isViewMode={false} />
      
      <div className="overlay-ui" style={{ pointerEvents: 'none', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', pointerEvents: 'auto' }}>
          <button className="btn" onClick={() => navigate('/editor')} style={{ background: 'rgba(255,255,255,0.1)' }} disabled={isPublishing}>
            {t('placer.cancel')}
          </button>
          
          <button 
             className="btn btn-accent" 
             onClick={handleConfirm}
             disabled={!previewPosition || isPublishing}
             style={{ opacity: (previewPosition && !isPublishing) ? 1 : 0.5, cursor: (previewPosition && !isPublishing) ? 'pointer' : 'not-allowed' }}
          >
            {isPublishing ? "Publishing Data..." : t('placer.confirm')}
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
