import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GoogleMapView({
  onZoomChange,
  setMapRef,
  onSelectTumba,
  selectedTumba,
  matchingLotes = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
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

    // Exact Lat/Lng coordinates of the orthophoto at Panteón Lomas de Barrillas
    const orthofotoCenterCoords = [18.14008, -94.52739];

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: orthofotoCenterCoords,
      zoom: 19,
      minZoom: 14,
      maxZoom: 21,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Hybrid (Satellite + Roads) Tiles Layer
    const googleHybridTiles = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });
    googleHybridTiles.addTo(map);

    mapInstanceRef.current = map;
    if (setMapRef) {
      setMapRef({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        setView: (coords, zoom) => map.setView(coords, zoom),
        centerOnCoords: (coords) => map.setView(coords, 20)
      });
    }

    // Zoom listener
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const pct = Math.round((zoom / 18) * 100);
      if (onZoomChange) onZoomChange(pct);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setMapRef, onZoomChange]);

  // Render QGIS GeoJSON Polygons on Google Maps Satellite view
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    const map = mapInstanceRef.current;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = L.geoJSON(geoData, {
      style: () => ({
        color: '#FACC15',       // Bright Gold Border
        weight: 3,
        fillColor: '#7A1C2E',   // Coatzacoalcos Maroon Fill
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};

        layer.bindTooltip(`
          <div style="font-family: sans-serif; padding: 2px 6px;">
            <strong style="color: #7A1C2E;">Lote #${props.lote || ''} (Sec. ${props.seccion || 'A'})</strong><br/>
            <span>🪦 ${props.difunto || 'Registro Fosa'}</span>
          </div>
        `, { sticky: true, direction: 'top' });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 4,
              color: '#ffffff',
              fillOpacity: 0.9
            });
          },
          mouseout: (e) => {
            const l = e.target;
            const loteStr = String(feature.properties?.lote || '');
            const selectedLoteStr = String(selectedTumba?.properties?.lote || '');
            if (selectedLoteStr && loteStr === selectedLoteStr) {
              l.setStyle({ color: '#EF4444', weight: 6, fillColor: '#DC2626', fillOpacity: 0.95 });
            } else if (matchingLotes.includes(loteStr)) {
              l.setStyle({ color: '#38BDF8', weight: 5, fillColor: '#0284C7', fillOpacity: 0.88 });
            } else {
              geoJsonLayer.resetStyle(l);
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            if (onSelectTumba) onSelectTumba(feature);
          }
        });
      }
    });

    geoJsonLayer.addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;

    return () => {
      map.removeLayer(geoJsonLayer);
    };
  }, [geoData, onSelectTumba]);

  // Dynamically update polygon highlights when selectedTumba or matchingLotes changes
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;

    const selectedLoteStr = selectedTumba?.properties?.lote ? String(selectedTumba.properties.lote) : null;
    const selectedFolioStr = selectedTumba?.properties?.folio ? String(selectedTumba.properties.folio) : null;

    geoJsonLayerRef.current.eachLayer((layer) => {
      const featProps = layer.feature?.properties || {};
      const loteStr = String(featProps.lote || '');
      const folioStr = String(featProps.folio || '');

      const isSelected =
        (selectedLoteStr && loteStr === selectedLoteStr) ||
        (selectedFolioStr && folioStr === selectedFolioStr);

      const isMatch = matchingLotes.includes(loteStr) || matchingLotes.includes(folioStr);

      if (isSelected) {
        layer.setStyle({
          color: '#EF4444',
          weight: 6.5,
          fillColor: '#DC2626',
          fillOpacity: 0.95
        });
        layer.bringToFront();
      } else if (isMatch) {
        layer.setStyle({
          color: '#38BDF8',
          weight: 5,
          fillColor: '#0284C7',
          fillOpacity: 0.88
        });
        layer.bringToFront();
      } else {
        layer.setStyle({
          color: '#FACC15',
          weight: 3,
          fillColor: '#7A1C2E',
          fillOpacity: 0.7
        });
      }
    });
  }, [selectedTumba, matchingLotes]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 65px)' }}
    />
  );
}
