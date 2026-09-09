import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function HomeView() {
  return (
    <div className="home-container">

      {/* HERO BANNER */}
      <section
        className="hero-banner-proposal"
        style={{
          position: 'relative',
          width: '100%',
          height: '460px',
          backgroundImage: `url('/banner_home_escolleras.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 68%',
          display: 'flex',
          alignItems: 'center',
          borderTop: '3px solid #7A1C2E',
          overflow: 'hidden'
        }}
      >
        {/* SOFT LEFT-TO-RIGHT GRADIENT OVERLAY */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.45) 40%, rgba(15, 23, 42, 0) 75%)'
          }}
        />

        {/* LEFT TYPOGRAPHY BLOCK */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            paddingLeft: '60px',
            paddingRight: '20px',
            maxWidth: '650px',
            color: '#ffffff'
          }}
        >
          {/* MAIN TITLE */}
          <h1
            style={{
              fontSize: '3.8rem',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 14px 0',
              color: '#ffffff',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              lineHeight: '1.05'
            }}
          >
            DESCANSO DIGNO
          </h1>

          <p style={{ fontSize: '0.98rem', lineHeight: '1.6', color: '#f8fafc', maxWidth: '540px', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Plataforma digital para la gestión catastral inteligente de los cementerios municipales de Coatzacoalcos, fotogrametría aérea y consulta de lotes para la ciudadanía.
          </p>
        </div>
      </section>

      {/* SECCIÓN CON EL FONDO GUINDA Y TEXTO 100% BLANCO */}
      <section
        className="about-section"
        style={{
          backgroundImage: `url('/Fondo guinda.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '60px 40px',
          color: '#ffffff'
        }}
      >
        <div className="about-content-wrapper">
          <div className="about-text-box">
            <h2 className="about-title" style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', margin: '0 0 12px 0', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              ¿Qué es Descanso Digno?
            </h2>
            <p className="about-description" style={{ fontSize: '1rem', lineHeight: '1.7', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Es el programa de modernización y regularización catastral de los cementerios municipales de Coatzacoalcos.
              Permite garantizar la certeza jurídica de las perpetuidades, digitalizar el registro histórico de inhumaciones
              y brindar a las familias un mapa interactivo en alta definición para ubicar y consultar la situación de sus seres queridos.
            </p>

            <div className="about-highlights" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div className="highlight-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '16px 20px', borderRadius: '14px' }}>
                <ShieldCheck size={24} className="highlight-icon" style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>Certeza Jurídica</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#f1f5f9' }}>Regularización de títulos de perpetuidad y control administrativo.</p>
                </div>
              </div>

              <div className="highlight-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '16px 20px', borderRadius: '14px' }}>
                <MapPin size={24} className="highlight-icon" style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>Fotografía Aérea</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#f1f5f9' }}>Los 5 panteones del municipio.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-image-box">
            <img
              src="/Panteon.jpeg"
              alt="Vista aérea de cementerio Coatzacoalcos"
              className="inset-photo"
            />
            <div className="image-caption">
              <span style={{ color: '#ffffff' }}>Inspección fotogramétrica — Coatzacoalcos, Ver.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="coatza-footer">
        <div className="footer-content">
          <p>© 2026 H. Ayuntamiento de Coatzacoalcos, Veracruz. Todos los derechos reservados.</p>
          <p className="footer-sub">Plataforma de Gestión Inteligente de Cementerios</p>
        </div>
      </footer>

    </div>
  );
}
