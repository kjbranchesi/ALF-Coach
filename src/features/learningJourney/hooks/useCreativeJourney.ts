/**
 * useCreativeJourney.ts
 * 
 * Custom hook for managing Creative Process Journey state
 * Addresses code review concerns about state management complexity
 * 
 * FEATURES:
 * - Centralized state management with useReducer
 * - Optimistic updates
 * - Auto-save with debouncing
 * - Error handling
 * - Undo/redo support
 */

import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { 
  CreativeProcessJourneyData, 
  CreativePhase, 
  PhaseObjective, 
  PhaseActivity, 
  PhaseDeliverable,
  IterationEvent,
  PhaseType,
  JourneyValidationError
} from '../types';

// Action types
type JourneyAction =
  | { type: 'SET_JOURNEY'; payload: CreativeProcessJourneyData }
  | { type: 'UPDATE_PHASE'; phaseIndex: number; updates: Partial<CreativePhase> }
  | { type: 'ADD_OBJECTIVE'; phaseIndex: number; objective: PhaseObjective }
  | { type: 'REMOVE_OBJECTIVE'; phaseIndex: number; objectiveId: string }
  | { type: 'ADD_ACTIVITY'; phaseIndex: number; activity: PhaseActivity }
  | { type: 'REMOVE_ACTIVITY'; phaseIndex: number; activityId: string }
  | { type: 'ADD_DELIVERABLE'; phaseIndex: number; deliverable: PhaseDeliverable }
  | { type: 'REMOVE_DELIVERABLE'; phaseIndex: number; deliverableId: string }
  | { type: 'SET_CURRENT_PHASE'; phaseIndex: number }
  | { type: 'ADD_ITERATION'; event: IterationEvent }
  | { type: 'UPDATE_TIME_ALLOCATIONS'; allocations: number[] }
  | { type: 'MARK_PHASE_COMPLETE'; phaseIndex: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// Reducer state with history for undo/redo
interface JourneyState {
  current: CreativeProcessJourneyData;
  history: CreativeProcessJourneyData[];
  historyIndex: number;
  hasChanges: boolean;
}

// Validation functions
const validateObjective = (objective: PhaseObjective): void => {
  if (!objective.text || !objective.text.trim()) {
    throw new JourneyValidationError('objective.text', objective.text, 'Objective text is required');
  }
  if (objective.text.length > 200) {
    throw new JourneyValidationError('objective.text', objective.text, 'Objective text must be less than 200 characters');
  }
};

const validateActivity = (activity: PhaseActivity): void => {
  if (!activity.name || !activity.name.trim()) {
    throw new JourneyValidationError('activity.name', activity.name, 'Activity name is required');
  }
  if (activity.name.length > 100) {
    throw new JourneyValidationError('activity.name', activity.name, 'Activity name must be less than 100 characters');
  }
  if (!activity.description || !activity.description.trim()) {
    throw new JourneyValidationError('activity.description', activity.description, 'Activity description is required');
  }
  if (activity.description.length > 300) {
    throw new JourneyValidationError('activity.description', activity.description, 'Activity description must be less than 300 characters');
  }
  if (!activity.duration || !activity.duration.trim()) {
    throw new JourneyValidationError('activity.duration', activity.duration, 'Activity duration is required');
  }
};

const validateDeliverable = (deliverable: PhaseDeliverable): void => {
  if (!deliverable.name || !deliverable.name.trim()) {
    throw new JourneyValidationError('deliverable.name', deliverable.name, 'Deliverable name is required');
  }
  if (deliverable.name.length > 100) {
    throw new JourneyValidationError('deliverable.name', deliverable.name, 'Deliverable name must be less than 100 characters');
  }
  if (!deliverable.format || !deliverable.format.trim()) {
    throw new JourneyValidationError('deliverable.format', deliverable.format, 'Deliverable format is required');
  }
};

// Journey reducer
const journeyReducer = (state: JourneyState, action: JourneyAction): JourneyState => {
  // Helper to add to history
  const addToHistory = (newData: CreativeProcessJourneyData): JourneyState => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newData);
    
    // Keep max 50 history items
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    return {
      current: newData,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      hasChanges: true
    };
  };

  switch (action.type) {
    case 'SET_JOURNEY':
      return {
        current: action.payload,
        history: [action.payload],
        historyIndex: 0,
        hasChanges: false
      };

    case 'UPDATE_PHASE': {
      const newPhases = [...state.current.phases];
      newPhases[action.phaseIndex] = {
        ...newPhases[action.phaseIndex],
        ...action.updates
      };
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'ADD_OBJECTIVE': {
      try {
        validateObjective(action.objective);
        const newPhases = [...state.current.phases];
        newPhases[action.phaseIndex] = {
          ...newPhases[action.phaseIndex],
          objectives: [...newPhases[action.phaseIndex].objectives, action.objective]
        };
        
        return addToHistory({
          ...state.current,
          phases: newPhases
        });
      } catch (error) {
        console.error('Validation error:', error);
        return state;
      }
    }

    case 'REMOVE_OBJECTIVE': {
      const newPhases = [...state.current.phases];
      newPhases[action.phaseIndex] = {
        ...newPhases[action.phaseIndex],
        objectives: newPhases[action.phaseIndex].objectives.filter(
          obj => obj.id !== action.objectiveId
        )
      };
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'ADD_ACTIVITY': {
      try {
        validateActivity(action.activity);
        const newPhases = [...state.current.phases];
        newPhases[action.phaseIndex] = {
          ...newPhases[action.phaseIndex],
          activities: [...newPhases[action.phaseIndex].activities, action.activity]
        };
        
        return addToHistory({
          ...state.current,
          phases: newPhases
        });
      } catch (error) {
        console.error('Validation error:', error);
        return state;
      }
    }

    case 'REMOVE_ACTIVITY': {
      const newPhases = [...state.current.phases];
      newPhases[action.phaseIndex] = {
        ...newPhases[action.phaseIndex],
        activities: newPhases[action.phaseIndex].activities.filter(
          act => act.id !== action.activityId
        )
      };
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'ADD_DELIVERABLE': {
      try {
        validateDeliverable(action.deliverable);
        const newPhases = [...state.current.phases];
        newPhases[action.phaseIndex] = {
          ...newPhases[action.phaseIndex],
          deliverables: [...newPhases[action.phaseIndex].deliverables, action.deliverable]
        };
        
        return addToHistory({
          ...state.current,
          phases: newPhases
        });
      } catch (error) {
        console.error('Validation error:', error);
        return state;
      }
    }

    case 'REMOVE_DELIVERABLE': {
      const newPhases = [...state.current.phases];
      newPhases[action.phaseIndex] = {
        ...newPhases[action.phaseIndex],
        deliverables: newPhases[action.phaseIndex].deliverables.filter(
          del => del.id !== action.deliverableId
        )
      };
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'SET_CURRENT_PHASE':
      return addToHistory({
        ...state.current,
        currentPhase: action.phaseIndex
      });

    case 'ADD_ITERATION':
      return addToHistory({
        ...state.current,
        iterationHistory: [...state.current.iterationHistory, action.event]
      });

    case 'UPDATE_TIME_ALLOCATIONS': {
      const newPhases = state.current.phases.map((phase, index) => ({
        ...phase,
        allocation: action.allocations[index],
        duration: `${Math.round(state.current.projectDuration * action.allocations[index])} week${
          Math.round(state.current.projectDuration * action.allocations[index]) !== 1 ? 's' : ''
        }`
      }));
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'MARK_PHASE_COMPLETE': {
      const newPhases = [...state.current.phases];
      newPhases[action.phaseIndex] = {
        ...newPhases[action.phaseIndex],
        completed: true
      };
      
      return addToHistory({
        ...state.current,
        phases: newPhases
      });
    }

    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          current: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          hasChanges: true
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          current: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          hasChanges: true
        };
      }
      return state;

    default:
      return state;
  }
};

// Custom hook
export const useCreativeJourney = (
  initialData: CreativeProcessJourneyData,
  onSave?: (data: CreativeProcessJourneyData) => Promise<void>,
  autoSaveInterval: number = 2000
) => {
  const [state, dispatch] = useReducer(journeyReducer, {
    current: initialData,
    history: [initialData],
    historyIndex: 0,
    hasChanges: false
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout>();

  // Auto-save with debouncing
  useEffect(() => {
    if (onSave && state.hasChanges) {
      clearTimeout(saveTimerRef.current);
      setSaveStatus('saving');
      
      saveTimerRef.current = setTimeout(async () => {
        try {
          await onSave(state.current);
          setSaveStatus('saved');
          setError(null);
        } catch (err) {
          setSaveStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to save');
        }
      }, autoSaveInterval);
    }

    return () => clearTimeout(saveTimerRef.current);
  }, [state.current, state.hasChanges, onSave, autoSaveInterval]);

  // Actions
  const actions = {
    setJourney: useCallback((data: CreativeProcessJourneyData) => {
      dispatch({ type: 'SET_JOURNEY', payload: data });
    }, []),

    updatePhase: useCallback((phaseIndex: number, updates: Partial<CreativePhase>) => {
      dispatch({ type: 'UPDATE_PHASE', phaseIndex, updates });
    }, []),

    addObjective: useCallback((phaseIndex: number, objective: PhaseObjective) => {
      dispatch({ type: 'ADD_OBJECTIVE', phaseIndex, objective });
    }, []),

    removeObjective: useCallback((phaseIndex: number, objectiveId: string) => {
      dispatch({ type: 'REMOVE_OBJECTIVE', phaseIndex, objectiveId });
    }, []),

    addActivity: useCallback((phaseIndex: number, activity: PhaseActivity) => {
      dispatch({ type: 'ADD_ACTIVITY', phaseIndex, activity });
    }, []),

    removeActivity: useCallback((phaseIndex: number, activityId: string) => {
      dispatch({ type: 'REMOVE_ACTIVITY', phaseIndex, activityId });
    }, []),

    addDeliverable: useCallback((phaseIndex: number, deliverable: PhaseDeliverable) => {
      dispatch({ type: 'ADD_DELIVERABLE', phaseIndex, deliverable });
    }, []),

    removeDeliverable: useCallback((phaseIndex: number, deliverableId: string) => {
      dispatch({ type: 'REMOVE_DELIVERABLE', phaseIndex, deliverableId });
    }, []),

    setCurrentPhase: useCallback((phaseIndex: number) => {
      dispatch({ type: 'SET_CURRENT_PHASE', phaseIndex });
    }, []),

    addIteration: useCallback((fromPhase: PhaseType, toPhase: PhaseType, reason: string) => {
      const event: IterationEvent = {
        id: Date.now().toString(),
        fromPhase,
        toPhase,
        reason,
        timestamp: new Date(),
        duration: 0
      };
      dispatch({ type: 'ADD_ITERATION', event });
    }, []),

    updateTimeAllocations: useCallback((allocations: number[]) => {
      dispatch({ type: 'UPDATE_TIME_ALLOCATIONS', allocations });
    }, []),

    markPhaseComplete: useCallback((phaseIndex: number) => {
      dispatch({ type: 'MARK_PHASE_COMPLETE', phaseIndex });
    }, []),

    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
    }, []),

    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
    }, [])
  };

  // Computed values
  const computed = {
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    
    isPhaseComplete: useCallback((phase: CreativePhase) => {
      return phase.objectives.length >= 2 && 
             phase.activities.length >= 2 && 
             phase.deliverables.length >= 1;
    }, []),

    isJourneyComplete: useCallback(() => {
      return state.current.phases.every(phase => 
        phase.objectives.length >= 2 && 
        phase.activities.length >= 2 && 
        phase.deliverables.length >= 1
      );
    }, [state.current.phases]),

    getPhaseProgress: useCallback((phaseIndex: number) => {
      const phase = state.current.phases[phaseIndex];
      const objectiveProgress = Math.min(100, (phase.objectives.length / 2) * 100);
      const activityProgress = Math.min(100, (phase.activities.length / 2) * 100);
      const deliverableProgress = Math.min(100, phase.deliverables.length * 100);
      
      return Math.round((objectiveProgress + activityProgress + deliverableProgress) / 3);
    }, [state.current.phases]),

    getOverallProgress: useCallback(() => {
      const completedPhases = state.current.phases.filter(phase => 
        phase.objectives.length >= 2 && 
        phase.activities.length >= 2 && 
        phase.deliverables.length >= 1
      ).length;
      
      return Math.round((completedPhases / state.current.phases.length) * 100);
    }, [state.current.phases])
  };

  return {
    journeyData: state.current,
    saveStatus,
    error,
    actions,
    computed
  };
};

// Export hook for local storage persistence
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};