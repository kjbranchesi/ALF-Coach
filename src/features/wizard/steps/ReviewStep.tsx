import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { 
  EditIcon, 
  CheckCircleIcon,
  LightbulbIcon,
  UserIcon,
  MapIcon,
  PackageIcon,
  FileTextIcon
} from '../../../components/icons/ButtonIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
  onJumpToStep?: (stepIndex: number) => void;
}

export function ReviewStep({ data, onJumpToStep }: StepProps) {
  const fields = [
    { 
      label: 'Motivation', 
      value: data.motivation, 
      icon: LightbulbIcon,
      stepIndex: 0,
      required: true
    },
    { 
      label: 'Subject', 
      value: data.subject, 
      icon: FileTextIcon,
      stepIndex: 1,
      required: true
    },
    { 
      label: 'Age Group', 
      value: data.ageGroup, 
      icon: UserIcon,
      stepIndex: 2,
      required: true
    },
    { 
      label: 'Location', 
      value: data.location || 'Not specified', 
      icon: MapIcon,
      stepIndex: 3,
      required: false
    },
    { 
      label: 'Materials', 
      value: data.materials || 'Not specified', 
      icon: PackageIcon,
      stepIndex: 4,
      required: false
    },
    { 
      label: 'Scope', 
      value: data.scope.charAt(0).toUpperCase() + data.scope.slice(1), 
      icon: CheckCircleIcon,
      stepIndex: 5,
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Your Blueprint Setup</h2>
        <p className="text-slate-600">
          Everything look good? You can edit any section before we create your personalized blueprint.
        </p>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const IconComponent = field.icon;
          const isEmpty = !field.required && (field.value === 'Not specified' || !field.value);
          
          return (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-white border rounded-lg p-4
                ${isEmpty ? 'border-gray-200' : 'border-gray-300'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`
                    p-2 rounded-lg
                    ${isEmpty ? 'bg-gray-100' : 'bg-blue-50'}
                  `}>
                    <IconComponent className={`
                      w-5 h-5
                      ${isEmpty ? 'text-gray-400' : 'text-blue-600'}
                    `} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800">{field.label}</h3>
                      {field.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </div>
                    <p className={`
                      text-sm
                      ${isEmpty ? 'text-gray-400 italic' : 'text-gray-600'}
                    `}>
                      {field.value}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onJumpToStep?.(field.stepIndex)}
                  className="
                    p-2 rounded-lg text-gray-400 hover:text-blue-600
                    hover:bg-blue-50 transition-all duration-200
                  "
                >
                  <EditIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          Ready to create your blueprint!
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Based on your inputs, we'll generate a personalized project blueprint with:
        </p>
        <ul className="space-y-1 text-sm text-gray-600 ml-5">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Engaging activities tailored to your {data.ageGroup} students
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            {data.subject}-specific learning objectives and assessments
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            A structured timeline for your {data.scope}
          </li>
          {data.location && (
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              Local resources and community connections in {data.location}
            </li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}