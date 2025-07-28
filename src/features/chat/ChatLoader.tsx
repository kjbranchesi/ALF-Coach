import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { FSMProviderV2 } from '../../context/FSMContextV2';
import { ChatContainer } from './ChatContainer';
import { Sparkles } from 'lucide-react';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { auth } from '../../firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import '../../utils/suppressFirebaseErrors';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-soft p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-30" />
            </motion.div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Loading Gemini...</h2>
              <p className="text-slate-600">Preparing your personalized learning assistant</p>
            </div>
            
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-soft p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Unable to Load Blueprint</h2>
            <p className="text-slate-600">{error.message}</p>
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={onRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ChatLoader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('ChatLoader initializing with id:', id);
  
  // Ensure anonymous auth before loading blueprint
  useEffect(() => {
    const ensureAuth = async () => {
      if (!auth.currentUser) {
        try {
          console.log('No user authenticated, signing in anonymously...');
          await signInAnonymously(auth);
          console.log('Anonymous sign-in successful');
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          // Continue anyway - localStorage fallback will be used
        }
      }
    };
    ensureAuth();
  }, []);
  
  const { blueprint, loading, error, updateBlueprint, addMessage } = useBlueprintDoc(id || '');

  console.log('Blueprint loading state:', { loading, error: error?.message, hasBlueprint: !!blueprint });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !blueprint) {
    console.error('Blueprint error:', error || 'Blueprint not found');
    return (
      <ErrorDisplay 
        error={error || new Error('Blueprint not found')} 
        onRetry={() => { window.location.reload(); }}
      />
    );
  }

  console.log('Rendering chat with blueprint:', blueprint.wizardData);

  return (
    <ChatErrorBoundary blueprintId={id}>
      <FSMProviderV2>
        <ChatContainer 
          wizardData={blueprint.wizardData}
          blueprintId={id || ''}
          onComplete={() => navigate(`/app/blueprint/${id}/review`)}
        />
      </FSMProviderV2>
    </ChatErrorBoundary>
  );
}