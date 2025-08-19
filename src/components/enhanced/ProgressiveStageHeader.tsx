import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Map, 
  Target, 
  CheckCircle, 
  Circle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface StageStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface Stage {
  id: 'ideation' | 'journey' | 'deliverables';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  steps: StageStep[];
  isComplete: boolean;
  isCurrent: boolean;
  progress: number; // 0-100
}

interface ProgressiveStageHeaderProps {
  currentStage: 'ideation' | 'journey' | 'deliverables';
  currentStep: number;
  stageData: Record<string, any>;
  onStageClick?: (stageId: string) => void;
  onHelpClick?: () => void;
  userType?: 'new' | 'experienced' | 'expert';
}

export function ProgressiveStageHeader({
  currentStage,
  currentStep,
  stageData,
  onStageClick,
  onHelpClick,
  userType = 'experienced'
}: ProgressiveStageHeaderProps) {
  
  // Define stages with enhanced metadata
  const stages: Stage[] = [
    {
      id: 'ideation',
      title: 'Ideation',
      description: 'Define your learning vision',
      icon: Lightbulb,
      color: 'blue',
      steps: [
        {
          id: 'bigIdea',
          title: 'Big Idea',
          description: 'Core concept students will explore',
          isComplete: !!stageData.ideation?.bigIdea,
          isCurrent: currentStage === 'ideation' && currentStep === 0
        },
        {
          id: 'essentialQuestion',
          title: 'Essential Question',
          description: 'Driving inquiry question',
          isComplete: !!stageData.ideation?.essentialQuestion,
          isCurrent: currentStage === 'ideation' && currentStep === 1
        },
        {
          id: 'challenge',
          title: 'Challenge',
          description: 'Real-world problem to solve',
          isComplete: !!stageData.ideation?.challenge,
          isCurrent: currentStage === 'ideation' && currentStep === 2
        }
      ],
      isComplete: Object.keys(stageData.ideation || {}).length >= 3,
      isCurrent: currentStage === 'ideation',
      progress: Math.round((Object.keys(stageData.ideation || {}).length / 3) * 100)
    },
    {
      id: 'journey',
      title: 'Learning Journey',
      description: 'Design the learning experience',
      icon: Map,
      color: 'purple',
      steps: [
        {
          id: 'phases',
          title: 'Learning Phases',
          description: 'Progression from intro to mastery',
          isComplete: !!stageData.journey?.phases,
          isCurrent: currentStage === 'journey' && currentStep === 0
        },
        {
          id: 'activities',
          title: 'Activities',
          description: 'Hands-on learning experiences',
          isComplete: !!stageData.journey?.activities,
          isCurrent: currentStage === 'journey' && currentStep === 1
        },
        {
          id: 'resources',
          title: 'Resources',
          description: 'Materials and tools needed',
          isComplete: !!stageData.journey?.resources,
          isCurrent: currentStage === 'journey' && currentStep === 2
        }
      ],
      isComplete: Object.keys(stageData.journey || {}).length >= 3,
      isCurrent: currentStage === 'journey',
      progress: Math.round((Object.keys(stageData.journey || {}).length / 3) * 100)
    },
    {
      id: 'deliverables',
      title: 'Student Deliverables',
      description: 'Define outcomes and assessment',
      icon: Target,
      color: 'green',
      steps: [
        {
          id: 'milestones',
          title: 'Milestones',
          description: 'Progress checkpoints',
          isComplete: !!stageData.deliverables?.milestones,
          isCurrent: currentStage === 'deliverables' && currentStep === 0
        },
        {
          id: 'finalProduct',
          title: 'Final Product',
          description: 'Culminating deliverable',
          isComplete: !!stageData.deliverables?.finalProduct,
          isCurrent: currentStage === 'deliverables' && currentStep === 1
        },
        {
          id: 'assessment',
          title: 'Assessment',
          description: 'Evaluation criteria and rubrics',
          isComplete: !!stageData.deliverables?.assessment,
          isCurrent: currentStage === 'deliverables' && currentStep === 2
        }
      ],
      isComplete: Object.keys(stageData.deliverables || {}).length >= 3,
      isCurrent: currentStage === 'deliverables',
      progress: Math.round((Object.keys(stageData.deliverables || {}).length / 3) * 100)
    }
  ];

  const currentStageData = stages.find(s => s.id === currentStage);
  const currentStepData = currentStageData?.steps[currentStep];

  // Different complexity levels based on user type
  const showDetailedSteps = userType === 'new' || userType === 'experienced';
  const showMinimalUI = userType === 'expert';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Main Progress Bar */}
      <div className="px-4 py-3">
        <div className="max-w-4xl mx-auto">
          
          {/* Stage Overview Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              {stages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = stage.isCurrent;
                const isCompleted = stage.isComplete;
                
                return (
                  <React.Fragment key={stage.id}>
                    <motion.button
                      onClick={() => onStageClick?.(stage.id)}
                      className={`
                        flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200
                        ${isActive ? `bg-${stage.color}-50 border-2 border-${stage.color}-500` : 
                          isCompleted ? `bg-${stage.color}-100 border border-${stage.color}-300` :
                          'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                        ${onStageClick ? 'cursor-pointer' : 'cursor-default'}
                      `}
                      whileHover={onStageClick ? { scale: 1.02 } : {}}
                      whileTap={onStageClick ? { scale: 0.98 } : {}}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${isActive ? `bg-${stage.color}-500 text-white` :
                          isCompleted ? `bg-${stage.color}-500 text-white` :
                          'bg-gray-300 text-gray-600'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <StageIcon className="w-5 h-5" />
                        )}
                      </div>
                      
                      {!showMinimalUI && (
                        <div className="text-left">
                          <div className={`
                            font-semibold text-sm
                            ${isActive ? `text-${stage.color}-900` :
                              isCompleted ? `text-${stage.color}-800` :
                              'text-gray-600'}
                          `}>
                            {stage.title}
                          </div>
                          {userType === 'new' && (
                            <div className="text-xs text-gray-500">
                              {stage.description}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                    
                    {index < stages.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Help Button */}
            <button
              onClick={onHelpClick}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Get help with this stage"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Detailed Current Stage Progress */}
          {showDetailedSteps && currentStageData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Current: {currentStepData?.title}
                </h3>
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {currentStageData.steps.length}
                </div>
              </div>
              
              {/* Step Progress Dots */}
              <div className="flex items-center space-x-2 mb-2">
                {currentStageData.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      w-3 h-3 rounded-full transition-colors
                      ${step.isComplete ? `bg-${currentStageData.color}-500` :
                        step.isCurrent ? `bg-${currentStageData.color}-300` :
                        'bg-gray-300'}
                    `}
                  />
                ))}
              </div>
              
              {/* Current Step Description */}
              {currentStepData && (
                <p className="text-sm text-gray-600">
                  {currentStepData.description}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Color configuration for Tailwind
export const stageColors = {
  blue: {
    50: 'bg-blue-50 border-blue-500',
    100: 'bg-blue-100 border-blue-300',
    300: 'bg-blue-300',
    500: 'bg-blue-500 text-white',
    800: 'text-blue-800',
    900: 'text-blue-900'
  },
  purple: {
    50: 'bg-purple-50 border-purple-500',
    100: 'bg-purple-100 border-purple-300',
    300: 'bg-purple-300',
    500: 'bg-purple-500 text-white',
    800: 'text-purple-800',
    900: 'text-purple-900'
  },
  green: {
    50: 'bg-green-50 border-green-500',
    100: 'bg-green-100 border-green-300',
    300: 'bg-green-300',
    500: 'bg-green-500 text-white',
    800: 'text-green-800',
    900: 'text-green-900'
  }
};