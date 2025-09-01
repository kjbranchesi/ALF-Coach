// NotificationBell.jsx - Notification bell component for ALF Coach
// Follows ALF Design System specifications with soft shadows and blue primary color

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { Icon } from '../design-system';

const NotificationBell = ({ className = '', notifications = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  // Calculate unread notifications
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

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

  const handleNotificationClick = (notification) => {
    // Mark as read and handle click
    if (notification.onClick) {
      notification.onClick();
    }
    // In real implementation, you'd update the notification status
  };

  const handleMarkAllRead = () => {
    // In real implementation, mark all notifications as read
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return Check;
      case 'warning':
        return AlertCircle;
      case 'info':
        return Info;
      case 'message':
        return MessageSquare;
      default:
        return Info;
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'warning':
        return {
          icon: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200'
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'message':
        return {
          icon: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      default:
        return {
          icon: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  // Sample notifications if none provided
  const sampleNotifications = [
    {
      id: '1',
      type: 'success',
      title: 'Blueprint Created',
      message: 'Your new lesson blueprint has been successfully created.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Feature Update',
      message: 'New AI suggestions are now available in your blueprints.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'message',
      title: 'Welcome to ALF',
      message: 'Thanks for joining ALF Coach! Explore our features to get started.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Notification Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 glass-squircle card-pad anim-ease border border-gray-200 shadow-lg z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium rounded-full px-2 py-1 hover:bg-blue-50"
                  >
                    Mark all read
                  </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="py-2">
                  {displayNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const colors = getNotificationColors(notification.type);
                    
                    return (
                      <motion.button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                          notification.read 
                            ? 'border-l-transparent opacity-75' 
                            : `${colors.border.replace('border-', 'border-l-')}`
                        }`}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mt-0.5`}>
                            <IconComponent className={`w-4 h-4 ${colors.icon}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {notification.timestamp ? 
                                new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
                                  .format(
                                    Math.round((notification.timestamp - new Date()) / (1000 * 60)),
                                    'minute'
                                  ) : 
                                'Just now'
                              }
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayNotifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-1">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
