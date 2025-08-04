// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AlfLogo } from './ui/AlfLogo';

// Design System imports
import { 
  Container, 
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
      <Container>
        <div className="flex justify-between items-center py-3">
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
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
