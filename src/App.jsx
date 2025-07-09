// src/App.jsx

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { useAuth } from './hooks/useAuth.js';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './components/LandingPage.jsx';
import SignIn from './components/SignIn.jsx';
import Dashboard from './components/Dashboard.jsx';
import MainWorkspace from './components/MainWorkspace.jsx';

const AuthRouter = () => {
  const { 
    user, 
    isLoading, 
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInWithMicrosoft,
    continueAsGuest 
  } = useAuth();
  
  const [authView, setAuthView] = useState('landing');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <h1 className="text-3xl font-bold text-purple-600 animate-pulse">Loading ProjectCraft...</h1>
      </div>
    );
  }

  if (!user) {
    if (authView === 'landing') {
      return <LandingPage onGetStarted={() => setAuthView('signin')} />;
    }
    return (
      <SignIn
        onSignUpWithEmail={signUpWithEmail}
        onSignInWithEmail={signInWithEmail}
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithApple={signInWithApple}
        onSignInWithMicrosoft={signInWithMicrosoft}
        onSignInAnonymously={continueAsGuest}
        onBackToHome={() => setAuthView('landing')}
      />
    );
  }

  return <MainAppRouter />;
};

const MainAppRouter = () => {
  const { currentView } = useAppContext();

  const renderView = () => {
    // POLISH: Removed the 'summary' view. The workspace now handles everything.
    switch (currentView) {
      case 'workspace':
        return <MainWorkspace />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AuthRouter />
    </AppProvider>
  );
}

export default App;
