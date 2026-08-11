import React from 'react';
import { X, User, Calendar, FileText, Phone, MapPin, ShieldCheck, Info } from 'lucide-react';

export default function TumbaModal({ tumba, onClose }) {
  if (!tumba) return null;

  const props = tumba.properties || {};

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out'
        }}
      >
        {/* HEADER BAR */}
        <div style={{
          background: 'linear-gradient(135deg, #7A1C2E 0%, #581220 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justify-content: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'linear-gradient(90deg, #C49A45, #8B5E34)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}>
              Ficha Catastral de Fosa
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
              Sección {props.seccion || 'A'} — Lote #{props.lote}
            </span>
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            {props.difunto || 'Registro Inhumado'}
          </h3>
        </div>

        {/* BODY DETAILS */}
        <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* TOP GRID STATS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
            background: '#f8fafc',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>FOLIO</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>#{props.folio || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>RECIBO</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#7A1C2E' }}>{props.recibo || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TRÁMITE</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#059669' }}>{props.tipoTramite || 'Perpetuidad'}</div>
            </div>
          </div>

          {/* DETAIL ROWS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* DEFUNCIÓN */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(122, 28, 46, 0.08)', borderRadius: '8px', color: '#7A1C2E' }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>FECHA DE DEFUNCIÓN</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{props.fechaDifuncion || 'Sin registro'}</div>
              </div>
            </div>

            {/* PROPIETARIO / TITULAR */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(196, 154, 69, 0.12)', borderRadius: '8px', color: '#8B5E34' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TITULAR DE LA PERPETUIDAD</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{props.propietario || 'No especificado'}</div>
              </div>
            </div>

            {/* TELÉFONO Y VIGENCIA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                  <Phone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>TELÉFONO</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155' }}>{props.telefono || 'Sin datos'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', color: '#059669' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>VIGENCIA PERPETUIDAD</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#059669' }}>{props.vigenciaPerpetuidad || 'Vigente'}</div>
                </div>
              </div>
            </div>

            {/* DIRECCIÓN TITULAR */}
            {props.direccionTitular && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DIRECCIÓN REGISTRADA</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>{props.direccionTitular}</div>
                </div>
              </div>
            )}

            {/* OBSERVACIONES */}
            {props.observacion && (
              <div style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                padding: '12px 14px',
                borderRadius: '10px',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: '#8c6b00', marginBottom: '4px' }}>
                  <Info size={14} />
                  <span>OBSERVACIONES DE CAMPO:</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#594400', lineHeight: 1.45, fontWeight: '500' }}>
                  {props.observacion}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          justify-content: 'space-between',
          align-items: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
            H. Ayuntamiento de Coatzacoalcos — Catastro de Cementerios
          </span>
          <button 
            onClick={onClose}
            style={{
              background: '#7A1C2E',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
}
