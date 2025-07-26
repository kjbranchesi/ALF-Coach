import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BlueprintProvider } from './context/BlueprintContext';
import { FirebaseErrorProvider } from './context/FirebaseErrorContext';
import { useAuth } from './hooks/useAuth';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import MainWorkspace from './components/MainWorkspace';
import { ChatLoader } from './features/chat/ChatLoader';
import { TestChat } from './features/chat/TestChat';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <h1 className="text-3xl font-bold text-blue-600 animate-pulse">Loading ProjectCraft...</h1>
      </div>
    );
  }
  
  // Allow anonymous users to access protected routes
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/chat');
  
  // For chat pages, use a different layout without padding
  if (isChatPage) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
        <div className="print-hidden flex-shrink-0 z-50">
          <Header />
        </div>
        <main className="flex-grow relative overflow-hidden">
          {children}
        </main>
      </div>
    );
  }
  
  // Default layout for other pages
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="print-hidden">
        <Header />
      </div>
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col">
        {children}
      </main>
      <div className="print-hidden">
        <Footer />
      </div>
    </div>
  );
};

export default function AppRouter() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <h1 className="text-3xl font-bold text-blue-600 animate-pulse">Loading ProjectCraft...</h1>
      </div>
    );
  }

  return (
    <FirebaseErrorProvider>
      <AppProvider>
        <BlueprintProvider>
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage onGetStarted={() => window.location.href = '/signin'} />} />
            <Route 
              path="/signin" 
              element={
                user ? (
                  <Navigate to="/app/dashboard" replace />
                ) : (
                  <SignIn
                    onSignUpWithEmail={signUpWithEmail}
                    onSignInWithEmail={signInWithEmail}
                    onSignInWithGoogle={signInWithGoogle}
                    onSignInWithApple={signInWithApple}
                    onSignInWithMicrosoft={signInWithMicrosoft}
                    onSignInAnonymously={continueAsGuest}
                    onBackToHome={() => window.location.href = '/'}
                  />
                )
              } 
            />
            
            {/* Protected app routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/app/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/app/workspace/:projectId" element={<ProtectedRoute><AppLayout><MainWorkspace /></AppLayout></ProtectedRoute>} />
            <Route path="/app/blueprint/:id/chat" element={<ProtectedRoute><AppLayout><ChatLoader /></AppLayout></ProtectedRoute>} />
            <Route path="/test/chat" element={<TestChat />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BlueprintProvider>
    </AppProvider>
    </FirebaseErrorProvider>
  );
}