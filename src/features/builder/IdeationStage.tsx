/**
 * IdeationStage.tsx - Phase 4 Stage-Separated Builder
 *
 * Form for capturing Big Idea, Essential Question, and Challenge.
 * Integrates with useStageController for autosave, validation, and transitions.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { useStageAI } from './hooks/useStageAI';
import { isIdeationUIComplete } from './completeness';
import { stageGuide } from '../chat-mvp/domain/stages';
import { StageAIAssistant } from './components/StageAIAssistant';
import { trackEvent } from '../../utils/analytics';
import {
  Container,
  Heading,
  Text
} from '../../design-system';
import {
  Lightbulb,
  HelpCircle,
  Target,
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export function IdeationStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<UnifiedProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [bigIdea, setBigIdea] = useState('');
  const [essentialQuestion, setEssentialQuestion] = useState('');
  const [challenge, setChallenge] = useState('');

  // Initialize stage controller
  const {
    isSaving,
    debouncedSave,
    saveAndContinueLater,
    completeStage,
    canCompleteStage,
    validationError
  } = useStageController({
    projectId: projectId || '',
    stage: 'ideation',
    blueprint,
    onBlueprintUpdate: (updated) => setBlueprint(updated)
  });

  // AI health check for gate
  const {
    isAIAvailable,
    error: aiError,
    healthChecking,
    checkAIHealth
  } = useStageAI({
    stage: 'ideation',
    currentData: {
      bigIdea,
      essentialQuestion,
      challenge,
      wizard: blueprint?.wizard
    }
  });

  // Load project data
  useEffect(() => {
    let cancelled = false;
    if (!projectId) {
      navigate('/app/dashboard');
      return () => { cancelled = true; };
    }

    const loadProject = async () => {
      if (!cancelled) setIsLoading(true);
      try {
        const storage = UnifiedStorageManager.getInstance();
        const project = await storage.loadProject(projectId);

        if (!project) {
          console.error(`[IdeationStage] Project ${projectId} not found in storage`);
          console.error('[IdeationStage] This may indicate a save timing issue or validation failure');
          if (!cancelled) {
            navigate('/app/dashboard');
          }
          return;
        }

        if (!cancelled) {
          setBlueprint(project);
          // Initialize form fields from project data
          setBigIdea(project.ideation?.bigIdea || '');
          setEssentialQuestion(project.ideation?.essentialQuestion || '');
          setChallenge(project.ideation?.challenge || '');
        }
      } catch (error) {
        console.error('[IdeationStage] Failed to load project', error);
        if (!cancelled) {
          navigate('/app/dashboard');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProject();
    return () => { cancelled = true; };
  }, [projectId, navigate]);

  // Autosave on field changes
  const handleFieldChange = (field: 'bigIdea' | 'essentialQuestion' | 'challenge', value: string) => {
    // Update local state immediately
    switch (field) {
      case 'bigIdea':
        setBigIdea(value);
        break;
      case 'essentialQuestion':
        setEssentialQuestion(value);
        break;
      case 'challenge':
        setChallenge(value);
        break;
    }

    // Trigger debounced save
    debouncedSave({
      ideation: {
        ...blueprint?.ideation,
        [field]: value
      }
    });
  };

  const handleContinueToJourney = () => {
    if (canCompleteStage()) {
      completeStage('journey');
    }
  };

  // AI Assistant: Handle suggestion acceptance
  const handleAIAccept = (field: 'bigIdea' | 'essentialQuestion' | 'challenge', text: string) => {
    // Update local state
    switch (field) {
      case 'bigIdea':
        setBigIdea(text);
        break;
      case 'essentialQuestion':
        setEssentialQuestion(text);
        break;
      case 'challenge':
        setChallenge(text);
        break;
    }

    // Trigger debounced save
    debouncedSave({
      ideation: {
        ...blueprint?.ideation,
        [field]: text
      }
    });

    // Track acceptance
    trackEvent('ai_suggestion_accepted', {
      stage: 'ideation',
      target: field
    });
  };

  // Stage guides
  const bigIdeaGuide = stageGuide('BIG_IDEA');
  const eqGuide = stageGuide('ESSENTIAL_QUESTION');
  const challengeGuide = stageGuide('CHALLENGE');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
        <Container className="pt-24 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full" />
              </div>
              <Text color="secondary">Loading project...</Text>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!blueprint) {
    return null;
  }

  // AI Gate - Block entire stage if AI unavailable
  if (!isAIAvailable) {
    const handleRetry = async () => {
      trackEvent('ai_gate_retry', { stage: 'ideation', context: 'full_page' });
      const success = await checkAIHealth();
      if (success) {
        trackEvent('ai_health_recovered', { stage: 'ideation', context: 'full_page' });
      }
    };

    const handleDiagnostics = () => {
      trackEvent('ai_diagnostics_opened', { stage: 'ideation', context: 'full_page' });
      console.group('🔍 AI Diagnostics - Ideation Stage');
      console.log('Feature Enabled:', import.meta.env.VITE_FEATURE_STAGE_ASSISTANT);
      console.log('Gemini Enabled:', import.meta.env.VITE_GEMINI_ENABLED);
      console.log('API Key Present:', !!import.meta.env.VITE_GEMINI_API_KEY);
      console.log('AI Available:', isAIAvailable);
      console.log('Error:', aiError);
      console.groupEnd();
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
        <Container className="pt-24 pb-20">
          <div className="max-w-2xl mx-auto">
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-8 space-y-6">
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Heading level={2} className="text-slate-900 dark:text-slate-50 mb-2">
                    AI Required
                  </Heading>
                  <Text color="secondary">
                    {aiError || 'The Ideation stage requires AI to function. Please configure your AI settings to continue.'}
                  </Text>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={healthChecking}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {healthChecking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Checking AI Connection...
                    </>
                  ) : (
                    'Retry Connection'
                  )}
                </button>

                <Link
                  to="/app/setup/ai"
                  onClick={() => trackEvent('ai_setup_opened', { stage: 'ideation', source: 'full_page_gate' })}
                  className="block w-full px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50 font-semibold text-center transition-all duration-200"
                >
                  Configure AI Settings
                </Link>

                <button
                  onClick={handleDiagnostics}
                  className="w-full px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-all duration-200"
                >
                  Show Diagnostics
                </button>

                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="w-full px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-500 font-medium transition-all duration-200"
                >
                  Return to Dashboard
                </button>
              </div>

              {/* Help Text */}
              <div className="squircle-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 px-4 py-3">
                <Text size="sm" color="secondary" className="text-center">
                  <strong>Why AI is required:</strong> This app uses AI to provide intelligent suggestions,
                  guidance, and assistance throughout your project design process. Without AI, the experience
                  would be significantly degraded.
                </Text>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Avoid invoking canCompleteStage() during render (it updates state inside the hook).
  // For UI enablement and badges, use a pure check of local field completeness.
  const isComplete = isIdeationUIComplete(bigIdea, essentialQuestion, challenge);
  const hasAnyContent = Boolean(bigIdea.trim() || essentialQuestion.trim() || challenge.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      {/* Background gradient overlay */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />

      <div className="relative">
        <Container className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Two-column layout: form + AI assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Left column: Form */}
              <div className="space-y-8">
                {/* Header */}
                <header className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 squircle-sm bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Heading level={1} className="text-slate-900 dark:text-slate-50">
                    Ideation
                  </Heading>
                  <Text color="secondary" size="sm">
                    Define your Big Idea, Essential Question, and Challenge
                  </Text>
                </div>
              </div>

              {/* Project title */}
              {blueprint.title && (
                <div className="squircle-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
                  <Text size="sm" color="secondary" className="mb-1">
                    Project
                  </Text>
                  <Heading level={3} className="text-slate-900 dark:text-slate-50">
                    {blueprint.title}
                  </Heading>
                </div>
              )}

              {/* Progress indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span className="font-medium">Stage 1 of 3</span>
                </div>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-1/3 transition-all duration-500" />
                </div>
              </div>

              {/* Validation status */}
              {isComplete && hasAnyContent && (
                <div className="flex items-center gap-2 px-4 py-3 squircle-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <Text className="text-emerald-800 dark:text-emerald-200 font-medium">
                    Ideation complete! Ready to continue to Journey.
                  </Text>
                </div>
              )}

              {validationError && hasAnyContent && (
                <div className="flex items-center gap-2 px-4 py-3 squircle-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <Text className="text-amber-800 dark:text-amber-200 font-medium">
                    {validationError}
                  </Text>
                </div>
              )}

              {/* Autosave indicator */}
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="animate-spin w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full" />
                  <span>Saving...</span>
                </div>
              )}
            </header>

            {/* Form fields */}
            <div className="space-y-6">
              {/* Big Idea */}
              <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block">
                      <Heading level={3} className="text-slate-900 dark:text-slate-50">
                        Big Idea
                      </Heading>
                      <Text size="sm" color="secondary" className="mt-1">
                        {bigIdeaGuide.what}
                      </Text>
                    </label>
                    <textarea
                      value={bigIdea}
                      onChange={(e) => handleFieldChange('bigIdea', e.target.value)}
                      placeholder="e.g., 'Systems thinking helps us understand interconnected challenges'"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      rows={3}
                    />
                    <Text size="xs" color="secondary">
                      💡 {bigIdeaGuide.tip}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Essential Question */}
              <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block">
                      <Heading level={3} className="text-slate-900 dark:text-slate-50">
                        Essential Question
                      </Heading>
                      <Text size="sm" color="secondary" className="mt-1">
                        {eqGuide.what}
                      </Text>
                    </label>
                    <textarea
                      value={essentialQuestion}
                      onChange={(e) => handleFieldChange('essentialQuestion', e.target.value)}
                      placeholder="e.g., 'How can we use systems thinking to address local environmental challenges?'"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                      rows={3}
                    />
                    <Text size="xs" color="secondary">
                      💡 {eqGuide.tip}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Challenge */}
              <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block">
                      <Heading level={3} className="text-slate-900 dark:text-slate-50">
                        Challenge
                      </Heading>
                      <Text size="sm" color="secondary" className="mt-1">
                        {challengeGuide.what}
                      </Text>
                    </label>
                    <textarea
                      value={challenge}
                      onChange={(e) => handleFieldChange('challenge', e.target.value)}
                      placeholder="e.g., 'Create a systems map and action plan for the school board showing how to reduce campus waste by 50%'"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                      rows={4}
                    />
                    <Text size="xs" color="secondary">
                      💡 {challengeGuide.tip}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={saveAndContinueLater}
                disabled={isSaving}
                className="squircle-button flex items-center gap-2 px-5 py-2.5
                           bg-white/80 dark:bg-slate-800/80
                           hover:bg-white dark:hover:bg-slate-800
                           backdrop-blur-md
                           border border-slate-200/60 dark:border-slate-700/60
                           text-slate-700 dark:text-slate-300 font-medium text-sm
                           shadow-sm hover:shadow-md
                           active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                <span>Save & Exit</span>
              </button>

              <button
                onClick={handleContinueToJourney}
                disabled={!isComplete || isSaving}
                className="squircle-button flex items-center gap-2 px-5 py-2.5
                           bg-gradient-to-b from-blue-500 to-blue-600
                           hover:from-blue-600 hover:to-blue-700
                           active:scale-[0.98]
                           text-white font-medium text-sm
                           shadow-lg shadow-blue-500/25
                           hover:shadow-xl hover:shadow-blue-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                           transition-all duration-200"
              >
                <span>Continue to Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

                {/* Help text */}
                <div className="squircle-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
                  <Text size="sm" color="secondary" className="leading-relaxed">
                    <strong>Tip:</strong> Your work is automatically saved as you type. You can leave at any time and pick up where you left off from the Dashboard.
                  </Text>
                </div>
              </div>

              {/* Right column: AI Assistant */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <StageAIAssistant
                  stage="ideation"
                  currentData={{
                    bigIdea,
                    essentialQuestion,
                    challenge,
                    wizard: blueprint?.wizard
                  }}
                  onAccept={handleAIAccept}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
