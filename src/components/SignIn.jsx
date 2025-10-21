// src/components/SignIn.jsx

import React, { useState } from 'react';
import '../styles/alf-design-system.css';
import AlfLogo from './ui/AlfLogo';
import { ArrowLeft } from 'lucide-react';

// --- Icon Components for each Auth Provider ---
const GoogleIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );
const UserCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg> );

export default function SignIn({
    onSignInWithEmail,
    onSignUpWithEmail,
    onSignInWithGoogle,
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100/20 dark:bg-primary-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl"></div>
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          <span className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Back</span>
        </button>
      </div>
      
      <div className="flex flex-col justify-center min-h-screen relative z-10">
        <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 alf-animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.reload()}>
              <AlfLogo size="lg" className="transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">Active Learning Framework</span>
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200" 
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200" 
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
            className="w-full bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
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
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
              disabled={isLoading}
              title="Sign in with Google"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button
              onClick={() => handleSocialSignIn(onSignInAnonymously)}
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-gray-600 dark:text-gray-400 group"
              disabled={isLoading}
              title="Continue as Guest"
            >
              <UserCircleIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guest</span>
            </button>
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-1 transition-colors"
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        
        {/* Additional helpful links */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Privacy Policy</a>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
