/**
 * MethodSelectionStage.tsx - Enhanced stage component for IDEATION_METHODS step
 * Integrates UDL principles and scaffolding for accessible method selection
 */

import React, { useState } from 'react';
import { type SOPStep } from '../../../core/types/SOPTypes';
import ScaffoldedActivitiesGenerator from '../../../services/legacy/scaffolded-activities-generator';
import { UDLPrinciplesEngine } from '../../../services/udl-principles-engine';

interface MethodSelectionStageProps {
  currentStep: SOPStep;
  ideationData: any;
  onDataUpdate: (data: any) => void;
  onActionClick: (action: string) => void;
}

const MethodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18"></path>
    <path d="M3 6h18"></path>
    <path d="M3 18h18"></path>
  </svg>
);

const AccessibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const ScaffoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v20"></path>
    <path d="M14 2v20"></path>
    <path d="M3 7h18"></path>
    <path d="M3 12h18"></path>
    <path d="M3 17h18"></path>
  </svg>
);

interface MethodOption {
  id: string;
  name: string;
  description: string;
  scaffoldingLevel: 'high' | 'medium' | 'low';
  udlFeatures: string[];
  modalities: string[];
  timeEstimate: string;
}

export const MethodSelectionStage: React.FC<MethodSelectionStageProps> = ({
  currentStep,
  ideationData,
  onDataUpdate,
  onActionClick
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [scaffoldingDetails, setScaffoldingDetails] = useState<any>(null);
  
  // Extract catalyst info
  const catalyst = ideationData?.catalyst?.title || 'Student Project';
  const issues = ideationData?.issues || [];
  
  // Method options with UDL and scaffolding built in
  const methodOptions: MethodOption[] = [
    {
      id: 'inquiry-based',
      name: 'Inquiry-Based Investigation',
      description: 'Students develop questions and investigate solutions through research and experimentation',
      scaffoldingLevel: 'medium',
      udlFeatures: [
        'Multiple research formats (text, video, interviews)',
        'Choice in presentation format',
        'Collaborative or independent options'
      ],
      modalities: ['visual', 'auditory', 'kinesthetic'],
      timeEstimate: '3-4 weeks'
    },
    {
      id: 'design-thinking',
      name: 'Design Thinking Process',
      description: 'Use empathy, ideation, and prototyping to develop innovative solutions',
      scaffoldingLevel: 'high',
      udlFeatures: [
        'Visual thinking tools and templates',
        'Hands-on prototyping materials',
        'Peer feedback structures'
      ],
      modalities: ['visual', 'kinesthetic', 'social'],
      timeEstimate: '4-5 weeks'
    },
    {
      id: 'project-based',
      name: 'Project-Based Learning',
      description: 'Create a tangible product or solution that addresses real-world challenges',
      scaffoldingLevel: 'low',
      udlFeatures: [
        'Flexible project formats',
        'Multiple pathways to success',
        'Student-driven timelines'
      ],
      modalities: ['kinesthetic', 'visual', 'linguistic'],
      timeEstimate: '2-6 weeks'
    },
    {
      id: 'community-action',
      name: 'Community Action Research',
      description: 'Partner with local organizations to investigate and address community needs',
      scaffoldingLevel: 'high',
      udlFeatures: [
        'Real-world context and audience',
        'Multiple communication formats',
        'Authentic feedback loops'
      ],
      modalities: ['social', 'kinesthetic', 'linguistic'],
      timeEstimate: '4-8 weeks'
    }
  ];
  
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    const method = methodOptions.find(m => m.id === methodId);
    if (method) {
      onDataUpdate({
        selectedMethod: {
          id: method.id,
          name: method.name,
          description: method.description,
          timeEstimate: method.timeEstimate
        }
      });
    }
  };
  
  const handleEnhanceWithUDL = async () => {
    if (!selectedMethod) return;
    
    setIsEnhancing(true);
    try {
      const method = methodOptions.find(m => m.id === selectedMethod);
      if (!method) return;
      
      // Generate scaffolding details
      const scaffoldingGenerator = new ScaffoldedActivitiesGenerator();
      const scaffolding = await scaffoldingGenerator.generateScaffoldedActivities({
        learningObjectives: [
          { statement: `Investigate ${catalyst} using ${method.name}`, bloomsLevel: 'analyze' as any }
        ],
        projectContext: {
          title: catalyst,
          duration: method.timeEstimate,
          ageGroup: '11-14',
          subject: ['interdisciplinary']
        },
        scaffoldingPreferences: {
          startingLevel: method.scaffoldingLevel,
          pacing: 'moderate',
          groupingStrategy: 'flexible',
          differentiationNeeds: ['visual_supports', 'language_supports', 'extended_time']
        }
      });
      
      setScaffoldingDetails(scaffolding);
      setShowAccessibility(true);
      
      // Update with enhanced data
      onDataUpdate({
        selectedMethod: {
          id: method.id,
          name: method.name,
          description: method.description,
          timeEstimate: method.timeEstimate,
          udlEnhancements: method.udlFeatures,
          scaffolding: {
            phases: scaffolding.phases?.slice(0, 3) || [],
            supports: scaffolding.differentiationStrategies || []
          }
        }
      });
      
    } catch (error) {
      console.error('Failed to enhance with UDL:', error);
      // Fallback enhancements
      const method = methodOptions.find(m => m.id === selectedMethod);
      if (method) {
        setScaffoldingDetails({
          phases: [
            { name: 'I Do', description: 'Teacher models the process' },
            { name: 'We Do', description: 'Guided practice with support' },
            { name: 'You Do', description: 'Independent application' }
          ]
        });
        setShowAccessibility(true);
      }
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleContinue = () => {
    onActionClick('continue');
  };
  
  return (
    <div className="method-selection-stage space-y-4">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Select Your Learning Method
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Choose an approach that best fits your students and learning goals. Each method includes 
          built-in supports for diverse learners.
        </p>
      </div>
      
      {/* Method Options Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {methodOptions.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={`text-left p-4 border rounded-lg transition-all ${
              selectedMethod === method.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{method.name}</h4>
              <div className="flex gap-1">
                {method.scaffoldingLevel === 'high' && (
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded">
                    High Support
                  </span>
                )}
                {method.modalities.includes('visual') && <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded" title="Visual Learning">V</span>}
                {method.modalities.includes('kinesthetic') && <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded" title="Hands-on Learning">K</span>}
                {method.modalities.includes('social') && <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded" title="Collaborative Learning">S</span>}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{method.description}</p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Duration: {method.timeEstimate}
            </div>
          </button>
        ))}
      </div>
      
      {/* UDL Enhancement Section */}
      {selectedMethod && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AccessibilityIcon />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Universal Design Features</h4>
            </div>
            {!showAccessibility && (
              <button
                onClick={handleEnhanceWithUDL}
                disabled={isEnhancing}
                className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isEnhancing ? 'Enhancing...' : 'Show UDL Supports'}
              </button>
            )}
          </div>
          
          {showAccessibility && (
            <div className="space-y-3">
              {/* UDL Features */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Built-in Accessibility Features:
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {methodOptions.find(m => m.id === selectedMethod)?.udlFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Scaffolding Phases */}
              {scaffoldingDetails?.phases && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <ScaffoldIcon className="inline w-4 h-4 mr-1" />
                    Scaffolding Approach:
                  </h5>
                  <div className="space-y-2">
                    {scaffoldingDetails.phases.map((phase: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded p-2">
                        <div className="font-medium text-sm">{phase.name || phase.phase}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {phase.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={() => onActionClick('compare')}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Compare Methods
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Continue with Selected Method
        </button>
      </div>
    </div>
  );
};
