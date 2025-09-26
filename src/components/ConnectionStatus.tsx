// Connection status monitor for network awareness and Firebase sync
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('fast');
  const lastCheckedRef = useRef(Date.now());
  const isOnlineRef = useRef(isOnline);
  const hideTimeoutRef = useRef<number | null>(null);
  const recurringCheckTimeoutRef = useRef<number | null>(null);
  const initialCheckTimeoutRef = useRef<number | null>(null);
  const initialUpdateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const wasOnline = isOnlineRef.current;
      const nowOnline = navigator.onLine;
      
      setIsOnline(nowOnline);
      isOnlineRef.current = nowOnline;
      lastCheckedRef.current = Date.now();
      
      // Show status when connection changes
      if (wasOnline !== nowOnline) {
        setShowStatus(true);
        onStatusChange?.(nowOnline);
        
        // Hide status after 5 seconds if online
        if (nowOnline) {
          if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
          }
          hideTimeoutRef.current = window.setTimeout(() => { setShowStatus(false); }, 5000);
        }
      }
      
      // Test connection speed if online
      if (nowOnline) {
        void testConnectionSpeed();
      } else {
        setConnectionSpeed('offline');
      }
    };

    const testConnectionSpeed = async () => {
      // DEFER: Don't test speed immediately - assume fast connection
      // Only test if user has been on page for > 10 seconds
      if (Date.now() - lastCheckedRef.current < 10000) {
        setConnectionSpeed('fast');
        return;
      }
      
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

    // DEFER: Only check connection after user has been idle for 1 minute
    const scheduleCheck = () => {
      recurringCheckTimeoutRef.current = window.setTimeout(() => {
        updateOnlineStatus();
        scheduleCheck(); // Schedule next check
      }, 60000); // Every 60 seconds instead of 30
    };
    
    // Start checking after initial 10 second delay
    initialCheckTimeoutRef.current = window.setTimeout(scheduleCheck, 10000);

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // DEFER: Don't check on mount - assume online
    setIsOnline(navigator.onLine);
    setConnectionSpeed('fast');
    // Only check after 5 seconds
    initialUpdateTimeoutRef.current = window.setTimeout(updateOnlineStatus, 5000);

    return () => {
      if (recurringCheckTimeoutRef.current) {
        window.clearTimeout(recurringCheckTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (initialCheckTimeoutRef.current) {
        window.clearTimeout(initialCheckTimeoutRef.current);
      }
      if (initialUpdateTimeoutRef.current) {
        window.clearTimeout(initialUpdateTimeoutRef.current);
      }
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [onStatusChange]);

  // Always show if offline
  const shouldShow = showStatus || !isOnline || connectionSpeed === 'slow';

  if (!shouldShow) {
    return null;
  }
  
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-opacity ${
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
    </div>
  );
}
