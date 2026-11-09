import React, { useState } from 'react';
import { X, Image as ImageIcon, Link, Upload, Save, AlertTriangle } from 'lucide-react';

export default function AddPhotoModal({ lote, onClose, onPhotoAdded }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'url'
  const [fileName, setFileName] = useState('');

  // Handle direct file selection from device / camera
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setErrorMessage('');
    setPreviewError(false);

    // Instant local preview via Blob URL (0ms processing time)
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputMode === 'upload' && !selectedFile) {
      setErrorMessage('Selecciona un archivo de imagen para continuar');
      return;
    }

    if (inputMode === 'url' && !photoUrl.trim()) {
      setErrorMessage('Ingresa un enlace o URL de imagen válido');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    let requestPromise;

    if (inputMode === 'upload' && selectedFile) {
      // 1. Send native binary stream via Multipart FormData (handled directly by Multer)
      const formData = new FormData();
      formData.append('foto', selectedFile);

      requestPromise = fetch(`/api/tumbas/${lote}/fotos`, {
        method: 'POST',
        body: formData
      });
    } else {
      // 2. Send JSON payload for web URL
      requestPromise = fetch(`/api/tumbas/${lote}/fotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoUrl: photoUrl.trim() })
      });
    }

    requestPromise
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Error al guardar foto en la base de datos');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSaving(false);
        if (onPhotoAdded) onPhotoAdded(data.foto);
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        setErrorMessage(err.message || 'Error de conexión al guardar la foto.');
      });
  };

  const currentPreview = inputMode === 'upload' ? previewSrc : photoUrl;

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
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        maxWidth: '460px',
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
            <ImageIcon size={20} color="#FCD34D" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                Agregar Foto de Tumba
              </h3>
              <span style={{ fontSize: '0.74rem', opacity: 0.85 }}>Lote No. {lote}</span>
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

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE SELECTOR */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setInputMode('upload');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: inputMode === 'upload' ? '#ffffff' : 'transparent',
                color: inputMode === 'upload' ? '#7A1C2E' : '#64748b',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: inputMode === 'upload' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Upload size={16} />
              <span>Subir desde Dispositivo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('url');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: inputMode === 'url' ? '#ffffff' : 'transparent',
                color: inputMode === 'url' ? '#7A1C2E' : '#64748b',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: inputMode === 'url' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Link size={16} />
              <span>Enlace / URL</span>
            </button>
          </div>

          {/* MODE 1: FILE UPLOAD ZONE */}
          {inputMode === 'upload' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                Archivo de Imagen (JPG, PNG, JPEG o WEBP):
              </label>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  textAlign: 'center'
                }}
              >
                <Upload size={28} color="#7A1C2E" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                  {fileName ? fileName : 'Haz clic para seleccionar foto de la tumba'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Cámara o galería (subida directa y segura a PostgreSQL)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* MODE 2: URL INPUT */}
          {inputMode === 'url' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                URL directa de la fotografía:
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPreviewError(false);
                  setErrorMessage('');
                }}
                placeholder="https://ejemplo.com/tumba_lote_3252.jpg"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* PREVIEW CONTAINER */}
          {currentPreview && (
            <div style={{ marginTop: '2px' }}>
              <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                Vista Previa de la Fotografía:
              </span>
              <div style={{
                height: '150px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #cbd5e1',
                position: 'relative',
                background: '#f1f5f9'
              }}>
                <img
                  src={currentPreview}
                  alt="Vista previa"
                  onError={() => setPreviewError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {previewError && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(254, 242, 242, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <AlertTriangle size={24} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>No se pudo cargar la imagen</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
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
              disabled={saving || (!selectedFile && !photoUrl)}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: (selectedFile || photoUrl) && !saving ? 'linear-gradient(135deg, #7A1C2E, #4A111C)' : '#cbd5e1',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: (selectedFile || photoUrl) && !saving ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Guardando en BD...' : 'Guardar Fotografía'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
