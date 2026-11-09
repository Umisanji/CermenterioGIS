import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Filter } from 'lucide-react';

export default function MapSearchBar({ geoData, onSelectTumba, onCenterMap, onHighlightMatches }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedGender, setSelectedGender] = useState('ALL'); // 'ALL' | 'HOMBRE' | 'MUJER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'REGULAR' | 'IRREGULAR'
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!document.body.contains(event.target)) return;
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tumbas directly against real PostgreSQL 18 relational database (Independent of GeoJSON properties)
  useEffect(() => {
    const hasSearch = Boolean(searchTerm.trim());
    const hasStartDate = Boolean(startDate);
    const hasEndDate = Boolean(endDate);
    const hasGenderFilter = selectedGender !== 'ALL';
    const hasStatusFilter = statusFilter !== 'ALL';

    if (!hasSearch && !hasStartDate && !hasEndDate && !hasGenderFilter && !hasStatusFilter) {
      setResults([]);
      setIsOpen(false);
      if (onHighlightMatches) onHighlightMatches([]);
      return;
    }

    const queryParams = new URLSearchParams({
      q: searchTerm.trim(),
      gender: selectedGender,
      status: statusFilter,
      startDate: startDate,
      endDate: endDate
    });

    fetch(`/api/tumbas-search?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al buscar en BD');
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setIsOpen(data.length > 0);

        // Highlight matched lote numbers on the GIS map by matching feature lote ID
        if (onHighlightMatches) {
          const matchLotes = data.map((item) => String(item.lote));
          onHighlightMatches(matchLotes);
        }
      })
      .catch((err) => {
        console.error('Error fetching PostgreSQL search results:', err);
      });
  }, [searchTerm, startDate, endDate, selectedGender, statusFilter, onHighlightMatches]);

  const handleSelectResult = (item) => {
    setIsOpen(false);

    // Find matching GeoJSON polygon feature by lote / identificador number
    let matchedFeature = null;
    if (geoData && geoData.features) {
      matchedFeature = geoData.features.find((feat) => {
        const p = feat.properties || {};
        const featLote = String(p.lote || p.identificador || feat.id || '');
        return featLote === String(item.lote);
      });
    }

    // Fallback feature if GeoJSON polygon only has lote ID
    if (!matchedFeature) {
      matchedFeature = {
        id: item.lote,
        properties: {
          lote: item.lote,
          difunto: item.difunto,
          propietario: item.propietario,
          seccion: item.seccion
        }
      };
    }

    if (onSelectTumba) {
      onSelectTumba(matchedFeature);
    }

    if (onCenterMap && matchedFeature && matchedFeature.geometry) {
      let coords = null;
      if (matchedFeature.geometry.type === 'Point') {
        coords = [matchedFeature.geometry.coordinates[1], matchedFeature.geometry.coordinates[0]];
      } else if (matchedFeature.geometry.type === 'Polygon') {
        const ring = matchedFeature.geometry.coordinates[0];
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

  const hasSearch = Boolean(searchTerm.trim());
  const hasActiveDateFilter = Boolean(startDate || endDate);
  const hasActiveGenderFilter = selectedGender !== 'ALL';
  const hasActiveStatusFilter = statusFilter !== 'ALL';
  const hasAnyFilter = hasActiveDateFilter || hasActiveGenderFilter || hasActiveStatusFilter;

  // Helper function to highlight matching search query terms in text
  const renderHighlightedText = (text, query) => {
    if (!text) return '';
    if (!query || !query.trim()) return text;

    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return text;

    const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          style={{
            backgroundColor: '#FEF08A',
            color: '#854D0E',
            fontWeight: '800',
            borderRadius: '3px',
            padding: '0 2px'
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="map-search-bar-wrapper" ref={searchRef}>
      <div className="search-input-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={hasAnyFilter ? "Filtrar en PostgreSQL con filtros activos..." : "Buscar difunto o lote..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />

        {searchTerm && (
          <button
            className="search-clear-btn"
            title="Limpiar texto"
            onClick={() => setSearchTerm('')}
          >
            <X size={16} />
          </button>
        )}

        {/* DATE, GENDER & CATASTRAL STATUS FILTER TOGGLE BUTTON */}
        <button
          className={`search-date-toggle-btn ${hasAnyFilter ? 'active' : ''}`}
          onClick={() => setShowDateFilter(!showDateFilter)}
          title="Filtros Avanzados en PostgreSQL (Estado, Fechas, Sexo)"
          style={{
            background: hasAnyFilter ? 'rgba(122, 28, 46, 0.12)' : 'transparent',
            border: 'none',
            color: hasAnyFilter ? '#7A1C2E' : '#64748b',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Filter size={16} />
          {hasAnyFilter && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#DC2626'
              }}
            />
          )}
        </button>
      </div>

      {/* UNIFIED EXPANDABLE DROPDOWN (FILTERS ON TOP + RESULTS LIST DIRECTLY UNDERNEATH) */}
      {(showDateFilter || (isOpen && (results.length > 0 || hasSearch || hasAnyFilter))) && (
        <div
          className="search-results-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22)',
            border: '1px solid #cbd5e1',
            maxHeight: '480px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 600
          }}
        >
          {/* 1. ADVANCED FILTERS SECTION (IF TOGGLED OPEN) */}
          {showDateFilter && (
            <div
              style={{
                padding: '14px',
                background: '#f8fafc',
                borderBottom: (isOpen && (results.length > 0 || hasSearch || hasAnyFilter)) ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* HEADER & RESET */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>
                  Filtros Avanzados (PostgreSQL)
                </span>
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGender('ALL');
                      setStatusFilter('ALL');
                      setStartDate('');
                      setEndDate('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>

              {/* STATUS FILTER: ALL, REGULAR, IRREGULAR */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                  Estado Catastral de Fosa:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: statusFilter === 'ALL' ? '#7A1C2E' : '#cbd5e1',
                      background: statusFilter === 'ALL' ? '#7A1C2E' : '#ffffff',
                      color: statusFilter === 'ALL' ? '#ffffff' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Todos
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('REGULAR')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: statusFilter === 'REGULAR' ? '#059669' : '#cbd5e1',
                      background: statusFilter === 'REGULAR' ? '#059669' : '#ffffff',
                      color: statusFilter === 'REGULAR' ? '#ffffff' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Regular
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('IRREGULAR')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: statusFilter === 'IRREGULAR' ? '#DC2626' : '#cbd5e1',
                      background: statusFilter === 'IRREGULAR' ? '#DC2626' : '#ffffff',
                      color: statusFilter === 'IRREGULAR' ? '#ffffff' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Irregular
                  </button>
                </div>
              </div>

              {/* GENDER FILTER: ALL, HOMBRE, MUJER, S/I */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                  Sexo del Difunto:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('ALL')}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedGender === 'ALL' ? '#7A1C2E' : '#cbd5e1',
                      background: selectedGender === 'ALL' ? '#7A1C2E' : '#ffffff',
                      color: selectedGender === 'ALL' ? '#ffffff' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Todos
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGender('HOMBRE')}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedGender === 'HOMBRE' ? '#7A1C2E' : '#cbd5e1',
                      background: selectedGender === 'HOMBRE' ? '#7A1C2E' : '#ffffff',
                      color: selectedGender === 'HOMBRE' ? '#ffffff' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Hombre
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGender('MUJER')}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedGender === 'MUJER' ? '#7A1C2E' : '#cbd5e1',
                      background: selectedGender === 'MUJER' ? '#7A1C2E' : '#ffffff',
                      color: selectedGender === 'MUJER' ? '#ffffff' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Mujer
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGender('SI')}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedGender === 'SI' ? '#7A1C2E' : '#cbd5e1',
                      background: selectedGender === 'SI' ? '#7A1C2E' : '#ffffff',
                      color: selectedGender === 'SI' ? '#ffffff' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    S/I
                  </button>
                </div>
              </div>

              {/* DATE RANGE INPUTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                    Desde:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      color: '#1e293b',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                    Hasta:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      color: '#1e293b',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. RESULTS LIST SECTION (PLACED NATURALLY DIRECTLY UNDERNEATH FILTERS) */}
          {isOpen && results.length > 0 && (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div className="results-header">
                Coincidencias en BD ({results.length})
                {hasActiveStatusFilter && ` [${statusFilter}]`}
                {hasActiveDateFilter && ' [Fechas]'}
                {hasActiveGenderFilter && ` [${selectedGender}]`}
              </div>
              {results.map((item, idx) => {
                const rawTitle = item.difunto || (item.propietario ? `Titular: ${item.propietario}` : `Lote #${item.lote}`);
                const cleanSeccion = item.seccion
                  ? (item.seccion.toLowerCase().startsWith('sección') || item.seccion.toLowerCase().startsWith('seccion')
                    ? item.seccion
                    : `Sección ${item.seccion}`)
                  : 'Sección A';
                const subtitle = `Lote #${item.lote || 'N/A'} • ${cleanSeccion}${item.numero_nivel ? ` • Nivel #${item.numero_nivel}` : ''}`;

                return (
                  <div
                    key={`search-item-${item.difunto_id || 'd'}-${item.lote_id || 'l'}-${item.numero_nivel || 0}-${idx}`}
                    className="search-result-item"
                    onClick={() => handleSelectResult(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}
                  >
                    <MapPin size={16} className="result-pin-icon" style={{ flexShrink: 0, color: '#7A1C2E' }} />
                    <div className="result-info" style={{ flex: 1, minWidth: 0 }}>
                      <span className="result-title" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1e293b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {renderHighlightedText(rawTitle, searchTerm)}
                      </span>
                      <span className="result-subtitle" style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                        {renderHighlightedText(subtitle, searchTerm)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. NO MATCHES MESSAGE */}
          {isOpen && results.length === 0 && (hasSearch || hasAnyFilter) && (
            <div className="no-results-msg" style={{ padding: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
              No se encontraron registros en la Base de Datos PostgreSQL
              {hasSearch ? ` con "${searchTerm}"` : ''}
              {hasActiveStatusFilter ? ` para estado ${statusFilter}` : ''}
              {hasActiveGenderFilter ? ` para ${selectedGender}` : ''}
              {hasActiveDateFilter ? ` en el rango de fechas` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
