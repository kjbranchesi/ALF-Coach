/**
 * useIdleDetection.ts
 * Custom hook for detecting user idle state in chat interface
 */

import { useState, useEffect, useCallback } from 'react';

interface UseIdleDetectionOptions {
  threshold?: number; // milliseconds before considered idle
  onIdle?: () => void;
  onActive?: () => void;
  disabled?: boolean;
}

export const useIdleDetection = (
  lastInteractionTime: number,
  options: UseIdleDetectionOptions = {}
) => {
  const {
    threshold = 15000, // 15 seconds default
    onIdle,
    onActive,
    disabled = false
  } = options;

  const [isIdle, setIsIdle] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  useEffect(() => {
    if (disabled) {
      setIsIdle(false);
      setIdleTime(0);
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkIdleState = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionTime;
      
      setIdleTime(timeSinceLastInteraction);
      
      const wasIdle = isIdle;
      const nowIdle = timeSinceLastInteraction > threshold;
      
      if (nowIdle !== wasIdle) {
        setIsIdle(nowIdle);
        
        if (nowIdle && onIdle) {
          onIdle();
        } else if (!nowIdle && onActive) {
          onActive();
        }
      }
    };

    // Initial check
    checkIdleState();

    // Set up interval for continuous checking
    intervalId = setInterval(checkIdleState, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [lastInteractionTime, threshold, disabled, isIdle, onIdle, onActive]);

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    setIdleTime(0);
  }, []);

  return {
    isIdle,
    idleTime,
    idleSeconds: Math.floor(idleTime / 1000),
    resetIdle
  };
};

export default useIdleDetection;