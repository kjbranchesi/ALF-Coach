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

  // Determine if we're on a public page
  const isPublicPage = ['/', '/how-it-works', '/signin', '/signup'].includes(location.pathname);

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    try {
      await logout();
      console.log('Logout successful, navigating to home');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-b-2xl shadow-md border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-center px-6 py-4">
          {/* Logo and App Name */}
          <div
            className="cursor-pointer group"
            onClick={() => navigate(user ? '/app/dashboard' : '/')}
          >
            <AlfLogo
              size="lg"
              showText={true}
              className="transition-all duration-300 group-hover:scale-105"
              textClassName="dark:text-gray-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-6">
            {isPublicPage && !user ? (
              // Public navigation
              <>
                <nav className="flex items-center gap-6">
                  <button
                    onClick={() => navigate('/about')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
                  >
                    About
                  </button>
                  <button
                    onClick={() => navigate('/how-it-works')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => navigate('/app/samples')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
                  >
                    Explore Samples
                  </button>
                  <Button
                    onClick={() => navigate('/signin')}
                    variant="primary"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                  >
                    Sign In
                  </Button>
                </nav>
              </>
            ) : (
              // Authenticated user navigation
              <>
                <div className="flex items-center gap-2">
                  <Icon name="profile" size="sm" className="text-gray-500 dark:text-gray-400" />
                  <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300 hidden md:block">
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
        </div>
      </div>
    </header>
  );
}