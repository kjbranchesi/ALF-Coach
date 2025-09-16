import React, { Component } from 'react';

class SafetyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Safety ErrorBoundary caught:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }
  
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The application encountered an error. You can try reloading the page or resetting the application.
            </p>
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Reload Page
              </button>
              <button 
                onClick={this.handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Try Again
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded">
                <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                  Error Details (for debugging)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
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

export default SafetyErrorBoundary;