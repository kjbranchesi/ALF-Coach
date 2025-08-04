/**
 * QuickReplyChips.tsx - Action buttons below chat
 * Implements SOP requirement: static chip row above input
 */

import React from 'react';
import { type QuickReply } from '../../core/types/SOPTypes';

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
  // Define icons for each action type
  const getIcon = (action: string) => {
    switch (action) {
      case 'ideas':
        return '💡';
      case 'whatif':
        return '🤔';
      case 'help':
        return '❓';
      case 'continue':
        return '→';
      case 'refine':
        return '✏️';
      case 'edit':
        return '📝';
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
        return `${baseClass} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50`;
      case 'whatif':
        return `${baseClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40`;
      case 'help':
        return `${baseClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
      case 'continue':
        return `${baseClass} bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700`;
      case 'refine':
        return `${baseClass} bg-blue-200 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-800/60`;
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
            >
              <span>{getIcon(reply.action)}</span>
              <span>{reply.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};