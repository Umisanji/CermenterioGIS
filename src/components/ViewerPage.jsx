import React, { useState, useRef } from 'react';
import { Plus, Minus, Target, Layers, Eye } from 'lucide-react';
import OrthoViewer from './OrthoViewer';
import GoogleMapView from './GoogleMapView';
import TumbaModal from './TumbaModal';

export default function ViewerPage({ onGoHome, selectedCemetery }) {
  const [mapMode, setMapMode] = useState('ortho'); // 'ortho' (Dron HD) | 'google' (Google Maps Satellite)
  const [zoomPct, setZoomPct] = useState(100);
  const [selectedTumba, setSelectedTumba] = useState(null);

  const orthoViewerRef = useRef(null);
  const googleMapRef = useRef(null);

  // Zoom controls handling
  const handleZoomIn = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.zoomBy(1.3);
      orthoViewerRef.current.viewport.applyConstraints();
    } else if (mapMode === 'google' && googleMapRef.current) {
      googleMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.zoomBy(1 / 1.3);
      orthoViewerRef.current.viewport.applyConstraints();
    } else if (mapMode === 'google' && googleMapRef.current) {
      googleMapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.goHome(true);
    } else if (mapMode === 'google' && googleMapRef.current) {
      googleMapRef.current.setView([18.14008, -94.52739], 18);
    }
  };

  const toggleMapMode = () => {
    setMapMode((prev) => (prev === 'ortho' ? 'google' : 'ortho'));
  };

  return (
    <div className="viewer-standalone-page" style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      
      {/* MAP CANVAS VIEWPORTS */}
      <main className="viewer-standalone-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {mapMode === 'ortho' ? (
          <OrthoViewer 
            onZoomChange={setZoomPct}
            setViewerRef={(inst) => { orthoViewerRef.current = inst; }}
            onSelectTumba={(tumba) => setSelectedTumba(tumba)}
          />
        ) : (
          <GoogleMapView 
            onZoomChange={setZoomPct}
            setMapRef={(inst) => { googleMapRef.current = inst; }}
            onSelectTumba={(tumba) => setSelectedTumba(tumba)}
          />
        )}
      </main>

      {/* CADASTRAL DATA MODAL FOR SELECTED TOMB */}
      {selectedTumba && (
        <TumbaModal 
          tumba={selectedTumba} 
          onClose={() => setSelectedTumba(null)} 
        />
      )}

      {/* FLOATING WHITE CONTROL BUTTONS STACK (BOTTOM RIGHT CORNER) */}
      <div 
        className="floating-white-controls-stack"
        style={{
          position: 'absolute',
          bottom: '28px',
          right: '24px',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {/* BUTTON 1: VISTA TOGGLE ICON BUTTON (WHITE ROUNDED SQUARE) */}
        <button
          onClick={toggleMapMode}
          title={mapMode === 'ortho' ? 'Cambiar a Vista Google Maps Satelital' : 'Cambiar a Vista Ortofoto Dron HD'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s'
          }}
        >
          {mapMode === 'ortho' ? (
            <Layers size={22} color="#1e293b" strokeWidth={2.2} />
          ) : (
            <Eye size={22} color="#7A1C2E" strokeWidth={2.2} />
          )}
        </button>

        {/* BUTTON 2: CENTRAR TARGET ICON BUTTON (WHITE ROUNDED SQUARE) */}
        <button
          onClick={handleResetView}
          title="Centrar Posición de la Vista"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s'
          }}
        >
          <Target size={22} color="#1e293b" strokeWidth={2.2} />
        </button>

        {/* BUTTON 3: VERTICAL WHITE ZOOM PILL CONTAINER (+ / -) */}
        <div
          style={{
            width: '44px',
            height: '88px',
            borderRadius: '22px',
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* ZOOM IN (+) */}
          <button
            onClick={handleZoomIn}
            title="Acercar (+)"
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              cursor: 'pointer',
              width: '100%',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Plus size={22} color="#1e293b" strokeWidth={2.5} />
          </button>

          {/* DIVIDER */}
          <div style={{ width: '22px', height: '1px', background: '#cbd5e1' }}></div>

          {/* ZOOM OUT (-) */}
          <button
            onClick={handleZoomOut}
            title="Alejar (-)"
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              cursor: 'pointer',
              width: '100%',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Minus size={22} color="#1e293b" strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </div>
  );
}
