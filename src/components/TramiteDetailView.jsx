import React, { useEffect } from 'react';
import { Clock, FileText } from 'lucide-react';
import { TRAMITES_PANTEONES } from '../data/tramitesData';

export default function TramiteDetailView({ selectedTramiteId }) {
  const activeTramite =
    TRAMITES_PANTEONES.find((t) => t.id === selectedTramiteId) || TRAMITES_PANTEONES[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTramiteId]);

  return (
    <div className="tramite-page">
      {/* BANNER CON FONDO GUINDA OFICIAL */}
      <section
        className="tramite-hero"
        style={{
          backgroundImage: `url('/Fondo guinda.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="tramite-hero-inner">
          <h1 className="tramite-title-main">{activeTramite.title}</h1>
          <p className="tramite-desc-main">{activeTramite.description}</p>

          <div className="hero-chips-row">
            <div className="hero-chip">
              <Clock size={15} />
              <span><strong>Vigencia:</strong> {activeTramite.vigencia}</span>
            </div>

            <div className="hero-chip">
              <FileText size={15} />
              <span><strong>Atención:</strong> {activeTramite.tiempoRespuesta}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO MINIMALISTA */}
      <div className="tramite-container">

        {/* NOTA IMPORTANTE */}
        {activeTramite.notasImportantes && (
          <div className="tramite-notice">
            <p>
              <strong>Nota:</strong> {activeTramite.notasImportantes}
            </p>
          </div>
        )}

        {/* GRILLA DE INFORMACIÓN */}
        <div className="tramite-grid">
          {/* COLUMNA 1: DOCUMENTOS / PAPELES */}
          <div className="tramite-card">
            <h2>Papeles y Documentos Requeridos</h2>

            <div className="doc-group">
              <h3>Presentar en el Panteón:</h3>
              <ul className="clean-list">
                {activeTramite.requisitosPanteon.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {activeTramite.requisitosRegistroCivil && activeTramite.requisitosRegistroCivil.length > 0 && (
              <div className="doc-group">
                <h3>Presentar en Registro Civil:</h3>
                <ul className="clean-list">
                  {activeTramite.requisitosRegistroCivil.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* COLUMNA 2: COSTOS Y PASOS */}
          <div className="tramite-card">
            <h2>Pago de Derechos y Tarifas</h2>

            <div className="price-list">
              {activeTramite.costos.map((costo, idx) => (
                <div key={idx} className="price-row">
                  <span className="price-name">{costo.concepto}</span>
                  <span className="price-val">{costo.monto}</span>
                </div>
              ))}
            </div>

            {activeTramite.fundamentoLegal && (
              <p className="legal-note">
                <strong>Fundamento Jurídico:</strong> {activeTramite.fundamentoLegal}
              </p>
            )}

            <h2 style={{ marginTop: '28px' }}>Procedimiento</h2>
            <ol className="clean-steps">
              {activeTramite.pasos.map((paso, idx) => (
                <li key={idx}>
                  <span className="step-idx">{idx + 1}.</span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* FOOTER COATZA */}
      <footer className="coatza-footer">
        <div className="footer-content">
          <p>© 2026 H. Ayuntamiento de Coatzacoalcos, Veracruz. Todos los derechos reservados.</p>
          <p className="footer-sub">Plataforma de Gestión Inteligente de Cementerios</p>
        </div>
      </footer>
    </div>
  );
}
