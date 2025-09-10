import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Package, AlertTriangle } from 'lucide-react';
import { ProjectContext, WizardDataV3 } from '../wizardSchema';
import { Tier } from '../../../types/alf';
import { StepComponentProps } from '../types';

export const ProjectIntakeStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [projectContext, setProjectContext] = useState<Partial<ProjectContext>>({
    gradeLevel: data.projectContext?.gradeLevel || '',
    subjects: data.projectContext?.subjects || [],
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common options
  const gradeLevels = ['K-2', '3-5', '6-8', '9-12', 'Mixed'];
  const subjects = ['Science', 'Math', 'ELA', 'Social Studies', 'Art', 'Technology', 'World Languages', 'PE/Health'];
  const timeWindows = ['2 weeks', '3 weeks', '4 weeks', '6 weeks', '8 weeks', 'Full semester'];
  const cadences = ['Daily', '2-3 times/week', 'Weekly', 'Block schedule'];
  const techOptions = ['Chromebooks', 'iPads', 'Computer lab', 'Smartphones', 'Interactive whiteboard', '3D printer', 'Robotics kits'];
  const materialOptions = ['Basic art supplies', 'Science lab', 'Maker space', 'Library access', 'Outdoor space', 'Community partnerships'];
  const constraintOptions = ['Limited budget', 'No field trips', 'Strict schedule', 'Testing prep', 'Admin requirements', 'Parent concerns'];

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!projectContext.gradeLevel) {
      newErrors.gradeLevel = 'Please select a grade level';
    }
    if (!projectContext.subjects || projectContext.subjects.length === 0) {
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

  // Handle form submission
  const handleSubmit = () => {
    if (validate()) {
      onUpdate({ 
        projectContext: {
          ...projectContext,
          tier: 'core' as Tier,
          confidence: 0.9
        }
      });
      onNext();
    }
  };

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
          className="space-y-4"
        >
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Basic Information
          </h4>
          
          {/* Grade Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Grade Level *
            </label>
            <select
              value={projectContext.gradeLevel}
              onChange={(e) => setProjectContext({ ...projectContext, gradeLevel: e.target.value })}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${errors.gradeLevel 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
                }
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              `}
            >
              <option value="">Select grade level</option>
              {gradeLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.gradeLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>
            )}
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subject Areas * (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectContext.subjects?.includes(subject)}
                    onChange={(e) => {
                      const newSubjects = e.target.checked
                        ? [...(projectContext.subjects || []), subject]
                        : projectContext.subjects?.filter(s => s !== subject) || [];
                      setProjectContext({ ...projectContext, subjects: newSubjects });
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{subject}</span>
                </label>
              ))}
            </div>
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
        </motion.div>

        {/* Time & Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time & Schedule
          </h4>
          
          {/* Time Window */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Project Duration *
            </label>
            <select
              value={projectContext.timeWindow}
              onChange={(e) => setProjectContext({ ...projectContext, timeWindow: e.target.value })}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${errors.timeWindow 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
                }
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              `}
            >
              <option value="">Select duration</option>
              {timeWindows.map(window => (
                <option key={window} value={window}>{window}</option>
              ))}
            </select>
            {errors.timeWindow && (
              <p className="mt-1 text-sm text-red-600">{errors.timeWindow}</p>
            )}
          </div>

          {/* Meeting Cadence */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Meeting Frequency *
            </label>
            <select
              value={projectContext.cadence}
              onChange={(e) => setProjectContext({ ...projectContext, cadence: e.target.value })}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${errors.cadence 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
                }
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              `}
            >
              <option value="">Select frequency</option>
              {cadences.map(cadence => (
                <option key={cadence} value={cadence}>{cadence}</option>
              ))}
            </select>
            {errors.cadence && (
              <p className="mt-1 text-sm text-red-600">{errors.cadence}</p>
            )}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Available Resources
          </h4>
          
          {/* Technology */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Available Technology
            </label>
            <div className="grid grid-cols-2 gap-3">
              {techOptions.map(tech => (
                <label key={tech} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectContext.availableTech?.includes(tech)}
                    onChange={(e) => {
                      const newTech = e.target.checked
                        ? [...(projectContext.availableTech || []), tech]
                        : projectContext.availableTech?.filter(t => t !== tech) || [];
                      setProjectContext({ ...projectContext, availableTech: newTech });
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tech}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Available Materials & Spaces
            </label>
            <div className="grid grid-cols-2 gap-3">
              {materialOptions.map(material => (
                <label key={material} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectContext.availableMaterials?.includes(material)}
                    onChange={(e) => {
                      const newMaterials = e.target.checked
                        ? [...(projectContext.availableMaterials || []), material]
                        : projectContext.availableMaterials?.filter(m => m !== material) || [];
                      setProjectContext({ ...projectContext, availableMaterials: newMaterials });
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{material}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Constraints */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Constraints & Considerations
          </h4>
          
          {/* Known Constraints */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Known Constraints
            </label>
            <div className="grid grid-cols-2 gap-3">
              {constraintOptions.map(constraint => (
                <label key={constraint} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectContext.constraints?.includes(constraint)}
                    onChange={(e) => {
                      const newConstraints = e.target.checked
                        ? [...(projectContext.constraints || []), constraint]
                        : projectContext.constraints?.filter(c => c !== constraint) || [];
                      setProjectContext({ ...projectContext, constraints: newConstraints });
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{constraint}</span>
                </label>
              ))}
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
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={3}
              placeholder="E.g., No homework, must align with testing schedule, parent communication requirements..."
            />
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Continue to Goals & Essential Question
        </button>
      </div>
    </div>
  );
};