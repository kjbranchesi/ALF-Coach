import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Package,
  AlertTriangle,
  Check,
  Beaker,
  Cpu,
  Palette,
  Calculator,
  Globe,
  BookOpen,
  HeartPulse,
  Sparkles,
  Layers,
  Plus
} from 'lucide-react';
import { ProjectContext, WizardDataV3 } from '../wizardSchema';
import { Tier } from '../../../types/alf';
import { StepComponentProps } from '../types';

export const ProjectIntakeStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const customEntryPrefix = 'Custom: ';
  const existingSubjects = data.projectContext?.subjects || [];
  const initialCustomSubject = existingSubjects.find(subject => subject.startsWith(customEntryPrefix));

  const [projectContext, setProjectContext] = useState<Partial<ProjectContext>>({
    gradeLevel: data.projectContext?.gradeLevel || '',
    subjects: existingSubjects,
    studentCount: data.projectContext?.studentCount || 25,
    timeWindow: data.projectContext?.timeWindow || '',
    cadence: data.projectContext?.cadence || '',
    availableTech: data.projectContext?.availableTech || [],
    availableMaterials: data.projectContext?.availableMaterials || [],
    constraints: data.projectContext?.constraints || [],
    specialPopulations: data.projectContext?.specialPopulations || '',
    classroomPolicies: data.projectContext?.classroomPolicies || '',
    budget: data.projectContext?.budget || 'minimal',
    space: data.projectContext?.space || 'classroom',
    ...data.projectContext
  });

  const [otherSubject, setOtherSubject] = useState<string>(
    initialCustomSubject ? initialCustomSubject.replace(customEntryPrefix, '').trim() : ''
  );
  const [otherCardActive, setOtherCardActive] = useState<boolean>(Boolean(initialCustomSubject));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common options
  const gradeLevels = ['K-2', '3-5', '6-8', '9-12', 'Mixed'];
  const subjectOptions = [
    {
      id: 'science',
      value: 'Science',
      title: 'Science & Engineering',
      description: 'Investigations, labs, and scientific thinking',
      icon: Beaker,
      accent: 'from-cyan-200/70 to-cyan-100/40'
    },
    {
      id: 'mathematics',
      value: 'Math',
      title: 'Mathematics',
      description: 'Problem-solving, modeling, and quantitative reasoning',
      icon: Calculator,
      accent: 'from-amber-200/70 to-amber-100/40'
    },
    {
      id: 'ela',
      value: 'ELA',
      title: 'ELA & Literacy',
      description: 'Reading, writing, storytelling, and media literacy',
      icon: BookOpen,
      accent: 'from-rose-200/70 to-rose-100/40'
    },
    {
      id: 'social-studies',
      value: 'Social Studies',
      title: 'Social Studies',
      description: 'Civics, history, geography, and global perspectives',
      icon: Globe,
      accent: 'from-sky-200/70 to-sky-100/40'
    },
    {
      id: 'arts',
      value: 'Art',
      title: 'Arts & Design',
      description: 'Visual arts, music, theatre, and creativity',
      icon: Palette,
      accent: 'from-fuchsia-200/70 to-fuchsia-100/40'
    },
    {
      id: 'technology',
      value: 'Technology',
      title: 'Technology & Engineering',
      description: 'Coding, robotics, prototyping, and systems design',
      icon: Cpu,
      accent: 'from-indigo-200/70 to-indigo-100/40'
    },
    {
      id: 'health',
      value: 'PE/Health',
      title: 'Health & Wellness',
      description: 'Physical education, well-being, and student care',
      icon: HeartPulse,
      accent: 'from-emerald-200/70 to-emerald-100/40'
    },
    {
      id: 'steam',
      value: 'STEAM',
      title: 'STEAM',
      description: 'Integrated science, tech, engineering, arts, and math',
      icon: Sparkles,
      accent: 'from-purple-200/70 to-blue-100/40'
    },
    {
      id: 'interdisciplinary',
      value: 'Interdisciplinary',
      title: 'Interdisciplinary',
      description: 'Cross-curricular themes and community connections',
      icon: Layers,
      accent: 'from-slate-200/60 to-slate-100/40'
    },
    {
      id: 'other',
      value: 'Other',
      title: 'Other',
      description: 'Something different? Add your own subject focus.',
      icon: Plus,
      accent: 'from-slate-100 to-white'
    }
  ];
  const timeWindows = ['2 weeks', '3 weeks', '4 weeks', '6 weeks', '8 weeks', 'Full semester'];
  const cadences = ['Daily', '2-3 times/week', 'Weekly', 'Block schedule'];
  const techOptions = ['Chromebooks', 'iPads', 'Computer lab', 'Smartphones', 'Interactive whiteboard', '3D printer', 'Robotics kits'];
  const materialOptions = ['Basic art supplies', 'Science lab', 'Maker space', 'Library access', 'Outdoor space', 'Community partnerships'];
  const constraintOptions = ['Limited budget', 'No field trips', 'Strict schedule', 'Testing prep', 'Admin requirements', 'Parent concerns'];

  const stripCustomTokens = (subjects: string[]) =>
    subjects.filter(subject => !subject.startsWith(customEntryPrefix) && subject !== 'Other');

  const updateSubjects = (updater: (subjects: string[]) => string[]) => {
    setProjectContext(prev => ({
      ...prev,
      subjects: updater(prev.subjects || [])
    }));
  };

  const handleSubjectToggle = (label: string) => {
    updateSubjects(current => {
      const withoutCustom = stripCustomTokens(current);
      const customEntries = current.filter(subject => subject.startsWith(customEntryPrefix));
      if (withoutCustom.includes(label)) {
        return [...withoutCustom.filter(subject => subject !== label), ...customEntries];
      }
      return [...withoutCustom, label, ...customEntries];
    });
  };

  const handleOtherToggle = () => {
    const hasCustom = (projectContext.subjects || []).some(subject => subject.startsWith(customEntryPrefix) || subject === 'Other');
    if (hasCustom || otherCardActive) {
      updateSubjects(current => stripCustomTokens(current));
      setOtherSubject('');
      setOtherCardActive(false);
    } else {
      setOtherCardActive(true);
    }
  };

  const handleOtherSubjectChange = (value: string) => {
    setOtherSubject(value);
    setOtherCardActive(true);
    const trimmed = value.trim();
    updateSubjects(current => {
      const withoutCustom = stripCustomTokens(current);
      if (!trimmed) {
        return withoutCustom;
      }
      return [...withoutCustom, `${customEntryPrefix}${trimmed}`];
    });
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!projectContext.gradeLevel) {
      newErrors.gradeLevel = 'Please select a grade level';
    }
    const subjectCount = (projectContext.subjects || []).filter(subject => subject.trim().length > 0).length;
    if (subjectCount === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }
    if (!projectContext.timeWindow) {
      newErrors.timeWindow = 'Please specify the project duration';
    }
    if (!projectContext.cadence) {
      newErrors.cadence = 'Please specify how often you meet';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save data when form changes
  React.useEffect(() => {
    if (projectContext.gradeLevel && projectContext.subjects && projectContext.subjects.length > 0) {
      onUpdate({
        projectContext: {
          ...projectContext,
          tier: 'core' as Tier,
          confidence: 0.9
        }
      });
    }
  }, [projectContext, onUpdate]);

  const selectedSubjects = projectContext.subjects || [];
  const hasCustomSelected = selectedSubjects.some(subject => subject.startsWith(customEntryPrefix) || subject === 'Other');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Let's understand your classroom context
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          This information helps ALF tailor the project to your specific needs and constraints.
        </p>
      </div>

      {/* Form sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm shadow-slate-900/5 space-y-6"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                Basic Information
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Start with the essentials so we can tailor the project.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Grade Level *
              </label>
              <div className="flex flex-wrap gap-2">
                {gradeLevels.map(level => {
                  const isActive = projectContext.gradeLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setProjectContext({ ...projectContext, gradeLevel: level })}
                      aria-pressed={isActive}
                      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${isActive
                        ? 'border-primary-300 bg-primary-50/70 text-primary-700 dark:border-primary-500/40 dark:bg-primary-900/20 dark:text-primary-200 shadow-sm'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              {errors.gradeLevel && (
                <p className="mt-2 text-sm text-red-600">{errors.gradeLevel}</p>
              )}
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subject Areas * (select all that apply)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Tap a card to highlight the subjects this project will cover. You can choose more than one.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectOptions.map(option => {
                const Icon = option.icon;
                const isOther = option.id === 'other';
                const isSelected = isOther ? (otherCardActive || hasCustomSelected) : selectedSubjects.includes(option.value);
                const cardState = isSelected
                  ? 'border-primary-300 dark:border-primary-500/40 bg-primary-50/70 dark:bg-primary-900/20 shadow-md shadow-primary-500/15'
                  : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-primary-200 dark:hover:border-primary-500/30';

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => (isOther ? handleOtherToggle() : handleSubjectToggle(option.value))}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/40 ${cardState}`}
                  >
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.accent} text-slate-900/80 dark:text-white`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {option.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {option.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>{isSelected ? 'Selected' : 'Tap to select'}</span>
                      {isSelected && !isOther && <Check className="w-4 h-4 text-primary-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {otherCardActive && (
              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Custom subject focus
                </label>
                <input
                  type="text"
                  value={otherSubject}
                  onChange={(e) => handleOtherSubjectChange(e.target.value)}
                  placeholder="e.g., Indigenous Knowledge, Ocean Literacy"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We’ll add this custom subject to your project outline.
                </p>
              </div>
            )}
            {errors.subjects && (
              <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
            )}
            </div>

            {/* Student Count */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number of Students
              </label>
              <input
                type="number"
                value={projectContext.studentCount}
                onChange={(e) => setProjectContext({ ...projectContext, studentCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                min="1"
                max="200"
              />
            </div>
          </div>
        </motion.div>

        {/* Time & Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm shadow-slate-900/5 space-y-5"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Time & Schedule</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clarify how long the project runs and how often you meet.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Time Window */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Duration *
              </label>
              <div className="flex flex-wrap gap-2">
                {timeWindows.map(window => {
                  const isActive = projectContext.timeWindow === window;
                  return (
                    <button
                      key={window}
                      type="button"
                      onClick={() => setProjectContext({ ...projectContext, timeWindow: window })}
                      aria-pressed={isActive}
                      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${isActive
                        ? 'border-primary-300 bg-primary-50/70 text-primary-700 dark:border-primary-500/40 dark:bg-primary-900/20 dark:text-primary-200 shadow-sm'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                      }`}
                    >
                      {window}
                    </button>
                  );
                })}
              </div>
              {errors.timeWindow && (
                <p className="mt-2 text-sm text-red-600">{errors.timeWindow}</p>
              )}
            </div>

            {/* Meeting Cadence */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Meeting Frequency *
              </label>
              <div className="flex flex-wrap gap-2">
                {cadences.map(option => {
                  const isActive = projectContext.cadence === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setProjectContext({ ...projectContext, cadence: option })}
                      aria-pressed={isActive}
                      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${isActive
                        ? 'border-primary-300 bg-primary-50/70 text-primary-700 dark:border-primary-500/40 dark:bg-primary-900/20 dark:text-primary-200 shadow-sm'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {errors.cadence && (
                <p className="mt-2 text-sm text-red-600">{errors.cadence}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm shadow-slate-900/5 space-y-5"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Available Resources</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highlight the tools and spaces you already have access to.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Technology */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Available Technology
              </label>
              <div className="flex flex-wrap gap-3">
                {techOptions.map(tech => {
                  const isSelected = projectContext.availableTech?.includes(tech);
                  return (
                    <label
                      key={tech}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${isSelected
                        ? 'border-primary-300 bg-primary-50/70 text-primary-700 dark:border-primary-500/30 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newTech = e.target.checked
                            ? [...(projectContext.availableTech || []), tech]
                            : projectContext.availableTech?.filter(t => t !== tech) || [];
                          setProjectContext({ ...projectContext, availableTech: newTech });
                        }}
                        className="sr-only"
                      />
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {tech}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Available Materials & Spaces
              </label>
              <div className="flex flex-wrap gap-3">
                {materialOptions.map(material => {
                  const isSelected = projectContext.availableMaterials?.includes(material);
                  return (
                    <label
                      key={material}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${isSelected
                        ? 'border-primary-300 bg-primary-50/70 text-primary-700 dark:border-primary-500/30 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newMaterials = e.target.checked
                            ? [...(projectContext.availableMaterials || []), material]
                            : projectContext.availableMaterials?.filter(m => m !== material) || [];
                          setProjectContext({ ...projectContext, availableMaterials: newMaterials });
                        }}
                        className="sr-only"
                      />
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {material}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Constraints */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm shadow-slate-900/5 space-y-5"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Constraints & Considerations</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Call out anything that might influence pacing or student support.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Known Constraints */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Known Constraints
              </label>
              <div className="flex flex-wrap gap-3">
                {constraintOptions.map(constraint => {
                  const isSelected = projectContext.constraints?.includes(constraint);
                  return (
                    <label
                      key={constraint}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${isSelected
                        ? 'border-amber-300 bg-amber-50/70 text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/30 dark:text-amber-200'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:border-amber-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newConstraints = e.target.checked
                            ? [...(projectContext.constraints || []), constraint]
                            : projectContext.constraints?.filter(c => c !== constraint) || [];
                          setProjectContext({ ...projectContext, constraints: newConstraints });
                        }}
                        className="sr-only"
                      />
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {constraint}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Special Populations */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Special Populations or Needs (optional)
              </label>
              <textarea
                value={projectContext.specialPopulations}
                onChange={(e) => setProjectContext({ ...projectContext, specialPopulations: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                rows={3}
                placeholder="E.g., 5 ELL students, 3 IEP students, advanced learners..."
              />
            </div>

            {/* Classroom Policies */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Classroom Policies or Non-negotiables (optional)
              </label>
              <textarea
                value={projectContext.classroomPolicies}
                onChange={(e) => setProjectContext({ ...projectContext, classroomPolicies: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                rows={3}
                placeholder="E.g., No homework, must align with testing schedule, parent communication requirements..."
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation buttons removed - handled by wizard wrapper to avoid redundancy */}
    </div>
  );
};
