import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, Image as ImageIcon, Plus, User, Phone, MapPin, AlertTriangle, GripVertical, CheckCircle2, Trash2, Save, RotateCcw, Edit2, ZoomIn, FileText } from 'lucide-react';
import AddDifuntoModal from './AddDifuntoModal';
import EditDifuntoModal from './EditDifuntoModal';
import EditTitularModal from './EditTitularModal';
import AddPhotoModal from './AddPhotoModal';

export default function TumbaDrawer({ tumba, onClose, userRole = 'admin', onTumbaUpdated }) {
  const initialProps = tumba?.properties || {};
  const [dbProps, setDbProps] = useState(initialProps);
  const [showAddDifuntoModal, setShowAddDifuntoModal] = useState(false);
  const [showEditTitularModal, setShowEditTitularModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingDifunto, setEditingDifunto] = useState(null);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState(null);
  const [expandedDifuntoId, setExpandedDifuntoId] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // REORDER MODE STATES & ANIMATION CONTROLS
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedList, setReorderedList] = useState([]);
  const [hasReorderedChanges, setHasReorderedChanges] = useState(false);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Fetch live relational SQL record from PostgreSQL database based on userRole ('public' vs 'admin')
  const fetchTumbaData = () => {
    if (!tumba) return;
    const loteId = initialProps.lote || initialProps.identificador;
    if (!loteId) return;

    fetch(`/api/tumbas/${loteId}?role=${userRole}`)
      .then((res) => {
        if (!res.ok) throw new Error('No en BD');
        return res.json();
      })
      .then((data) => {
        setDbProps((prev) => ({ ...prev, ...data }));
        if (data.difuntos && data.difuntos.length > 0) {
          setReorderedList(data.difuntos);
        }
      })
      .catch(() => {
        setDbProps(initialProps);
      });
  };

  useEffect(() => {
    fetchTumbaData();
  }, [tumba, userRole, initialProps.lote, initialProps.identificador]);

  if (!tumba) return null;

  const props = dbProps;
  const isPublicMode = userRole === 'public';
  const loteId = props.lote || props.identificador;

  // Extract list of deceased persons from PostgreSQL array or fallback to single property
  let difuntosList = isReorderMode ? reorderedList : (props.difuntos || []);
  if (difuntosList.length === 0 && props.difunto) {
    difuntosList = [
      {
        difunto_id: 1,
        numero_nivel: props.numeroNivel || 1,
        nombre: props.difunto,
        fecha_defuncion: props.fechaDifuncion,
        vigencia_perpetuidad: props.vigenciaPerpetuidad,
        sexo: props.sexoDifunto || 'HOMBRE',
        causa_deceso: null
      }
    ];
  }

  // Extract list of photos from PostgreSQL array and resolve URLs
  const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) {
      return `${url}`;
    }
    return url;
  };

  const fotosList = (props.fotos || []).map((f) => ({
    ...f,
    resolvedUrl: resolvePhotoUrl(f.foto_url)
  }));

  // Toggle Reorder Mode Switch
  const handleToggleReorderMode = () => {
    if (isPublicMode) return;
    if (isReorderMode) {
      setReorderedList(props.difuntos || []);
      setHasReorderedChanges(false);
      setIsReorderMode(false);
    } else {
      setReorderedList(props.difuntos || []);
      setHasReorderedChanges(false);
      setIsReorderMode(true);
    }
  };

  // Smooth real-time fluid drag-and-drop position swapping
  const handleDragStart = (e, index) => {
    if (isPublicMode || !isReorderMode) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (isPublicMode || !isReorderMode || draggedIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIdx !== index) {
      const updatedList = [...reorderedList];
      const [draggedItem] = updatedList.splice(draggedIdx, 1);
      updatedList.splice(index, 0, draggedItem);

      const reorderedWithNiveles = updatedList.map((item, idx) => ({
        ...item,
        numero_nivel: idx + 1
      }));

      setReorderedList(reorderedWithNiveles);
      setDraggedIdx(index);
      setHasReorderedChanges(true);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // CONFIRM & SAVE REORDERED LEVELS TO POSTGRESQL
  const handleConfirmReorder = () => {
    if (!hasReorderedChanges || isSavingReorder) return;
    setIsSavingReorder(true);

    const reorderedNivelesPayload = reorderedList.map((item, idx) => ({
      difunto_id: item.difunto_id,
      numero_nivel: idx + 1
    }));

    fetch(`/api/tumbas/${loteId}/reorder-niveles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niveles: reorderedNivelesPayload })
    })
      .then((res) => res.json())
      .then(() => {
        setIsSavingReorder(false);
        setHasReorderedChanges(false);
        setIsReorderMode(false);
        setReorderSuccessMsg(true);
        setTimeout(() => setReorderSuccessMsg(false), 3000);
        fetchTumbaData();
        if (onTumbaUpdated) onTumbaUpdated();
      })
      .catch((err) => {
        setIsSavingReorder(false);
        console.error('Error saving reordered levels:', err);
      });
  };

  // DELETE DECEASED HANDLER (CRUD DELETE)
  const handleDeleteDifunto = (d) => {
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar a "${d.nombre}" del Lote #${loteId}?`);
    if (!confirmDelete) return;

    fetch(`/api/tumbas/${loteId}/difuntos/${d.difunto_id}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al eliminar');
        return res.json();
      })
      .then(() => {
        setActionSuccessMsg(`Difunto "${d.nombre}" eliminado con éxito.`);
        setTimeout(() => setActionSuccessMsg(''), 3500);
        fetchTumbaData();
        if (onTumbaUpdated) onTumbaUpdated();
      })
      .catch((err) => {
        console.error('Error deleting deceased:', err);
        alert('No se pudo eliminar el registro de la base de datos.');
      });
  };

  // DELETE PHOTO HANDLER
  const handleDeletePhoto = (fotoId) => {
    const confirmDelete = window.confirm('¿Deseas eliminar esta fotografía?');
    if (!confirmDelete) return;

    fetch(`/api/fotos/${fotoId}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        if (selectedPhotoZoom?.foto_id === fotoId) setSelectedPhotoZoom(null);
        fetchTumbaData();
        if (onTumbaUpdated) onTumbaUpdated();
      })
      .catch((err) => console.error('Error deleting photo:', err));
  };

  // Determine missing items specifically for this tomb
  const missingItems = [];
  if (!props.vigenciaPerpetuidad && (!difuntosList[0] || !difuntosList[0].vigencia_perpetuidad)) missingItems.push('Vigencia de Perpetuidad sin registro');
  if (!props.folio) missingItems.push('Número de Folio Catastral faltante');
  if (!props.recibo) missingItems.push('Número o Comprobante de Recibo faltante');
  if (!props.propietario) missingItems.push('Titular de la fosa no especificado');
  if (difuntosList.length === 0) missingItems.push('Sin difuntos registrados en fosa');

  const heroPhotoUrl = fotosList.length > 0 ? fotosList[0].resolvedUrl : null;

  return (
    <>
      <aside
        className="tumba-drawer-block"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          maxHeight: '100%',
          width: '390px',
          maxWidth: '92vw',
          background: '#F8F6F6',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          boxShadow: '4px 0 25px rgba(0, 0, 0, 0.25)',
          borderRight: '1px solid #cbd5e1'
        }}
      >
        {/* 1. TOP HERO IMAGE HEADER CONTAINER */}
        <div style={{
          background: '#E8D8D7',
          height: '180px',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '3px solid #7A1C2E',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {/* TOP RIGHT CLOSE BUTTON */}
          <button
            onClick={onClose}
            title="Cerrar Panel"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
          >
            <X size={20} color="#4A3B3A" />
          </button>

          {/* HERO IMAGE OR PLACEHOLDER */}
          {heroPhotoUrl ? (
            <div
              onClick={() => setSelectedPhotoZoom(fotosList[0])}
              style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
              title="Clic para ver foto en tamaño completo"
            >
              <img
                src={heroPhotoUrl}
                alt={`Foto Lote ${loteId}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ZoomIn size={13} />
                <span>Ver</span>
              </div>
            </div>
          ) : (
            <div style={{
              width: '120px',
              height: '100px',
              background: 'rgba(168, 139, 138, 0.45)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ImageIcon size={48} color="#ffffff" opacity={0.9} />
            </div>
          )}
        </div>

        {/* 2. DRAWER BODY CONTENT */}
        <div style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>

          {/* LOTE TITLE & SECTION */}
          <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2d8d8', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#2D1519', fontFamily: 'sans-serif' }}>
              Lote No. {props.lote || 'N/A'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#665255', fontWeight: '600' }}>
              Sección {props.seccion || 'A'}
            </span>
          </div>

          {/* ADMIN DEDICATED BUTTON TO REGISTER NEW DECEASED */}
          {!isPublicMode && (
            <div style={{ marginBottom: '14px' }}>
              <button
                onClick={() => setShowAddDifuntoModal(true)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7A1C2E, #4A111C)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} />
                <span>Registrar Nuevo Difunto / Nivel</span>
              </button>
            </div>
          )}

          {/* ACTION / REORDER SUCCESS TOAST INDICATOR */}
          {(reorderSuccessMsg || actionSuccessMsg) && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(4, 120, 87, 0.15)' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{actionSuccessMsg || '¡Niveles actualizados y guardados en PostgreSQL!'}</span>
            </div>
          )}

          {/* 3. MULTI-LEVEL DECEASED SECTION ("DIFUNTOS") WITH FULL CRUD & REORDER TOGGLE SWITCH */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#2D1519' }}>
                Difuntos ({difuntosList.length})
              </h4>

              {/* REORDER TOGGLE SWITCH BUTTON (ADMIN ROLE ONLY) */}
              {!isPublicMode && difuntosList.length > 1 && (
                <div
                  className="reorder-switch-wrapper"
                  onClick={handleToggleReorderMode}
                  title={isReorderMode ? 'Desactivar modo reordenar' : 'Activar modo reordenar niveles por arrastre'}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isReorderMode ? '#7A1C2E' : '#64748b' }}>
                    Reordenar
                  </span>
                  <div className={`reorder-switch-bg ${isReorderMode ? 'active' : ''}`}>
                    <div className="reorder-switch-circle" />
                  </div>
                </div>
              )}
            </div>

            {difuntosList.length === 0 ? (
              <div style={{ padding: '12px', background: '#ffffff', borderRadius: '10px', fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Sin difuntos registrados en este lote.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {difuntosList.map((d, index) => {
                  const isExpanded = expandedDifuntoId === (d.difunto_id || index);
                  const sexoStr = String(d.sexo || '').toUpperCase();
                  const isMujer = sexoStr.includes('MUJER') || sexoStr.includes('FEMENINO') || sexoStr === 'F' || sexoStr === '2';
                  const isSI = sexoStr.includes('S/I') || sexoStr.includes('SI') || sexoStr.includes('SIN') || sexoStr === '3' || (!isMujer && !sexoStr.includes('HOMBRE') && !sexoStr.includes('MASCULINO') && sexoStr !== '1');
                  const isDraggingThis = draggedIdx === index;

                  return (
                    <div
                      key={d.difunto_id || index}
                      className={isReorderMode ? 'reorder-card-active' : ''}
                      draggable={!isPublicMode && isReorderMode}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: isReorderMode ? '1.5px solid #7A1C2E' : '1px solid #e2d8d8',
                        overflow: 'hidden',
                        opacity: isDraggingThis ? 0.35 : 1,
                        transform: isDraggingThis ? 'scale(0.98)' : 'scale(1)',
                        boxShadow: isDraggingThis ? '0 12px 24px rgba(122, 28, 46, 0.25)' : 'none',
                        transition: 'transform 0.22s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease, opacity 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isExpanded ? '#F5EAEA' : '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          {/* CLEAN GRIP HANDLE WHEN REORDER MODE IS ACTIVE */}
                          {!isPublicMode && isReorderMode && (
                            <div style={{ display: 'flex', alignItems: 'center', padding: '2px 4px', background: 'rgba(122, 28, 46, 0.08)', borderRadius: '6px' }}>
                              <GripVertical size={18} color="#7A1C2E" style={{ cursor: 'grab' }} />
                            </div>
                          )}
                          {isMujer ? (
                            <span style={{ fontSize: '1.05rem', color: '#BE185D', flexShrink: 0 }} title="Mujer">♀</span>
                          ) : isSI ? (
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', flexShrink: 0 }} title="Sin Identificar">S/I</span>
                          ) : (
                            <span style={{ fontSize: '1.05rem', color: '#1E40AF', flexShrink: 0 }} title="Hombre">♂</span>
                          )}
                          <div
                            onClick={() => {
                              if (!isReorderMode) {
                                setExpandedDifuntoId(isExpanded ? null : (d.difunto_id || index));
                              }
                            }}
                            style={{ cursor: !isReorderMode ? 'pointer' : 'grab', flex: 1 }}
                          >
                            <strong style={{ fontSize: '0.88rem', color: '#2D1519', display: 'block', lineHeight: '1.2' }}>
                              {d.nombre || 'Difunto Sin Registro'}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: isReorderMode ? '#7A1C2E' : '#887375', fontWeight: '800' }}>
                              Nivel #{d.numero_nivel || index + 1} {d.fecha_defuncion ? `• ${d.fecha_defuncion}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* ACTION BUTTONS (EDIT & DELETE IN NORMAL MODE, CHEVRON TO EXPAND) */}
                        {!isReorderMode && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {!isPublicMode && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDifunto(d);
                                  }}
                                  title="Editar datos del difunto"
                                  style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#334155'
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDifunto(d);
                                  }}
                                  title="Eliminar difunto de la fosa"
                                  style={{
                                    background: '#FEF2F2',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#DC2626'
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}

                            <ChevronRight
                              size={18}
                              color="#887375"
                              onClick={() => setExpandedDifuntoId(isExpanded ? null : (d.difunto_id || index))}
                              style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease', cursor: 'pointer', marginLeft: '4px' }}
                            />
                          </div>
                        )}
                      </div>

                      {isExpanded && !isReorderMode && (
                        <div style={{ padding: '10px 12px 12px 12px', borderTop: '1px solid #e2d8d8', background: '#FAF6F6', fontSize: '0.78rem', color: '#4A3B3A', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><strong>Sexo / Género:</strong> {isMujer ? 'Mujer' : isSI ? 'S/I (Sin Identificar)' : 'Hombre'}</div>
                          <div><strong>Fecha Defunción:</strong> {d.fecha_defuncion || 'Sin Fecha'}</div>
                          {!isPublicMode && <div><strong>Vigencia Perpetuidad:</strong> {d.vigencia_perpetuidad || 'Sin Registro'}</div>}
                          <div><strong>Causa Deceso:</strong> {d.causa_deceso || 'Sin Especificar'}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CONFIRMATION & CANCEL BUTTONS IN REORDER MODE */}
            {isReorderMode && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={handleToggleReorderMode}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Cancelar</span>
                </button>

                <button
                  onClick={handleConfirmReorder}
                  disabled={!hasReorderedChanges || isSavingReorder}
                  style={{
                    flex: 2,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: hasReorderedChanges && !isSavingReorder ? 'linear-gradient(135deg, #059669, #047857)' : '#cbd5e1',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: hasReorderedChanges && !isSavingReorder ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: hasReorderedChanges ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
                  }}
                >
                  <Save size={16} />
                  <span>{isSavingReorder ? 'Guardando en BD...' : 'Guardar'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. FIELD PHOTOS SECTION ("FOTOS") WITH ADD, DELETE & FULLSCREEN PREVIEW */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#2D1519' }}>
                Fotos ({fotosList.length})
              </h4>
              {!isPublicMode && (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #7A1C2E',
                    background: '#FFF5F5',
                    color: '#7A1C2E',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  <span>Agregar Foto</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {fotosList.map((foto, idx) => (
                <div
                  key={foto.foto_id || idx}
                  style={{
                    height: '80px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #d6c4c3',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedPhotoZoom(foto)}
                >
                  <img
                    src={foto.resolvedUrl}
                    alt={`Foto ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {!isPublicMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(foto.foto_id);
                      }}
                      title="Eliminar foto"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.88)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}

              {/* PLACEHOLDER SLOTS IF FEWER THAN 3 PHOTOS */}
              {Array.from({ length: Math.max(0, 3 - fotosList.length) }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  onClick={() => !isPublicMode && setShowPhotoModal(true)}
                  style={{
                    height: '80px',
                    background: '#E8D8D7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #c0adac',
                    cursor: !isPublicMode ? 'pointer' : 'default'
                  }}
                >
                  <ImageIcon size={24} color="#A88B8A" />
                </div>
              ))}
            </div>
          </div>

          {/* 5. CATASTRAL ADMIN DETAILS (DEDICATED TITULAR & FOSA SECTION) */}
          {!isPublicMode && (
            <div style={{ borderTop: '1px solid #e2d8d8', paddingTop: '14px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#7A1C2E' }}>
                  Datos Catastrales del Titular
                </h4>
                <button
                  onClick={() => setShowEditTitularModal(true)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit2 size={12} color="#7A1C2E" />
                  <span>Editar Titular</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#2D1519' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#7A1C2E" />
                  <span><strong>Titular:</strong> {props.propietario || 'Sin Registro'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#64748b" />
                  <span><strong>Teléfono:</strong> {props.telefono || 'Sin Teléfono'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#64748b" />
                  <span><strong>Dirección:</strong> {props.direccionTitular || 'Sin Dirección'}</span>
                </div>
                {props.observacion && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <FileText size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Observaciones:</strong> {props.observacion}</span>
                  </div>
                )}
              </div>

              {/* IRREGULAR ALERT CHECKLIST */}
              {missingItems.length > 0 && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: '800', fontSize: '0.75rem' }}>
                    <AlertTriangle size={14} color="#DC2626" />
                    <span>Pendientes por Regularizar ({missingItems.length}):</span>
                  </div>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '0.72rem', color: '#B91C1C', lineHeight: '1.35' }}>
                    {missingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* RENDER ALL MODALS & LIGHTBOX VIA CREATEPORTAL TO ROOT DOCUMENT.BODY */}
      {showAddDifuntoModal && createPortal(
        <AddDifuntoModal
          tumba={{ properties: props }}
          onClose={() => setShowAddDifuntoModal(false)}
          onSaveSuccess={() => {
            setActionSuccessMsg('¡Nuevo difunto registrado con éxito en PostgreSQL!');
            setTimeout(() => setActionSuccessMsg(''), 3500);
            fetchTumbaData();
            if (onTumbaUpdated) onTumbaUpdated();
          }}
        />,
        document.body
      )}

      {showEditTitularModal && createPortal(
        <EditTitularModal
          tumba={{ properties: props }}
          onClose={() => setShowEditTitularModal(false)}
          onSaveSuccess={() => {
            setActionSuccessMsg('¡Datos del titular y fosa actualizados con éxito!');
            setTimeout(() => setActionSuccessMsg(''), 3500);
            fetchTumbaData();
            if (onTumbaUpdated) onTumbaUpdated();
          }}
        />,
        document.body
      )}

      {editingDifunto && createPortal(
        <EditDifuntoModal
          difunto={editingDifunto}
          lote={loteId}
          onClose={() => setEditingDifunto(null)}
          onSaveSuccess={() => {
            setActionSuccessMsg('¡Datos del difunto actualizados con éxito!');
            setTimeout(() => setActionSuccessMsg(''), 3500);
            fetchTumbaData();
            if (onTumbaUpdated) onTumbaUpdated();
          }}
        />,
        document.body
      )}

      {showPhotoModal && createPortal(
        <AddPhotoModal
          lote={loteId}
          onClose={() => setShowPhotoModal(false)}
          onPhotoAdded={() => {
            setActionSuccessMsg('¡Fotografía guardada con éxito en PostgreSQL!');
            setTimeout(() => setActionSuccessMsg(''), 3500);
            fetchTumbaData();
            if (onTumbaUpdated) onTumbaUpdated();
          }}
        />,
        document.body
      )}

      {/* FULLSCREEN PHOTO ZOOM LIGHTBOX (MOUNTED DIRECTLY TO DOCUMENT.BODY) */}
      {selectedPhotoZoom && createPortal(
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              background: '#000000'
            }}
          >
            <img
              src={selectedPhotoZoom.resolvedUrl || selectedPhotoZoom.foto_url}
              alt="Foto Tumba"
              style={{ width: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
            <button
              onClick={() => setSelectedPhotoZoom(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <X size={20} color="#1e293b" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
