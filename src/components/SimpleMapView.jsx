import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function SimpleMapView({ onZoomChange, setMapRef }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    // Coordinates for Panteón Municipal Lomas de Barrillas, Coatzacoalcos
    const centerLatLng = [18.1405, -94.5192];

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: centerLatLng,
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Roadmap Tiles Layer
    const googleRoadmapTiles = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });
    googleRoadmapTiles.addTo(map);

    // Green Polygon Overlay for Panteón Municipal Lomas de Barrillas
    const polygonCoords = [
      [18.1422, -94.5208],
      [18.1425, -94.5178],
      [18.1392, -94.5172],
      [18.1385, -94.5202]
    ];

    const cemeteryPolygon = L.polygon(polygonCoords, {
      color: '#22c55e',
      fillColor: '#86efac',
      fillOpacity: 0.65,
      weight: 2
    }).addTo(map);

    // Custom Marker for Cemetery
    const customIcon = L.divIcon({
      className: 'custom-cemetery-marker',
      html: `
        <div style="
          background: #ffffff;
          border: 2px solid #059669;
          border-radius: 20px;
          padding: 6px 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 12px;
          color: #065f46;
          white-space: nowrap;
        ">
          <span style="font-size: 14px;">🪦</span>
          <span>Panteón Municipal Lomas de Barrillas</span>
        </div>
      `,
      iconSize: [220, 36],
      iconAnchor: [110, 18]
    });

    L.marker(centerLatLng, { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;
    if (setMapRef) setMapRef(map);

    // Zoom listener
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const pct = Math.round((zoom / 17) * 100);
      if (onZoomChange) onZoomChange(pct);
    });

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full" 
      style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 65px)' }}
    />
  );
}
