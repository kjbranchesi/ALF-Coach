/**
 * Feature Flag System for Design System Rollout
 * Enables gradual migration from old to new components
 */

export const DESIGN_SYSTEM_FLAGS = {
  USE_NEW_BUTTONS: 'use-new-buttons',
  USE_NEW_TYPOGRAPHY: 'use-new-typography',
  USE_NEW_ICONS: 'use-new-icons',
  USE_NEW_LAYOUT: 'use-new-layout',
  USE_NEW_FORMS: 'use-new-forms',
  USE_NEW_LANDING: 'use-new-landing',
  USE_NEW_DASHBOARD: 'use-new-dashboard',
  USE_NEW_CHAT: 'use-new-chat',
} as const;

export type DesignSystemFlag = typeof DESIGN_SYSTEM_FLAGS[keyof typeof DESIGN_SYSTEM_FLAGS];

class FeatureFlagManager {
  private flags: Map<string, boolean>;
  
  constructor() {
    this.flags = new Map();
    this.loadFlags();
  }
  
  private loadFlags() {
    // Load from localStorage or environment
    const stored = localStorage.getItem('alf-design-flags');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          this.flags.set(key, value as boolean);
        });
      } catch (e) {
        console.error('Failed to parse feature flags:', e);
      }
    }
    
    // Environment overrides
    if (import.meta.env.VITE_NEW_DESIGN_SYSTEM === 'true') {
      Object.values(DESIGN_SYSTEM_FLAGS).forEach(flag => {
        this.flags.set(flag, true);
      });
    }
  }
  
  isEnabled(flag: DesignSystemFlag): boolean {
    return this.flags.get(flag) || false;
  }
  
  enable(flag: DesignSystemFlag) {
    this.flags.set(flag, true);
    this.persist();
  }
  
  disable(flag: DesignSystemFlag) {
    this.flags.set(flag, false);
    this.persist();
  }
  
  enableAll() {
    Object.values(DESIGN_SYSTEM_FLAGS).forEach(flag => {
      this.flags.set(flag, true);
    });
    this.persist();
  }
  
  disableAll() {
    this.flags.clear();
    this.persist();
  }
  
  private persist() {
    const obj: Record<string, boolean> = {};
    this.flags.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem('alf-design-flags', JSON.stringify(obj));
  }
}

export const designFlags = new FeatureFlagManager();

// React hook for using feature flags
import { useState, useEffect } from 'react';

export function useDesignFlag(flag: DesignSystemFlag): boolean {
  const [enabled, setEnabled] = useState(() => designFlags.isEnabled(flag));
  
  useEffect(() => {
    // Re-check on mount in case flags changed
    setEnabled(designFlags.isEnabled(flag));
    
    // Listen for storage events (cross-tab sync)
    const handleStorage = () => {
      setEnabled(designFlags.isEnabled(flag));
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [flag]);
  
  return enabled;
}

// Debug helper for development
if (import.meta.env.DEV) {
  (window as any).alfDesignFlags = {
    enable: (flag: DesignSystemFlag) => designFlags.enable(flag),
    disable: (flag: DesignSystemFlag) => designFlags.disable(flag),
    enableAll: () => designFlags.enableAll(),
    disableAll: () => designFlags.disableAll(),
    status: () => {
      const status: Record<string, boolean> = {};
      Object.values(DESIGN_SYSTEM_FLAGS).forEach(flag => {
        status[flag] = designFlags.isEnabled(flag);
      });
      return status;
    },
  };
  
  console.log('ALF Design System Flags available via window.alfDesignFlags');
}