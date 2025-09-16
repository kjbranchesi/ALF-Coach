/**
 * JourneyDetailsStage.tsx - Enhanced stage component for JOURNEY_DETAILS step
 * Integrates learning objectives engine and standards alignment
 */

import React, { useState } from 'react';
import { type SOPStep } from '../../../core/types/SOPTypes';
import LearningObjectivesEngine from '../../../services/learning-objectives-engine';
import StandardsAlignmentEngine from '../../../services/standards-alignment-engine';

interface JourneyDetailsStageProps {
  currentStep: SOPStep;
  journeyData: any;
  ideationData: any;
  onDataUpdate: (data: any) => void;
  onActionClick: (action: string) => void;
}

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const StandardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const JourneyDetailsStage: React.FC<JourneyDetailsStageProps> = ({
  currentStep,
  journeyData,
  ideationData,
  onDataUpdate,
  onActionClick
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showStandards, setShowStandards] = useState(false);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  
  const objectivesEngine = new LearningObjectivesEngine();
  const standardsEngine = new StandardsAlignmentEngine();
  
  // Extract relevant data
  const projectTitle = journeyData?.project?.title || ideationData?.catalyst?.title || 'Student Project';
  const ageGroup = journeyData?.details?.ageGroup || 'Ages 11-14';
  const subject = journeyData?.details?.subject || ['General'];
  const duration = journeyData?.details?.duration || '2-3 weeks';
  
  const handleGenerateObjectives = async () => {
    setIsGenerating(true);
    try {
      // Generate comprehensive learning objectives
      const generatedObjectives = await objectivesEngine.generateObjectives({
        projectContext: {
          title: projectTitle,
          description: ideationData?.catalyst?.description || '',
          subject: subject,
          gradeLevel: convertAgeToGrade(ageGroup),
          duration: duration,
          projectType: 'active-learning'
        },
        requirements: {
          count: 4,
          bloomsDistribution: {
            'remember': 0,
            'understand': 1,
            'apply': 2,
            'analyze': 1,
            'evaluate': 0,
            'create': 0
          },
          includeStandards: true,
          culturallyResponsive: true
        }
      });
      
      setObjectives(generatedObjectives);
      setShowObjectives(true);
      
      // Auto-generate standards alignment
      const alignedStandards = await standardsEngine.suggestStandards({
        objectives: generatedObjectives,
        context: {
          subject: subject,
          gradeLevel: convertAgeToGrade(ageGroup)
        }
      });
      
      setStandards(alignedStandards);
      
      // Update journey data with objectives and standards
      onDataUpdate({
        learningObjectives: generatedObjectives.map(obj => obj.statement),
        standardsAlignment: alignedStandards.map(std => ({
          code: std.code,
          description: std.description
        }))
      });
      
    } catch (error) {
      console.error('Failed to generate objectives:', error);
      // Fallback to simple objectives
      const fallbackObjectives = [
        `Students will understand the key concepts of ${projectTitle}`,
        `Students will apply problem-solving skills to complete the project`,
        `Students will analyze different approaches and solutions`,
        `Students will demonstrate their learning through the final product`
      ];
      setObjectives(fallbackObjectives.map((obj, i) => ({ 
        id: `obj-${i}`, 
        statement: obj,
        bloomsLevel: ['understand', 'apply', 'analyze', 'apply'][i]
      })));
      setShowObjectives(true);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleToggleStandards = () => {
    setShowStandards(!showStandards);
  };
  
  const handleContinue = () => {
    onActionClick('continue');
  };
  
  const convertAgeToGrade = (ageGroup: string): string => {
    const gradeMap: Record<string, string> = {
      'Ages 5-7': 'K-2',
      'Ages 8-10': '3-5', 
      'Ages 11-14': '6-8',
      'Ages 15-18': '9-12',
      'Ages 18+': 'Higher Ed'
    };
    return gradeMap[ageGroup] || '6-8';
  };
  
  return (
    <div className="journey-details-stage space-y-4">
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Enhance Journey Details
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Let's add educational depth to your project with learning objectives and standards alignment.
        </p>
      </div>
      
      {/* Project Overview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Project Overview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <BookIcon />
            <span className="font-medium">Title:</span>
            <span className="text-gray-700 dark:text-gray-300">{projectTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <StandardIcon />
            <span className="font-medium">Grade Level:</span>
            <span className="text-gray-700 dark:text-gray-300">{convertAgeToGrade(ageGroup)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <span className="font-medium">Duration:</span>
            <span className="text-gray-700 dark:text-gray-300">{duration}</span>
          </div>
        </div>
      </div>
      
      {/* Learning Objectives Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TargetIcon />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Learning Objectives</h4>
          </div>
          {!showObjectives && (
            <button
              onClick={handleGenerateObjectives}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate SMART Objectives'}
            </button>
          )}
        </div>
        
        {showObjectives && objectives.length > 0 && (
          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <div key={objective.id || index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-medium">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">{objective.statement}</p>
                    {objective.bloomsLevel && (
                      <span className="inline-block mt-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs rounded">
                        Bloom's: {objective.bloomsLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleToggleStandards}
              className="w-full mt-3 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              {showStandards ? 'Hide' : 'Show'} Standards Alignment
            </button>
          </div>
        )}
      </div>
      
      {/* Standards Alignment Section */}
      {showStandards && standards.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <StandardIcon />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Standards Alignment</h4>
          </div>
          <div className="space-y-2">
            {standards.map((standard, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {standard.code}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {standard.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={() => onActionClick('refine')}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Refine Details
        </button>
        <button
          onClick={handleContinue}
          disabled={!showObjectives}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};