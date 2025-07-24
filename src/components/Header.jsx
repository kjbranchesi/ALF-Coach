// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { DarkModeToggle } from './DarkModeToggle';
import { LogOut, User, Layers } from 'lucide-react';


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
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/app/dashboard')}
                >
                    <div className="relative">
                        <Layers className="w-8 h-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                    </div>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-blue-600">ProjectCraft</span>
                </div>

                {/* User Info and Sign Out */}
                <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:block">{getUserDisplayName()}</span>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
}
