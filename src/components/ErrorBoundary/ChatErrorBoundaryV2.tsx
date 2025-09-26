/**
 * ChatErrorBoundary - Handles chat-specific errors without breaking the entire app
 * Provides context-aware fallbacks for chat failures
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';

interface ChatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

interface ChatErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

export class ChatErrorBoundary extends Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChatErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error('ChatErrorBoundary caught error:', error);
    
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Chat Temporarily Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
            The AI chat is experiencing difficulties. Your work is still saved. You can continue designing your project manually.
          </p>
          
          <div className="space-y-3 w-full max-w-sm">
            <EnhancedButton
              onClick={this.handleRetry}
              variant="filled"
              size="md"
              leftIcon={<RefreshCw className="w-5 h-5" />}
              className="w-full"
            >
              Retry Chat
            </EnhancedButton>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                You can still access your saved projects and continue working offline
              </p>
            </div>
          </div>

          {this.state.retryCount > 0 && (
            <p className="mt-4 text-xs text-gray-400">
              Retry {this.state.retryCount}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
