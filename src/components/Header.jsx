// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AlfLogo from './ui/AlfLogo';

// Design System imports
import { 
  Text, 
  Button, 
  Icon 
} from '../design-system';


export default function Header() {
  const { user, logout, isAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    try {
      await logout();
      console.log('Logout successful, navigating to home');
      // Navigate to home page after logout
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
            onClick={() => navigate('/app/dashboard')}
          >
            <AlfLogo 
              size="lg" 
              showText={true}
              className="transition-all duration-300 group-hover:scale-105"
              textClassName="dark:text-gray-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="profile" size="sm" className="text-gray-500 dark:text-gray-400" />
              <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300 hidden md:block">
                {getUserDisplayName()}
              </Text>
            </div>
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
        </div>
      </div>
    </header>
  );
}
