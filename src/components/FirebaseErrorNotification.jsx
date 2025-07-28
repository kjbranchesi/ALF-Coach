import React, { useState, useEffect } from 'react';

const FirebaseErrorNotification = ({ error, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {onDismiss();}
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  if (!isVisible || !error) {return null;}

  const isPermissionError = error.code === 'permission-denied' || 
                          error.message?.includes('Missing or insufficient permissions');
  
  const isNetworkError = error.code === 'unavailable' || 
                        error.message?.includes('network') ||
                        error.message?.includes('offline');

  return (
    <div className="fixed bottom-4 right-4 max-w-md p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg animate-slide-up z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {isPermissionError && "Sync Temporarily Unavailable"}
            {isNetworkError && "Connection Issue"}
            {!isPermissionError && !isNetworkError && "Sync Warning"}
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            {isPermissionError && (
              <p>Your work is being saved locally. Cloud sync will resume when available.</p>
            )}
            {isNetworkError && (
              <p>No internet connection. Your work is saved locally and will sync when you're back online.</p>
            )}
            {!isPermissionError && !isNetworkError && (
              <p>There was an issue with cloud sync. Your work is saved locally.</p>
            )}
          </div>
          <div className="mt-2 text-xs text-yellow-600">
            <p>✓ Your data is safe and saved locally</p>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => {
              setIsVisible(false);
              if (onDismiss) {onDismiss();}
            }}
            className="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseErrorNotification;