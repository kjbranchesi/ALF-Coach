// src/App.jsx

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { useAuth } from './hooks/useAuth.js';

// Import all page-level components
import Header from './components/Header.jsx'; // Import the new Header
import LandingPage from './components/LandingPage.jsx';
import SignIn from './components/SignIn.jsx';
import Dashboard from './components/Dashboard.jsx';
import IdeationModule from './components/IdeationModule.jsx';
import CurriculumModule from './components/CurriculumModule.jsx';
import AssignmentModule from './components/AssignmentModule.jsx';

/**
 * The AuthRouter component handles the initial user flow, deciding whether to show
 * the landing page, the sign-in page, or the main application.
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
  
  const [authView, setAuthView] = useState('landing'); // 'landing' or 'signin'

  // While Firebase is checking the auth state, show a loading screen.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <h1 className="text-3xl font-bold text-purple-600 animate-pulse">Loading ProjectCraft...</h1>
      </div>
    );
  }

  // If there is no user, show the landing/sign-in flow.
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
      />
    );
  }

  // If a user is signed in, render the main application with the header.
  return <MainAppRouter />;
};


/**
 * The MainAppRouter component handles navigation within the main application,
 * after a user has been authenticated. It now includes the persistent Header.
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
    <div>
      <Header />
      <main className="px-4 sm:px-6 md:px-8">
        {renderView()}
      </main>
    </div>
  );
};

/**
 * The App component is the absolute top-level of our application.
 * Its only job is to provide the global context and render the correct router.
 */
function App() {
  return (
    <AppProvider>
      <AuthRouter />
    </AppProvider>
  );
}

export default App;
