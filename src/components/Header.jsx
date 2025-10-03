// src/components/Header.jsx

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AlfLogo from './ui/AlfLogo';

// Design System imports
import {
  Text,
  Button,
  Icon
} from '../design-system';

const LazySaveExitButton = React.lazy(async () => {
  const module = await import('./SaveExitButton');
  return { default: module.SaveExitButton };
});


export default function Header({ showSaveExit = false, projectId, currentStage, capturedData }) {
  const { user, logout, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigationLinks = useMemo(() => {
    const links = [];

    if (!user && isPublicPage) {
      links.push(
        { label: 'How ALF Works', action: () => navigate('/how-it-works') },
        { label: 'Project Showcase', action: () => navigate('/app/samples') }
      );
      return links;
    }

    if (user && isPublicPage) {
      links.push(
        { label: 'Studio Dashboard', action: () => navigate('/app/dashboard') },
        { label: 'How ALF Works', action: () => navigate('/how-it-works') },
        { label: 'Project Showcase', action: () => navigate('/app/samples') }
      );
      return links;
    }

    if (user && isAuthenticatedArea) {
      if (isSampleDetailPage) {
        links.push({ label: 'Back to Gallery', action: () => navigate('/app/samples'), icon: 'chevron-left' });
      }

      if (!isDashboard) {
        links.push({ label: 'Studio Dashboard', action: () => navigate('/app/dashboard') });
      } else {
        links.push(
          { label: 'How It Works', action: () => navigate('/how-it-works') },
          { label: 'Project Showcase', action: () => navigate('/app/samples') }
        );
      }

      return links;
    }

    return links;
  }, [user, isPublicPage, isAuthenticatedArea, isDashboard, isSampleDetailPage, navigate]);

  const hasPrimaryAction = !user && isPublicPage;
  const userDisplayName = getUserDisplayName();

  // Don't render header if we're in certain authenticated views that have their own
  const shouldSkipHeader = false; // Always render our unified header

  if (shouldSkipHeader) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="relative bg-white/90 dark:bg-[#141721]/90 backdrop-blur-md rounded-b-2xl shadow-soft-sm border-b border-gray-200/60 dark:border-[#1F2330] transition-all duration-300 hover:shadow-soft">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 min-h-[72px] sm:min-h-[80px]">
          {/* Logo and App Name */}
          <div
            className="cursor-pointer group"
            onClick={() => {
              // Best practice: Logo always goes to landing page (home)
              // Dashboard button provides workspace access for signed-in users
              navigate('/');
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
          <div className="flex items-center gap-3">
            {/* Desktop navigation */}
            {navigationLinks.length > 0 && (
              <nav className="hidden md:flex items-center gap-4 mr-4">
                {navigationLinks.map(({ label, action, icon }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {icon ? <Icon name={icon} size="sm" /> : null}
                    {label}
                  </button>
                ))}
              </nav>
            )}

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {!user && hasPrimaryAction && (
                <Button
                  onClick={() => navigate('/signin')}
                  variant="primary"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-5 py-2.5 rounded-xl font-medium shadow-primary hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </Button>
              )}

              {user && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Icon name="profile" size="sm" className="text-gray-500 dark:text-gray-400" />
                    <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-200">
                      {userDisplayName}
                    </Text>
                  </div>

                  {showSaveExit && (
                    <Suspense fallback={null}>
                      <LazySaveExitButton
                        variant="header"
                        size="sm"
                        showLabel={true}
                        className="hidden lg:block"
                      />
                    </Suspense>
                  )}

                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    leftIcon="external"
                    className="hover:scale-105 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden inline-flex items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-2 text-gray-600 dark:text-gray-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size="sm" />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden fixed left-4 right-4 top-[80px] z-50">
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-900/95 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
                <div className="p-5 space-y-4">
                  {user && (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 px-4 py-3">
                      <Icon name="profile" size="sm" className="text-primary-500" />
                      <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">{userDisplayName}</div>
                    </div>
                  )}

                  {navigationLinks.length > 0 && (
                    <nav className="grid gap-2">
                      {navigationLinks.map(({ label, action, icon }) => (
                        <button
                          key={label}
                          onClick={action}
                          className="flex items-center gap-2 rounded-xl border border-gray-200/70 dark:border-gray-700/70 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-300 transition"
                        >
                          {icon ? <Icon name={icon} size="sm" /> : null}
                          {label}
                        </button>
                      ))}
                    </nav>
                  )}

                  {showSaveExit && user && (
                    <Suspense fallback={null}>
                      <LazySaveExitButton
                        variant="header"
                        size="md"
                        showLabel={true}
                        className="w-full"
                      />
                    </Suspense>
                  )}

                  <div className="grid gap-2 pt-2">
                    {!user && hasPrimaryAction && (
                      <Button
                        onClick={() => navigate('/signin')}
                        variant="primary"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                    )}

                    {user && (
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="w-full"
                        leftIcon="external"
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
