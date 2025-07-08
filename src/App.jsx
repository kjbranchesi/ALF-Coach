// src/App.jsx

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { useAuth } from './hooks/useAuth.js';

// Import all page-level components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './components/LandingPage.jsx';
import SignIn from './components/SignIn.jsx';
import Dashboard from './components/Dashboard.jsx';
import IdeationModule from './components/IdeationModule.jsx';
import CurriculumModule from './components/CurriculumModule.jsx';
import AssignmentModule from './components/AssignmentModule.jsx';

/**
 * The AuthRouter component handles the initial user flow.
 */
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


/**
 * The MainAppRouter component handles navigation within the main application.
 * It now includes the persistent Header and Footer and proper padding.
 */
const MainAppRouter = () => {
  const { currentView } = useAppContext();

  const renderView = () => {
    switch (currentView) {
      case 'ideation':
        return <IdeationModule />;
      case 'curriculum':
        return <CurriculumModule />;
      case 'assignment':
        return <AssignmentModule />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* The padding has been moved here to ensure it only applies to the main content area */}
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

/**
 * The App component is the absolute top-level of our application.
 */
function App() {
  return (
    <AppProvider>
      <div className="bg-gray-50 font-sans">
        <AuthRouter />
      </div>
    </AppProvider>
  );
}

export default App;
