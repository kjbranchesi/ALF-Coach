/**
 * CreativeProcessJourney.tsx
 * 
 * Core implementation of the 4-phase Creative Process Learning Journey
 * Replaces the simplified 3-question approach with the proper ALF Framework structure
 * 
 * PHASES:
 * 1. ANALYZE (25%) - Understanding the problem
 * 2. BRAINSTORM (25%) - Generating solutions
 * 3. PROTOTYPE (35%) - Building and testing
 * 4. EVALUATE (15%) - Refining and presenting
 * 
 * KEY FEATURES:
 * - Fixed 4-phase structure with proportional timing
 * - Built-in iteration support (loop-back capability)
 * - Visual timeline with phase distribution
 * - Grade-level appropriate scaffolding
 * - Assessment integration per phase
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Lightbulb, 
  Hammer, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  RotateCcw,
  Clock,
  Target,
  Users,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

// Types for the Creative Process phases
export type PhaseType = 'ANALYZE' | 'BRAINSTORM' | 'PROTOTYPE' | 'EVALUATE';

export interface PhaseObjective {
  id: string;
  text: string;
  required: boolean;
}

export interface PhaseActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  resources: string[];
  studentChoice?: boolean;
}

export interface PhaseDeliverable {
  id: string;
  name: string;
  format: string;
  assessmentCriteria: string[];
}

export interface IterationSupport {
  triggers: string[];
  resources: string[];
  timeBuffer: number; // percentage of phase time for iteration
  strategies: string[];
}

export interface PhaseAssessment {
  formative: string[];
  summative: string;
  rubricCriteria: string[];
}

export interface CreativePhase {
  type: PhaseType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  allocation: number; // percentage of total time
  duration?: string; // calculated based on total project duration
  objectives: PhaseObjective[];
  activities: PhaseActivity[];
  deliverables: PhaseDeliverable[];
  iterationSupport: IterationSupport;
  assessment: PhaseAssessment;
  studentAgency: string[];
  completed: boolean;
}

export interface CreativeProcessJourneyData {
  projectDuration: number; // in weeks
  gradeLevel: 'elementary' | 'middle' | 'high';
  subject: string;
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  phases: CreativePhase[];
  currentPhase: number;
  iterationHistory: IterationEvent[];
  allowIteration: boolean;
}

export interface IterationEvent {
  id: string;
  fromPhase: PhaseType;
  toPhase: PhaseType;
  reason: string;
  timestamp: Date;
  duration: number;
}

interface CreativeProcessJourneyProps {
  initialData?: Partial<CreativeProcessJourneyData>;
  onComplete: (data: CreativeProcessJourneyData) => void;
  onSave?: (data: CreativeProcessJourneyData) => void;
  capturedData?: any; // Data from previous stages (wizard, ideation)
}

// Default phase templates
const DEFAULT_PHASES: Omit<CreativePhase, 'duration' | 'objectives' | 'activities' | 'deliverables'>[] = [
  {
    type: 'ANALYZE',
    name: 'Analyze',
    description: 'Understanding the problem deeply through research and investigation',
    icon: Search,
    color: 'blue',
    allocation: 0.25,
    iterationSupport: {
      triggers: [
        'Discovering new information that changes understanding',
        'Realizing initial problem definition was incomplete',
        'Finding gaps in research'
      ],
      resources: [
        'Research guides and templates',
        'Expert consultation sessions',
        'Additional data sources'
      ],
      timeBuffer: 20,
      strategies: [
        'Quick research sprints',
        'Peer knowledge sharing',
        'Expert interviews'
      ]
    },
    assessment: {
      formative: [
        'Research progress checks',
        'Problem definition drafts',
        'Peer feedback on understanding'
      ],
      summative: 'Comprehensive problem analysis document',
      rubricCriteria: [
        'Depth of research',
        'Multiple perspectives considered',
        'Clear problem identification',
        'Evidence-based conclusions'
      ]
    },
    studentAgency: [
      'Choice of research methods',
      'Selection of focus areas',
      'Documentation format'
    ],
    completed: false
  },
  {
    type: 'BRAINSTORM',
    name: 'Brainstorm',
    description: 'Generating creative solutions and exploring possibilities',
    icon: Lightbulb,
    color: 'yellow',
    allocation: 0.25,
    iterationSupport: {
      triggers: [
        'Ideas not feasible with available resources',
        'New insights from prototype testing',
        'Feedback suggesting different approaches'
      ],
      resources: [
        'Ideation frameworks and tools',
        'Creative thinking exercises',
        'Inspiration examples'
      ],
      timeBuffer: 15,
      strategies: [
        'Rapid ideation sessions',
        'Cross-pollination workshops',
        'Solution pivoting protocols'
      ]
    },
    assessment: {
      formative: [
        'Idea generation quantity',
        'Solution diversity assessment',
        'Feasibility quick checks'
      ],
      summative: 'Solution portfolio with rationale',
      rubricCriteria: [
        'Creativity and originality',
        'Range of solutions',
        'Connection to problem',
        'Feasibility consideration'
      ]
    },
    studentAgency: [
      'Ideation techniques used',
      'Solution selection criteria',
      'Collaboration methods'
    ],
    completed: false
  },
  {
    type: 'PROTOTYPE',
    name: 'Prototype',
    description: 'Building, testing, and refining solutions through iteration',
    icon: Hammer,
    color: 'purple',
    allocation: 0.35,
    iterationSupport: {
      triggers: [
        'Prototype failure or unexpected results',
        'User feedback requiring changes',
        'Technical challenges discovered'
      ],
      resources: [
        'Prototyping materials and tools',
        'Testing protocols',
        'Iteration planning templates'
      ],
      timeBuffer: 30,
      strategies: [
        'Rapid prototyping cycles',
        'A/B testing approaches',
        'Fail-fast methodologies'
      ]
    },
    assessment: {
      formative: [
        'Prototype iterations documented',
        'Testing data collection',
        'Reflection on failures'
      ],
      summative: 'Working prototype with documentation',
      rubricCriteria: [
        'Functionality of solution',
        'Iteration and improvement',
        'Testing thoroughness',
        'Problem-solution fit'
      ]
    },
    studentAgency: [
      'Prototyping methods',
      'Testing approaches',
      'Iteration decisions'
    ],
    completed: false
  },
  {
    type: 'EVALUATE',
    name: 'Evaluate',
    description: 'Reflecting, refining, and presenting the final solution',
    icon: CheckCircle,
    color: 'green',
    allocation: 0.15,
    iterationSupport: {
      triggers: [
        'Final testing reveals issues',
        'Presentation feedback suggests improvements',
        'Self-reflection identifies gaps'
      ],
      resources: [
        'Presentation templates',
        'Reflection frameworks',
        'Peer review protocols'
      ],
      timeBuffer: 10,
      strategies: [
        'Final polish sprints',
        'Peer review sessions',
        'Presentation practice'
      ]
    },
    assessment: {
      formative: [
        'Presentation drafts',
        'Peer feedback sessions',
        'Self-assessment reflections'
      ],
      summative: 'Final presentation and reflection portfolio',
      rubricCriteria: [
        'Solution effectiveness',
        'Communication clarity',
        'Reflection depth',
        'Learning demonstration'
      ]
    },
    studentAgency: [
      'Presentation format',
      'Audience selection',
      'Reflection focus'
    ],
    completed: false
  }
];

// Grade-level specific examples and scaffolding
const getGradeLevelExamples = (gradeLevel: string, phaseType: PhaseType) => {
  const examples = {
    elementary: {
      ANALYZE: {
        objectives: [
          'Understand what makes our playground safe or unsafe',
          'Learn what other schools do for playground safety',
          'Talk to students and teachers about playground problems'
        ],
        activities: [
          { name: 'Playground Investigation', duration: '2 class periods', description: 'Walk around and document safety issues with drawings and photos' },
          { name: 'Story Time Research', duration: '1 class period', description: 'Read books about playground design and safety' },
          { name: 'Interview Friends', duration: '1 class period', description: 'Ask classmates about their playground experiences' }
        ]
      },
      BRAINSTORM: {
        objectives: [
          'Think of many different ways to make the playground better',
          'Draw or build models of playground improvements',
          'Share ideas with classmates and get feedback'
        ],
        activities: [
          { name: 'Idea Storm', duration: '1 class period', description: 'Draw as many playground ideas as possible' },
          { name: 'Build with Blocks', duration: '2 class periods', description: 'Create playground models with building materials' },
          { name: 'Gallery Walk', duration: '1 class period', description: 'Share ideas and get sticker votes from classmates' }
        ]
      },
      PROTOTYPE: {
        objectives: [
          'Build a model or drawing of our best playground idea',
          'Test if our idea would really work',
          'Make improvements based on feedback'
        ],
        activities: [
          { name: 'Build Our Model', duration: '3 class periods', description: 'Create detailed model with craft materials' },
          { name: 'Test It Out', duration: '1 class period', description: 'Use toy figures to test if playground works' },
          { name: 'Make It Better', duration: '2 class periods', description: 'Improve model based on testing' }
        ]
      },
      EVALUATE: {
        objectives: [
          'Show our playground design to others',
          'Explain why our design is good',
          'Think about what we learned'
        ],
        activities: [
          { name: 'Practice Presenting', duration: '1 class period', description: 'Practice explaining our design to partners' },
          { name: 'Big Presentation', duration: '1 class period', description: 'Present to principal and parents' },
          { name: 'Learning Reflection', duration: '1 class period', description: 'Draw or write about what we learned' }
        ]
      }
    },
    middle: {
      ANALYZE: {
        objectives: [
          'Research the environmental impact of school lunch waste',
          'Analyze current waste management practices',
          'Identify key stakeholders and their perspectives'
        ],
        activities: [
          { name: 'Waste Audit', duration: '1 week', description: 'Measure and categorize cafeteria waste daily' },
          { name: 'Stakeholder Interviews', duration: '3 days', description: 'Interview cafeteria staff, students, and administrators' },
          { name: 'Comparative Research', duration: '2 days', description: 'Research other schools sustainable lunch programs' }
        ]
      },
      BRAINSTORM: {
        objectives: [
          'Generate diverse solutions for reducing lunch waste',
          'Evaluate feasibility of different approaches',
          'Select most promising solutions for prototyping'
        ],
        activities: [
          { name: 'Design Thinking Workshop', duration: '2 class periods', description: 'Use design thinking to generate solutions' },
          { name: 'Solution Mapping', duration: '1 class period', description: 'Create visual maps connecting solutions to problems' },
          { name: 'Feasibility Analysis', duration: '2 class periods', description: 'Evaluate solutions for cost, impact, and practicality' }
        ]
      },
      PROTOTYPE: {
        objectives: [
          'Create working prototypes of waste reduction solutions',
          'Test prototypes in real cafeteria conditions',
          'Iterate based on testing results and feedback'
        ],
        activities: [
          { name: 'Prototype Development', duration: '1 week', description: 'Build composting system, reusable container program, or waste tracking app' },
          { name: 'Pilot Testing', duration: '3 days', description: 'Test prototypes during lunch periods' },
          { name: 'Iteration Cycles', duration: '4 days', description: 'Refine based on test results and user feedback' }
        ]
      },
      EVALUATE: {
        objectives: [
          'Measure impact of implemented solutions',
          'Present findings to school community',
          'Reflect on learning and process'
        ],
        activities: [
          { name: 'Impact Assessment', duration: '2 days', description: 'Measure waste reduction achieved' },
          { name: 'Community Presentation', duration: '1 class period', description: 'Present to school board and parents' },
          { name: 'Reflection Portfolio', duration: '2 days', description: 'Create portfolio documenting journey and learning' }
        ]
      }
    },
    high: {
      ANALYZE: {
        objectives: [
          'Conduct systematic literature review on urban food deserts',
          'Analyze local food access data using GIS mapping',
          'Identify root causes through systems thinking'
        ],
        activities: [
          { name: 'Academic Research', duration: '1.5 weeks', description: 'Review peer-reviewed articles and government reports' },
          { name: 'Data Analysis', duration: '1 week', description: 'Use GIS tools to map food access in community' },
          { name: 'Community Ethnography', duration: '1 week', description: 'Conduct field observations and resident interviews' }
        ]
      },
      BRAINSTORM: {
        objectives: [
          'Develop innovative solutions using entrepreneurial thinking',
          'Create business models for sustainable implementation',
          'Build stakeholder coalition for support'
        ],
        activities: [
          { name: 'Innovation Sprint', duration: '3 days', description: 'Generate solutions using various innovation frameworks' },
          { name: 'Business Model Canvas', duration: '2 days', description: 'Develop sustainable business models for solutions' },
          { name: 'Stakeholder Engagement', duration: '1 week', description: 'Present ideas to community partners for feedback' }
        ]
      },
      PROTOTYPE: {
        objectives: [
          'Develop minimum viable product for chosen solution',
          'Conduct user testing with target population',
          'Iterate based on data and feedback'
        ],
        activities: [
          { name: 'MVP Development', duration: '2 weeks', description: 'Build mobile app, pop-up market, or delivery system prototype' },
          { name: 'User Testing', duration: '1 week', description: 'Conduct structured testing with community members' },
          { name: 'Data-Driven Iteration', duration: '1 week', description: 'Analyze metrics and refine solution' }
        ]
      },
      EVALUATE: {
        objectives: [
          'Measure social impact using established metrics',
          'Present to potential funders and partners',
          'Create implementation roadmap'
        ],
        activities: [
          { name: 'Impact Measurement', duration: '3 days', description: 'Calculate social return on investment (SROI)' },
          { name: 'Pitch Presentation', duration: '2 days', description: 'Present to city council and potential investors' },
          { name: 'Strategic Planning', duration: '2 days', description: 'Create detailed implementation plan for scaling' }
        ]
      }
    }
  };

  const level = gradeLevel.toLowerCase().includes('elementary') ? 'elementary' :
                gradeLevel.toLowerCase().includes('middle') ? 'middle' : 'high';
  
  return examples[level][phaseType];
};

// Main Component
export const CreativeProcessJourney: React.FC<CreativeProcessJourneyProps> = ({
  initialData,
  onComplete,
  onSave,
  capturedData
}) => {
  // Extract data from previous stages
  const projectDuration = capturedData?.wizard?.timeline?.duration || 4;
  const gradeLevel = capturedData?.wizard?.students?.gradeLevel || 'middle';
  const subject = capturedData?.wizard?.subject?.area || '';
  const bigIdea = capturedData?.ideation?.bigIdea || '';
  const essentialQuestion = capturedData?.ideation?.essentialQuestion || '';
  const challenge = capturedData?.ideation?.challenge || '';

  // Initialize journey data with calculated phase durations
  const initializePhases = useCallback(() => {
    return DEFAULT_PHASES.map(phase => ({
      ...phase,
      duration: `${Math.round(projectDuration * phase.allocation)} week${Math.round(projectDuration * phase.allocation) !== 1 ? 's' : ''}`,
      objectives: [],
      activities: [],
      deliverables: []
    })) as CreativePhase[];
  }, [projectDuration]);

  const [journeyData, setJourneyData] = useState<CreativeProcessJourneyData>({
    projectDuration,
    gradeLevel: gradeLevel.toLowerCase().includes('elementary') ? 'elementary' :
                gradeLevel.toLowerCase().includes('middle') ? 'middle' : 'high',
    subject,
    bigIdea,
    essentialQuestion,
    challenge,
    phases: initialData?.phases || initializePhases(),
    currentPhase: initialData?.currentPhase || 0,
    iterationHistory: initialData?.iterationHistory || [],
    allowIteration: initialData?.allowIteration !== undefined ? initialData.allowIteration : true,
    ...initialData
  });

  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [showIterationDialog, setShowIterationDialog] = useState(false);
  const [iterationTarget, setIterationTarget] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Auto-save functionality
  useEffect(() => {
    if (onSave && autoSaveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        setAutoSaveStatus('saving');
        onSave(journeyData);
        setTimeout(() => setAutoSaveStatus('saved'), 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [journeyData, onSave, autoSaveStatus]);

  // Mark data as unsaved when changed
  const updateJourneyData = useCallback((updates: Partial<CreativeProcessJourneyData>) => {
    setJourneyData(prev => ({ ...prev, ...updates }));
    setAutoSaveStatus('unsaved');
  }, []);

  // Handle phase navigation
  const navigateToPhase = (phaseIndex: number) => {
    if (phaseIndex === journeyData.currentPhase) {return;}
    
    if (journeyData.allowIteration || phaseIndex > journeyData.currentPhase) {
      if (phaseIndex < journeyData.currentPhase) {
        // Going back - this is iteration
        setIterationTarget(phaseIndex);
        setShowIterationDialog(true);
      } else {
        // Moving forward
        updateJourneyData({ currentPhase: phaseIndex });
        setExpandedPhase(phaseIndex);
      }
    }
  };

  // Handle iteration confirmation
  const confirmIteration = (reason: string) => {
    if (iterationTarget !== null) {
      const iterationEvent: IterationEvent = {
        id: Date.now().toString(),
        fromPhase: journeyData.phases[journeyData.currentPhase].type,
        toPhase: journeyData.phases[iterationTarget].type,
        reason,
        timestamp: new Date(),
        duration: 0 // Will be calculated when they move forward again
      };
      
      updateJourneyData({
        currentPhase: iterationTarget,
        iterationHistory: [...journeyData.iterationHistory, iterationEvent]
      });
      
      setExpandedPhase(iterationTarget);
      setShowIterationDialog(false);
      setIterationTarget(null);
    }
  };

  // Update phase data
  const updatePhase = (phaseIndex: number, updates: Partial<CreativePhase>) => {
    const newPhases = [...journeyData.phases];
    newPhases[phaseIndex] = { ...newPhases[phaseIndex], ...updates };
    updateJourneyData({ phases: newPhases });
  };

  // Add objective to phase
  const addObjective = (phaseIndex: number, objective: string) => {
    const newObjective: PhaseObjective = {
      id: Date.now().toString(),
      text: objective,
      required: true
    };
    const phase = journeyData.phases[phaseIndex];
    updatePhase(phaseIndex, {
      objectives: [...phase.objectives, newObjective]
    });
  };

  // Add activity to phase
  const addActivity = (phaseIndex: number, activity: Partial<PhaseActivity>) => {
    const newActivity: PhaseActivity = {
      id: Date.now().toString(),
      name: activity.name || '',
      description: activity.description || '',
      duration: activity.duration || '',
      resources: activity.resources || [],
      studentChoice: activity.studentChoice || false
    };
    const phase = journeyData.phases[phaseIndex];
    updatePhase(phaseIndex, {
      activities: [...phase.activities, newActivity]
    });
  };

  // Add deliverable to phase
  const addDeliverable = (phaseIndex: number, deliverable: Partial<PhaseDeliverable>) => {
    const newDeliverable: PhaseDeliverable = {
      id: Date.now().toString(),
      name: deliverable.name || '',
      format: deliverable.format || '',
      assessmentCriteria: deliverable.assessmentCriteria || []
    };
    const phase = journeyData.phases[phaseIndex];
    updatePhase(phaseIndex, {
      deliverables: [...phase.deliverables, newDeliverable]
    });
  };

  // Check if phase is complete
  const isPhaseComplete = (phase: CreativePhase) => {
    return phase.objectives.length >= 2 && 
           phase.activities.length >= 2 && 
           phase.deliverables.length >= 1;
  };

  // Check if journey is complete
  const isJourneyComplete = () => {
    return journeyData.phases.every(phase => isPhaseComplete(phase));
  };

  return (
    <div className="creative-process-journey">
      {/* Header with Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Creative Process Learning Journey</h2>
            <p className="text-gray-600 mt-1">
              Design a {projectDuration}-week journey through the 4 phases of creative problem-solving
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle help"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{projectDuration} weeks total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                autoSaveStatus === 'saved' ? 'bg-green-500' :
                autoSaveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600">
                {autoSaveStatus === 'saved' ? 'Saved' :
                 autoSaveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {journeyData.phases.map((phase, index) => (
              <div
                key={phase.type}
                className="flex-1 relative"
                style={{ flex: phase.allocation }}
              >
                {/* Phase Connection Line */}
                {index < journeyData.phases.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-300" />
                )}
                
                {/* Phase Node */}
                <button
                  onClick={() => navigateToPhase(index)}
                  className={`relative z-10 flex flex-col items-center p-3 rounded-lg transition-all ${
                    index === journeyData.currentPhase
                      ? 'bg-primary-100 ring-2 ring-blue-500'
                      : isPhaseComplete(phase)
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <phase.icon className={`w-6 h-6 mb-1 ${
                    index === journeyData.currentPhase
                      ? 'text-primary-600'
                      : isPhaseComplete(phase)
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`} />
                  <span className="text-sm font-medium">{phase.name}</span>
                  <span className="text-xs text-gray-500">{phase.duration}</span>
                  {isPhaseComplete(phase) && (
                    <CheckCircle className="w-4 h-4 text-green-600 absolute -top-1 -right-1" />
                  )}
                </button>

                {/* Iteration Indicator */}
                {journeyData.iterationHistory.some(event => 
                  event.fromPhase === phase.type || event.toPhase === phase.type
                ) && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <RotateCcw className="w-4 h-4 text-primary-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Iteration Path Indicators */}
          {journeyData.allowIteration && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>Iteration enabled - students can loop back to earlier phases</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-200"
          >
            <h3 className="font-semibold text-primary-900 mb-2">Understanding the Creative Process</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-primary-800">
              <div>
                <strong>Why 4 Phases?</strong>
                <p>The Creative Process mirrors how professionals solve problems in the real world. Each phase builds on the previous one, but iteration is natural and expected.</p>
              </div>
              <div>
                <strong>Time Allocations:</strong>
                <ul className="mt-1">
                  <li>• Analyze (25%): Deep understanding takes time</li>
                  <li>• Brainstorm (25%): Generating quality ideas needs space</li>
                  <li>• Prototype (35%): Building and testing is the core work</li>
                  <li>• Evaluate (15%): Reflection and presentation wrap up</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase Builder Panels */}
      <div className="space-y-4">
        {journeyData.phases.map((phase, index) => {
          const examples = getGradeLevelExamples(journeyData.gradeLevel, phase.type);
          const isExpanded = expandedPhase === index;
          const isComplete = isPhaseComplete(phase);
          const isCurrent = index === journeyData.currentPhase;

          return (
            <motion.div
              key={phase.type}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                isCurrent ? 'border-primary-500' : 
                isComplete ? 'border-green-500' : 
                'border-gray-200'
              }`}
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : index)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${phase.color}-100`}>
                      <phase.icon className={`w-6 h-6 text-${phase.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Phase {index + 1}: {phase.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Duration: {phase.duration}
                        </span>
                        {isComplete && (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Complete
                          </span>
                        )}
                        {isCurrent && !isComplete && (
                          <span className="text-sm text-primary-600 font-medium">
                            Current Phase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {journeyData.iterationHistory.filter(event => 
                      event.toPhase === phase.type
                    ).length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 rounded-full">
                        <RotateCcw className="w-3 h-3 text-primary-600" />
                        <span className="text-xs text-primary-600">
                          {journeyData.iterationHistory.filter(event => 
                            event.toPhase === phase.type
                          ).length} iterations
                        </span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Phase Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Learning Objectives */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h4>
                        <div className="space-y-2">
                          {phase.objectives.map((objective) => (
                            <div key={objective.id} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              <span className="text-sm text-gray-700">{objective.text}</span>
                            </div>
                          ))}
                          {phase.objectives.length === 0 && examples && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-2">
                                Example objectives for {journeyData.gradeLevel} level:
                              </p>
                              <ul className="space-y-1">
                                {examples.objectives.map((obj, i) => (
                                  <li key={i} className="text-sm text-gray-700">
                                    • {obj}
                                  </li>
                                ))}
                              </ul>
                              <button
                                onClick={() => {
                                  examples.objectives.forEach(obj => addObjective(index, obj));
                                }}
                                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Use these examples
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const objective = prompt('Enter a learning objective:');
                              if (objective) {addObjective(index, objective);}
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            + Add objective
                          </button>
                        </div>
                      </div>

                      {/* Key Activities */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Key Activities
                        </h4>
                        <div className="space-y-3">
                          {phase.activities.map((activity) => (
                            <div key={activity.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">{activity.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-500">
                                      Duration: {activity.duration}
                                    </span>
                                    {activity.studentChoice && (
                                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                        Student choice
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {phase.activities.length === 0 && examples && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-2">
                                Example activities for {journeyData.gradeLevel} level:
                              </p>
                              <div className="space-y-2">
                                {examples.activities.map((activity, i) => (
                                  <div key={i} className="text-sm">
                                    <strong>{activity.name}</strong> ({activity.duration})
                                    <p className="text-gray-600">{activity.description}</p>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  examples.activities.forEach(activity => addActivity(index, activity));
                                }}
                                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Use these examples
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const name = prompt('Activity name:');
                              const description = prompt('Activity description:');
                              const duration = prompt('Duration (e.g., "2 class periods"):');
                              if (name && description && duration) {
                                addActivity(index, { name, description, duration });
                              }
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            + Add activity
                          </button>
                        </div>
                      </div>

                      {/* Phase Deliverables */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Phase Deliverables
                        </h4>
                        <div className="space-y-2">
                          {phase.deliverables.map((deliverable) => (
                            <div key={deliverable.id} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  {deliverable.name}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({deliverable.format})
                                </span>
                              </div>
                            </div>
                          ))}
                          {phase.deliverables.length === 0 && (
                            <p className="text-sm text-gray-500">
                              Add deliverables that students will produce in this phase
                            </p>
                          )}
                          <button
                            onClick={() => {
                              const name = prompt('Deliverable name:');
                              const format = prompt('Format (e.g., "presentation", "report", "model"):');
                              if (name && format) {
                                addDeliverable(index, { name, format });
                              }
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            + Add deliverable
                          </button>
                        </div>
                      </div>

                      {/* Iteration Support */}
                      <div className="bg-primary-50 rounded-lg p-4">
                        <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Iteration Support
                        </h4>
                        <div className="text-sm text-primary-800 space-y-2">
                          <div>
                            <strong>When students might need to iterate:</strong>
                            <ul className="mt-1 ml-4">
                              {phase.iterationSupport.triggers.map((trigger, i) => (
                                <li key={i}>• {trigger}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Support strategies:</strong>
                            <ul className="mt-1 ml-4">
                              {phase.iterationSupport.strategies.map((strategy, i) => (
                                <li key={i}>• {strategy}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Time buffer:</strong> {phase.iterationSupport.timeBuffer}% of phase time reserved for iteration
                          </div>
                        </div>
                      </div>

                      {/* Student Agency */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Student Agency & Choice
                        </h4>
                        <div className="text-sm text-green-800">
                          <p className="mb-2">Areas where students have control:</p>
                          <ul className="ml-4">
                            {phase.studentAgency.map((choice, i) => (
                              <li key={i}>• {choice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Iteration Dialog */}
      <AnimatePresence>
        {showIterationDialog && iterationTarget !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Document Your Iteration</h3>
              <p className="text-gray-600 mb-4">
                You're moving back to the {journeyData.phases[iterationTarget].name} phase. 
                This is a normal part of the creative process! Please describe why you're iterating:
              </p>
              <textarea
                className="w-full p-3 border rounded-lg h-24 text-sm"
                placeholder="e.g., 'New research revealed we need to reconsider our approach...'"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    confirmIteration((e.target as HTMLTextAreaElement).value);
                  }
                }}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowIterationDialog(false);
                    setIterationTarget(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea) {confirmIteration(textarea.value);}
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Confirm Iteration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {journeyData.iterationHistory.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 rounded-full">
                <RotateCcw className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-600">
                  {journeyData.iterationHistory.length} iteration{journeyData.iterationHistory.length !== 1 ? 's' : ''} documented
                </span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              {journeyData.phases.filter(p => isPhaseComplete(p)).length} of {journeyData.phases.length} phases complete
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const prevPhase = journeyData.currentPhase - 1;
                if (prevPhase >= 0) {navigateToPhase(prevPhase);}
              }}
              disabled={journeyData.currentPhase === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isJourneyComplete()) {
                  onComplete(journeyData);
                } else {
                  const nextIncomplete = journeyData.phases.findIndex((p, i) => 
                    i > journeyData.currentPhase && !isPhaseComplete(p)
                  );
                  if (nextIncomplete !== -1) {
                    navigateToPhase(nextIncomplete);
                  } else {
                    // Find first incomplete phase
                    const firstIncomplete = journeyData.phases.findIndex(p => !isPhaseComplete(p));
                    if (firstIncomplete !== -1) {
                      navigateToPhase(firstIncomplete);
                    }
                  }
                }
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isJourneyComplete()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isJourneyComplete() ? 'Complete Journey' : 'Continue'}
            </button>
            <button
              onClick={() => {
                const nextPhase = journeyData.currentPhase + 1;
                if (nextPhase < journeyData.phases.length) {navigateToPhase(nextPhase);}
              }}
              disabled={journeyData.currentPhase === journeyData.phases.length - 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};