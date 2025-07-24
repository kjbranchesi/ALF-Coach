import React, { createContext, useContext, useState, useCallback } from 'react';
import { JourneyFSMv2, JourneyData, JourneyState, StageRecap } from '../lib/fsm-v2';

interface FSMContextType {
  fsm: JourneyFSMv2;
  currentState: JourneyState;
  journeyData: JourneyData;
  progress: { current: number; total: number; percentage: number; segment: 'ideation' | 'journey' | 'deliver' | 'complete' };
  advance: () => { success: boolean; newState: JourneyState; message?: string };
  edit: (targetState: JourneyState) => { success: boolean; newState: JourneyState };
  reset: (preserveIdeation?: boolean) => void;
  canSkip: () => boolean;
  updateData: (updates: Partial<JourneyData>) => void;
  addReflection: (reflection: string) => void;
  getStageContext: () => { title: string; description: string; tips: string[] };
  saveState: () => void;
  loadState: (blueprintId: string) => void;
  isInitiator: () => boolean;
  isClarifier: () => boolean;
  getCurrentStage: () => 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'PUBLISH';
  saveStageRecap: () => void;
  generateStageRecap: (stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES') => StageRecap;
}

const FSMContext = createContext<FSMContextType | undefined>(undefined);

const FSM_STORAGE_KEY = 'journey_fsm_v2_state_';

export function FSMProviderV2({ children }: { children: React.ReactNode }) {
  const [fsm] = useState(() => new JourneyFSMv2());
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

  const reset = useCallback((preserveIdeation?: boolean) => {
    fsm.reset(preserveIdeation);
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
    loadState,
    isInitiator: () => fsm.isInitiator(),
    isClarifier: () => fsm.isClarifier(),
    getCurrentStage: () => fsm.getCurrentStage(),
    saveStageRecap: () => fsm.saveStageRecap(),
    generateStageRecap: (stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES') => fsm.generateStageRecap(stage)
  };

  return <FSMContext.Provider value={value}>{children}</FSMContext.Provider>;
}

export function useFSMv2() {
  const context = useContext(FSMContext);
  if (!context) {
    throw new Error('useFSMv2 must be used within FSMProviderV2');
  }
  return context;
}