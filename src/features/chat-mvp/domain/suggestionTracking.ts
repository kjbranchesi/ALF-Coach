/**
 * Suggestion Tracking System
 * Stores lightbulb suggestions separately from chat history
 * Allows direct capture without validation
 */

import type { Stage } from './stages';

export interface TrackedSuggestion {
  id: string;
  stage: Stage;
  text: string;
  timestamp: Date;
  source: 'ai' | 'template';
  metadata?: Record<string, any>;
}

export interface SuggestionSelection {
  suggestionId: string;
  selectedAt: Date;
  userModification?: string;
}

class SuggestionTracker {
  private suggestions: Map<string, TrackedSuggestion> = new Map();
  private recentSuggestionsByStage: Map<Stage, string[]> = new Map();
  private selections: SuggestionSelection[] = [];
  private maxHistoryPerStage = 10; // Keep last 10 suggestions per stage

  /**
   * Track a new suggestion
   */
  trackSuggestion(stage: Stage, text: string, source: 'ai' | 'template' = 'template'): string {
    const id = `sug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const suggestion: TrackedSuggestion = {
      id,
      stage,
      text,
      timestamp: new Date(),
      source
    };

    this.suggestions.set(id, suggestion);

    // Update stage history
    const stageHistory = this.recentSuggestionsByStage.get(stage) || [];
    stageHistory.unshift(id);

    // Keep only recent suggestions
    if (stageHistory.length > this.maxHistoryPerStage) {
      const removed = stageHistory.pop();
      if (removed) {
        this.suggestions.delete(removed);
      }
    }

    this.recentSuggestionsByStage.set(stage, stageHistory);

    return id;
  }

  /**
   * Track multiple suggestions at once
   */
  trackMultiple(stage: Stage, texts: string[], source: 'ai' | 'template' = 'template'): string[] {
    return texts.map(text => this.trackSuggestion(stage, text, source));
  }

  /**
   * Get suggestion by ID
   */
  getSuggestion(id: string): TrackedSuggestion | null {
    return this.suggestions.get(id) || null;
  }

  /**
   * Get recent suggestions for a stage
   */
  getRecentForStage(stage: Stage, limit: number = 3): TrackedSuggestion[] {
    const ids = this.recentSuggestionsByStage.get(stage) || [];
    return ids
      .slice(0, limit)
      .map(id => this.suggestions.get(id))
      .filter(Boolean) as TrackedSuggestion[];
  }

  /**
   * Get most recent suggestions across all stages (for intent matching)
   */
  getMostRecent(limit: number = 5): TrackedSuggestion[] {
    const allSuggestions = Array.from(this.suggestions.values());
    allSuggestions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return allSuggestions.slice(0, limit);
  }

  /**
   * Record that a user selected a suggestion
   */
  recordSelection(suggestionId: string, userModification?: string) {
    const selection: SuggestionSelection = {
      suggestionId,
      selectedAt: new Date(),
      userModification
    };
    this.selections.push(selection);

    // Keep last 20 selections
    if (this.selections.length > 20) {
      this.selections.shift();
    }
  }

  /**
   * Check if a suggestion was recently used (avoid repeats)
   */
  wasRecentlyUsed(text: string, withinMinutes: number = 10): boolean {
    const cutoff = Date.now() - withinMinutes * 60 * 1000;
    return this.selections.some(sel => {
      const suggestion = this.suggestions.get(sel.suggestionId);
      return (
        suggestion &&
        suggestion.text.toLowerCase() === text.toLowerCase() &&
        sel.selectedAt.getTime() > cutoff
      );
    });
  }

  /**
   * Get the last N suggestions as text array (for intent detection)
   */
  getRecentTexts(limit: number = 5): string[] {
    return this.getMostRecent(limit).map(s => s.text);
  }

  /**
   * Clear history (for cleanup)
   */
  clear() {
    this.suggestions.clear();
    this.recentSuggestionsByStage.clear();
    this.selections = [];
  }
}

// Singleton instance
export const suggestionTracker = new SuggestionTracker();
