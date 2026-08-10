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
      {currentView === 'home' ? (
        <>
          <Navbar onSelectCemetery={handleSelectCemetery} />
          <HomeView onOpenCemetery={handleSelectCemetery} />
        </>
      ) : (
        <ViewerPage 
          onGoHome={handleGoHome}
          selectedCemetery={selectedCemetery}
        />
      )}
    </div>
  );
}
