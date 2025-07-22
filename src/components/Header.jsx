// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { DarkModeToggle } from './DarkModeToggle';

// --- Icon Components ---
const LogOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-500">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);


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
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-gray-700 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center py-3">
                {/* Logo and App Name */}
                <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/app/dashboard')}
                >
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">ProjectCraft</span>
                </div>

                {/* User Info and Sign Out */}
                <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    <div className="flex items-center gap-2">
                        <UserIcon />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:block">{getUserDisplayName()}</span>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                        <LogOutIcon />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
}
