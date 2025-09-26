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
import Header from './components/Header';
import Footer from './components/Footer';
import SignIn from './components/SignIn';

// Lazy load heavy components to improve performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const ChatLoader = lazy(() => import('./features/chat/ChatLoader'));
const SamplesGallery = lazy(() => import('./components/SamplesGallery'));
const TestChatSmoke = lazy(() => import('./pages/test-chat-smoke'));
const SamplePreview = lazy(() => import('./pages/SamplePreview'));
const ReviewScreen = lazy(() => import('./features/review/ReviewScreen'));
const ProjectShowcase = lazy(() => import('./pages/ProjectShowcase'));
const QuickSpark = lazy(() => import('./features/quickstart/QuickSpark'));
const AssignmentEditor = lazy(() => import('./features/showcase/AssignmentEditor'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 animate-pulse">Loading Alf...</h1>
      </div>
    );
  }
  
  // Allow anonymous users to access protected routes
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/chat') || location.pathname.includes('/blueprint') || location.pathname.includes('/project');

  // Determine page type for optimal spacing
  const isSamplesPage = location.pathname === '/app/samples';
  const isSampleDetailPage = location.pathname.startsWith('/app/samples/') && location.pathname !== '/app/samples';
  const isDashboardPage = location.pathname === '/app/dashboard' || location.pathname === '/app';

  // Initialize backspace navigation prevention
  useBackspaceNavigation();

  // Get appropriate spacing based on page type
  const getMainSpacing = () => {
    if (isChatPage) {
      return 'relative overflow-x-hidden overflow-y-auto pt-20'; // Allow builder/chat flows to scroll while keeping horizontal lock
    }

    if (isSamplesPage) {
      return 'p-4 sm:p-6 md:p-8 pt-28 flex flex-col'; // Gallery listing layout
    }

    if (isSampleDetailPage) {
      return 'pt-0 flex flex-col'; // Allow detail pages to span edge-to-edge while content handles spacing
    }

    if (isDashboardPage) {
      return 'p-4 sm:p-6 md:p-8 pt-24 flex flex-col'; // Standard for dashboard
    }

    return 'p-4 sm:p-6 md:p-8 pt-20 flex flex-col'; // Default for other pages
  };

  // Unified layout - ensure only ONE header renders consistently
  return (
    <div className={`flex flex-col ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 font-sans`}>
      <SkipToMainContent />
      <ConnectionStatus />

      {/* Single header instance with consistent positioning */}
      <div className="print-hidden flex-shrink-0 z-50">
        <Header />
      </div>

      <main
        id="main-content"
        className={`flex-grow ${getMainSpacing()}`}
        role="main"
      >
        {children}
      </main>

      {/* Footer only on non-chat pages */}
      {!isChatPage && (
        <div className="print-hidden">
          <Footer />
        </div>
      )}
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
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 animate-pulse">Loading Alf...</h1>
      </div>
    );
  }

  const quickSparkEnabled = (import.meta.env.VITE_FEATURE_QUICK_SPARK ?? 'true') !== 'false';

  return (
    <FirebaseErrorProvider>
      <AppProvider>
        <BlueprintProvider>
          <Routes key={window.location.pathname}>
            {/* Sign in route */}
            <Route
              path="/signin"
              element={
                user ? (
                  <Navigate to="/app/dashboard" replace />
                ) : (
                  <SignIn
                    key="signin"
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
                <AppLayout key="app-home">
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading dashboard...</div></div>}>
                    <Dashboard key="dashboard-home" />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/dashboard" element={
              <ProtectedRoute>
                <AppLayout key="app-dashboard">
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading dashboard...</div></div>}>
                    <Dashboard key="dashboard" />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/samples" element={
              <ProtectedRoute>
                <AppLayout key="app-samples">
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading samples...</div></div>}>
                    <SamplesGallery key="samples" />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/project/:projectId" element={
              <ProtectedRoute>
                <AppLayout key="app-project">
                  <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600 animate-pulse">Loading project...</div></div>}>
                    <ChatLoader key="project-chat" />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/blueprint/:id" element={
              <ProtectedRoute>
                <AppLayout key="app-blueprint">
                  <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600 animate-pulse">Loading blueprint...</div></div>}>
                    <ChatLoader key="blueprint-chat" />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/samples/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading sample…</div></div>}>
                    <SamplePreview />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            {quickSparkEnabled && (
              <Route path="/app/quick-spark" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading Quick Spark…</div></div>}>
                      <QuickSpark />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              } />
            )}
            <Route path="/app/showcase/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading showcase…</div></div>}>
                    <ProjectShowcase />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/showcase/:id/edit" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading editor…</div></div>}>
                    <AssignmentEditor />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/samples/:id/review" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 animate-pulse">Loading review…</div></div>}>
                  <ReviewScreen />
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
