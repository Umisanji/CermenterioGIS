import React, { useState, useRef } from 'react';
import { Plus, Minus, Maximize2, Layers, Eye } from 'lucide-react';
import OrthoViewer from './OrthoViewer';
import SimpleMapView from './SimpleMapView';

export default function ViewerPage({ onGoHome, selectedCemetery }) {
  const [mapMode, setMapMode] = useState('ortho'); // 'ortho' (Dron HD) | 'simple' (Google Maps)
  const [zoomPct, setZoomPct] = useState(100);

  const orthoViewerRef = useRef(null);
  const simpleMapRef = useRef(null);

  // Zoom controls handling
  const handleZoomIn = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.zoomBy(1.3);
      orthoViewerRef.current.viewport.applyConstraints();
    } else if (mapMode === 'simple' && simpleMapRef.current) {
      simpleMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.zoomBy(1 / 1.3);
      orthoViewerRef.current.viewport.applyConstraints();
    } else if (mapMode === 'simple' && simpleMapRef.current) {
      simpleMapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.goHome(true);
    } else if (mapMode === 'simple' && simpleMapRef.current) {
      simpleMapRef.current.setView([18.1432, -94.5365], 17);
    }
  };

  return (
    <div className="viewer-standalone-page" style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      
      {/* MAP CANVAS VIEWPORTS */}
      <main className="viewer-standalone-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {mapMode === 'ortho' ? (
          <OrthoViewer 
            onZoomChange={setZoomPct}
            setViewerRef={(inst) => { orthoViewerRef.current = inst; }}
          />
        ) : (
          <SimpleMapView 
            onZoomChange={setZoomPct}
            setMapRef={(inst) => { simpleMapRef.current = inst; }}
          />
        )}
      </main>

      {/* FLOATING MAP LAYER SWITCHER TOGGLE (BOTTOM LEFT CORNER) */}
      <div className="floating-layer-switcher" style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        zIndex: 1100,
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '30px',
        padding: '5px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <button 
          className={`layer-toggle-btn ${mapMode === 'ortho' ? 'active' : ''}`}
          onClick={() => setMapMode('ortho')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: mapMode === 'ortho' ? '#7A1C2E' : 'transparent',
            color: mapMode === 'ortho' ? '#ffffff' : '#475569'
          }}
        >
          <Eye size={16} />
          <span>Vista Realista (Ortofoto Dron HD)</span>
        </button>

        <button 
          className={`layer-toggle-btn ${mapMode === 'simple' ? 'active' : ''}`}
          onClick={() => setMapMode('simple')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: mapMode === 'simple' ? '#7A1C2E' : 'transparent',
            color: mapMode === 'simple' ? '#ffffff' : '#475569'
          }}
        >
          <Layers size={16} />
          <span>Vista Simple (Google Maps)</span>
        </button>
      </div>

      {/* FLOATING ZOOM AND CENTERING CONTROLS (BOTTOM RIGHT CORNER) */}
      <div className="floating-controls-corner" style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '16px',
        padding: '6px 12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* ZOOM - / + BUTTONS */}
        <div className="viewer-zoom-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="v-btn-icon" onClick={handleZoomOut} title="Alejar (-)">
            <Minus size={16} />
          </button>
          <span className="v-zoom-text" style={{ fontSize: '0.82rem', fontWeight: '700', minWidth: '70px', textAlign: 'center', color: '#334155' }}>
            {zoomPct}%
          </span>
          <button className="v-btn-icon" onClick={handleZoomIn} title="Acercar (+)">
            <Plus size={16} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>

        {/* CENTRAR VISTA BUTTON */}
        <button className="v-btn-secondary" onClick={handleResetView} title="Restablecer Encuadre">
          <Maximize2 size={15} />
          <span>Centrar Vista</span>
        </button>
      </div>

    </div>
  );
}
