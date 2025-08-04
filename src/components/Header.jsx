// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md">
      <Container>
        <div className="flex justify-between items-center py-3">
          {/* Logo and App Name */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/app/dashboard')}
          >
            <div className="relative">
              <Icon name="gem" size="lg" color="#6366f1" className="transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </div>
            <Text size="xl" weight="bold" className="transition-colors group-hover:text-primary-600">
              Alf
            </Text>
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="profile" size="sm" color="#71717a" />
              <Text size="sm" weight="medium" color="secondary" className="hidden md:block">
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
