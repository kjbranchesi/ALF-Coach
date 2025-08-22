/**
 * UniversalHeader.tsx
 * 
 * Consistent header navigation across all pages
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, ChevronLeft, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AlfLogo from '../ui/AlfLogo';

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
    <header className="sticky top-0 z-50">
      {/* Thinner pillbox header with lovely soft shadows */}
      <div className="m-3">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-soft hover:shadow-soft-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-5 py-2.5">
            <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Logo/Brand - Using the proper stacked paper icon */}
            <div 
              className="cursor-pointer group"
              onClick={() => navigate('/app/dashboard')}
            >
              <AlfLogo 
                size="lg" 
                showText={true}
                className="transition-all duration-300 group-hover:scale-105"
                textClassName="dark:text-gray-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
              />
            </div>
            
            {/* Back/Dashboard button and Project Title */}
            {isInChat && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>-</span>
                  <span>{title || 'Project Design'}</span>
                </div>
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
              </>
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
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;