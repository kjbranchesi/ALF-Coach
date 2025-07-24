// UnifiedSuggestionCard.jsx - Consistent card styling for all suggestions

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, FileText, HelpCircle, Check, ArrowRight, Eye, Shield, RefreshCw } from 'lucide-react';

const cardStyles = {
  // Primary suggestions (Big Ideas, Essential Questions)
  primary: {
    base: 'bg-gradient-to-br from-blue-50 to-blue-100/30 border-blue-200/50 text-blue-900 hover:from-blue-100 hover:to-blue-50 backdrop-blur-sm',
    icon: 'text-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200/50'
  },
  
  // Secondary suggestions (alternatives, examples)
  secondary: {
    base: 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/50 text-amber-900 hover:from-amber-100 hover:to-amber-50 backdrop-blur-sm',
    icon: 'text-amber-600',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200/50'
  },
  
  // Action suggestions (Get Ideas, See Examples)
  action: {
    base: 'bg-gradient-to-br from-gray-50 to-gray-100/30 border-gray-200/50 text-gray-900 hover:from-gray-100 hover:to-gray-50 backdrop-blur-sm',
    icon: 'text-gray-600',
    iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200/50'
  },
  
  // Success suggestions (Accept, Continue)
  success: {
    base: 'bg-gradient-to-br from-green-50 to-green-100/30 border-green-200/50 text-green-900 hover:from-green-100 hover:to-green-50 backdrop-blur-sm',
    icon: 'text-green-600',
    iconBg: 'bg-gradient-to-br from-green-100 to-green-200/50'
  },
  
  // Warning suggestions (consistency checks)
  warning: {
    base: 'bg-gradient-to-br from-orange-50 to-orange-100/30 border-orange-200/50 text-orange-900 hover:from-orange-100 hover:to-orange-50 backdrop-blur-sm',
    icon: 'text-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200/50'
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
  
  // Icon mapping
  const iconMap = {
    'Lightbulb': Lightbulb,
    'FileText': FileText,
    'HelpCircle': HelpCircle,
    'Check': Check,
    'ArrowRight': ArrowRight,
    'Eye': Eye,
    'Shield': Shield,
    'Refresh': RefreshCw
  };
  
  const IconComponent = icon && iconMap[icon];
  
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[DEBUG UnifiedSuggestionCard] Button clicked');
        console.log('[DEBUG UnifiedSuggestionCard] Text:', text);
        console.log('[DEBUG UnifiedSuggestionCard] Type:', type);
        console.log('[DEBUG UnifiedSuggestionCard] onClick exists:', !!onClick);
        console.log('[DEBUG UnifiedSuggestionCard] Disabled:', disabled);
        
        if (!disabled && onClick) {
          console.log('[DEBUG UnifiedSuggestionCard] Calling onClick handler');
          onClick(text);
        } else if (disabled) {
          console.log('[DEBUG UnifiedSuggestionCard] Button is disabled');
        } else {
          console.error('[ERROR UnifiedSuggestionCard] No onClick handler provided!');
        }
      }}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center gap-4
        px-6 py-4 rounded-2xl
        border-2 
        font-medium text-base
        transition-all duration-300
        shadow-soft-lg hover:shadow-soft-xl
        text-left
        ${style.base}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {IconComponent && (
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl
          flex items-center justify-center
          shadow-soft
          ${style.iconBg}
        `}>
          <IconComponent className={`w-5 h-5 ${style.icon}`} />
        </div>
      )}
      <div className="flex-1">
        <p className="leading-relaxed font-semibold">{cleanText}</p>
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