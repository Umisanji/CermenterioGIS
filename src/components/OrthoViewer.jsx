import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrthoViewer({ onZoomChange, setViewerRef, onSelectTumba }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [geoData, setGeoData] = useState(null);

  // Load public/tumbas.geojson
  useEffect(() => {
    fetch('/tumbas.geojson')
      .then((res) => res.json())
      .then((data) => {
        console.log('Loaded GeoJSON in OrthoViewer:', data);
        setGeoData(data);
      })
      .catch((err) => console.error('Error loading tumbas.geojson:', err));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Exact center bounds for Panteón Lomas de Barrillas Orthophoto
    const centerCoords = [18.14008, -94.52739];
    const imageBounds = [
      [18.1382, -94.5298], // SouthWest
      [18.1420, -94.5250]  // NorthEast
    ];

    // Initialize Leaflet Map for Realistic Orthophoto + QGIS GeoJSON Vector Overlay
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 19,
      minZoom: 16,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: false
    });

    // High-Resolution Aerial Orthophoto ImageOverlay
    const orthophotoLayer = L.imageOverlay('/ortho_seccion_a_web.jpg', imageBounds, {
      opacity: 1.0,
      interactive: true
    });
    orthophotoLayer.addTo(map);

    mapInstanceRef.current = map;
    if (setViewerRef) setViewerRef(map);

    // Zoom change listener
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

  // Add QGIS GeoJSON Polygons directly on top of the realistic orthophoto
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    const map = mapInstanceRef.current;

    // Render QGIS Polygons with glowing gold/maroon vector styling directly over the aerial photo
    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => ({
        color: '#FACC15',       // Bright Gold Border
        weight: 3,
        fillColor: '#7A1C2E',   // Coatzacoalcos Maroon Fill
        fillOpacity: 0.65
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        
        // Tooltip hover label
        layer.bindTooltip(`
          <div style="font-family: sans-serif; padding: 2px 6px;">
            <strong style="color: #7A1C2E;">Lote #${props.lote || ''} (Sec. ${props.seccion || 'A'})</strong><br/>
            <span>🪦 ${props.difunto || 'Registro Fosa'}</span>
          </div>
        `, { sticky: true, direction: 'top' });

        // Hover highlight effects
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 4,
              color: '#ffffff',
              fillOpacity: 0.85
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
    
    // Fit map bounds to the QGIS mapped tombs if available
    try {
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [100, 100], maxZoom: 20 });
      }
    } catch (e) {
      console.warn('Could not fit bounds:', e);
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
        minHeight: 'calc(100vh - 64px)', 
        backgroundColor: '#ffffff' 
      }}
    />
  );
}
