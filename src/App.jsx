import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ViewerPage from './components/ViewerPage';
import TramiteDetailView from './components/TramiteDetailView';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'viewer' | 'tramite'
  const [selectedCemetery, setSelectedCemetery] = useState('barrillas');
  const [selectedTramiteId, setSelectedTramiteId] = useState('sepelio-primera-vez');

  const handleSelectCemetery = (cemeteryId) => {
    setSelectedCemetery(cemeteryId);
    setCurrentView('viewer');
  };

  const handleSelectTramite = (tramiteId) => {
    setSelectedTramiteId(tramiteId);
    setCurrentView('tramite');
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="app-root">
      {/* OFFICIAL COATZA NAVBAR HEADER ALWAYS VISIBLE ON TOP */}
      <Navbar 
        onSelectCemetery={handleSelectCemetery} 
        onSelectTramite={handleSelectTramite}
        onGoHome={handleGoHome}
      />

      {currentView === 'home' && (
        <HomeView onOpenCemetery={handleSelectCemetery} />
      )}

      {currentView === 'viewer' && (
        <ViewerPage 
          onGoHome={handleGoHome}
          selectedCemetery={selectedCemetery}
        />
      )}

      {currentView === 'tramite' && (
        <TramiteDetailView 
          selectedTramiteId={selectedTramiteId}
          onSelectTramite={handleSelectTramite}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
