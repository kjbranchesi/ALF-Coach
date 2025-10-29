/**
 * JourneyStage.tsx - Phase 5 Stage-Separated Builder
 *
 * Form for defining learning journey phases.
 * Integrates with useStageController for autosave, validation, and transitions.
 *
 * NOTE: Currently only phase NAMES are editable. The `activities`, `focus`, and
 * `checkpoint` fields are defined in the Phase interface but not exposed in the UI.
 * These will be implemented in a future "Zoom-In" detail editor (Phase 7+).
 * For now, validation only requires 3+ phases with names (see stages.ts:348).
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { useStageAI, type FieldSuggestion } from './hooks/useStageAI';
import { StageAIAssistant } from './components/StageAIAssistant';
import { InlineChips } from './components/InlineChips';
import { isJourneyUIComplete } from './completeness';
import { stageGuide } from '../chat-mvp/domain/stages';
import { trackEvent } from '../../utils/analytics';
import {
  Container,
  Heading,
  Text
} from '../../design-system';
import {
  Map,
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface Phase {
  id: string;
  name: string;
  focus?: string;
  activities: string[];
  checkpoint?: string;
}

export function JourneyStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<UnifiedProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [phases, setPhases] = useState<Phase[]>([]);
  const [phaseSuggestions, setPhaseSuggestions] = useState<Map<number, FieldSuggestion[]>>(new Map());
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<number>>(new Set());

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
    stage: 'journey',
    blueprint,
    onBlueprintUpdate: (updated) => setBlueprint(updated)
  });

  // AI assistant with Quick Actions and field suggestions
  const {
    isAIAvailable,
    error: aiError,
    healthChecking,
    checkAIHealth,
    getFieldSuggestions
  } = useStageAI({
    stage: 'journey',
    currentData: {
      bigIdea: blueprint?.ideation?.bigIdea,
      essentialQuestion: blueprint?.ideation?.essentialQuestion,
      challenge: blueprint?.ideation?.challenge,
      wizard: blueprint?.wizard,
      phases
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
          console.error('[JourneyStage] Project not found');
          if (!cancelled) navigate('/app/dashboard');
          return;
        }

        if (!cancelled) {
          setBlueprint(project);
          // Initialize phases from project data or create empty array
          const existingPhases = project.journey?.phases || [];
          if (existingPhases.length > 0) {
            setPhases(existingPhases.map((p, idx) => ({
              id: p.id || `p${idx + 1}`,
              name: p.name || '',
              focus: p.focus,
              activities: p.activities || [],
              checkpoint: p.checkpoint
            })));
          } else {
            // Start with 3 empty phases (minimum required)
            setPhases([
              { id: 'p1', name: '', activities: [] },
              { id: 'p2', name: '', activities: [] },
              { id: 'p3', name: '', activities: [] }
            ]);
          }
        }
      } catch (error) {
        console.error('[JourneyStage] Failed to load project', error);
        if (!cancelled) navigate('/app/dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProject();
    return () => { cancelled = true; };
  }, [projectId, navigate]);

  // Autosave phases when they change
  const handlePhasesChange = (updatedPhases: Phase[]) => {
    setPhases(updatedPhases);

    // Trigger debounced save
    debouncedSave({
      journey: {
        ...blueprint?.journey,
        phases: updatedPhases.map(p => ({
          id: p.id,
          name: p.name,
          focus: p.focus,
          activities: p.activities,
          checkpoint: p.checkpoint
        })),
        resources: blueprint?.journey?.resources || []
      }
    });
  };

  // Add new phase
  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: `p${phases.length + 1}`,
      name: '',
      activities: []
    };
    handlePhasesChange([...phases, newPhase]);
  };

  // Remove phase
  const handleRemovePhase = (index: number) => {
    if (phases.length <= 3) {
      // Don't allow removing below minimum required (3 phases)
      return;
    }
    const updatedPhases = phases.filter((_, i) => i !== index);
    handlePhasesChange(updatedPhases);
  };

  // Update phase name
  const handlePhaseNameChange = (index: number, name: string) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = { ...updatedPhases[index], name };
    handlePhasesChange(updatedPhases);
  };

  // Move phase up
  const handleMovePhaseUp = (index: number) => {
    if (index === 0) return;
    const updatedPhases = [...phases];
    [updatedPhases[index - 1], updatedPhases[index]] = [updatedPhases[index], updatedPhases[index - 1]];
    handlePhasesChange(updatedPhases);
  };

  // Move phase down
  const handleMovePhaseDown = (index: number) => {
    if (index === phases.length - 1) return;
    const updatedPhases = [...phases];
    [updatedPhases[index], updatedPhases[index + 1]] = [updatedPhases[index + 1], updatedPhases[index]];
    handlePhasesChange(updatedPhases);
  };

  const handleContinueToDeliverables = () => {
    if (canCompleteStage()) {
      completeStage('deliverables');
    }
  };

  // Quick Action result handler
  const handleQuickActionResult = (result: any) => {
    if (result.type === 'phases') {
      // Generate 4 Phases - Replace with new phases
      const newPhases: Phase[] = result.data.map((name: string, idx: number) => ({
        id: `p${idx + 1}`,
        name,
        activities: []
      }));
      handlePhasesChange(newPhases);
      trackEvent('ai_suggestion_accepted', {
        stage: 'journey',
        action: 'generate-phases',
        count: newPhases.length
      });
    } else if (result.type === 'phase-names') {
      // Rename Phases For Clarity - Update existing phase names
      const updatedPhases = phases.map((phase, idx) => ({
        ...phase,
        name: result.data[idx] || phase.name
      }));
      handlePhasesChange(updatedPhases);
      trackEvent('ai_suggestion_accepted', {
        stage: 'journey',
        action: 'rename-phases',
        count: result.data.length
      });
    } else if (result.type === 'activities') {
      // Add Activities To Phase - Append to specific phase
      const phaseIndex = result.phaseIndex;
      const updatedPhases = [...phases];
      updatedPhases[phaseIndex] = {
        ...updatedPhases[phaseIndex],
        activities: [...(updatedPhases[phaseIndex].activities || []), ...result.data]
      };
      handlePhasesChange(updatedPhases);
      trackEvent('ai_suggestion_accepted', {
        stage: 'journey',
        action: 'add-activities',
        phaseIndex,
        count: result.data.length
      });
    }
  };

  // Load field suggestions for a phase
  const loadPhaseSuggestions = async (index: number, name: string) => {
    if (!isAIAvailable || !name || name.trim().length < 3) {
      return;
    }

    setLoadingSuggestions(prev => new Set(prev).add(index));

    try {
      const suggestions = await getFieldSuggestions('phaseName', name, index);
      setPhaseSuggestions(prev => new Map(prev).set(index, suggestions));
    } catch (error) {
      console.error('[JourneyStage] Failed to load suggestions:', error);
    } finally {
      setLoadingSuggestions(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  // Handle inline chip accept
  const handleInlineSuggestionAccept = (index: number, suggestion: FieldSuggestion) => {
    handlePhaseNameChange(index, suggestion.text);
    trackEvent('ai_suggestion_accepted', {
      stage: 'journey',
      target: 'phase_name',
      index
    });
    // Clear suggestions for this field after accept
    setPhaseSuggestions(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  };

  // Load suggestions when phase names change (debounced)
  useEffect(() => {
    if (!isAIAvailable) return;

    const timer = setTimeout(() => {
      phases.forEach((phase, idx) => {
        if (phase.name && phase.name.trim().length >= 3) {
          loadPhaseSuggestions(idx, phase.name);
        }
      });
    }, 1000); // Debounce 1s after typing stops

    return () => clearTimeout(timer);
  }, [phases, isAIAvailable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stage guide
  const journeyGuide = stageGuide('JOURNEY');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
        <Container className="pt-24 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 rounded-full" />
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
      trackEvent('ai_gate_retry', { stage: 'journey', context: 'full_page' });
      const success = await checkAIHealth();
      if (success) {
        trackEvent('ai_health_recovered', { stage: 'journey', context: 'full_page' });
      }
    };

    const handleDiagnostics = () => {
      trackEvent('ai_diagnostics_opened', { stage: 'journey', context: 'full_page' });
      console.group('🔍 AI Diagnostics - Journey Stage');
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
                    {aiError || 'The Journey stage requires AI to function. Please configure your AI settings to continue.'}
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
                  onClick={() => trackEvent('ai_setup_opened', { stage: 'journey', source: 'full_page_gate' })}
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

  const hasMinimumPhases = phases.length >= 3;
  const hasNamedPhases = phases.filter(p => p.name.trim()).length >= 3;
  const isComplete = isJourneyUIComplete(phases);

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
                <div className="flex items-center justify-center w-12 h-12 squircle-sm bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Heading level={1} className="text-slate-900 dark:text-slate-50">
                    Learning Journey
                  </Heading>
                  <Text color="secondary" size="sm">
                    {journeyGuide.what}
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                  <span className="font-medium">Stage 2 of 3</span>
                </div>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-2/3 transition-all duration-500" />
                </div>
              </div>

              {/* Validation status */}
              {isComplete && hasNamedPhases && (
                <div className="flex items-center gap-2 px-4 py-3 squircle-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <Text className="text-emerald-800 dark:text-emerald-200 font-medium">
                    Journey complete! Ready to continue to Deliverables.
                  </Text>
                </div>
              )}

              {validationError && (hasMinimumPhases || phases.length > 0) && (
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

              {/* Guidance */}
              <div className="squircle-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 px-6 py-4">
                <Text size="sm" className="text-purple-800 dark:text-purple-200 leading-relaxed">
                  💡 <strong>Tip:</strong> {journeyGuide.tip}
                </Text>
              </div>
            </header>

            {/* Phase List */}
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Phase number and drag handle */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                        {index + 1}
                      </div>
                      <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    </div>

                    {/* Phase content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => handlePhaseNameChange(index, e.target.value)}
                          placeholder={`Phase ${index + 1} name (e.g., "Research & Analysis")`}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium transition-all"
                        />
                        {/* Inline AI suggestions */}
                        {isAIAvailable && (
                          <InlineChips
                            suggestions={phaseSuggestions.get(index) || []}
                            loading={loadingSuggestions.has(index)}
                            onAccept={(suggestion) => handleInlineSuggestionAccept(index, suggestion)}
                            onMore={() => {
                              // Scroll assistant into view or open it
                              trackEvent('ai_more_suggestions_clicked', { stage: 'journey', field: 'phase_name', index });
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMovePhaseUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMovePhaseDown(index)}
                        disabled={index === phases.length - 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePhase(index)}
                        disabled={phases.length <= 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Remove phase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Phase Button */}
              <button
                onClick={handleAddPhase}
                className="w-full squircle-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-white/50 dark:bg-slate-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Phase</span>
                </div>
              </button>

              {/* Phase count indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Text size="sm" color="secondary">
                  {phases.length} {phases.length === 1 ? 'phase' : 'phases'} •
                  {hasMinimumPhases ? ' ✓ Minimum of 3 met' : ` Need ${3 - phases.length} more to continue`}
                </Text>
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
                onClick={handleContinueToDeliverables}
                disabled={!isComplete || isSaving}
                className="squircle-button flex items-center gap-2 px-5 py-2.5
                           bg-gradient-to-b from-purple-500 to-purple-600
                           hover:from-purple-600 hover:to-purple-700
                           active:scale-[0.98]
                           text-white font-medium text-sm
                           shadow-lg shadow-purple-500/25
                           hover:shadow-xl hover:shadow-purple-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                           transition-all duration-200"
              >
                <span>Continue to Deliverables</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Help text */}
            <div className="squircle-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
              <Text size="sm" color="secondary" className="leading-relaxed">
                <strong>Tip:</strong> Your phases are automatically saved as you type. Use the arrow buttons to reorder phases, or drag them to rearrange.
              </Text>
            </div>
          </div>

          {/* Right column: AI Assistant */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <StageAIAssistant
              stage="journey"
              currentData={{
                bigIdea: blueprint?.ideation?.bigIdea,
                essentialQuestion: blueprint?.ideation?.essentialQuestion,
                challenge: blueprint?.ideation?.challenge,
                wizard: blueprint?.wizard,
                phases
              }}
              onAccept={() => {}} // Not used for journey stage
              onQuickActionResult={handleQuickActionResult}
            />
          </div>
        </div>
        </Container>
      </div>
    </div>
  );
}
