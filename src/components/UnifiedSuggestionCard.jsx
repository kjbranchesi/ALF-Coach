// UnifiedSuggestionCard.jsx - Consistent card styling for all suggestions

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from './icons/ButtonIcons';

const cardStyles = {
  // Primary suggestions (Big Ideas, Essential Questions)
  primary: {
    base: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  
  // Secondary suggestions (alternatives, examples)
  secondary: {
    base: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100'
  },
  
  // Action suggestions (Get Ideas, See Examples)
  action: {
    base: 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100',
    icon: 'text-gray-600',
    iconBg: 'bg-gray-100'
  },
  
  // Success suggestions (Accept, Continue)
  success: {
    base: 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100',
    icon: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  
  // Warning suggestions (consistency checks)
  warning: {
    base: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100',
    icon: 'text-orange-600',
    iconBg: 'bg-orange-100'
  }
};

const UnifiedSuggestionCard = ({ 
  text, 
  onClick, 
  disabled = false,
  type = 'primary',
  icon = null,
  index = 0,
  fullWidth = true
}) => {
  const style = cardStyles[type] || cardStyles.primary;
  const IconComponent = icon && Icons[`${icon}Icon`];
  
  // Clean text - remove any emojis
  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onClick={() => onClick(text)} // Pass original text for processing
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-start gap-3
        p-4 rounded-xl
        border-2 
        font-medium text-sm
        transition-all duration-200
        shadow-soft hover:shadow-soft-lg
        text-left
        ${style.base}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {IconComponent && (
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg
          flex items-center justify-center
          ${style.iconBg}
        `}>
          <IconComponent className={`w-4 h-4 ${style.icon}`} />
        </div>
      )}
      <div className="flex-1">
        <p className="leading-relaxed">{cleanText}</p>
      </div>
    </motion.button>
  );
};

// Determine card type from content
export const getCardType = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('accept') || lowerText.includes('continue')) {
    return 'success';
  }
  if (lowerText.includes('show') && lowerText.includes('change')) {
    return 'warning';
  }
  if (lowerText.includes('get ideas') || lowerText.includes('see examples') || lowerText.includes('help')) {
    return 'action';
  }
  if (lowerText.includes('consider') || lowerText.includes('let me')) {
    return 'secondary';
  }
  
  return 'primary';
};

// Determine icon from content
export const getCardIcon = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('idea')) return 'Lightbulb';
  if (lowerText.includes('example')) return 'FileText';
  if (lowerText.includes('help')) return 'HelpCircle';
  if (lowerText.includes('accept') || lowerText.includes('yes')) return 'Check';
  if (lowerText.includes('continue')) return 'ArrowRight';
  if (lowerText.includes('change')) return 'Eye';
  if (lowerText.includes('keep')) return 'Shield';
  if (lowerText.includes('try again')) return 'Refresh';
  
  return null;
};

export default UnifiedSuggestionCard;