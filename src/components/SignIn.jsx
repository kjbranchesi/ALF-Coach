// src/components/SignIn.jsx

import React, { useState } from 'react';

// --- Icon Components for each Auth Provider ---
const GoogleIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );
const AppleIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.39,14.89a5.3,5.3,0,0,1-2.32-1.2c-1.3-1.18-2.22-3.15-2.22-5.1s.83-3.79,2-4.81a4.34,4.34,0,0,1,2.53-1A.27.27,0,0,1,19.5,3a.25.25,0,0,1-.21.24,3.78,3.78,0,0,0-2.2,1.15c-1.1,1-1.7,2.68-1.7,4.32s.6,3.2,1.73,4.19a2.33,2.33,0,0,0,1.9.79.25.25,0,0,1,.26.25.26.26,0,0,1-.26.25M12.63,21.62a7.5,7.5,0,0,1-3.44-1.12,4.68,4.68,0,0,1-2-3.59,8.58,8.58,0,0,1,2.81-6.48,7.2,7.2,0,0,1,6.29-2.6,3.65,3.65,0,0,1,1.14.18,4.35,4.35,0,0,1,1.21.65,11.56,11.56,0,0,0-3.34,2.23,7.1,7.1,0,0,0-3.11,6.1,4.72,4.72,0,0,0,1.37,3.39A4.5,4.5,0,0,0,16.5,22a3.49,3.49,0,0,1-1.14-.18A7.1,7.1,0,0,1,12.63,21.62Z"/></svg> );
const MicrosoftIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg> );
const UserCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg> );

export default function SignIn({ 
    onSignInWithEmail, 
    onSignUpWithEmail, 
    onSignInWithGoogle, 
    onSignInWithApple,
    onSignInWithMicrosoft,
    onSignInAnonymously,
    onBackToHome // New prop to handle navigation
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }
    setError('');
    if (isSignUp) {
        onSignUpWithEmail(email, password);
    } else {
        onSignInWithEmail(email, password);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-slate-100 py-12">
      <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-2xl shadow-lg animate-fade-in">
        <div className="text-center">
            <button onClick={onBackToHome} className="inline-flex items-center gap-2 mb-4 text-slate-600 hover:text-primary-600">
                <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span className="text-xl font-bold">ProjectCraft</span>
            </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-slate-500">
            {isSignUp ? 'to start your creative journey.' : 'Sign in to continue your projects.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Email address"/>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Password"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div></div>

        <div className="grid grid-cols-2 gap-3">
            <button onClick={onSignInWithGoogle} className="flex items-center justify-center w-full py-2.5 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"><GoogleIcon /></button>
            <button onClick={onSignInWithApple} className="flex items-center justify-center w-full py-2.5 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"><AppleIcon /></button>
            <button onClick={onSignInWithMicrosoft} className="flex items-center justify-center w-full py-2.5 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"><MicrosoftIcon /></button>
            <button onClick={onSignInAnonymously} className="flex items-center justify-center w-full py-2.5 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"><UserCircleIcon /></button>
        </div>

        <p className="text-sm text-center text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary-600 hover:text-primary-500 ml-1">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
