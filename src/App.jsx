import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ViewerPage from './components/ViewerPage';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'viewer'
  const [selectedCemetery, setSelectedCemetery] = useState('barrillas');

  // User Session State: null by default
  const [userSession, setUserSession] = useState(null);

  const handleSelectCemetery = (cemeteryId) => {
    setSelectedCemetery(cemeteryId);
    setCurrentView('viewer');
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  // Keep the user on their CURRENT view when logging in!
  const handleLogin = (session) => {
    setUserSession(session);
  };

  const handleLogout = () => {
    setUserSession(null);
  };

  return (
    <div className="app-root">
      {/* OFFICIAL COATZA NAVBAR HEADER ALWAYS VISIBLE ON TOP */}
      <Navbar 
        onSelectCemetery={handleSelectCemetery} 
        onGoHome={handleGoHome}
        userSession={userSession}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {currentView === 'home' && (
        <HomeView onOpenCemetery={handleSelectCemetery} />
      )}

      {currentView === 'viewer' && (
        <ViewerPage 
          onGoHome={handleGoHome}
          selectedCemetery={selectedCemetery}
          userRole={userSession ? userSession.role : 'public'}
        />
      )}
    </div>
  );
}
