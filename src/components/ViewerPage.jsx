import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Target, Layers, Eye } from 'lucide-react';
import OrthoViewer from './OrthoViewer';
import GoogleMapView from './GoogleMapView';
import TumbaDrawer from './TumbaDrawer';
import MapSearchBar from './MapSearchBar';

const CEMETERIES_DATA = {
  barrillas: {
    id: 'barrillas',
    name: 'Lomas de Barrillas',
    coords: [18.14008, -94.52739],
    hasOrtho: true
  },
  san_jose: {
    id: 'san_jose',
    name: 'Antiguo "San José"',
    coords: [18.1458, -94.4372],
    hasOrtho: false
  },
  jardin: {
    id: 'jardin',
    name: 'Jardín',
    coords: [18.1432, -94.4678],
    hasOrtho: false
  },
  allende: {
    id: 'allende',
    name: 'Allende',
    coords: [18.1633, -94.3856],
    hasOrtho: false
  },
  mundo_nuevo: {
    id: 'mundo_nuevo',
    name: 'Mundo Nuevo',
    coords: [18.1065, -94.3980],
    hasOrtho: false
  }
};

export default function ViewerPage({ selectedCemetery = 'barrillas' }) {
  const currentCemetery = CEMETERIES_DATA[selectedCemetery] || CEMETERIES_DATA.barrillas;
  
  // If cemetery has orthophoto (Lomas), default to 'ortho', else 'google'
  const [mapMode, setMapMode] = useState(currentCemetery.hasOrtho ? 'ortho' : 'google');
  const [, setZoomPct] = useState(100);
  const [selectedTumba, setSelectedTumba] = useState(null);
  const [matchingLotes, setMatchingLotes] = useState([]);
  const [geoData, setGeoData] = useState(null);

  const orthoViewerRef = useRef(null);
  const googleMapRef = useRef(null);

  // Update mapMode if selectedCemetery changes
  useEffect(() => {
    setMapMode(currentCemetery.hasOrtho ? 'ortho' : 'google');
  }, [selectedCemetery, currentCemetery.hasOrtho]);

  // Load GeoJSON for search bar and drawer matching
  useEffect(() => {
    fetch('/tumbas.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Error loading geojson in ViewerPage:', err));
  }, []);

  // Zoom controls handling
  const handleZoomIn = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current) {
      if (orthoViewerRef.current.zoomIn) orthoViewerRef.current.zoomIn();
    } else if (mapMode === 'google' && googleMapRef.current) {
      if (googleMapRef.current.zoomIn) googleMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current) {
      if (orthoViewerRef.current.zoomOut) orthoViewerRef.current.zoomOut();
    } else if (mapMode === 'google' && googleMapRef.current) {
      if (googleMapRef.current.zoomOut) googleMapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.viewport) {
      orthoViewerRef.current.viewport.goHome(true);
    } else if (mapMode === 'google' && googleMapRef.current) {
      googleMapRef.current.setView(currentCemetery.coords, 18);
    }
  };

  const handleCenterMapOnCoords = (coords) => {
    if (mapMode === 'ortho' && orthoViewerRef.current && orthoViewerRef.current.centerOnCoords) {
      orthoViewerRef.current.centerOnCoords(coords);
    } else if (googleMapRef.current && googleMapRef.current.centerOnCoords) {
      googleMapRef.current.centerOnCoords(coords);
    }
  };

  const toggleMapMode = () => {
    setMapMode((prev) => (prev === 'ortho' ? 'google' : 'ortho'));
  };

  const handleSelectTumba = React.useCallback((tumba) => {
    setSelectedTumba(tumba);
  }, []);

  const handleSetViewerRef = React.useCallback((inst) => {
    orthoViewerRef.current = inst;
  }, []);

  const handleSetGoogleMapRef = React.useCallback((inst) => {
    googleMapRef.current = inst;
  }, []);

  return (
    <div className="viewer-standalone-page" style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      
      {/* TOP RIGHT MAP SEARCH BAR */}
      <MapSearchBar 
        geoData={geoData}
        onSelectTumba={handleSelectTumba}
        onCenterMap={handleCenterMapOnCoords}
        onHighlightMatches={(lotes) => setMatchingLotes(lotes)}
      />

      {/* LEFT SLIDING DRAWER FOR SELECTED TOMB */}
      {selectedTumba && (
        <TumbaDrawer 
          tumba={selectedTumba} 
          onClose={() => setSelectedTumba(null)} 
        />
      )}

      {/* MAP CANVAS VIEWPORTS */}
      <main className="viewer-standalone-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {mapMode === 'ortho' && currentCemetery.hasOrtho ? (
          <OrthoViewer 
            onZoomChange={setZoomPct}
            setViewerRef={handleSetViewerRef}
            onSelectTumba={handleSelectTumba}
            selectedTumba={selectedTumba}
            matchingLotes={matchingLotes}
          />
        ) : (
          <GoogleMapView 
            onZoomChange={setZoomPct}
            setMapRef={handleSetGoogleMapRef}
            onSelectTumba={handleSelectTumba}
            selectedTumba={selectedTumba}
            matchingLotes={matchingLotes}
          />
        )}
      </main>

      {/* FLOATING CONTROL BUTTONS STACK (BOTTOM RIGHT CORNER) */}
      <div className="floating-white-controls-stack">
        {/* BUTTON 1: VISTA TOGGLE ICON BUTTON */}
        {currentCemetery.hasOrtho && (
          <button
            onClick={toggleMapMode}
            title={mapMode === 'ortho' ? 'Cambiar a Vista Satelital Google Maps' : 'Cambiar a Ortofoto Dron HD'}
            className="ctrl-btn-square"
          >
            {mapMode === 'ortho' ? (
              <Layers size={22} color="#1e293b" strokeWidth={2.2} />
            ) : (
              <Eye size={22} color="#7A1C2E" strokeWidth={2.2} />
            )}
          </button>
        )}

        {/* BUTTON 2: CENTRAR TARGET ICON BUTTON */}
        <button
          onClick={handleResetView}
          title="Centrar Posición de la Vista"
          className="ctrl-btn-square"
        >
          <Target size={22} color="#1e293b" strokeWidth={2.2} />
        </button>

        {/* BUTTON 3: VERTICAL ZOOM PILL CONTAINER (+ / -) */}
        <div className="zoom-pill-container">
          <button onClick={handleZoomIn} title="Acercar (+)" className="zoom-sub-btn">
            <Plus size={22} color="#1e293b" strokeWidth={2.5} />
          </button>
          <div className="zoom-divider"></div>
          <button onClick={handleZoomOut} title="Alejar (-)" className="zoom-sub-btn">
            <Minus size={22} color="#1e293b" strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </div>
  );
}
