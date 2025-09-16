/**
 * AssessmentAccommodationsPanel.tsx
 * 
 * Comprehensive assessment accommodations panel for the Deliverables stage
 * Implements UDL assessment principles with specific accommodations
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck,
  Clock,
  FileText,
  Mic,
  Video,
  Palette,
  Users,
  Settings,
  Eye,
  Ear,
  Hand,
  Brain,
  Heart,
  Globe,
  Accessibility,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  ArrowRight,
  Download,
  Share
} from 'lucide-react';
import { DifferentiationProfile } from '../../features/wizard/components/DifferentiationOptionsStep';

export interface AssessmentAccommodation {
  id: string;
  title: string;
  description: string;
  category: 'presentation' | 'response' | 'setting' | 'timing' | 'scheduling';
  udlPrinciple: 'representation' | 'engagement' | 'action_expression';
  targetNeeds: string[];
  implementation: string[];
  examples: string[];
  considerations: string[];
  requiredTools?: string[];
  alternativeOptions?: string[];
  legalBasis?: string[];
}

export interface AssessmentFormat {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  accommodations: string[];
  examples: string[];
  suitableFor: string[];
  considerations: string[];
}

interface AssessmentAccommodationsPanelProps {
  differentiationProfile: DifferentiationProfile;
  onAccommodationSelect: (accommodation: AssessmentAccommodation) => void;
  onFormatSelect: (format: AssessmentFormat) => void;
  selectedAccommodations: string[];
  selectedFormats: string[];
  className?: string;
}

const ACCOMMODATION_CATEGORIES = {
  presentation: {
    title: 'How Information is Presented',
    icon: Eye,
    color: 'blue',
    description: 'Accommodations for how assessment content is displayed'
  },
  response: {
    title: 'How Students Respond',
    icon: Hand, 
    color: 'purple',
    description: 'Accommodations for how students demonstrate knowledge'
  },
  setting: {
    title: 'Assessment Environment',
    icon: Settings,
    color: 'green',
    description: 'Environmental modifications for assessment'
  },
  timing: {
    title: 'Time and Pacing',
    icon: Clock,
    color: 'orange',
    description: 'Timing accommodations for assessment completion'
  },
  scheduling: {
    title: 'Scheduling Flexibility',
    icon: Calendar,
    color: 'indigo',
    description: 'When and how frequently assessments occur'
  }
};

const ASSESSMENT_FORMATS = {
  portfolio: {
    id: 'portfolio',
    name: 'Digital Portfolio Collection',
    description: 'Compilation of work samples showing growth over time',
    strengths: [
      'Shows learning progression',
      'Allows multiple submission types',
      'Encourages reflection',
      'Accommodates different learning styles'
    ],
    accommodations: [
      'Voice-recorded reflections',
      'Video explanations',
      'Visual documentation',
      'Collaborative entries'
    ],
    examples: [
      'Project development journal',
      'Research process documentation',
      'Prototype evolution showcase',
      'Reflection video library'
    ],
    suitableFor: [
      'Students who need time to develop ideas',
      'Visual and kinesthetic learners',
      'Students building confidence',
      'English language learners'
    ],
    considerations: [
      'Requires technology access',
      'Needs clear organization system',
      'May need scaffolding for reflection'
    ]
  },
  presentation: {
    id: 'presentation',
    name: 'Multi-Modal Presentation',
    description: 'Oral, visual, or digital presentation of learning',
    strengths: [
      'Leverages communication strengths',
      'Allows real-time clarification',
      'Engages multiple audiences',
      'Builds confidence'
    ],
    accommodations: [
      'Visual aid supports',
      'Partner presentations',
      'Pre-recorded options',
      'Note card permissions'
    ],
    examples: [
      'Solution pitch to community',
      'Teaching presentation to peers',
      'Video documentary creation',
      'Interactive demonstration'
    ],
    suitableFor: [
      'Verbal processors',
      'Students with presentation confidence',
      'Visual learners',
      'Students who benefit from audience interaction'
    ],
    considerations: [
      'May increase anxiety for some',
      'Requires presentation skills',
      'Needs appropriate audience'
    ]
  },
  performance: {
    id: 'performance',
    name: 'Authentic Performance Task',
    description: 'Real-world application demonstrating competency',
    strengths: [
      'Shows practical application',
      'Motivates through relevance',
      'Allows creative expression',
      'Builds 21st-century skills'
    ],
    accommodations: [
      'Team-based tasks',
      'Extended time frames',
      'Mentorship support',
      'Multiple checkpoint assessments'
    ],
    examples: [
      'Community problem-solving project',
      'Business plan development',
      'Policy proposal creation',
      'Social action campaign'
    ],
    suitableFor: [
      'Hands-on learners',
      'Students motivated by real-world impact',
      'Creative thinkers',
      'Students with strong practical skills'
    ],
    considerations: [
      'Requires authentic contexts',
      'May need community partnerships',
      'Complex logistics'
    ]
  },
  written: {
    id: 'written',
    name: 'Adapted Written Assessment',
    description: 'Modified traditional written formats with accommodations',
    strengths: [
      'Familiar format for many',
      'Allows detailed expression',
      'Easy to document and share',
      'Supports reflective thinking'
    ],
    accommodations: [
      'Graphic organizer templates',
      'Word banks and vocabulary supports',
      'Speech-to-text technology',
      'Extended time allowances'
    ],
    examples: [
      'Research report with visual aids',
      'Reflective journal with prompts',
      'Policy brief with infographics',
      'Case study analysis'
    ],
    suitableFor: [
      'Strong writers',
      'Students who process through writing',
      'Detail-oriented learners',
      'Students comfortable with traditional formats'
    ],
    considerations: [
      'May disadvantage some learners',
      'Requires strong literacy skills',
      'Needs accommodation awareness'
    ]
  },
  creative: {
    id: 'creative',
    name: 'Creative Expression Format',
    description: 'Artistic, musical, or multimedia demonstration of learning',
    strengths: [
      'Engages multiple intelligences',
      'Allows unique expression',
      'Motivates creative learners',
      'Appeals to diverse audiences'
    ],
    accommodations: [
      'Technology tool options',
      'Collaborative creation',
      'Process documentation',
      'Artist statement explanations'
    ],
    examples: [
      'Documentary film creation',
      'Infographic design series',
      'Musical composition with lyrics',
      'Art installation with explanation'
    ],
    suitableFor: [
      'Artistic and creative learners',
      'Visual and spatial processors',
      'Students with creative confidence',
      'Multi-modal thinkers'
    ],
    considerations: [
      'May need artistic skill development',
      'Requires creative tool access',
      'Needs clear rubric criteria'
    ]
  }
};

export const AssessmentAccommodationsPanel: React.FC<AssessmentAccommodationsPanelProps> = ({
  differentiationProfile,
  onAccommodationSelect,
  onFormatSelect,
  selectedAccommodations,
  selectedFormats,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'accommodations' | 'formats'>('accommodations');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

  // Generate accommodations based on profile
  const availableAccommodations = useMemo(() => {
    return generateAccommodationsFromProfile(differentiationProfile);
  }, [differentiationProfile]);

  // Get recommended formats based on profile
  const recommendedFormats = useMemo(() => {
    return getRecommendedFormats(differentiationProfile);
  }, [differentiationProfile]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Assessment Accommodations & Formats
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Choose accommodations and formats that enable all students to demonstrate their learning
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'accommodations'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            Accommodations ({availableAccommodations.length})
          </button>
          <button
            onClick={() => setActiveTab('formats')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'formats'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            Assessment Formats ({recommendedFormats.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'accommodations' && (
          <AccommodationsTab
            accommodations={availableAccommodations}
            selectedAccommodations={selectedAccommodations}
            onAccommodationSelect={onAccommodationSelect}
            expandedCategory={expandedCategory}
            onCategoryToggle={setExpandedCategory}
          />
        )}

        {activeTab === 'formats' && (
          <FormatsTab
            formats={recommendedFormats}
            selectedFormats={selectedFormats}
            onFormatSelect={onFormatSelect}
            expandedFormat={expandedFormat}
            onFormatToggle={setExpandedFormat}
          />
        )}
      </div>
    </div>
  );
};

interface AccommodationsTabProps {
  accommodations: AssessmentAccommodation[];
  selectedAccommodations: string[];
  onAccommodationSelect: (accommodation: AssessmentAccommodation) => void;
  expandedCategory: string | null;
  onCategoryToggle: (category: string | null) => void;
}

const AccommodationsTab: React.FC<AccommodationsTabProps> = ({
  accommodations,
  selectedAccommodations,
  onAccommodationSelect,
  expandedCategory,
  onCategoryToggle
}) => {
  // Group accommodations by category
  const accommodationsByCategory = useMemo(() => {
    const grouped: Record<string, AssessmentAccommodation[]> = {};
    accommodations.forEach(acc => {
      if (!grouped[acc.category]) {
        grouped[acc.category] = [];
      }
      grouped[acc.category].push(acc);
    });
    return grouped;
  }, [accommodations]);

  return (
    <div className="space-y-4">
      {Object.entries(accommodationsByCategory).map(([category, categoryAccommodations]) => {
        const categoryInfo = ACCOMMODATION_CATEGORIES[category as keyof typeof ACCOMMODATION_CATEGORIES];
        const IconComponent = categoryInfo.icon;
        const isExpanded = expandedCategory === category;
        const selectedCount = categoryAccommodations.filter(acc => 
          selectedAccommodations.includes(acc.id)
        ).length;

        return (
          <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => onCategoryToggle(isExpanded ? null : category)}
              className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 text-${categoryInfo.color}-500`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {categoryInfo.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categoryInfo.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                      {selectedCount} selected
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {categoryAccommodations.length} available
                  </span>
                  {isExpanded ? (
                    <Minus className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
                    {categoryAccommodations.map((accommodation) => (
                      <AccommodationCard
                        key={accommodation.id}
                        accommodation={accommodation}
                        isSelected={selectedAccommodations.includes(accommodation.id)}
                        onSelect={() => onAccommodationSelect(accommodation)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

interface FormatsTabProps {
  formats: AssessmentFormat[];
  selectedFormats: string[];
  onFormatSelect: (format: AssessmentFormat) => void;
  expandedFormat: string | null;
  onFormatToggle: (formatId: string | null) => void;
}

const FormatsTab: React.FC<FormatsTabProps> = ({
  formats,
  selectedFormats,
  onFormatSelect,
  expandedFormat,
  onFormatToggle
}) => {
  return (
    <div className="space-y-4">
      {formats.map((format) => {
        const isSelected = selectedFormats.includes(format.id);
        const isExpanded = expandedFormat === format.id;

        return (
          <div
            key={format.id}
            className={`
              border rounded-lg transition-all duration-200
              ${isSelected 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => onFormatSelect(format)}
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${isSelected 
                          ? 'bg-primary-500 border-primary-500' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </button>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {format.name}
                    </h3>
                    {format.suitableFor.some(learner => 
                      checkIfSuitableForProfile(learner, format.id)
                    ) && (
                      <Star className="w-4 h-4 text-yellow-500" title="Recommended for your students" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {format.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {format.strengths.slice(0, 3).map((strength, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                      >
                        {strength}
                      </span>
                    ))}
                    {format.strengths.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{format.strengths.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => onFormatToggle(isExpanded ? null : format.id)}
                  className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {isExpanded ? (
                    <Minus className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <FormatDetails format={format} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Component implementations continue...
const AccommodationCard: React.FC<{
  accommodation: AssessmentAccommodation;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ accommodation, isSelected, onSelect }) => {
  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
          ${isSelected 
            ? 'bg-primary-500 border-primary-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}>
          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {accommodation.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {accommodation.description}
          </p>
          {accommodation.examples.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {accommodation.examples.slice(0, 2).map((example, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded"
                >
                  {example}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormatDetails: React.FC<{ format: AssessmentFormat }> = ({ format }) => {
  return (
    <div className="space-y-4">
      {/* Examples */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Examples:</h4>
        <ul className="space-y-1">
          {format.examples.map((example, index) => (
            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-gray-400" />
              {example}
            </li>
          ))}
        </ul>
      </div>

      {/* Accommodations */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Available Accommodations:</h4>
        <div className="flex flex-wrap gap-2">
          {format.accommodations.map((accommodation, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
            >
              {accommodation}
            </span>
          ))}
        </div>
      </div>

      {/* Considerations */}
      {format.considerations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Considerations:</h4>
          <ul className="space-y-1">
            {format.considerations.map((consideration, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <AlertCircle className="w-3 h-3 mt-1 flex-shrink-0 text-yellow-500" />
                {consideration}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper functions
function generateAccommodationsFromProfile(profile: DifferentiationProfile): AssessmentAccommodation[] {
  const accommodations: AssessmentAccommodation[] = [];

  // Add accommodations based on representation needs
  if (profile.representation.visualSupports) {
    accommodations.push({
      id: 'visual-assessment-supports',
      title: 'Visual Assessment Supports',
      description: 'Provide visual aids, graphic organizers, and image-based instructions',
      category: 'presentation',
      udlPrinciple: 'representation',
      targetNeeds: ['visualSupports'],
      implementation: [
        'Include diagrams and charts in assessments',
        'Provide visual rubrics with examples',
        'Use graphic organizers for response planning'
      ],
      examples: [
        'Visual rubric with image examples',
        'Concept maps for organizing responses',
        'Diagram-based question formats'
      ],
      considerations: [
        'Ensure visuals support, not distract from content',
        'Provide alt text for digital accessibility'
      ]
    });
  }

  if (profile.actionExpression.alternativeFormats) {
    accommodations.push({
      id: 'response-format-options',
      title: 'Multiple Response Format Options', 
      description: 'Allow students to demonstrate knowledge through various modalities',
      category: 'response',
      udlPrinciple: 'action_expression',
      targetNeeds: ['alternativeFormats'],
      implementation: [
        'Offer video, audio, written, and visual response options',
        'Provide clear criteria for each format type',
        'Train students in unfamiliar formats'
      ],
      examples: [
        'Video explanation vs. written essay',
        'Infographic vs. traditional report',
        'Oral presentation vs. written test'
      ],
      considerations: [
        'Ensure format choice doesn\'t compromise assessment validity',
        'Provide support for technical requirements'
      ]
    });
  }

  if (profile.actionExpression.flexiblePacing) {
    accommodations.push({
      id: 'flexible-timing',
      title: 'Flexible Timing and Pacing',
      description: 'Provide extended time and flexible scheduling options',
      category: 'timing',
      udlPrinciple: 'action_expression',
      targetNeeds: ['flexiblePacing'],
      implementation: [
        'Offer 1.5x or 2x standard time allowances',
        'Provide multiple testing sessions',
        'Allow take-home completion options'
      ],
      examples: [
        'Extended time for processing',
        'Multiple submission deadlines',
        'Self-paced progression through assessment'
      ],
      considerations: [
        'Maintain assessment security',
        'Ensure fairness across all students'
      ]
    });
  }

  // Add more accommodations based on other profile needs...

  return accommodations;
}

function getRecommendedFormats(profile: DifferentiationProfile): AssessmentFormat[] {
  const allFormats = Object.values(ASSESSMENT_FORMATS);
  
  // Filter and prioritize based on profile
  return allFormats.filter(format => {
    // Add logic to determine which formats are most suitable
    return true; // For now, return all formats
  });
}

function checkIfSuitableForProfile(learnerType: string, formatId: string): boolean {
  // Add logic to check if format is suitable for specific learner types
  return false; // Placeholder
}

export default AssessmentAccommodationsPanel;