// UIGuidanceProvider.tsx - Intelligent UI guidance system for ALF Coach
import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, HelpCircle, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuggestionCards } from './SuggestionCards';
import { EnhancedSuggestionCards } from './EnhancedSuggestionCards';

interface UIGuidanceProviderProps {
  currentStage: string;
  currentStep?: string;
  userContext?: {
    subject?: string;
    ageGroup?: string;
    location?: string;
    educatorPerspective?: string;
  };
  onIdeaSelect: (idea: string) => void;
  onSuggestionSelect: (suggestion: any) => void;
  inputValue?: string;
  lastInteractionTime?: number;
  isWaiting?: boolean;
}

export const UIGuidanceProvider: React.FC<UIGuidanceProviderProps> = ({
  currentStage,
  currentStep,
  userContext,
  onIdeaSelect,
  onSuggestionSelect,
  inputValue = '',
  lastInteractionTime = Date.now(),
  isWaiting = false
}) => {
  const [showIdeas, setShowIdeas] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  
  // Track idle time to trigger suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastInteractionTime;
      setIdleTime(idle);
      
      // Show suggestions after 15 seconds of inactivity
      if (idle > 15000 && !showSuggestions && !inputValue) {
        setShowSuggestions(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastInteractionTime, showSuggestions, inputValue]);
  
  // Ideas content based on stage and step
  const getIdeasContent = useCallback(() => {
    const ideas: Record<string, Record<string, string[]>> = {
      'IDEATION': {
        'bigIdea': [
          'Students will understand how climate affects daily life',
          'Technology shapes how we communicate and connect',
          'Historical events continue to influence our present',
          'Mathematical patterns exist everywhere in nature',
          'Art reflects and shapes cultural identity'
        ],
        'essentialQuestion': [
          'How does where we live shape who we are?',
          'What makes a community resilient?',
          'How do we balance progress with preservation?',
          'Why do patterns repeat across different scales?',
          'What stories do we tell about ourselves?'
        ],
        'challenge': [
          'Design a sustainable solution for our school',
          'Create a time capsule for future students',
          'Build a bridge between two communities',
          'Solve a real problem in our neighborhood',
          'Document untold stories from our area'
        ]
      },
      'LEARNING_JOURNEY': {
        'analyze': [
          'Research existing solutions to similar problems',
          'Interview community members about their experiences',
          'Collect and analyze data from multiple sources',
          'Map the current state of the issue',
          'Identify key stakeholders and their perspectives'
        ],
        'brainstorm': [
          'Generate 100 ideas in 10 minutes',
          'Use SCAMPER technique for creative solutions',
          'Host a design thinking workshop',
          'Create mind maps of possibilities',
          'Combine unrelated concepts for innovation'
        ],
        'prototype': [
          'Build a scale model or mockup',
          'Create a digital simulation',
          'Develop a pilot program',
          'Design a proof of concept',
          'Test with a small group first'
        ],
        'evaluate': [
          'Peer review and feedback sessions',
          'Expert panel evaluation',
          'Community showcase and voting',
          'Self-reflection portfolios',
          'Impact measurement over time'
        ]
      },
      'DELIVERABLES': {
        'rubric': [
          'Clear success criteria for each component',
          'Differentiated levels of achievement',
          'Balance of process and product evaluation',
          'Student self-assessment opportunities',
          'Authentic real-world standards'
        ],
        'milestones': [
          'Weekly check-ins with progress updates',
          'Phase completion celebrations',
          'Peer teaching moments',
          'Community presentation prep',
          'Final showcase event'
        ]
      }
    };
    
    return ideas[currentStage]?.[currentStep || ''] || [];
  }, [currentStage, currentStep]);
  
  // Help content based on stage
  const getHelpContent = useCallback(() => {
    const helpContent: Record<string, any> = {
      'IDEATION': {
        title: 'Crafting Your Project Foundation',
        content: 'The Ideation stage establishes the conceptual framework for your project.',
        tips: [
          'Big Idea: A broad concept that has lasting value beyond the classroom',
          'Essential Question: Open-ended, thought-provoking, and requires investigation',
          'Challenge: A real-world problem or task that students will address'
        ],
        example: 'For a environmental science project: Big Idea: "Ecosystems are interconnected", Essential Question: "How do human actions ripple through ecosystems?", Challenge: "Design a plan to restore our local watershed"'
      },
      'LEARNING_JOURNEY': {
        title: 'Designing the Creative Process',
        content: 'Map out how students will move through the four phases of creative problem-solving.',
        tips: [
          'Analyze (25%): Understanding the problem deeply',
          'Brainstorm (25%): Generating creative solutions',
          'Prototype (35%): Building and testing ideas',
          'Evaluate (15%): Reflecting and improving'
        ],
        example: 'Students spend Week 1 researching, Week 2 ideating, Weeks 3-4 building, and Week 5 presenting and reflecting.'
      },
      'DELIVERABLES': {
        title: 'Defining Success Criteria',
        content: 'Establish clear expectations and assessment methods.',
        tips: [
          'Create rubrics that value both process and product',
          'Set milestones that build toward the final deliverable',
          'Include opportunities for peer and self-assessment',
          'Define what excellence looks like at each stage'
        ],
        example: 'A presentation rubric that evaluates research quality, creative problem-solving, collaboration, and communication skills.'
      }
    };
    
    return helpContent[currentStage] || { title: 'Help', content: 'How can we help you?', tips: [] };
  }, [currentStage]);
  
  // Generate suggestions based on context
  const generateSuggestions = useCallback(() => {
    if (!userContext?.subject) return [];
    
    const { subject, ageGroup } = userContext;
    
    // Context-aware suggestions
    const suggestions = [
      {
        id: '1',
        title: `${subject} Project Idea`,
        description: `Explore how ${subject} connects to real-world applications`,
        icon: '🎯'
      },
      {
        id: '2',
        title: `Age-Appropriate for ${ageGroup}`,
        description: `Scaffold complexity to match developmental stage`,
        icon: '👥'
      },
      {
        id: '3',
        title: 'Cross-Curricular Connection',
        description: `Integrate ${subject} with other subject areas`,
        icon: '🔗'
      }
    ];
    
    return suggestions;
  }, [userContext]);
  
  const ideas = getIdeasContent();
  const helpContent = getHelpContent();
  const suggestions = generateSuggestions();
  
  return (
    <>
      {/* Ideas Button - Shows when input is empty or user is idle */}
      <AnimatePresence>
        {(inputValue.length === 0 || idleTime > 10000) && !isWaiting && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowIdeas(!showIdeas)}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-6 h-6" />
            {idleTime > 10000 && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Help Button - Always visible */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-24 right-20 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>
      
      {/* Ideas Panel */}
      <AnimatePresence>
        {showIdeas && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-20 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Ideas & Inspiration
                </h3>
                <button
                  onClick={() => setShowIdeas(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {ideas.map((idea, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      onIdeaSelect(idea);
                      setShowIdeas(false);
                    }}
                  >
                    <p className="text-gray-700">{idea}</p>
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-20 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  {helpContent.title}
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{helpContent.content}</p>
                
                {helpContent.tips && helpContent.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Tips:</h4>
                    {helpContent.tips.map((tip: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {helpContent.example && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Example:</h4>
                    <p className="text-sm text-blue-800">{helpContent.example}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Suggestion Cards - Show when appropriate */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 z-40">
            <EnhancedSuggestionCards
              suggestions={suggestions}
              onSelect={(suggestion) => {
                onSuggestionSelect(suggestion);
                setShowSuggestions(false);
              }}
              onDismiss={() => setShowSuggestions(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UIGuidanceProvider;