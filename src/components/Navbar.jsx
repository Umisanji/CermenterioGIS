import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';

export default function Navbar({ onSelectCemetery, onGoHome }) {
  const [showCemeteriesDropdown, setShowCemeteriesDropdown] = useState(false);
  const [showTramitesDropdown, setShowTramitesDropdown] = useState(false);

  const cemeteriesList = [
    { id: 'barrillas', name: 'Panteón Lomas de Barrillas' },
    { id: 'san_jose', name: 'Panteón Municipal "San José"' },
    { id: 'jardin', name: 'Panteón Jardín' },
    { id: 'allende', name: 'Panteón Allende' },
    { id: 'mundo_nuevo', name: 'Panteón Mundo Nuevo' }
  ];

  return (
    <header className="coatza-header">
      <div className="header-top-row">
        {/* LOGOS BRAND GROUP ON LEFT - CLICKS TO GO HOME */}
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

        {/* RIGHT NAVIGATION ITEMS ALIGNED FULL RIGHT */}
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
                <div className="dropdown-header">Selecciona un Cementerio:</div>
                {cemeteriesList.map((cem) => (
                  <div 
                    key={cem.id}
                    className="dropdown-item"
                    onClick={() => {
                      onSelectCemetery(cem.id);
                      setShowCemeteriesDropdown(false);
                    }}
                  >
                    <span>{cem.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRAMITES DROPDOWN */}
          <div className="dropdown-wrapper">
            <button 
              className="nav-item dropdown-btn"
              onClick={() => {
                setShowTramitesDropdown(!showTramitesDropdown);
                setShowCemeteriesDropdown(false);
              }}
            >
              <span>Trámites</span>
              <ChevronDown size={18} />
            </button>

            {showTramitesDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">Consulta de Perpetuidad</div>
                <div className="dropdown-item">Refrendo de Derechos</div>
                <div className="dropdown-item">Registro de Inhumación</div>
                <div className="dropdown-item">Regularización de Titular</div>
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
