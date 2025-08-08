/**
 * Enrichment Toggle Component
 * Button to show/hide enrichment panel
 */

import React from 'react';
import { EnrichmentResult } from '../../core/services/EnrichmentAdapter';

interface EnrichmentToggleProps {
  enrichmentResult: EnrichmentResult | null;
  isVisible: boolean;
  onToggle: () => void;
}

export const EnrichmentToggle: React.FC<EnrichmentToggleProps> = ({
  enrichmentResult,
  isVisible,
  onToggle
}) => {
  // Don't show if no enrichment data
  if (!enrichmentResult || (
    !enrichmentResult.learningObjectives?.length &&
    !enrichmentResult.standardsAlignment?.length &&
    !enrichmentResult.assessmentSuggestions?.length &&
    !enrichmentResult.udlSuggestions?.length
  )) {
    return null;
  }

  // Count available enrichments
  const enrichmentCount = 
    (enrichmentResult.learningObjectives?.length || 0) +
    (enrichmentResult.standardsAlignment?.length || 0) +
    (enrichmentResult.assessmentSuggestions?.length || 0) +
    (enrichmentResult.udlSuggestions?.length || 0);

  return (
    <button
      onClick={onToggle}
      className={`fixed top-24 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all z-40 ${
        isVisible ? 'translate-x-[-400px]' : ''
      }`}
      title="AI Enrichments"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <span className="font-medium">AI Enrichments</span>
        {enrichmentCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
            {enrichmentCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default EnrichmentToggle;