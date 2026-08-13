import React from 'react';
import { X, User, Calendar, Phone, MapPin, ShieldCheck, Info, Tag, Receipt, Hash } from 'lucide-react';

export default function TumbaDrawer({ tumba, onClose }) {
  if (!tumba) return null;

  const props = tumba.properties || {};

  return (
    <aside className="tumba-drawer-block">
      {/* DRAWER HEADER BAR */}
      <div className="drawer-header">
        <div className="drawer-header-top">
          <span className="drawer-badge">Ficha Catastral de Fosa</span>
          <button className="drawer-close-btn" onClick={onClose} title="Cerrar Panel Lateral">
            <X size={18} />
          </button>
        </div>

        <span className="drawer-section-info">
          Sección {props.seccion || 'A'} — Lote #{props.lote || 'N/A'}
        </span>

        <h3 className="drawer-difunto-title">
          {props.difunto || 'Registro Inhumado'}
        </h3>
      </div>

      {/* DRAWER BODY DETAILS */}
      <div className="drawer-body">
        {/* STATS STRIP */}
        <div className="drawer-stats-grid">
          <div className="drawer-stat">
            <span className="stat-lbl"><Hash size={11} /> FOLIO</span>
            <span className="stat-val">#{props.folio || 'N/A'}</span>
          </div>
          <div className="drawer-stat">
            <span className="stat-lbl"><Receipt size={11} /> RECIBO</span>
            <span className="stat-val maroon">{props.recibo || 'N/A'}</span>
          </div>
          <div className="drawer-stat">
            <span className="stat-lbl"><Tag size={11} /> TRÁMITE</span>
            <span className="stat-val green">{props.tipoTramite || 'Perpetuidad'}</span>
          </div>
        </div>

        {/* DETAILS LIST */}
        <div className="drawer-details-list">
          {/* FECHA DE DEFUNCIÓN */}
          <div className="detail-item">
            <div className="detail-icon-box maroon-bg">
              <Calendar size={18} className="maroon" />
            </div>
            <div>
              <span className="detail-lbl">FECHA DE DEFUNCIÓN</span>
              <span className="detail-val">{props.fechaDifuncion || 'Sin registro'}</span>
            </div>
          </div>

          {/* TITULAR / PROPIETARIO */}
          <div className="detail-item">
            <div className="detail-icon-box gold-bg">
              <User size={18} className="gold" />
            </div>
            <div>
              <span className="detail-lbl">TITULAR DE LA PERPETUIDAD</span>
              <span className="detail-val">{props.propietario || 'No especificado'}</span>
            </div>
          </div>

          {/* TELÉFONO Y VIGENCIA */}
          <div className="detail-grid-2">
            <div className="detail-item">
              <div className="detail-icon-box gray-bg">
                <Phone size={16} />
              </div>
              <div>
                <span className="detail-lbl">TELÉFONO</span>
                <span className="detail-val sm">{props.telefono || 'Sin datos'}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box green-bg">
                <ShieldCheck size={16} className="green" />
              </div>
              <div>
                <span className="detail-lbl">VIGENCIA</span>
                <span className="detail-val sm green">{props.vigenciaPerpetuidad || 'Vigente'}</span>
              </div>
            </div>
          </div>

          {/* DIRECCIÓN REGISTRADA */}
          {props.direccionTitular && (
            <div className="detail-item">
              <div className="detail-icon-box gray-bg">
                <MapPin size={16} />
              </div>
              <div>
                <span className="detail-lbl">DIRECCIÓN REGISTRADA</span>
                <span className="detail-val sm">{props.direccionTitular}</span>
              </div>
            </div>
          )}

          {/* OBSERVACIONES */}
          {props.observacion && (
            <div className="drawer-obs-box">
              <div className="obs-header">
                <Info size={14} />
                <span>OBSERVACIONES DE CAMPO</span>
              </div>
              <p className="obs-body">{props.observacion}</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="drawer-footer">
        <span>Catastro H. Ayuntamiento de Coatzacoalcos</span>
      </div>
    </aside>
  );
}
