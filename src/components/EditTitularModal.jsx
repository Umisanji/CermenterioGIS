import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';

export default function EditTitularModal({ tumba, onClose, onSaveSuccess }) {
  const props = tumba?.properties || {};
  const loteId = props.lote || props.identificador;

  const [nombre, setNombre] = useState(props.titularNombre || (props.propietario ? props.propietario.split(' ')[0] : ''));
  const [apellidoPaterno, setApellidoPaterno] = useState(props.titularAppPaterno || (props.propietario ? props.propietario.split(' ').slice(1, 2).join(' ') : ''));
  const [apellidoMaterno, setApellidoMaterno] = useState(props.titularAppMaterno || (props.propietario ? props.propietario.split(' ').slice(2).join(' ') : ''));
  const [telefono, setTelefono] = useState(props.telefono || '');
  const [direccion, setDireccion] = useState(props.direccionTitular || '');
  const [observacion, setObservacion] = useState(props.observacion || '');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    fetch(`/api/tumbas/${loteId}/titular`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        observacion: observacion.trim() || null
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al actualizar datos del titular');
        return res.json();
      })
      .then(() => {
        setSaving(false);
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        setErrorMsg(err.message || 'Error de conexión con la base de datos');
      });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #7A1C2E, #4A111C)',
          padding: '16px 20px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#FCD34D" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                Datos del Titular y Fosa
              </h3>
              <span style={{ fontSize: '0.74rem', opacity: 0.85 }}>Lote No. {loteId} (Sec. {props.seccion || 'A'})</span>
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

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* NOMBRE Y APELLIDOS DEL TITULAR */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
              Nombre(s) del Titular / Propietario
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Alba"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                Apellido Paterno
              </label>
              <input
                type="text"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                placeholder="Ej. Rivera"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                Apellido Materno
              </label>
              <input
                type="text"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                placeholder="Ej. Zarate"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* TELÉFONO Y DIRECCIÓN */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
              <Phone size={14} color="#7A1C2E" />
              <span>Teléfono de Contacto</span>
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 9212230524"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
              <MapPin size={14} color="#7A1C2E" />
              <span>Dirección del Titular</span>
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej. Calle Costa Rica 422, Col. Tierra y Libertad"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* OBSERVACIONES DE CAMPO / ESTADO BÓVEDA */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
              <FileText size={14} color="#64748b" />
              <span>Observaciones de Campo / Estado de Bóveda</span>
            </label>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Bóveda en segunda, color blanco, 2 floreros, cruz de madera..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7A1C2E, #4A111C)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Guardando en BD...' : 'Guardar Datos del Titular'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
