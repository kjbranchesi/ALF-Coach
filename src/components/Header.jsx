// src/components/Header.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AlfLogo from './ui/AlfLogo';
import { SaveExitButton } from './SaveExitButton';

// Design System imports
import {
  Text,
  Button,
  Icon
} from '../design-system';


export default function Header({ showSaveExit = false, projectId, currentStage, capturedData }) {
  const { user, logout, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page context for navigation
  const isPublicPage = ['/', '/how-it-works', '/signin', '/signup'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';
  const isDashboard = location.pathname === '/app/dashboard' || location.pathname === '/app';
  const isSamplesPage = location.pathname === '/app/samples';
  const isSampleDetailPage = location.pathname.startsWith('/app/samples/') && location.pathname !== '/app/samples';
  const isProjectPage = location.pathname.includes('/project/') || location.pathname.includes('/blueprint/');
  const isAuthenticatedArea = location.pathname.startsWith('/app/');

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    try {
      await logout();
      console.log('Logout successful, navigating to home');
      // Force full page refresh to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback navigation
      navigate('/', { replace: true });
    }
  };

  const getUserDisplayName = () => {
    if (isAnonymous) {
        return "Guest User";
    }
    if (user?.email) {
        return user.email;
    }
    return "User";
  }

  // Don't render header if we're in certain authenticated views that have their own
  const shouldSkipHeader = false; // Always render our unified header

  if (shouldSkipHeader) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="bg-white/90 dark:bg-[#141721]/90 backdrop-blur-md rounded-b-2xl shadow-soft-sm border-b border-gray-200/60 dark:border-[#1F2330] transition-all duration-300 hover:shadow-soft">
        <div className="flex justify-between items-center px-6 py-4 min-h-[80px]">
          {/* Logo and App Name */}
          <div
            className="cursor-pointer group"
            onClick={() => {
              // Best practice: Logo navigation based on user authentication status
              if (user) {
                // Authenticated user: go to dashboard
                navigate('/app/dashboard');
              } else {
                // Not authenticated: go to landing page
                navigate('/');
              }
            }}
          >
            <AlfLogo
              size="lg"
              showText={true}
              className="transition-all duration-300 group-hover:scale-105"
              textClassName="dark:text-slate-100 transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-300"
            />
          </div>

          {/* Navigation and Actions - Standardized Layout */}
          <div className="flex items-center gap-4">
            {/* Public pages navigation */}
            {(isPublicPage && !user) && (
              <>
                {/* Main navigation links */}
                <nav className="flex items-center gap-6 mr-4">
                  <button
                    onClick={() => navigate('/how-it-works')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                  >
                    How ALF Works
                  </button>
                  <button
                    onClick={() => navigate('/app/samples')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                  >
                    Project Showcase
                  </button>
                </nav>

                {/* Primary action button */}
                <Button
                  onClick={() => navigate('/signin')}
                  variant="primary"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-6 py-2.5 rounded-xl font-medium shadow-primary hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </Button>
              </>
            )}

            {/* Context-aware navigation for authenticated users */}
            {(isAuthenticatedArea || user) && (
              <>
                {/* Context navigation */}
                <nav className="flex items-center gap-4 mr-4">
                  {/* Dashboard: Show link to samples */}
                  {isDashboard && (
                    <button
                      onClick={() => navigate('/app/samples')}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                    >
                      Project Showcase
                    </button>
                  )}

                  {/* Samples Gallery: Show back to dashboard */}
                  {isSamplesPage && (
                    <button
                      onClick={() => navigate('/app/dashboard')}
                      className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                    >
                      <Icon name="chevron-left" size="sm" />
                      Back to Dashboard
                    </button>
                  )}

                  {/* Sample Detail: Show back to showcase */}
                  {isSampleDetailPage && (
                    <button
                      onClick={() => navigate('/app/samples')}
                      className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                    >
                      <Icon name="chevron-left" size="sm" />
                      Back to Showcase
                    </button>
                  )}

                  {/* Project/Blueprint Pages: Show back to dashboard */}
                  {isProjectPage && (
                    <button
                      onClick={() => navigate('/app/dashboard')}
                      className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 font-medium"
                    >
                      <Icon name="chevron-left" size="sm" />
                      Exit to Dashboard
                    </button>
                  )}
                </nav>

                {/* User section */}
                <div className="flex items-center gap-3">
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <Icon name="profile" size="sm" className="text-gray-500 dark:text-gray-400" />
                    <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-200 hidden md:block">
                      {getUserDisplayName()}
                    </Text>
                  </div>

                  {/* Save & Exit Button - Header Variant */}
                  {showSaveExit && (
                    <SaveExitButton
                      variant="header"
                      size="sm"
                      showLabel={true}
                      className="hidden sm:block"
                    />
                  )}

                  {/* Sign out button */}
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    leftIcon="external"
                    className="hover:scale-105 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
