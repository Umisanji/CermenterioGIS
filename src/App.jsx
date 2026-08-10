import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ViewerPage from './components/ViewerPage';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'viewer'
  const [selectedCemetery, setSelectedCemetery] = useState('barrillas');

  const handleSelectCemetery = (cemeteryId) => {
    setSelectedCemetery(cemeteryId);
    setCurrentView('viewer');
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="app-root">
      {/* OFFICIAL COATZA NAVBAR HEADER ALWAYS VISIBLE ON TOP */}
      <Navbar 
        onSelectCemetery={handleSelectCemetery} 
        onGoHome={handleGoHome}
      />

      {currentView === 'home' ? (
        <HomeView onOpenCemetery={handleSelectCemetery} />
      ) : (
        <ViewerPage 
          onGoHome={handleGoHome}
          selectedCemetery={selectedCemetery}
        />
      )}
    </div>
  );
}
