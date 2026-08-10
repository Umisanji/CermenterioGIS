import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Minus, Maximize2 } from 'lucide-react';
import OrthoViewer from './OrthoViewer';

export default function ViewerPage({ onGoHome, selectedCemetery }) {
  const [zoomPct, setZoomPct] = useState(100);
  const viewerRef = useRef(null);

  const handleZoomIn = () => {
    if (viewerRef.current && viewerRef.current.viewport) {
      viewerRef.current.viewport.zoomBy(1.3);
      viewerRef.current.viewport.applyConstraints();
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current && viewerRef.current.viewport) {
      viewerRef.current.viewport.zoomBy(1 / 1.3);
      viewerRef.current.viewport.applyConstraints();
    }
  };

  const handleResetView = () => {
    if (viewerRef.current && viewerRef.current.viewport) {
      viewerRef.current.viewport.goHome(true);
    }
  };

  return (
    <div className="viewer-standalone-page">

      {/* Controles */}
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

        {/* derecha */}
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

      {/* fondo */}
      <main className="viewer-standalone-canvas">
        <OrthoViewer
          onZoomChange={setZoomPct}
          setViewerRef={(inst) => { viewerRef.current = inst; }}
        />
      </main>

    </div>
  );
}
