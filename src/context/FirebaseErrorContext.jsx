import React, { createContext, useState, useContext, useCallback } from 'react';
import FirebaseErrorNotification from '../components/FirebaseErrorNotification';

const FirebaseErrorContext = createContext();

export const useFirebaseError = () => {
  const context = useContext(FirebaseErrorContext);
  if (!context) {
    throw new Error('useFirebaseError must be used within FirebaseErrorProvider');
  }
  return context;
};

export const FirebaseErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const reportError = useCallback((err) => {
    // Only report Firebase-specific errors
    if (err?.code || err?.message?.includes('Firebase') || err?.message?.includes('permission')) {
      setError(err);
      console.warn('Firebase operation failed, using local storage fallback:', err.message);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    error,
    reportError,
    clearError
  };

  return (
    <FirebaseErrorContext.Provider value={value}>
      {children}
      <FirebaseErrorNotification error={error} onDismiss={clearError} />
    </FirebaseErrorContext.Provider>
  );
};