/**
 * QuickReplyChips.tsx - Action buttons below chat
 * Implements SOP requirement: static chip row above input
 */

import React from 'react';
import { type QuickReply } from '../../core/types/SOPTypes';
import { Lightbulb, Shuffle, HelpCircle, ArrowRight, Edit3, RefreshCw } from 'lucide-react';

interface QuickReplyChipsProps {
  replies: QuickReply[];
  onSelect: (action: string) => void;
  disabled?: boolean;
}

export const QuickReplyChips: React.FC<QuickReplyChipsProps> = ({
  replies,
  onSelect,
  disabled
}) => {
  // Define icons for each action type - using Lucide icons
  const getIcon = (action: string) => {
    const iconClass = "w-4 h-4";
    switch (action) {
      case 'ideas':
        return <Lightbulb className={iconClass} />;
      case 'whatif':
        return <Shuffle className={iconClass} />;
      case 'help':
        return <HelpCircle className={iconClass} />;
      case 'continue':
        return <ArrowRight className={iconClass} />;
      case 'refine':
        return <RefreshCw className={iconClass} />;
      case 'edit':
        return <Edit3 className={iconClass} />;
      default:
        return null;
    }
  };

  // Define tooltips for each action type
  const getTooltip = (action: string) => {
    switch (action) {
      case 'ideas':
        return 'Get AI-generated suggestions for this step';
      case 'whatif':
        return 'Explore alternative scenarios and possibilities';
      case 'help':
        return 'Get guidance and examples for this step';
      case 'continue':
        return 'Move to the next step in your project';
      case 'refine':
        return 'Improve and polish your current work';
      case 'edit':
        return 'Make changes to your current response';
      default:
        return '';
    }
  };

  // Define colors for each action type - all using blue theme with soft UI
  const getButtonClass = (action: string) => {
    const baseClass = `
      px-5 py-3 rounded-2xl font-medium text-sm
      transition-all duration-200 ease-in-out
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center gap-2 shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
    `;
    
    switch (action) {
      case 'ideas':
        return `${baseClass} bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50`;
      case 'whatif':
        return `${baseClass} bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40`;
      case 'help':
        return `${baseClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
      case 'continue':
        return `${baseClass} bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-blue-700`;
      case 'refine':
        return `${baseClass} bg-primary-200 dark:bg-primary-800/40 text-primary-800 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-800/60`;
      default:
        return `${baseClass} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700`;
    }
  };

  return (
    <div className="quick-reply-chips px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {replies.map((reply) => (
            <button
              key={reply.action}
              onClick={() => onSelect(reply.action)}
              disabled={disabled}
              className={getButtonClass(reply.action)}
              title={getTooltip(reply.action)}
              aria-label={`${reply.label}: ${getTooltip(reply.action)}`}
            >
              {getIcon(reply.action)}
              <span>{reply.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};