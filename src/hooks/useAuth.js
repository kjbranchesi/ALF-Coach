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
import { auth } from '../firebase/firebase.js';

/**
 * A custom React hook to manage the user's authentication state and actions.
 * It now handles multiple sign-in methods and provides a clear auth status.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false); // New state
  const [error, setError] = useState(null);

  // onAuthStateChanged is the single source of truth for the user's auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
      setInitialAuthChecked(true); // Mark that the initial check is complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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
    initialAuthChecked, // Expose the new state
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
