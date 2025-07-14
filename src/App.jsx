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

// This component routes users based on their authentication status.
const AuthRouter = () => {
  const { user, initialAuthChecked } = useAuth();
  
  // MODIFIED: Show a loading screen until the initial Firebase auth check is complete.
  // This prevents a race condition where the app tries to access Firestore before auth is ready.
  if (!initialAuthChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100">
        <h1 className="text-2xl font-bold text-primary-600 animate-pulse">Loading ProjectCraft...</h1>
      </div>
    );
  }

  // If there is no user, show the public-facing pages (Landing/Sign In).
  if (!user) {
    return <PublicAppRouter />;
  }

  // If a user is authenticated, show the main application layout.
  return <MainAppLayout />;
};

// Router for unauthenticated users.
const PublicAppRouter = () => {
    const { 
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithMicrosoft,
        continueAsGuest 
    } = useAuth();
    const [authView, setAuthView] = useState('landing');

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

// The main layout for authenticated users, including the Header and Footer.
const MainAppLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-50">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 md:px-8">
        <MainAppRouter />
      </main>
      <Footer />
    </div>
  );
};

// This router handles the content displayed within the main app layout.
const MainAppRouter = () => {
  const { currentView } = useAppContext();

  switch (currentView) {
    case 'workspace':
      return <MainWorkspace />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
};

// The root App component wraps everything in the AppProvider.
function App() {
  return (
    <AppProvider>
      <AuthRouter />
    </AppProvider>
  );
}

export default App;
