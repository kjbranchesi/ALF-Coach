/**
 * DifferentiationOptionsStep.tsx
 * 
 * UDL-based differentiation options for teachers to specify learner needs upfront
 * Addresses Multiple Means of Representation, Engagement, and Action/Expression
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  Ear, 
  Hand, 
  Brain,
  Heart,
  Globe,
  Accessibility,
  BookOpen,
  MessageCircle,
  Lightbulb,
  Target,
  Zap,
  Settings
} from 'lucide-react';
import { EnhancedButton } from '../../../components/ui/EnhancedButton';

export interface DifferentiationProfile {
  // Multiple Means of Representation needs
  representation: {
    visualSupports: boolean;
    auditorySupports: boolean;
    tactileSupports: boolean;
    multilingualSupports: boolean;
    readingLevelVariations: boolean;
    symbolsAndGraphics: boolean;
  };
  
  // Multiple Means of Engagement needs  
  engagement: {
    interestBasedChoices: boolean;
    culturalConnections: boolean;
    relevanceToLife: boolean;
    collaborativeOptions: boolean;
    selfDirectedLearning: boolean;
    gamificationElements: boolean;
  };
  
  // Multiple Means of Action/Expression needs
  actionExpression: {
    alternativeFormats: boolean;
    assistiveTechnology: boolean;
    flexiblePacing: boolean;
    multipleProductOptions: boolean;
    scaffoldedSupport: boolean;
    peerCollaboration: boolean;
  };
  
  // Specific learner considerations
  learnerConsiderations: {
    englishLanguageLearners: boolean;
    studentsWithDisabilities: boolean;
    giftedLearners: boolean;
    executiveFunctionSupport: boolean;
    socialEmotionalNeeds: boolean;
    sensoryConsiderations: boolean;
  };
  
  // Additional context
  additionalNotes: string;
  classSize: string;
  experienceLevel: 'new_to_udl' | 'some_experience' | 'experienced';
}

interface DifferentiationOptionsStepProps {
  onComplete: (profile: DifferentiationProfile) => void;
  onSkip: () => void;
  initialData?: Partial<DifferentiationProfile>;
}

// UDL Principle Categories with friendly descriptions
const UDL_CATEGORIES = {
  representation: {
    title: "How Students Access Information",
    subtitle: "Multiple ways to present content (the 'what' of learning)",
    icon: Eye,
    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    description: "Ensure all learners can perceive and comprehend information"
  },
  engagement: {
    title: "What Motivates Students",
    subtitle: "Multiple ways to engage and motivate (the 'why' of learning)",
    icon: Heart,
    color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    description: "Tap into learners' interests, offer appropriate challenges"
  },
  actionExpression: {
    title: "How Students Show Learning",
    subtitle: "Multiple ways to demonstrate knowledge (the 'how' of learning)",
    icon: Hand,
    color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    description: "Provide options for students to express what they know"
  }
};

const REPRESENTATION_OPTIONS = [
  { 
    key: 'visualSupports', 
    label: 'Visual supports needed', 
    description: 'Images, diagrams, graphic organizers, visual schedules',
    examples: ['Concept maps', 'Infographics', 'Photo instructions']
  },
  { 
    key: 'auditorySupports', 
    label: 'Audio supports needed', 
    description: 'Read-aloud, audio recordings, verbal instructions',
    examples: ['Text-to-speech', 'Audio books', 'Verbal processing time']
  },
  { 
    key: 'tactileSupports', 
    label: 'Hands-on supports needed', 
    description: 'Manipulatives, movement, kinesthetic activities',
    examples: ['Physical models', 'Building activities', 'Movement breaks']
  },
  { 
    key: 'multilingualSupports', 
    label: 'Multilingual supports needed', 
    description: 'Translation, native language resources, visual vocabulary',
    examples: ['Bilingual materials', 'Visual dictionaries', 'Peer translators']
  },
  { 
    key: 'readingLevelVariations', 
    label: 'Multiple reading levels needed', 
    description: 'Text complexity variations, simplified language options',
    examples: ['Leveled texts', 'Summary sheets', 'Highlighted key terms']
  },
  { 
    key: 'symbolsAndGraphics', 
    label: 'Symbols and graphics needed', 
    description: 'Icon supports, picture communication, visual cues',
    examples: ['Picture symbols', 'Icon schedules', 'Visual step guides']
  }
];

const ENGAGEMENT_OPTIONS = [
  { 
    key: 'interestBasedChoices', 
    label: 'Student choice in topics/activities', 
    description: 'Options based on student interests and preferences',
    examples: ['Topic menus', 'Interest surveys', 'Student-led projects']
  },
  { 
    key: 'culturalConnections', 
    label: 'Cultural connections important', 
    description: 'Connect to students\' cultural backgrounds and experiences',
    examples: ['Family traditions', 'Community connections', 'Cultural examples']
  },
  { 
    key: 'relevanceToLife', 
    label: 'Real-world relevance needed', 
    description: 'Connect learning to students\' lives and future goals',
    examples: ['Career connections', 'Local issues', 'Personal applications']
  },
  { 
    key: 'collaborativeOptions', 
    label: 'Collaboration opportunities', 
    description: 'Peer interaction, group work, social learning',
    examples: ['Think-pair-share', 'Group projects', 'Peer mentoring']
  },
  { 
    key: 'selfDirectedLearning', 
    label: 'Student agency and autonomy', 
    description: 'Self-paced options, goal setting, reflection',
    examples: ['Learning contracts', 'Self-assessment', 'Goal tracking']
  },
  { 
    key: 'gamificationElements', 
    label: 'Game-like elements helpful', 
    description: 'Points, badges, challenges, friendly competition',
    examples: ['Learning badges', 'Progress bars', 'Team challenges']
  }
];

const ACTION_EXPRESSION_OPTIONS = [
  { 
    key: 'alternativeFormats', 
    label: 'Alternative response formats', 
    description: 'Multiple ways to show understanding beyond writing',
    examples: ['Oral presentations', 'Visual displays', 'Digital creation']
  },
  { 
    key: 'assistiveTechnology', 
    label: 'Assistive technology needed', 
    description: 'Tools to support communication and expression',
    examples: ['Speech-to-text', 'Communication devices', 'Writing supports']
  },
  { 
    key: 'flexiblePacing', 
    label: 'Flexible timing and pacing', 
    description: 'Extended time, breaks, self-paced options',
    examples: ['Extended time', 'Flexible deadlines', 'Break schedules']
  },
  { 
    key: 'multipleProductOptions', 
    label: 'Multiple product choices', 
    description: 'Various ways to create and share final products',
    examples: ['Video projects', 'Artistic expression', 'Digital portfolios']
  },
  { 
    key: 'scaffoldedSupport', 
    label: 'Scaffolded support structures', 
    description: 'Step-by-step guidance, templates, checklists',
    examples: ['Project templates', 'Process guides', 'Checklists']
  },
  { 
    key: 'peerCollaboration', 
    label: 'Peer support and collaboration', 
    description: 'Partner work, peer feedback, group support',
    examples: ['Peer editing', 'Buddy systems', 'Group feedback']
  }
];

const LEARNER_CONSIDERATIONS = [
  { 
    key: 'englishLanguageLearners', 
    label: 'English Language Learners (ELL)', 
    description: 'Students developing English proficiency',
    supports: ['Visual supports', 'Native language resources', 'Extended processing time']
  },
  { 
    key: 'studentsWithDisabilities', 
    label: 'Students with Disabilities', 
    description: 'Students with IEPs, 504 plans, or learning differences',
    supports: ['Accommodations', 'Assistive technology', 'Individualized supports']
  },
  { 
    key: 'giftedLearners', 
    label: 'Gifted and Advanced Learners', 
    description: 'Students needing enrichment and challenge',
    supports: ['Extension activities', 'Independent projects', 'Acceleration options']
  },
  { 
    key: 'executiveFunctionSupport', 
    label: 'Executive Function Support', 
    description: 'Students needing help with organization and planning',
    supports: ['Visual schedules', 'Organizational tools', 'Step-by-step guidance']
  },
  { 
    key: 'socialEmotionalNeeds', 
    label: 'Social-Emotional Learning Support', 
    description: 'Students developing social and emotional skills',
    supports: ['Emotional regulation tools', 'Social skills practice', 'Mindfulness']
  },
  { 
    key: 'sensoryConsiderations', 
    label: 'Sensory Processing Considerations', 
    description: 'Students with sensory sensitivities or needs',
    supports: ['Sensory breaks', 'Environmental modifications', 'Sensory tools']
  }
];

export const DifferentiationOptionsStep: React.FC<DifferentiationOptionsStepProps> = ({
  onComplete,
  onSkip,
  initialData
}) => {
  const [profile, setProfile] = useState<DifferentiationProfile>({
    representation: {
      visualSupports: false,
      auditorySupports: false,
      tactileSupports: false,
      multilingualSupports: false,
      readingLevelVariations: false,
      symbolsAndGraphics: false,
    },
    engagement: {
      interestBasedChoices: false,
      culturalConnections: false,
      relevanceToLife: false,
      collaborativeOptions: false,
      selfDirectedLearning: false,
      gamificationElements: false,
    },
    actionExpression: {
      alternativeFormats: false,
      assistiveTechnology: false,
      flexiblePacing: false,
      multipleProductOptions: false,
      scaffoldedSupport: false,
      peerCollaboration: false,
    },
    learnerConsiderations: {
      englishLanguageLearners: false,
      studentsWithDisabilities: false,
      giftedLearners: false,
      executiveFunctionSupport: false,
      socialEmotionalNeeds: false,
      sensoryConsiderations: false,
    },
    additionalNotes: '',
    classSize: '',
    experienceLevel: 'some_experience',
    ...initialData
  });

  const [currentSection, setCurrentSection] = useState<'representation' | 'engagement' | 'actionExpression' | 'considerations' | 'summary'>('representation');
  const [showExamples, setShowExamples] = useState<string | null>(null);

  const updateProfile = useCallback((section: keyof DifferentiationProfile, updates: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], ...updates }
        : updates
    }));
  }, []);

  const handleNext = useCallback(() => {
    const sections = ['representation', 'engagement', 'actionExpression', 'considerations', 'summary'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1] as any);
    } else {
      onComplete(profile);
    }
  }, [currentSection, profile, onComplete]);

  const handleBack = useCallback(() => {
    const sections = ['representation', 'engagement', 'actionExpression', 'considerations', 'summary'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1] as any);
    }
  }, [currentSection]);

  const getSelectedCount = (section: keyof DifferentiationProfile) => {
    if (section === 'additionalNotes' || section === 'classSize' || section === 'experienceLevel') return 0;
    return Object.values(profile[section] as any).filter(Boolean).length;
  };

  const renderOptionCard = (option: any, section: keyof DifferentiationProfile, categoryKey: string) => {
    const isSelected = (profile[section] as any)[option.key];
    
    return (
      <motion.div
        key={option.key}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
        `}
        onClick={() => updateProfile(section, { [option.key]: !isSelected })}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center
                ${isSelected 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-sm"
                  />
                )}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {option.description}
            </p>
            
            {option.examples && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExamples(showExamples === option.key ? null : option.key);
                }}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                {showExamples === option.key ? 'Hide' : 'Show'} examples
              </button>
            )}
          </div>
        </div>
        
        {showExamples === option.key && option.examples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-1">
              {option.examples.map((example: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded"
                >
                  {example}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Universal Design for Learning Options
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Help us create an inclusive learning experience for all your students
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Skip for now
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(UDL_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = currentSection === key;
            const count = getSelectedCount(key as keyof DifferentiationProfile);
            
            return (
              <button
                key={key}
                onClick={() => setCurrentSection(key as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.title}</span>
                {count > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentSection('considerations')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${currentSection === 'considerations' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Learner Types</span>
            {getSelectedCount('learnerConsiderations') > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {getSelectedCount('learnerConsiderations')}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setCurrentSection('summary')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${currentSection === 'summary' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Summary</span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* Representation Section */}
        {currentSection === 'representation' && (
          <motion.div
            key="representation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-xl border-2 ${UDL_CATEGORIES.representation.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <UDL_CATEGORIES.representation.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {UDL_CATEGORIES.representation.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {UDL_CATEGORIES.representation.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {REPRESENTATION_OPTIONS.map((option) => 
                renderOptionCard(option, 'representation', 'representation')
              )}
            </div>
          </motion.div>
        )}

        {/* Engagement Section */}
        {currentSection === 'engagement' && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-xl border-2 ${UDL_CATEGORIES.engagement.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <UDL_CATEGORIES.engagement.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {UDL_CATEGORIES.engagement.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {UDL_CATEGORIES.engagement.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ENGAGEMENT_OPTIONS.map((option) => 
                renderOptionCard(option, 'engagement', 'engagement')
              )}
            </div>
          </motion.div>
        )}

        {/* Action/Expression Section */}
        {currentSection === 'actionExpression' && (
          <motion.div
            key="actionExpression"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-xl border-2 ${UDL_CATEGORIES.actionExpression.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <UDL_CATEGORIES.actionExpression.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {UDL_CATEGORIES.actionExpression.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {UDL_CATEGORIES.actionExpression.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ACTION_EXPRESSION_OPTIONS.map((option) => 
                renderOptionCard(option, 'actionExpression', 'actionExpression')
              )}
            </div>
          </motion.div>
        )}

        {/* Learner Considerations Section */}
        {currentSection === 'considerations' && (
          <motion.div
            key="considerations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl border-2 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Specific Learner Populations
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select learner types that require additional considerations
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {LEARNER_CONSIDERATIONS.map((consideration) => {
                const isSelected = profile.learnerConsiderations[consideration.key as keyof typeof profile.learnerConsiderations];
                
                return (
                  <motion.div
                    key={consideration.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => updateProfile('learnerConsiderations', { 
                      [consideration.key]: !isSelected 
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center mt-1
                        ${isSelected 
                          ? 'bg-primary-500 border-primary-500' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-sm"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {consideration.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {consideration.description}
                        </p>
                        
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Common supports:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {consideration.supports.map((support: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                                >
                                  {support}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Summary Section */}
        {currentSection === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Summary & Additional Information
              </h2>
              
              <div className="space-y-6">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your UDL experience level
                  </label>
                  <div className="flex gap-3">
                    {[
                      { key: 'new_to_udl', label: 'New to UDL' },
                      { key: 'some_experience', label: 'Some experience' },
                      { key: 'experienced', label: 'Experienced' }
                    ].map((level) => (
                      <button
                        key={level.key}
                        onClick={() => updateProfile('experienceLevel', level.key)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${profile.experienceLevel === level.key
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Approximate class size (optional)
                  </label>
                  <input
                    type="text"
                    value={profile.classSize}
                    onChange={(e) => updateProfile('classSize', e.target.value)}
                    placeholder="e.g., 25 students, 15-20 students, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional notes or specific needs (optional)
                  </label>
                  <textarea
                    value={profile.additionalNotes}
                    onChange={(e) => updateProfile('additionalNotes', e.target.value)}
                    placeholder="Any other specific considerations, accommodations, or needs for your students..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>

                {/* Selected Options Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    Your Selected Options Summary:
                  </h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    {Object.entries(UDL_CATEGORIES).map(([key, category]) => {
                      const count = getSelectedCount(key as keyof DifferentiationProfile);
                      return (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{category.title}:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            {count} selected
                          </span>
                        </div>
                      );
                    })}
                    <div className="text-sm">
                      <span className="font-medium">Learner Types:</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        {getSelectedCount('learnerConsiderations')} selected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          {currentSection !== 'representation' && (
            <EnhancedButton
              variant="outline"
              onClick={handleBack}
            >
              Back
            </EnhancedButton>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Skip for now
          </button>
          
          <EnhancedButton
            variant="filled"
            onClick={handleNext}
            rightIcon={currentSection === 'summary' ? <Target className="w-4 h-4" /> : undefined}
          >
            {currentSection === 'summary' ? 'Complete Setup' : 'Next'}
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
};