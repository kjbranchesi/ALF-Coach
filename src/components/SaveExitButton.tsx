import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveExitButtonProps {
  onSave?: () => Promise<void>;
  variant?: 'floating' | 'header' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const SaveExitButton: React.FC<SaveExitButtonProps> = ({
  onSave,
  variant = 'floating',
  size = 'md',
  className = '',
  showLabel = true
}) => {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSaveAndExit = async () => {
    try {
      setSaveState('saving');
      
      // Call custom save handler if provided
      if (onSave) {
        await onSave();
      }
      
      // Show success state briefly
      setSaveState('success');
      
      // Navigate to dashboard after brief delay
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 800);
      
    } catch (error) {
      console.error('Save failed:', error);
      setSaveState('error');
      
      // Reset error state after 2 seconds
      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base'
  };

  // Icon size variants
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Variant-specific classes
  const variantClasses = {
    floating: `
      fixed bottom-6 right-6 z-40
      glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700 shadow-soft
      ${!showLabel && size === 'lg' ? 'w-14 h-14 p-0 flex items-center justify-center' : ''}
    `,
    header: `
      glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700
    `,
    inline: `
      glass-squircle card-pad anim-ease border border-gray-300 dark:border-gray-600
    `
  };

  // State-based colors
  const stateColors = {
    idle: 'text-gray-700 dark:text-gray-300',
    saving: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400'
  };

  // Get appropriate icon
  const getIcon = () => {
    const iconClass = `${iconSizes[size]} ${stateColors[saveState]}`;
    
    switch (saveState) {
      case 'saving':
        return <Loader2 className={`${iconClass} animate-spin`} />;
      case 'success':
        return <Check className={iconClass} />;
      case 'error':
        return <X className={iconClass} />;
      default:
        return <Save className={iconClass} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={handleSaveAndExit}
        disabled={saveState === 'saving' || saveState === 'success'}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
          flex items-center gap-2
          font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${stateColors[saveState]}
        `}
        aria-label="Save current progress and exit to dashboard"
        aria-busy={saveState === 'saving'}
        aria-disabled={saveState === 'saving' || saveState === 'success'}
      >
        {getIcon()}
        
        {showLabel && (
          <span className="hidden md:inline">
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'success' && 'Saved!'}
            {saveState === 'error' && 'Try Again'}
            {saveState === 'idle' && 'Save & Exit'}
          </span>
        )}
      </motion.button>
    </AnimatePresence>
  );
};

// Mobile-optimized floating button (no label on mobile)
export const FloatingSaveButton: React.FC<Omit<SaveExitButtonProps, 'variant'>> = (props) => {
  return (
    <div className="md:hidden">
      <SaveExitButton {...props} variant="floating" size="lg" showLabel={false} />
    </div>
  );
};

// Desktop floating button (with label)
export const DesktopSaveButton: React.FC<Omit<SaveExitButtonProps, 'variant'>> = (props) => {
  return (
    <div className="hidden md:block">
      <SaveExitButton {...props} variant="floating" size="md" showLabel={true} />
    </div>
  );
};
