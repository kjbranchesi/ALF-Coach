// UIGuidanceSystem.tsx - Consolidated UI guidance with Ideas button → Suggestion Cards
import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuggestionCards } from './SuggestionCards';

interface UIGuidanceSystemProps {
  currentStage: string;
  currentStep?: string;
  userContext?: {
    subject?: string;
    ageGroup?: string;
    location?: string;
    educatorPerspective?: string;
  };
  onSuggestionSelect: (suggestion: string) => void;
  inputValue?: string;
  lastInteractionTime?: number;
  isWaiting?: boolean;
}

export const UIGuidanceSystem: React.FC<UIGuidanceSystemProps> = ({
  currentStage,
  currentStep,
  userContext,
  onSuggestionSelect,
  inputValue = '',
  lastInteractionTime = Date.now(),
  isWaiting = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  
  // Track idle time to auto-show suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastInteractionTime;
      setIdleTime(idle);
      
      // Auto-show suggestions after 15 seconds of inactivity (but not if help is open)
      if (idle > 15000 && !showSuggestions && !showHelp && !inputValue && !isWaiting) {
        setShowSuggestions(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastInteractionTime, showSuggestions, showHelp, inputValue, isWaiting]);
  
  // Hide suggestions when user starts typing
  useEffect(() => {
    if (inputValue.length > 0) {
      setShowSuggestions(false);
    }
  }, [inputValue]);
  
  // Generate suggestions based on stage and context
  const generateSuggestions = useCallback(() => {
    const suggestions: Record<string, Record<string, string[]>> = {
      'IDEATION': {
        'bigIdea': [
          'Students will understand how interconnected systems shape our world',
          'Technology is a tool that can solve problems when used thoughtfully',
          'Our choices today create the world of tomorrow',
          'Diversity of perspectives leads to stronger solutions',
          'Every community has untold stories worth preserving'
        ],
        'essentialQuestion': [
          'How can we use what we have to create what we need?',
          'What does it mean to be a responsible citizen in our community?',
          'How do small actions create big changes over time?',
          'Why do some solutions work in one place but not another?',
          'What can the past teach us about our future?'
        ],
        'challenge': [
          'Design a solution for a real problem in our school community',
          'Create a resource that helps others learn what we discovered',
          'Build a prototype that demonstrates your understanding',
          'Document and share an important local story or issue',
          'Develop a plan to improve something in our environment'
        ]
      },
      'LEARNING_JOURNEY': {
        'analyze': [
          'Students research existing solutions and identify gaps',
          'Teams interview stakeholders to understand perspectives',
          'Groups collect and analyze relevant data',
          'Learners map the current state of the problem',
          'Students identify root causes through investigation'
        ],
        'brainstorm': [
          'Teams generate diverse solutions through creative exercises',
          'Students use design thinking to explore possibilities',
          'Groups combine ideas from different fields',
          'Learners prototype multiple approaches quickly',
          'Teams get feedback on initial concepts'
        ],
        'prototype': [
          'Students build working models of their solutions',
          'Teams create testable versions of their ideas',
          'Groups develop pilots to test with real users',
          'Learners iterate based on feedback',
          'Students refine their prototypes through testing'
        ],
        'evaluate': [
          'Teams present to authentic audiences for feedback',
          'Students reflect on their process and learning',
          'Groups measure the impact of their solutions',
          'Learners document lessons learned',
          'Teams plan next steps for implementation'
        ]
      },
      'DELIVERABLES': {
        'rubric': [
          'Clear criteria for both process and final product',
          'Multiple ways for students to demonstrate learning',
          'Authentic assessment aligned with real-world standards',
          'Opportunities for peer and self-assessment',
          'Growth-focused feedback throughout the project'
        ],
        'milestones': [
          'Research phase complete with findings documented',
          'Initial prototypes ready for testing',
          'Feedback incorporated and design refined',
          'Final presentation prepared with supporting materials',
          'Reflection portfolio demonstrating learning journey'
        ]
      }
    };
    
    // Get stage-specific suggestions
    const stageSuggestions = suggestions[currentStage]?.[currentStep || ''] || 
                             suggestions[currentStage]?.['default'] || 
                             [];
    
    // If we have user context, we could personalize further here
    if (userContext?.subject) {
      // Could add subject-specific variations in the future
    }
    
    return stageSuggestions;
  }, [currentStage, currentStep, userContext]);
  
  // Help content based on stage
  const getHelpContent = useCallback(() => {
    const helpContent: Record<string, any> = {
      'IDEATION': {
        title: 'Crafting Your Project Foundation',
        content: 'The Ideation stage establishes the conceptual framework for your Active Learning project.',
        sections: [
          {
            heading: 'Big Idea',
            description: 'A broad, enduring concept that has value beyond this specific project.',
            tips: [
              'Should connect to real-world relevance',
              'Transcends specific facts or skills',
              'Provides conceptual framework for learning'
            ],
            example: 'For an environmental science project: "Human actions have cascading effects on interconnected ecosystems"'
          },
          {
            heading: 'Essential Question',
            description: 'An open-ended question that drives inquiry and can\'t be answered with a simple fact.',
            tips: [
              'Provokes deep thinking and discussion',
              'Requires investigation and analysis',
              'Has multiple valid perspectives or answers'
            ],
            example: '"How can our community balance growth with environmental preservation?"'
          },
          {
            heading: 'Challenge',
            description: 'A real-world problem or task that students will address through the project.',
            tips: [
              'Authentic and meaningful to students',
              'Appropriately scoped for time and resources',
              'Allows for multiple solution approaches'
            ],
            example: '"Design and propose a green space that serves our school community\'s diverse needs"'
          }
        ]
      },
      'LEARNING_JOURNEY': {
        title: 'Designing the Creative Process Journey',
        content: 'Map out how YOUR STUDENTS will move through the four phases of creative problem-solving.',
        sections: [
          {
            heading: 'The 4-Phase Framework',
            description: 'Students experience the complete creative process:',
            tips: [
              'Analyze (25%): Deep understanding of the problem space',
              'Brainstorm (25%): Divergent thinking and idea generation',
              'Prototype (35%): Building and testing solutions',
              'Evaluate (15%): Reflection and improvement'
            ],
            example: 'Week 1: Research and analysis, Week 2: Ideation workshops, Weeks 3-4: Building prototypes, Week 5: Testing and refinement'
          },
          {
            heading: 'Student Agency',
            description: 'Students drive their own learning journey:',
            tips: [
              'Choice in how they approach each phase',
              'Ownership of their solution development',
              'Self-directed exploration within guidelines'
            ]
          }
        ]
      },
      'DELIVERABLES': {
        title: 'Defining Success and Assessment',
        content: 'Establish clear expectations and authentic assessment methods.',
        sections: [
          {
            heading: 'Assessment Philosophy',
            description: 'Balance process and product in evaluation:',
            tips: [
              'Value the journey as much as the destination',
              'Multiple opportunities to demonstrate learning',
              'Growth-focused rather than deficit-focused'
            ]
          },
          {
            heading: 'Rubric Design',
            description: 'Create clear, student-friendly criteria:',
            tips: [
              'Co-create rubrics with students when possible',
              'Include self and peer assessment components',
              'Align with real-world quality standards'
            ]
          },
          {
            heading: 'Milestone Planning',
            description: 'Structure progress checkpoints:',
            tips: [
              'Regular opportunities for feedback',
              'Celebration of incremental progress',
              'Flexibility to adjust based on needs'
            ]
          }
        ]
      }
    };
    
    return helpContent[currentStage] || { 
      title: 'ALF Coach Help', 
      content: 'Guidance for your Active Learning Framework project',
      sections: [] 
    };
  }, [currentStage]);
  
  const suggestions = generateSuggestions();
  const helpContent = getHelpContent();
  
  return (
    <>
      {/* Ideas Button - Shows when appropriate */}
      <AnimatePresence>
        {(inputValue.length === 0 || idleTime > 10000) && !isWaiting && !showHelp && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-6 h-6" />
            {/* Pulse indicator when idle */}
            {idleTime > 10000 && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Get Ideas
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Help Button - Always visible */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          setShowHelp(!showHelp);
          setShowSuggestions(false); // Close suggestions when opening help
        }}
        className="fixed bottom-24 right-20 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-6 h-6" />
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Get Help
        </span>
      </motion.button>
      
      {/* Suggestion Cards - Show below input when Ideas clicked or auto-triggered */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 left-1/2 transform -translate-x-1/2 z-40 max-w-4xl w-full px-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Ideas for {currentStep?.replace(/([A-Z])/g, ' $1').toLowerCase() || currentStage.toLowerCase()}
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SuggestionCards
                suggestions={suggestions.map((text, index) => ({
                  id: index.toString(),
                  text,
                  icon: '💡'
                }))}
                onSelect={(suggestion) => {
                  onSuggestionSelect(suggestion.text);
                  setShowSuggestions(false);
                }}
                variant="compact"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Help Panel - Slide in from right */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{helpContent.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{helpContent.content}</p>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {helpContent.sections && helpContent.sections.map((section: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-gray-900">{section.heading}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                    
                    {section.tips && section.tips.length > 0 && (
                      <ul className="space-y-2">
                        {section.tips.map((tip: string, tipIndex: number) => (
                          <li key={tipIndex} className="flex gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span className="text-sm text-gray-600">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {section.example && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <span className="font-medium">Example: </span>
                          {section.example}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Press ESC or click × to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UIGuidanceSystem;