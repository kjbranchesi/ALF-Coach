// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebase.js'; // Importing from our new firebase service

/**
 * A custom React hook to manage the user's authentication state.
 * It handles loading states and provides the current user's ID.
 */
export const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // If no user, sign them in anonymously
        signInAnonymously(auth).catch(error => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { userId, isLoading };
};
