import { useState, useEffect } from 'react';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Monitor Firestore connection state
 * @returns {{ isConnected: boolean, reconnect: Function }}
 */
export function useFirestoreConnection() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsConnected(true);
      enableNetwork(db).catch(console.error);
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsConnected(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reconnect = async () => {
    try {
      await disableNetwork(db);
      await enableNetwork(db);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to reconnect to Firestore:', error);
      setIsConnected(false);
    }
  };

  return { isConnected, reconnect };
}