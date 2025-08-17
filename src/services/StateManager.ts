/**
 * StateManager - Unified state management for ALF Coach
 * CRITICAL: Ensures consistent data flow between wizard, chat, and all components
 */

import React from 'react';
import { DataFlowService, type BlueprintData } from './DataFlowService';
import { RobustFirebaseService } from './RobustFirebaseService';

export type StateListener = (state: AppState) => void;

export interface AppState {
  currentBlueprint: BlueprintData | null;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
  connectionStatus: {
    online: boolean;
    source: 'firebase' | 'localStorage' | 'unknown';
  };
  user: {
    id: string;
    isAnonymous: boolean;
  };
}

export class StateManager {
  private static instance: StateManager | null = null;
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.state = {
      currentBlueprint: null,
      currentStep: 'ONBOARDING',
      isLoading: false,
      error: null,
      connectionStatus: {
        online: navigator.onLine,
        source: 'unknown'
      },
      user: {
        id: 'anonymous',
        isAnonymous: true
      }
    };

    // Auto-save changes after 2 seconds of inactivity
    this.setupAutoSave();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Set user information
   */
  setUser(userId: string, isAnonymous: boolean = false): void {
    this.updateState({
      user: { id: userId, isAnonymous }
    });
  }

  /**
   * Create new blueprint from wizard data
   * CRITICAL: This is where wizard data flows into the system
   */
  async createBlueprintFromWizard(wizardData: any): Promise<string> {
    console.log('[StateManager] Creating blueprint from wizard data:', wizardData);
    this.updateState({ isLoading: true, error: null });

    try {
      // Transform wizard data using DataFlowService
      const blueprintData = DataFlowService.transformWizardToBlueprint(
        wizardData, 
        this.state.user.id
      );
      console.log('[StateManager] Transformed blueprint data:', blueprintData);

      // Save using RobustFirebaseService
      const saveResult = await RobustFirebaseService.saveBlueprint(
        blueprintData, 
        this.state.user.id
      );

      if (saveResult.success && saveResult.id) {
        // Update state with new blueprint
        const finalBlueprint = { ...blueprintData, id: saveResult.id };
        
        console.log('[StateManager] Updating state with blueprint:', finalBlueprint);
        this.updateState({
          currentBlueprint: finalBlueprint,
          currentStep: 'IDEATION_BIG_IDEA', // Start at ideation
          isLoading: false,
          connectionStatus: {
            online: this.state.connectionStatus.online,
            source: saveResult.source
          }
        });
        console.log('[StateManager] State updated, current blueprint:', this.state.currentBlueprint);

        return saveResult.id;
      } else {
        throw new Error(saveResult.error || 'Failed to save blueprint');
      }
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to create blueprint',
        isLoading: false
      });
      throw error;
    }
  }

  /**
   * Load existing blueprint
   */
  async loadBlueprint(blueprintId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const loadResult = await RobustFirebaseService.loadBlueprint(
        blueprintId, 
        this.state.user.id
      );

      if (loadResult.success && loadResult.data) {
        this.updateState({
          currentBlueprint: loadResult.data,
          currentStep: loadResult.data.currentStep || 'IDEATION_BIG_IDEA',
          isLoading: false,
          connectionStatus: {
            online: this.state.connectionStatus.online,
            source: loadResult.source
          }
        });
      } else {
        throw new Error(loadResult.error || 'Failed to load blueprint');
      }
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to load blueprint',
        isLoading: false
      });
      throw error;
    }
  }

  /**
   * Update blueprint data (e.g., from chat interactions)
   */
  updateBlueprint(updates: Partial<BlueprintData>): void {
    if (!this.state.currentBlueprint) {
      console.warn('No current blueprint to update');
      return;
    }

    const updatedBlueprint = {
      ...this.state.currentBlueprint,
      ...updates,
      updatedAt: new Date()
    };

    this.updateState({
      currentBlueprint: updatedBlueprint
    });

    // Trigger auto-save
    this.scheduleAutoSave();
  }

  /**
   * Update current step
   */
  setCurrentStep(step: string): void {
    this.updateState({ currentStep: step });
    
    // Also update the blueprint's current step
    if (this.state.currentBlueprint) {
      this.updateBlueprint({ currentStep: step });
    }
  }

  /**
   * Clear current blueprint (return to onboarding)
   */
  clearBlueprint(): void {
    this.updateState({
      currentBlueprint: null,
      currentStep: 'ONBOARDING',
      error: null
    });
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.updateState({ error });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Get contextual prompt for current state
   */
  getContextualPrompt(): string {
    if (!this.state.currentBlueprint) {
      return '';
    }

    return DataFlowService.generateContextualPrompt(this.state.currentBlueprint);
  }

  /**
   * Check if user has wizard context
   */
  hasWizardContext(): boolean {
    return this.state.currentBlueprint ? 
      DataFlowService.hasWizardContext(this.state.currentBlueprint) : 
      false;
  }

  // Private methods

  private updateState(partialState: Partial<AppState>): void {
    this.state = { ...this.state, ...partialState };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    console.log('[StateManager] Notifying', this.listeners.size, 'listeners of state change');
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }

  private setupAutoSave(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateState({
        connectionStatus: {
          ...this.state.connectionStatus,
          online: true
        }
      });
      // Process pending syncs when coming back online
      RobustFirebaseService.processPendingSyncs();
    });

    window.addEventListener('offline', () => {
      this.updateState({
        connectionStatus: {
          ...this.state.connectionStatus,
          online: false
        }
      });
    });
  }

  private scheduleAutoSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.performAutoSave();
    }, 2000); // 2 second delay
  }

  private async performAutoSave(): Promise<void> {
    if (!this.state.currentBlueprint) {
      return;
    }

    try {
      const saveResult = await RobustFirebaseService.saveBlueprint(
        this.state.currentBlueprint,
        this.state.user.id
      );

      if (saveResult.success) {
        this.updateState({
          connectionStatus: {
            online: this.state.connectionStatus.online,
            source: saveResult.source
          }
        });
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
      // Don't update error state for auto-save failures
    }
  }
}

// Create singleton instance
export const stateManager = StateManager.getInstance();

// React hook for using state manager
export function useStateManager(): AppState {
  const [state, setState] = React.useState(stateManager.getState());

  React.useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

export default StateManager;