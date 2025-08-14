/**
 * UniversalHeader.tsx
 * 
 * Consistent header navigation across all pages
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, ChevronLeft, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UniversalHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({ 
  showBackButton = false,
  title = 'ALF Coach'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isInChat = location.pathname.includes('/blueprint');
  const isInDashboard = location.pathname.includes('/dashboard');

  const handleNavigateToDashboard = () => {
    navigate('/app/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm dark:shadow-gray-900/50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 dark:bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">ALF</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">{title}</span>
            </div>
            
            {/* Back/Dashboard button */}
            {isInChat && (
              <button
                onClick={handleNavigateToDashboard}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 
                         hover:text-gray-900 dark:hover:text-gray-100 
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Exit to Dashboard</span>
                <span className="sm:hidden">Exit</span>
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user.email || 'Guest User'}
                </span>
              </div>
            )}
            
            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 
                       hover:text-gray-900 dark:hover:text-gray-100 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;