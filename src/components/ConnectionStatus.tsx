// Connection status monitor for network awareness
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [lastChecked, setLastChecked] = useState(Date.now());

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    const updateOnlineStatus = () => {
      const wasOnline = isOnline;
      const nowOnline = navigator.onLine;
      
      setIsOnline(nowOnline);
      setLastChecked(Date.now());
      
      // Show status when connection changes
      if (wasOnline !== nowOnline) {
        setShowStatus(true);
        onStatusChange?.(nowOnline);
        
        // Hide status after 5 seconds if online
        if (nowOnline) {
          hideTimeout = setTimeout(() => setShowStatus(false), 5000);
        }
      }
      
      // Test connection speed if online
      if (nowOnline) {
        testConnectionSpeed();
      } else {
        setConnectionSpeed('offline');
      }
    };

    const testConnectionSpeed = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache' 
        }).catch(() => null);
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (!response) {
          setConnectionSpeed('offline');
        } else if (responseTime < 300) {
          setConnectionSpeed('fast');
        } else {
          setConnectionSpeed('slow');
        }
      } catch {
        setConnectionSpeed('slow');
      }
    };

    // Check connection periodically
    const checkInterval = setInterval(() => {
      updateOnlineStatus();
    }, 30000); // Every 30 seconds

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();

    return () => {
      clearInterval(checkInterval);
      clearTimeout(hideTimeout);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isOnline, onStatusChange]);

  // Always show if offline
  const shouldShow = showStatus || !isOnline || connectionSpeed === 'slow';

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
            !isOnline 
              ? 'bg-red-500 text-white' 
              : connectionSpeed === 'slow'
              ? 'bg-yellow-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">Offline Mode</span>
            </>
          ) : connectionSpeed === 'slow' ? (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Slow Connection</span>
            </>
          ) : (
            <>
              <Wifi className="w-5 h-5" />
              <span className="font-medium">Back Online</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for monitoring connection status
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Monitor connection quality through Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateQuality = () => {
        if (!navigator.onLine) {
          setConnectionQuality('offline');
        } else if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('good');
        }
      };

      connection.addEventListener('change', updateQuality);
      updateQuality();

      return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
        connection.removeEventListener('change', updateQuality);
      };
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return { isOnline, connectionQuality };
}