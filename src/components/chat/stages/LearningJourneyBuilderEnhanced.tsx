/**
 * LearningJourneyBuilderEnhanced.tsx - Production-ready Learning Journey Builder
 * 
 * Enhanced version with:
 * - Robust validation and error handling
 * - AI-powered suggestions via GeminiService
 * - Mobile-responsive design
 * - Edit capability for all phases
 * - Auto-save functionality
 * - Contextual help system
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Target,
  Users,
  Package,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  FileText,
  Check,
  Edit2,
  Plus,
  Sparkles,
  HelpCircle,
  Save,
  AlertCircle,
  X,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { type GeminiService } from '../../../services/GeminiService';

interface Phase {
  id: string;
  name: string;
  duration: string;
  goal: string;
  activities: string[];
  successCriteria: string;
  isComplete?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

interface LearningJourneyBuilderEnhancedProps {
  wizardData: {
    timeline: string;
    gradeLevel: string;
    subject: string;
    studentCount: number;
  };
  ideationData: {
    bigIdea: string;
    essentialQuestion: string;
    challenge: string;
  };
  geminiService?: GeminiService;
  onComplete: (journeyData: any) => void;
  onStepComplete?: (step: string, data: any) => void;
  onAutoSave?: (data: any) => void;
  initialData?: any; // For resuming incomplete journeys
}

type BuilderStep = 'timeline' | 'phases' | 'agency' | 'resources' | 'review';

const HELP_CONTENT = {
  timeline: {
    title: 'Creating Your Timeline',
    content: 'Break your project into manageable chunks. Each milestone should represent a significant checkpoint where students demonstrate progress. Think about natural breaking points in the learning journey.',
    tips: [
      'Start with a launch/hook phase to engage students',
      'Include time for iteration and revision',
      'End with celebration and reflection'
    ]
  },
  phases: {
    title: 'Defining Learning Phases',
    content: 'Each phase should have a clear purpose and outcome. Activities should directly support the phase goal, and success criteria help you know when students are ready to progress.',
    tips: [
      'Keep phase goals specific and measurable',
      'Mix individual and group activities',
      'Include formative assessment opportunities'
    ]
  },
  agency: {
    title: 'Student Voice & Choice',
    content: 'Giving students agency increases engagement and ownership. Consider where students can make meaningful choices without compromising learning objectives.',
    tips: [
      'Start small with limited choices',
      'Increase agency for older students',
      'Balance structure with freedom'
    ]
  }
};

export const LearningJourneyBuilderEnhanced: React.FC<LearningJourneyBuilderEnhancedProps> = ({
  wizardData,
  ideationData,
  geminiService,
  onComplete,
  onStepComplete,
  onAutoSave,
  initialData
}) => {
  // Responsive design
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState<BuilderStep>(
    initialData?.currentStep || 'timeline'
  );
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  
  // Journey data
  const [timeline, setTimeline] = useState(initialData?.timeline || {
    duration: wizardData.timeline || '4 weeks',
    milestones: []
  });
  const [phases, setPhases] = useState<Phase[]>(initialData?.phases || []);
  const [studentAgency, setStudentAgency] = useState<string[]>(
    initialData?.studentAgency || []
  );
  const [resources, setResources] = useState<string[]>(
    initialData?.resources || []
  );
  
  // UI state
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Auto-save functionality
  useEffect(() => {
    if (onAutoSave && saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        setSaveStatus('saving');
        onAutoSave({
          currentStep,
          timeline,
          phases,
          studentAgency,
          resources
        });
        setTimeout(() => setSaveStatus('saved'), 500);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [timeline, phases, studentAgency, resources, currentStep]);

  // Mark as unsaved when data changes
  useEffect(() => {
    setSaveStatus('unsaved');
  }, [timeline, phases, studentAgency, resources]);

  // Get duration in weeks
  const getDurationWeeks = useCallback(() => {
    const match = timeline.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }, [timeline.duration]);

  // Validation functions
  const validateMilestone = (milestone: string): string | null => {
    if (!milestone.trim()) {
      return 'Milestone cannot be empty';
    }
    if (milestone.length < 5) {
      return 'Milestone too short - be more descriptive';
    }
    if (milestone.length > 100) {
      return 'Milestone too long - keep it concise';
    }
    return null;
  };

  const validatePhase = (phase: Phase): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!phase.goal || phase.goal.length < 10) {
      errors.push({
        field: 'goal',
        message: 'Phase goal must be at least 10 characters'
      });
    }
    
    if (phase.activities.length < 2) {
      errors.push({
        field: 'activities',
        message: 'Each phase needs at least 2 activities'
      });
    }
    
    if (!phase.successCriteria || phase.successCriteria.length < 10) {
      errors.push({
        field: 'successCriteria',
        message: 'Success criteria must be clearly defined'
      });
    }
    
    return errors;
  };

  // Get AI suggestions
  const getAISuggestions = async (type: string, context?: any) => {
    if (!geminiService) {
      console.warn('GeminiService not available, using fallback suggestions');
      return getFallbackSuggestions(type, context);
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await geminiService.generate({
        action: 'ideas',
        step: `JOURNEY_${type.toUpperCase()}`,
        context: {
          ...wizardData,
          ...ideationData,
          ...context,
          existingData: {
            timeline,
            phases,
            currentPhase: phases[currentPhaseIndex]
          }
        }
      });
      
      setAiSuggestions(response.suggestions || []);
      return response.suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return getFallbackSuggestions(type, context);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Fallback suggestions when AI is not available
  const getFallbackSuggestions = (type: string, context?: any) => {
    const weeks = getDurationWeeks();
    const gradeLevel = wizardData.gradeLevel?.toLowerCase() || '';
    
    switch (type) {
      case 'milestones':
        return getMilestoneSuggestions();
      case 'activities':
        return getActivitySuggestions(context?.phase || phases[currentPhaseIndex]);
      case 'resources':
        return getResourceSuggestions();
      default:
        return [];
    }
  };

  // Generate milestone suggestions based on duration
  const getMilestoneSuggestions = () => {
    const weeks = getDurationWeeks();
    const gradeLevel = wizardData.gradeLevel?.toLowerCase() || '';
    
    if (weeks <= 2) {
      if (gradeLevel.includes('elementary')) {
        return [
          { id: '1', text: 'Day 1-2: Discover & Wonder', description: 'Students explore the topic and ask questions' },
          { id: '2', text: 'Day 3-6: Create & Build', description: 'Students work on their projects' },
          { id: '3', text: 'Day 7-10: Share & Celebrate', description: 'Students present their learning' }
        ];
      } else {
        return [
          { id: '1', text: 'Week 1: Research & Explore', description: 'Deep dive into the problem space' },
          { id: '2', text: 'Week 2: Design & Create', description: 'Develop and refine solutions' },
          { id: '3', text: 'Final Days: Present & Reflect', description: 'Share work and gather feedback' }
        ];
      }
    } else if (weeks <= 4) {
      return [
        { id: '1', text: 'Week 1: Launch & Explore', description: 'Hook students and begin investigation' },
        { id: '2', text: 'Week 2: Research & Plan', description: 'Gather information and design approach' },
        { id: '3', text: 'Week 3: Build & Test', description: 'Create solutions and get feedback' },
        { id: '4', text: 'Week 4: Refine & Present', description: 'Polish work and share with audience' }
      ];
    } else {
      return [
        { id: '1', text: 'Weeks 1-2: Foundation', description: 'Build knowledge and understanding' },
        { id: '2', text: 'Weeks 3-4: Investigation', description: 'Deep research and analysis' },
        { id: '3', text: 'Weeks 5-6: Creation', description: 'Develop solutions and products' },
        { id: '4', text: 'Week 7: Testing', description: 'Get feedback and iterate' },
        { id: '5', text: 'Week 8: Presentation', description: 'Final presentations and celebration' }
      ];
    }
  };

  // Get activity suggestions for current phase
  const getActivitySuggestions = (phase: Phase) => {
    const gradeLevel = wizardData.gradeLevel?.toLowerCase() || '';
    const phaseName = phase.name.toLowerCase();
    
    if (phaseName.includes('launch') || phaseName.includes('discover') || phaseName.includes('explore')) {
      if (gradeLevel.includes('elementary')) {
        return [
          'Watch an engaging video about the topic',
          'Go on a walking field trip to observe',
          'Create KWL charts (Know, Want to know, Learned)',
          'Interview a guest speaker',
          'Do a hands-on exploration activity'
        ];
      } else {
        return [
          'Analyze case studies or examples',
          'Conduct initial research online',
          'Brainstorm questions to investigate',
          'Create mind maps of the topic',
          'Interview experts or stakeholders'
        ];
      }
    } else if (phaseName.includes('research') || phaseName.includes('investigate')) {
      return [
        'Conduct surveys or interviews',
        'Research using multiple sources',
        'Analyze data and find patterns',
        'Create research notebooks',
        'Collaborate with expert mentors'
      ];
    } else if (phaseName.includes('create') || phaseName.includes('build')) {
      return [
        'Design prototypes or models',
        'Create digital products',
        'Build physical solutions',
        'Develop presentations',
        'Test with target audience'
      ];
    } else if (phaseName.includes('present') || phaseName.includes('share')) {
      return [
        'Practice presentation skills',
        'Set up exhibition space',
        'Present to authentic audience',
        'Gather feedback from viewers',
        'Reflect on learning journey'
      ];
    }
    
    return [
      'Define specific goals for this phase',
      'Work in collaborative teams',
      'Document progress and learning',
      'Get feedback from peers',
      'Revise based on feedback'
    ];
  };

  // Get resource suggestions
  const getResourceSuggestions = () => {
    return [
      'Chromebooks or tablets for research',
      'Art supplies for creating',
      'Guest speaker or expert mentor',
      'Field trip location or virtual tour',
      'Online research databases',
      'Presentation space and equipment',
      'Collaboration tools (Google Workspace, etc.)',
      'Assessment rubrics and templates'
    ];
  };

  // Handle adding milestone
  const addMilestone = (milestone: string) => {
    const error = validateMilestone(milestone);
    if (error) {
      setValidationErrors([{ field: 'milestone', message: error }]);
      return;
    }
    
    setValidationErrors([]);
    setTimeline(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone]
    }));
    setInputValue('');
    
    // Create a phase for this milestone
    const newPhase: Phase = {
      id: `phase-${phases.length + 1}`,
      name: milestone.split(':')[0] || milestone,
      duration: extractDuration(milestone),
      goal: '',
      activities: [],
      successCriteria: '',
      isComplete: false
    };
    setPhases(prev => [...prev, newPhase]);
  };

  // Extract duration from milestone text
  const extractDuration = (milestone: string): string => {
    const match = milestone.match(/(Week \d+|Weeks \d+-\d+|Day \d+-\d+|Final Days)/i);
    return match ? match[0] : 'Flexible';
  };

  // Handle adding activity to current phase
  const addActivityToPhase = (activity: string) => {
    if (!activity.trim() || activity.length < 5) {
      setValidationErrors([{ 
        field: 'activity', 
        message: 'Activity must be at least 5 characters' 
      }]);
      return;
    }
    
    setValidationErrors([]);
    const updatedPhases = [...phases];
    if (editingPhaseId) {
      const phaseIndex = updatedPhases.findIndex(p => p.id === editingPhaseId);
      if (phaseIndex !== -1) {
        updatedPhases[phaseIndex].activities.push(activity);
      }
    } else {
      updatedPhases[currentPhaseIndex].activities.push(activity);
    }
    setPhases(updatedPhases);
    setInputValue('');
  };

  // Handle phase edit
  const startEditingPhase = (phaseId: string) => {
    setEditingPhaseId(phaseId);
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    setCurrentPhaseIndex(phaseIndex);
    setCurrentStep('phases');
  };

  // Handle phase completion
  const markPhaseComplete = (phaseIndex: number) => {
    const phase = phases[phaseIndex];
    const errors = validatePhase(phase);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex].isComplete = true;
    setPhases(updatedPhases);
    setValidationErrors([]);
    return true;
  };

  // Check if can proceed to next step
  const canProceedFromTimeline = () => {
    return timeline.milestones.length >= 3;
  };

  const canProceedFromPhases = () => {
    return phases.every(p => p.isComplete);
  };

  // Mobile step navigation
  const stepOrder: BuilderStep[] = ['timeline', 'phases', 'agency', 'resources', 'review'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const navigateStep = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    } else if (direction === 'next' && currentStepIndex < stepOrder.length - 1) {
      // Validate before proceeding
      if (currentStep === 'timeline' && !canProceedFromTimeline()) {
        setValidationErrors([{ 
          field: 'timeline', 
          message: 'Add at least 3 milestones before continuing' 
        }]);
        return;
      }
      if (currentStep === 'phases' && !canProceedFromPhases()) {
        setValidationErrors([{ 
          field: 'phases', 
          message: 'Complete all phases before continuing' 
        }]);
        return;
      }
      setCurrentStep(stepOrder[currentStepIndex + 1]);
      setValidationErrors([]);
    }
  };

  // Render help modal
  const renderHelpModal = () => {
    const helpInfo = HELP_CONTENT[currentStep] || HELP_CONTENT.timeline;
    
    return (
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {helpInfo.title}
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {helpInfo.content}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Tips:</h4>
                {helpInfo.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Render validation errors
  const renderValidationErrors = () => {
    if (validationErrors.length === 0) {return null;}
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
      >
        {validationErrors.map((error, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </div>
        ))}
      </motion.div>
    );
  };

  // Render mobile navigation
  const renderMobileNav = () => {
    if (!isMobile) {return null;}
    
    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigateStep('prev')}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStepIndex + 1} of {stepOrder.length}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={() => navigateStep('next')}
          disabled={currentStepIndex === stepOrder.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Render save status
  const renderSaveStatus = () => {
    if (!onAutoSave) {return null;}
    
    return (
      <div className="fixed top-4 right-4 z-40">
        <AnimatePresence>
          {saveStatus !== 'saved' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                saveStatus === 'saving' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Main render for each step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'timeline':
        return renderTimelineStep();
      case 'phases':
        return renderPhasesStep();
      case 'agency':
        return renderAgencyStep();
      case 'resources':
        return renderResourcesStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Render timeline step
  const renderTimelineStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Let's map out your project timeline
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You have <strong>{timeline.duration}</strong> for this project. 
          Let's break it into manageable chunks with clear milestones.
        </p>
      </div>

      {/* Current milestones */}
      {timeline.milestones.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Your Milestones:</h4>
          <div className="space-y-2">
            {timeline.milestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {idx + 1}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 flex-1">{milestone}</span>
                <button
                  onClick={() => {
                    setTimeline(prev => ({
                      ...prev,
                      milestones: prev.milestones.filter((_, i) => i !== idx)
                    }));
                    setPhases(prev => prev.filter((_, i) => i !== idx));
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderValidationErrors()}

      {/* Add milestone input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add a milestone (you need {Math.max(0, 3 - timeline.milestones.length)} more):
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              addMilestone(inputValue.trim());
            }
          }}
          placeholder="e.g., Week 1: Launch & Explore"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
        />

        {/* Suggestion buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const suggestions = await getAISuggestions('milestones');
              setShowSuggestions(true);
            }}
            disabled={isLoadingSuggestions}
            className="flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {isLoadingSuggestions ? 'Loading...' : 'Get Ideas'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>

        {/* Suggestions panel */}
        {showSuggestions && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Suggested milestones for {timeline.duration}:
              </p>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
              >
                <X className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </button>
            </div>
            {(aiSuggestions.length > 0 ? aiSuggestions : getMilestoneSuggestions()).map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => {
                  addMilestone(suggestion.text);
                  setShowSuggestions(false);
                }}
                className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg 
                         hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {suggestion.text}
                </div>
                {suggestion.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Continue button */}
      {timeline.milestones.length >= 3 && (
        <Button
          onClick={() => setCurrentStep('phases')}
          className="w-full flex items-center justify-center gap-2"
        >
          Continue to Define Phases
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );

  // Render phases step
  const renderPhasesStep = () => {
    const currentPhase = editingPhaseId 
      ? phases.find(p => p.id === editingPhaseId)! 
      : phases[currentPhaseIndex];
    
    if (!currentPhase) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No phases to edit. Please add milestones first.
          </p>
          <Button onClick={() => setCurrentStep('timeline')}>
            Back to Timeline
          </Button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Phase selector for editing */}
        {!isMobile && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {phases.map((phase, idx) => (
              <button
                key={phase.id}
                onClick={() => startEditingPhase(phase.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                  phase.id === (editingPhaseId || phases[currentPhaseIndex]?.id)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : phase.isComplete
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {phase.isComplete && <Check className="w-4 h-4" />}
                Phase {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Phase header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 
                      rounded-xl p-4 border border-primary-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingPhaseId ? 'Editing: ' : 'Phase '} {currentPhase.name}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentPhase.duration}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Let's define what happens in this phase of the learning journey.
          </p>
        </div>

        {renderValidationErrors()}

        {/* Phase goal */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What's the main goal of this phase?
          </label>
          <textarea
            value={currentPhase.goal}
            onChange={(e) => {
              const updatedPhases = [...phases];
              const idx = updatedPhases.findIndex(p => p.id === currentPhase.id);
              updatedPhases[idx].goal = e.target.value;
              setPhases(updatedPhases);
            }}
            placeholder="e.g., Students will understand the problem and begin exploring solutions"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none
                     resize-none"
            rows={2}
          />
        </div>

        {/* Phase activities */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What will students DO in this phase? (Add 2-4 activities)
          </label>
          
          {/* Current activities */}
          {currentPhase.activities.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              {currentPhase.activities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 flex-1">{activity}</span>
                  <button
                    onClick={() => {
                      const updatedPhases = [...phases];
                      const phaseIdx = updatedPhases.findIndex(p => p.id === currentPhase.id);
                      updatedPhases[phaseIdx].activities = 
                        updatedPhases[phaseIdx].activities.filter((_, i) => i !== idx);
                      setPhases(updatedPhases);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add activity input */}
          {currentPhase.activities.length < 4 && (
            <>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    addActivityToPhase(inputValue.trim());
                  }
                }}
                placeholder="e.g., Research existing solutions online"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
              />
              
              {/* Activity suggestions */}
              <div className="flex flex-wrap gap-2">
                {getActivitySuggestions(currentPhase).slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => addActivityToPhase(suggestion)}
                    className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 
                             dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Success criteria */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            How will you know students are ready to move on?
          </label>
          <textarea
            value={currentPhase.successCriteria}
            onChange={(e) => {
              const updatedPhases = [...phases];
              const idx = updatedPhases.findIndex(p => p.id === currentPhase.id);
              updatedPhases[idx].successCriteria = e.target.value;
              setPhases(updatedPhases);
            }}
            placeholder="e.g., Students have identified 3 potential solutions to explore"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none
                     resize-none"
            rows={2}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {!editingPhaseId && currentPhaseIndex > 0 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentPhaseIndex(currentPhaseIndex - 1)}
            >
              Previous Phase
            </Button>
          )}

          {editingPhaseId && (
            <Button
              variant="secondary"
              onClick={() => {
                if (markPhaseComplete(phases.findIndex(p => p.id === editingPhaseId))) {
                  setEditingPhaseId(null);
                }
              }}
            >
              Save & Close
            </Button>
          )}
          
          <div className="ml-auto flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                const idx = editingPhaseId 
                  ? phases.findIndex(p => p.id === editingPhaseId)
                  : currentPhaseIndex;
                  
                if (markPhaseComplete(idx)) {
                  if (!editingPhaseId) {
                    if (currentPhaseIndex < phases.length - 1) {
                      setCurrentPhaseIndex(currentPhaseIndex + 1);
                    } else {
                      setCurrentStep('agency');
                    }
                  } else {
                    setEditingPhaseId(null);
                  }
                }
              }}
            >
              {editingPhaseId 
                ? 'Complete Phase' 
                : currentPhaseIndex < phases.length - 1 
                ? 'Next Phase'
                : 'Continue to Student Agency'}
            </Button>
          </div>
        </div>

        {/* Phase progress indicator */}
        {!editingPhaseId && (
          <div className="flex justify-center gap-2">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentPhaseIndex
                    ? 'bg-primary-500'
                    : phase.isComplete
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Render agency step
  const renderAgencyStep = () => {
    const isHigherGrade = wizardData.gradeLevel?.toLowerCase().includes('high') || 
                        wizardData.gradeLevel?.toLowerCase().includes('university');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Student Voice & Choice
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isHigherGrade 
              ? "Let's identify where students can drive their own learning."
              : "Where can students make choices in their learning journey?"}
          </p>
        </div>

        {/* Agency options */}
        <div className="space-y-3">
          {[
            { id: 'topic', label: 'Topic Selection', description: 'Students choose their specific focus within the theme' },
            { id: 'method', label: 'Research Method', description: 'Students decide how to investigate' },
            { id: 'product', label: 'Final Product', description: 'Students choose how to present their learning' },
            { id: 'audience', label: 'Target Audience', description: 'Students select who they want to impact' },
            { id: 'assessment', label: 'Assessment Criteria', description: 'Students help define success metrics' },
            { id: 'timeline', label: 'Pacing', description: 'Students manage their own timeline within boundaries' }
          ].map(option => (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg 
                       border border-gray-200 dark:border-gray-700 cursor-pointer
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={studentAgency.includes(option.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setStudentAgency([...studentAgency, option.id]);
                  } else {
                    setStudentAgency(studentAgency.filter(id => id !== option.id));
                  }
                }}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep('phases')}
          >
            Back to Phases
          </Button>
          <Button
            onClick={() => setCurrentStep('resources')}
          >
            Continue to Resources
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render resources step
  const renderResourcesStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Resources & Support (Optional)
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          What materials, tools, or support will help students succeed?
        </p>
      </div>

      {/* Current resources */}
      {resources.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
          {resources.map((resource, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300 flex-1">{resource}</span>
              <button
                onClick={() => {
                  setResources(resources.filter((_, i) => i !== idx));
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add resource input */}
      <div className="space-y-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              setResources([...resources, inputValue.trim()]);
              setInputValue('');
            }
          }}
          placeholder="e.g., Chromebooks for research"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
        />

        {/* Resource suggestions */}
        <div className="flex flex-wrap gap-2">
          {getResourceSuggestions().slice(0, 4).map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setResources([...resources, suggestion]);
              }}
              className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 
                       dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep('agency')}
        >
          Back to Student Agency
        </Button>
        <Button
          onClick={() => setCurrentStep('review')}
        >
          Review Journey
        </Button>
      </div>
    </motion.div>
  );

  // Render review step
  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Learning Journey is Ready!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Here's the complete journey for: <strong>{ideationData.challenge}</strong>
        </p>
      </div>

      {/* Journey summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Journey Overview
        </h4>
        
        {/* Timeline */}
        <div className="relative mb-6">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className={`relative flex ${isMobile ? 'flex-col gap-4' : 'justify-between'}`}>
            {phases.map((phase, idx) => (
              <div key={phase.id} className={`flex ${isMobile ? 'items-start gap-3' : 'flex-col items-center'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 flex-shrink-0
                  ${idx === 0 ? 'bg-primary-500 text-white' 
                  : idx === phases.length - 1 ? 'bg-green-500 text-white'
                  : 'bg-amber-500 text-white'}`}>
                  {idx + 1}
                </div>
                <div className={isMobile ? 'flex-1' : 'text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[100px]'}>
                  <p className="font-medium">{phase.name}</p>
                  <p className="text-xs text-gray-500">{phase.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase details */}
        <div className="space-y-4">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="border-l-4 border-primary-200 dark:border-blue-800 pl-4">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  Phase {idx + 1}: {phase.name}
                </h5>
                <button
                  onClick={() => startEditingPhase(phase.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {phase.goal}
              </p>
              <div className="text-sm">
                <span className="font-medium">Activities: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {phase.activities.join(', ')}
                </span>
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">Success: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {phase.successCriteria}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Student agency */}
        {studentAgency.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
              Student Choice Points:
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {studentAgency.map(id => {
                const labels: Record<string, string> = {
                  topic: 'Topic selection',
                  method: 'Research method',
                  product: 'Final product format',
                  audience: 'Target audience',
                  assessment: 'Assessment criteria',
                  timeline: 'Pacing flexibility'
                };
                return labels[id];
              }).join(', ')}
            </p>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
              Resources & Support:
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {resources.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep('phases')}
          className="flex-1"
        >
          Edit Journey
        </Button>
        <Button
          onClick={() => {
            const journeyData = {
              timeline,
              phases,
              studentAgency,
              resources
            };
            onComplete(journeyData);
          }}
          className="flex-1"
        >
          Complete Journey
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className={`max-w-${isMobile ? 'full' : '3xl'} mx-auto p-${isMobile ? '4' : '6'}`}>
      {/* Save status indicator */}
      {renderSaveStatus()}
      
      {/* Help modal */}
      {renderHelpModal()}
      
      {/* Mobile navigation */}
      {renderMobileNav()}
      
      {/* Progress header for desktop */}
      {!isMobile && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Learning Journey</span>
            <ChevronRight className="w-4 h-4" />
            <span className="capitalize">{currentStep}</span>
          </div>
          
          {/* Step progress */}
          <div className="flex gap-1">
            {stepOrder.map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-primary-500'
                    : stepOrder.indexOf(step) < currentStepIndex
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile step menu */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 p-2"
          >
            {stepOrder.map((step, idx) => (
              <button
                key={step}
                onClick={() => {
                  setCurrentStep(step);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between ${
                  step === currentStep
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="capitalize">{step}</span>
                {idx < currentStepIndex && <Check className="w-4 h-4 text-green-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current step content */}
      {renderCurrentStep()}
    </div>
  );
};

export default LearningJourneyBuilderEnhanced;