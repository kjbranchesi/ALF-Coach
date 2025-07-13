// src/components/SignIn.jsx

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Feather, LogIn } from 'lucide-react';

// A modern sign-in component using the new Card and Button components.
// It provides a clean and focused authentication experience.

// NOTE: For a real application, you would use actual icons for social providers.
// We are using placeholders for this demonstration.
const GoogleIcon = () => <span className="font-bold">G</span>;
const AppleIcon = () => <span className="font-bold">A</span>;
const MicrosoftIcon = () => <span className="font-bold">M</span>;

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
    <div className="flex flex-col justify-center min-h-screen bg-neutral-100 py-12 px-4">
        <div className="w-full max-w-sm mx-auto">
            <div className="flex justify-center items-center gap-2 mb-6 cursor-pointer" onClick={onBackToHome}>
                <Feather className="h-7 w-7 text-primary-600" />
                <h1 className="text-xl font-bold text-neutral-800">ProjectCraft</h1>
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{isSignUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
                    <CardDescription>
                        {isSignUp ? 'to start your creative journey.' : 'Sign in to continue your projects.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"/>
                        <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-neutral-500">Or continue with</span></div></div>
                    <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" onClick={onSignInWithGoogle}><GoogleIcon /></Button>
                        <Button variant="outline" onClick={onSignInWithApple}><AppleIcon /></Button>
                        <Button variant="outline" onClick={onSignInWithMicrosoft}><MicrosoftIcon /></Button>
                        <Button variant="outline" onClick={onSignInAnonymously}><LogIn className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-center text-neutral-500 w-full">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary-600 hover:text-primary-500 ml-1">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
