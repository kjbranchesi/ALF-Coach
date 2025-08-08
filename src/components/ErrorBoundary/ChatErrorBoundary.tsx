import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { MessageCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  blueprintId?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isAIError: boolean;
  isFirebaseError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAIError: false,
      isFirebaseError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isAIError = error.message.toLowerCase().includes('gemini') || 
                      error.message.toLowerCase().includes('ai') ||
                      error.message.toLowerCase().includes('api');
    
    const isFirebaseError = error.message.toLowerCase().includes('firebase') ||
                           error.message.toLowerCase().includes('firestore') ||
                           error.message.toLowerCase().includes('permission');

    return {
      hasError: true,
      error,
      isAIError,
      isFirebaseError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat Error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Log to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Track error for monitoring
      console.error('Chat error logged:', {
        blueprintId: this.props.blueprintId,
        error: error.message,
        stack: error.stack
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAIError: false,
      isFirebaseError: false
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReloadChat = () => {
    // Clear local storage for this blueprint and reload
    if (this.props.blueprintId) {
      const storageKey = `blueprint_${this.props.blueprintId}`;
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_messages`);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { isAIError, isFirebaseError, error } = this.state;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
              {isAIError ? 'AI Service Issue' : 
               isFirebaseError ? 'Connection Issue' : 
               'Chat Error'}
            </h3>
            
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {isAIError ? 
                'The AI service is temporarily unavailable. Your work is saved locally.' :
               isFirebaseError ? 
                'Unable to connect to the server. Working in offline mode.' :
                'Something went wrong with the chat interface.'}
            </p>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <summary className="cursor-pointer text-gray-700 dark:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-red-600 dark:text-red-400">
                  {error.toString()}
                </pre>
              </details>
            )}
            
            <div className="mt-6 space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              {(isAIError || isFirebaseError) && (
                <button
                  onClick={() => {
                    // Continue in offline mode
                    this.setState({ hasError: false });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Continue Offline
                </button>
              )}
              
              <button
                onClick={this.handleReloadChat}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Clear and Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}