import { useCallback, useEffect, useRef, useState } from 'react';

interface AnimationControllerOptions {
  enabled: boolean;
  duration: number; // ms
  loops?: number;
  pauseBetweenLoops?: number; // ms
}

export function useAnimationController({
  enabled,
  duration,
  loops = 2,
  pauseBetweenLoops = 120,
}: AnimationControllerOptions) {
  const [isActive, setIsActive] = useState(false);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loopRef = useRef(0);

  const clearTimers = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const trigger = useCallback(() => {
    clearTimers();
    loopRef.current = 0;

    const runLoop = () => {
      if (!enabled) return;
      loopRef.current += 1;
      setIsActive(true);

      timeoutRefs.current.push(
        setTimeout(() => {
          setIsActive(false);
          if (loopRef.current < loops) {
            timeoutRefs.current.push(
              setTimeout(() => {
                runLoop();
              }, pauseBetweenLoops)
            );
          }
        }, duration)
      );
    };

    if (enabled) {
      runLoop();
    }
  }, [clearTimers, duration, enabled, loops, pauseBetweenLoops]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setIsActive(false);
      return;
    }

    trigger();

    return () => {
      clearTimers();
      setIsActive(false);
    };
  }, [enabled, trigger, clearTimers]);

  const replay = useCallback(() => {
    if (!enabled) return;
    trigger();
  }, [enabled, trigger]);

  return { isActive, replay } as const;
}

