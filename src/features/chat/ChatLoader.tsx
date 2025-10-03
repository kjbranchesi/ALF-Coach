import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import ChatMVP from '../chat-mvp/ChatMVP';
import { ChatErrorBoundary } from '../../components/ErrorBoundary/ChatErrorBoundary';
import { auth } from '../../firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import '../../utils/suppressFirebaseErrors';
import { computeStageProgress } from '../../utils/stageProgress';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { loadUnified } from '../../services/ShowcaseStorage';
import { seedBlueprintFromUnified } from '../../utils/seed/seedBlueprint';

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
              {/* Brand: avoid emoji; use design-system icon */}
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
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
  const params = useParams<{ id?: string; projectId?: string }>();
  const routeParamId = params.id ?? params.projectId;
  const navigate = useNavigate();
  const location = useLocation();
  const pendingBlueprintRef = useRef<any | null>(null);
  const searchParams = new URLSearchParams(location.search || window.location.search || '');
  const showIntro = searchParams.get('intro') === '1';
  
  // Generate the actual ID immediately if it's a new blueprint
  const [actualId, setActualId] = useState(() => {
    if (routeParamId?.startsWith('new-')) {
      const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Created new blueprint ID:', newBlueprintId);

      const initParams = new URLSearchParams(location.search || window.location.search || '');
      const qpSubjectsParam = initParams.get('subjects') || '';
      const qpSubjects = qpSubjectsParam ? qpSubjectsParam.split(',').filter(Boolean) : [];
      const qpSubjectSolo = initParams.get('subject') || '';
      const qpTopic = initParams.get('topic') || '';
      const qpProjectName = initParams.get('projectName') || '';
      const qpPrimary = initParams.get('primarySubject') || '';
      const qpSubject = qpSubjects[0] || qpSubjectSolo;
      const qpAge = initParams.get('ageGroup') || '';
      const qpClassSize = initParams.get('classSize') || '';
      const qpDuration = initParams.get('duration') || 'medium';

      const newBlueprint = {
        id: newBlueprintId,
        wizardData: {
          entryPoint: 'learning_goal',
          projectTopic: qpTopic || '',
          projectName: qpProjectName || '',
          learningGoals: '',
          subjects: qpSubjects.length ? qpSubjects : (qpSubject ? [qpSubject] : []),
          primarySubject: qpPrimary || qpSubject || '',
          gradeLevel: qpAge || '',
          duration: qpDuration || 'medium',
          pblExperience: 'some',
          vision: qpTopic || 'balanced',
          subject: qpPrimary || qpSubject || '',
          ageGroup: qpAge || '',
          students: qpClassSize || '',
          location: '',
          materials: '',
          resources: '',
          scope: 'unit',
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
        projectData: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous'),
        chatHistory: []
      };

      pendingBlueprintRef.current = newBlueprint;

      unifiedStorage.saveProject({
        id: newBlueprintId,
        title: 'Untitled Project',
        userId: newBlueprint.userId || 'anonymous',
        stage: 'wizard',
        status: 'draft',
        provisional: true,
        wizardData: newBlueprint.wizardData,
        ideation: newBlueprint.ideation,
        journey: newBlueprint.journey,
        deliverables: newBlueprint.deliverables,
        capturedData: newBlueprint.capturedData,
        chatHistory: newBlueprint.chatHistory,
        createdAt: new Date(),
        updatedAt: new Date()
      }).catch(err => console.warn('[ChatLoader] Failed to create provisional record', err));

      return newBlueprintId;
    }
    return routeParamId;
  });
  
  useEffect(() => {
    if (!routeParamId || routeParamId.startsWith('new-')) {
      return;
    }
    setActualId(prev => (prev === routeParamId ? prev : routeParamId));
  }, [routeParamId]);

  const [isSeedingFromUnified, setIsSeedingFromUnified] = useState(false);

  console.log('ChatLoader initializing with id:', routeParamId, 'actualId:', actualId);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const seedId = params.get('seedId');
    if (!seedId) {
      setIsSeedingFromUnified(false);
      return;
    }

    let cancelled = false;

    const seedFromUnified = async () => {
      try {
        setIsSeedingFromUnified(true);
        const unified = await loadUnified(seedId);
        if (!unified || cancelled) {
          if (!cancelled) {
            setIsSeedingFromUnified(false);
          }
          return;
        }
        const blueprintId = seedBlueprintFromUnified(unified);
        navigate(`/app/blueprint/${blueprintId}?skip=true`, { replace: true });
      } catch (error) {
        console.warn('[ChatLoader] Failed to seed from unified project', error);
        if (!cancelled) {
          setIsSeedingFromUnified(false);
        }
      } finally {
        if (!cancelled) {
          setIsSeedingFromUnified(false);
        }
      }
    };

    seedFromUnified();

    return () => {
      cancelled = true;
      setIsSeedingFromUnified(false);
    };
  }, [location.search, navigate]);
  
  // Update URL for new blueprints using React Router
  useEffect(() => {
    if (routeParamId?.startsWith('new-') && actualId?.startsWith('bp_')) {
      // Preserve query params (e.g., ?skip=true) across redirect so chat can skip onboarding when requested
      const search = location?.search || window.location.search || '';
      navigate(`/app/blueprint/${actualId}${search}`, { replace: true });
    }
  }, [routeParamId, actualId, navigate, location]);
  
  useEffect(() => {
    async function ensureAuthentication() {
      try {
        if (!auth.currentUser) {
          console.log('[ChatLoader] No user authenticated, signing in anonymously...');
          await signInAnonymously(auth);
          console.log('[ChatLoader] Anonymous sign-in successful');
        }
      } catch (error) {
        console.error('[ChatLoader] Anonymous sign-in failed:', error);
      }
    }

    // Start authentication immediately on component mount
    ensureAuthentication();
  }, []);
  
  const { blueprint, loading, error } = useBlueprintDoc(actualId || '');

  console.log('Blueprint loading state:', { loading, error: error?.message, hasBlueprint: !!blueprint });

  if (isSeedingFromUnified || loading) {
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
    console.log('No persisted blueprint found, will rely on onboarding wizard context');
  }

  const resolvedBlueprint = blueprint || pendingBlueprintRef.current || undefined;
  console.log('Rendering chat with blueprint:', resolvedBlueprint?.wizardData || 'No wizard data yet');

  // Normalize wizard data to v2 shape before passing to chat UI
  const chatBlueprint = resolvedBlueprint ? { ...resolvedBlueprint } : undefined;

  if (blueprint && actualId) {
    const stagesData = computeStageProgress(blueprint);
    try {
      const ideationSub = stagesData.stages.find(s => s.id === 'ideation')?.substeps || [];
      const journeySub = stagesData.stages.find(s => s.id === 'journey')?.substeps || [];
      const deliverSub = stagesData.stages.find(s => s.id === 'deliverables')?.substeps || [];
      const pct = (xs: any[]) => xs.length ? Math.round((xs.filter((x: any) => x.completed).length / xs.length) * 100) : 0;
      const progress = {
        ideation: pct(ideationSub as any),
        journey: pct(journeySub as any),
        deliverables: pct(deliverSub as any)
      } as any;
      progress.overall = Math.round(((progress.ideation || 0) + (progress.journey || 0) + (progress.deliverables || 0)) / 3);
      const status = progress.overall >= 95 ? 'ready' : (progress.overall > 0 ? 'in-progress' : 'draft');
      void unifiedStorage.saveProject({ id: actualId, status, progress, stage: stagesData.current });
    } catch (e) {
      console.warn('[ChatLoader] Failed to persist progress snapshot', (e as Error)?.message);
    }
  }

  return (
    <ChatErrorBoundary 
      blueprintId={actualId}
      onReset={() => window.location.reload()}
    >
      <div className="relative h-full w-full">
        <ChatMVP projectId={actualId} projectData={chatBlueprint} showIntro={showIntro} />
      </div>
    </ChatErrorBoundary>
  );
}

// Default export for lazy loading
export default ChatLoader;
