import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { FSMProviderV2 } from '../../context/FSMContextV2';
import { ChatbotFirstInterfaceFixed } from '../../components/chat/ChatbotFirstInterfaceFixed';
import { featureFlags } from '../../utils/featureFlags';
import { SOPFlowManager } from '../../core/SOPFlowManager';
import { GeminiService } from '../../services/GeminiService';
import { ChatErrorBoundary } from '../../components/ErrorBoundary/ChatErrorBoundary';
import { auth } from '../../firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import '../../utils/suppressFirebaseErrors';
import type { WizardDataV3 } from '../wizard/wizardSchema';
import type { ProjectV3 } from '../../types/alf';
import { saveProjectDraft } from '../../services/projectPersistence';
import { mergeCapturedData, mergeProjectData, mergeWizardData } from '../../utils/draftMerge';

type DraftSnapshotPayload = {
  wizardData?: Partial<WizardDataV3> | null;
  capturedData?: Record<string, unknown> | null;
  projectData?: Partial<ProjectV3> | null;
  stage?: string;
  source?: 'wizard' | 'chat' | 'import';
};

function combineSnapshots(
  current: DraftSnapshotPayload | null,
  next: DraftSnapshotPayload
): DraftSnapshotPayload {
  if (!current) {
    return {
      ...next,
      wizardData: next.wizardData ?? null,
      capturedData: next.capturedData ?? null,
      projectData: next.projectData ?? null
    };
  }

  const wizardData = mergeWizardData(current.wizardData ?? null, next.wizardData ?? null);
  const projectData = mergeProjectData(current.projectData ?? null, next.projectData ?? null);
  const capturedData = mergeCapturedData(current.capturedData ?? null, next.capturedData ?? null);

  return {
    ...current,
    ...next,
    wizardData,
    capturedData,
    projectData,
    stage: next.stage ?? current.stage,
    source: next.source ?? current.source
  };
}

const AUTOSAVE_INTERVAL_MS = 2500;

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        {/* Simple, elegant loading indicator */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
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
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
  const location = useLocation();
  
  // Generate the actual ID immediately if it's a new blueprint
  const [actualId, setActualId] = useState(() => {
    if (id?.startsWith('new-')) {
      const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Created new blueprint ID:', newBlueprintId);
      
      // Create and save blueprint immediately for new blueprints
      // Include ALL fields that ChatLoader expects
      const newBlueprint = {
        id: newBlueprintId,
        wizardData: {
          // V2 fields from wizardSchema.ts
          entryPoint: 'learning_goal',
          projectTopic: '',
          learningGoals: '',
          subjects: [],
          primarySubject: '',
          gradeLevel: '',
          duration: 'medium',
          pblExperience: 'some',
          // Legacy fields that ChatLoader still expects
          vision: 'balanced',
          subject: '',
          ageGroup: '',
          students: '',
          location: '',
          materials: '',
          resources: '',
          scope: 'unit',
          // Metadata
          metadata: {
            createdAt: new Date(),
            lastModified: new Date(),
            version: '2.0',
            wizardCompleted: false,
            skippedFields: []
          },
          conversationState: {
            phase: 'wizard',
            contextCompleteness: { core: 0, context: 0, progressive: 0 }
          }
        },
        // Empty structures ChatLoader expects
        ideation: {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        journey: {
          phases: [],
          activities: [],
          resources: []
        },
        deliverables: {
          milestones: [],
          rubric: { criteria: [] },
          impact: { audience: '', method: '' }
        },
        capturedData: {},
        // V3 project data (will be populated by new wizard)
        projectData: null,
        // Timestamps
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
  
  // Update URL for new blueprints using React Router
  useEffect(() => {
    if (id?.startsWith('new-') && actualId?.startsWith('bp_')) {
      // Preserve query params (e.g., ?skip=true) across redirect so chat can skip onboarding when requested
      const search = location?.search || window.location.search || '';
      navigate(`/app/blueprint/${actualId}${search}`, { replace: true });
    }
  }, [id, actualId, navigate, location]);
  
  // DEFER: Ensure anonymous auth after initial render
  useEffect(() => {
    // Wait for idle time or 2 seconds before auth
    const authTimeout = setTimeout(async () => {
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
    }, 2000); // Defer by 2 seconds
    
    return () => clearTimeout(authTimeout);
  }, []);
  
  const { blueprint, loading, error, updateBlueprint, addMessage } = useBlueprintDoc(actualId || '');

  const blueprintRef = useRef(blueprint);
  useEffect(() => {
    blueprintRef.current = blueprint;
  }, [blueprint]);

  const pendingSnapshotRef = useRef<DraftSnapshotPayload | null>(null);
  const pendingResolversRef = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPersistingRef = useRef(false);
  const lastPersistTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Resolve any dangling promises to avoid hanging awaits on unmount
      pendingResolversRef.current.splice(0).forEach(resolve => resolve());
    };
  }, []);

  const flushSnapshot = useCallback(async () => {
    const snapshot = pendingSnapshotRef.current;
    const resolvers = pendingResolversRef.current.splice(0);
    pendingSnapshotRef.current = null;

    if (!snapshot) {
      resolvers.forEach(resolve => resolve());
      return;
    }

    const currentBlueprint = blueprintRef.current as any;
    const mergedWizardData = mergeWizardData(currentBlueprint?.wizardData ?? null, snapshot.wizardData ?? null);
    const mergedProjectData = mergeProjectData(currentBlueprint?.projectData ?? null, snapshot.projectData ?? null);
    const mergedCapturedData = mergeCapturedData(currentBlueprint?.capturedData ?? null, snapshot.capturedData ?? null);
    const currentUser = auth.currentUser;
    const userId = currentUser?.isAnonymous ? 'anonymous' : currentUser?.uid;

    if (!actualId || !userId) {
      resolvers.forEach(resolve => resolve());
      return;
    }

    isPersistingRef.current = true;

    try {
      await saveProjectDraft(
        userId,
        {
          wizardData: mergedWizardData,
          project: mergedProjectData,
          capturedData: mergedCapturedData
        },
        {
          draftId: actualId,
          source: snapshot.source ?? 'chat',
          metadata: {
            stage: snapshot.stage,
            title:
              mergedWizardData?.projectTopic ||
              mergedProjectData?.title ||
              currentBlueprint?.wizardData?.projectTopic ||
              currentBlueprint?.projectData?.title
          }
        }
      );
    } catch (err) {
      console.error('[ChatLoader] Failed to persist project draft', err);
    } finally {
      lastPersistTimeRef.current = Date.now();
      isPersistingRef.current = false;
      resolvers.forEach(resolve => resolve());

      if (pendingSnapshotRef.current && !timeoutRef.current) {
        const elapsed = Date.now() - lastPersistTimeRef.current;
        const delay = elapsed >= AUTOSAVE_INTERVAL_MS ? 0 : AUTOSAVE_INTERVAL_MS - elapsed;

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          void flushSnapshot();
        }, delay);
      }
    }
  }, [actualId]);

  const persistDraftSnapshot = useCallback(
    (snapshot: DraftSnapshotPayload): Promise<void> => {
      if (!actualId) {
        return Promise.resolve();
      }

      pendingSnapshotRef.current = combineSnapshots(pendingSnapshotRef.current, snapshot);

      return new Promise<void>(resolve => {
        pendingResolversRef.current.push(resolve);

        if (isPersistingRef.current || timeoutRef.current) {
          return;
        }

        const elapsed = Date.now() - lastPersistTimeRef.current;
        const delay = elapsed >= AUTOSAVE_INTERVAL_MS ? 0 : AUTOSAVE_INTERVAL_MS - elapsed;

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          void flushSnapshot();
        }, delay);
      });
    },
    [actualId, flushSnapshot]
  );

  // Initialize SOPFlowManager and GeminiService when blueprint is ready
  useEffect(() => {
    if (blueprint && !flowManager) {
      console.log('Initializing SOPFlowManager and GeminiService with existing blueprint...');
      
      // CRITICAL FIX: Sync blueprint capturedData to chat service localStorage format
      if (blueprint.capturedData) {
        const chatServiceKey = `journey-v5-${actualId}`;
        try {
          localStorage.setItem(chatServiceKey, JSON.stringify(blueprint.capturedData));
          console.log('[ChatLoader] Blueprint capturedData synced to chat service:', blueprint.capturedData);
        } catch (error) {
          console.error('[ChatLoader] Failed to sync blueprint capturedData to chat service:', error);
        }
      }
      
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

  // Normalize wizard data to v2 shape before passing to chat UI
  const chatBlueprint = blueprint ? { ...blueprint } : undefined;

  return (
    <ChatErrorBoundary 
      blueprintId={actualId}
      onReset={() => window.location.reload()}
    >
      <div className="relative h-full w-full">
        <FSMProviderV2>
          {/* Use FIXED interface with normalized wizard data */}
          <ChatbotFirstInterfaceFixed
          projectId={actualId}
          projectData={chatBlueprint}
          onStageComplete={async (stage, data) => {
            console.log('[ChatLoader] Stage complete:', stage, data);
            // Update blueprint with stage data
          if (stage === 'onboarding') {
            const wizardData = data?.wizardData as Partial<WizardDataV3> | undefined;
            const projectSnapshot = data?.project as ProjectV3 | undefined;
            const draftId = data?.draftId as string | undefined;

            console.log('[ChatLoader] Saving wizard onboarding payload:', {
              hasWizardData: Boolean(wizardData),
              hasProject: Boolean(projectSnapshot),
              draftId
            });

            const baseBlueprint = blueprint || {
              id: actualId || '',
              createdAt: new Date(),
              userId: auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous'),
              chatHistory: [],
              capturedData: {}
            };

            await updateBlueprint({
              ...baseBlueprint,
              wizardData: wizardData ?? baseBlueprint.wizardData ?? {},
              projectData: projectSnapshot ?? (baseBlueprint as any).projectData ?? null,
              draftId: draftId || (baseBlueprint as any).draftId,
              updatedAt: new Date()
            });

            await persistDraftSnapshot({
              wizardData: wizardData ?? baseBlueprint.wizardData ?? null,
              projectData: projectSnapshot ?? (baseBlueprint as any).projectData ?? null,
              capturedData: baseBlueprint.capturedData || null,
              stage: stage,
              source: 'wizard'
            });
            return;
          } else if (['bigIdea', 'essentialQuestion', 'challenge', 'phases', 'activities', 'resources', 'milestones', 'rubric', 'deliverables'].includes(stage)) {
            // Handle individual step completions - save to capturedData format
            console.log('[ChatLoader] Saving individual step data:', { stage, data });
            
          // Create or update blueprint with captured data
          const baseBlueprint = blueprint || {
            id: actualId || '',
            createdAt: new Date(),
            userId: auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous'),
            chatHistory: [],
            capturedData: {}
          };
          
          // Ensure capturedData exists and merge new data
          const currentCapturedData = baseBlueprint.capturedData || {};
          const newCapturedData = { ...currentCapturedData };
          const projectPatch = (data?.projectData as Partial<ProjectV3> | undefined) ?? undefined;
              
              // Save in the format expected by chat-service.ts
          if (data.value) {
            // Only map shorthand 'value' for known stages; otherwise rely on explicit dot-keys
            const mapAllowed = ['bigIdea','essentialQuestion','challenge','phases','activities','resources','milestones','rubric','deliverables'].includes(stage);
            Object.keys(data).forEach(key => {
              if (key.includes('.')) {
                newCapturedData[key] = data[key];
              }
            });
            if (mapAllowed) {
              const mappedKey = stage === 'bigIdea' || stage === 'essentialQuestion' || stage === 'challenge'
                ? `ideation.${stage}`
                : stage === 'phases' || stage === 'activities' || stage === 'resources'
                ? `journey.${stage}`
                : stage === 'milestones' || stage === 'rubric' || stage === 'deliverables'
                ? `deliverables.${stage}`
                : stage;
              newCapturedData[mappedKey] = data.value;
            }
          }
              
              // Also save to structured format for compatibility
              const updatedBlueprint = {
                ...baseBlueprint,
                capturedData: newCapturedData,
                updatedAt: new Date()
              };
              
              if (projectPatch && Object.keys(projectPatch).length > 0) {
                const mergedProjectData = mergeProjectData((baseBlueprint as any).projectData ?? null, projectPatch);
                if (mergedProjectData) {
                  (updatedBlueprint as any).projectData = mergedProjectData;
                }
              }
              
              // Update ideation section for compatibility
              if (['bigIdea', 'essentialQuestion', 'challenge'].includes(stage)) {
                updatedBlueprint.ideation = {
                  ...baseBlueprint.ideation,
                  [stage]: data.value || data[stage] || ''
                };
              }
              
              // Update journey section for other stages
              if (['phases', 'activities', 'resources'].includes(stage)) {
                updatedBlueprint.journey = {
                  ...baseBlueprint.journey,
                  [stage]: data.value || data[stage] || ''
                };
              }
              
              // Update deliverables section
              if (['milestones', 'rubric', 'deliverables'].includes(stage)) {
                updatedBlueprint.deliverables = {
                  ...baseBlueprint.deliverables,
                  [stage]: data.value || data[stage] || ''
                };
            }
            
            await updateBlueprint(updatedBlueprint);
            console.log('[ChatLoader] Individual step data saved to capturedData:', newCapturedData);

            // CRITICAL: Also sync with chat-service localStorage format
            const chatServiceKey = `journey-v5-${actualId}`;
            try {
              localStorage.setItem(chatServiceKey, JSON.stringify(newCapturedData));
              console.log('[ChatLoader] Data also synced to chat service localStorage key:', chatServiceKey);
            } catch (error) {
              console.error('[ChatLoader] Failed to sync with chat service storage:', error);
            }
            await persistDraftSnapshot({
              wizardData: baseBlueprint.wizardData || blueprint?.wizardData,
              capturedData: newCapturedData,
              projectData: projectPatch ?? null,
              stage,
              source: 'chat'
            });

          } else {
            // For other stages, update normally with null safety
            if (blueprint) {
              const dotCaptured: Record<string, any> = {};
              Object.keys(data || {}).forEach(key => {
                if (key.includes('.')) {
                  dotCaptured[key] = (data as any)[key];
                }
              });
              const mergedCaptured = Object.keys(dotCaptured).length
                ? {
                    ...((blueprint as any)?.capturedData || {}),
                    ...dotCaptured
                  }
                : (blueprint as any)?.capturedData;

              await updateBlueprint({
                ...blueprint,
                ...data,
                capturedData: mergedCaptured,
                updatedAt: new Date()
              });

              await persistDraftSnapshot({
                wizardData: (data as any).wizardData || blueprint.wizardData,
                capturedData: mergedCaptured || null,
                projectData: (blueprint as any)?.projectData || null,
                stage,
                source: 'chat'
              });
            } else {
              console.warn('[ChatLoader] Cannot update - blueprint is null');
              await persistDraftSnapshot({
                wizardData: (data as any).wizardData || null,
                capturedData: null,
                projectData: null,
                stage,
                source: 'chat'
              });
            }
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
      </div>
    </ChatErrorBoundary>
  );
}

// Default export for lazy loading
export default ChatLoader;
