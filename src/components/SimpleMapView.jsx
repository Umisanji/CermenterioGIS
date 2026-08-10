import React, { useState, useRef } from 'react';

export default function SimpleMapView({ onZoomChange, setMapRef }) {
  const [scale, setScale] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Expose control methods to parent via ref
  React.useEffect(() => {
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
            {/* Lane dividers */}
            <line x1="0" y1="42.5" x2="1000" y2="42.5" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 8" />
            {/* Road Text Label */}
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

          {/* EXACT PANTEÓN LOMAS DE BARRILLAS POLYGON (MATCHING PROTOTYPE SCREENSHOT) */}
          <g id="cemetery-polygon">
            {/* Polygon Shadow */}
            <polygon 
              points="140,65 830,110 790,160 845,180 770,710 300,550 80,360 160,180" 
              fill="rgba(0,0,0,0.06)" 
              transform="translate(4, 6)"
            />
            {/* Main Mint Green Vector Shape */}
            <polygon 
              points="140,65 830,110 790,160 845,180 770,710 300,550 80,360 160,180" 
              fill="url(#cemeteryPattern)" 
              stroke="#34d399" 
              strokeWidth="3" 
              strokeLinejoin="round"
            />
          </g>

          {/* SURROUNDING BUILDING BLOCKS (MINIMAL & CLEAN) */}
          <rect x="680" y="85" width="30" height="18" fill="#e2e8f0" rx="3" />
          <rect x="785" y="250" width="24" height="24" fill="#e2e8f0" rx="3" transform="rotate(12 785 250)" />
          <rect x="800" y="520" width="35" height="50" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" rx="4" />

          {/* MAIN CEMETERY MARKER PIN 1 (CENTER) */}
          <g id="marker-primary" transform="translate(480, 360)">
            <rect x="-140" y="-22" width="280" height="44" rx="22" fill="#ffffff" stroke="#059669" strokeWidth="2.5" filter="drop-shadow(0 6px 15px rgba(0,0,0,0.18))" />
            <circle cx="-112" cy="0" r="14" fill="#059669" />
            {/* Tombstone / Monument Icon */}
            <path d="M -117 -5 C -117 -11 -107 -11 -107 -5 L -107 4 L -117 4 Z M -119 4 L -105 4 L -105 7 L -119 7 Z" fill="#ffffff" />
            <text x="-88" y="5" fill="#065f46" fontSize="14" fontWeight="800">
              Panteón Municipal Loma de Barrillas
            </text>
          </g>

          {/* SECONDARY CEMETERY MARKER PIN 2 (TOP LEFT INSET) */}
          <g id="marker-secondary" transform="translate(240, 260)">
            <rect x="-115" y="-18" width="230" height="36" rx="18" fill="rgba(255,255,255,0.92)" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="-92" cy="0" r="11" fill="#475569" />
            <path d="M -96 -4 C -96 -9 -88 -9 -88 -4 L -88 3 L -96 3 Z" fill="#ffffff" />
            <text x="-74" y="-1" fill="#334155" fontSize="11" fontWeight="700">
              Panteón municipal "
            </text>
            <text x="-74" y="11" fill="#334155" fontSize="11" fontWeight="700">
              Lomas de Barrillas"
            </text>
          </g>

          {/* IGLESIA / LANDMARK (BOTTOM RIGHT) */}
          <g transform="translate(850, 640)">
            <text x="0" y="0" fill="#64748b" fontSize="12" fontWeight="700" textAnchor="middle">
              IGLESIA ROCA DE
            </text>
            <text x="0" y="15" fill="#64748b" fontSize="12" fontWeight="700" textAnchor="middle">
              SALVACIÓN TIERRA...
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
