import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { FSMProviderV2 } from '../../context/FSMContextV2';
import { ChatbotFirstInterface } from '../../components/chat/ChatbotFirstInterface';
import { ChatbotFirstInterfaceImproved } from '../../components/chat/ChatbotFirstInterfaceImproved';
import { ChatbotFirstInterfaceFixed } from '../../components/chat/ChatbotFirstInterfaceFixed';
import { featureFlags } from '../../utils/featureFlags';
import { SOPFlowManager } from '../../core/SOPFlowManager';
import { GeminiService } from '../../services/GeminiService';
import { ChatErrorBoundary } from '../../components/ErrorBoundary/ChatErrorBoundary';
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
  
  // Generate the actual ID immediately if it's a new blueprint
  const [actualId, setActualId] = useState(() => {
    if (id?.startsWith('new-')) {
      const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Created new blueprint ID:', newBlueprintId);
      
      // Create and save blueprint immediately for new blueprints
      const newBlueprint = {
        id: newBlueprintId,
        wizardData: {
          vision: 'balanced',
          subject: '',
          subjects: [], // Add multi-subject support
          gradeLevel: '',
          duration: '',
          groupSize: '',
          location: '',
          materials: '',
          teacherResources: '',
          initialIdeas: [] // Add initial ideas support
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous'),
        chatHistory: []
      };
      
      // Save immediately to localStorage
      const storageKey = `blueprint_${newBlueprintId}`;
      console.log('Immediately saving new blueprint to localStorage with key:', storageKey);
      localStorage.setItem(storageKey, JSON.stringify(newBlueprint));
      
      return newBlueprintId;
    }
    return id;
  });
  
  const [flowManager, setFlowManager] = useState<SOPFlowManager | null>(null);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  
  console.log('ChatLoader initializing with id:', id, 'actualId:', actualId);
  
  // Update URL for new blueprints
  useEffect(() => {
    if (id?.startsWith('new-') && actualId?.startsWith('bp_')) {
      window.history.replaceState({}, '', `/app/blueprint/${actualId}`);
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

  // Synchronize SOPFlowManager state changes with useBlueprintDoc persistence
  useEffect(() => {
    if (!flowManager) return;
    
    const handleFlowStateChange = async (flowState: any) => {
      try {
        // Convert SOPFlowManager blueprint format back to useBlueprintDoc format
        const updatedBlueprint = {
          ...blueprint,
          // Update wizard data if it exists
          wizardData: flowState.blueprintDoc?.wizard ? {
            vision: flowState.blueprintDoc.wizard.vision || blueprint?.wizardData?.vision || '',
            subject: flowState.blueprintDoc.wizard.subject || blueprint?.wizardData?.subject || '',
            ageGroup: flowState.blueprintDoc.wizard.students || blueprint?.wizardData?.ageGroup || '',
            location: flowState.blueprintDoc.wizard.location || blueprint?.wizardData?.location || '',
            materials: flowState.blueprintDoc.wizard.resources || blueprint?.wizardData?.materials || '',
            scope: flowState.blueprintDoc.wizard.scope || blueprint?.wizardData?.scope || 'unit'
          } : blueprint?.wizardData,
          // Copy over the structured blueprint data
          ideation: flowState.blueprintDoc?.ideation,
          journey: flowState.blueprintDoc?.journey,
          deliverables: flowState.blueprintDoc?.deliverables,
          // Preserve flow state for resuming
          currentStep: flowState.currentStep,
          currentStage: flowState.currentStage,
          stageStep: flowState.stageStep,
          updatedAt: new Date()
        };
        
        // Update via useBlueprintDoc hook to ensure proper persistence
        await updateBlueprint(updatedBlueprint);
        console.log('Blueprint state synchronized with SOPFlowManager changes');
      } catch (error) {
        console.error('Failed to synchronize blueprint state:', error);
      }
    };

    // Subscribe to SOPFlowManager state changes
    const unsubscribe = flowManager.subscribe(handleFlowStateChange);
    
    return unsubscribe;
  }, [flowManager, blueprint, updateBlueprint]);

  console.log('Blueprint loading state:', { loading, error: error?.message, hasBlueprint: !!blueprint });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    console.error('Blueprint error:', error);
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => { window.location.reload(); }}
      />
    );
  }

  // For new blueprints or missing data, render the chat interface anyway
  // The onboarding wizard will handle the initial setup
  if (!blueprint) {
    console.log('No blueprint found, will show onboarding wizard');
  }

  console.log('Rendering chat with blueprint:', blueprint?.wizardData || 'No wizard data yet');

  return (
    <ChatErrorBoundary 
      blueprintId={actualId}
      onReset={() => window.location.reload()}
    >
      <FSMProviderV2>
        {/* Use FIXED interface with actual AI */}
        <ChatbotFirstInterfaceFixed
          projectId={actualId}
          projectData={blueprint}
          onStageComplete={async (stage, data) => {
            console.log('[ChatLoader] Stage complete:', stage, data);
            // Update blueprint with stage data
            if (stage === 'onboarding') {
              // Ensure wizard data is properly saved
              const wizardData = data.wizardData || data;
              console.log('[ChatLoader] Saving wizard data:', wizardData);
              
              // Update the blueprint with wizard data
              await updateBlueprint({
                ...blueprint,
                wizardData: wizardData,
                updatedAt: new Date()
              });
              
              // Force a refresh to ensure chat gets updated data
              console.log('[ChatLoader] Wizard data saved, chat should now have context');
            } else {
              // For other stages, update normally
              await updateBlueprint(data);
            }
          }}
          onNavigate={(view, projectId) => {
            console.log('[ChatLoader] Navigate:', view, projectId);
            if (view === 'dashboard') {
              navigate('/app/dashboard');
            }
          }}
        />
      </FSMProviderV2>
    </ChatErrorBoundary>
  );
}

// Default export for lazy loading
export default ChatLoader;