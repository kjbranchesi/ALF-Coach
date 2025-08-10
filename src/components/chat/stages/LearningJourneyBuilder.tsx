/**
 * LearningJourneyBuilder.tsx - Complete redesign of Learning Journey
 * 
 * Walks teachers through building a coherent learning journey:
 * 1. Timeline & Milestones
 * 2. Phase-by-phase definition with activities
 * 3. Student agency points (optional)
 * 4. Resources (optional)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Target,
  Users,
  Package,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  BookOpen,
  FileText,
  Check,
  Edit2,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface Phase {
  id: string;
  name: string;
  duration: string;
  goal: string;
  activities: string[];
  successCriteria: string;
}

interface LearningJourneyBuilderProps {
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
  onComplete: (journeyData: any) => void;
  onStepComplete?: (step: string, data: any) => void;
}

type BuilderStep = 'timeline' | 'phases' | 'agency' | 'resources' | 'review';

export const LearningJourneyBuilder: React.FC<LearningJourneyBuilderProps> = ({
  wizardData,
  ideationData,
  onComplete,
  onStepComplete
}) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('timeline');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  // Journey data
  const [timeline, setTimeline] = useState({
    duration: wizardData.timeline || '4 weeks',
    milestones: [] as string[]
  });
  const [phases, setPhases] = useState<Phase[]>([]);
  const [studentAgency, setStudentAgency] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  
  // UI state
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);

  // Get duration in weeks
  const getDurationWeeks = () => {
    const match = timeline.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
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

  // Handle adding milestone
  const addMilestone = (milestone: string) => {
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
      successCriteria: ''
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
    const updatedPhases = [...phases];
    updatedPhases[currentPhaseIndex].activities.push(activity);
    setPhases(updatedPhases);
    setInputValue('');
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'timeline':
        return (
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
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {idx + 1}
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add milestone input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add a milestone (you need {3 - timeline.milestones.length} more):
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
                         focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
              />

              {/* Suggestion buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Templates
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Examples
                </Button>
              </div>

              {/* Suggestions panel */}
              {showSuggestions && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Suggested milestones for {timeline.duration}:
                  </p>
                  {getMilestoneSuggestions().map(suggestion => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        addMilestone(suggestion.text);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg 
                               hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {suggestion.text}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.description}
                      </div>
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

      case 'phases':
        const currentPhase = phases[currentPhaseIndex];
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Phase header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                          rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Phase {currentPhaseIndex + 1} of {phases.length}: {currentPhase.name}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPhase.duration}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Let's define what happens in this phase of the learning journey.
              </p>
            </div>

            {/* Phase goal */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What's the main goal of this phase?
              </label>
              <input
                type="text"
                value={currentPhase.goal}
                onChange={(e) => {
                  const updatedPhases = [...phases];
                  updatedPhases[currentPhaseIndex].goal = e.target.value;
                  setPhases(updatedPhases);
                }}
                placeholder="e.g., Students will understand the problem and begin exploring solutions"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
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
                      <span className="text-gray-700 dark:text-gray-300">{activity}</span>
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
                             focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                  />
                  
                  {/* Activity suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {getActivitySuggestions(currentPhase).slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => addActivityToPhase(suggestion)}
                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 
                                 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
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
              <input
                type="text"
                value={currentPhase.successCriteria}
                onChange={(e) => {
                  const updatedPhases = [...phases];
                  updatedPhases[currentPhaseIndex].successCriteria = e.target.value;
                  setPhases(updatedPhases);
                }}
                placeholder="e.g., Students have identified 3 potential solutions to explore"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              {currentPhaseIndex > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPhaseIndex(currentPhaseIndex - 1)}
                >
                  Previous Phase
                </Button>
              )}
              
              {currentPhaseIndex < phases.length - 1 ? (
                <Button
                  onClick={() => setCurrentPhaseIndex(currentPhaseIndex + 1)}
                  disabled={!currentPhase.goal || currentPhase.activities.length < 2}
                  className="ml-auto"
                >
                  Next Phase
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep('agency')}
                  disabled={!currentPhase.goal || currentPhase.activities.length < 2}
                  className="ml-auto"
                >
                  Continue to Student Agency
                </Button>
              )}
            </div>

            {/* Phase progress indicator */}
            <div className="flex justify-center gap-2">
              {phases.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentPhaseIndex
                      ? 'bg-blue-500'
                      : idx < currentPhaseIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        );

      case 'agency':
        // Student agency options (especially for higher grades)
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
                onClick={() => setCurrentStep('review')}
              >
                Review Journey
              </Button>
            </div>
          </motion.div>
        );

      case 'review':
        // Final review and confirmation
        return (
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
                <div className="relative flex justify-between">
                  {phases.map((phase, idx) => (
                    <div key={phase.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10
                        ${idx === 0 ? 'bg-blue-500 text-white' 
                        : idx === phases.length - 1 ? 'bg-green-500 text-white'
                        : 'bg-amber-500 text-white'}`}>
                        {idx + 1}
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[100px]">
                        {phase.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase details */}
              <div className="space-y-4">
                {phases.map((phase, idx) => (
                  <div key={phase.id} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        Phase {idx + 1}: {phase.name}
                      </h5>
                      <span className="text-sm text-gray-500">{phase.duration}</span>
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
                  </div>
                ))}
              </div>

              {/* Student agency */}
              {studentAgency.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Student Choice Points:
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
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

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Learning Journey</span>
          <ChevronRight className="w-4 h-4" />
          <span className="capitalize">{currentStep}</span>
        </div>
        
        {/* Step progress */}
        <div className="flex gap-1">
          {['timeline', 'phases', 'agency', 'review'].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all ${
                step === currentStep
                  ? 'bg-blue-500'
                  : ['timeline', 'phases', 'agency', 'review'].indexOf(step) < 
                    ['timeline', 'phases', 'agency', 'review'].indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current step content */}
      {renderCurrentStep()}
    </div>
  );
};

export default LearningJourneyBuilder;