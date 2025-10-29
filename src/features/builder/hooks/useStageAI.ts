/**
 * useStageAI - Headless AI controller for stage-separated builder
 *
 * Provides AI-powered suggestions, refinement, and chat assistance.
 * AI is REQUIRED - no static fallbacks. If AI is unavailable, gates are shown.
 *
 * Feature flag: VITE_FEATURE_STAGE_ASSISTANT=true
 * AI enabled: VITE_GEMINI_ENABLED=true + VITE_GEMINI_API_KEY set
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent } from '../../../utils/analytics';
import type { CapturedData } from '../../chat-mvp/domain/stages';

type StageId = 'ideation' | 'journey' | 'deliverables';
type IdeationField = 'bigIdea' | 'essentialQuestion' | 'challenge';

interface UseStageAIOptions {
  stage: StageId;
  currentData: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
    wizard?: any;
    phases?: any[]; // For journey stage
    milestones?: any[]; // For deliverables stage
    artifacts?: any[]; // For deliverables stage
    criteria?: string[]; // For deliverables stage
  };
}

interface RefineResult {
  chips: string[];
  followup?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon?: string;
  requiresInput?: boolean;
  inputLabel?: string;
  inputOptions?: Array<{ label: string; value: string }>;
}

export interface FieldSuggestion {
  text: string;
  type: 'rename' | 'activity' | 'refinement';
  targetIndex?: number;
}

export function useStageAI({ stage, currentData }: UseStageAIOptions) {
  const [isAIAvailable, setIsAIAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const healthCheckAttemptedRef = useRef(false);

  /**
   * Health check: validates environment + tests actual AI connectivity
   * This is a fast, cheap ping to verify AI is working
   */
  const checkAIHealth = useCallback(async (): Promise<boolean> => {
    setHealthChecking(true);
    setError(null);

    try {
      // Step 1: Check environment variables
      const featureEnabled = import.meta.env.VITE_FEATURE_STAGE_ASSISTANT === 'true';
      const geminiEnabled = import.meta.env.VITE_GEMINI_ENABLED === 'true';
      const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

      if (!featureEnabled) {
        setError('AI assistant feature is disabled');
        return false;
      }

      if (!geminiEnabled) {
        setError('AI is disabled. VITE_GEMINI_ENABLED must be true');
        return false;
      }

      if (!hasApiKey) {
        setError('AI API key is missing. Set VITE_GEMINI_API_KEY');
        return false;
      }

      // Step 2: Test actual AI connectivity (fast ping)
      try {
        const { generateAI } = await import('../../chat-mvp/domain/ai');

        // Minimal AI test with 2s timeout
        const testPromise = generateAI('ok', { maxTokens: 8, temperature: 0 });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI health check timeout')), 2000)
        );

        await Promise.race([testPromise, timeoutPromise]);

        // Success!
        console.log('[useStageAI] AI health check passed');
        trackEvent('ai_health_check_passed', { stage });
        return true;
      } catch (aiError) {
        console.error('[useStageAI] AI health check failed:', aiError);
        setError('AI is unavailable or not responding');
        trackEvent('ai_health_check_failed', { stage, error: String(aiError) });
        return false;
      }
    } catch (err) {
      console.error('[useStageAI] Health check error:', err);
      setError('Failed to check AI status');
      return false;
    } finally {
      setHealthChecking(false);
    }
  }, [stage]);

  // Run health check on mount (once)
  useEffect(() => {
    if (!healthCheckAttemptedRef.current) {
      healthCheckAttemptedRef.current = true;
      checkAIHealth().then(setIsAIAvailable);
    }
  }, [checkAIHealth]);

  /**
   * Get suggestions for the current stage
   * AI-ONLY - no static fallbacks. Returns empty if AI unavailable.
   */
  const getSuggestions = useCallback(async (): Promise<string[]> => {
    // AI is required - if not available, return nothing
    if (!isAIAvailable) {
      setError('AI unavailable');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Lazy load AI modules
      const [{ buildSuggestionPrompt }, { generateAI }] = await Promise.all([
        import('../../chat-mvp/domain/prompt'),
        import('../../chat-mvp/domain/ai')
      ]);

      // Build captured data format for AI
      const captured: Partial<CapturedData> = {
        ideation: {
          bigIdea: currentData.bigIdea,
          essentialQuestion: currentData.essentialQuestion,
          challenge: currentData.challenge
        }
      };

      // Determine current micro-stage for better suggestions
      const currentStage = stage === 'ideation'
        ? (currentData.bigIdea ? (currentData.essentialQuestion ? 'CHALLENGE' : 'ESSENTIAL_QUESTION') : 'BIG_IDEA')
        : 'BIG_IDEA';

      const prompt = buildSuggestionPrompt(currentStage as any, captured as CapturedData, currentData.wizard);
      const aiResponse = await generateAI(prompt, { maxTokens: 200, temperature: 0.8 });

      // Extract suggestions from AI response
      const lines = aiResponse.split('\n').filter(l => l.trim());
      const suggestions = lines.slice(0, 3).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

      return suggestions.length > 0 ? suggestions : [];
    } catch (err) {
      console.error('[useStageAI] getSuggestions error:', err);
      setError('AI failed to generate suggestions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [stage, currentData, isAIAvailable]);

  /**
   * Refine a specific field value
   * Returns targeted chips and optional follow-up question
   */
  const refine = useCallback(async (
    field: IdeationField,
    value: string
  ): Promise<RefineResult> => {
    if (isAIAvailable === null || !value?.trim()) {
      return { chips: [] };
    }

    setLoading(true);
    setError(null);

    try {
      if (isAIAvailable && field === 'bigIdea') {
        // Use specificity scorer for Big Idea refinement
        const { scoreIdeationSpecificity, nextQuestionFor } = await import('../../chat-mvp/domain/specificityScorer');

        const score = scoreIdeationSpecificity(value);
        const nextQuestion = nextQuestionFor(value, score);

        // Generate refinement chips based on score
        const chips: string[] = [];

        if (score < 0.6) {
          chips.push(`Make it more specific: ${value.split(' ').slice(0, 5).join(' ')}... about [specific topic]`);
          chips.push(`Add context: ${value} in [grade level] [subject area]`);
        } else if (score < 0.8) {
          chips.push(`Strengthen: ${value} to develop [specific skill]`);
        }

        return {
          chips: chips.slice(0, 3),
          followup: nextQuestion || undefined
        };
      }

      // For other fields or no AI, return empty
      return { chips: [] };
    } catch (err) {
      console.error('[useStageAI] refine error:', err);
      return { chips: [] };
    } finally {
      setLoading(false);
    }
  }, [isAIAvailable]);

  /**
   * Send a chat message to the assistant
   * Returns a compact assistant reply
   */
  const sendMessage = useCallback(async (
    text: string
  ): Promise<string> => {
    if (!isAIAvailable || !text?.trim()) {
      return '';
    }

    setLoading(true);
    setError(null);

    try {
      const { generateAI } = await import('../../chat-mvp/domain/ai');

      // Build compact system prompt for stage assistant
      const systemPrompt = `You are a helpful PBL design assistant. The teacher is working on the ${stage} stage.
Keep responses under 2 sentences. Be encouraging and actionable.`;

      const prompt = `${systemPrompt}\n\nTeacher: ${text}\nAssistant:`;

      const response = await generateAI(prompt, { maxTokens: 100, temperature: 0.7 });

      return response.trim();
    } catch (err) {
      console.error('[useStageAI] sendMessage error:', err);
      setError('Unable to send message');
      return 'Sorry, I had trouble processing that. Please try again.';
    } finally {
      setLoading(false);
    }
  }, [stage, isAIAvailable]);

  // Load initial suggestions when data changes
  useEffect(() => {
    if (isAIAvailable !== null) {
      getSuggestions().then(setSuggestions);
    }
  }, [isAIAvailable, currentData.bigIdea, currentData.essentialQuestion, currentData.challenge, getSuggestions]);

  // Quick Actions state
  const [actionExecuting, setActionExecuting] = useState<string | null>(null);

  // Define stage-specific Quick Actions
  const quickActions: QuickAction[] = stage === 'journey' ? [
    {
      id: 'generate-phases',
      label: 'Generate 4 Phases',
      description: 'Create 4 smart phase names based on your project context',
      icon: 'sparkles'
    },
    {
      id: 'rename-phases',
      label: 'Rename Phases For Clarity',
      description: 'Improve existing phase names to be more specific and descriptive',
      icon: 'edit'
    },
    {
      id: 'add-activities',
      label: 'Add Activities To Phase',
      description: 'Get 3-4 activity suggestions for a specific phase',
      icon: 'plus',
      requiresInput: true,
      inputLabel: 'Select phase',
      inputOptions: (currentData.phases || []).map((p: any, idx: number) => ({
        label: p.name || `Phase ${idx + 1}`,
        value: String(idx)
      }))
    }
  ] : stage === 'deliverables' ? [
    {
      id: 'suggest-milestones',
      label: 'Suggest Milestones (≥3)',
      description: 'Generate project milestones aligned with your learning journey',
      icon: 'sparkles'
    },
    {
      id: 'suggest-artifacts',
      label: 'Suggest Artifacts (≥1)',
      description: 'Recommend student artifacts for your project challenge',
      icon: 'sparkles'
    },
    {
      id: 'write-criteria',
      label: 'Write 3 Criteria',
      description: 'Create assessment criteria for your rubric',
      icon: 'sparkles'
    },
    {
      id: 'tighten-criteria',
      label: 'Tighten Criteria',
      description: 'Make criteria more measurable, visible, and rigorous',
      icon: 'edit'
    }
  ] : [];

  /**
   * Execute a Quick Action
   */
  const executeAction = useCallback(async (
    actionId: string,
    params?: any
  ): Promise<any> => {
    if (!isAIAvailable) {
      return null;
    }

    setActionExecuting(actionId);
    trackEvent('ai_quick_action_clicked', { stage, action: actionId });

    try {
      if (stage === 'journey') {
        // Lazy-load journey actions
        const actions = await import('../ai/journeyActions');

        switch (actionId) {
          case 'generate-phases': {
            const phases = await actions.generatePhaseNames({
              bigIdea: currentData.bigIdea,
              essentialQuestion: currentData.essentialQuestion,
              challenge: currentData.challenge
            });
            return { type: 'phases', data: phases };
          }

          case 'rename-phases': {
            const phases = currentData.phases || [];
            const renamedPhases = await actions.renamePhasesForClarity(phases, {
              bigIdea: currentData.bigIdea,
              essentialQuestion: currentData.essentialQuestion,
              challenge: currentData.challenge
            });
            return { type: 'phase-names', data: renamedPhases };
          }

          case 'add-activities': {
            const phaseIndex = parseInt(params?.phaseIndex || '0', 10);
            const phases = currentData.phases || [];
            const phase = phases[phaseIndex];

            if (!phase) {
              throw new Error('Phase not found');
            }

            const activities = await actions.suggestActivitiesForPhase(
              phase.name,
              phaseIndex,
              phases.length,
              {
                bigIdea: currentData.bigIdea,
                essentialQuestion: currentData.essentialQuestion,
                challenge: currentData.challenge
              }
            );

            return { type: 'activities', data: activities, phaseIndex };
          }

          default:
            throw new Error(`Unknown action: ${actionId}`);
        }
      } else if (stage === 'deliverables') {
        // Lazy-load deliverables actions
        const actions = await import('../ai/deliverablesActions');

        const context = {
          bigIdea: currentData.bigIdea,
          essentialQuestion: currentData.essentialQuestion,
          challenge: currentData.challenge,
          wizard: currentData.wizard,
          phases: currentData.phases
        };

        switch (actionId) {
          case 'suggest-milestones': {
            const milestones = await actions.suggestMilestones(context);
            return { type: 'milestones', data: milestones };
          }

          case 'suggest-artifacts': {
            const artifacts = await actions.suggestArtifacts(context);
            return { type: 'artifacts', data: artifacts };
          }

          case 'write-criteria': {
            const criteria = await actions.writeCriteria(context);
            return { type: 'criteria', data: criteria };
          }

          case 'tighten-criteria': {
            const existingCriteria = currentData.criteria || [];
            const tightened = await actions.tightenCriteria(existingCriteria, context);
            return { type: 'criteria-tightened', data: tightened };
          }

          default:
            throw new Error(`Unknown action: ${actionId}`);
        }
      }

      return null;
    } catch (err) {
      console.error(`[useStageAI] executeAction error:`, err);
      trackEvent('ai_quick_action_failed', { stage, action: actionId, error: String(err) });
      throw err;
    } finally {
      setActionExecuting(null);
    }
  }, [stage, currentData, isAIAvailable]);

  /**
   * Get field-level suggestions (for inline chips)
   */
  const getFieldSuggestions = useCallback(async (
    field: string,
    value: string,
    index?: number
  ): Promise<FieldSuggestion[]> => {
    if (!isAIAvailable) {
      return [];
    }

    try {
      if (stage === 'journey' && field === 'phaseName' && value?.trim()) {
        // Lazy-load journey actions
        const actions = await import('../ai/journeyActions');

        const suggestions = await actions.getPhaseSuggestions(
          value,
          index || 0,
          {
            bigIdea: currentData.bigIdea,
            essentialQuestion: currentData.essentialQuestion
          }
        );

        return suggestions.map(text => ({
          text,
          type: 'rename' as const,
          targetIndex: index
        }));
      } else if (stage === 'deliverables') {
        // Lazy-load deliverables actions
        const actions = await import('../ai/deliverablesActions');

        const context = {
          bigIdea: currentData.bigIdea,
          essentialQuestion: currentData.essentialQuestion,
          challenge: currentData.challenge,
          wizard: currentData.wizard,
          phases: currentData.phases
        };

        let target: 'milestone' | 'artifact' | 'criterion';
        let type: 'rename' | 'activity' | 'refinement';

        if (field === 'milestones') {
          target = 'milestone';
          type = 'refinement';
        } else if (field === 'artifacts') {
          target = 'artifact';
          type = 'refinement';
        } else if (field === 'criteria') {
          target = 'criterion';
          type = 'refinement';
        } else {
          return [];
        }

        const chips = await actions.getHeaderChips(target, context);

        return chips.map(text => ({
          text,
          type,
          targetIndex: index
        }));
      }

      return [];
    } catch (err) {
      console.error(`[useStageAI] getFieldSuggestions error:`, err);
      return [];
    }
  }, [stage, currentData, isAIAvailable]);

  return {
    isAIAvailable: isAIAvailable ?? false,
    suggestions,
    loading,
    error,
    healthChecking,
    checkAIHealth,
    getSuggestions,
    refine,
    sendMessage,
    // Quick Actions
    quickActions,
    actionExecuting,
    executeAction,
    getFieldSuggestions
  };
}
