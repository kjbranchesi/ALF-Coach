import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { WifiOff, RefreshCw, Download } from 'lucide-react';

interface Props {
  children: ReactNode;
  resourceName?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isNetworkError: boolean;
  isTimeoutError: boolean;
}

export class DataErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
      isTimeoutError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorMessage = error.message.toLowerCase();
    
    const isNetworkError = 
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('cors') ||
      errorMessage.includes('connection');
    
    const isTimeoutError = 
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out');

    return {
      hasError: true,
      error,
      isNetworkError,
      isTimeoutError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Data Loading Error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Auto-retry for network errors
    if ((this.state.isNetworkError || this.state.isTimeoutError) && 
        this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        this.handleRetry();
      }, 1000 * this.retryCount); // Exponential backoff
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
      isTimeoutError: false
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleOfflineMode = () => {
    // Set offline mode flag
    localStorage.setItem('offlineMode', 'true');
    
    // Reset error state to continue
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { isNetworkError, isTimeoutError, error } = this.state;
      const { resourceName = 'data' } = this.props;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <WifiOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
              {isNetworkError ? 'Connection Issue' : 
               isTimeoutError ? 'Request Timeout' : 
               `Failed to Load ${resourceName}`}
            </h3>
            
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {isNetworkError ? 
                'Unable to connect to the server. Check your internet connection.' :
               isTimeoutError ? 
                'The request took too long to complete. The server might be busy.' :
                `We couldn't load the ${resourceName}. You can retry or continue offline.`}
            </p>

            {this.retryCount > 0 && (
              <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-500">
                Retry attempt {this.retryCount} of {this.maxRetries}
              </p>
            )}

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
                onClick={this.handleRetry}
                disabled={this.retryCount >= this.maxRetries}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Retry'}
              </button>
              
              <button
                onClick={this.handleOfflineMode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Continue Offline
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}