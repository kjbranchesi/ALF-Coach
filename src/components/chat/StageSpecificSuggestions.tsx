/**
 * StageSpecificSuggestions - Context-aware suggestion cards for each PBL stage
 * Shows relevant examples and ideas based on current stage and user context
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, HelpCircle, Map, Package } from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  description?: string;
}

interface StageSpecificSuggestionsProps {
  stage: string;
  context: {
    subject?: string;
    gradeLevel?: string;
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  };
  onSelectSuggestion: (suggestion: string) => void;
  isVisible: boolean;
}

export const StageSpecificSuggestions: React.FC<StageSpecificSuggestionsProps> = ({
  stage,
  context,
  onSelectSuggestion,
  isVisible
}) => {
  // Generate suggestions based on stage and context
  const getSuggestions = (): Suggestion[] => {
    const { subject, gradeLevel, bigIdea, essentialQuestion } = context;
    
    switch (stage) {
      case 'BIG_IDEA':
        if (subject?.toLowerCase().includes('science')) {
          return [
            { 
              id: '1', 
              text: 'Systems and interdependence shape our world',
              description: 'Explore how everything connects'
            },
            { 
              id: '2', 
              text: 'Change is constant and drives adaptation',
              description: 'Focus on transformation over time'
            },
            { 
              id: '3', 
              text: 'Energy flows through all living and non-living systems',
              description: 'Trace energy transformations'
            }
          ];
        } else if (subject?.toLowerCase().includes('history')) {
          return [
            { 
              id: '1', 
              text: 'Past events shape present realities',
              description: 'Connect history to today'
            },
            { 
              id: '2', 
              text: 'Multiple perspectives reveal complex truths',
              description: 'Explore different viewpoints'
            },
            { 
              id: '3', 
              text: 'Patterns in history help us understand the future',
              description: 'Find recurring themes'
            }
          ];
        } else if (subject?.toLowerCase().includes('math')) {
          return [
            { 
              id: '1', 
              text: 'Patterns and relationships govern mathematical thinking',
              description: 'See math in the world'
            },
            { 
              id: '2', 
              text: 'Problem-solving strategies apply across contexts',
              description: 'Build transferable skills'
            },
            { 
              id: '3', 
              text: 'Mathematical models help us understand reality',
              description: 'Connect abstract to concrete'
            }
          ];
        }
        // Default suggestions
        return [
          { 
            id: '1', 
            text: 'Understanding complex systems requires multiple perspectives',
            description: 'Interdisciplinary thinking'
          },
          { 
            id: '2', 
            text: 'Real-world problems require creative solutions',
            description: 'Innovation and creativity'
          },
          { 
            id: '3', 
            text: 'Learning happens through exploration and discovery',
            description: 'Student-driven inquiry'
          }
        ];

      case 'ESSENTIAL_QUESTION':
        if (bigIdea) {
          return [
            { 
              id: '1', 
              text: `How does ${bigIdea.toLowerCase()} affect our daily lives?`,
              description: 'Personal connection'
            },
            { 
              id: '2', 
              text: `What would happen if ${bigIdea.toLowerCase()} didn't exist?`,
              description: 'Hypothetical thinking'
            },
            { 
              id: '3', 
              text: `How can we use ${bigIdea.toLowerCase()} to solve real problems?`,
              description: 'Application focus'
            }
          ];
        }
        return [
          { 
            id: '1', 
            text: 'How can we make a positive impact on our community?',
            description: 'Community focus'
          },
          { 
            id: '2', 
            text: 'What does it mean to be a responsible citizen?',
            description: 'Civic engagement'
          },
          { 
            id: '3', 
            text: 'How do our choices affect others?',
            description: 'Ethical thinking'
          }
        ];

      case 'CHALLENGE':
        if (essentialQuestion) {
          return [
            { 
              id: '1', 
              text: 'Design a solution for our school community',
              description: 'Local, authentic context'
            },
            { 
              id: '2', 
              text: 'Create a resource to educate others',
              description: 'Teaching others deepens learning'
            },
            { 
              id: '3', 
              text: 'Develop a plan to address a real problem',
              description: 'Action-oriented outcome'
            }
          ];
        }
        return [
          { 
            id: '1', 
            text: 'Create a campaign to raise awareness',
            description: 'Communication focus'
          },
          { 
            id: '2', 
            text: 'Design an innovative solution prototype',
            description: 'Design thinking'
          },
          { 
            id: '3', 
            text: 'Organize a community action project',
            description: 'Service learning'
          }
        ];

      case 'JOURNEY':
        return [
          { 
            id: '1', 
            text: 'Research → Ideate → Build → Test',
            description: 'Classic design process'
          },
          { 
            id: '2', 
            text: 'Explore → Plan → Create → Share',
            description: 'Creative process'
          },
          { 
            id: '3', 
            text: 'Investigate → Design → Implement → Reflect',
            description: 'Scientific method'
          }
        ];

      case 'DELIVERABLES':
        return [
          { 
            id: '1', 
            text: 'Presentation + Prototype + Reflection',
            description: 'Multiple modalities'
          },
          { 
            id: '2', 
            text: 'Digital portfolio documenting the journey',
            description: 'Process-focused'
          },
          { 
            id: '3', 
            text: 'Community event showcasing solutions',
            description: 'Public presentation'
          }
        ];

      default:
        return [];
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'BIG_IDEA': return <Sparkles className="w-5 h-5" />;
      case 'ESSENTIAL_QUESTION': return <HelpCircle className="w-5 h-5" />;
      case 'CHALLENGE': return <Target className="w-5 h-5" />;
      case 'JOURNEY': return <Map className="w-5 h-5" />;
      case 'DELIVERABLES': return <Package className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const suggestions = getSuggestions();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            {getStageIcon()}
            <span className="font-medium">
              {stage === 'BIG_IDEA' ? 'Example Big Ideas' :
               stage === 'ESSENTIAL_QUESTION' ? 'Example Questions' :
               stage === 'CHALLENGE' ? 'Challenge Ideas' :
               stage === 'JOURNEY' ? 'Journey Structures' :
               'Suggestions'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectSuggestion(suggestion.text)}
                className="
                  text-left p-4 rounded-lg bg-white border border-gray-200
                  hover:border-blue-400 hover:shadow-md
                  transition-all duration-200 group
                "
              >
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                  {suggestion.text}
                </p>
                {suggestion.description && (
                  <p className="text-xs text-gray-500">
                    {suggestion.description}
                  </p>
                )}
                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2 inline-block">
                  Click to use →
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StageSpecificSuggestions;