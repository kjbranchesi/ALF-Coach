import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { JourneyFSM, JourneyData, JourneyState } from '../lib/fsm';

interface FSMContextType {
  fsm: JourneyFSM;
  currentState: JourneyState;
  journeyData: JourneyData;
  progress: { current: number; total: number; percentage: number };
  advance: () => { success: boolean; newState: JourneyState; message?: string };
  edit: (targetState: JourneyState) => { success: boolean; newState: JourneyState };
  reset: (preservePhases?: boolean) => void;
  canSkip: () => boolean;
  updateData: (updates: Partial<JourneyData>) => void;
  addReflection: (reflection: string) => void;
  getStageContext: () => { title: string; description: string; tips: string[] };
  saveState: () => void;
  loadState: (blueprintId: string) => void;
}

const FSMContext = createContext<FSMContextType | undefined>(undefined);

const FSM_STORAGE_KEY = 'journey_fsm_state_';

export function FSMProvider({ children }: { children: React.ReactNode }) {
  const [fsm] = useState(() => new JourneyFSM());
  const [currentState, setCurrentState] = useState<JourneyState>(fsm.current);
  const [journeyData, setJourneyData] = useState<JourneyData>(fsm.data);

  // Update local state when FSM changes
  const syncState = useCallback(() => {
    setCurrentState(fsm.current);
    setJourneyData({ ...fsm.data });
  }, [fsm]);

  const advance = useCallback(() => {
    const result = fsm.advance();
    syncState();
    return result;
  }, [fsm, syncState]);

  const edit = useCallback((targetState: JourneyState) => {
    const result = fsm.edit(targetState);
    syncState();
    return result;
  }, [fsm, syncState]);

  const reset = useCallback((preservePhases?: boolean) => {
    fsm.reset(preservePhases);
    syncState();
  }, [fsm, syncState]);

  const updateData = useCallback((updates: Partial<JourneyData>) => {
    fsm.updateData(updates);
    syncState();
  }, [fsm, syncState]);

  const addReflection = useCallback((reflection: string) => {
    fsm.addReflection(reflection);
    syncState();
  }, [fsm, syncState]);

  const saveState = useCallback((blueprintId?: string) => {
    if (!blueprintId) return;
    
    const state = fsm.exportState();
    try {
      localStorage.setItem(`${FSM_STORAGE_KEY}${blueprintId}`, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving FSM state:', error);
    }
  }, [fsm]);

  const loadState = useCallback((blueprintId: string) => {
    try {
      const saved = localStorage.getItem(`${FSM_STORAGE_KEY}${blueprintId}`);
      if (saved) {
        const state = JSON.parse(saved);
        fsm.importState(state);
        syncState();
      }
    } catch (error) {
      console.error('Error loading FSM state:', error);
    }
  }, [fsm, syncState]);

  const value: FSMContextType = {
    fsm,
    currentState,
    journeyData,
    progress: fsm.progress,
    advance,
    edit,
    reset,
    canSkip: () => fsm.canSkip(),
    updateData,
    addReflection,
    getStageContext: () => fsm.getStageContext(),
    saveState,
    loadState
  };

  return <FSMContext.Provider value={value}>{children}</FSMContext.Provider>;
}

export function useFSM() {
  const context = useContext(FSMContext);
  if (!context) {
    throw new Error('useFSM must be used within FSMProvider');
  }
  return context;
}