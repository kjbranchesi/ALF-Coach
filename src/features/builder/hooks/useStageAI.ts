/**
 * useStageAI - Headless AI controller for stage-separated builder
 *
 * Provides AI-powered suggestions, refinement, and chat assistance.
 * Lazy-loads heavy AI modules and gracefully falls back to static suggestions.
 *
 * Feature flag: VITE_FEATURE_STAGE_ASSISTANT=true
 * AI enabled: VITE_GEMINI_ENABLED=true + VITE_GEMINI_API_KEY set
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const toastShownRef = useRef(false);

  // Check AI availability on mount
  useEffect(() => {
    const checkAI = () => {
      const featureEnabled = import.meta.env.VITE_FEATURE_STAGE_ASSISTANT === 'true';
      const geminiEnabled = import.meta.env.VITE_GEMINI_ENABLED === 'true';
      const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

      const available = featureEnabled && geminiEnabled && hasApiKey;
      setIsAIAvailable(available);

      if (!available && !toastShownRef.current) {
        console.log('[useStageAI] AI unavailable, using static suggestions');
        toastShownRef.current = true;
      }
    };

    checkAI();
  }, []);

  /**
   * Get suggestions for the current stage
   * Returns AI-generated or static fallback suggestions
   */
  const getSuggestions = useCallback(async (): Promise<string[]> => {
    if (isAIAvailable === null) {
      // Still checking availability
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      if (isAIAvailable) {
        // Lazy load AI modules
        const [{ buildSuggestionPrompt }, { generateAI }, { stageSuggestions, dynamicSuggestions }] = await Promise.all([
          import('../../chat-mvp/domain/prompt'),
          import('../../chat-mvp/domain/ai'),
          import('../../chat-mvp/domain/stages')
        ]);

        // Build captured data format for AI
        const captured: Partial<CapturedData> = {
          ideation: {
            bigIdea: currentData.bigIdea,
            essentialQuestion: currentData.essentialQuestion,
            challenge: currentData.challenge
          }
        };

        // Try AI generation first
        try {
          const currentStage = stage === 'ideation'
            ? (currentData.bigIdea ? 'ESSENTIAL_QUESTION' : 'BIG_IDEA')
            : 'BIG_IDEA';

          const prompt = buildSuggestionPrompt(currentStage as any, captured as CapturedData, currentData.wizard);
          const aiResponse = await generateAI(prompt, { maxTokens: 200, temperature: 0.8 });

          // Extract suggestions from AI response
          const lines = aiResponse.split('\n').filter(l => l.trim());
          const suggestions = lines.slice(0, 3).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

          if (suggestions.length > 0) {
            return suggestions;
          }
        } catch (aiError) {
          console.warn('[useStageAI] AI generation failed, falling back to static', aiError);
        }

        // Fallback to dynamic suggestions
        const staticSugs = stageSuggestions(currentStage as any);
        const dynamicSugs = dynamicSuggestions(currentStage as any, captured as CapturedData, currentData.wizard);
        return [...dynamicSugs, ...staticSugs].slice(0, 3);
      } else {
        // Static suggestions only
        const { stageSuggestions, dynamicSuggestions } = await import('../../chat-mvp/domain/stages');

        const currentStage = stage === 'ideation'
          ? (currentData.bigIdea ? (currentData.essentialQuestion ? 'CHALLENGE' : 'ESSENTIAL_QUESTION') : 'BIG_IDEA')
          : 'BIG_IDEA';

        const captured: Partial<CapturedData> = {
          ideation: {
            bigIdea: currentData.bigIdea,
            essentialQuestion: currentData.essentialQuestion,
            challenge: currentData.challenge
          }
        };

        const staticSugs = stageSuggestions(currentStage as any);
        const dynamicSugs = dynamicSuggestions(currentStage as any, captured as CapturedData, currentData.wizard);
        return [...dynamicSugs, ...staticSugs].slice(0, 3);
      }
    } catch (err) {
      console.error('[useStageAI] getSuggestions error:', err);
      setError('Unable to load suggestions');
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
    getSuggestions,
    refine,
    sendMessage
  };
}
