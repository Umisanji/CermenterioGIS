import React from 'react';
import { Map, Plus, Minus, Maximize2 } from 'lucide-react';

export default function Header({ zoomPct, onZoomIn, onZoomOut, onResetView }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Map className="brand-icon" size={20} />
        <h1>Visor de Ortofoto Dron — Cementerio Sección A</h1>
      </div>

      <div className="top-controls">
        <div className="zoom-info">
          <button className="control-btn" onClick={onZoomOut} title="Alejar (-)">
            <Minus size={14} />
          </button>
          <span className="zoom-text">Zoom: {zoomPct}%</span>
          <button className="control-btn" onClick={onZoomIn} title="Acercar (+)">
            <Plus size={14} />
          </button>
        </div>

        <button className="control-btn btn-text" onClick={onResetView} title="Centrar Ortofoto">
          <Maximize2 size={14} />
          <span>Centrar Ortofoto</span>
        </button>
      </div>
    </header>
  );
}
