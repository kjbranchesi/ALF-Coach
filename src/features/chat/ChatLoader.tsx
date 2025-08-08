import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { FSMProviderV2 } from '../../context/FSMContextV2';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { SOPFlowManager } from '../../core/SOPFlowManager';
import { GeminiService } from '../../services/GeminiService';
// import { ChatErrorBoundary } from './ChatErrorBoundary';
import { auth } from '../../firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import '../../utils/suppressFirebaseErrors';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        {/* Simple, elegant loading indicator */}
        <div className="relative w-16 h-16 mx-auto">
          <motion.div
            className="absolute inset-0 border-4 border-slate-200 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-slate-700">Preparing your workspace</h2>
          <p className="text-sm text-slate-500">Just a moment...</p>
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
  const [actualId, setActualId] = useState(id);
  const [flowManager, setFlowManager] = useState<SOPFlowManager | null>(null);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  
  console.log('ChatLoader initializing with id:', id);
  
  // Handle "new-" prefixed IDs by creating a new blueprint
  useEffect(() => {
    if (id?.startsWith('new-') && !actualId?.startsWith('bp_')) {
      // Generate a real blueprint ID only once
      const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setActualId(newBlueprintId);
      // Update the URL to use the real blueprint ID
      window.history.replaceState({}, '', `/app/blueprint/${newBlueprintId}`);
      console.log('Created new blueprint ID:', newBlueprintId);
    } else if (!id?.startsWith('new-')) {
      setActualId(id);
    }
  }, [id, actualId]);
  
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
  
  const { blueprint, loading, error, updateBlueprint, addMessage } = useBlueprintDoc(actualId || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [hasCreatedBlueprint, setHasCreatedBlueprint] = useState(false);

  // Create a new blueprint if this is a new one
  useEffect(() => {
    if (id?.startsWith('new-') && !loading && !blueprint && !isCreatingNew && !hasCreatedBlueprint && actualId) {
      setIsCreatingNew(true);
      setHasCreatedBlueprint(true);
      // Create a minimal blueprint structure
      const newBlueprint = {
        id: actualId,
        wizardData: {
          vision: 'balanced',
          subject: '',
          gradeLevel: '',
          duration: '',
          groupSize: '',
          location: '',
          materials: '',
          teacherResources: ''
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: auth.currentUser?.uid || 'anonymous',
        chatHistory: []
      };
      
      // Save to localStorage (Firestore will sync later)
      localStorage.setItem(`blueprint_${actualId}`, JSON.stringify(newBlueprint));
      
      // Update the URL without reloading
      window.history.replaceState({}, '', `/app/blueprint/${actualId}`);
      
      // Instead of reloading, trigger the useBlueprintDoc hook to re-fetch
      // by updating a dependency or calling updateBlueprint
      if (updateBlueprint) {
        updateBlueprint(newBlueprint);
        setIsCreatingNew(false); // Reset the flag after creating
      }
    }
  }, [id, loading, blueprint, actualId, isCreatingNew, hasCreatedBlueprint]);

  // Initialize SOPFlowManager and GeminiService when blueprint is ready
  useEffect(() => {
    if (blueprint && !flowManager) {
      console.log('Initializing SOPFlowManager and GeminiService with existing blueprint...');
      
      // Convert blueprint data to SOPTypes.BlueprintDoc format
      const sopBlueprintDoc = {
        userId: blueprint.userId || 'anonymous',
        wizard: {
          vision: blueprint.wizardData?.vision || '',
          subject: blueprint.wizardData?.subject || '',
          students: blueprint.wizardData?.ageGroup || blueprint.wizardData?.students || '',
          location: blueprint.wizardData?.location || '',
          resources: blueprint.wizardData?.materials || blueprint.wizardData?.resources || '',
          scope: blueprint.wizardData?.scope || 'unit'
        },
        ideation: blueprint.ideation || {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        journey: blueprint.journey || {
          phases: [],
          activities: [],
          resources: []
        },
        deliverables: blueprint.deliverables || {
          milestones: [],
          rubric: { criteria: [] },
          impact: { audience: '', method: '' }
        },
        timestamps: {
          created: blueprint.createdAt || new Date(),
          updated: blueprint.updatedAt || new Date()
        },
        schemaVersion: '1.0.0',
        // Preserve saved flow state if available
        currentStep: (blueprint as any).currentStep,
        currentStage: (blueprint as any).currentStage,
        stageStep: (blueprint as any).stageStep
      };
      
      // Pass the existing blueprint to SOPFlowManager so it can detect the current step
      const fm = new SOPFlowManager(sopBlueprintDoc, actualId, blueprint.userId);
      const gs = new GeminiService();
      setFlowManager(fm);
      setGeminiService(gs);
      
      console.log('SOPFlowManager initialized with current step:', fm.getState().currentStep);
    }
  }, [blueprint, actualId]);

  console.log('Blueprint loading state:', { loading, error: error?.message, hasBlueprint: !!blueprint });

  if (loading || isCreatingNew || !flowManager || !geminiService) {
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
    <FSMProviderV2>
      <ChatInterface 
        flowManager={flowManager}
        geminiService={geminiService}
      />
    </FSMProviderV2>
  );
}