/**
 * Community Resource Button Component
 * Quick access button for community resource mapping
 */

import React, { useState } from 'react';
import { BlueprintDoc } from '../../core/types/SOPTypes';
import CommunityResourceMap from './CommunityResourceMap';
import { CommunityResource } from '../../services/community-resource-mapper';

interface CommunityResourceButtonProps {
  blueprint: BlueprintDoc;
  onResourceSelect?: (resource: CommunityResource) => void;
}

export const CommunityResourceButton: React.FC<CommunityResourceButtonProps> = ({
  blueprint,
  onResourceSelect
}) => {
  const [showResourceMap, setShowResourceMap] = useState(false);

  // Check if community resources are relevant for current stage
  const isRelevantStage = () => {
    // Community resources are most relevant during journey and deliverables stages
    return true; // Always show for now
  };

  if (!isRelevantStage()) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowResourceMap(true)}
        className="fixed bottom-40 right-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all z-40"
        title="Community Resources"
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        
        {/* Notification for nearby resources */}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
      </button>

      {/* Modal with Resource Map */}
      {showResourceMap && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowResourceMap(false)}
          />

          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Community Resources
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Find local organizations and resources for {blueprint.ideation?.bigIdea || 'your project'}
                  </p>
                </div>
                <button
                  onClick={() => setShowResourceMap(false)}
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

              {/* Resource Map Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="p-6">
                  <CommunityResourceMap
                    blueprint={blueprint}
                    onResourceSelect={(resource) => {
                      onResourceSelect?.(resource);
                      // Optionally close modal after selection
                      // setShowResourceMap(false);
                    }}
                  />
                </div>
              </div>

              {/* Quick Tips Footer */}
              <div className="sticky bottom-0 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Look for resources that offer{' '}
                    {getResourceSuggestion(blueprint)} to enhance your project's real-world impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to suggest relevant resource types based on project
const getResourceSuggestion = (blueprint: BlueprintDoc): string => {
  const challenge = blueprint.ideation?.challenge?.toLowerCase() || '';
  
  if (challenge.includes('environment') || challenge.includes('climate')) {
    return 'environmental organizations or green technology centers';
  } else if (challenge.includes('community') || challenge.includes('social')) {
    return 'community centers or non-profit organizations';
  } else if (challenge.includes('technology') || challenge.includes('coding')) {
    return 'maker spaces or technology companies';
  } else if (challenge.includes('art') || challenge.includes('creative')) {
    return 'museums, galleries, or cultural centers';
  } else if (challenge.includes('health') || challenge.includes('wellness')) {
    return 'healthcare organizations or wellness centers';
  } else {
    return 'mentorship programs or expert speakers';
  }
};

export default CommunityResourceButton;