/**
 * AITutor.tsx
 * 
 * AI-powered tutoring and personalized learning guidance
 * Part of Sprint 6: Advanced Features and AI Integration
 * 
 * FEATURES:
 * - Personalized learning recommendations
 * - Real-time difficulty adjustment
 * - Intelligent scaffolding
 * - Natural language processing for student questions
 * - Adaptive feedback generation
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Zap,
  Star,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Users,
  Clock,
  Award
} from 'lucide-react';
import {
  PhaseType,
  GradeLevel,
  CreativePhase,
  StudentProgress,
  IterationEvent
} from '../types';
import { Assessment } from './AssessmentCriteria';
import { PeerReview } from './PeerEvaluation';
import { LearningAnalytics } from './DataAnalytics';

export interface AITutorConfig {
  personalityMode: 'encouraging' | 'challenging' | 'balanced' | 'adaptive';
  difficultyLevel: 'below_grade' | 'on_grade' | 'above_grade' | 'adaptive';
  scaffoldingStyle: 'heavy' | 'moderate' | 'light' | 'minimal';
  feedbackFrequency: 'immediate' | 'checkpoint' | 'completion' | 'on_demand';
  languageComplexity: 'simple' | 'grade_appropriate' | 'advanced' | 'adaptive';
  voiceEnabled: boolean;
  conversationalMode: boolean;
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  studentId: string;
  type: 'question' | 'hint' | 'feedback' | 'recommendation' | 'encouragement';
  context: {
    phaseType: PhaseType;
    activity?: string;
    strugglingArea?: string;
    currentProgress: number;
  };
  input: string;
  response: string;
  responseType: 'text' | 'audio' | 'visual' | 'interactive';
  effectiveness?: number; // 0-100, measured by student engagement
  followUpNeeded: boolean;
}

export interface LearningRecommendation {
  id: string;
  type: 'resource' | 'activity' | 'strategy' | 'collaboration' | 'break';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  estimatedTime: number; // minutes
  phaseRelevance: PhaseType[];
  prerequisites: string[];
  outcomes: string[];
  adaptiveLevel: number; // 1-10 difficulty scale
}

export interface SkillGap {
  skill: string;
  currentLevel: number; // 0-100
  expectedLevel: number; // 0-100
  gap: number; // expectedLevel - currentLevel
  interventions: string[];
  resources: string[];
  timeToImprove: number; // weeks
}

interface AITutorProps {
  student: {
    id: string;
    name: string;
    grade: string;
  };
  studentProgress: StudentProgress;
  assessments: Assessment[];
  peerReviews: PeerReview[];
  iterations: IterationEvent[];
  phases: CreativePhase[];
  currentPhase: number;
  analytics: LearningAnalytics;
  gradeLevel: GradeLevel;
  config?: Partial<AITutorConfig>;
  onInteraction?: (interaction: AIInteraction) => void;
  onConfigUpdate?: (config: AITutorConfig) => void;
  className?: string;
}

// AI response templates by grade level and context
const AI_RESPONSE_TEMPLATES = {
  elementary: {
    encouragement: [
      "Great job exploring that idea! What else could you try?",
      "You're being so creative! I love how you're thinking about this.",
      "That's an interesting approach! What do you think might happen next?",
      "You're doing amazing work! Want to share what you discovered?"
    ],
    hint: [
      "Here's a little hint to help you: {hint}",
      "Think about it like this: {analogy}",
      "What if you tried looking at it from a different angle?",
      "Remember when we talked about {concept}? That might help here!"
    ],
    question_response: [
      "That's a wonderful question! Let me help you think through it.",
      "I can see you're really thinking hard about this!",
      "Great question! Here's what I think might help..."
    ]
  },
  middle: {
    encouragement: [
      "Your critical thinking skills are really developing! Keep pushing yourself.",
      "I can see you're making connections between ideas. That's excellent!",
      "You're approaching this challenge with great persistence.",
      "Your analysis is getting stronger with each iteration."
    ],
    hint: [
      "Consider this perspective: {hint}",
      "What patterns do you notice? {observation}",
      "Try breaking this down into smaller parts.",
      "What evidence supports your current thinking?"
    ],
    question_response: [
      "That's a sophisticated question that shows deep thinking.",
      "Let's explore that together. What's your initial hypothesis?",
      "Your question reveals good analytical thinking."
    ]
  },
  high: {
    encouragement: [
      "Your analytical approach demonstrates mature thinking.",
      "The connections you're making show sophisticated reasoning.",
      "Your ability to synthesize information is impressive.",
      "You're demonstrating excellent metacognitive awareness."
    ],
    hint: [
      "Consider the broader implications: {context}",
      "What theoretical framework might apply here?",
      "How does this connect to {relevant_concept}?",
      "What would a {expert_role} think about this approach?"
    ],
    question_response: [
      "That's an insightful question that gets to the heart of the matter.",
      "Your question demonstrates critical thinking about complex issues.",
      "That's exactly the kind of inquiry that leads to breakthrough thinking."
    ]
  }
};

// Skill assessment framework
const SKILL_FRAMEWORK = {
  creativity: {
    indicators: ['original_ideas', 'unique_solutions', 'innovative_approaches'],
    assessment_criteria: ['novelty', 'usefulness', 'elaboration']
  },
  critical_thinking: {
    indicators: ['analysis', 'evaluation', 'synthesis'],
    assessment_criteria: ['accuracy', 'relevance', 'depth']
  },
  collaboration: {
    indicators: ['peer_interaction', 'feedback_quality', 'team_contribution'],
    assessment_criteria: ['frequency', 'helpfulness', 'leadership']
  },
  communication: {
    indicators: ['clarity', 'organization', 'audience_awareness'],
    assessment_criteria: ['coherence', 'persuasiveness', 'engagement']
  },
  persistence: {
    indicators: ['iteration_frequency', 'challenge_acceptance', 'goal_pursuit'],
    assessment_criteria: ['consistency', 'improvement', 'resilience']
  }
};

export const AITutor: React.FC<AITutorProps> = ({
  student,
  studentProgress,
  assessments,
  peerReviews,
  iterations,
  phases,
  currentPhase,
  analytics,
  gradeLevel,
  config,
  onInteraction,
  onConfigUpdate,
  className = ''
}) => {
  const [tutorConfig, setTutorConfig] = useState<AITutorConfig>({
    personalityMode: 'adaptive',
    difficultyLevel: 'adaptive',
    scaffoldingStyle: 'moderate',
    feedbackFrequency: 'checkpoint',
    languageComplexity: 'grade_appropriate',
    voiceEnabled: false,
    conversationalMode: true,
    ...config
  });

  const [currentInteraction, setCurrentInteraction] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<AIInteraction[]>([]);
  const [activeRecommendations, setActiveRecommendations] = useState<LearningRecommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Analyze student performance and identify skill gaps
  const performanceAnalysis = useMemo(() => {
    const currentPhaseData = phases[currentPhase];
    const recentAssessments = assessments.slice(-3); // Last 3 assessments
    const averageScore = recentAssessments.length > 0
      ? recentAssessments.reduce((sum, a) => sum + a.percentage, 0) / recentAssessments.length
      : 0;

    // Calculate skill levels
    const skillLevels: Record<string, number> = {};
    
    Object.keys(SKILL_FRAMEWORK).forEach(skill => {
      // Base calculation on assessments, peer reviews, and analytics
      let level = 0;
      
      if (skill === 'creativity') {
        level = analytics.creativityIndex;
      } else if (skill === 'collaboration') {
        level = analytics.collaborationScore;
      } else if (skill === 'persistence') {
        level = analytics.persistenceMetric;
      } else if (skill === 'critical_thinking') {
        // Derive from assessment performance
        level = averageScore * 0.8; // Adjust based on assessment type
      } else if (skill === 'communication') {
        // Derive from peer feedback
        const communicationFeedback = peerReviews
          .flatMap(r => r.feedback)
          .filter(f => f.content.toLowerCase().includes('communicate') || 
                      f.content.toLowerCase().includes('present') ||
                      f.content.toLowerCase().includes('explain'));
        level = Math.min(100, communicationFeedback.length * 15);
      }
      
      skillLevels[skill] = Math.max(0, Math.min(100, level));
    });

    // Identify gaps based on grade level expectations
    const expectedLevels: Record<GradeLevel, Record<string, number>> = {
      elementary: {
        creativity: 60,
        critical_thinking: 50,
        collaboration: 65,
        communication: 55,
        persistence: 60
      },
      middle: {
        creativity: 70,
        critical_thinking: 65,
        collaboration: 70,
        communication: 65,
        persistence: 70
      },
      high: {
        creativity: 80,
        critical_thinking: 75,
        collaboration: 75,
        communication: 75,
        persistence: 80
      }
    };

    const gaps: SkillGap[] = Object.keys(skillLevels).map(skill => {
      const current = skillLevels[skill];
      const expected = expectedLevels[gradeLevel][skill];
      const gap = expected - current;
      
      return {
        skill,
        currentLevel: current,
        expectedLevel: expected,
        gap,
        interventions: gap > 10 ? getSkillInterventions(skill, gap) : [],
        resources: gap > 10 ? getSkillResources(skill, gradeLevel) : [],
        timeToImprove: Math.ceil(gap / 10) // Rough estimate in weeks
      };
    }).filter(g => g.gap > 5); // Only include significant gaps

    return {
      averageScore,
      skillLevels,
      gaps,
      strongAreas: Object.keys(skillLevels).filter(skill => 
        skillLevels[skill] >= expectedLevels[gradeLevel][skill]
      ),
      improvementAreas: gaps.map(g => g.skill)
    };
  }, [assessments, peerReviews, analytics, gradeLevel, currentPhase]);

  // Generate personalized recommendations
  const generateRecommendations = useCallback((): LearningRecommendation[] => {
    const recommendations: LearningRecommendation[] = [];
    const currentPhaseData = phases[currentPhase];
    
    // Skill gap recommendations
    performanceAnalysis.gaps.forEach(gap => {
      if (gap.gap > 15) {
        recommendations.push({
          id: `skill-${gap.skill}-${Date.now()}`,
          type: 'strategy',
          priority: 'high',
          title: `Strengthen ${gap.skill.replace('_', ' ')} Skills`,
          description: `Focus on improving your ${gap.skill.replace('_', ' ')} through targeted practice`,
          reasoning: `Your ${gap.skill.replace('_', ' ')} is ${gap.gap} points below grade level expectations`,
          estimatedTime: gap.timeToImprove * 30, // Convert weeks to minutes of practice
          phaseRelevance: [currentPhaseData.type],
          prerequisites: [],
          outcomes: gap.interventions,
          adaptiveLevel: Math.ceil(gap.gap / 10)
        });
      }
    });

    // Phase-specific recommendations
    if (analytics.iterationFrequency < 1) {
      recommendations.push({
        id: `iteration-boost-${Date.now()}`,
        type: 'strategy',
        priority: 'medium',
        title: 'Try More Iterations',
        description: 'Experiment with different approaches to strengthen your solution',
        reasoning: 'You haven\'t iterated much yet - this is a great way to improve your work',
        estimatedTime: 20,
        phaseRelevance: [currentPhaseData.type],
        prerequisites: [],
        outcomes: ['Improved solution quality', 'Enhanced problem-solving skills'],
        adaptiveLevel: 3
      });
    }

    // Collaboration recommendations
    if (analytics.collaborationScore < 50) {
      recommendations.push({
        id: `collaboration-${Date.now()}`,
        type: 'collaboration',
        priority: 'medium',
        title: 'Connect with Peers',
        description: 'Engage more with your classmates to share ideas and get feedback',
        reasoning: 'Collaboration can help you see new perspectives and improve your work',
        estimatedTime: 15,
        phaseRelevance: phases.map(p => p.type),
        prerequisites: [],
        outcomes: ['Better peer relationships', 'Diverse perspectives', 'Improved communication'],
        adaptiveLevel: 2
      });
    }

    // Break recommendations based on time spent
    const totalTimeSpent = studentProgress.phaseProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    if (totalTimeSpent > 180) { // More than 3 hours
      recommendations.push({
        id: `break-${Date.now()}`,
        type: 'break',
        priority: 'low',
        title: 'Take a Creative Break',
        description: 'Step away for a few minutes to refresh your mind',
        reasoning: 'You\'ve been working hard - a break can help you return with fresh ideas',
        estimatedTime: 10,
        phaseRelevance: [],
        prerequisites: [],
        outcomes: ['Refreshed perspective', 'Reduced mental fatigue'],
        adaptiveLevel: 1
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }, [performanceAnalysis, currentPhase, phases, analytics, studentProgress]);

  // Update recommendations periodically
  useEffect(() => {
    const newRecommendations = generateRecommendations();
    setActiveRecommendations(newRecommendations);
    setSkillGaps(performanceAnalysis.gaps);
  }, [generateRecommendations, performanceAnalysis.gaps]);

  // Generate AI response based on context
  const generateAIResponse = useCallback((input: string, context: any): string => {
    const templates = AI_RESPONSE_TEMPLATES[gradeLevel];
    const responseType = determineResponseType(input);
    
    let response = '';
    
    if (responseType === 'question') {
      response = templates.question_response[Math.floor(Math.random() * templates.question_response.length)];
    } else if (responseType === 'encouragement_needed') {
      response = templates.encouragement[Math.floor(Math.random() * templates.encouragement.length)];
    } else if (responseType === 'hint_needed') {
      response = templates.hint[Math.floor(Math.random() * templates.hint.length)];
    } else {
      // Default encouraging response
      response = templates.encouragement[Math.floor(Math.random() * templates.encouragement.length)];
    }

    // Personalize based on student data
    response = personalizeResponse(response, {
      studentName: student.name,
      currentPhase: phases[currentPhase].name,
      recentProgress: analytics.overallProgress,
      strongSkill: performanceAnalysis.strongAreas[0],
      improvementArea: performanceAnalysis.improvementAreas[0]
    });

    return response;
  }, [gradeLevel, student.name, phases, currentPhase, analytics, performanceAnalysis]);

  // Handle user interaction
  const handleInteraction = useCallback(async () => {
    if (!currentInteraction.trim()) return;

    const context = {
      phaseType: phases[currentPhase].type,
      currentProgress: analytics.overallProgress,
      strugglingArea: performanceAnalysis.improvementAreas[0]
    };

    const response = generateAIResponse(currentInteraction, context);

    const interaction: AIInteraction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      studentId: student.id,
      type: 'question',
      context,
      input: currentInteraction,
      response,
      responseType: 'text',
      followUpNeeded: false
    };

    setConversationHistory(prev => [...prev, interaction]);
    setCurrentInteraction('');

    // Text-to-speech if enabled
    if (tutorConfig.voiceEnabled && speechSynthesis.current) {
      speak(response);
    }

    // Callback to parent
    if (onInteraction) {
      onInteraction(interaction);
    }
  }, [currentInteraction, generateAIResponse, phases, currentPhase, analytics, performanceAnalysis, student.id, tutorConfig.voiceEnabled, onInteraction]);

  // Text-to-speech functionality
  const speak = useCallback((text: string) => {
    if (!speechSynthesis.current) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.current.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<AITutorConfig>) => {
    const newConfig = { ...tutorConfig, ...updates };
    setTutorConfig(newConfig);
    if (onConfigUpdate) {
      onConfigUpdate(newConfig);
    }
  }, [tutorConfig, onConfigUpdate]);

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Learning Coach
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Personalized guidance for {student.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-lg transition-colors ${
                showConfig ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            {tutorConfig.voiceEnabled && (
              <button
                onClick={isSpeaking ? stopSpeaking : undefined}
                className={`p-2 rounded-lg transition-colors ${
                  isSpeaking ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}
                disabled={!isSpeaking}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-700">
              {Math.round(analytics.overallProgress)}%
            </div>
            <div className="text-xs text-purple-600">Progress</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-700">
              {performanceAnalysis.strongAreas.length}
            </div>
            <div className="text-xs text-blue-600">Strengths</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-700">
              {skillGaps.length}
            </div>
            <div className="text-xs text-orange-600">Growth Areas</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-700">
              {activeRecommendations.length}
            </div>
            <div className="text-xs text-green-600">Suggestions</div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-gray-50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personality Mode
                  </label>
                  <select
                    value={tutorConfig.personalityMode}
                    onChange={(e) => updateConfig({ personalityMode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="encouraging">Encouraging</option>
                    <option value="challenging">Challenging</option>
                    <option value="balanced">Balanced</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scaffolding Level
                  </label>
                  <select
                    value={tutorConfig.scaffoldingStyle}
                    onChange={(e) => updateConfig({ scaffoldingStyle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="heavy">Heavy Support</option>
                    <option value="moderate">Moderate Support</option>
                    <option value="light">Light Support</option>
                    <option value="minimal">Minimal Support</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tutorConfig.voiceEnabled}
                    onChange={(e) => updateConfig({ voiceEnabled: e.target.checked })}
                    className="text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Voice responses</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tutorConfig.conversationalMode}
                    onChange={(e) => updateConfig({ conversationalMode: e.target.checked })}
                    className="text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Conversational mode</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg h-96 flex flex-col">
              {/* Chat History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {conversationHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm">
                      Hi {student.name}! I'm here to help you learn.
                      <br />
                      Ask me anything about your project!
                    </p>
                  </div>
                )}

                {conversationHistory.map(interaction => (
                  <div key={interaction.id} className="space-y-2">
                    {/* Student Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
                        <p className="text-sm">{interaction.input}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg max-w-xs">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{interaction.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentInteraction}
                    onChange={(e) => setCurrentInteraction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleInteraction()}
                    placeholder="Ask me anything about your learning..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={handleInteraction}
                    disabled={!currentInteraction.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          <div className="space-y-6">
            {/* Skill Gaps */}
            {skillGaps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Growth Opportunities
                </h3>
                <div className="space-y-2">
                  {skillGaps.slice(0, 3).map(gap => (
                    <div key={gap.skill} className="bg-orange-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-orange-900 capitalize">
                          {gap.skill.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-orange-700">
                          {gap.gap}pt gap
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${gap.currentLevel}%` }}
                        />
                      </div>
                      <div className="text-xs text-orange-700 mt-1">
                        {gap.timeToImprove} week{gap.timeToImprove !== 1 ? 's' : ''} to improve
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {activeRecommendations.map(rec => {
                  const priorityColors = {
                    high: 'red',
                    medium: 'yellow',
                    low: 'blue'
                  };
                  const color = priorityColors[rec.priority];
                  
                  return (
                    <div key={rec.id} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium text-${color}-900`}>{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full capitalize`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className={`text-sm text-${color}-800 mb-2`}>{rec.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`text-${color}-600`}>
                          {rec.estimatedTime} min
                        </span>
                        <button className={`text-${color}-700 hover:text-${color}-900 flex items-center gap-1`}>
                          <span>Try it</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths Recognition */}
            {performanceAnalysis.strongAreas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Your Strengths
                </h3>
                <div className="space-y-2">
                  {performanceAnalysis.strongAreas.map(skill => (
                    <div key={skill} className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-900 font-medium capitalize">
                          {skill.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        You're excelling in this area!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function determineResponseType(input: string): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('?')) return 'question';
  if (lowerInput.includes('stuck') || lowerInput.includes('confused') || lowerInput.includes('help')) return 'hint_needed';
  if (lowerInput.includes('frustrated') || lowerInput.includes('hard') || lowerInput.includes('difficult')) return 'encouragement_needed';
  
  return 'general';
}

function personalizeResponse(template: string, context: any): string {
  return template
    .replace('{studentName}', context.studentName)
    .replace('{currentPhase}', context.currentPhase)
    .replace('{strongSkill}', context.strongSkill?.replace('_', ' ') || 'problem-solving')
    .replace('{improvementArea}', context.improvementArea?.replace('_', ' ') || 'collaboration');
}

function getSkillInterventions(skill: string, gap: number): string[] {
  const interventions: Record<string, string[]> = {
    creativity: [
      'Practice brainstorming with "What if?" questions',
      'Try the SCAMPER method for idea generation',
      'Explore ideas from different perspectives',
      'Combine unrelated concepts for new solutions'
    ],
    critical_thinking: [
      'Ask "Why?" and "How do you know?" more often',
      'Practice comparing pros and cons',
      'Look for evidence to support claims',
      'Consider alternative viewpoints'
    ],
    collaboration: [
      'Practice active listening skills',
      'Ask peers for their opinions',
      'Offer help to struggling teammates',
      'Share your ideas clearly and kindly'
    ],
    communication: [
      'Practice explaining ideas in different ways',
      'Use visual aids to support explanations',
      'Ask for feedback on clarity',
      'Organize thoughts before speaking'
    ],
    persistence: [
      'Set small, achievable goals',
      'Celebrate small wins along the way',
      'View mistakes as learning opportunities',
      'Take breaks when feeling overwhelmed'
    ]
  };
  
  return interventions[skill]?.slice(0, Math.ceil(gap / 10)) || [];
}

function getSkillResources(skill: string, gradeLevel: GradeLevel): string[] {
  const resources: Record<string, Record<GradeLevel, string[]>> = {
    creativity: {
      elementary: ['Art supplies for idea sketching', 'Building blocks for 3D thinking', 'Story cubes for inspiration'],
      middle: ['Mind mapping tools', 'Design thinking worksheets', 'Creative problem-solving games'],
      high: ['Innovation frameworks', 'TRIZ methodology resources', 'Case studies of creative solutions']
    },
    critical_thinking: {
      elementary: ['Question starter cards', 'Simple logic puzzles', 'Cause and effect games'],
      middle: ['Argument mapping tools', 'Logic puzzle books', 'Debate topics'],
      high: ['Formal logic resources', 'Cognitive bias awareness', 'Research methodology guides']
    }
  };
  
  return resources[skill]?.[gradeLevel] || ['Online tutorials', 'Practice exercises', 'Peer discussion groups'];
}