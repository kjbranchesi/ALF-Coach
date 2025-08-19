/**
 * QuickSelectionTags.tsx
 * 
 * Quick selection components for faster wizard completion
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface QuickTagProps {
  tag: string;
  isSelected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const QuickTag: React.FC<QuickTagProps> = ({ tag, isSelected, onClick, icon }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 border
        ${isSelected 
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      {icon}
      <span>{tag}</span>
      {isSelected ? (
        <X className="w-3 h-3 ml-1" />
      ) : (
        <Plus className="w-3 h-3 ml-1 opacity-50" />
      )}
    </motion.button>
  );
};

// Popular project topics organized by category
export const QUICK_PROJECT_TOPICS = {
  'Environmental': [
    'Climate change solutions',
    'Sustainable school garden',
    'Water conservation',
    'Renewable energy',
    'Recycling program',
    'Local ecosystem study'
  ],
  'Community': [
    'Community service project',
    'Local history documentation',
    'Public space design',
    'Cultural celebration',
    'Community problem-solving',
    'Neighborhood improvement'
  ],
  'Technology': [
    'App development',
    'Website creation',
    'Digital storytelling',
    'Coding solutions',
    'Robot design',
    'Tech for social good'
  ],
  'Arts & Culture': [
    'Museum exhibit',
    'Performance production',
    'Art installation',
    'Documentary film',
    'Creative writing anthology',
    'Music composition'
  ],
  'Science & Health': [
    'Scientific research',
    'Health awareness campaign',
    'Nutrition program',
    'Mental health initiative',
    'Disease prevention',
    'Medical innovations'
  ],
  'Business & Economics': [
    'School store/business',
    'Social enterprise',
    'Financial literacy',
    'Marketing campaign',
    'Product design',
    'Economic analysis'
  ]
};

// Common learning goals
export const QUICK_LEARNING_GOALS = {
  'Skills': [
    'Critical thinking',
    'Problem-solving',
    'Collaboration',
    'Communication',
    'Research skills',
    'Digital literacy',
    'Creative thinking',
    'Leadership'
  ],
  'Knowledge': [
    'Subject mastery',
    'Real-world connections',
    'Cross-curricular understanding',
    'Historical context',
    'Scientific concepts',
    'Mathematical reasoning',
    'Literary analysis',
    'Global awareness'
  ],
  'Competencies': [
    'Project management',
    'Time management',
    'Public speaking',
    'Data analysis',
    'Design thinking',
    'Systems thinking',
    'Entrepreneurship',
    'Cultural competence'
  ],
  'Outcomes': [
    'Create original work',
    'Solve real problems',
    'Impact community',
    'Build portfolio',
    'Develop expertise',
    'Master standards',
    'Apply learning',
    'Demonstrate growth'
  ]
};

interface QuickSelectionSectionProps {
  title: string;
  categories: Record<string, string[]>;
  selectedItems: string[];
  onToggle: (item: string) => void;
  onApply: (text: string) => void;
  currentValue: string;
  placeholder?: string;
}

export const QuickSelectionSection: React.FC<QuickSelectionSectionProps> = ({
  title,
  categories,
  selectedItems,
  onToggle,
  onApply,
  currentValue,
  placeholder = "Or click tags below for quick ideas..."
}) => {
  const handleApply = () => {
    if (selectedItems.length > 0) {
      const text = selectedItems.join(', ');
      onApply(text);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {placeholder}
        </p>
        {selectedItems.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleApply}
            className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Apply Selected ({selectedItems.length})
          </motion.button>
        )}
      </div>
      
      <div className="space-y-3">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <QuickTag
                  key={item}
                  tag={item}
                  isSelected={selectedItems.includes(item)}
                  onClick={() => onToggle(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};