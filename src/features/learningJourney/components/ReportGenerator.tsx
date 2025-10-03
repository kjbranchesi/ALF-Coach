/**
 * ReportGenerator.tsx
 * 
 * Comprehensive report generation system for Learning Journey
 * Part of Sprint 5: Data Analytics and Reporting
 * 
 * FEATURES:
 * - Multi-format report generation (PDF, CSV, JSON)
 * - Customizable report templates
 * - Student portfolio compilation
 * - Progress summary reports
 * - Parent-friendly summaries
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileCode,
  Image,
  Calendar,
  User,
  Users,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Check,
  X,
  Eye,
  Share2,
  Clock,
  Star,
  MessageSquare,
  Bookmark,
  Filter,
  Printer,
  Mail
} from 'lucide-react';
import {
  PhaseType,
  type GradeLevel,
  type CreativePhase,
  type StudentProgress,
  type IterationEvent
} from '../types';
import { type Assessment } from './AssessmentCriteria';
import { type PeerReview } from './PeerEvaluation';
import { type LearningAnalytics, type ClassroomAnalytics, type PredictiveInsight } from './DataAnalytics';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'classroom' | 'parent' | 'portfolio' | 'summary';
  sections: ReportSection[];
  format: ReportFormat[];
  gradeLevel?: GradeLevel;
  customizable: boolean;
}

export interface ReportSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  dataSource: 'progress' | 'assessments' | 'peers' | 'analytics' | 'iterations';
  visualizations: VisualizationType[];
}

export interface ReportConfiguration {
  templateId: string;
  title: string;
  subtitle?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  includeStudents: string[];
  sections: string[];
  format: ReportFormat;
  customizations: {
    logo?: string;
    schoolName?: string;
    teacherName?: string;
    className?: string;
    includeImages?: boolean;
    includeComments?: boolean;
    parentFriendly?: boolean;
  };
}

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'docx' | 'html';
export type VisualizationType = 'chart' | 'table' | 'timeline' | 'badge' | 'progress' | 'text';

interface ReportGeneratorProps {
  students: Array<{
    id: string;
    name: string;
    grade: string;
    avatar?: string;
  }>;
  studentProgress: StudentProgress[];
  assessments: Assessment[];
  peerReviews: PeerReview[];
  iterations: IterationEvent[];
  phases: CreativePhase[];
  analytics: {
    individual: LearningAnalytics[];
    classroom: ClassroomAnalytics;
    insights: PredictiveInsight[];
  };
  gradeLevel: GradeLevel;
  projectDuration: number;
  currentWeek: number;
  onGenerateReport: (config: ReportConfiguration) => Promise<void>;
  onPreviewReport?: (config: ReportConfiguration) => void;
  onSaveTemplate?: (template: ReportTemplate) => void;
  templates?: ReportTemplate[];
  className?: string;
}

// Pre-defined report templates
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'individual-comprehensive',
    name: 'Individual Student Report',
    description: 'Comprehensive progress report for individual student',
    type: 'individual',
    sections: [
      {
        id: 'progress-overview',
        name: 'Progress Overview',
        description: 'Overall progress and phase completion',
        required: true,
        dataSource: 'progress',
        visualizations: ['progress', 'chart']
      },
      {
        id: 'assessment-results',
        name: 'Assessment Results',
        description: 'Detailed assessment scores and feedback',
        required: true,
        dataSource: 'assessments',
        visualizations: ['table', 'chart']
      },
      {
        id: 'peer-feedback',
        name: 'Peer Feedback',
        description: 'Feedback received from peers',
        required: false,
        dataSource: 'peers',
        visualizations: ['text', 'badge']
      },
      {
        id: 'iteration-history',
        name: 'Learning Iterations',
        description: 'History of iterations and improvements',
        required: false,
        dataSource: 'iterations',
        visualizations: ['timeline', 'text']
      }
    ],
    format: ['pdf', 'docx'],
    customizable: true
  },
  {
    id: 'classroom-summary',
    name: 'Classroom Summary Report',
    description: 'Overview of entire classroom performance',
    type: 'classroom',
    sections: [
      {
        id: 'class-progress',
        name: 'Class Progress Overview',
        description: 'Overall classroom progress statistics',
        required: true,
        dataSource: 'analytics',
        visualizations: ['chart', 'table']
      },
      {
        id: 'student-rankings',
        name: 'Student Performance',
        description: 'Individual student performance summary',
        required: true,
        dataSource: 'progress',
        visualizations: ['table', 'chart']
      },
      {
        id: 'insights',
        name: 'Key Insights',
        description: 'Predictive insights and recommendations',
        required: true,
        dataSource: 'analytics',
        visualizations: ['text']
      }
    ],
    format: ['pdf', 'csv'],
    customizable: true
  },
  {
    id: 'parent-summary',
    name: 'Parent-Friendly Report',
    description: 'Simple, clear report for parents',
    type: 'parent',
    sections: [
      {
        id: 'child-progress',
        name: 'Your Child\'s Progress',
        description: 'Easy-to-understand progress summary',
        required: true,
        dataSource: 'progress',
        visualizations: ['progress', 'text']
      },
      {
        id: 'strengths-growth',
        name: 'Strengths & Growth Areas',
        description: 'What your child excels at and areas for growth',
        required: true,
        dataSource: 'assessments',
        visualizations: ['text', 'badge']
      },
      {
        id: 'next-steps',
        name: 'What\'s Next',
        description: 'Upcoming activities and how to support at home',
        required: true,
        dataSource: 'analytics',
        visualizations: ['text']
      }
    ],
    format: ['pdf', 'html'],
    gradeLevel: undefined, // Available for all grades
    customizable: false
  },
  {
    id: 'portfolio-showcase',
    name: 'Student Portfolio',
    description: 'Showcase of student work and achievements',
    type: 'portfolio',
    sections: [
      {
        id: 'achievements',
        name: 'Achievements & Awards',
        description: 'Badges and recognitions earned',
        required: true,
        dataSource: 'assessments',
        visualizations: ['badge', 'text']
      },
      {
        id: 'work-samples',
        name: 'Work Samples',
        description: 'Examples of student work from each phase',
        required: true,
        dataSource: 'progress',
        visualizations: ['text']
      },
      {
        id: 'reflections',
        name: 'Student Reflections',
        description: 'Student\'s thoughts on their learning journey',
        required: false,
        dataSource: 'assessments',
        visualizations: ['text']
      }
    ],
    format: ['pdf', 'html'],
    customizable: true
  }
];

// Grade-level specific templates
const GRADE_LEVEL_TEMPLATES: Record<GradeLevel, Partial<ReportTemplate>[]> = {
  elementary: [
    {
      id: 'elementary-progress',
      name: 'Learning Adventure Report',
      description: 'Fun, visual progress report for young learners',
      sections: [
        {
          id: 'learning-journey',
          name: 'My Learning Adventure',
          description: 'Visual journey through the creative process',
          required: true,
          dataSource: 'progress',
          visualizations: ['progress', 'badge']
        },
        {
          id: 'superpowers',
          name: 'My Superpowers',
          description: 'Strengths and special abilities discovered',
          required: true,
          dataSource: 'assessments',
          visualizations: ['badge', 'text']
        }
      ]
    }
  ],
  middle: [
    {
      id: 'middle-portfolio',
      name: 'Creative Process Portfolio',
      description: 'Comprehensive portfolio showcasing growth',
      sections: [
        {
          id: 'project-showcase',
          name: 'Project Showcase',
          description: 'Highlighted work from each phase',
          required: true,
          dataSource: 'progress',
          visualizations: ['text', 'timeline']
        },
        {
          id: 'collaboration-impact',
          name: 'Collaboration & Impact',
          description: 'Teamwork and peer contributions',
          required: true,
          dataSource: 'peers',
          visualizations: ['text', 'badge']
        }
      ]
    }
  ],
  high: [
    {
      id: 'high-professional',
      name: 'Professional Portfolio',
      description: 'Industry-style portfolio and performance review',
      sections: [
        {
          id: 'executive-summary',
          name: 'Executive Summary',
          description: 'High-level overview of achievements',
          required: true,
          dataSource: 'analytics',
          visualizations: ['text', 'chart']
        },
        {
          id: 'skill-development',
          name: 'Skill Development Trajectory',
          description: 'Professional skills gained and demonstrated',
          required: true,
          dataSource: 'assessments',
          visualizations: ['chart', 'table']
        }
      ]
    }
  ]
};

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  students,
  studentProgress,
  assessments,
  peerReviews,
  iterations,
  phases,
  analytics,
  gradeLevel,
  projectDuration,
  currentWeek,
  onGenerateReport,
  onPreviewReport,
  onSaveTemplate,
  templates = [],
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [configuration, setConfiguration] = useState<Partial<ReportConfiguration>>({
    format: 'pdf',
    includeStudents: [],
    sections: [],
    customizations: {
      includeImages: true,
      includeComments: true,
      parentFriendly: false
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [customizationStep, setCustomizationStep] = useState<'template' | 'students' | 'sections' | 'settings' | 'review'>('template');

  // Combine default templates with grade-specific and custom templates
  const availableTemplates = useMemo(() => {
    const gradeTemplates = GRADE_LEVEL_TEMPLATES[gradeLevel].map(partial => ({
      ...partial,
      type: 'individual' as const,
      format: ['pdf' as const],
      customizable: true,
      gradeLevel
    }));

    return [
      ...REPORT_TEMPLATES,
      ...gradeTemplates,
      ...templates
    ].filter(template => !template.gradeLevel || template.gradeLevel === gradeLevel);
  }, [gradeLevel, templates]);

  // Get selected template
  const currentTemplate = availableTemplates.find(t => t.id === selectedTemplate);

  // Generate report data
  const reportData = useMemo(() => {
    if (!currentTemplate) {return null;}

    const selectedStudents = configuration.includeStudents || [];
    const filteredStudents = selectedStudents.length > 0
      ? students.filter(s => selectedStudents.includes(s.id))
      : students;

    return {
      metadata: {
        generatedAt: new Date(),
        template: currentTemplate.name,
        studentCount: filteredStudents.length,
        projectWeek: currentWeek,
        totalWeeks: projectDuration,
        gradeLevel
      },
      students: filteredStudents,
      progress: studentProgress.filter(p => 
        filteredStudents.some(s => s.id === p.studentId)
      ),
      assessments: assessments.filter(a => 
        filteredStudents.some(s => s.id === a.studentId)
      ),
      peerReviews: peerReviews.filter(r => 
        filteredStudents.some(s => s.id === r.revieweeId)
      ),
      iterations: iterations.filter(i => 
        studentProgress.some(p => 
          filteredStudents.some(s => s.id === p.studentId) &&
          p.iterationEvents.some(ie => ie.id === i.id)
        )
      ),
      analytics: {
        individual: analytics.individual.filter(a => 
          filteredStudents.some(s => s.id === a.studentId)
        ),
        classroom: analytics.classroom,
        insights: analytics.insights
      }
    };
  }, [currentTemplate, configuration.includeStudents, students, studentProgress, assessments, peerReviews, iterations, analytics, currentWeek, projectDuration, gradeLevel]);

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setConfiguration(prev => ({
        ...prev,
        templateId,
        title: template.name,
        sections: template.sections.filter(s => s.required).map(s => s.id),
        format: template.format[0]
      }));
      setCustomizationStep('students');
    }
  }, [availableTemplates]);

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId: string) => {
    setConfiguration(prev => {
      const currentSections = prev.sections || [];
      const isSelected = currentSections.includes(sectionId);
      
      return {
        ...prev,
        sections: isSelected
          ? currentSections.filter(id => id !== sectionId)
          : [...currentSections, sectionId]
      };
    });
  }, []);

  // Handle student selection
  const handleStudentToggle = useCallback((studentId: string) => {
    setConfiguration(prev => {
      const currentStudents = prev.includeStudents || [];
      const isSelected = currentStudents.includes(studentId);
      
      return {
        ...prev,
        includeStudents: isSelected
          ? currentStudents.filter(id => id !== studentId)
          : [...currentStudents, studentId]
      };
    });
  }, []);

  // Handle report generation
  const handleGenerate = useCallback(async () => {
    if (!currentTemplate || !configuration.format) {return;}

    setIsGenerating(true);
    try {
      const finalConfig: ReportConfiguration = {
        templateId: selectedTemplate,
        title: configuration.title || currentTemplate.name,
        subtitle: configuration.subtitle,
        dateRange: configuration.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeStudents: configuration.includeStudents?.length 
          ? configuration.includeStudents 
          : students.map(s => s.id),
        sections: configuration.sections || currentTemplate.sections.map(s => s.id),
        format: configuration.format,
        customizations: configuration.customizations || {}
      };

      await onGenerateReport(finalConfig);
    } finally {
      setIsGenerating(false);
    }
  }, [currentTemplate, configuration, selectedTemplate, students, onGenerateReport]);

  // Handle preview
  const handlePreview = useCallback(() => {
    if (!currentTemplate || !onPreviewReport) {return;}

    const previewConfig: ReportConfiguration = {
      templateId: selectedTemplate,
      title: configuration.title || currentTemplate.name,
      subtitle: configuration.subtitle,
      dateRange: configuration.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      includeStudents: configuration.includeStudents?.length 
        ? configuration.includeStudents 
        : students.slice(0, 1).map(s => s.id), // Preview with first student only
      sections: configuration.sections || currentTemplate.sections.map(s => s.id),
      format: 'html', // Always preview as HTML
      customizations: configuration.customizations || {}
    };

    onPreviewReport(previewConfig);
    setPreviewMode(true);
  }, [currentTemplate, configuration, selectedTemplate, students, onPreviewReport]);

  // Get format icon
  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf': return FileText;
      case 'csv': return FileSpreadsheet;
      case 'json': return FileCode;
      case 'docx': return FileText;
      case 'html': return Image;
    }
  };

  // Get step progress
  const getStepProgress = () => {
    const steps = ['template', 'students', 'sections', 'settings', 'review'];
    const currentIndex = steps.indexOf(customizationStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Report Generator
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create comprehensive reports and portfolios
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onPreviewReport && (
              <button
                onClick={handlePreview}
                disabled={!currentTemplate}
                className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={!currentTemplate || isGenerating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {selectedTemplate && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>Template</span>
              <span>Students</span>
              <span>Sections</span>
              <span>Settings</span>
              <span>Review</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Template Selection */}
          {customizationStep === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Choose Report Template</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          selectedTemplate === template.id ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {template.name}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          selectedTemplate === template.id ? 'text-primary-700' : 'text-gray-600'
                        }`}>
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.type === 'individual' ? 'bg-primary-100 text-primary-700' :
                            template.type === 'classroom' ? 'bg-green-100 text-green-700' :
                            template.type === 'parent' ? 'bg-purple-100 text-purple-700' :
                            template.type === 'portfolio' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {template.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.sections.length} sections
                          </span>
                          <div className="flex gap-1">
                            {template.format.slice(0, 3).map(format => {
                              const Icon = getFormatIcon(format);
                              return (
                                <Icon key={format} className="w-3 h-3 text-gray-400" />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Student Selection */}
          {customizationStep === 'students' && currentTemplate && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Students</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfiguration(prev => ({ 
                      ...prev, 
                      includeStudents: students.map(s => s.id) 
                    }))}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setConfiguration(prev => ({ 
                      ...prev, 
                      includeStudents: [] 
                    }))}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {currentTemplate.type === 'individual' 
                  ? 'Select students to generate individual reports for'
                  : 'Select students to include in the classroom report'
                }
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {students.map(student => {
                  const isSelected = configuration.includeStudents?.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleStudentToggle(student.id)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            isSelected ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {student.name}
                          </div>
                          <div className={`text-xs truncate ${
                            isSelected ? 'text-primary-700' : 'text-gray-600'
                          }`}>
                            {student.grade}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCustomizationStep('template')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCustomizationStep('sections')}
                  disabled={(configuration.includeStudents?.length || 0) === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* Section Selection */}
          {customizationStep === 'sections' && currentTemplate && (
            <motion.div
              key="sections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Customize Report Sections</h3>
              
              <div className="space-y-3">
                {currentTemplate.sections.map(section => {
                  const isRequired = section.required;
                  const isSelected = configuration.sections?.includes(section.id);
                  
                  return (
                    <div
                      key={section.id}
                      className={`p-4 border rounded-lg ${
                        isSelected ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center">
                          {isRequired ? (
                            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSectionToggle(section.id)}
                              className={`w-5 h-5 border-2 rounded ${
                                isSelected
                                  ? 'bg-primary-600 border-blue-600'
                                  : 'border-gray-300 hover:border-gray-400'
                              } flex items-center justify-center`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${
                              isSelected ? 'text-primary-900' : 'text-gray-900'
                            }`}>
                              {section.name}
                            </h4>
                            {isRequired && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            isSelected ? 'text-primary-700' : 'text-gray-600'
                          }`}>
                            {section.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 capitalize">
                              Data: {section.dataSource}
                            </span>
                            <div className="flex gap-1">
                              {section.visualizations.map(viz => (
                                <span
                                  key={viz}
                                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize"
                                >
                                  {viz}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCustomizationStep('students')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCustomizationStep('settings')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {customizationStep === 'settings' && currentTemplate && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Report Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <div className="space-y-2">
                    {currentTemplate.format.map(format => {
                      const Icon = getFormatIcon(format);
                      return (
                        <button
                          key={format}
                          onClick={() => setConfiguration(prev => ({ ...prev, format }))}
                          className={`w-full p-3 border rounded-lg text-left transition-colors ${
                            configuration.format === format
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${
                              configuration.format === format ? 'text-primary-600' : 'text-gray-600'
                            }`} />
                            <span className={`font-medium uppercase ${
                              configuration.format === format ? 'text-primary-900' : 'text-gray-900'
                            }`}>
                              {format}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customizations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customizations
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configuration.customizations?.includeImages}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          customizations: {
                            ...prev.customizations,
                            includeImages: e.target.checked
                          }
                        }))}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-gray-700">Include images and visuals</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configuration.customizations?.includeComments}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          customizations: {
                            ...prev.customizations,
                            includeComments: e.target.checked
                          }
                        }))}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-gray-700">Include detailed comments</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configuration.customizations?.parentFriendly}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          customizations: {
                            ...prev.customizations,
                            parentFriendly: e.target.checked
                          }
                        }))}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-gray-700">Parent-friendly language</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Title and Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={configuration.title || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={currentTemplate.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={configuration.subtitle || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Additional context or period"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={configuration.customizations?.schoolName || ''}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        customizations: {
                          ...prev.customizations,
                          schoolName: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={configuration.customizations?.teacherName || ''}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        customizations: {
                          ...prev.customizations,
                          teacherName: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCustomizationStep('sections')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCustomizationStep('review')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Review →
                </button>
              </div>
            </motion.div>
          )}

          {/* Review */}
          {customizationStep === 'review' && currentTemplate && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Review Configuration</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Template:</span>
                        <span className="font-medium">{currentTemplate.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium uppercase">{configuration.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">
                          {configuration.includeStudents?.length || students.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sections:</span>
                        <span className="font-medium">
                          {configuration.sections?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Included Sections</h4>
                    <div className="space-y-1">
                      {currentTemplate.sections
                        .filter(s => configuration.sections?.includes(s.id))
                        .map(section => (
                          <div key={section.id} className="text-sm text-gray-700">
                            • {section.name}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {reportData && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <h4 className="font-medium text-primary-900 mb-2">Data Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-primary-700">Students:</span>
                      <span className="font-medium text-primary-900 ml-1">
                        {reportData.students.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-primary-700">Assessments:</span>
                      <span className="font-medium text-primary-900 ml-1">
                        {reportData.assessments.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-primary-700">Peer Reviews:</span>
                      <span className="font-medium text-primary-900 ml-1">
                        {reportData.peerReviews.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-primary-700">Iterations:</span>
                      <span className="font-medium text-primary-900 ml-1">
                        {reportData.iterations.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCustomizationStep('settings')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  {onPreviewReport && (
                    <button
                      onClick={handlePreview}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};