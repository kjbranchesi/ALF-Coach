/**
 * PhaseBuilder.tsx
 * 
 * AI-powered phase builder with templates and suggestions
 * Part of Sprint 2: Enhanced phase building capabilities
 * 
 * FEATURES:
 * - Template library for common project types
 * - AI-powered activity suggestions
 * - Bulk operations for efficient setup
 * - Grade-level appropriate content
 * - Standards alignment suggestions
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Layers,
  Filter,
  Search,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Target,
  Users,
  FileText,
  Settings,
  X,
  Plus,
  Library,
  Brain
} from 'lucide-react';
import { 
  PhaseType, 
  GradeLevel, 
  PhaseObjective, 
  PhaseActivity, 
  PhaseDeliverable,
  CreativePhase 
} from '../types';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  gradeLevel: GradeLevel[];
  subjects: string[];
  phases: {
    [key in PhaseType]: {
      objectives: string[];
      activities: Omit<PhaseActivity, 'id'>[];
      deliverables: Omit<PhaseDeliverable, 'id'>[];
    };
  };
}

interface PhaseBuilderProps {
  currentPhase: PhaseType;
  gradeLevel: GradeLevel;
  subject: string;
  existingPhases: CreativePhase[];
  onApplyTemplate: (template: Template) => void;
  onAddSuggestion: (
    phaseType: PhaseType,
    type: 'objective' | 'activity' | 'deliverable',
    content: any
  ) => void;
  onBulkAdd: (
    phaseType: PhaseType,
    items: {
      objectives?: PhaseObjective[];
      activities?: PhaseActivity[];
      deliverables?: PhaseDeliverable[];
    }
  ) => void;
}

// Template library
const TEMPLATES: Template[] = [
  {
    id: 'stem-investigation',
    name: 'STEM Investigation',
    description: 'Scientific inquiry and engineering design process',
    category: 'Science & Engineering',
    icon: Brain,
    gradeLevel: ['middle', 'high'],
    subjects: ['Science', 'Engineering', 'Technology'],
    phases: {
      ANALYZE: {
        objectives: [
          'Identify and define the problem or phenomenon',
          'Research existing solutions and scientific principles',
          'Develop testable hypotheses'
        ],
        activities: [
          {
            name: 'Problem Analysis',
            description: 'Break down the problem into manageable components',
            duration: '2 class periods',
            resources: ['Research materials', 'Scientific journals'],
            studentChoice: false
          },
          {
            name: 'Literature Review',
            description: 'Research existing solutions and theories',
            duration: '3 class periods',
            resources: ['Online databases', 'Library resources'],
            studentChoice: true
          }
        ],
        deliverables: [
          {
            name: 'Problem Statement',
            format: 'Written document',
            assessmentCriteria: ['Clarity', 'Scientific accuracy', 'Completeness']
          }
        ]
      },
      BRAINSTORM: {
        objectives: [
          'Generate multiple solution approaches',
          'Apply scientific principles creatively',
          'Evaluate feasibility of ideas'
        ],
        activities: [
          {
            name: 'Solution Ideation',
            description: 'Generate and sketch multiple solution concepts',
            duration: '2 class periods',
            resources: ['Sketching materials', 'Collaboration tools'],
            studentChoice: false
          },
          {
            name: 'Feasibility Analysis',
            description: 'Evaluate ideas based on scientific principles',
            duration: '1 class period',
            resources: ['Evaluation rubric', 'Reference materials'],
            studentChoice: false
          }
        ],
        deliverables: [
          {
            name: 'Solution Concepts',
            format: 'Visual presentation',
            assessmentCriteria: ['Creativity', 'Scientific basis', 'Feasibility']
          }
        ]
      },
      PROTOTYPE: {
        objectives: [
          'Build and test solution prototypes',
          'Collect and analyze data',
          'Iterate based on test results'
        ],
        activities: [
          {
            name: 'Prototype Construction',
            description: 'Build physical or digital prototypes',
            duration: '4 class periods',
            resources: ['Materials', 'Tools', 'Software'],
            studentChoice: false
          },
          {
            name: 'Testing & Data Collection',
            description: 'Conduct controlled experiments and gather data',
            duration: '3 class periods',
            resources: ['Testing equipment', 'Data sheets'],
            studentChoice: false
          },
          {
            name: 'Data Analysis',
            description: 'Analyze results and identify improvements',
            duration: '2 class periods',
            resources: ['Analysis software', 'Graphing tools'],
            studentChoice: true
          }
        ],
        deliverables: [
          {
            name: 'Working Prototype',
            format: 'Physical or digital model',
            assessmentCriteria: ['Functionality', 'Design quality', 'Innovation']
          },
          {
            name: 'Test Results',
            format: 'Data report',
            assessmentCriteria: ['Accuracy', 'Analysis depth', 'Conclusions']
          }
        ]
      },
      EVALUATE: {
        objectives: [
          'Evaluate solution effectiveness',
          'Reflect on the design process',
          'Communicate findings professionally'
        ],
        activities: [
          {
            name: 'Solution Evaluation',
            description: 'Assess how well the solution meets criteria',
            duration: '1 class period',
            resources: ['Evaluation rubric', 'Peer review forms'],
            studentChoice: false
          },
          {
            name: 'Presentation Preparation',
            description: 'Prepare professional presentation of findings',
            duration: '2 class periods',
            resources: ['Presentation software', 'Visual aids'],
            studentChoice: true
          }
        ],
        deliverables: [
          {
            name: 'Final Presentation',
            format: 'Oral presentation with visuals',
            assessmentCriteria: ['Communication', 'Technical accuracy', 'Professionalism']
          },
          {
            name: 'Reflection Document',
            format: 'Written reflection',
            assessmentCriteria: ['Depth of reflection', 'Learning insights', 'Future applications']
          }
        ]
      }
    }
  },
  {
    id: 'creative-arts',
    name: 'Creative Arts Project',
    description: 'Artistic exploration and creative expression',
    category: 'Arts & Humanities',
    icon: Library,
    gradeLevel: ['elementary', 'middle', 'high'],
    subjects: ['Visual Arts', 'Music', 'Drama', 'Creative Writing'],
    phases: {
      ANALYZE: {
        objectives: [
          'Explore artistic themes and inspirations',
          'Research artistic techniques and styles',
          'Understand target audience and context'
        ],
        activities: [
          {
            name: 'Artistic Research',
            description: 'Study works by established artists in the field',
            duration: '2 class periods',
            resources: ['Art books', 'Online galleries', 'Museums'],
            studentChoice: true
          },
          {
            name: 'Technique Exploration',
            description: 'Experiment with different artistic techniques',
            duration: '2 class periods',
            resources: ['Art supplies', 'Tutorial videos'],
            studentChoice: false
          }
        ],
        deliverables: [
          {
            name: 'Inspiration Board',
            format: 'Visual collage',
            assessmentCriteria: ['Research depth', 'Visual organization', 'Theme clarity']
          }
        ]
      },
      BRAINSTORM: {
        objectives: [
          'Generate creative concepts',
          'Explore multiple artistic approaches',
          'Develop unique artistic voice'
        ],
        activities: [
          {
            name: 'Concept Sketching',
            description: 'Create multiple rough drafts or sketches',
            duration: '2 class periods',
            resources: ['Sketching materials', 'Digital tools'],
            studentChoice: false
          },
          {
            name: 'Peer Feedback Session',
            description: 'Share ideas and receive constructive feedback',
            duration: '1 class period',
            resources: ['Feedback forms', 'Discussion guidelines'],
            studentChoice: false
          }
        ],
        deliverables: [
          {
            name: 'Concept Portfolio',
            format: 'Collection of sketches/drafts',
            assessmentCriteria: ['Variety', 'Creativity', 'Development']
          }
        ]
      },
      PROTOTYPE: {
        objectives: [
          'Create the artistic work',
          'Refine technique and execution',
          'Incorporate feedback iteratively'
        ],
        activities: [
          {
            name: 'Creation Process',
            description: 'Produce the main artistic work',
            duration: '5 class periods',
            resources: ['Studio space', 'Materials', 'Tools'],
            studentChoice: false
          },
          {
            name: 'Critique and Revision',
            description: 'Receive feedback and make improvements',
            duration: '2 class periods',
            resources: ['Critique guidelines', 'Revision materials'],
            studentChoice: false
          }
        ],
        deliverables: [
          {
            name: 'Artistic Work',
            format: 'Final piece or performance',
            assessmentCriteria: ['Technical skill', 'Creativity', 'Expression']
          },
          {
            name: 'Process Documentation',
            format: 'Photo/video documentation',
            assessmentCriteria: ['Completeness', 'Quality', 'Reflection']
          }
        ]
      },
      EVALUATE: {
        objectives: [
          'Reflect on artistic choices',
          'Analyze audience response',
          'Plan future artistic development'
        ],
        activities: [
          {
            name: 'Exhibition/Performance',
            description: 'Present work to an audience',
            duration: '1 class period',
            resources: ['Display space', 'Presentation equipment'],
            studentChoice: false
          },
          {
            name: 'Artist Statement',
            description: 'Write about artistic choices and meaning',
            duration: '1 class period',
            resources: ['Writing guidelines', 'Examples'],
            studentChoice: false
          }
        ],
        deliverables: [
          {
            name: 'Artist Statement',
            format: 'Written document',
            assessmentCriteria: ['Clarity', 'Insight', 'Connection to work']
          },
          {
            name: 'Portfolio',
            format: 'Curated collection',
            assessmentCriteria: ['Organization', 'Presentation', 'Growth evidence']
          }
        ]
      }
    }
  }
];

// AI-powered suggestions (simulated)
const generateAISuggestions = (
  phaseType: PhaseType,
  gradeLevel: GradeLevel,
  subject: string
): {
  objectives: string[];
  activities: Omit<PhaseActivity, 'id'>[];
  deliverables: Omit<PhaseDeliverable, 'id'>[];
} => {
  const gradeLevelMap = {
    elementary: {
      complexity: 'simple',
      duration: 'shorter',
      vocabulary: 'basic'
    },
    middle: {
      complexity: 'moderate',
      duration: 'medium',
      vocabulary: 'intermediate'
    },
    high: {
      complexity: 'complex',
      duration: 'longer',
      vocabulary: 'advanced'
    }
  };

  const level = gradeLevelMap[gradeLevel];

  // Generate contextual suggestions based on phase
  const suggestions = {
    ANALYZE: {
      objectives: [
        `Understand the ${level.complexity} aspects of the topic`,
        `Research ${level.vocabulary} concepts related to ${subject}`,
        `Identify key questions to explore`
      ],
      activities: [
        {
          name: `${level.vocabulary} Research Activity`,
          description: `Explore foundational concepts at ${gradeLevel} level`,
          duration: level.duration === 'shorter' ? '1 class period' : '2 class periods',
          resources: ['Grade-appropriate resources', 'Research tools'],
          studentChoice: gradeLevel !== 'elementary'
        }
      ],
      deliverables: [
        {
          name: 'Research Summary',
          format: level.complexity === 'simple' ? 'Visual poster' : 'Written report',
          assessmentCriteria: ['Understanding', 'Effort', 'Presentation']
        }
      ]
    },
    BRAINSTORM: {
      objectives: [
        `Generate ${level.complexity} solutions`,
        `Think creatively within ${subject} context`,
        `Collaborate with peers effectively`
      ],
      activities: [
        {
          name: 'Idea Generation Session',
          description: `Create multiple ${level.vocabulary} solutions`,
          duration: '1 class period',
          resources: ['Brainstorming tools', 'Collaboration space'],
          studentChoice: true
        }
      ],
      deliverables: [
        {
          name: 'Idea Collection',
          format: 'Visual or written compilation',
          assessmentCriteria: ['Quantity', 'Creativity', 'Feasibility']
        }
      ]
    },
    PROTOTYPE: {
      objectives: [
        `Build a ${level.complexity} solution`,
        `Test and refine the creation`,
        `Document the process`
      ],
      activities: [
        {
          name: 'Building Phase',
          description: `Construct ${level.vocabulary} prototype`,
          duration: level.duration === 'shorter' ? '2 class periods' : '4 class periods',
          resources: ['Materials', 'Tools', 'Workspace'],
          studentChoice: false
        }
      ],
      deliverables: [
        {
          name: 'Prototype',
          format: 'Physical or digital creation',
          assessmentCriteria: ['Functionality', 'Effort', 'Innovation']
        }
      ]
    },
    EVALUATE: {
      objectives: [
        `Assess the ${level.complexity} solution`,
        `Reflect on learning`,
        `Share findings with others`
      ],
      activities: [
        {
          name: 'Presentation Preparation',
          description: `Prepare ${level.vocabulary} presentation`,
          duration: '1 class period',
          resources: ['Presentation tools', 'Templates'],
          studentChoice: gradeLevel === 'high'
        }
      ],
      deliverables: [
        {
          name: 'Final Presentation',
          format: level.complexity === 'simple' ? 'Show and tell' : 'Formal presentation',
          assessmentCriteria: ['Communication', 'Understanding', 'Reflection']
        }
      ]
    }
  };

  return suggestions[phaseType];
};

export const PhaseBuilder: React.FC<PhaseBuilderProps> = ({
  currentPhase,
  gradeLevel,
  subject,
  existingPhases,
  onApplyTemplate,
  onAddSuggestion,
  onBulkAdd
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'bulk'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesGrade = template.gradeLevel.includes(gradeLevel);
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesGrade && matchesCategory && matchesSearch;
    });
  }, [gradeLevel, filterCategory, searchQuery]);

  // Generate AI suggestions
  const handleGenerateAI = useCallback(() => {
    const suggestions = generateAISuggestions(currentPhase, gradeLevel, subject);
    setAiSuggestions(suggestions);
  }, [currentPhase, gradeLevel, subject]);

  // Apply selected template
  const handleApplyTemplate = useCallback(() => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate);
      setShowPreview(false);
      setSelectedTemplate(null);
    }
  }, [selectedTemplate, onApplyTemplate]);

  // Add individual AI suggestion
  const handleAddAISuggestion = useCallback((type: string, item: any) => {
    onAddSuggestion(currentPhase, type as any, item);
    
    // Remove from suggestions after adding
    if (aiSuggestions) {
      const updated = { ...aiSuggestions };
      updated[type] = updated[type].filter((i: any) => i !== item);
      setAiSuggestions(updated);
    }
  }, [currentPhase, onAddSuggestion, aiSuggestions]);

  // Bulk add selected items
  const handleBulkAdd = useCallback(() => {
    if (!aiSuggestions) return;

    const items: any = {
      objectives: [],
      activities: [],
      deliverables: []
    };

    selectedItems.forEach(id => {
      const [type, index] = id.split('-');
      const idx = parseInt(index);
      
      if (type === 'objective') {
        items.objectives.push({
          id: Date.now().toString() + idx,
          text: aiSuggestions.objectives[idx],
          required: true
        });
      } else if (type === 'activity') {
        items.activities.push({
          id: Date.now().toString() + idx,
          ...aiSuggestions.activities[idx]
        });
      } else if (type === 'deliverable') {
        items.deliverables.push({
          id: Date.now().toString() + idx,
          ...aiSuggestions.deliverables[idx]
        });
      }
    });

    onBulkAdd(currentPhase, items);
    setSelectedItems(new Set());
    setAiSuggestions(null);
  }, [currentPhase, selectedItems, aiSuggestions, onBulkAdd]);

  const categories = [...new Set(TEMPLATES.map(t => t.category))];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Phase Builder
            </h2>
            <p className="mt-2 text-indigo-100">
              Accelerate your journey design with templates and AI suggestions
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentPhase} Phase
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Library className="w-4 h-4 inline-block mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className="w-4 h-4 inline-block mr-2" />
            AI Suggestions
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-4 h-4 inline-block mr-2" />
            Bulk Operations
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <template.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {template.category}
                          </span>
                          {template.subjects.slice(0, 2).map(subject => (
                            <span key={subject} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Preview and Apply */}
              {selectedTemplate && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={handleApplyTemplate}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Apply Template
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {!aiSuggestions ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Generate AI Suggestions
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get personalized suggestions for the {currentPhase} phase based on your
                    {' '}{gradeLevel} grade {subject} project
                  </p>
                  <button
                    onClick={handleGenerateAI}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Suggestions
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Objectives */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Suggested Objectives
                    </h3>
                    <div className="space-y-2">
                      {aiSuggestions.objectives.map((obj: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.has(`objective-${idx}`)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(`objective-${idx}`);
                              } else {
                                newSelected.delete(`objective-${idx}`);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="text-indigo-600"
                          />
                          <span className="flex-1 text-sm text-gray-700">{obj}</span>
                          <button
                            onClick={() => handleAddAISuggestion('objectives', obj)}
                            className="text-indigo-600 hover:text-indigo-700 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Suggested Activities
                    </h3>
                    <div className="space-y-2">
                      {aiSuggestions.activities.map((activity: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.has(`activity-${idx}`)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(`activity-${idx}`);
                              } else {
                                newSelected.delete(`activity-${idx}`);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="text-indigo-600 mt-1"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{activity.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <span className="text-xs text-gray-500 mt-1">
                              Duration: {activity.duration}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddAISuggestion('activities', activity)}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Suggested Deliverables
                    </h3>
                    <div className="space-y-2">
                      {aiSuggestions.deliverables.map((deliverable: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.has(`deliverable-${idx}`)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(`deliverable-${idx}`);
                              } else {
                                newSelected.delete(`deliverable-${idx}`);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="text-indigo-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {deliverable.name}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({deliverable.format})
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddAISuggestion('deliverables', deliverable)}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedItems.size > 0 && (
                    <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-indigo-700">
                        {selectedItems.size} items selected
                      </span>
                      <button
                        onClick={handleBulkAdd}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add Selected Items
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bulk' && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Bulk Operations</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Copy content between phases or apply standardized elements across all phases
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Copy from Phase */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy from Another Phase
                  </h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3">
                    <option>Select source phase...</option>
                    {existingPhases.map((phase, idx) => (
                      <option key={phase.type} value={phase.type}>
                        Phase {idx + 1}: {phase.name}
                      </option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="text-indigo-600" />
                      Copy objectives
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="text-indigo-600" />
                      Copy activities
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="text-indigo-600" />
                      Copy deliverables
                    </label>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Copy Selected
                  </button>
                </div>

                {/* Apply to All Phases */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Apply to All Phases
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Add common elements to all phases at once
                  </p>
                  <textarea
                    placeholder="Enter items to add (one per line)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-24 mb-3"
                  />
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3">
                    <option>Add as objectives</option>
                    <option>Add as activities</option>
                    <option>Add as deliverables</option>
                  </select>
                  <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Apply to All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                  <p className="text-indigo-100 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {Object.entries(selectedTemplate.phases).map(([phaseType, content]) => (
                <div key={phaseType} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    {phaseType} Phase
                  </h4>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Objectives</h5>
                      <ul className="space-y-1">
                        {content.objectives.map((obj, idx) => (
                          <li key={idx} className="text-sm text-gray-600">• {obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Activities</h5>
                      <div className="space-y-2">
                        {content.activities.map((activity, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            <span className="font-medium">{activity.name}:</span> {activity.description}
                            <span className="text-xs text-gray-500 ml-2">({activity.duration})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Deliverables</h5>
                      <ul className="space-y-1">
                        {content.deliverables.map((del, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            • {del.name} ({del.format})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Template
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};