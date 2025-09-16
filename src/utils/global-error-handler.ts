/**
 * Global error handler for ALF Coach
 * Catches unhandled errors that might cause white screens, particularly from 
 * navigation issues and asset loading failures
 */

interface ErrorDetails {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: number;
  userAgent: string;
  url: string;
  isNavigationError: boolean;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorDetails[] = [];
  private maxQueueSize = 10;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  initialize() {
    // Clear one-time reload flag if present
    try {
      if (sessionStorage.getItem('alf_auto_reload_once')) {
        sessionStorage.removeItem('alf_auto_reload_once');
      }
    } catch {}
    // Handle JavaScript runtime errors
    window.addEventListener('error', this.handleError.bind(this));
    
    // Handle unhandled promise rejections (often from failed imports/fetches)
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Handle resource loading errors (CSS, JS chunks, etc.)
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    console.log('🛡️ Global error handler initialized for ALF Coach');
  }

  private handleError(event: ErrorEvent): void {
    const errorDetails: ErrorDetails = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isNavigationError: this.isNavigationError(event.message, event.error)
    };

    this.logError(errorDetails);
    
    // If it's a critical navigation error, show user-friendly recovery
    if (errorDetails.isNavigationError) {
      this.handleNavigationError(errorDetails);
    }
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);
    
    const errorDetails: ErrorDetails = {
      message: `Unhandled Promise Rejection: ${message}`,
      error: error instanceof Error ? error : new Error(message),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isNavigationError: this.isNavigationError(message, error)
    };

    this.logError(errorDetails);

    // Prevent the default browser console error
    event.preventDefault();

    // If it's a navigation error, handle it gracefully
    if (errorDetails.isNavigationError) {
      this.handleNavigationError(errorDetails);
    }
  }

  private handleResourceError(event: Event): void {
    const target = event.target;
    
    // Only handle failed script/link/image loads
    if (target && (target instanceof HTMLScriptElement || 
                   target instanceof HTMLLinkElement || 
                   target instanceof HTMLImageElement)) {
      
      const errorDetails: ErrorDetails = {
        message: `Failed to load resource: ${target.src || (target as HTMLLinkElement).href}`,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        isNavigationError: true // Resource loading failures are often navigation-related
      };

      this.logError(errorDetails);
      this.handleNavigationError(errorDetails);
    }
  }

  private isNavigationError(message: string, error?: any): boolean {
    if (!message) return false;
    
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('loading css chunk') ||
      lowerMessage.includes('loading chunk') ||
      lowerMessage.includes('mime type') ||
      lowerMessage.includes('unexpected token') ||
      lowerMessage.includes('failed to fetch dynamically imported module') ||
      lowerMessage.includes('loading failed for the module') ||
      lowerMessage.includes('script load failed') ||
      lowerMessage.includes('networkerror') ||
      lowerMessage.includes('failed to load resource') ||
      (error && error.name && error.name.toLowerCase() === 'chunkloaderror')
    );
  }

  private handleNavigationError(errorDetails: ErrorDetails): void {
    console.warn('🚨 Navigation error detected:', errorDetails);

    // Debounce multiple rapid navigation errors
    if (this.isRecentNavigationError()) {
      return;
    }

    // One-time automatic hard reload to resolve stale chunk caches
    try {
      if (!sessionStorage.getItem('alf_auto_reload_once')) {
        sessionStorage.setItem('alf_auto_reload_once', '1');
        const url = new URL(window.location.href);
        url.searchParams.set('v', String(Date.now()));
        window.location.replace(url.toString());
        return;
      }
    } catch {}

    // Fallback: show user-friendly recovery options after a short delay
    setTimeout(() => {
      this.showNavigationErrorRecovery(errorDetails);
    }, 100);
  }

  private isRecentNavigationError(): boolean {
    const now = Date.now();
    const recentErrors = this.errorQueue.filter(
      error => error.isNavigationError && (now - error.timestamp) < 5000
    );
    return recentErrors.length > 2; // More than 2 nav errors in 5 seconds
  }

  private showNavigationErrorRecovery(errorDetails: ErrorDetails): void {
    // Create and show a modal-like overlay for recovery
    const overlay = document.createElement('div');
    overlay.id = 'navigation-error-recovery';
    overlay.className = 'fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Navigation Error</h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
            This error often occurs when using the browser's back button or backspace key for navigation. 
            Let's get you back on track.
          </p>
          <div class="space-y-3">
            <button id="nav-error-reload" class="w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Reload Application
            </button>
            <button id="nav-error-home" class="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    document.getElementById('nav-error-reload')?.addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('nav-error-home')?.addEventListener('click', () => {
      window.location.href = '/';
    });

    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (document.getElementById('navigation-error-recovery')) {
        overlay.remove();
      }
    }, 15000);
  }

  private logError(errorDetails: ErrorDetails): void {
    // Add to queue
    this.errorQueue.push(errorDetails);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console with appropriate level
    if (errorDetails.isNavigationError) {
      console.error('🚨 Navigation Error:', errorDetails);
    } else {
      console.error('❌ Runtime Error:', errorDetails);
    }

    // In production, could send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorDetails);
    }
  }

  private reportError(errorDetails: ErrorDetails): void {
    // Could integrate with services like Sentry, LogRocket, etc.
    // For now, just store in localStorage for debugging
    try {
      const storedErrors = JSON.parse(localStorage.getItem('alf_errors') || '[]');
      storedErrors.push(errorDetails);
      
      // Keep only last 50 errors
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50);
      }
      
      localStorage.setItem('alf_errors', JSON.stringify(storedErrors));
    } catch (e) {
      // If localStorage fails, fail silently
      console.warn('Failed to store error details:', e);
    }
  }

  // Public method to get recent errors for debugging
  getRecentErrors(): ErrorDetails[] {
    return [...this.errorQueue];
  }

  // Public method to clear error queue
  clearErrors(): void {
    this.errorQueue = [];
    localStorage.removeItem('alf_errors');
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();
