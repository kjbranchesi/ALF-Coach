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
   * CRITICAL: Uses optimistic updates for immediate UI transition
   */
  createBlueprintFromWizard(wizardData: any): string {
    console.log('[StateManager] createBlueprintFromWizard called with:', JSON.stringify(wizardData, null, 2));
    console.log('[StateManager] Current state before transformation:', {
      hasBlueprint: !!this.state.currentBlueprint,
      currentStep: this.state.currentStep,
      isLoading: this.state.isLoading
    });
    
    try {
      console.log('[StateManager] About to transform wizard data...');
      // 1. Transform wizard data immediately (synchronous)
      const blueprintData = DataFlowService.transformWizardToBlueprint(
        wizardData, 
        this.state.user.id
      );
      console.log('[StateManager] Transformed blueprint data:', JSON.stringify(blueprintData, null, 2));

      // 2. Create optimistic blueprint with temporary ID
      const tempId = `temp_${Date.now()}_${this.state.user.id}`;
      const optimisticBlueprint = { ...blueprintData, id: tempId };
      
      // 3. Update state immediately for instant UI transition
      console.log('[StateManager] Applying optimistic update...');
      const newState = {
        currentBlueprint: optimisticBlueprint,
        currentStep: 'IDEATION_BIG_IDEA', // Start at ideation
        isLoading: false,
        error: null,
        connectionStatus: {
          online: this.state.connectionStatus.online,
          source: 'localStorage' as 'localStorage'
        }
      };
      
      this.updateState(newState);
      
      console.log('[StateManager] Optimistic update completed. Current state:', {
        hasBlueprint: !!this.state.currentBlueprint,
        blueprintId: this.state.currentBlueprint?.id,
        currentStep: this.state.currentStep,
        isLoading: this.state.isLoading
      });

      // 4. Save to backend asynchronously (don't block UI)
      this.saveToBackgroundAsync(optimisticBlueprint);
      
      return tempId;
    } catch (error) {
      console.error('[StateManager] Error in createBlueprintFromWizard:', error);
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

  /**
   * Save blueprint to backend asynchronously without blocking UI
   * CRITICAL: This ensures data persistence while maintaining immediate transitions
   */
  private async saveToBackgroundAsync(blueprint: BlueprintData): Promise<void> {
    console.log('[StateManager] Starting background save for blueprint:', blueprint.id);
    
    try {
      // First save to localStorage immediately for offline support
      const localKey = `blueprint_${blueprint.id}`;
      localStorage.setItem(localKey, JSON.stringify(blueprint));
      console.log('[StateManager] Saved to localStorage:', localKey);
      
      // Then attempt Firebase save
      const saveResult = await RobustFirebaseService.saveBlueprint(
        blueprint, 
        this.state.user.id
      );
      console.log('[StateManager] Background save result:', saveResult);

      if (saveResult.success && saveResult.id && saveResult.id !== blueprint.id) {
        // Update with real Firebase ID when available
        console.log('[StateManager] Updating with real Firebase ID:', saveResult.id);
        
        const updatedBlueprint = { ...blueprint, id: saveResult.id };
        
        // Update localStorage with new ID
        localStorage.removeItem(`blueprint_${blueprint.id}`);
        localStorage.setItem(`blueprint_${saveResult.id}`, JSON.stringify(updatedBlueprint));
        
        // Update state with real ID
        this.updateState({
          currentBlueprint: updatedBlueprint,
          connectionStatus: {
            online: this.state.connectionStatus.online,
            source: saveResult.source
          }
        });
      } else if (saveResult.success) {
        // Just update connection status if save succeeded with same ID
        this.updateState({
          connectionStatus: {
            online: this.state.connectionStatus.online,
            source: saveResult.source
          }
        });
      }
    } catch (error) {
      console.warn('[StateManager] Background save failed, data remains in localStorage:', error);
      // Don't update error state for background save failures
      // The UI should continue working with localStorage data
    }
  }

  // Private methods

  private updateState(partialState: Partial<AppState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partialState };
    console.log('[StateManager] updateState called. Changes:', {
      old: {
        hasBlueprint: !!oldState.currentBlueprint,
        currentStep: oldState.currentStep,
        isLoading: oldState.isLoading
      },
      new: {
        hasBlueprint: !!this.state.currentBlueprint,
        currentStep: this.state.currentStep,
        isLoading: this.state.isLoading
      },
      changes: Object.keys(partialState)
    });
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    console.log('[StateManager] notifyListeners called with', this.listeners.size, 'listeners');
    console.log('[StateManager] State being sent to listeners:', {
      hasBlueprint: !!currentState.currentBlueprint,
      currentStep: currentState.currentStep,
      isLoading: currentState.isLoading
    });
    
    this.listeners.forEach((listener, index) => {
      try {
        console.log(`[StateManager] Calling listener ${index + 1}/${this.listeners.size}`);
        listener(currentState);
        console.log(`[StateManager] Listener ${index + 1} called successfully`);
      } catch (error) {
        console.error(`[StateManager] Listener ${index + 1} error:`, error);
      }
    });
    console.log('[StateManager] All listeners notified');
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
  const [state, setState] = React.useState(() => stateManager.getState());

  React.useEffect(() => {
    console.log('[useStateManager] Setting up subscription');
    const unsubscribe = stateManager.subscribe((newState) => {
      console.log('[useStateManager] Received state update:', {
        hasBlueprint: !!newState.currentBlueprint,
        currentStep: newState.currentStep,
        isLoading: newState.isLoading
      });
      
      // Force state update by creating a new object reference
      setState(prevState => {
        // Only update if state actually changed
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          console.log('[useStateManager] State changed, updating React state');
          return { ...newState };
        }
        console.log('[useStateManager] State unchanged, skipping update');
        return prevState;
      });
    });
    console.log('[useStateManager] Subscription active');
    return unsubscribe;
  }, []);

  return state;
}

export default StateManager;