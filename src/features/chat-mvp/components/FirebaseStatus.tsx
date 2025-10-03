import { useEffect, useState } from 'react';
import { db, isOfflineMode } from '../../../firebase/firebase';

type Status = 'unknown' | 'checking' | 'online' | 'offline' | 'error';

export function FirebaseStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function checkFirebase() {
      try {
        // Check if Firebase is in offline mode
        if (isOfflineMode) {
          if (!cancelled) {
            setStatus('offline');
            setDetail('Using localStorage only');
          }
          return;
        }

        // Try to get Firestore instance
        if (!db) {
          if (!cancelled) {
            setStatus('offline');
            setDetail('Firestore not initialized');
          }
          return;
        }

        // Check if we can access Firestore
        // Import getDoc and doc dynamically to avoid bundle bloat
        const { doc, getDoc } = await import('firebase/firestore');

        // Try to read a test document (will fail gracefully if doesn't exist)
        const testRef = doc(db, '_connection_test', 'test');
        await getDoc(testRef);

        if (!cancelled) {
          setStatus('online');
          setDetail('Connected to Firestore');
        }
      } catch (error: any) {
        if (!cancelled) {
          // Check for specific error types
          if (error?.code === 'permission-denied') {
            setStatus('online');
            setDetail('Connected (permissions OK)');
          } else if (error?.message?.includes('offline') || error?.code === 'unavailable') {
            setStatus('offline');
            setDetail('Network unavailable');
          } else {
            setStatus('error');
            setDetail(error?.message?.slice(0, 50) || 'Connection error');
          }
        }
      }
    }

    checkFirebase();

    // Recheck every 30 seconds
    const interval = setInterval(() => {
      if (!cancelled) {checkFirebase();}
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const color =
    status === 'online'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'offline'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : status === 'error'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-gray-50 text-gray-600 border-gray-200';

  const dotColor =
    status === 'online'
      ? 'bg-emerald-500'
      : status === 'offline'
      ? 'bg-amber-500'
      : status === 'error'
      ? 'bg-rose-500'
      : 'bg-gray-400';

  const label =
    status === 'online'
      ? 'Firebase Online'
      : status === 'offline'
      ? 'Firebase Offline'
      : status === 'error'
      ? 'Firebase Error'
      : status === 'checking'
      ? 'Firebase Checking'
      : 'Firebase Unknown';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border text-[11px] ${color}`}
      title={detail || undefined}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
      {detail && <span className="text-gray-500 text-[10px]">({detail.slice(0, 40)})</span>}
    </div>
  );
}

export default FirebaseStatus;
