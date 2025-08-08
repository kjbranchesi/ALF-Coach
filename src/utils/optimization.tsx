import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from './performance';

/**
 * Enhanced React.memo with deep comparison
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, propsAreEqual || deepPropsAreEqual);
}

/**
 * Deep comparison function for React.memo
 */
function deepPropsAreEqual<P extends object>(prevProps: P, nextProps: P): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    const prevValue = (prevProps as any)[key];
    const nextValue = (nextProps as any)[key];

    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      // Skip function comparison (assume they might be different)
      continue;
    }

    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
        return false;
      }
    } else if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * Hook for optimized event handlers
 */
export function useOptimizedHandler<T extends (...args: any[]) => any>(
  handler: T,
  dependencies: React.DependencyList,
  options?: {
    debounce?: number;
    throttle?: number;
  }
): T {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  });

  const optimizedHandler = useCallback(
    (...args: Parameters<T>) => {
      return handlerRef.current(...args);
    },
    dependencies
  );

  if (options?.debounce) {
    return useMemo(
      () => debounce(optimizedHandler, options.debounce),
      [optimizedHandler, options.debounce]
    ) as T;
  }

  if (options?.throttle) {
    return useMemo(
      () => throttle(optimizedHandler, options.throttle),
      [optimizedHandler, options.throttle]
    ) as T;
  }

  return optimizedHandler as T;
}

/**
 * Hook for preventing unnecessary re-renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Hook for memoizing expensive computations
 */
export function useExpensiveComputation<T>(
  compute: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(compute, dependencies);
}

/**
 * Hook for lazy initial state
 */
export function useLazyState<T>(
  initializer: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() => initializer());
  return [state, setState];
}

/**
 * Component wrapper for code splitting
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <DefaultSuspenseFallback />
}) => {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
};

const DefaultSuspenseFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

/**
 * Batch state updates for performance
 */
export function useBatchedState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = React.useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        ...pendingUpdates.current
      }));
      pendingUpdates.current = {};
      timeoutRef.current = null;
    }, 16); // Batch within one frame (60fps)
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate];
}

/**
 * Hook for detecting idle time
 */
export function useIdleTimer(
  onIdle: () => void,
  timeout: number = 5000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(onIdle, timeout);
  }, [onIdle, timeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);
}

/**
 * Hook for progressive enhancement
 */
export function useProgressiveEnhancement() {
  const [enhancementLevel, setEnhancementLevel] = React.useState<
    'basic' | 'enhanced' | 'full'
  >('basic');

  useEffect(() => {
    // Start with basic, then enhance based on capabilities
    const timer = setTimeout(() => {
      if ('IntersectionObserver' in window) {
        setEnhancementLevel('enhanced');
      }
      
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setEnhancementLevel('full');
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return enhancementLevel;
}

/**
 * Hook for resource hints
 */
export function useResourceHints(urls: string[], type: 'prefetch' | 'preload' | 'preconnect') {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = type;
      link.href = url;
      
      if (type === 'preload') {
        link.as = 'fetch';
      }
      
      document.head.appendChild(link);
      links.push(link);
    });
    
    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [urls, type]);
}