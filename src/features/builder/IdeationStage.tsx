/**
 * IdeationStage.tsx - Phase 4 Stage-Separated Builder
 *
 * Form for capturing Big Idea, Essential Question, and Challenge.
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
  Lightbulb,
  HelpCircle,
  Target,
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle2
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
          console.error(`[IdeationStage] Project ${projectId} not found in storage`);
          console.error('[IdeationStage] This may indicate a save timing issue or validation failure');
          navigate('/app/dashboard');
          return;
        }

        setBlueprint(project);

        // Initialize form fields from project data
        setBigIdea(project.ideation?.bigIdea || '');
        setEssentialQuestion(project.ideation?.essentialQuestion || '');
        setChallenge(project.ideation?.challenge || '');
      } catch (error) {
        console.error('[IdeationStage] Failed to load project', error);
        navigate('/app/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
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

  // Avoid invoking canCompleteStage() during render (it updates state inside the hook).
  // For UI enablement and badges, use a pure check of local field completeness.
  const isComplete = Boolean(
    bigIdea.trim() &&
    essentialQuestion.trim() &&
    challenge.trim()
  );
  const hasAnyContent = Boolean(bigIdea.trim() || essentialQuestion.trim() || challenge.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      {/* Background gradient overlay */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />

      <div className="relative">
        <Container className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">
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
        </Container>
      </div>
    </div>
  );
}
