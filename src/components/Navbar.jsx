import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, RefreshCw } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar({ onSelectCemetery, onGoHome, userSession, onLogin, onLogout }) {
  const [showCemeteriesDropdown, setShowCemeteriesDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);

  const cemeteriesList = [
    { id: 'barrillas', name: 'Lomas de Barrillas', active: true },
    { id: 'san_jose', name: 'Antiguo "San José"', active: false },
    { id: 'jardin', name: 'Jardín', active: false },
    { id: 'allende', name: 'Allende', active: false },
    { id: 'mundo_nuevo', name: 'Mundo Nuevo', active: false }
  ];

  // Close user menu popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

          {/* TRÁMITES - DIRECT EXTERNAL LINK TO OFFICIAL GOVT PORTAL */}
          <a
            href="https://tramites.coatzacoalcos.gob.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ textDecoration: 'none' }}
            title="Ir al Portal Oficial de Trámites del Municipio de Coatzacoalcos"
          >
            <span>Trámites</span>
          </a>

          {/* GOOGLE-STYLE AUTHENTICATION HEADER ITEM */}
          {userSession ? (
            /* STATE 2: LOGGED IN - GOOGLE PROFILE AVATAR CIRCLE */
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                title={userSession.name || 'Cuenta de usuario'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {/* CIRCULAR PROFILE AVATAR PHOTO / ICON */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: userSession.role === 'admin' ? 'linear-gradient(135deg, #7A1C2E, #4A111C)' : 'linear-gradient(135deg, #2563EB, #1E40AF)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    border: '2px solid #ffffff'
                  }}
                >
                  {userSession.role === 'admin' ? 'A' : 'U'}
                </div>
              </button>

              {/* GOOGLE-STYLE ACCOUNT DROPDOWN POPOVER MENU */}
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '260px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    border: '1px solid #cbd5e1',
                    padding: '18px 16px',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  {/* LARGE AVATAR */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: userSession.role === 'admin' ? '#7A1C2E' : '#2563EB',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.4rem',
                      marginBottom: '10px'
                    }}
                  >
                    {userSession.role === 'admin' ? 'A' : 'U'}
                  </div>

                  <strong style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '2px' }}>
                    {userSession.name}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                    {userSession.email}
                  </span>

                  <div style={{ width: '100%', height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

                  {/* ACTION BUTTONS */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLoginModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Cambiar de Cuenta</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #FCA5A5',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 1: NOT LOGGED IN - GOOGLE STYLE CLEAN "Acceder" TEXT LINK ONLY */
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#7A1C2E',
                fontSize: '0.96rem',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Acceder
            </button>
          )}
        </nav>
      </div>

      {/* DECORATIVE STRIP */}
      <div className="header-bottom-strip">
        <div className="gold-bar"></div>
        <div className="red-strip"></div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(session) => {
            if (onLogin) onLogin(session);
          }}
        />
      )}
    </header>
  );
}
