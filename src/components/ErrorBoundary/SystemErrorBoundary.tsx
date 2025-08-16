/**
 * SystemErrorBoundary - Top-level error boundary that never crashes the app
 * Provides graceful fallbacks and error recovery for all system failures
 */

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';

interface SystemErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

interface SystemErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export class SystemErrorBoundary extends Component<SystemErrorBoundaryProps, SystemErrorBoundaryState> {
  private retryTimeoutRef: NodeJS.Timeout | null = null;

  constructor(props: SystemErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SystemErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SystemErrorBoundary caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: any) => {
    // In a real app, report to monitoring service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error Report:', errorReport);
    
    // Could send to monitoring service here
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReset = () => {
    // Clear any cached data that might be causing issues
    try {
      // Clear localStorage of any potentially corrupted data
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('blueprint_') || 
        key.startsWith('chat_') ||
        key.startsWith('wizard_')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }

    // Reset state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    // Reload the page after a brief delay
    this.retryTimeoutRef = setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  private handleReportBug = () => {
    const error = this.state.error;
    const errorInfo = this.state.errorInfo;
    
    // Create a bug report URL or email
    const bugReport = encodeURIComponent(`
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `);

    // Open email client or redirect to bug report form
    window.open(`mailto:support@alfcoach.com?subject=Bug Report&body=${bugReport}`);
  };

  componentWillUnmount() {
    if (this.retryTimeoutRef) {
      clearTimeout(this.retryTimeoutRef);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Don't worry - your work is saved automatically. Let's get you back on track.
              </p>
            </div>

            {/* Error details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              {/* Retry button */}
              <EnhancedButton
                onClick={this.handleRetry}
                variant="filled"
                size="md"
                leftIcon={<RefreshCw className="w-5 h-5" />}
                className="w-full"
              >
                Try Again
              </EnhancedButton>

              {/* Reset button (after multiple retries) */}
              {this.state.retryCount > 1 && (
                <EnhancedButton
                  onClick={this.handleReset}
                  variant="outlined"
                  size="md"
                  leftIcon={<Home className="w-5 h-5" />}
                  className="w-full"
                >
                  Start Fresh
                </EnhancedButton>
              )}

              {/* Bug report button */}
              <EnhancedButton
                onClick={this.handleReportBug}
                variant="text"
                size="sm"
                leftIcon={<Bug className="w-4 h-4" />}
                className="w-full text-gray-500"
              >
                Report This Issue
              </EnhancedButton>
            </div>

            {/* Retry count indicator */}
            {this.state.retryCount > 0 && (
              <p className="mt-4 text-xs text-gray-500">
                Retry attempt: {this.state.retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SystemErrorBoundary;