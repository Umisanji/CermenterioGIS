import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';

export default function MapSearchBar({ geoData, onSelectTumba, onCenterMap, onHighlightMatches }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter geojson features when typing and emit matching IDs to map
  useEffect(() => {
    if (!searchTerm.trim() || !geoData || !geoData.features) {
      setResults([]);
      setIsOpen(false);
      if (onHighlightMatches) onHighlightMatches([]);
      return;
    }

    const rawQuery = searchTerm.toLowerCase().trim();
    // Clean query to strip prefixes like "#", "lote", "folio", "recibo" for numeric queries
    const cleanNumQuery = rawQuery.replace(/^(lote|folio|recibo|sec|seccion|#|\s)+/gi, '').trim();

    const matches = geoData.features.filter((feat) => {
      const p = feat.properties || {};

      const difunto = String(p.difunto || '').toLowerCase();
      const propietario = String(p.propietario || '').toLowerCase();
      const lote = String(p.lote || '').toLowerCase();
      const folio = String(p.folio || '').toLowerCase();
      const recibo = String(p.recibo || '').toLowerCase();
      const seccion = String(p.seccion || '').toLowerCase();
      const observacion = String(p.observacion || '').toLowerCase();

      // Check direct matches across key fields
      const isDirectMatch =
        difunto.includes(rawQuery) ||
        propietario.includes(rawQuery) ||
        lote.includes(rawQuery) ||
        folio.includes(rawQuery) ||
        recibo.includes(rawQuery) ||
        seccion.includes(rawQuery) ||
        observacion.includes(rawQuery);

      if (isDirectMatch) return true;

      // Check numeric clean query match for lote / folio / recibo
      if (cleanNumQuery.length > 0) {
        if (lote === cleanNumQuery || lote.includes(cleanNumQuery)) return true;
        if (folio === cleanNumQuery || folio.includes(cleanNumQuery)) return true;
        if (recibo.includes(cleanNumQuery)) return true;
      }

      return false;
    });

    setResults(matches.slice(0, 10)); // Limit dropdown to top 10 matches
    setIsOpen(true);

    // Emit all matched lote numbers / IDs for live map highlight!
    if (onHighlightMatches) {
      const matchLotes = matches.map((f) => String(f.properties?.lote || f.id));
      onHighlightMatches(matchLotes);
    }
  }, [searchTerm, geoData, onHighlightMatches]);

  const handleSelectResult = (feature) => {
    setIsOpen(false);
    if (onSelectTumba) {
      onSelectTumba(feature);
    }
    if (onCenterMap && feature.geometry) {
      // Calculate centroid if polygon, or point coordinates
      let coords = null;
      if (feature.geometry.type === 'Point') {
        coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
      } else if (feature.geometry.type === 'Polygon') {
        const ring = feature.geometry.coordinates[0];
        let latSum = 0, lngSum = 0;
        ring.forEach((pt) => {
          lngSum += pt[0];
          latSum += pt[1];
        });
        coords = [latSum / ring.length, lngSum / ring.length];
      }
      if (coords) {
        onCenterMap(coords);
      }
    }
  };

  return (
    <div className="map-search-bar-wrapper" ref={searchRef}>
      <div className="search-input-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={() => {
              setSearchTerm('');
              setResults([]);
              setIsOpen(false);
              if (onHighlightMatches) onHighlightMatches([]);
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results-dropdown">
          <div className="results-header">Coincidencias encontradas ({results.length})</div>
          {results.map((feat, idx) => {
            const p = feat.properties || {};
            return (
              <div
                key={feat.id || idx}
                className="search-result-item"
                onClick={() => handleSelectResult(feat)}
              >
                <MapPin size={16} className="result-pin-icon" />
                <div className="result-info">
                  <span className="result-title">{p.difunto || 'Registro Fosa'}</span>
                  <span className="result-subtitle">
                    Lote #{p.lote || 'N/A'} — Sec. {p.seccion || 'A'} | Folio #{p.folio || 'N/A'}
                  </span>
                  {p.propietario && (
                    <span className="result-owner">Titular: {p.propietario}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && results.length === 0 && searchTerm.trim() !== '' && (
        <div className="search-results-dropdown">
          <div className="no-results-msg">No se encontraron lotes coincidentes con "{searchTerm}"</div>
        </div>
      )}
    </div>
  );
}
