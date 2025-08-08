/**
 * Enrichment Panel Component
 * Displays enrichment results from Phase 3/4 services
 */

import React, { useState } from 'react';
import { EnrichmentResult } from '../../core/services/EnrichmentAdapter';

interface EnrichmentPanelProps {
  enrichmentResult: EnrichmentResult | null;
  isVisible: boolean;
  onToggle: () => void;
}

export const EnrichmentPanel: React.FC<EnrichmentPanelProps> = ({
  enrichmentResult,
  isVisible,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'objectives' | 'standards' | 'assessment' | 'udl'>('objectives');

  if (!enrichmentResult || (
    !enrichmentResult.learningObjectives?.length &&
    !enrichmentResult.standardsAlignment?.length &&
    !enrichmentResult.assessmentSuggestions?.length &&
    !enrichmentResult.udlSuggestions?.length
  )) {
    return null;
  }

  const hasContent = (tab: string): boolean => {
    switch (tab) {
      case 'objectives':
        return !!enrichmentResult.learningObjectives?.length;
      case 'standards':
        return !!enrichmentResult.standardsAlignment?.length;
      case 'assessment':
        return !!enrichmentResult.assessmentSuggestions?.length;
      case 'udl':
        return !!enrichmentResult.udlSuggestions?.length;
      default:
        return false;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'objectives':
        return renderLearningObjectives();
      case 'standards':
        return renderStandardsAlignment();
      case 'assessment':
        return renderAssessmentSuggestions();
      case 'udl':
        return renderUDLSuggestions();
      default:
        return null;
    }
  };

  const renderLearningObjectives = () => {
    if (!enrichmentResult.learningObjectives?.length) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Learning Objectives
        </h4>
        <div className="space-y-2">
          {enrichmentResult.learningObjectives.map((objective, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{objective}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStandardsAlignment = () => {
    if (!enrichmentResult.standardsAlignment?.length) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Standards Alignment
        </h4>
        <div className="space-y-2">
          {enrichmentResult.standardsAlignment.map((standard, index) => (
            <div
              key={index}
              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">📐</span> {standard}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssessmentSuggestions = () => {
    if (!enrichmentResult.assessmentSuggestions?.length) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Formative Assessment Ideas
        </h4>
        <div className="space-y-2">
          {enrichmentResult.assessmentSuggestions.map((assessment, index) => (
            <div
              key={index}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">📊</span> {assessment}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUDLSuggestions = () => {
    if (!enrichmentResult.udlSuggestions?.length) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Universal Design for Learning
        </h4>
        <div className="space-y-2">
          {enrichmentResult.udlSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">♿</span> {suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed right-0 top-20 bottom-0 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform z-30 ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Enrichments
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quality Score */}
        {enrichmentResult.validationScore !== undefined && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score:</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    enrichmentResult.validationScore >= 0.8 ? 'bg-green-500' :
                    enrichmentResult.validationScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${enrichmentResult.validationScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(enrichmentResult.validationScore * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'objectives', label: '📚 Objectives', icon: '📚' },
          { id: 'standards', label: '📐 Standards', icon: '📐' },
          { id: 'assessment', label: '📊 Assessment', icon: '📊' },
          { id: 'udl', label: '♿ UDL', icon: '♿' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            disabled={!hasContent(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : hasContent(tab.id)
                ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="ml-1 hidden sm:inline">{tab.label.split(' ')[1]}</span>
            {hasContent(tab.id) && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {renderContent()}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};

export default EnrichmentPanel;