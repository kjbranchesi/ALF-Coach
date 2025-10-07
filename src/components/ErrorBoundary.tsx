// Enhanced error boundary component for graceful error handling
// Now includes specific handling for navigation and asset loading issues
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is a navigation-related error (backspace issue)
    const isNavigationError = this.isNavigationError(error);
    if (isNavigationError) {
      console.warn('🚨 Navigation-related error detected - likely caused by backspace navigation issue');
    }
    
    // Track error frequency
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo, { isNavigationError });
    }
    
    // For navigation errors, don't auto-recover as they require user action
    // For other errors, auto-recover after 5 seconds for transient issues
    if (!isNavigationError && this.state.errorCount < 3) {
      this.resetTimeoutId = setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  private isNavigationError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();
    
    return (
      errorMessage.includes('loading css chunk') ||
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('mime type') ||
      errorMessage.includes('unexpected token') ||
      errorMessage.includes('failed to fetch dynamically imported module') ||
      errorMessage.includes('loading failed for the module') ||
      errorMessage.includes('script load failed') ||
      errorName === 'chunkloaderror' ||
      errorName === 'scripterror'
    );
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const isNavigationError = this.state.error && this.isNavigationError(this.state.error);

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="mt-4 text-xl font-semibold text-center text-gray-900 dark:text-white">
              {isNavigationError ? 'Navigation Error' : 'Oops! Something went wrong'}
            </h2>
            
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {isNavigationError 
                ? "This error is likely caused by browser navigation issues. This often happens when using the backspace key to navigate. We'll help you get back on track."
                : this.state.errorCount < 3 
                  ? "Don't worry - we'll try to recover automatically in a few seconds."
                  : "We're having persistent issues. Please refresh the page or contact support."}
            </p>
            
            {/* Show technical details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <summary className="cursor-pointer text-gray-700 dark:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="mt-6 space-y-3">
              {isNavigationError ? (
                <>
                  <button
                    onClick={() => { window.location.reload(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Application
                  </button>
                  <button
                    onClick={() => { window.location.href = '/'; }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Go to Home Page
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={this.resetErrorBoundary}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => { window.location.reload(); }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              )}
            </div>
            
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Navigation-specific error boundary component
export const NavigationErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleNavigationError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('🚨🚨🚨 NAVIGATION ERROR BOUNDARY CAUGHT ERROR 🚨🚨🚨');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Current URL:', window.location.href);
    console.error('🚨🚨🚨 END ERROR DETAILS 🚨🚨🚨');

    // Could send to analytics/monitoring service
    // analytics.track('navigation_error', {
    //   error: error.message,
    //   stack: error.stack,
    //   component: errorInfo.componentStack
    // });
  };

  return (
    <ErrorBoundary 
      onError={handleNavigationError}
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1.002 1.002 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364.372l.254.145V16a1 1 0 112 0v1.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01.372-1.364z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Loading...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're recovering from a navigation error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
