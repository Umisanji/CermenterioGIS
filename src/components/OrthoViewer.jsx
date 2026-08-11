import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';

export default function OrthoViewer({ onZoomChange, setViewerRef, onSelectTumba }) {
  const viewerContainerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  const tumba1 = {
    type: 'Feature',
    properties: {
      fid: 1,
      seccion: 'A',
      lote: '3252',
      propietario: 'LUIS MIGUEL DE LA CRUZ GONZALEZ',
      difunto: 'MIGUEL ANGEL DE LA CRUZ MARTINEZ',
      fechaDifuncion: '2019-01-04',
      telefono: '9212392318',
      direccionTitular: 'C TIBURON 25 FRACC PUERTO ESMERALDA EN CTZ, VER',
      vigenciaPerpetuidad: '2033-01-26',
      folio: '251',
      recibo: 'E 046496',
      tipoTramite: 'PERPETUIDAD ENE26',
      observacion: 'BOVEDA FORRADA DE AZULEJO COLOR AZUL CON NICHO, PAR DE FLOREROS Y LIBRO'
    }
  };

  const tumba2 = {
    type: 'Feature',
    properties: {
      fid: 2,
      seccion: 'A',
      lote: '3254',
      propietario: 'GERARDO JUAREZ CRUZ',
      difunto: 'FRANCISCA CRUZ AGUILAR',
      fechaDifuncion: '2019-01-07',
      telefono: '9211384949',
      direccionTitular: 'AV GAVIOTAS 121 COL SANTA ISABEL III COATZA.,VER',
      vigenciaPerpetuidad: '2033-03-21',
      folio: '925',
      recibo: 'SIN RECIBO',
      tipoTramite: 'PERPETUIDAD ABR26',
      observacion: 'BOVEDA CON MONUMENTO DE AZULEJO COLOR AZUL'
    }
  };

  useEffect(() => {
    if (!viewerContainerRef.current) return;

    // High-performance OpenSeadragon DZI Tile Pyramid Viewer
    const viewer = OpenSeadragon({
      element: viewerContainerRef.current,
      prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
      tileSources: {
        Image: {
          xmlns: "http://schemas.microsoft.com/deepzoom/2008",
          Url: "/ortho_files/",
          Format: "jpg",
          Overlap: "0",
          TileSize: "512",
          Size: {
            Width: "40291",
            Height: "32071"
          }
        }
      },
      animationTime: 0.4,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 3.0,
      minZoomImageRatio: 0.8,
      visibilityRatio: 0.9,
      zoomPerClick: 1.5,
      showNavigationControl: false,
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        pinchToZoom: true
      }
    });

    viewerInstanceRef.current = viewer;
    if (setViewerRef) setViewerRef(viewer);

    // Add interactive QGIS tomb overlays on OpenSeadragon DZI Image
    viewer.addHandler('open', () => {
      // Create Overlay 1 (Lote 3252)
      const elt1 = document.createElement('div');
      elt1.className = 'dzi-tumba-overlay';
      elt1.innerHTML = `
        <div style="
          background: rgba(122, 28, 46, 0.88);
          border: 2px solid #FACC15;
          border-radius: 8px;
          padding: 4px 8px;
          color: #ffffff;
          font-family: sans-serif;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          🪦 Lote #3252 (Sec. A)
        </div>
      `;
      elt1.onclick = (e) => {
        e.stopPropagation();
        if (onSelectTumba) onSelectTumba(tumba1);
      };

      // Create Overlay 2 (Lote 3254)
      const elt2 = document.createElement('div');
      elt2.className = 'dzi-tumba-overlay';
      elt2.innerHTML = `
        <div style="
          background: rgba(122, 28, 46, 0.88);
          border: 2px solid #FACC15;
          border-radius: 8px;
          padding: 4px 8px;
          color: #ffffff;
          font-family: sans-serif;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          🪦 Lote #3254 (Sec. A)
        </div>
      `;
      elt2.onclick = (e) => {
        e.stopPropagation();
        if (onSelectTumba) onSelectTumba(tumba2);
      };

      try {
        viewer.addOverlay({
          element: elt1,
          location: new OpenSeadragon.Rect(0.44, 0.40, 0.04, 0.03)
        });
        viewer.addOverlay({
          element: elt2,
          location: new OpenSeadragon.Rect(0.49, 0.40, 0.04, 0.03)
        });
      } catch (err) {
        console.warn('Error adding DZI overlays:', err);
      }
    });

    // Fallback handler if DZI is offline
    viewer.addHandler('open-failed', () => {
      console.warn('Fallback to web JPEG image');
      viewer.open({
        type: 'image',
        url: '/ortho_seccion_a_web.jpg'
      });
    });

    const handleZoom = () => {
      if (!viewer.viewport) return;
      const currentZoom = viewer.viewport.getZoom(true);
      const homeZoom = viewer.viewport.getHomeZoom();
      const pct = Math.round((currentZoom / homeZoom) * 100);
      if (onZoomChange) onZoomChange(pct);
    };

    viewer.addHandler('zoom', handleZoom);

    const handleResize = () => {
      if (viewer && viewer.viewport) {
        viewer.viewport.applyConstraints();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.destroy();
    };
  }, []);

  return (
    <div 
      ref={viewerContainerRef} 
      className="w-full h-full bg-white overflow-hidden" 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: 'calc(100vh - 64px)', 
        backgroundColor: '#ffffff' 
      }}
    />
  );
}
