// Rate limiter utility for preventing action flooding
export class RateLimiter {
  private actionTimestamps: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxActionsPerWindow: number;
  private readonly minDelayBetweenActions: number;

  constructor(
    windowMs: number = 60000, // 1 minute window
    maxActionsPerWindow: number = 30,
    minDelayBetweenActions: number = 500 // 500ms minimum between actions
  ) {
    this.windowMs = windowMs;
    this.maxActionsPerWindow = maxActionsPerWindow;
    this.minDelayBetweenActions = minDelayBetweenActions;
  }

  canPerformAction(actionType: string): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const key = actionType;
    
    if (!this.actionTimestamps.has(key)) {
      this.actionTimestamps.set(key, []);
    }
    
    const timestamps = this.actionTimestamps.get(key)!;
    
    // Clean old timestamps
    const cutoff = now - this.windowMs;
    const validTimestamps = timestamps.filter(ts => ts > cutoff);
    
    // Check minimum delay between actions
    if (validTimestamps.length > 0) {
      const lastAction = validTimestamps[validTimestamps.length - 1];
      const timeSinceLastAction = now - lastAction;
      
      if (timeSinceLastAction < this.minDelayBetweenActions) {
        return {
          allowed: false,
          waitTime: this.minDelayBetweenActions - timeSinceLastAction
        };
      }
    }
    
    // Check rate limit
    if (validTimestamps.length >= this.maxActionsPerWindow) {
      const oldestInWindow = validTimestamps[0];
      const waitTime = (oldestInWindow + this.windowMs) - now;
      
      return {
        allowed: false,
        waitTime
      };
    }
    
    // Action allowed - record timestamp
    validTimestamps.push(now);
    this.actionTimestamps.set(key, validTimestamps);
    
    return { allowed: true };
  }

  reset(): void {
    this.actionTimestamps.clear();
  }
}

// Debounce utility for text input
export function createDebouncer<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced as T & { cancel: () => void };
}

// Throttle utility for rapid actions
export function createThrottler<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}