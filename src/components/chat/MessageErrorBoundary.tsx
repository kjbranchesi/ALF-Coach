/**
 * MessageErrorBoundary.tsx
 * 
 * Error boundary specifically for message rendering to prevent chat crashes
 */

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  messageId?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MessageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Message rendering error:', {
      messageId: this.props.messageId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Message rendering failed</p>
            <p className="text-xs opacity-75 mt-1">
              {this.props.fallbackMessage || "There was an error displaying this message. The content may contain unsupported formatting."}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2 text-xs font-mono">
                <summary className="cursor-pointer opacity-75">Debug Details</summary>
                <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MessageErrorBoundary;