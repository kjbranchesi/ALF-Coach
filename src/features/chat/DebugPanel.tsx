import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bug, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debugFeatures } from '../../config/environment';

interface DebugPanelProps {
  messageId: string;
  messageRole: 'user' | 'assistant' | 'system';
  currentState: string;
  isProcessing?: boolean;
  waitingForConfirmation?: boolean;
  journeyData?: any;
  error?: string | null;
  metadata?: any;
  timestamp: Date;
}

export function DebugPanel({
  messageId,
  messageRole,
  currentState,
  isProcessing = false,
  waitingForConfirmation = false,
  journeyData,
  error,
  metadata,
  timestamp
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show if debug panel is enabled
  if (!debugFeatures.showDebugPanel) return null;

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (isProcessing) return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    if (waitingForConfirmation) return <Info className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (error) return 'border-red-200 bg-red-50';
    if (isProcessing) return 'border-blue-200 bg-blue-50';
    if (waitingForConfirmation) return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className={`mb-2 text-xs rounded-lg border ${getStatusColor()} p-2`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-gray-500" />
          <span className="font-mono text-gray-600">
            [{messageRole}] {currentState} 
          </span>
          {getStatusIcon()}
          {error && <span className="text-red-600 ml-2">Error!</span>}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pt-2 border-t border-gray-200 overflow-hidden"
          >
            <div className="space-y-1 font-mono text-xs">
              <div><strong>Message ID:</strong> {messageId}</div>
              <div><strong>Timestamp:</strong> {timestamp.toLocaleTimeString()}</div>
              <div><strong>FSM State:</strong> {currentState}</div>
              <div><strong>Processing:</strong> {isProcessing ? 'Yes' : 'No'}</div>
              <div><strong>Waiting Confirmation:</strong> {waitingForConfirmation ? 'Yes' : 'No'}</div>
              
              {error && (
                <div className="text-red-600">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {journeyData && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-600">Journey Data</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify({
                      ideation: journeyData.stageData?.ideation,
                      currentStage: journeyData.metadata?.currentStage,
                      recaps: Object.keys(journeyData.recaps || {})
                    }, null, 2)}
                  </pre>
                </details>
              )}

              {metadata && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-600">Metadata</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}