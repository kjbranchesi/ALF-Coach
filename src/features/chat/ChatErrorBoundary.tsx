import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  blueprintId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 CHAT ERROR BOUNDARY TRIGGERED:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Chat Error Details:', error, errorInfo);
    
    // Log to console for debugging
    console.group('🚨 EMERGENCY CHAT ERROR');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-slate-800">
                    Critical Chat Error
                  </h1>
                  <p className="text-slate-600">
                    The chat system has encountered a critical error.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error?.message || 'Unknown error'}
                  </p>
                </div>

                <div className="space-y-4 w-full">
                  <button
                    onClick={this.handleReset}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reload Chat
                  </button>
                  
                  <div className="text-sm text-slate-500">
                    <p>If the problem persists, try:</p>
                    <ul className="mt-2 space-y-1 text-left">
                      <li>• Clear your browser cache</li>
                      <li>• Use a different browser</li>
                      <li>• Contact support with error details</li>
                    </ul>
                  </div>
                </div>

                {/* Emergency fallback - show stored messages */}
                {this.props.blueprintId && (
                  <div className="w-full mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Recent Messages (Read Only)
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto text-left">
                      <EmergencyMessageDisplay blueprintId={this.props.blueprintId} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Emergency component to show stored messages
function EmergencyMessageDisplay({ blueprintId }: { blueprintId: string }) {
  try {
    const journeyData = localStorage.getItem(`journey-v5-${blueprintId}`);
    if (!journeyData) {
      return <p className="text-sm text-gray-500">No stored messages found.</p>;
    }
    
    const data = JSON.parse(journeyData);
    return (
      <div className="space-y-2 text-sm">
        <p className="text-gray-600">Journey data recovered from local storage:</p>
        <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (e) {
    return <p className="text-sm text-gray-500">Unable to recover stored data.</p>;
  }
}