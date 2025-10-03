/**
 * EnhancedSuggestionCard.tsx
 * 
 * Auto-submitting suggestion cards with visual feedback and confirmation flow
 * Replaces the manual fill-and-send pattern with immediate auto-submission
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  FileText,
  HelpCircle,
  Check,
  ArrowRight,
  Eye,
  Shield,
  RefreshCw,
  Sparkles,
  Send
} from 'lucide-react';
import { getCardIcon } from './EnhancedSuggestionCard.helpers';

const cardStyles = {
  // Primary suggestions (Big Ideas, Essential Questions)
  primary: {
    base: 'bg-gradient-to-br from-blue-50 to-blue-100/30 border-primary-200/50 text-primary-900 hover:from-blue-100 hover:to-blue-50 backdrop-blur-sm',
    icon: 'text-primary-600',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200/50',
    selectedBg: 'from-primary-600 to-blue-700'
  },
  
  // Secondary suggestions (alternatives, examples)
  secondary: {
    base: 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/50 text-amber-900 hover:from-amber-100 hover:to-amber-50 backdrop-blur-sm',
    icon: 'text-amber-600',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200/50',
    selectedBg: 'from-amber-600 to-amber-700'
  },
  
  // Action suggestions (Get Ideas, See Examples)
  action: {
    base: 'bg-gradient-to-br from-gray-50 to-gray-100/30 border-gray-200/50 text-gray-900 hover:from-gray-100 hover:to-gray-50 backdrop-blur-sm',
    icon: 'text-gray-600',
    iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200/50',
    selectedBg: 'from-gray-600 to-gray-700'
  },
  
  // Success suggestions (Accept, Continue)
  success: {
    base: 'bg-gradient-to-br from-green-50 to-green-100/30 border-green-200/50 text-green-900 hover:from-green-100 hover:to-green-50 backdrop-blur-sm',
    icon: 'text-green-600',
    iconBg: 'bg-gradient-to-br from-green-100 to-green-200/50',
    selectedBg: 'from-green-600 to-green-700'
  },
  
  // Warning suggestions (consistency checks)
  warning: {
    base: 'bg-gradient-to-br from-orange-50 to-orange-100/30 border-orange-200/50 text-orange-900 hover:from-orange-100 hover:to-orange-50 backdrop-blur-sm',
    icon: 'text-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200/50',
    selectedBg: 'from-orange-600 to-orange-700'
  }
};

interface EnhancedSuggestionCardProps {
  text: string;
  onClick: (text: string, options?: { autoSubmit?: boolean; source?: string }) => void;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'action' | 'success' | 'warning';
  icon?: string | null;
  index?: number;
  fullWidth?: boolean;
  autoSubmit?: boolean; // New prop to control auto-submission
}

type SubmissionState = 'idle' | 'selected' | 'submitting' | 'submitted';

const EnhancedSuggestionCard: React.FC<EnhancedSuggestionCardProps> = ({ 
  text, 
  onClick, 
  disabled = false,
  type = 'primary',
  icon = null,
  index = 0,
  fullWidth = true,
  autoSubmit = true
}) => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const style = cardStyles[type] || cardStyles.primary;
  
  // Icon mapping
  // Clean text - remove any emojis
  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

  const iconMap = {
    Lightbulb,
    FileText,
    HelpCircle,
    Check,
    ArrowRight,
    Eye,
    Shield,
    Refresh: RefreshCw,
    Sparkles,
    Send,
  } as const;
  const resolvedIconKey = icon ?? getCardIcon(cleanText);
  const IconComponent = resolvedIconKey ? iconMap[resolvedIconKey as keyof typeof iconMap] : undefined;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || submissionState !== 'idle') {
      return;
    }
    
    console.log('[EnhancedSuggestionCard] Card clicked:', { text: cleanText, autoSubmit });
    
    if (autoSubmit) {
      // Auto-submission flow with visual feedback
      setSubmissionState('selected');
      
      // Brief pause for visual confirmation
      setTimeout(() => {
        setSubmissionState('submitting');
        
        // Call onClick with auto-submit flag
        onClick(cleanText, { autoSubmit: true, source: 'suggestion-card' });
        
        // Show submitted state briefly
        setTimeout(() => {
          setSubmissionState('submitted');
          
          // Reset after animation
          setTimeout(() => {
            setSubmissionState('idle');
          }, 1000);
        }, 300);
      }, 200);
    } else {
      // Manual submission flow (just fill input)
      onClick(cleanText, { autoSubmit: false, source: 'suggestion-card' });
    }
  };
  
  // Dynamic styling based on submission state
  const getCardStyles = () => {
    const baseClasses = `
      ${fullWidth ? 'w-full' : ''}
      flex items-center gap-4
      px-6 py-4 rounded-2xl
      border-2 
      font-medium text-base
      transition-all duration-300
      shadow-soft-lg hover:shadow-soft-xl
      text-left
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
    
    switch (submissionState) {
      case 'selected':
        return `${baseClasses} bg-gradient-to-br ${style.selectedBg} text-white border-transparent scale-105 shadow-lg`;
      case 'submitting':
        return `${baseClasses} bg-gradient-to-br ${style.selectedBg} text-white border-transparent`;
      case 'submitted':
        return `${baseClasses} bg-gradient-to-br from-green-600 to-green-700 text-white border-transparent`;
      default:
        return `${baseClasses} ${style.base}`;
    }
  };
  
  // Dynamic icon based on submission state
  const getIcon = () => {
    switch (submissionState) {
      case 'selected':
        return <Send className="w-5 h-5" />;
      case 'submitting':
        return <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>;
      case 'submitted':
        return <Check className="w-5 h-5" />;
      default:
        return IconComponent ? <IconComponent className={`w-5 h-5 ${style.icon}`} /> : <Sparkles className={`w-5 h-5 ${style.icon}`} />;
    }
  };
  
  // Dynamic icon background
  const getIconBg = () => {
    switch (submissionState) {
      case 'selected':
      case 'submitting':
        return 'bg-white/20';
      case 'submitted':
        return 'bg-white/20';
      default:
        return style.iconBg;
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled && submissionState === 'idle' ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && submissionState === 'idle' ? { scale: 0.98 } : {}}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onClick={handleClick}
      disabled={disabled}
      className={getCardStyles()}
    >
      {/* Icon Container */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl
        flex items-center justify-center
        shadow-soft transition-all duration-300
        ${getIconBg()}
      `}>
        {getIcon()}
      </div>
      
      {/* Text Content */}
      <div className="flex-1">
        <p className="leading-relaxed font-semibold">{cleanText}</p>
        
        {/* Auto-submit indicator */}
        {autoSubmit && submissionState === 'idle' && (
          <p className="text-xs opacity-70 mt-1">
            Click to auto-submit
          </p>
        )}
        
        {/* Submission status */}
        {submissionState !== 'idle' && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-1"
          >
            {submissionState === 'selected' && 'Selected...'}
            {submissionState === 'submitting' && 'Sending...'}
            {submissionState === 'submitted' && 'Sent!'}
          </motion.p>
        )}
      </div>
      
      {/* Auto-submit progress indicator */}
      {autoSubmit && (submissionState === 'selected' || submissionState === 'submitting') && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: submissionState === 'selected' ? 0.2 : 0.3 }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
        />
      )}
    </motion.button>
  );
};

export default EnhancedSuggestionCard;
