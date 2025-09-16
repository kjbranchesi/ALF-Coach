/**
 * AdaptiveLearning.tsx
 * 
 * Adaptive learning system with dynamic difficulty adjustment
 * Part of Sprint 6: Advanced Features and AI Integration
 * 
 * FEATURES:
 * - Dynamic difficulty adjustment based on performance
 * - Learning pathway optimization
 * - Personalized content delivery
 * - Multi-modal learning preferences
 * - Real-time adaptation algorithms
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  BookOpen,
  Headphones,
  Eye,
  Users,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Compass,
  Lightbulb,
  Award,
  Filter
} from 'lucide-react';
import {
  PhaseType,
  GradeLevel,
  CreativePhase,
  StudentProgress,
  IterationEvent
} from '../types';
import { Assessment } from './AssessmentCriteria';
import { LearningAnalytics } from './DataAnalytics';

export interface LearningProfile {
  studentId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  difficultyPreference: 'challenge_seeker' | 'steady_progress' | 'confidence_builder';
  pacePreference: 'fast' | 'moderate' | 'deliberate';
  collaborationStyle: 'independent' | 'small_group' | 'large_group' | 'varied';
  feedbackPreference: 'immediate' | 'checkpoint' | 'end_of_task';
  motivationalFactors: MotivationalFactor[];
  cognitiveLoad: number; // 0-100, current cognitive load
  flowState: FlowStateIndicator;
}

export interface MotivationalFactor {
  type: 'achievement' | 'curiosity' | 'collaboration' | 'creativity' | 'recognition' | 'mastery';
  strength: number; // 0-100
  triggers: string[];
}

export interface FlowStateIndicator {
  level: number; // 0-100
  factors: {
    challengeSkillBalance: number;
    clearGoals: number;
    immediateFeedback: number;
    concentration: number;
  };
  trends: number[]; // Historical flow levels
}

export interface AdaptiveContent {
  id: string;
  title: string;
  description: string;
  type: 'explanation' | 'example' | 'practice' | 'challenge' | 'reflection';
  modality: 'text' | 'visual' | 'audio' | 'interactive' | 'collaborative';
  difficulty: number; // 1-10
  estimatedTime: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  adaptationTriggers: AdaptationTrigger[];
  phaseAlignment: PhaseType[];
}

export interface AdaptationTrigger {
  condition: string; // e.g., "performance_below_70"
  action: string; // e.g., "reduce_difficulty"
  magnitude: number; // 0-1
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  content: AdaptiveContent[];
  branches: PathBranch[];
  currentPosition: number;
  completion: number;
  estimatedTime: number;
  difficultyProgression: number[]; // Difficulty at each step
}

export interface PathBranch {
  condition: string;
  targetPosition: number;
  reason: string;
}

interface AdaptiveLearningProps {
  student: {
    id: string;
    name: string;
    grade: string;
  };
  studentProgress: StudentProgress;
  assessments: Assessment[];
  iterations: IterationEvent[];
  analytics: LearningAnalytics;
  phases: CreativePhase[];
  currentPhase: number;
  gradeLevel: GradeLevel;
  onContentDelivery?: (content: AdaptiveContent) => void;
  onPathUpdate?: (path: LearningPath) => void;
  onProfileUpdate?: (profile: LearningProfile) => void;
  className?: string;
}

// Adaptive algorithms
const ADAPTATION_ALGORITHMS = {
  difficulty: {
    // Zone of Proximal Development-based adjustment
    zpd: (performance: number, currentDifficulty: number): number => {
      const targetZone = { min: 60, max: 80 }; // Sweet spot for learning
      
      if (performance < targetZone.min) {
        // Too difficult, reduce
        return Math.max(1, currentDifficulty - 0.5);
      } else if (performance > targetZone.max) {
        // Too easy, increase
        return Math.min(10, currentDifficulty + 0.3);
      }
      
      return currentDifficulty;
    },
    
    // Flow state optimization
    flow: (flowLevel: number, currentDifficulty: number): number => {
      const optimalFlow = 75;
      const difference = flowLevel - optimalFlow;
      
      if (Math.abs(difference) < 10) return currentDifficulty;
      
      // Adjust difficulty to optimize flow
      const adjustment = difference > 0 ? 0.2 : -0.2;
      return Math.max(1, Math.min(10, currentDifficulty + adjustment));
    }
  },
  
  pacing: {
    // Adaptive pacing based on cognitive load
    cognitiveLoad: (load: number, currentPace: number): number => {
      if (load > 80) return Math.max(0.5, currentPace * 0.8); // Slow down
      if (load < 40) return Math.min(2.0, currentPace * 1.2); // Speed up
      return currentPace;
    }
  },
  
  content: {
    // Multi-modal content selection
    modalityMatch: (learningStyle: string, availableContent: AdaptiveContent[]): AdaptiveContent[] => {
      const preferences: Record<string, string[]> = {
        visual: ['visual', 'interactive'],
        auditory: ['audio', 'collaborative'],
        kinesthetic: ['interactive', 'collaborative'],
        reading: ['text', 'visual'],
        mixed: ['interactive', 'visual', 'audio']
      };
      
      const preferred = preferences[learningStyle] || ['interactive'];
      return availableContent
        .filter(content => preferred.includes(content.modality))
        .sort((a, b) => {
          const aIndex = preferred.indexOf(a.modality);
          const bIndex = preferred.indexOf(b.modality);
          return aIndex - bIndex;
        });
    }
  }
};

// Content library organized by phase and difficulty
const ADAPTIVE_CONTENT_LIBRARY: Record<PhaseType, AdaptiveContent[]> = {
  ANALYZE: [
    {
      id: 'analyze-intro-easy',
      title: 'Understanding Problems',
      description: 'Learn to break down complex problems into smaller parts',
      type: 'explanation',
      modality: 'visual',
      difficulty: 2,
      estimatedTime: 10,
      prerequisites: [],
      learningObjectives: ['Identify problem components', 'Ask clarifying questions'],
      adaptationTriggers: [
        { condition: 'performance_below_60', action: 'add_scaffolding', magnitude: 0.8 }
      ],
      phaseAlignment: ['ANALYZE']
    },
    {
      id: 'analyze-research-medium',
      title: 'Research Strategies',
      description: 'Explore effective methods for gathering information',
      type: 'practice',
      modality: 'interactive',
      difficulty: 5,
      estimatedTime: 20,
      prerequisites: ['analyze-intro-easy'],
      learningObjectives: ['Apply research methods', 'Evaluate source credibility'],
      adaptationTriggers: [
        { condition: 'engagement_low', action: 'gamify', magnitude: 0.6 }
      ],
      phaseAlignment: ['ANALYZE']
    },
    {
      id: 'analyze-synthesis-hard',
      title: 'Information Synthesis',
      description: 'Combine multiple sources into coherent insights',
      type: 'challenge',
      modality: 'collaborative',
      difficulty: 8,
      estimatedTime: 30,
      prerequisites: ['analyze-research-medium'],
      learningObjectives: ['Synthesize information', 'Draw meaningful conclusions'],
      adaptationTriggers: [
        { condition: 'cognitive_load_high', action: 'break_into_chunks', magnitude: 0.7 }
      ],
      phaseAlignment: ['ANALYZE']
    }
  ],
  
  BRAINSTORM: [
    {
      id: 'brainstorm-divergent-easy',
      title: 'Idea Generation',
      description: 'Learn techniques for generating many creative ideas',
      type: 'practice',
      modality: 'interactive',
      difficulty: 3,
      estimatedTime: 15,
      prerequisites: [],
      learningObjectives: ['Generate multiple ideas', 'Suspend judgment'],
      adaptationTriggers: [
        { condition: 'creativity_low', action: 'add_prompts', magnitude: 0.8 }
      ],
      phaseAlignment: ['BRAINSTORM']
    },
    {
      id: 'brainstorm-build-medium',
      title: 'Building on Ideas',
      description: 'Develop and expand promising concepts',
      type: 'collaboration',
      modality: 'collaborative',
      difficulty: 5,
      estimatedTime: 25,
      prerequisites: ['brainstorm-divergent-easy'],
      learningObjectives: ['Build on others\' ideas', 'Make connections'],
      adaptationTriggers: [
        { condition: 'collaboration_struggling', action: 'provide_structure', magnitude: 0.6 }
      ],
      phaseAlignment: ['BRAINSTORM']
    }
  ],
  
  PROTOTYPE: [
    {
      id: 'prototype-plan-medium',
      title: 'Planning Your Prototype',
      description: 'Create a roadmap for building your solution',
      type: 'example',
      modality: 'visual',
      difficulty: 4,
      estimatedTime: 20,
      prerequisites: [],
      learningObjectives: ['Create implementation plans', 'Identify resources needed'],
      adaptationTriggers: [
        { condition: 'overwhelmed', action: 'simplify_scope', magnitude: 0.7 }
      ],
      phaseAlignment: ['PROTOTYPE']
    },
    {
      id: 'prototype-iterate-hard',
      title: 'Rapid Iteration',
      description: 'Learn to quickly test and improve your prototypes',
      type: 'challenge',
      modality: 'interactive',
      difficulty: 7,
      estimatedTime: 35,
      prerequisites: ['prototype-plan-medium'],
      learningObjectives: ['Test hypotheses', 'Iterate based on feedback'],
      adaptationTriggers: [
        { condition: 'perfectionism_high', action: 'emphasize_iteration', magnitude: 0.9 }
      ],
      phaseAlignment: ['PROTOTYPE']
    }
  ],
  
  EVALUATE: [
    {
      id: 'evaluate-criteria-easy',
      title: 'Setting Success Criteria',
      description: 'Define what makes a solution successful',
      type: 'explanation',
      modality: 'text',
      difficulty: 3,
      estimatedTime: 12,
      prerequisites: [],
      learningObjectives: ['Define success metrics', 'Consider stakeholder needs'],
      adaptationTriggers: [
        { condition: 'abstract_thinking_low', action: 'provide_examples', magnitude: 0.8 }
      ],
      phaseAlignment: ['EVALUATE']
    },
    {
      id: 'evaluate-reflect-medium',
      title: 'Reflective Analysis',
      description: 'Analyze your learning journey and outcomes',
      type: 'reflection',
      modality: 'audio',
      difficulty: 6,
      estimatedTime: 25,
      prerequisites: ['evaluate-criteria-easy'],
      learningObjectives: ['Reflect on process', 'Identify learning gains'],
      adaptationTriggers: [
        { condition: 'self_awareness_low', action: 'guided_questions', magnitude: 0.7 }
      ],
      phaseAlignment: ['EVALUATE']
    }
  ]
};

export const AdaptiveLearning: React.FC<AdaptiveLearningProps> = ({
  student,
  studentProgress,
  assessments,
  iterations,
  analytics,
  phases,
  currentPhase,
  gradeLevel,
  onContentDelivery,
  onPathUpdate,
  onProfileUpdate,
  className = ''
}) => {
  const [learningProfile, setLearningProfile] = useState<LearningProfile>({
    studentId: student.id,
    learningStyle: 'mixed',
    difficultyPreference: 'steady_progress',
    pacePreference: 'moderate',
    collaborationStyle: 'varied',
    feedbackPreference: 'checkpoint',
    motivationalFactors: [
      { type: 'achievement', strength: 70, triggers: ['completion', 'progress'] },
      { type: 'curiosity', strength: 60, triggers: ['questions', 'exploration'] }
    ],
    cognitiveLoad: 50,
    flowState: {
      level: 65,
      factors: {
        challengeSkillBalance: 70,
        clearGoals: 80,
        immediateFeedback: 60,
        concentration: 65
      },
      trends: [60, 65, 70, 65, 68]
    }
  });

  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [adaptationHistory, setAdaptationHistory] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    engagement: 75,
    difficulty: 5,
    pace: 1.0,
    satisfaction: 80
  });

  // Analyze current performance and adapt
  const performanceAnalysis = useMemo(() => {
    const recentAssessments = assessments.slice(-3);
    const averagePerformance = recentAssessments.length > 0
      ? recentAssessments.reduce((sum, a) => sum + a.percentage, 0) / recentAssessments.length
      : 70;

    const engagementScore = analytics.engagementScore;
    const iterationRate = iterations.length / Math.max(1, studentProgress.phaseProgress.length);
    
    // Calculate learning velocity (progress over time)
    const totalTime = studentProgress.phaseProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const learningVelocity = totalTime > 0 ? (analytics.overallProgress / totalTime) * 60 : 0; // Progress per hour

    return {
      averagePerformance,
      engagementScore,
      iterationRate,
      learningVelocity,
      strugglingAreas: recentAssessments
        .flatMap(a => a.scores)
        .filter(s => s.points < 3)
        .map(s => s.criterionId),
      strengthAreas: recentAssessments
        .flatMap(a => a.scores)
        .filter(s => s.points >= 4)
        .map(s => s.criterionId)
    };
  }, [assessments, analytics, iterations, studentProgress]);

  // Generate adaptive learning path
  const generateAdaptivePath = useCallback((): LearningPath => {
    const currentPhaseType = phases[currentPhase].type;
    const availableContent = ADAPTIVE_CONTENT_LIBRARY[currentPhaseType];
    
    // Filter and sort content based on learning profile
    const matchedContent = ADAPTATION_ALGORITHMS.content.modalityMatch(
      learningProfile.learningStyle,
      availableContent
    );

    // Adjust difficulty based on performance
    const adjustedDifficulty = ADAPTATION_ALGORITHMS.difficulty.zpd(
      performanceAnalysis.averagePerformance,
      realTimeMetrics.difficulty
    );

    // Filter content by adjusted difficulty (within 2 points)
    const suitableContent = matchedContent.filter(content => 
      Math.abs(content.difficulty - adjustedDifficulty) <= 2
    );

    // Create learning path
    const path: LearningPath = {
      id: `adaptive-${currentPhaseType}-${Date.now()}`,
      name: `Personalized ${phases[currentPhase].name} Journey`,
      description: `Adapted for ${student.name}'s learning style and current performance`,
      content: suitableContent.slice(0, 5), // Limit to 5 items
      branches: [
        {
          condition: 'performance_above_85',
          targetPosition: -1, // Skip to advanced content
          reason: 'High performance detected, advancing difficulty'
        },
        {
          condition: 'performance_below_60',
          targetPosition: 0, // Return to basics
          reason: 'Need additional support, reviewing fundamentals'
        }
      ],
      currentPosition: 0,
      completion: 0,
      estimatedTime: suitableContent.reduce((sum, c) => sum + c.estimatedTime, 0),
      difficultyProgression: suitableContent.map(c => c.difficulty)
    };

    return path;
  }, [phases, currentPhase, learningProfile, performanceAnalysis, realTimeMetrics]);

  // Update learning profile based on behavior
  const updateLearningProfile = useCallback((behaviorData: any) => {
    setLearningProfile(prev => {
      const updated = { ...prev };
      
      // Adjust cognitive load based on performance and time spent
      if (behaviorData.timeSpent > 30 && behaviorData.performance < 60) {
        updated.cognitiveLoad = Math.min(100, updated.cognitiveLoad + 10);
      } else if (behaviorData.performance > 80) {
        updated.cognitiveLoad = Math.max(0, updated.cognitiveLoad - 5);
      }
      
      // Update flow state
      const newFlowLevel = calculateFlowState(behaviorData, analytics);
      updated.flowState = {
        ...updated.flowState,
        level: newFlowLevel,
        trends: [...updated.flowState.trends.slice(-4), newFlowLevel]
      };
      
      return updated;
    });
  }, [analytics]);

  // Real-time adaptation engine
  useEffect(() => {
    const adaptationInterval = setInterval(() => {
      // Simulate real-time behavior data (in production, this would come from user interactions)
      const behaviorData = {
        timeSpent: Math.random() * 20 + 10,
        performance: performanceAnalysis.averagePerformance + (Math.random() - 0.5) * 20,
        clicksPerMinute: Math.random() * 10 + 5,
        scrollSpeed: Math.random() * 100 + 50
      };

      updateLearningProfile(behaviorData);

      // Adjust real-time metrics
      setRealTimeMetrics(prev => ({
        engagement: Math.max(0, Math.min(100, prev.engagement + (Math.random() - 0.5) * 10)),
        difficulty: ADAPTATION_ALGORITHMS.difficulty.flow(learningProfile.flowState.level, prev.difficulty),
        pace: ADAPTATION_ALGORITHMS.pacing.cognitiveLoad(learningProfile.cognitiveLoad, prev.pace),
        satisfaction: Math.max(0, Math.min(100, prev.satisfaction + (Math.random() - 0.5) * 5))
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(adaptationInterval);
  }, [learningProfile.flowState.level, learningProfile.cognitiveLoad, performanceAnalysis.averagePerformance, updateLearningProfile]);

  // Generate new path when phase changes or performance significantly changes
  useEffect(() => {
    const newPath = generateAdaptivePath();
    setCurrentPath(newPath);
    
    if (onPathUpdate) {
      onPathUpdate(newPath);
    }
  }, [generateAdaptivePath, onPathUpdate]);

  // Deliver next content item
  const deliverNextContent = useCallback(() => {
    if (!currentPath || currentPath.currentPosition >= currentPath.content.length) return;
    
    const nextContent = currentPath.content[currentPath.currentPosition];
    
    if (onContentDelivery) {
      onContentDelivery(nextContent);
    }

    // Update path progress
    setCurrentPath(prev => prev ? {
      ...prev,
      currentPosition: prev.currentPosition + 1,
      completion: ((prev.currentPosition + 1) / prev.content.length) * 100
    } : null);
  }, [currentPath, onContentDelivery]);

  // Get adaptation status
  const adaptationStatus = useMemo(() => {
    const recentTrend = learningProfile.flowState.trends.slice(-3);
    const isImproving = recentTrend.length >= 2 && 
      recentTrend[recentTrend.length - 1] > recentTrend[recentTrend.length - 2];
    
    return {
      isOptimal: learningProfile.flowState.level > 70,
      isImproving,
      needsAdjustment: learningProfile.cognitiveLoad > 80 || learningProfile.flowState.level < 50,
      recommendation: getAdaptationRecommendation(learningProfile, performanceAnalysis)
    };
  }, [learningProfile, performanceAnalysis]);

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary-600" />
              Adaptive Learning System
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Personalized for {student.name} • {learningProfile.learningStyle} learner
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm ${
              adaptationStatus.isOptimal
                ? 'bg-green-100 text-green-700'
                : adaptationStatus.needsAdjustment
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {adaptationStatus.isOptimal ? 'Optimal' : 
               adaptationStatus.needsAdjustment ? 'Adjusting' : 'Monitoring'}
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Engagement</span>
            </div>
            <div className="text-lg font-bold text-primary-900">
              {Math.round(realTimeMetrics.engagement)}%
            </div>
            <div className="w-full bg-primary-200 rounded-full h-1 mt-1">
              <div
                className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${realTimeMetrics.engagement}%` }}
              />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Flow State</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {Math.round(learningProfile.flowState.level)}%
            </div>
            <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
              <div
                className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${learningProfile.flowState.level}%` }}
              />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Difficulty</span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {realTimeMetrics.difficulty.toFixed(1)}/10
            </div>
            <div className="w-full bg-orange-200 rounded-full h-1 mt-1">
              <div
                className="bg-orange-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(realTimeMetrics.difficulty / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Pace</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {realTimeMetrics.pace.toFixed(1)}x
            </div>
            <div className="flex items-center gap-1 mt-1">
              {realTimeMetrics.pace > 1 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : realTimeMetrics.pace < 1 ? (
                <TrendingDown className="w-3 h-3 text-orange-600" />
              ) : (
                <Activity className="w-3 h-3 text-primary-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Learning Profile */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Learning Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Preferences</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Learning Style:</span>
                  <span className="font-medium capitalize">{learningProfile.learningStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{learningProfile.difficultyPreference.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pace:</span>
                  <span className="font-medium capitalize">{learningProfile.pacePreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collaboration:</span>
                  <span className="font-medium capitalize">{learningProfile.collaborationStyle.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Motivational Factors</h4>
              <div className="space-y-2">
                {learningProfile.motivationalFactors.map(factor => (
                  <div key={factor.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{factor.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${factor.strength}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{factor.strength}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Learning Path */}
        {currentPath && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" />
              Current Learning Path
            </h3>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900">{currentPath.name}</h4>
                <span className="text-sm text-purple-700">
                  {Math.round(currentPath.completion)}% complete
                </span>
              </div>
              <p className="text-sm text-purple-800 mb-4">{currentPath.description}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-purple-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPath.completion}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Content Items */}
              <div className="space-y-2">
                {currentPath.content.map((item, index) => {
                  const isCompleted = index < currentPath.currentPosition;
                  const isCurrent = index === currentPath.currentPosition;
                  const isUpcoming = index > currentPath.currentPosition;
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded ${
                        isCompleted ? 'bg-green-100' :
                        isCurrent ? 'bg-primary-100' :
                        'bg-gray-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-600 text-white' :
                        isCurrent ? 'bg-primary-600 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          isCompleted ? 'text-green-900' :
                          isCurrent ? 'text-primary-900' :
                          'text-gray-700'
                        }`}>
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{item.estimatedTime} min</span>
                          <span>•</span>
                          <span className="capitalize">{item.modality}</span>
                          <span>•</span>
                          <span>Level {item.difficulty}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <button
                          onClick={deliverNextContent}
                          className="px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition-colors"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Path Statistics */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-purple-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-700">
                    {currentPath.estimatedTime}
                  </div>
                  <div className="text-xs text-purple-600">Total Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-700">
                    {currentPath.content.length}
                  </div>
                  <div className="text-xs text-purple-600">Learning Items</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-700">
                    {Math.round(currentPath.difficultyProgression.reduce((a, b) => a + b, 0) / currentPath.difficultyProgression.length * 10) / 10}
                  </div>
                  <div className="text-xs text-purple-600">Avg Difficulty</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Adaptation Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Adaptation Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 ${
              adaptationStatus.isOptimal ? 'bg-green-50' :
              adaptationStatus.needsAdjustment ? 'bg-red-50' :
              'bg-yellow-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {adaptationStatus.isOptimal ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : adaptationStatus.needsAdjustment ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Info className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  adaptationStatus.isOptimal ? 'text-green-900' :
                  adaptationStatus.needsAdjustment ? 'text-red-900' :
                  'text-yellow-900'
                }`}>
                  {adaptationStatus.isOptimal ? 'Learning Optimized' :
                   adaptationStatus.needsAdjustment ? 'Needs Adjustment' :
                   'Monitoring Performance'}
                </span>
              </div>
              <p className={`text-sm ${
                adaptationStatus.isOptimal ? 'text-green-800' :
                adaptationStatus.needsAdjustment ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {adaptationStatus.recommendation}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Flow State Factors</h4>
              <div className="space-y-2">
                {Object.entries(learningProfile.flowState.factors).map(([factor, value]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Performance Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Strengths</span>
              </div>
              <div className="space-y-1">
                {performanceAnalysis.strengthAreas.slice(0, 3).map((area, idx) => (
                  <div key={idx} className="text-sm text-green-800">
                    • {area.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Focus Areas</span>
              </div>
              <div className="space-y-1">
                {performanceAnalysis.strugglingAreas.slice(0, 3).map((area, idx) => (
                  <div key={idx} className="text-sm text-orange-800">
                    • {area.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">Learning Velocity</span>
              </div>
              <div className="text-2xl font-bold text-primary-700 mb-1">
                {performanceAnalysis.learningVelocity.toFixed(1)}
              </div>
              <div className="text-xs text-primary-600">Progress per hour</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateFlowState(behaviorData: any, analytics: LearningAnalytics): number {
  // Simplified flow state calculation based on engagement and performance
  const engagementFactor = analytics.engagementScore / 100;
  const performanceFactor = Math.min(1, behaviorData.performance / 80);
  const timeFactor = Math.max(0, 1 - (behaviorData.timeSpent / 60)); // Diminishing returns after 60 minutes
  
  return Math.round((engagementFactor * 0.4 + performanceFactor * 0.4 + timeFactor * 0.2) * 100);
}

function getAdaptationRecommendation(profile: LearningProfile, analysis: any): string {
  if (profile.cognitiveLoad > 80) {
    return "High cognitive load detected. Reducing complexity and adding breaks.";
  }
  
  if (profile.flowState.level < 50) {
    return "Flow state is low. Adjusting difficulty and improving feedback loops.";
  }
  
  if (analysis.learningVelocity < 0.5) {
    return "Learning pace is slow. Providing additional scaffolding and motivation.";
  }
  
  return "Learning is progressing well. Maintaining current approach with minor optimizations.";
}