import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { Building2, Home, Trees, Mountain, MapPin } from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const locationTypes = [
  { label: 'Urban', icon: Building2, description: 'City environment with diverse resources' },
  { label: 'Suburban', icon: Home, description: 'Mixed residential and commercial areas' },
  { label: 'Rural', icon: Trees, description: 'Countryside or small town setting' },
  { label: 'Remote', icon: Mountain, description: 'Isolated or hard-to-reach location' }
];

export function LocationStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Where are you located?</h2>
        <p className="text-slate-600 dark:text-slate-400">
          This helps us suggest location-specific resources and community connections
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">(Optional - you can skip this step)</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {locationTypes.map((type, index) => (
            <motion.button
              key={type.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateField('location', type.label)}
              className={`
                p-4 soft-card soft-rounded soft-transition text-left
                hover:shadow-soft-lg hover:lift
                ${data.location === type.label
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'dark:bg-gray-800'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <type.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className={`font-medium ${data.location === type.label ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{type.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-4 text-sm text-gray-500 dark:text-gray-400">or be more specific</span>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            City, State/Region, or Country
          </span>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={data.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g., San Francisco, CA or Rural Vermont"
              className="
                w-full pl-12 pr-4 py-3 rounded-lg border-2
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-200
              "
            />
          </div>
        </label>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy note:</strong> Your location is only used to provide relevant 
            suggestions and is never shared publicly.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateField('location', '')}
          className="
            w-full py-3 rounded-lg border-2 border-dashed
            border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 
            hover:border-gray-400 dark:hover:border-gray-500
            hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200
          "
        >
          Skip this step
        </motion.button>
      </div>
    </div>
  );
}