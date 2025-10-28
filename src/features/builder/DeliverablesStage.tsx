/**
 * DeliverablesStage.tsx - Phase 6 Stage-Separated Builder
 *
 * Three-list editor for Milestones, Artifacts, and Rubric Criteria.
 * Integrates with useStageController for autosave, validation, and transitions.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { useStageController, telemetry } from './useStageController';
import { useStageAI } from './hooks/useStageAI';
import { isDeliverablesUIComplete } from './completeness';
import { stageGuide } from '../chat-mvp/domain/stages';
import { trackEvent } from '../../utils/analytics';
import {
  Container,
  Heading,
  Text
} from '../../design-system';
import {
  Target,
  Package,
  ClipboardCheck,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// UI state interfaces (with IDs for React keys)
interface MilestoneItem {
  id: string;
  name: string;
}

interface ArtifactItem {
  id: string;
  name: string;
}

interface CriterionItem {
  id: string;
  text: string;
}

export function DeliverablesStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<UnifiedProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local form state with IDs
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);

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
    stage: 'deliverables',
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
    stage: 'deliverables',
    currentData: {
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
          console.error('[DeliverablesStage] Project not found');
          if (!cancelled) navigate('/app/dashboard');
          return;
        }

        if (!cancelled) {
          setBlueprint(project);
          // Initialize form fields from project data
          const existingMilestones = project.deliverables?.milestones || [];
          const existingArtifacts = project.deliverables?.artifacts || [];
          const existingCriteria = project.deliverables?.rubric?.criteria || [];

          // Convert to UI format with IDs
          setMilestones(
            existingMilestones.length > 0
              ? existingMilestones.map((m: any, idx: number) => ({
                  id: m.id || `m${idx + 1}`,
                  name: m.name || ''
                }))
              : [
                  { id: 'm1', name: '' },
                  { id: 'm2', name: '' },
                  { id: 'm3', name: '' }
                ]
          );

          setArtifacts(
            existingArtifacts.length > 0
              ? existingArtifacts.map((a: any, idx: number) => ({
                  id: a.id || `a${idx + 1}`,
                  name: a.name || ''
                }))
              : [{ id: 'a1', name: '' }]
          );

          setCriteria(
            existingCriteria.length > 0
              ? existingCriteria.map((c: string, idx: number) => ({
                  id: `c${idx + 1}`,
                  text: c
                }))
              : [
                  { id: 'c1', text: '' },
                  { id: 'c2', text: '' },
                  { id: 'c3', text: '' }
                ]
          );
        }
      } catch (error) {
        console.error('[DeliverablesStage] Failed to load project', error);
        if (!cancelled) navigate('/app/dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProject();
    return () => { cancelled = true; };
  }, [projectId, navigate]);

  // Centralized autosave handler
  const handleDeliverablesChange = (
    updatedMilestones: MilestoneItem[],
    updatedArtifacts: ArtifactItem[],
    updatedCriteria: CriterionItem[]
  ) => {
    // Update local state
    setMilestones(updatedMilestones);
    setArtifacts(updatedArtifacts);
    setCriteria(updatedCriteria);

    // Trigger debounced save
    debouncedSave({
      deliverables: {
        milestones: updatedMilestones.map(m => ({ id: m.id, name: m.name })),
        artifacts: updatedArtifacts.map(a => ({ id: a.id, name: a.name })),
        rubric: {
          criteria: updatedCriteria.map(c => c.text)
        }
      }
    });
  };

  // Milestone CRUD operations
  const handleAddMilestone = () => {
    const newMilestone: MilestoneItem = {
      id: `m${Date.now()}`,
      name: ''
    };
    handleDeliverablesChange([...milestones, newMilestone], artifacts, criteria);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    const updated = milestones.filter((_, i) => i !== index);
    handleDeliverablesChange(updated, artifacts, criteria);
  };

  const handleMilestoneNameChange = (index: number, name: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], name };
    handleDeliverablesChange(updated, artifacts, criteria);
  };

  const handleMoveMilestoneUp = (index: number) => {
    if (index === 0) return;
    const updated = [...milestones];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    handleDeliverablesChange(updated, artifacts, criteria);
  };

  const handleMoveMilestoneDown = (index: number) => {
    if (index === milestones.length - 1) return;
    const updated = [...milestones];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    handleDeliverablesChange(updated, artifacts, criteria);
  };

  // Artifact CRUD operations
  const handleAddArtifact = () => {
    const newArtifact: ArtifactItem = {
      id: `a${Date.now()}`,
      name: ''
    };
    handleDeliverablesChange(milestones, [...artifacts, newArtifact], criteria);
  };

  const handleRemoveArtifact = (index: number) => {
    if (artifacts.length <= 1) return;
    const updated = artifacts.filter((_, i) => i !== index);
    handleDeliverablesChange(milestones, updated, criteria);
  };

  const handleArtifactNameChange = (index: number, name: string) => {
    const updated = [...artifacts];
    updated[index] = { ...updated[index], name };
    handleDeliverablesChange(milestones, updated, criteria);
  };

  const handleMoveArtifactUp = (index: number) => {
    if (index === 0) return;
    const updated = [...artifacts];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    handleDeliverablesChange(milestones, updated, criteria);
  };

  const handleMoveArtifactDown = (index: number) => {
    if (index === artifacts.length - 1) return;
    const updated = [...artifacts];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    handleDeliverablesChange(milestones, updated, criteria);
  };

  // Criterion CRUD operations
  const handleAddCriterion = () => {
    const newCriterion: CriterionItem = {
      id: `c${Date.now()}`,
      text: ''
    };
    handleDeliverablesChange(milestones, artifacts, [...criteria, newCriterion]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    const updated = criteria.filter((_, i) => i !== index);
    handleDeliverablesChange(milestones, artifacts, updated);
  };

  const handleCriterionTextChange = (index: number, text: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], text };
    handleDeliverablesChange(milestones, artifacts, updated);
  };

  const handleMoveCriterionUp = (index: number) => {
    if (index === 0) return;
    const updated = [...criteria];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    handleDeliverablesChange(milestones, artifacts, updated);
  };

  const handleMoveCriterionDown = (index: number) => {
    if (index === criteria.length - 1) return;
    const updated = [...criteria];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    handleDeliverablesChange(milestones, artifacts, updated);
  };

  const handleFinalizeAndReview = () => {
    // Track finalize click
    telemetry.track('finalize_click', {
      stage: 'deliverables',
      projectId: projectId || '',
      milestonesCount: milestones.filter(m => m.name.trim()).length,
      artifactsCount: artifacts.filter(a => a.name.trim()).length,
      criteriaCount: criteria.filter(c => c.text.trim()).length
    });

    if (canCompleteStage()) {
      // Track successful finalization (completeStage will also track stage_completed)
      telemetry.track('finalize_completed', {
        stage: 'deliverables',
        projectId: projectId || ''
      });

      completeStage('review');
    }
  };

  // Stage guide
  const deliverablesGuide = stageGuide('DELIVERABLES');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
        <Container className="pt-24 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full" />
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
      trackEvent('ai_gate_retry', { stage: 'deliverables', context: 'full_page' });
      const success = await checkAIHealth();
      if (success) {
        trackEvent('ai_health_recovered', { stage: 'deliverables', context: 'full_page' });
      }
    };

    const handleDiagnostics = () => {
      trackEvent('ai_diagnostics_opened', { stage: 'deliverables', context: 'full_page' });
      console.group('🔍 AI Diagnostics - Deliverables Stage');
      console.log('Feature Enabled:', import.meta.env.VITE_FEATURE_STAGE_ASSISTANT);
      console.log('Gemini Enabled:', import.meta.env.VITE_GEMINI_ENABLED);
      console.log('API Key Present:', !!import.meta.env.VITE_GEMINI_API_KEY);
      console.log('AI Available:', isAIAvailable);
      console.log('Error:', aiError);
      console.groupEnd();
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
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
                    {aiError || 'The Deliverables stage requires AI to function. Please configure your AI settings to continue.'}
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
                  onClick={() => trackEvent('ai_setup_opened', { stage: 'deliverables', source: 'full_page_gate' })}
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
  // Use a pure local completeness check for UI feedback and button enablement.
  const milestonesCount = milestones.filter(m => m.name.trim()).length;
  const artifactsCount = artifacts.filter(a => a.name.trim()).length;
  const criteriaCount = criteria.filter(c => c.text.trim()).length;
  const isComplete = isDeliverablesUIComplete(milestones, artifacts, criteria);
  const hasAnyContent = milestonesCount > 0 || artifactsCount > 0 || criteriaCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      {/* Background gradient overlay */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(5,150,105,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(6,78,59,0.18),transparent_55%)] opacity-80" />

      <div className="relative">
        <Container className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 squircle-sm bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Heading level={1} className="text-slate-900 dark:text-slate-50">
                    Deliverables
                  </Heading>
                  <Text color="secondary" size="sm">
                    {deliverablesGuide.what}
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  <span className="font-medium">Stage 3 of 3</span>
                </div>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 w-full transition-all duration-500" />
                </div>
              </div>

              {/* Validation status */}
              {isComplete && hasAnyContent && (
                <div className="flex items-center gap-2 px-4 py-3 squircle-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <Text className="text-emerald-800 dark:text-emerald-200 font-medium">
                    Deliverables complete! Ready to finalize and review.
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

            {/* Milestones List */}
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Heading level={3} className="text-slate-900 dark:text-slate-50">
                      Milestones
                    </Heading>
                    <Text size="sm" color="secondary" className="mt-1">
                      Key checkpoints that mark progress through the project (aim for 3+)
                    </Text>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={milestone.name}
                            onChange={(e) => handleMilestoneNameChange(index, e.target.value)}
                            placeholder={`e.g., ${index === 0 ? 'Research completed' : index === 1 ? 'Prototype built' : 'Final presentation delivered'}`}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveMilestoneUp(index)}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveMilestoneDown(index)}
                            disabled={index === milestones.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMilestone(index)}
                            disabled={milestones.length <= 1}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddMilestone}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Milestone</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Artifacts List */}
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
                  <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Heading level={3} className="text-slate-900 dark:text-slate-50">
                      Artifacts
                    </Heading>
                    <Text size="sm" color="secondary" className="mt-1">
                      Final products students will create (aim for 1-3)
                    </Text>
                  </div>

                  {/* Artifacts list */}
                  <div className="space-y-2">
                    {artifacts.map((artifact, index) => (
                      <div key={artifact.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={artifact.name}
                            onChange={(e) => handleArtifactNameChange(index, e.target.value)}
                            placeholder={`e.g., ${index === 0 ? 'Research presentation' : index === 1 ? 'Prototype demonstration' : 'Final report'}`}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveArtifactUp(index)}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveArtifactDown(index)}
                            disabled={index === artifacts.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveArtifact(index)}
                            disabled={artifacts.length <= 1}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddArtifact}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Artifact</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rubric Criteria List */}
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-cyan-100 dark:bg-cyan-900/30 flex-shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Heading level={3} className="text-slate-900 dark:text-slate-50">
                      Rubric Criteria
                    </Heading>
                    <Text size="sm" color="secondary" className="mt-1">
                      Success criteria for evaluating student work (aim for 3-6)
                    </Text>
                  </div>

                  {/* Criteria list */}
                  <div className="space-y-2">
                    {criteria.map((criterion, index) => (
                      <div key={criterion.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={criterion.text}
                            onChange={(e) => handleCriterionTextChange(index, e.target.value)}
                            placeholder={`e.g., ${index === 0 ? 'Clear communication of ideas' : index === 1 ? 'Depth of research and analysis' : 'Quality of final presentation'}`}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveCriterionUp(index)}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveCriterionDown(index)}
                            disabled={index === criteria.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveCriterion(index)}
                            disabled={criteria.length <= 1}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddCriterion}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-cyan-300 dark:border-cyan-700 hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Criterion</span>
                  </button>
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
                onClick={handleFinalizeAndReview}
                disabled={!isComplete || isSaving}
                className="squircle-button flex items-center gap-2 px-5 py-2.5
                           bg-gradient-to-b from-emerald-500 to-emerald-600
                           hover:from-emerald-600 hover:to-emerald-700
                           active:scale-[0.98]
                           text-white font-medium text-sm
                           shadow-lg shadow-emerald-500/25
                           hover:shadow-xl hover:shadow-emerald-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                           transition-all duration-200"
              >
                <span>Finalize & Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Help text */}
            <div className="squircle-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
              <Text size="sm" color="secondary" className="leading-relaxed">
                <strong>Tip:</strong> {deliverablesGuide.tip} Your work is automatically saved as you type.
              </Text>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
