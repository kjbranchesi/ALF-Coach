// src/components/Header.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useAppContext } from '../context/AppContext.jsx';

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
  const { navigateTo } = useAppContext();

  const handleSignOut = async () => {
    await logout();
    // After logout, we don't need to navigate. The AuthRouter in App.jsx
    // will automatically detect the user is null and show the landing page.
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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center py-3">
                {/* Logo and App Name */}
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigateTo('dashboard')}
                >
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="text-xl font-bold text-slate-800">ProjectCraft</span>
                </div>

                {/* User Info and Sign Out */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <UserIcon />
                        <span className="text-sm font-medium text-slate-600 hidden md:block">{getUserDisplayName()}</span>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
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
