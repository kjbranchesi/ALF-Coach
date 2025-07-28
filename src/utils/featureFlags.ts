// Feature flags for gradual rollout and A/B testing
import { logger } from './logger';

interface FeatureFlags {
  useChatV6: boolean;
  chatV6Percentage: number;
  debugMode: boolean;
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private userId: string | null = null;

  constructor() {
    // Default flags - can be overridden by environment or remote config
    this.flags = {
      useChatV6: this.checkChatV6Eligibility(),
      chatV6Percentage: this.getChatV6Percentage(),
      debugMode: this.isDebugMode()
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

  // Get override from localStorage (for testing)
  private getOverride(flag: string): boolean | null {
    const override = localStorage.getItem(`alfCoach_ff_${flag}`);
    if (override === 'true') {return true;}
    if (override === 'false') {return false;}
    return null;
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
    this.flags = {
      useChatV6: this.checkChatV6Eligibility(),
      chatV6Percentage: this.getChatV6Percentage(),
      debugMode: this.isDebugMode()
    };
  }

  // Clear override
  public clearOverride(flag: string): void {
    localStorage.removeItem(`alfCoach_ff_${flag}`);
    logger.log(`Feature flag override cleared: ${flag}`);
    
    // Refresh flags
    this.flags = {
      useChatV6: this.checkChatV6Eligibility(),
      chatV6Percentage: this.getChatV6Percentage(),
      debugMode: this.isDebugMode()
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

// Development helpers
if (import.meta.env?.DEV) {
  // Expose to window for testing
  (window as any).featureFlags = featureFlags;
  (window as any).enableChatV6 = () => { featureFlags.setOverride('useChatV6', true); };
  (window as any).disableChatV6 = () => { featureFlags.setOverride('useChatV6', false); };
  (window as any).resetChatV6 = () => { featureFlags.clearOverride('useChatV6'); };
}