import React, { useState, useEffect, useRef } from 'react';

export default function SimpleMapView({ onZoomChange, setMapRef, onSelectTumba }) {
  const [scale, setScale] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // GeoJSON data loaded from QGIS export
  const tumba1 = {
    type: 'Feature',
    properties: {
      fid: 1,
      seccion: 'A',
      lote: '3252',
      propietario: 'LUIS MIGUEL DE LA CRUZ GONZALEZ',
      difunto: 'MIGUEL ANGEL DE LA CRUZ MARTINEZ',
      fechaDifuncion: '2019-01-04',
      telefono: '9212392318',
      direccionTitular: 'C TIBURON 25 FRACC PUERTO ESMERALDA EN CTZ, VER',
      vigenciaPerpetuidad: '2033-01-26',
      folio: '251',
      recibo: 'E 046496',
      tipoTramite: 'PERPETUIDAD ENE26',
      observacion: 'BOVEDA FORRADA DE AZULEJO COLOR AZUL CON NICHO, PAR DE FLOREROS Y LIBRO'
    }
  };

  const tumba2 = {
    type: 'Feature',
    properties: {
      fid: 2,
      seccion: 'A',
      lote: '3254',
      propietario: 'GERARDO JUAREZ CRUZ',
      difunto: 'FRANCISCA CRUZ AGUILAR',
      fechaDifuncion: '2019-01-07',
      telefono: '9211384949',
      direccionTitular: 'AV GAVIOTAS 121 COL SANTA ISABEL III COATZA.,VER',
      vigenciaPerpetuidad: '2033-03-21',
      folio: '925',
      recibo: 'SIN RECIBO',
      tipoTramite: 'PERPETUIDAD ABR26',
      observacion: 'BOVEDA CON MONUMENTO DE AZULEJO COLOR AZUL'
    }
  };

  // Expose control methods to parent via ref
  useEffect(() => {
    if (setMapRef) {
      setMapRef({
        zoomIn: () => handleZoomDelta(0.2),
        zoomOut: () => handleZoomDelta(-0.2),
        setView: () => {
          setScale(1.0);
          setPosition({ x: 0, y: 0 });
          if (onZoomChange) onZoomChange(100);
        }
      });
    }
  }, [setMapRef]);

  const handleZoomDelta = (delta) => {
    setScale((prev) => {
      const nextScale = Math.min(Math.max(prev + delta, 0.6), 2.5);
      if (onZoomChange) onZoomChange(Math.round(nextScale * 100));
      return nextScale;
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomDelta(delta);
  };

  return (
    <div
      ref={containerRef}
      className="vector-map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 'calc(100vh - 65px)',
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox="0 0 1000 750"
          style={{ width: '90%', height: '90%', filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.08))' }}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
            {/* Cemetery Pattern Fill */}
            <pattern id="cemeteryPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#a4ebd4" />
              <circle cx="10" cy="10" r="1.5" fill="#6ee7b7" opacity="0.6" />
            </pattern>
          </defs>

          {/* BACKGROUND CANVAS */}
          <rect width="1000" height="750" fill="#f8fafc" />
          <rect width="1000" height="750" fill="url(#gridPattern)" opacity="0.5" />

          {/* MAIN ROAD: Carr. A Barrillas (Top Horizontal Strip) */}
          <g id="road-barrillas">
            <rect x="0" y="20" width="1000" height="45" fill="#b0bec5" />
            <line x1="0" y1="42.5" x2="1000" y2="42.5" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 8" />
            <text x="540" y="48" fill="#1e293b" fontSize="18" fontWeight="800" letterSpacing="0.5">
              Carr. A Barrillas  ➜  ➜
            </text>
            <text x="180" y="48" fill="#475569" fontSize="14" fontWeight="700">
              ←  Carr. A Barrillas
            </text>
          </g>

          {/* SECONDARY ROAD: Sta. Trinidad (Right Angled Strip) */}
          <g id="road-trinidad">
            <path d="M 870 20 L 970 750 L 920 750 L 825 20 Z" fill="#cfd8dc" />
            <line x1="847" y1="20" x2="945" y2="750" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 8" />
            <text x="910" y="320" fill="#334155" fontSize="15" fontWeight="700" transform="rotate(82 910 320)">
              Sta. Trinidad  ↓
            </text>
          </g>

          {/* EXACT PANTEÓN LOMAS DE BARRILLAS POLYGON */}
          <g id="cemetery-polygon">
            <polygon
              points="140,65 830,110 790,160 845,180 770,710 300,550 80,360 160,180"
              fill="url(#cemeteryPattern)"
              stroke="#34d399"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>

          {/* MAPPED TOMB POLYGON 1 (Lote 3252 - MIGUEL ANGEL DE LA CRUZ MARTINEZ) */}
          <g
            id="tumba-3252"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectTumba) onSelectTumba(tumba1);
            }}
            style={{ cursor: 'pointer' }}
          >
            <polygon
              points="420,380 470,380 470,420 420,420"
              fill="rgba(122, 28, 46, 0.75)"
              stroke="#FACC15"
              strokeWidth="2.5"
            />
            <text x="445" y="405" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">
              3252
            </text>
          </g>

          {/* MAPPED TOMB POLYGON 2 (Lote 3254 - FRANCISCA CRUZ AGUILAR) */}
          <g
            id="tumba-3254"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectTumba) onSelectTumba(tumba2);
            }}
            style={{ cursor: 'pointer' }}
          >
            <polygon
              points="480,380 530,380 530,420 480,420"
              fill="rgba(122, 28, 46, 0.75)"
              stroke="#FACC15"
              strokeWidth="2.5"
            />
            <text x="505" y="405" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">
              3254
            </text>
          </g>

          {/* INTERACTIVE MARKER BADGE FOR MAPPED TOMBS */}
          <g transform="translate(475, 345)" style={{ cursor: 'pointer' }} onClick={() => onSelectTumba && onSelectTumba(tumba1)}>
            <rect x="-110" y="-16" width="220" height="32" rx="16" fill="#7A1C2E" stroke="#FACC15" strokeWidth="2" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.2))" />
            <text x="0" y="5" fill="#ffffff" fontSize="12" fontWeight="800" textAnchor="middle">
              🪦 2 Tumbas Mapeadas (QGIS)
            </text>
          </g>

        </svg>
      </div>
    </div>
  );
}
