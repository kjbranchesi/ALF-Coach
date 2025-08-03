// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogOut, User } from 'lucide-react';

// Professional stacked paper logo
const AlfLogo = () => (
  <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="10" width="28" height="32" rx="2" fill="#2563eb" opacity="0.9"/>
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#1d4ed8" opacity="0.95"/>
    <rect x="12" y="6" width="28" height="32" rx="2" fill="#1e40af"/>
    <line x1="16" y1="14" x2="36" y2="14" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="22" x2="34" y2="22" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="26" x2="30" y2="26" stroke="white" strokeWidth="1" opacity="0.8"/>
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
    <header className="soft-card rounded-none sticky top-0 z-10 mb-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center py-3">
                {/* Logo and App Name */}
                <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/app/dashboard')}
                >
                    <div className="relative transition-transform duration-300 group-hover:scale-110">
                        <AlfLogo />
                    </div>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-blue-600 alf-font-serif">Alf</span>
                </div>

                {/* User Info and Sign Out */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:block">{getUserDisplayName()}</span>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 soft-button hover:shadow-soft-lg soft-transition"
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
