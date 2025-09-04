import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BlueprintProvider } from './context/BlueprintContext';
import { FirebaseErrorProvider } from './context/FirebaseErrorContext';
import { useAuth } from './hooks/useAuth';
import { useBackspaceNavigation } from './hooks/useBackspaceNavigation';
import { SkipToMainContent } from './components/AccessibilityComponents';
import { ConnectionStatus } from './components/ConnectionStatus';

// Components that need auth
import { UniversalHeader } from './components/layout/UniversalHeader';
import Footer from './components/Footer';
import SignIn from './components/SignIn';

// Lazy load heavy components to improve performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const ChatLoader = lazy(() => import('./features/chat/ChatLoader'));
const SamplesGallery = lazy(() => import('./components/SamplesGallery'));
const TestChatSmoke = lazy(() => import('./pages/test-chat-smoke'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">Loading Alf...</h1>
      </div>
    );
  }
  
  // Allow anonymous users to access protected routes
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/chat') || location.pathname.includes('/blueprint') || location.pathname.includes('/project');
  
  // Initialize backspace navigation prevention
  useBackspaceNavigation();
  
  // For chat/blueprint pages, use a different layout without padding
  if (isChatPage) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
        <SkipToMainContent />
        <ConnectionStatus />
        <div className="print-hidden flex-shrink-0 z-50">
          <UniversalHeader title="ALF Coach" />
        </div>
        <main id="main-content" className="flex-grow relative overflow-hidden pt-20" role="main">
          {children}
        </main>
      </div>
    );
  }
  
  // Default layout for other pages
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <SkipToMainContent />
      <ConnectionStatus />
      <div className="print-hidden">
        <UniversalHeader title="ALF Coach" />
      </div>
      <main id="main-content" className="flex-grow p-4 sm:p-6 md:p-8 pt-20 flex flex-col" role="main">
        {children}
      </main>
      <div className="print-hidden">
        <Footer />
      </div>
    </div>
  );
};

export default function AuthenticatedApp() {
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
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">Loading Alf...</h1>
      </div>
    );
  }

  return (
    <FirebaseErrorProvider>
      <AppProvider>
        <BlueprintProvider>
          <Routes>
            {/* Sign in route */}
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
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading dashboard...</div></div>}>
                    <Dashboard />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading dashboard...</div></div>}>
                    <Dashboard />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/samples" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading samples...</div></div>}>
                    <SamplesGallery />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/project/:projectId" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600 animate-pulse">Loading project...</div></div>}>
                  <ChatLoader />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/app/blueprint/:id" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600 animate-pulse">Loading blueprint...</div></div>}>
                  <ChatLoader />
                </Suspense>
              </ProtectedRoute>
            } />
            
            {/* Legacy routes - redirect to new architecture */}
            <Route path="/app/workspace/:projectId" element={<Navigate to="/app/project/:projectId" replace />} />
            <Route path="/app/blueprint/:id/chat" element={<Navigate to="/app/blueprint/:id" replace />} />
            
            {/* Test routes */}
            <Route path="/test/chat" element={<div>Chat test route - component needs fixing</div>} />
            <Route path="/test/chat-smoke" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading test…</div></div>}>
                    <TestChatSmoke />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/new" element={
              <div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600">New architecture test coming soon...</div></div>
            } />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BlueprintProvider>
      </AppProvider>
    </FirebaseErrorProvider>
  );
}
