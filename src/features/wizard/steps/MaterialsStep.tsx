import React from 'react';
import { motion } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Wrench, BookOpen, FileText } from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const studentMaterialSuggestions = [
  { category: 'Basic Supplies', items: ['Paper and pencils', 'Notebooks', 'Colored markers/pencils'] },
  { category: 'Technology', items: ['Computers/tablets', 'Internet access', 'Presentation software'] },
  { category: 'Hands-on Materials', items: ['Building materials', 'Art supplies', 'Science equipment'] },
  { category: 'Research Tools', items: ['Library access', 'Online databases', 'Interview recording devices'] }
];

const teacherResourceSuggestions = [
  { category: 'Curriculum Resources', items: ['Textbooks', 'Lesson plans', 'Assessment rubrics'] },
  { category: 'Digital Resources', items: ['Educational videos', 'Interactive simulations', 'Online courses'] },
  { category: 'Professional Development', items: ['Teaching guides', 'Best practice articles', 'Workshop materials'] },
  { category: 'Community Resources', items: ['Guest speakers', 'Field trip locations', 'Partner organizations'] }
];

export function MaterialsStep({ data, updateField, error }: StepProps) {
  const [activeTab, setActiveTab] = React.useState<'student' | 'teacher'>('student');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6">
        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
          <Wrench className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          What resources will you need?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          List materials for students to complete the project and resources to support your teaching
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab('student'); }}
          className={`
            flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === 'student' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          <Wrench className="w-4 h-4" />
          Student Materials
        </button>
        <button
          onClick={() => { setActiveTab('teacher'); }}
          className={`
            flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === 'teacher' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          <BookOpen className="w-4 h-4" />
          Teacher Resources
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'student' ? (
          <motion.div
            key="student"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="materials" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Student materials and supplies
              </label>
              <textarea
                id="materials"
                value={data.materials || ''}
                onChange={(e) => { updateField('materials', e.target.value); }}
                placeholder="List the materials students will need for hands-on activities, projects, and presentations..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:shadow-md
                  transition-all duration-200 resize-none"
                rows={4}
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Common materials by category:</p>
              <div className="grid gap-3">
                {studentMaterialSuggestions.map((category, idx) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{category.category}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.items.join(' • ')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="teacher"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="teacherResources" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Teaching resources and references
              </label>
              <textarea
                id="teacherResources"
                value={data.teacherResources || ''}
                onChange={(e) => { updateField('teacherResources', e.target.value); }}
                placeholder="List readings, videos, lesson materials, and other resources to support your teaching..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:shadow-md
                  transition-all duration-200 resize-none"
                rows={4}
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource types to consider:</p>
              <div className="grid gap-3">
                {teacherResourceSuggestions.map((category, idx) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{category.category}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.items.join(' • ')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-squircle card-pad anim-ease border border-indigo-100 dark:border-indigo-800"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {activeTab === 'student' ? 'Budget-friendly tips' : 'Resource curation'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activeTab === 'student' 
                  ? 'We\'ll suggest alternatives and DIY options for expensive materials. Many great projects use everyday items!'
                  : 'We\'ll help you find high-quality, age-appropriate resources that align with your learning goals.'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
