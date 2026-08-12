import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrthoViewer({ onZoomChange, setViewerRef, onSelectTumba }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hasFittedRef = useRef(false);
  const [geoData, setGeoData] = useState(null);

  // Load public/tumbas.geojson
  useEffect(() => {
    fetch('/tumbas.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((err) => console.error('Error loading tumbas.geojson:', err));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // EXACT 1:1 GEOMETRIC EXTENT DERIVED DIRECTLY FROM QGIS RASTER METADATA:
    const southWest = [18.138659354301275, -94.52949563352669];
    const northEast = [18.140585169744774, -94.52696508877698];
    const exactQgisImageBounds = [southWest, northEast];

    const centerCoords = [
      (southWest[0] + northEast[0]) / 2,
      (southWest[1] + northEast[1]) / 2
    ];

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 19,
      minZoom: 15,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: false
    });

    // High-Resolution Aerial Orthophoto Image Layer with exact 1:1 QGIS Extent
    const orthophotoLayer = L.imageOverlay('/ortho_seccion_a_web.jpg', exactQgisImageBounds, {
      opacity: 1.0,
      interactive: true
    });
    orthophotoLayer.addTo(map);

    mapInstanceRef.current = map;
    if (setViewerRef) {
      setViewerRef({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        viewport: {
          goHome: () => map.setView(centerCoords, 19),
          zoomBy: (factor) => {
            if (factor > 1) map.zoomIn();
            else map.zoomOut();
          },
          applyConstraints: () => {}
        }
      });
    }

    // Zoom listener
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const pct = Math.round((zoom / 19) * 100);
      if (onZoomChange) onZoomChange(pct);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render QGIS GeoJSON Polygons without resetting zoom on re-renders
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    const map = mapInstanceRef.current;

    const geoJsonLayer = L.geoJSON(geoData, {
      style: () => ({
        color: '#FACC15',       // Bright Gold Border
        weight: 3.5,
        fillColor: '#7A1C2E',   // Coatzacoalcos Maroon Fill
        fillOpacity: 0.75
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        
        layer.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 8px; line-height: 1.3;">
            <strong style="color: #7A1C2E; font-size: 0.88rem;">Lote #${props.lote || ''} (Sec. ${props.seccion || 'A'})</strong><br/>
            <span style="font-size: 0.8rem; color: #334155; font-weight: 600;">🪦 ${props.difunto || 'Registro Fosa'}</span>
          </div>
        `, { sticky: true, direction: 'top' });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 5,
              color: '#ffffff',
              fillOpacity: 0.95
            });
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            if (onSelectTumba) onSelectTumba(feature);
          }
        });
      }
    });

    geoJsonLayer.addTo(map);

    // ONLY FIT BOUNDS ONCE ON INITIAL LOAD, NOT ON RE-RENDERS
    if (!hasFittedRef.current) {
      try {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [120, 120], maxZoom: 21 });
          hasFittedRef.current = true;
        }
      } catch (err) {
        console.warn('Could not fit bounds:', err);
      }
    }

    return () => {
      map.removeLayer(geoJsonLayer);
    };
  }, [geoData, onSelectTumba]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full bg-white overflow-hidden" 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: 'calc(100vh - 65px)', 
        backgroundColor: '#ffffff' 
      }}
    />
  );
}
