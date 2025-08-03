/**
 * Progress Monitoring Button Component
 * Quick access button for progress monitoring dashboard
 */

import React, { useState } from 'react';
import { BlueprintDocument } from '../../core/types/BlueprintTypes';
import { SOPStep } from '../../core/types/SOPTypes';
import ProgressMonitoringDashboard from './ProgressMonitoringDashboard';

interface ProgressMonitoringButtonProps {
  blueprint: BlueprintDocument;
  currentStep: SOPStep;
  hasNotifications?: boolean;
}

export const ProgressMonitoringButton: React.FC<ProgressMonitoringButtonProps> = ({
  blueprint,
  currentStep,
  hasNotifications = false
}) => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowDashboard(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all z-40"
        title="Progress Monitoring"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        
        {/* Notification Dot */}
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Modal Dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDashboard(false)}
          />

          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Progress Monitoring Dashboard
                </h2>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                <ProgressMonitoringDashboard
                  blueprint={blueprint}
                  currentStep={currentStep}
                  onInsightAction={(insight) => {
                    console.log('Insight action:', insight);
                    // Handle insight actions here
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgressMonitoringButton;