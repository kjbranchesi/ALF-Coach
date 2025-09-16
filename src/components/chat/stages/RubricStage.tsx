/**
 * RubricStage.tsx - Stage component for DELIVER_RUBRIC step
 * Integrates the comprehensive RubricGenerator component
 */

import React from 'react';
import RubricGenerator from '../../RubricGenerator';
import { type SOPStep } from '../../../core/types/SOPTypes';

interface RubricStageProps {
  currentStep: SOPStep;
  journeyData: any;
  onDataUpdate: (data: any) => void;
  onActionClick: (action: string) => void;
}

export const RubricStage: React.FC<RubricStageProps> = ({
  currentStep,
  journeyData,
  onDataUpdate,
  onActionClick
}) => {
  // Extract project information from journey data
  const projectTitle = journeyData?.project?.title || 'Student Project';
  const ageGroup = journeyData?.details?.ageGroup || 'Ages 11-14';
  
  const handleRubricGenerated = (rubric: any) => {
    // Update the rubric data in the flow
    onDataUpdate({
      ...rubric,
      generated: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleEnrich = () => {
    onActionClick('enrich');
  };

  const handleContinue = () => {
    onActionClick('continue');
  };

  return (
    <div className="rubric-stage space-y-4">
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Create Assessment Rubric
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Let's create a comprehensive rubric for "{projectTitle}". This will include both 
          teacher and student-friendly versions with clear performance indicators.
        </p>
      </div>

      {/* Comprehensive Rubric Generator */}
      <RubricGenerator 
        assignment={projectTitle}
        ageGroup={ageGroup}
        onRubricGenerated={handleRubricGenerated}
      />

      {/* Action buttons */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={handleEnrich}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Enrich with AI Suggestions
        </button>
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};