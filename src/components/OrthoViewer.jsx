import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrthoViewer({ onZoomChange, setViewerRef, onSelectTumba, selectedTumba, matchingLotes = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const onSelectTumbaRef = useRef(onSelectTumba);
  const selectedTumbaRef = useRef(selectedTumba);
  const matchingLotesRef = useRef(matchingLotes);

  const [geoData, setGeoData] = useState(null);

  // Keep latest references for event callbacks
  useEffect(() => {
    onSelectTumbaRef.current = onSelectTumba;
  }, [onSelectTumba]);

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
      .catch((err) => console.error('Error loading tumbas.geojson in OrthoViewer:', err));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // EXACT 1:1 GEOMETRIC EXTENT OF NEW CROPPED ORTHOPHOTO (ortofotoRecortada.tif):
    const southWest = [18.138987579402276, -94.52916665203209];
    const northEast = [18.140381004844773, -94.52720318897669];
    const exactQgisImageBounds = [southWest, northEast];

    const centerCoords = [
      (southWest[0] + northEast[0]) / 2,
      (southWest[1] + northEast[1]) / 2
    ];

    // Initialize Leaflet Map with GPU Canvas Renderer
    const map = L.map(mapContainerRef.current, {
      preferCanvas: true,
      renderer: L.canvas({ tolerance: 4 }),
      center: centerCoords,
      zoom: 18.5,
      minZoom: 15,
      maxZoom: 26,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false
    });

    // High-Resolution Aerial Orthophoto Image Layer (High-Efficiency 14MB WebP GPU Texture)
    const orthophotoLayer = L.imageOverlay('/ortho_seccion_a_web_opt.webp', exactQgisImageBounds, {
      opacity: 1.0,
      interactive: false,
      maxNativeZoom: 22,
      maxZoom: 26,
      className: 'gpu-ortho-layer'
    });
    orthophotoLayer.addTo(map);

    mapInstanceRef.current = map;
    if (setViewerRef) {
      setViewerRef({
        zoomIn: () => map.zoomIn(1),
        zoomOut: () => map.zoomOut(1),
        centerOnCoords: (coords) => map.setView(coords, 23),
        viewport: {
          goHome: () => map.setView(centerCoords, 18.5),
          zoomBy: (factor) => {
            if (factor > 1) map.zoomIn(1);
            else map.zoomOut(1);
          },
          applyConstraints: () => { }
        }
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
  }, []); // Run ONCE on mount!

  // Render QGIS GeoJSON Polygons over the cropped Orthophoto (GPU CANVAS RENDERER)
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
        const loteVal = props.lote || props.identificador || props.LOTE || props.Lote || props.fid || '';

        layer.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 8px; line-height: 1.3;">
            <strong style="color: #7A1C2E; font-size: 0.88rem;">Lote #${loteVal}</strong>
          </div>
        `, { sticky: true, direction: 'top' });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            const featProps = feature.properties || {};
            const loteStr = String(featProps.lote || featProps.identificador || featProps.LOTE || featProps.Lote || '');
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
            if (onSelectTumbaRef.current) {
              onSelectTumbaRef.current(feature);
            }
          }
        });
      }
    });

    geoJsonLayer.addTo(map);
    geoJsonLayer.bringToFront();
    geoJsonLayerRef.current = geoJsonLayer;

    return () => {
      map.removeLayer(geoJsonLayer);
    };
  }, [geoData]);

  // Dynamically update polygon highlights when selectedTumba or matchingLotes changes
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;

    const selectedLoteStr = selectedTumba?.properties?.lote ? String(selectedTumba.properties.lote) : null;
    const selectedFidStr = selectedTumba?.properties?.fid !== undefined ? String(selectedTumba.properties.fid) : null;

    geoJsonLayerRef.current.eachLayer((layer) => {
      const featProps = layer.feature?.properties || {};
      const loteStr = String(featProps.lote || '');
      const fidStr = String(featProps.fid || '');

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
