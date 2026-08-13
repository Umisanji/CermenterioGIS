import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function getFeatureCentroid(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Point') {
    return [geometry.coordinates[1], geometry.coordinates[0]];
  } else if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0];
    let latSum = 0, lngSum = 0;
    ring.forEach((pt) => {
      lngSum += pt[0];
      latSum += pt[1];
    });
    return [latSum / ring.length, lngSum / ring.length];
  }
  return null;
}

export default function OrthoViewer({
  onZoomChange,
  setViewerRef,
  onSelectTumba,
  selectedTumba,
  matchingLotes = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const markerGroupRef = useRef(null);
  const hasFittedRef = useRef(false);
  const onSelectTumbaRef = useRef(onSelectTumba);
  const selectedTumbaRef = useRef(selectedTumba);
  const matchingLotesRef = useRef(matchingLotes);
  const [geoData, setGeoData] = useState(null);

  // Keep refs updated to avoid re-creating layers on prop changes
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
      .catch((err) => console.error('Error loading tumbas.geojson:', err));
  }, []);

  // Initialize Leaflet Map (Runs ONLY ONCE)
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

    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 19,
      minZoom: 15,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true
    });

    // High-Resolution Aerial Orthophoto Image Layer
    const orthophotoLayer = L.imageOverlay('/ortho_seccion_a_web.jpg', exactQgisImageBounds, {
      opacity: 1.0,
      interactive: true
    });
    orthophotoLayer.addTo(map);

    // Layer group for selected pins
    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    mapInstanceRef.current = map;
    if (setViewerRef) {
      setViewerRef({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        centerOnCoords: (coords) => map.setView(coords, 21),
        viewport: {
          goHome: () => map.setView(centerCoords, 19),
          zoomBy: (factor) => {
            if (factor > 1) map.zoomIn();
            else map.zoomOut();
          },
          applyConstraints: () => { }
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
  }, []); // Run ONCE on mount!

  // Render GeoJSON polygons (Runs ONLY when geoData loads)
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    const map = mapInstanceRef.current;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = L.geoJSON(geoData, {
      style: () => ({
        color: '#FACC15',       // Gold Border
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
            const l = e.target;
            const loteStr = String(feature.properties?.lote || '');
            const selectedLoteStr = String(selectedTumbaRef.current?.properties?.lote || '');
            if (selectedLoteStr && loteStr === selectedLoteStr) {
              l.setStyle({ color: '#EF4444', weight: 6.5, fillColor: '#DC2626', fillOpacity: 0.95 });
            } else if (matchingLotesRef.current.includes(loteStr)) {
              l.setStyle({ color: '#38BDF8', weight: 5, fillColor: '#0284C7', fillOpacity: 0.9 });
            } else {
              geoJsonLayer.resetStyle(l);
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            if (onSelectTumbaRef.current) {
              onSelectTumbaRef.current(feature);
            }
          }
        });
      }
    });

    geoJsonLayer.addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;

    // ONLY FIT BOUNDS ONCE ON INITIAL LOAD
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
  }, [geoData]);

  // Dynamically update polygon highlights and target pin when selectedTumba or matchingLotes changes
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
          color: '#EF4444',       // Vibrant Red Border
          weight: 6.5,
          fillColor: '#DC2626',   // Vibrant Red Fill
          fillOpacity: 0.95
        });
        layer.bringToFront();
      } else if (isMatch) {
        layer.setStyle({
          color: '#38BDF8',       // Electric Cyan Border
          weight: 5,
          fillColor: '#0284C7',   // Cyan Fill
          fillOpacity: 0.88
        });
        layer.bringToFront();
      } else {
        layer.setStyle({
          color: '#FACC15',       // Standard Gold Border
          weight: 3.5,
          fillColor: '#7A1C2E',   // Standard Maroon Fill
          fillOpacity: 0.75
        });
      }
    });

    // Update target pin marker
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();

      if (selectedTumba && selectedTumba.geometry) {
        const centroid = getFeatureCentroid(selectedTumba.geometry);
        if (centroid) {
          const props = selectedTumba.properties || {};
          const pinHtml = `
            <div className="target-pin-container">
              <div className="target-pin-pulse"></div>
              <div className="target-pin-badge">
              </div>
            </div>
          `;
          const customIcon = L.divIcon({
            className: 'custom-target-icon-wrapper',
            html: pinHtml,
            iconSize: [140, 44],
            iconAnchor: [70, 44]
          });

          const pinMarker = L.marker(centroid, { icon: customIcon });
          pinMarker.addTo(markerGroupRef.current);
        }
      }
    }
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
