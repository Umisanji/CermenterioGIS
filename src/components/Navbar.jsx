import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { TRAMITES_PANTEONES } from '../data/tramitesData';

export default function Navbar({ onSelectCemetery, onGoHome, onSelectTramite }) {
  const [showCemeteriesDropdown, setShowCemeteriesDropdown] = useState(false);
  const [showTramitesDropdown, setShowTramitesDropdown] = useState(false);

  const cemeteriesList = [
    { id: 'barrillas', name: 'Lomas de Barrillas', active: true },
    { id: 'san_jose', name: 'Antiguo "San José"', active: false },
    { id: 'jardin', name: 'Jardín', active: false },
    { id: 'allende', name: 'Allende', active: false },
    { id: 'mundo_nuevo', name: 'Mundo Nuevo', active: false }
  ];

  return (
    <header className="coatza-header">
      <div className="header-top-row">
        <div
          className="brand-group"
          onClick={onGoHome}
          style={{ cursor: 'pointer' }}
          title="Regresar a Inicio — Descanso Digno"
        >
          {/* LOGO DESCANSO DIGNO IMAGE */}
          <img
            src="/Logodescansodigno.png"
            alt="Logo Descanso Digno"
            className="descanso-logo-img"
          />

          {/* DESCANSO DIGNO TEXT */}
          <div className="descanso-text">
            <span className="title">Descanso</span>
            <span className="subtitle">Digno</span>
          </div>

          <div className="vertical-divider"></div>

          {/* OFFICIAL COATZA GOVT LOGO */}
          <img
            src="/Logo-Coatza-26.png"
            alt="Gobierno Coatzacoalcos 2026-2029"
            className="govt-logo-img"
          />
        </div>

        <nav className="nav-menu full-right">
          {/* CEMENTERIOS DROPDOWN */}
          <div className="dropdown-wrapper">
            <button
              className={`nav-item dropdown-btn ${showCemeteriesDropdown ? 'active' : ''}`}
              onClick={() => {
                setShowCemeteriesDropdown(!showCemeteriesDropdown);
                setShowTramitesDropdown(false);
              }}
            >
              <span>Cementerios</span>
              <ChevronDown size={18} />
            </button>

            {showCemeteriesDropdown && (
              <div className="dropdown-menu">
                {cemeteriesList.map((cem) => (
                  <div
                    key={cem.id}
                    className={`dropdown-item ${!cem.active ? 'disabled-item' : ''}`}
                    onClick={() => {
                      if (!cem.active) return;
                      onSelectCemetery(cem.id);
                      setShowCemeteriesDropdown(false);
                    }}
                    style={{
                      opacity: cem.active ? 1 : 0.45,
                      cursor: cem.active ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{cem.name}</span>
                    {!cem.active && (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginLeft: '12px' }}>
                        (Próximamente)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRAMITES DROPDOWN */}
          <div className="dropdown-wrapper">
            <button
              className={`nav-item dropdown-btn ${showTramitesDropdown ? 'active' : ''}`}
              onClick={() => {
                setShowTramitesDropdown(!showTramitesDropdown);
                setShowCemeteriesDropdown(false);
              }}
            >
              <span>Trámites</span>
              <ChevronDown size={18} />
            </button>

            {showTramitesDropdown && (
              <div className="dropdown-menu tramites-dropdown">
                {TRAMITES_PANTEONES.map((tramite) => (
                  <div
                    key={tramite.id}
                    className="dropdown-item tramite-dropdown-item"
                    onClick={() => {
                      if (onSelectTramite) {
                        onSelectTramite(tramite.id);
                      }
                      setShowTramitesDropdown(false);
                    }}
                  >
                    <div className="tramite-item-info">
                      <span className="tramite-item-title">{tramite.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INICIAR SESIÓN */}
          <button className="nav-item login-btn">
            <span>Iniciar sesión</span>
            <div className="user-icon-box">
              <User size={18} />
            </div>
          </button>
        </nav>
      </div>

      {/* DECORATIVE STRIP */}
      <div className="header-bottom-strip">
        <div className="gold-bar"></div>
        <div className="red-strip"></div>
      </div>
    </header>
  );
}

