/**
 * JourneyStage.tsx - Phase 5 Stage-Separated Builder
 *
 * Form for defining learning journey phases.
 * Integrates with useStageController for autosave, validation, and transitions.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { stageGuide } from '../chat-mvp/domain/stages';
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
  ChevronDown
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

  // Load project data
  useEffect(() => {
    if (!projectId) {
      navigate('/app/dashboard');
      return;
    }

    const loadProject = async () => {
      setIsLoading(true);
      try {
        const storage = UnifiedStorageManager.getInstance();
        const project = await storage.loadProject(projectId);

        if (!project) {
          console.error('[JourneyStage] Project not found');
          navigate('/app/dashboard');
          return;
        }

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
      } catch (error) {
        console.error('[JourneyStage] Failed to load project', error);
        navigate('/app/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
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
    if (phases.length <= 1) {
      // Don't allow removing the last phase
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

  const hasMinimumPhases = phases.length >= 3;
  const hasNamedPhases = phases.filter(p => p.name.trim()).length >= 3;
  // Avoid invoking canCompleteStage() during render (it updates state inside the hook).
  // Use a pure local completeness check for UI enablement and status badges.
  const isComplete = hasMinimumPhases && hasNamedPhases;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      {/* Background gradient overlay */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />

      <div className="relative">
        <Container className="pt-24 pb-20">
          <div className="max-w-5xl mx-auto space-y-8">
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
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => handlePhaseNameChange(index, e.target.value)}
                        placeholder={`Phase ${index + 1} name (e.g., "Research & Analysis")`}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium transition-all"
                      />
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
        </Container>
      </div>
    </div>
  );
}
