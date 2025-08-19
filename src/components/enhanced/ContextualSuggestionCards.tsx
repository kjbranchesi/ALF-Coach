import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb,
  Target,
  Users,
  BookOpen,
  Zap,
  Globe,
  Heart,
  Brain,
  Compass,
  Palette,
  Microscope,
  Music,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SuggestionCard {
  id: string;
  title: string;
  description: string;
  category: 'bigIdea' | 'question' | 'challenge' | 'activity' | 'resource' | 'assessment';
  icon: React.ElementType;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  subject?: string[];
  ageGroup?: string[];
  example?: string;
}

interface ContextualSuggestionCardsProps {
  stage: 'ideation' | 'journey' | 'deliverables';
  step: number;
  subject: string;
  ageGroup: string;
  userType: 'new' | 'experienced' | 'expert';
  onSelectSuggestion: (suggestion: SuggestionCard) => void;
  onRequestMore?: () => void;
  isLoading?: boolean;
}

// Stage-specific suggestion configurations
const suggestionConfig = {
  ideation: {
    bigIdea: {
      title: 'Big Ideas to Explore',
      description: 'Fundamental concepts that connect to student lives',
      color: 'blue',
      suggestions: [
        {
          id: 'sustainability',
          title: 'Sustainability & Environmental Impact',
          description: 'How human actions affect our planet and future generations',
          category: 'bigIdea' as const,
          icon: Globe,
          complexity: 'intermediate' as const,
          subject: ['science', 'social studies', 'geography'],
          ageGroup: ['middle', 'high'],
          example: 'Students investigate local environmental challenges and design solutions'
        },
        {
          id: 'digital-citizenship',
          title: 'Digital Citizenship & Ethics',
          description: 'Responsible technology use and online communities',
          category: 'bigIdea' as const,
          icon: Brain,
          complexity: 'beginner' as const,
          subject: ['technology', 'social studies', 'english'],
          ageGroup: ['elementary', 'middle', 'high'],
          example: 'Create a campaign for positive online interactions'
        },
        {
          id: 'cultural-identity',
          title: 'Cultural Identity & Heritage',
          description: 'Understanding diverse perspectives and histories',
          category: 'bigIdea' as const,
          icon: Heart,
          complexity: 'intermediate' as const,
          subject: ['social studies', 'english', 'arts'],
          ageGroup: ['elementary', 'middle', 'high'],
          example: 'Document and share family stories and traditions'
        },
        {
          id: 'scientific-inquiry',
          title: 'Scientific Inquiry & Discovery',
          description: 'How we understand and explore the natural world',
          category: 'bigIdea' as const,
          icon: Microscope,
          complexity: 'advanced' as const,
          subject: ['science', 'math'],
          ageGroup: ['middle', 'high'],
          example: 'Design experiments to test local water quality'
        }
      ]
    },
    essentialQuestion: {
      title: 'Essential Questions',
      description: 'Open-ended questions that drive deep inquiry',
      color: 'purple',
      suggestions: [
        {
          id: 'change-agents',
          title: 'How might we become change agents in our community?',
          description: 'Focuses on student agency and local impact',
          category: 'question' as const,
          icon: Target,
          complexity: 'intermediate' as const,
          example: 'Leads to projects addressing local challenges'
        },
        {
          id: 'story-power',
          title: 'What makes a story powerful and memorable?',
          description: 'Explores narrative elements and emotional connection',
          category: 'question' as const,
          icon: BookOpen,
          complexity: 'beginner' as const,
          example: 'Students create multimedia stories about their community'
        },
        {
          id: 'technology-humanity',
          title: 'How does technology shape what it means to be human?',
          description: 'Examines technology\'s impact on society and relationships',
          category: 'question' as const,
          icon: Brain,
          complexity: 'advanced' as const,
          example: 'Explore AI ethics and human-computer interaction'
        }
      ]
    },
    challenge: {
      title: 'Real-World Challenges',
      description: 'Authentic problems students can meaningfully address',
      color: 'orange',
      suggestions: [
        {
          id: 'food-access',
          title: 'Food Access in Our Community',
          description: 'Address local food insecurity and nutrition access',
          category: 'challenge' as const,
          icon: Heart,
          complexity: 'intermediate' as const,
          example: 'Design a community garden or food distribution system'
        },
        {
          id: 'energy-efficiency',
          title: 'School Energy Efficiency',
          description: 'Reduce environmental impact and costs at school',
          category: 'challenge' as const,
          icon: Zap,
          complexity: 'advanced' as const,
          example: 'Audit energy use and propose sustainable solutions'
        },
        {
          id: 'youth-voice',
          title: 'Amplifying Youth Voice in Local Government',
          description: 'Increase young people\'s participation in civic processes',
          category: 'challenge' as const,
          icon: Users,
          complexity: 'advanced' as const,
          example: 'Create a youth advisory board or civic engagement campaign'
        }
      ]
    }
  },
  journey: {
    phases: {
      title: 'Learning Phase Structures',
      description: 'Progression frameworks from novice to expert',
      color: 'green',
      suggestions: [
        {
          id: 'design-thinking',
          title: 'Design Thinking Process',
          description: 'Empathize → Define → Ideate → Prototype → Test',
          category: 'activity' as const,
          icon: Compass,
          complexity: 'intermediate' as const,
          example: 'Students follow structured innovation process'
        },
        {
          id: 'scientific-method',
          title: 'Scientific Investigation',
          description: 'Question → Research → Hypothesis → Experiment → Analyze',
          category: 'activity' as const,
          icon: Microscope,
          complexity: 'intermediate' as const,
          example: 'Systematic approach to understanding phenomena'
        }
      ]
    }
  },
  deliverables: {
    assessment: {
      title: 'Authentic Assessment Ideas',
      description: 'Meaningful ways to evaluate student learning',
      color: 'indigo',
      suggestions: [
        {
          id: 'portfolio-presentation',
          title: 'Digital Portfolio with Reflection',
          description: 'Students curate work and reflect on growth',
          category: 'assessment' as const,
          icon: Palette,
          complexity: 'intermediate' as const,
          example: 'Website showcasing process and final products'
        },
        {
          id: 'community-presentation',
          title: 'Community Expert Panel',
          description: 'Present solutions to real community members',
          category: 'assessment' as const,
          icon: Users,
          complexity: 'advanced' as const,
          example: 'Pitch proposals to local government or business leaders'
        }
      ]
    }
  }
};

export function ContextualSuggestionCards({
  stage,
  step,
  subject,
  ageGroup,
  userType,
  onSelectSuggestion,
  onRequestMore,
  isLoading = false
}: ContextualSuggestionCardsProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get current step configuration
  const stepNames = {
    ideation: ['bigIdea', 'essentialQuestion', 'challenge'],
    journey: ['phases', 'activities', 'resources'],
    deliverables: ['milestones', 'finalProduct', 'assessment']
  };

  const currentStepName = stepNames[stage][step];
  const currentConfig = suggestionConfig[stage]?.[currentStepName as keyof typeof suggestionConfig[typeof stage]];

  if (!currentConfig) return null;

  // Filter suggestions based on user context
  const filterSuggestions = (suggestions: SuggestionCard[]) => {
    return suggestions.filter(suggestion => {
      // Filter by complexity for user type
      if (userType === 'new' && suggestion.complexity === 'advanced') return false;
      if (userType === 'expert' && suggestion.complexity === 'beginner') return false;
      
      // Filter by subject if specific subject provided
      if (suggestion.subject && !suggestion.subject.some(s => 
        s.toLowerCase().includes(subject.toLowerCase()) || 
        subject.toLowerCase().includes(s.toLowerCase())
      )) {
        // Only filter out if completely unrelated
        const isRelated = suggestion.subject.some(s => 
          ['interdisciplinary', 'general', 'all'].includes(s.toLowerCase())
        );
        if (!isRelated && suggestion.subject.length > 0) return false;
      }
      
      return true;
    });
  };

  const filteredSuggestions = currentConfig.suggestions ? filterSuggestions(currentConfig.suggestions) : [];

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const handleSelectSuggestion = (suggestion: SuggestionCard) => {
    onSelectSuggestion(suggestion);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className={`w-5 h-5 text-${currentConfig.color}-500`} />
            {currentConfig.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentConfig.description}
          </p>
        </div>
        
        {onRequestMore && (
          <button
            onClick={onRequestMore}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Get More Ideas
          </button>
        )}
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredSuggestions.map((suggestion, index) => {
            const SuggestionIcon = suggestion.icon;
            const isExpanded = expandedCards.has(suggestion.id);
            
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer
                  hover:shadow-md
                  ${currentConfig.color === 'blue' ? 'border-blue-200 hover:border-blue-400' :
                    currentConfig.color === 'purple' ? 'border-purple-200 hover:border-purple-400' :
                    currentConfig.color === 'orange' ? 'border-orange-200 hover:border-orange-400' :
                    currentConfig.color === 'green' ? 'border-green-200 hover:border-green-400' :
                    'border-indigo-200 hover:border-indigo-400'}
                `}
              >
                <div 
                  className="p-4"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${currentConfig.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        currentConfig.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        currentConfig.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                        currentConfig.color === 'green' ? 'bg-green-100 text-green-600' :
                        'bg-indigo-100 text-indigo-600'}
                    `}>
                      <SuggestionIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {suggestion.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {/* Complexity indicator */}
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${suggestion.complexity === 'beginner' ? 'bg-green-100 text-green-700' :
                              suggestion.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'}
                          `}>
                            {suggestion.complexity}
                          </span>
                          
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.description}
                      </p>
                      
                      {suggestion.example && (
                        <div className={`
                          text-xs p-2 rounded
                          ${currentConfig.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                            currentConfig.color === 'purple' ? 'bg-purple-50 text-purple-700' :
                            currentConfig.color === 'orange' ? 'bg-orange-50 text-orange-700' :
                            currentConfig.color === 'green' ? 'bg-green-50 text-green-700' :
                            'bg-indigo-50 text-indigo-700'}
                        `}>
                          <strong>Example:</strong> {suggestion.example}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredSuggestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm">
            No suggestions match your current context.
            {onRequestMore && (
              <button
                onClick={onRequestMore}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                Request custom ideas →
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Compact suggestion preview for expert users
export function CompactSuggestionPreview({
  stage,
  step,
  onSelectSuggestion
}: {
  stage: 'ideation' | 'journey' | 'deliverables';
  step: number;
  onSelectSuggestion: (suggestion: any) => void;
}) {
  // Show only top 3 most relevant suggestions
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[1, 2, 3].map(i => (
        <button
          key={i}
          onClick={() => onSelectSuggestion({ id: `quick-${i}` })}
          className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
        >
          Idea {i}
        </button>
      ))}
    </div>
  );
}