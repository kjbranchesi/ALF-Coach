// UserMenu.jsx - User profile menu component for ALF Coach
// Follows ALF Design System specifications with soft shadows and blue primary color

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Icon } from '../design-system';

const UserMenu = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action) => {
    setIsOpen(false);
    if (action === 'logout') {
      logout();
    }
    // Add other action handlers as needed
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: () => handleMenuAction('profile')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => handleMenuAction('settings')
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => handleMenuAction('help')
    },
    {
      id: 'divider',
      type: 'divider'
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      action: () => handleMenuAction('logout'),
      variant: 'danger'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
        
        {/* User Info */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {user?.displayName || user?.email || 'Guest User'}
          </span>
          {user?.email && (
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {user.email}
            </span>
          )}
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div className="py-2">
              {menuItems.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.id} className="my-1 border-t border-gray-100" />
                  );
                }

                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      item.variant === 'danger' 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-700'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${
                      item.variant === 'danger' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;