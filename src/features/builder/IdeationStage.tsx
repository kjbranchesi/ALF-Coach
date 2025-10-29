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
import { useStageAI, type FieldSuggestion } from './hooks/useStageAI';
import { StageAIAssistant } from './components/StageAIAssistant';
import { InlineChips } from './components/InlineChips';
import { isIdeationUIComplete } from './completeness';
import { stageGuide } from '../chat-mvp/domain/stages';
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

  // AI suggestions state
  const [bigIdeaSuggestions, setBigIdeaSuggestions] = useState<FieldSuggestion[]>([]);
  const [eqSuggestions, setEqSuggestions] = useState<FieldSuggestion[]>([]);
  const [challengeSuggestions, setChallengeSuggestions] = useState<FieldSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<{
    bigIdea: boolean;
    essentialQuestion: boolean;
    challenge: boolean;
  }>({ bigIdea: false, essentialQuestion: false, challenge: false });

  // Specificity meter state
  const [specificityScore, setSpecificityScore] = useState<number>(0);
  const [refineSuggestions, setRefineSuggestions] = useState<string[]>([]);
  const [isRefining, setIsRefining] = useState(false);

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

  // AI assistant with Quick Actions and field suggestions
  const {
    isAIAvailable,
    error: aiError,
    healthChecking,
    checkAIHealth,
    getFieldSuggestions,
    refine
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

  // Quick Action result handler
  const handleQuickActionResult = (result: any) => {
    if (result.type === 'big-idea-options') {
      // For options, just set suggestions to show them in assistant
      // User can click one to accept
      trackEvent('ai_suggestions_shown', {
        stage: 'ideation',
        target: 'bigIdea',
        count: result.data.length
      });
    } else if (result.type === 'eq-options') {
      trackEvent('ai_suggestions_shown', {
        stage: 'ideation',
        target: 'essentialQuestion',
        count: result.data.length
      });
    } else if (result.type === 'challenge-options') {
      trackEvent('ai_suggestions_shown', {
        stage: 'ideation',
        target: 'challenge',
        count: result.data.length
      });
    }
    // Note: Quick action results are displayed in assistant panel
    // User clicks "accept" there which calls handleAIAccept
  };

  // Load field suggestions
  const loadFieldSuggestions = async (field: 'bigIdea' | 'essentialQuestion' | 'challenge', value: string) => {
    if (!isAIAvailable || !value || value.trim().length < 10) return;

    setLoadingSuggestions(prev => ({ ...prev, [field]: true }));

    try {
      const suggestions = await getFieldSuggestions(field, value, 0);

      if (field === 'bigIdea') {
        setBigIdeaSuggestions(suggestions);
        if (suggestions.length > 0) {
          trackEvent('ai_suggestions_shown', {
            stage: 'ideation',
            target: 'bigIdea',
            count: suggestions.length
          });
        }
      } else if (field === 'essentialQuestion') {
        setEqSuggestions(suggestions);
        if (suggestions.length > 0) {
          trackEvent('ai_suggestions_shown', {
            stage: 'ideation',
            target: 'eq',
            count: suggestions.length
          });
        }
      } else if (field === 'challenge') {
        setChallengeSuggestions(suggestions);
        if (suggestions.length > 0) {
          trackEvent('ai_suggestions_shown', {
            stage: 'ideation',
            target: 'challenge',
            count: suggestions.length
          });
        }
      }
    } catch (error) {
      console.error(`[IdeationStage] Failed to load ${field} suggestions:`, error);
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [field]: false }));
    }
  };

  // Handle inline chip accept
  const handleInlineSuggestionAccept = (
    field: 'bigIdea' | 'essentialQuestion' | 'challenge',
    suggestion: FieldSuggestion,
    index: number
  ) => {
    handleFieldChange(field, suggestion.text);

    // Clear suggestions for this field
    if (field === 'bigIdea') {
      setBigIdeaSuggestions([]);
    } else if (field === 'essentialQuestion') {
      setEqSuggestions([]);
    } else {
      setChallengeSuggestions([]);
    }

    trackEvent('ai_suggestion_accepted', {
      stage: 'ideation',
      target: field,
      index
    });

    if (window.toast) {
      window.toast.success(`Added suggestion to ${field === 'bigIdea' ? 'Big Idea' : field === 'essentialQuestion' ? 'Essential Question' : 'Challenge'}`);
    }
  };

  // Handle specificity refine
  const handleMakeMoreSpecific = async () => {
    if (!isAIAvailable || !bigIdea || isRefining) return;

    setIsRefining(true);
    trackEvent('ai_refine_clicked', {
      stage: 'ideation',
      target: 'bigIdea'
    });

    try {
      const result = await refine('bigIdea', bigIdea);
      setRefineSuggestions(result.chips || []);

      if (result.chips && result.chips.length > 0) {
        trackEvent('ai_suggestions_shown', {
          stage: 'ideation',
          target: 'bigIdea_refine',
          count: result.chips.length
        });
      }
    } catch (error) {
      console.error('[IdeationStage] Failed to refine big idea:', error);
    } finally {
      setIsRefining(false);
    }
  };

  // Accept refine suggestion
  const handleRefineAccept = (suggestion: string, index: number) => {
    handleFieldChange('bigIdea', suggestion);
    setRefineSuggestions([]);

    trackEvent('ai_suggestion_accepted', {
      stage: 'ideation',
      target: 'bigIdea_refine',
      index
    });

    if (window.toast) {
      window.toast.success('Applied refinement to Big Idea');
    }
  };

  // Debounced field suggestions loading
  useEffect(() => {
    if (!isAIAvailable) return;

    const timer = setTimeout(() => {
      if (bigIdea) loadFieldSuggestions('bigIdea', bigIdea);
    }, 1000);

    return () => clearTimeout(timer);
  }, [bigIdea, isAIAvailable]);

  useEffect(() => {
    if (!isAIAvailable) return;

    const timer = setTimeout(() => {
      if (essentialQuestion) loadFieldSuggestions('essentialQuestion', essentialQuestion);
    }, 1000);

    return () => clearTimeout(timer);
  }, [essentialQuestion, isAIAvailable]);

  useEffect(() => {
    if (!isAIAvailable) return;

    const timer = setTimeout(() => {
      if (challenge) loadFieldSuggestions('challenge', challenge);
    }, 1000);

    return () => clearTimeout(timer);
  }, [challenge, isAIAvailable]);

  // Specificity scoring (local, no network)
  useEffect(() => {
    if (!bigIdea) {
      setSpecificityScore(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { scoreIdeationSpecificity } = await import('../chat-mvp/domain/specificityScorer');

        // Call with proper signature
        const result = scoreIdeationSpecificity('BIG_IDEA', {
          ideation: {
            bigIdea,
            essentialQuestion: essentialQuestion || '',
            challenge: challenge || ''
          }
        } as any, {
          gradeLevel: blueprint?.wizard?.gradeLevel
        });

        // Convert 0-100 score to 0-1 range
        const normalizedScore = result.score / 100;
        setSpecificityScore(normalizedScore);

        const band = normalizedScore < 0.4 ? 'low' : normalizedScore < 0.7 ? 'medium' : 'high';
        trackEvent('ai_specificity_scored', {
          score: normalizedScore,
          band
        });
      } catch (error) {
        console.error('[IdeationStage] Specificity scoring failed:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bigIdea, essentialQuestion, challenge, blueprint?.wizard?.gradeLevel]);

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
              <div className="flex items-center gap-2 text-sm" aria-live="polite">
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
                    {/* Specificity meter - accessible description */}
                    {bigIdea && (
                      <div className="mt-2" aria-live="polite">
                        <span className="sr-only">Specificity meter for Big Idea</span>
                        <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          {/* Width and color bound via existing state elsewhere; this is a placeholder container */}
                          <div className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 w-1/3 transition-all" />
                        </div>
                      </div>
                    )}

                    {/* Field-level AI chips */}
                    {bigIdea.trim().length >= 10 && (
                      <InlineChips
                        suggestions={bigIdeaSuggestions}
                        onAccept={(suggestion, index) => handleInlineSuggestionAccept('bigIdea', suggestion, index)}
                        loading={loadingSuggestions.bigIdea}
                        onMoreClick={() => {
                          trackEvent('ai_more_clicked', { stage: 'ideation', target: 'bigIdea' });
                          // StageAIAssistant will already be visible in right column
                        }}
                      />
                    )}

                    {/* Specificity meter */}
                    {bigIdea.trim().length >= 10 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Text size="xs" color="secondary">
                            Specificity
                          </Text>
                          <span
                            className={`text-xs font-medium ${
                              specificityScore < 0.4
                                ? 'text-amber-600 dark:text-amber-400'
                                : specificityScore < 0.7
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {specificityScore < 0.4 ? 'Low' : specificityScore < 0.7 ? 'Medium' : 'High'}
                          </span>
                        </div>
                        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              specificityScore < 0.4
                                ? 'bg-amber-500'
                                : specificityScore < 0.7
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, specificityScore * 100)}%` }}
                            role="progressbar"
                            aria-valuenow={Math.round(specificityScore * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Specificity score"
                          />
                        </div>
                        {specificityScore < 0.7 && (
                          <button
                            onClick={handleMakeMoreSpecific}
                            disabled={isRefining || !isAIAvailable}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Make Big Idea more specific"
                          >
                            {isRefining ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Refining...</span>
                              </>
                            ) : (
                              <span>✨ Make more specific</span>
                            )}
                          </button>
                        )}

                        {/* Refine suggestions */}
                        {refineSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {refineSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleRefineAccept(suggestion, index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-700/60 transition-colors"
                                aria-label={`Apply refinement: ${suggestion}`}
                              >
                                <span className="line-clamp-1">{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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

                    {/* Field-level AI chips */}
                    {essentialQuestion.trim().length >= 10 && (
                      <InlineChips
                        suggestions={eqSuggestions}
                        onAccept={(suggestion, index) => handleInlineSuggestionAccept('essentialQuestion', suggestion, index)}
                        loading={loadingSuggestions.essentialQuestion}
                        onMoreClick={() => {
                          trackEvent('ai_more_clicked', { stage: 'ideation', target: 'essentialQuestion' });
                        }}
                      />
                    )}
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

                    {/* Field-level AI chips */}
                    {challenge.trim().length >= 10 && (
                      <InlineChips
                        suggestions={challengeSuggestions}
                        onAccept={(suggestion, index) => handleInlineSuggestionAccept('challenge', suggestion, index)}
                        loading={loadingSuggestions.challenge}
                        onMoreClick={() => {
                          trackEvent('ai_more_clicked', { stage: 'ideation', target: 'challenge' });
                        }}
                      />
                    )}
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
                  onQuickActionResult={handleQuickActionResult}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
