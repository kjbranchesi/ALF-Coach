import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Save } from 'lucide-react';

interface Props {
  children: ReactNode;
  wizardData?: any;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  savedData: any;
}

export class WizardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      savedData: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Try to recover wizard data from localStorage
    let savedData = null;
    try {
      const stored = localStorage.getItem('wizard_backup');
      if (stored) {
        savedData = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to recover wizard data:', e);
    }

    return {
      hasError: true,
      error,
      savedData
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wizard Error:', error, errorInfo);
    
    // Save current wizard data as backup
    if (this.props.wizardData) {
      try {
        localStorage.setItem('wizard_backup', JSON.stringify(this.props.wizardData));
      } catch (e) {
        console.error('Failed to backup wizard data:', e);
      }
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      savedData: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleRestoreAndContinue = () => {
    if (this.state.savedData) {
      // Store the saved data in sessionStorage for the wizard to pick up
      sessionStorage.setItem('wizard_restore', JSON.stringify(this.state.savedData));
    }
    
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleStartOver = () => {
    // Clear all wizard data
    localStorage.removeItem('wizard_backup');
    localStorage.removeItem('wizardData');
    sessionStorage.removeItem('wizard_restore');
    
    // Navigate to wizard start
    window.location.href = '/chat/new';
  };

  render() {
    if (this.state.hasError) {
      const { error, savedData } = this.state;
      const hasBackup = Boolean(savedData);

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
              Wizard Error
            </h3>
            
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {hasBackup ? 
                "Don't worry! We've saved your progress and can restore it." :
                "Something went wrong with the setup wizard."}
            </p>

            {hasBackup && savedData && (
              <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Save className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5" />
                  <div className="text-sm text-primary-900 dark:text-primary-200">
                    <p className="font-medium">Progress Saved:</p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {savedData.subject && <li>• Subject: {savedData.subject}</li>}
                      {savedData.students && <li>• Students: {savedData.students}</li>}
                      {savedData.topics && <li>• Topics selected</li>}
                    </ul>
                  </div>
                </div>
              </div>
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
              {hasBackup ? (
                <>
                  <button
                    onClick={this.handleRestoreAndContinue}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Restore & Continue
                  </button>
                  
                  <button
                    onClick={this.handleStartOver}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={this.handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleStartOver}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    Start Fresh
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}