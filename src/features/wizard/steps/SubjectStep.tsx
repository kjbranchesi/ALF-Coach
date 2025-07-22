import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { FileTextIcon } from '../../../components/icons/ButtonIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const popularSubjects = [
  { name: 'Science', icon: '🔬' },
  { name: 'Mathematics', icon: '🔢' },
  { name: 'English', icon: '📚' },
  { name: 'History', icon: '🏛️' },
  { name: 'Art', icon: '🎨' },
  { name: 'Technology', icon: '💻' },
  { name: 'Physical Education', icon: '⚽' },
  { name: 'Music', icon: '🎵' }
];

export function SubjectStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What subject are you teaching?</h2>
        <p className="text-slate-600">
          Choose from popular subjects below or enter your own
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularSubjects.map((subject, index) => (
            <motion.button
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateField('subject', subject.name)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
                ${data.subject === subject.name
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{subject.icon}</div>
              <div className="text-sm font-medium">{subject.name}</div>
            </motion.button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">or enter custom</span>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">
            Subject name
          </span>
          <div className="relative">
            <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={data.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              placeholder="e.g., Environmental Science, Creative Writing"
              className={`
                w-full pl-12 pr-4 py-3 rounded-lg border-2
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-200
                ${error 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
                }
              `}
            />
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-2"
            >
              {error}
            </motion.p>
          )}
        </label>

        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> You can combine subjects for interdisciplinary projects 
            (e.g., "Science & Art" or "History & Technology")
          </p>
        </div>
      </div>
    </div>
  );
}