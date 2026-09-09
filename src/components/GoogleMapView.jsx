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

  const selectedTumbaRef = useRef(selectedTumba);
  const matchingLotesRef = useRef(matchingLotes);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    selectedTumbaRef.current = selectedTumba;
  }, [selectedTumba]);

  useEffect(() => {
    matchingLotesRef.current = matchingLotes;
  }, [matchingLotes]);

  // Load public/tumbas.geojson
  useEffect(() => {
    fetch('/tumbas.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((err) => console.error('Error loading tumbas.geojson in GoogleMapView:', err));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Exact Lat/Lng coordinates of the orthophoto at Panteón Lomas de Barrillas
    const orthofotoCenterCoords = [18.139684, -94.528185];

    // Initialize Leaflet Map with GPU Canvas Renderer
    const map = L.map(mapContainerRef.current, {
      preferCanvas: true,
      renderer: L.canvas({ tolerance: 4 }),
      center: orthofotoCenterCoords,
      zoom: 18.5,
      minZoom: 14,
      maxZoom: 26,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Hybrid (Satellite + Roads) Tiles Layer
    const googleHybridTiles = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxNativeZoom: 20,
      maxZoom: 26,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });
    googleHybridTiles.addTo(map);

    mapInstanceRef.current = map;
    if (setMapRef) {
      setMapRef({
        zoomIn: () => map.zoomIn(1),
        zoomOut: () => map.zoomOut(1),
        setView: (coords, zoom) => map.setView(coords, zoom),
        centerOnCoords: (coords) => map.setView(coords, 23)
      });
    }

    // Zoom listener
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const pct = Math.round((zoom / 18.5) * 100);
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
        color: '#FACC15',
        weight: 1.8,
        fillColor: '#FACC15',
        fillOpacity: 0.05
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};

        layer.bindTooltip(`
          <div style="font-family: sans-serif; padding: 2px 6px;">
            <strong style="color: #7A1C2E;">Lote #${props.lote || ''} (Sec. ${props.seccion || 'A'})</strong><br/>
            <span>${props.difunto || 'Registro Fosa'}</span>
          </div>
        `, { sticky: true, direction: 'top' });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            const featProps = feature.properties || {};
            const loteStr = String(featProps.lote || '');
            const fidStr = String(featProps.fid || '');

            const selectedProps = selectedTumbaRef.current?.properties || {};
            const selectedLoteStr = String(selectedProps.lote || '');
            const selectedFidStr = String(selectedProps.fid || '');

            const isSelected =
              (selectedFidStr && fidStr === selectedFidStr) ||
              (selectedLoteStr && loteStr === selectedLoteStr);

            const isMatch = matchingLotesRef.current.includes(loteStr) || matchingLotesRef.current.includes(fidStr);

            if (isSelected) {
              l.setStyle({
                color: '#1E3A8A',
                weight: 4.5,
                fillColor: '#2563EB',
                fillOpacity: 0.25
              });
            } else if (isMatch) {
              l.setStyle({
                color: '#00E5FF',
                weight: 4.0,
                fillColor: '#00E5FF',
                fillOpacity: 0.2
              });
            } else {
              l.setStyle({
                color: '#FDE047',
                weight: 3.0,
                fillColor: '#FDE047',
                fillOpacity: 0.15
              });
            }
          },
          mouseout: (e) => {
            const l = e.target;
            const featProps = feature.properties || {};
            const loteStr = String(featProps.lote || '');
            const fidStr = String(featProps.fid || '');

            const selectedProps = selectedTumbaRef.current?.properties || {};
            const selectedLoteStr = String(selectedProps.lote || '');
            const selectedFidStr = String(selectedProps.fid || '');

            const isSelected =
              (selectedFidStr && fidStr === selectedFidStr) ||
              (selectedLoteStr && loteStr === selectedLoteStr);

            const isMatch = matchingLotesRef.current.includes(loteStr) || matchingLotesRef.current.includes(fidStr);

            if (isSelected) {
              l.setStyle({
                color: '#2563EB',
                weight: 3.8,
                fillColor: '#2563EB',
                fillOpacity: 0.18
              });
            } else if (isMatch) {
              l.setStyle({
                color: '#00E5FF',
                weight: 3.2,
                fillColor: '#00E5FF',
                fillOpacity: 0.15
              });
            } else {
              geoJsonLayer.resetStyle(l);
            }
          },
          click: (e) => {
            if (e && e.originalEvent) {
              L.DomEvent.stopPropagation(e.originalEvent);
            }
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
    const selectedFidStr = selectedTumba?.properties?.fid !== undefined ? String(selectedTumba.properties.fid) : null;

    geoJsonLayerRef.current.eachLayer((layer) => {
      const featProps = layer.feature?.properties || {};
      const loteStr = String(featProps.lote || '');
      const fidStr = String(featProps.folio || '');

      const isSelected =
        (selectedFidStr && fidStr === selectedFidStr) ||
        (selectedLoteStr && loteStr === selectedLoteStr);

      const isMatch = matchingLotes.includes(loteStr) || matchingLotes.includes(fidStr);

      if (isSelected) {
        layer.setStyle({
          color: '#2563EB',
          weight: 3.8,
          fillColor: '#2563EB',
          fillOpacity: 0.18
        });
        layer.bringToFront();
      } else if (isMatch) {
        layer.setStyle({
          color: '#00E5FF',
          weight: 3.2,
          fillColor: '#00E5FF',
          fillOpacity: 0.15
        });
      } else {
        layer.setStyle({
          color: '#FACC15',
          weight: 1.8,
          fillColor: '#FACC15',
          fillOpacity: 0.05
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
