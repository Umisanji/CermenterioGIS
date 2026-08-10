import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function SimpleMapView({ onZoomChange, setMapRef }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    // EXACT authentic coordinates for Panteón Municipal Lomas de Barrillas on Carr. A Barrillas
    const lomasBarrillasCoords = [18.1432, -94.5365];

    // Initialize Leaflet Map centered over the exact cemetery location
    const map = L.map(mapContainerRef.current, {
      center: lomasBarrillasCoords,
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Clean Google Maps Roadmap Tile Layer
    const googleRoadmapTiles = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });
    googleRoadmapTiles.addTo(map);

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
