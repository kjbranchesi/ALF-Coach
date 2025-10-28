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
  };
}

interface RefineResult {
  chips: string[];
  followup?: string;
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

  return {
    isAIAvailable: isAIAvailable ?? false,
    suggestions,
    loading,
    error,
    healthChecking,
    checkAIHealth,
    getSuggestions,
    refine,
    sendMessage
  };
}
