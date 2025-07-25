import { useState, useEffect, useCallback, useMemo } from 'react';
import ButtonStateManager from '../services/button-state-manager';

export function useButtonState() {
  const manager = useMemo(() => ButtonStateManager.getInstance(), []);
  
  const [state, setState] = useState(() => 
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

  const dispatchEvent = useCallback(async (event) => {
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

  const getButtonsForContext = useCallback((context) => {
    return manager.getButtonsForContext(context);
  }, [manager]);

  const setLoading = useCallback((loading) => {
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