import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Lightbulb, 
  ArrowRight, 
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Edit3,
  Save
} from 'lucide-react';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ElementType;
  variant: 'primary' | 'secondary' | 'ghost' | 'suggestion';
  action: () => void;
  disabled?: boolean;
  tooltip?: string;
  badge?: string;
}

interface SmartActionButtonsProps {
  stage: 'ideation' | 'journey' | 'deliverables';
  step: number;
  inputValue: string;
  hasContent: boolean;
  isValidated: boolean;
  isLoading: boolean;
  userType: 'new' | 'experienced' | 'expert';
  onSendMessage: (message: string) => void;
  onGetIdeas: () => void;
  onRefineContent: () => void;
  onContinue: () => void;
  onGetHelp: () => void;
  onQuickSave?: () => void;
}

export function SmartActionButtons({
  stage,
  step,
  inputValue,
  hasContent,
  isValidated,
  isLoading,
  userType,
  onSendMessage,
  onGetIdeas,
  onRefineContent,
  onContinue,
  onGetHelp,
  onQuickSave
}: SmartActionButtonsProps) {

  // Determine context-specific button configurations
  const getButtonConfiguration = (): ActionButton[] => {
    const baseButtons: ActionButton[] = [];

    // Primary action based on state
    if (!hasContent || inputValue.trim()) {
      // User is typing or has empty input
      baseButtons.push({
        id: 'send',
        label: inputValue.trim() ? 'Share Your Idea' : 'Start Typing...',
        icon: Send,
        variant: 'primary',
        action: () => onSendMessage(inputValue),
        disabled: !inputValue.trim() || isLoading,
        tooltip: 'Share your thoughts about this step'
      });
    } else if (hasContent && !isValidated) {
      // User has content but hasn't validated it yet
      baseButtons.push({
        id: 'refine',
        label: 'Refine This',
        icon: Edit3,
        variant: 'primary',
        action: onRefineContent,
        disabled: isLoading,
        tooltip: 'Get help improving your response'
      });
      
      baseButtons.push({
        id: 'continue',
        label: 'Looks Good, Continue',
        icon: ArrowRight,
        variant: 'secondary',
        action: onContinue,
        disabled: isLoading,
        tooltip: 'Move to the next step'
      });
    } else if (isValidated) {
      // Content is validated, ready to move forward
      baseButtons.push({
        id: 'continue',
        label: 'Continue to Next Step',
        icon: ChevronRight,
        variant: 'primary',
        action: onContinue,
        disabled: isLoading,
        tooltip: 'Your response looks great!'
      });
      
      if (userType !== 'expert') {
        baseButtons.push({
          id: 'refine',
          label: 'Refine Further',
          icon: RefreshCw,
          variant: 'ghost',
          action: onRefineContent,
          disabled: isLoading,
          tooltip: 'Make additional improvements'
        });
      }
    }

    // Secondary actions based on user type and context
    if (userType === 'new' || (!hasContent && userType === 'experienced')) {
      baseButtons.push({
        id: 'ideas',
        label: userType === 'new' ? 'Give Me Ideas' : 'Spark Ideas',
        icon: Lightbulb,
        variant: 'suggestion',
        action: onGetIdeas,
        disabled: isLoading,
        tooltip: 'Get suggestions for this step'
      });
    }

    // Help button (always available for new users, contextual for others)
    if (userType === 'new' || (!hasContent && !isValidated)) {
      baseButtons.push({
        id: 'help',
        label: userType === 'new' ? 'How Do I Do This?' : 'Get Help',
        icon: HelpCircle,
        variant: 'ghost',
        action: onGetHelp,
        disabled: isLoading,
        tooltip: 'Learn more about this step'
      });
    }

    // Quick save for experienced/expert users
    if ((userType === 'experienced' || userType === 'expert') && hasContent && onQuickSave) {
      baseButtons.push({
        id: 'save',
        label: 'Quick Save',
        icon: Save,
        variant: 'ghost',
        action: onQuickSave,
        disabled: isLoading,
        tooltip: 'Save progress and continue later'
      });
    }

    return baseButtons;
  };

  const buttons = getButtonConfiguration();

  // Button styling based on variant
  const getButtonStyles = (variant: string, disabled: boolean) => {
    const baseStyles = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm";
    
    if (disabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed bg-gray-100 text-gray-400`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5`;
      case 'secondary':
        return `${baseStyles} bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transform hover:-translate-y-0.5`;
      case 'suggestion':
        return `${baseStyles} bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5`;
      case 'ghost':
        return `${baseStyles} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
      default:
        return baseStyles;
    }
  };

  // Responsive layout for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {buttons.map((button, index) => {
        const ButtonIcon = button.icon;
        
        return (
          <motion.button
            key={button.id}
            onClick={button.action}
            disabled={button.disabled}
            className={getButtonStyles(button.variant, button.disabled || false)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!button.disabled ? { scale: 1.02 } : {}}
            whileTap={!button.disabled ? { scale: 0.98 } : {}}
            title={button.tooltip}
          >
            <ButtonIcon className="w-4 h-4" />
            
            {/* Adaptive text display */}
            {userType === 'expert' && isMobile ? (
              // Show only icons for expert mobile users
              <span className="sr-only">{button.label}</span>
            ) : (
              <span className={isMobile && button.label.length > 10 ? 'hidden sm:inline' : ''}>
                {button.label}
              </span>
            )}
            
            {button.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {button.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Quick Actions Toolbar for Expert Users
export function ExpertQuickActions({
  onQuickAction
}: {
  onQuickAction: (action: string) => void;
}) {
  const quickActions = [
    { id: 'ideas', icon: Lightbulb, tooltip: 'Generate ideas' },
    { id: 'refine', icon: RefreshCw, tooltip: 'Refine content' },
    { id: 'continue', icon: ArrowRight, tooltip: 'Continue' },
    { id: 'help', icon: HelpCircle, tooltip: 'Get help' }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {quickActions.map(action => {
        const ActionIcon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.id)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
            title={action.tooltip}
          >
            <ActionIcon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

// Context-aware button recommendations
export function getRecommendedAction(
  stage: string, 
  step: number, 
  hasContent: boolean, 
  userType: string
): string {
  if (!hasContent) {
    if (userType === 'new') return 'ideas';
    if (userType === 'experienced') return 'ideas';
    return 'send';
  }
  
  if (hasContent && userType === 'expert') return 'continue';
  
  return 'refine';
}