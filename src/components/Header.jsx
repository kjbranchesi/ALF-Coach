// src/components/Header.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useAppContext } from '../context/AppContext.jsx';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { LogOut, Settings, User, LayoutDashboard, Feather } from 'lucide-react';

// A modern, responsive header component reflecting the new visual identity.
// It includes the app logo and a user profile dropdown menu.

export default function Header() {
  const { user, logout, isAnonymous } = useAuth();
  const { navigateTo } = useAppContext();

  const handleSignOut = async () => {
    await logout();
    // The AuthRouter will handle navigation back to the landing page.
  };

  const getUserDisplayName = () => {
    if (isAnonymous) return "Guest User";
    return user?.email || "User";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        {/* Logo and App Name */}
        <div className="flex gap-6 md:gap-10">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center space-x-2"
          >
            <Feather className="h-6 w-6 text-primary-600" />
            <span className="inline-block font-bold text-lg text-neutral-800">ProjectCraft</span>
          </button>
        </div>

        {/* User Info and Dropdown Menu */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Signed in as</p>
                  <p className="text-xs leading-none text-neutral-500 truncate">
                    {getUserDisplayName()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigateTo('dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
