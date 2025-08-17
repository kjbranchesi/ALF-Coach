import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NavigationErrorBoundary } from './components/ErrorBoundary';
import { SkipToMainContent } from './components/AccessibilityComponents';

// Immediately loaded components for landing page (no Firebase needed)
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';

// Lazy load the authenticated app to defer Firebase
const AuthenticatedApp = lazy(() => import('./AuthenticatedApp'));

// Loading component with dark mode support
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900">
    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">Loading Alf...</h1>
  </div>
);

// Public layout (no auth needed)
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <SkipToMainContent />
      <div className="print-hidden">
        <Header />
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

export default function AppRouter() {
  return (
    <NavigationErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public route - no Firebase needed */}
          <Route path="/" element={
            <PublicLayout>
              <LandingPage 
                onGetStarted={() => window.location.href = '/signin'} 
                onSignIn={() => window.location.href = '/signin'} 
              />
            </PublicLayout>
          } />
          
          {/* All other routes - load Firebase and auth */}
          <Route path="/*" element={
            <Suspense fallback={<LoadingScreen />}>
              <AuthenticatedApp />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </NavigationErrorBoundary>
  );
}