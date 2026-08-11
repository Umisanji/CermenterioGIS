import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Minus, Maximize2 } from 'lucide-react';
import OrthoViewer from './OrthoViewer';
import TumbaModal from './TumbaModal';

export default function ViewerPage({ onGoHome, selectedCemetery }) {
  const [zoomPct, setZoomPct] = useState(100);
  const [selectedTumba, setSelectedTumba] = useState(null);
  const mapRef = useRef(null);

  // Zoom controls handling
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([18.14008, -94.52739], 19);
    }
  };

  return (
    <div className="viewer-standalone-page">
      
      {/* DEDICATED HEADER WITH ORIGINAL RESTORED ZOOM BUTTONS AND LAYOUT */}
      <header className="viewer-dedicated-header">
        <div className="viewer-header-left">
          <img 
            src="/Logo-Coatza-26.png" 
            alt="Coatzacoalcos" 
            className="viewer-logo-img"
          />
          <div className="viewer-title-box">
            <h2>Panteón Lomas de Barrillas</h2>
          </div>
        </div>

        {/* TOP RIGHT CONTROLS GROUP - RESTORED ORIGINAL LAYOUT */}
        <div className="viewer-header-right-group">
          <div className="viewer-zoom-controls">
            <button className="v-btn-icon" onClick={handleZoomOut} title="Alejar (-)">
              <Minus size={16} />
            </button>
            <span className="v-zoom-text">Zoom: {zoomPct}%</span>
            <button className="v-btn-icon" onClick={handleZoomIn} title="Acercar (+)">
              <Plus size={16} />
            </button>
          </div>

          <button className="v-btn-secondary" onClick={handleResetView} title="Restablecer Encuadre">
            <Maximize2 size={15} />
            <span>Centrar Ortofoto</span>
          </button>

          <button className="v-btn-home" onClick={onGoHome}>
            <ArrowLeft size={16} />
            <span>Volver a Inicio</span>
          </button>
        </div>
      </header>

      {/* AERIAL ORTHOPHOTO VIEW CANVAS WITH DIRECT QGIS GEOJSON OVERLAY */}
      <main className="viewer-standalone-canvas" style={{ position: 'relative' }}>
        <OrthoViewer 
          onZoomChange={setZoomPct}
          setViewerRef={(inst) => { mapRef.current = inst; }}
          onSelectTumba={(tumba) => setSelectedTumba(tumba)}
        />
      </main>

      {/* CADASTRAL DATA MODAL FOR SELECTED TOMB */}
      {selectedTumba && (
        <TumbaModal 
          tumba={selectedTumba} 
          onClose={() => setSelectedTumba(null)} 
        />
      )}

    </div>
  );
}
