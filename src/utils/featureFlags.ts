// Feature flags for gradual rollout and A/B testing
import { logger } from './logger';

interface FeatureFlags {
  useChatV6: boolean;
  chatV6Percentage: number;
  debugMode: boolean;
  // New chat-first UI features
  conversationalOnboarding: boolean;
  inlineUIGuidance: boolean;
  progressSidebar: boolean;
  stageInitiatorCards: boolean;
  improvedSuggestionCards: boolean;
  inlineRecapPanel: boolean; // Inline recap card below chat (off by default)
  inlineRecapAlways: boolean; // Show recap even without recent save
  inlineRecapMinMessages: number; // Minimum messages before showing recap
  processRibbon: boolean; // Show the ALF overview ribbon
  firstRunTour: boolean; // Show first-run tour overlay
  glossary: boolean; // Show glossary tooltips
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private userId: string | null = null;

  constructor() {
    // Default flags - can be overridden by environment or remote config
    this.flags = {
      useChatV6: this.checkChatV6Eligibility(),
      chatV6Percentage: this.getChatV6Percentage(),
      debugMode: this.isDebugMode(),
      // New features - gradually rolling out
      conversationalOnboarding: this.getFlag('conversationalOnboarding', false),
      inlineUIGuidance: this.getFlag('inlineUIGuidance', true),
      progressSidebar: this.getFlag('progressSidebar', true),
      stageInitiatorCards: this.getFlag('stageInitiatorCards', true),
      improvedSuggestionCards: this.getFlag('improvedSuggestionCards', true),
      inlineRecapPanel: this.getFlag('inlineRecapPanel', true),
      inlineRecapAlways: this.getFlag('inlineRecapAlways', false),
      inlineRecapMinMessages: this.getNumberFlag('inlineRecapMinMessages', 2),
      processRibbon: this.getFlag('processRibbon', true),
      firstRunTour: this.getFlag('firstRunTour', false),
      glossary: this.getFlag('glossary', true)
    };
    
    logger.log('Feature flags initialized:', this.flags);
  }

  // Check if current user should use ChatV6
  private checkChatV6Eligibility(): boolean {
    // Check for override flags first
    const override = this.getOverride('useChatV6');
    if (override !== null) {return override;}

    // Check percentage rollout
    const percentage = this.getChatV6Percentage();
    const userHash = this.getUserHash();
    
    // Use consistent hashing to ensure same user always gets same experience
    return (userHash % 100) < percentage;
  }

  // Get rollout percentage from environment
  private getChatV6Percentage(): number {
    const envPercentage = import.meta.env?.VITE_CHATV6_PERCENTAGE;
    if (envPercentage) {
      const parsed = parseInt(envPercentage, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
    
    // Default to 10% rollout
    return 10;
  }

  // Check if debug mode is enabled
  private isDebugMode(): boolean {
    return import.meta.env?.VITE_DEBUG === 'true' || 
           localStorage.getItem('alfCoachDebug') === 'true';
  }

  // Generic flag getter with default value
  private getFlag(flagName: string, defaultValue: boolean): boolean {
    // Check for override first
    const override = this.getOverride(flagName);
    if (override !== null) return override;
    
    // Check environment variable
    const envKey = `VITE_FEATURE_${flagName.toUpperCase()}`;
    const envValue = import.meta.env?.[envKey];
    if (envValue === 'true') return true;
    if (envValue === 'false') return false;
    
    return defaultValue;
  }

  // Get override from localStorage (for testing)
  private getOverride(flag: string): boolean | null {
    const override = localStorage.getItem(`alfCoach_ff_${flag}`);
    if (override === 'true') {return true;}
    if (override === 'false') {return false;}
    return null;
  }

  private getNumberFlag(flagName: string, defaultValue: number): number {
    const override = localStorage.getItem(`alfCoach_ff_${flagName}`);
    if (override !== null) {
      const parsed = Number(override);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    const envKey = `VITE_FEATURE_${flagName.toUpperCase()}`;
    const envValue = import.meta.env?.[envKey];
    if (envValue !== undefined) {
      const parsed = Number(envValue);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  // Generate consistent hash for user
  private getUserHash(): number {
    if (!this.userId) {
      // Get or create user ID
      this.userId = localStorage.getItem('alfCoach_userId');
      if (!this.userId) {
        this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('alfCoach_userId', this.userId);
      }
    }

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < this.userId.length; i++) {
      const char = this.userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }

  // Public API
  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] || false;
  }

  public getValue(flag: keyof FeatureFlags): any {
    return this.flags[flag];
  }

  // Enable override for testing
  public setOverride(flag: string, value: boolean): void {
    localStorage.setItem(`alfCoach_ff_${flag}`, value.toString());
    logger.log(`Feature flag override set: ${flag} = ${value}`);
    
    // Refresh flags
    this.refreshFlags();
  }

  // Clear override
  public clearOverride(flag: string): void {
    localStorage.removeItem(`alfCoach_ff_${flag}`);
    logger.log(`Feature flag override cleared: ${flag}`);
    
    // Refresh flags
    this.refreshFlags();
  }

  // Refresh all flags
  private refreshFlags(): void {
    this.flags = {
      useChatV6: this.checkChatV6Eligibility(),
      chatV6Percentage: this.getChatV6Percentage(),
      debugMode: this.isDebugMode(),
      conversationalOnboarding: this.getFlag('conversationalOnboarding', false),
      inlineUIGuidance: this.getFlag('inlineUIGuidance', true),
      progressSidebar: this.getFlag('progressSidebar', true),
      stageInitiatorCards: this.getFlag('stageInitiatorCards', true),
      improvedSuggestionCards: this.getFlag('improvedSuggestionCards', true),
      inlineRecapPanel: this.getFlag('inlineRecapPanel', true),
      inlineRecapAlways: this.getFlag('inlineRecapAlways', false),
      inlineRecapMinMessages: this.getNumberFlag('inlineRecapMinMessages', 2),
      processRibbon: this.getFlag('processRibbon', true),
      firstRunTour: this.getFlag('firstRunTour', false),
      glossary: this.getFlag('glossary', true)
    };
  }

  // Get current state for debugging
  public getState(): FeatureFlags {
    return { ...this.flags };
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export const shouldUseChatV6 = (): boolean => {
  return featureFlags.isEnabled('useChatV6');
};

export const isDebugEnabled = (): boolean => {
  return featureFlags.isEnabled('debugMode');
};

// React hook for using feature flags
import { useState, useEffect } from 'react';

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const [value, setValue] = useState(() => featureFlags.isEnabled(flag));
  
  useEffect(() => {
    // Check for changes periodically (simple polling)
    const interval = setInterval(() => {
      const currentValue = featureFlags.isEnabled(flag);
      setValue(currentValue);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [flag]);
  
  return value;
}

// Development helpers
if (import.meta.env?.DEV) {
  // Expose to window for testing
  (window as any).featureFlags = featureFlags;
  (window as any).enableChatV6 = () => { featureFlags.setOverride('useChatV6', true); };
  (window as any).disableChatV6 = () => { featureFlags.setOverride('useChatV6', false); };
  (window as any).resetChatV6 = () => { featureFlags.clearOverride('useChatV6'); };
  
  // Add helpers for new features
  (window as any).enableFeature = (flag: string) => { featureFlags.setOverride(flag, true); };
  (window as any).disableFeature = (flag: string) => { featureFlags.setOverride(flag, false); };
  (window as any).getFeatures = () => featureFlags.getState();
}
