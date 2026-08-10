import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';

export default function OrthoViewer({ onZoomChange, setViewerRef }) {
  const viewerContainerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  useEffect(() => {
    if (!viewerContainerRef.current) return;

    // Direct TileSource definition for maximum reliability
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

    // Fallback handler
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

    // Force redraw on resize
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
