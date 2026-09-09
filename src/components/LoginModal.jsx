import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, CheckCircle2 } from 'lucide-react';

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInSuccess, setLoggedInSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const inputUser = email.trim().toLowerCase();
    const inputPass = password.trim().toLowerCase();

    // Admin role if user contains 'admin'
    const isAdmin = inputUser.includes('admin') || inputPass.includes('admin');
    const userRole = isAdmin ? 'admin' : 'public';
    const userName = isAdmin ? 'Admin' : 'Usuario';
    const userEmail = email.trim() || (isAdmin ? 'admin@coatzacoalcos.gob.mx' : 'Corre@Ejemplo.com');

    setLoggedInSuccess(true);
    setTimeout(() => {
      onLoginSuccess({
        role: userRole,
        name: userName,
        email: userEmail
      });
      onClose();
    }, 400);
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* ELEGANT RED GRADIENT HEADER WITH CRISP WHITE LOGO SILHOUETTE */}
        <div style={{
          background: 'linear-gradient(135deg, #7A1C2E 0%, #B91C1C 100%)',
          padding: '18px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/Logodescansodigno.png"
              alt="Descanso Digno"
              style={{
                height: '38px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                Iniciar Sesión
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: '700' }}>
                H. Ayuntamiento de Coatzacoalcos
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '24px' }}>
          {loggedInSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#059669' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>¡Inicio de Sesión Exitoso!</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Cargando perfil...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* CAMPO CORREO ELECTRÓNICO */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Correo Electrónico:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Corre@Ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* CAMPO CONTRASEÑA */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contraseña:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* BOTÓN INICIAR SESIÓN */}
              <button
                type="submit"
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7A1C2E, #4A111C)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(122, 28, 46, 0.25)'
                }}
              >
                Iniciar Sesión
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
