/**
 * JourneyPhaseVisualizer.tsx
 * 
 * Consistent timeline visualization across all project stages
 * Shows clear progression for Ideation, Journey, and Deliverables
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Map, 
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react';

interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  estimatedTime?: string;
  completedTime?: string;
  substeps?: {
    name: string;
    completed: boolean;
  }[];
}

interface Stage {
  id: string;
  name: string;
  icon: React.ReactNode;
  phases: Phase[];
}

interface JourneyPhaseVisualizerProps {
  currentStageId: string;
  currentPhaseId: string;
  stages: Stage[];
  compact?: boolean;
}

// Default stages structure for ALF projects
export const DEFAULT_ALF_STAGES: Stage[] = [
  {
    id: 'ideation',
    name: 'Ideation',
    icon: <Lightbulb className="w-5 h-5" />,
    phases: [
      {
        id: 'big-idea',
        name: 'Big Idea',
        description: 'Define the overarching theme',
        status: 'upcoming',
        estimatedTime: '30 min'
      },
      {
        id: 'essential-question',
        name: 'Essential Question',
        description: 'Craft the driving inquiry',
        status: 'upcoming',
        estimatedTime: '20 min'
      },
      {
        id: 'challenge',
        name: 'Challenge',
        description: 'Design the authentic task',
        status: 'upcoming',
        estimatedTime: '25 min'
      }
    ]
  },
  {
    id: 'journey',
    name: 'Learning Journey',
    icon: <Map className="w-5 h-5" />,
    phases: [
      {
        id: 'analyze',
        name: 'Analyze',
        description: 'Research and understand',
        status: 'upcoming',
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'brainstorm',
        name: 'Brainstorm',
        description: 'Generate creative solutions',
        status: 'upcoming',
        estimatedTime: '3-5 days'
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build and test ideas',
        status: 'upcoming',
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'evaluate',
        name: 'Evaluate',
        description: 'Reflect and iterate',
        status: 'upcoming',
        estimatedTime: '2-3 days'
      }
    ]
  },
  {
    id: 'deliverables',
    name: 'Deliverables',
    icon: <Target className="w-5 h-5" />,
    phases: [
      {
        id: 'milestones',
        name: 'Define Milestones',
        description: 'Set key checkpoints',
        status: 'upcoming',
        estimatedTime: '20 min'
      },
      {
        id: 'rubric',
        name: 'Create Rubric',
        description: 'Build assessment criteria',
        status: 'upcoming',
        estimatedTime: '45 min'
      },
      {
        id: 'presentation',
        name: 'Plan Presentation',
        description: 'Design final showcase',
        status: 'upcoming',
        estimatedTime: '30 min'
      }
    ]
  }
];

export const JourneyPhaseVisualizer: React.FC<JourneyPhaseVisualizerProps> = ({
  currentStageId,
  currentPhaseId,
  stages,
  compact = false
}) => {
  // Calculate time remaining
  const calculateTimeRemaining = () => {
    let totalTime = 0;
    let foundCurrent = false;
    
    stages.forEach(stage => {
      stage.phases.forEach(phase => {
        if (foundCurrent && phase.status !== 'completed') {
          // Parse estimated time (simplified)
          const time = phase.estimatedTime || '0';
          if (time.includes('week')) {
            totalTime += parseInt(time) * 7 * 24 * 60;
          } else if (time.includes('day')) {
            totalTime += parseInt(time) * 24 * 60;
          } else if (time.includes('hour')) {
            totalTime += parseInt(time) * 60;
          } else if (time.includes('min')) {
            totalTime += parseInt(time);
          }
        }
        if (phase.id === currentPhaseId) {
          foundCurrent = true;
        }
      });
    });
    
    // Format time remaining
    if (totalTime > 7 * 24 * 60) {
      return `${Math.round(totalTime / (7 * 24 * 60))} weeks remaining`;
    } else if (totalTime > 24 * 60) {
      return `${Math.round(totalTime / (24 * 60))} days remaining`;
    } else if (totalTime > 60) {
      return `${Math.round(totalTime / 60)} hours remaining`;
    } else {
      return `${totalTime} minutes remaining`;
    }
  };

  if (compact) {
    // Compact horizontal timeline
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Project Timeline</h3>
          <span className="text-xs text-gray-500">{calculateTimeRemaining()}</span>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto">
          {stages.map((stage, stageIndex) => (
            <React.Fragment key={stage.id}>
              {stageIndex > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <div className="flex items-center gap-1">
                {stage.phases.map((phase, phaseIndex) => (
                  <div
                    key={phase.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      transition-all duration-200 cursor-pointer
                      ${phase.status === 'completed' ? 'bg-success-500 text-white' :
                        phase.status === 'current' ? 'bg-primary-500 text-white ring-2 ring-primary-300 ring-offset-2' :
                        'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                    title={`${stage.name}: ${phase.name}`}
                  >
                    {phase.status === 'completed' ? '✓' : phaseIndex + 1}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Project Journey</h2>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{calculateTimeRemaining()}</span>
          </div>
        </div>
        
        {/* Current Location Indicator */}
        <div className="mt-3 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm text-primary-700 font-medium">
              You are here: {stages.find(s => s.id === currentStageId)?.name} - 
              {' '}{stages.find(s => s.id === currentStageId)?.phases.find(p => p.id === currentPhaseId)?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Stages and Phases */}
      <div className="space-y-6">
        {stages.map((stage, stageIndex) => {
          const isCurrentStage = stage.id === currentStageId;
          const stageCompleted = stage.phases.every(p => p.status === 'completed');
          const stageInProgress = stage.phases.some(p => p.status === 'current');
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
              className={`border rounded-lg overflow-hidden transition-all duration-200
                ${isCurrentStage ? 'border-primary-300 shadow-md' : 
                  stageCompleted ? 'border-success-200' : 'border-gray-200'}`}
            >
              {/* Stage Header */}
              <div className={`px-4 py-3 flex items-center justify-between
                ${stageCompleted ? 'bg-success-50' :
                  stageInProgress ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg
                    ${stageCompleted ? 'bg-success-500 text-white' :
                      stageInProgress ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {stage.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{stage.name}</h3>
                    <span className="text-xs text-gray-600">
                      {stage.phases.filter(p => p.status === 'completed').length}/{stage.phases.length} phases complete
                    </span>
                  </div>
                </div>
                {stageCompleted && (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                )}
              </div>

              {/* Phase Timeline */}
              <div className="p-4">
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-200" />
                  
                  {/* Phases */}
                  <div className="space-y-4">
                    {stage.phases.map((phase, phaseIndex) => {
                      const isCurrentPhase = phase.id === currentPhaseId && isCurrentStage;
                      
                      return (
                        <motion.div
                          key={phase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: stageIndex * 0.1 + phaseIndex * 0.05 }}
                          className={`flex items-start gap-3 relative
                            ${isCurrentPhase ? 'scale-105' : ''}`}
                        >
                          {/* Phase Indicator */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                            transition-all duration-200
                            ${phase.status === 'completed' ? 'bg-success-500 text-white' :
                              phase.status === 'current' ? 'bg-primary-500 text-white ring-4 ring-primary-200' :
                              'bg-white border-2 border-gray-300 text-gray-500'}`}>
                            {phase.status === 'completed' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">{phaseIndex + 1}</span>
                            )}
                          </div>
                          
                          {/* Phase Content */}
                          <div className={`flex-1 pb-4 ${phaseIndex === stage.phases.length - 1 ? 'pb-0' : ''}`}>
                            <div className={`p-3 rounded-lg transition-all duration-200
                              ${isCurrentPhase ? 'bg-primary-50 border border-primary-200' :
                                phase.status === 'completed' ? 'bg-success-50 border border-success-200' :
                                'bg-gray-50 border border-gray-200'}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className={`font-medium
                                    ${phase.status === 'completed' ? 'text-gray-700' :
                                      phase.status === 'current' ? 'text-primary-900' : 'text-gray-600'}`}>
                                    {phase.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                                  
                                  {/* Substeps */}
                                  {phase.substeps && phase.substeps.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {phase.substeps.map((substep, subIndex) => (
                                        <div key={subIndex} className="flex items-center gap-2 text-xs">
                                          <div className={`w-3 h-3 rounded-full
                                            ${substep.completed ? 'bg-success-500' : 'bg-gray-300'}`} />
                                          <span className={substep.completed ? 'text-gray-700' : 'text-gray-500'}>
                                            {substep.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Time Info */}
                                <div className="text-right text-xs">
                                  {phase.status === 'completed' && phase.completedTime ? (
                                    <span className="text-success-600">
                                      Completed in {phase.completedTime}
                                    </span>
                                  ) : phase.estimatedTime ? (
                                    <span className="text-gray-500">
                                      ~{phase.estimatedTime}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              
                              {/* Current Phase Indicator */}
                              {isCurrentPhase && (
                                <div className="mt-3 flex items-center gap-2 text-primary-600">
                                  <ArrowRight className="w-4 h-4" />
                                  <span className="text-sm font-medium">Currently working on this</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPhaseVisualizer;