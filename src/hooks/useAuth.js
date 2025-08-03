// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider, // For Apple and Microsoft
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

/**
 * A custom React hook to manage the user's authentication state and actions.
 * It now handles multiple sign-in methods and provides a clear auth status.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // The onAuthStateChanged listener is the single source of truth for the user's auth state.
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Add a timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth state change timeout - forcing loading to false');
      setIsLoading(false);
    }, 5000); // 5 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User signed in' : 'No user');
      clearTimeout(timeoutId); // Clear timeout since auth state changed
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // --- Email & Password Methods ---
  const signUpWithEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      console.error("Sign up failed:", err);
    }
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      console.error("Sign in failed:", err);
    }
  }, []);

  // --- Social & Anonymous Methods ---
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error("Google sign in failed:", err);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setError(null);
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error("Apple sign in failed:", err);
    }
  }, []);
  
  const signInWithMicrosoft = useCallback(async () => {
    setError(null);
    const provider = new OAuthProvider('microsoft.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error("Microsoft sign in failed:", err);
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message);
      console.error("Anonymous sign-in failed:", err);
    }
  }, []);

  // --- Sign Out ---
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      console.error("Sign out failed:", err);
    }
  }, []);

  return {
    user,
    userId: user?.uid,
    isAnonymous: user?.isAnonymous,
    isLoading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInWithMicrosoft,
    continueAsGuest,
    logout,
  };
};
