import { useState, useEffect, useCallback, useMemo } from 'react';
import ButtonStateManager, { 
  ButtonSystemState, 
  StateEvent, 
  ButtonContext, 
  ButtonState 
} from '../services/button-state-manager';

interface UseButtonStateReturn {
  state: ButtonSystemState;
  buttons: ButtonState[];
  isLoading: boolean;
  dispatchEvent: (event: StateEvent) => Promise<void>;
  getButtonsForContext: (context: ButtonContext) => ButtonState[];
  setLoading: (loading: boolean) => void;
}

export function useButtonState(): UseButtonStateReturn {
  const manager = useMemo(() => ButtonStateManager.getInstance(), []);
  
  const [state, setState] = useState<ButtonSystemState>(() => 
    manager.getCurrentState()
  );
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    // Get initial state
    setState(manager.getCurrentState());

    return unsubscribe;
  }, [manager]);

  const dispatchEvent = useCallback(async (event: StateEvent) => {
    try {
      setIsLoading(true);
      manager.setButtonsLoading(true);
      
      await manager.processEvent(event);
    } catch (error) {
      console.error('Failed to dispatch event:', error);
    } finally {
      setIsLoading(false);
      manager.setButtonsLoading(false);
    }
  }, [manager]);

  const getButtonsForContext = useCallback((context: ButtonContext) => {
    return manager.getButtonsForContext(context);
  }, [manager]);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    manager.setButtonsLoading(loading);
  }, [manager]);

  // Get current buttons from state
  const buttons = useMemo(() => state.buttons, [state]);

  return {
    state,
    buttons,
    isLoading,
    dispatchEvent,
    getButtonsForContext,
    setLoading
  };
}