// src/components/SignIn.jsx

import React, { useState } from 'react';
import '../styles/alf-design-system.css';
import AlfLogo from './ui/AlfLogo';
import { ArrowLeft } from 'lucide-react';

// --- Icon Components for each Auth Provider ---
const GoogleIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );
const AppleIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/></svg> );
const MicrosoftIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg> );
const UserCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg> );

export default function SignIn({ 
    onSignInWithEmail, 
    onSignUpWithEmail, 
    onSignInWithGoogle, 
    onSignInWithApple,
    onSignInWithMicrosoft,
    onSignInAnonymously,
    onBackToHome
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      if (isSignUp) {
          await onSignUpWithEmail(email, password);
      } else {
          await onSignInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setError('');
    setIsLoading(true);
    try {
      await provider();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background elements matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl"></div>
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          <span className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Back</span>
        </button>
      </div>
      
      <div className="flex flex-col justify-center min-h-screen relative z-10">
        <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 alf-animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.reload()}>
              <AlfLogo size="lg" className="transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Active Learning Framework</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {isSignUp ? 'Join thousands of educators transforming their classrooms.' : 'Sign in to continue building amazing learning experiences.'}
            </p>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200" 
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200" 
              placeholder="Password"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialSignIn(onSignInWithGoogle)} 
              className="flex items-center justify-center w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
              disabled={isLoading}
              title="Sign in with Google"
            >
              <GoogleIcon />
              <span className="sr-only">Sign in with Google</span>
            </button>
            <button 
              onClick={() => handleSocialSignIn(onSignInWithApple)} 
              className="flex items-center justify-center w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-black dark:text-white group"
              disabled={isLoading}
              title="Sign in with Apple"
            >
              <AppleIcon />
              <span className="sr-only">Sign in with Apple</span>
            </button>
            <button 
              onClick={() => handleSocialSignIn(onSignInWithMicrosoft)} 
              className="flex items-center justify-center w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
              disabled={isLoading}
              title="Sign in with Microsoft"
            >
              <MicrosoftIcon />
              <span className="sr-only">Sign in with Microsoft</span>
            </button>
            <button 
              onClick={() => handleSocialSignIn(onSignInAnonymously)} 
              className="flex items-center justify-center w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-gray-600 dark:text-gray-400 group"
              disabled={isLoading}
              title="Continue as Guest"
            >
              <UserCircleIcon />
              <span className="sr-only">Continue as Guest</span>
            </button>
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-1 transition-colors"
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        
        {/* Additional helpful links */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Privacy Policy</a>
          </p>
        </div>
      </div>
      
        {/* Note about Apple Sign In */}
        {error && error.includes('Apple') && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Apple Sign In requires proper configuration in Firebase Console. 
              Please ensure Apple Sign In is enabled in your Firebase Authentication settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
