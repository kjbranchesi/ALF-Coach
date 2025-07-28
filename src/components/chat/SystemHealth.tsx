import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface SystemHealthProps {
  isProcessing: boolean;
  isStreaming: boolean;
  lastError?: any;
}

export function SystemHealth({ isProcessing, isStreaming, lastError }: SystemHealthProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Show status when there's an issue
  useEffect(() => {
    if (!isOnline || lastError) {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastError]);
  
  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        message: 'No internet connection'
      };
    }
    
    if (lastError) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        message: 'Some features may be limited'
      };
    }
    
    if (isProcessing || isStreaming) {
      return {
        icon: CheckCircle,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        message: 'Processing...'
      };
    }
    
    return {
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      message: 'All systems operational'
    };
  };
  
  const status = getStatus();
  const Icon = status.icon;
  
  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`fixed bottom-20 right-6 ${status.bgColor} rounded-lg px-3 py-2 shadow-lg`}
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${status.color}`} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {status.message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}