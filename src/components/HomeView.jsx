import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function HomeView() {
  return (
    <div className="home-container">

      {/* Banner */}
      <section
        className="hero-banner"
        style={{
          backgroundImage: `url('/Escolleras2.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="hero-bg-overlay"></div>

        {/* Barra semitransparente */}
        <div className="hero-box">
          <h1 className="hero-title">Descanso Digno</h1>
          <p className="hero-description">
            Bienvenido a <strong>Descanso Digno</strong> del Municipio de Coatzacoalcos, Veracruz. Una
            plataforma digital desarrollada para la gestión catastral inteligente de nuestros cementerios municipales,
            consulta de lotes georeferenciados con fotogrametría aérea de dron e información de trámites de perpetuidades
            para la ciudadanía.
          </p>
        </div>
      </section>

      {/* Fondo guinda */}
      <section
        className="about-section"
        style={{
          backgroundImage: `url('/Fondo guinda.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="about-content-wrapper">
          <div className="about-text-box">
            <h2 className="about-title">¿Qué es Descanso Digno?</h2>
            <p className="about-description">
              Es el programa de modernización y regularización catastral de los cementerios municipales de Coatzacoalcos.
              Permite garantizar la certeza jurídica de las perpetuidades, digitalizar el registro histórico de inhumaciones
              y brindar a las familias un mapa interactivo en alta definición para ubicar y consultar la situación de sus seres queridos.
            </p>

            <div className="about-highlights">
              <div className="highlight-card">
                <ShieldCheck size={20} className="highlight-icon" />
                <div>
                  <h4>Certeza Jurídica</h4>
                  <p>Regularización de títulos de perpetuidad y control administrativo.</p>
                </div>
              </div>
              <div className="highlight-card">
                <MapPin size={20} className="highlight-icon" />
                <div>
                  <h4>Fotografía Aérea</h4>
                  <p>Los 5 panteones del municipio.</p>
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
              <span>Inspección fotogramétrica — Coatzacoalcos, Ver.</span>
            </div>
          </div>
        </div>
      </section>

      {/* foto */}
      <footer className="coatza-footer">
        <div className="footer-content">
          <p>© 2026 H. Ayuntamiento de Coatzacoalcos, Veracruz. Todos los derechos reservados.</p>
          <p className="footer-sub">Plataforma de Gestión Inteligente de Cementerios</p>
        </div>
      </footer>

    </div>
  );
}
