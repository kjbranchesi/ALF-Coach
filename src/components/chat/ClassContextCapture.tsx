/**
 * ClassContextCapture.tsx - Capture classroom context for adaptive suggestions
 * Helps tailor blueprint to specific class needs, resources, and constraints
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Globe, 
  Laptop, 
  BookOpen,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Check,
  Plus,
  X
} from 'lucide-react';

interface ClassContext {
  // Basic info
  classSize: 'small' | 'medium' | 'large' | 'mixed';
  gradeLevel: string;
  subject: string;
  
  // Student needs
  studentNeeds: {
    iepCount: number;
    ellCount: number;
    giftedCount: number;
    behavioralSupport: number;
  };
  
  // Resources
  resources: {
    technology: 'none' | 'limited' | 'basic' | 'oneToOne' | 'advanced';
    materials: string[];
    space: 'classroom' | 'flexible' | 'multiple' | 'outdoor' | 'community';
    timeStructure: 'traditional' | 'block' | 'flexible' | 'selfPaced';
  };
  
  // Support
  support: {
    coteaching: boolean;
    paraeducator: boolean;
    specialists: string[];
    communityPartners: string[];
  };
  
  // Project constraints
  constraints: {
    duration: 'oneWeek' | 'twoWeeks' | 'month' | 'quarter' | 'semester';
    budget: 'none' | 'minimal' | 'moderate' | 'substantial';
    parentInvolvement: 'none' | 'minimal' | 'moderate' | 'high';
  };
}

interface ClassContextCaptureProps {
  onComplete: (context: ClassContext) => void;
  onSkip?: () => void;
  initialContext?: Partial<ClassContext>;
}

export const ClassContextCapture: React.FC<ClassContextCaptureProps> = ({
  onComplete,
  onSkip,
  initialContext
}) => {
  const [context, setContext] = useState<ClassContext>({
    classSize: initialContext?.classSize || 'medium',
    gradeLevel: initialContext?.gradeLevel || '',
    subject: initialContext?.subject || '',
    studentNeeds: initialContext?.studentNeeds || {
      iepCount: 0,
      ellCount: 0,
      giftedCount: 0,
      behavioralSupport: 0
    },
    resources: initialContext?.resources || {
      technology: 'basic',
      materials: [],
      space: 'classroom',
      timeStructure: 'traditional'
    },
    support: initialContext?.support || {
      coteaching: false,
      paraeducator: false,
      specialists: [],
      communityPartners: []
    },
    constraints: initialContext?.constraints || {
      duration: 'month',
      budget: 'minimal',
      parentInvolvement: 'moderate'
    }
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  const [newMaterial, setNewMaterial] = useState('');
  const [newSpecialist, setNewSpecialist] = useState('');
  const [newPartner, setNewPartner] = useState('');

  // Class size options
  const classSizeOptions = [
    { value: 'small', label: '< 15 students' },
    { value: 'medium', label: '15-25 students' },
    { value: 'large', label: '26-35 students' },
    { value: 'mixed', label: 'Multiple sections' }
  ];

  const ClassIcon: React.FC<{ size: ClassContext['classSize'] }> = ({ size }) => {
    const base = 'w-5 h-5 text-gray-600 dark:text-gray-300';
    if (size === 'mixed') return <RefreshCw className={base} />;
    // For simplicity, use Users icon for all sizes; size conveys via label
    return <Users className={base} />;
  };

  // Technology level descriptions
  const techLevels = [
    { value: 'none', label: 'No tech', description: 'Paper-based only' },
    { value: 'limited', label: 'Limited', description: 'Shared devices, computer lab' },
    { value: 'basic', label: 'Basic', description: 'Classroom set, occasional access' },
    { value: 'oneToOne', label: '1:1 Devices', description: 'Every student has device' },
    { value: 'advanced', label: 'Advanced', description: '1:1 + specialized tools' }
  ];

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Add material
  const addMaterial = () => {
    if (newMaterial.trim()) {
      setContext(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          materials: [...prev.resources.materials, newMaterial.trim()]
        }
      }));
      setNewMaterial('');
    }
  };

  // Remove material
  const removeMaterial = (index: number) => {
    setContext(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        materials: prev.resources.materials.filter((_, i) => i !== index)
      }
    }));
  };

  // Calculate total special needs
  const totalSpecialNeeds = Object.values(context.studentNeeds).reduce((a, b) => a + b, 0);

  // Check if context is complete enough
  const isComplete = context.gradeLevel && context.subject;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Tell us about your class
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This helps us tailor suggestions to your specific needs
              </p>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Skip for now →
              </button>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Basic Information */}
          <div className="p-6">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Basic Information
                </h3>
                {context.gradeLevel && context.subject && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✓ Complete
                  </span>
                )}
              </div>
              {expandedSection === 'basic' ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'basic' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Grade Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      value={context.gradeLevel}
                      onChange={(e) => setContext(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      placeholder="e.g., 5th grade, 9-10, K-2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject Area
                    </label>
                    <input
                      type="text"
                      value={context.subject}
                      onChange={(e) => setContext(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Science, English/History, STEM"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Class Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {classSizeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setContext(prev => ({ ...prev, classSize: option.value as any }))}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${context.classSize === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                            <div className="text-center">
                            <div className="mb-1 flex items-center justify-center"><ClassIcon size={option.value as any} /></div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {option.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Student Needs */}
          <div className="p-6">
            <button
              onClick={() => toggleSection('needs')}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Student Needs
                </h3>
                {totalSpecialNeeds > 0 && (
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    {totalSpecialNeeds} students with special needs
                  </span>
                )}
              </div>
              {expandedSection === 'needs' ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'needs' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-3"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approximate numbers help us suggest appropriate differentiation
                  </p>
                  
                  {/* IEP Students */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Students with IEPs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={context.studentNeeds.iepCount}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        studentNeeds: {
                          ...prev.studentNeeds,
                          iepCount: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center"
                    />
                  </div>

                  {/* ELL Students */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      English Language Learners
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={context.studentNeeds.ellCount}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        studentNeeds: {
                          ...prev.studentNeeds,
                          ellCount: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center"
                    />
                  </div>

                  {/* Gifted Students */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Gifted & Talented
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={context.studentNeeds.giftedCount}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        studentNeeds: {
                          ...prev.studentNeeds,
                          giftedCount: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center"
                    />
                  </div>

                  {/* Behavioral Support */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Behavioral Support Needs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={context.studentNeeds.behavioralSupport}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        studentNeeds: {
                          ...prev.studentNeeds,
                          behavioralSupport: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resources */}
          <div className="p-6">
            <button
              onClick={() => toggleSection('resources')}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Available Resources
                </h3>
              </div>
              {expandedSection === 'resources' ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'resources' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Technology Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Technology Access
                    </label>
                    <div className="space-y-2">
                      {techLevels.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setContext(prev => ({
                            ...prev,
                            resources: {
                              ...prev.resources,
                              technology: level.value as any
                            }
                          }))}
                          className={`
                            w-full p-3 rounded-lg border-2 text-left transition-all
                            ${context.resources.technology === level.value
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {level.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {level.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Materials
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                        placeholder="Add materials (e.g., art supplies, lab equipment)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={addMaterial}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {context.resources.materials.map((material, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1"
                        >
                          {material}
                          <button
                            onClick={() => removeMaterial(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Project Constraints */}
          <div className="p-6">
            <button
              onClick={() => toggleSection('constraints')}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Project Timeline
                </h3>
              </div>
              {expandedSection === 'constraints' ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'constraints' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Duration
                    </label>
                    <select
                      value={context.constraints.duration}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        constraints: {
                          ...prev.constraints,
                          duration: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="oneWeek">1 week</option>
                      <option value="twoWeeks">2 weeks</option>
                      <option value="month">1 month</option>
                      <option value="quarter">Quarter (9-12 weeks)</option>
                      <option value="semester">Semester</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Available
                    </label>
                    <select
                      value={context.constraints.budget}
                      onChange={(e) => setContext(prev => ({
                        ...prev,
                        constraints: {
                          ...prev.constraints,
                          budget: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="none">No budget</option>
                      <option value="minimal">Minimal ($0-50)</option>
                      <option value="moderate">Moderate ($50-200)</option>
                      <option value="substantial">Substantial ($200+)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isComplete ? '✓ Ready to continue' : 'Please fill in grade level and subject'}
            </p>
            <button
              onClick={() => onComplete(context)}
              disabled={!isComplete}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${isComplete 
                  ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue with these settings
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
