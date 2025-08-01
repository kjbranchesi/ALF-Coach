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

  // Define colors for each action type
  const getButtonClass = (action: string) => {
    const baseClass = `
      px-4 py-2 rounded-full font-medium text-sm
      transition-all duration-200 ease-in-out
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center gap-2
    `;
    
    switch (action) {
      case 'ideas':
        return `${baseClass} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50`;
      case 'whatif':
        return `${baseClass} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50`;
      case 'help':
        return `${baseClass} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50`;
      case 'continue':
        return `${baseClass} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50`;
      case 'refine':
        return `${baseClass} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50`;
      default:
        return `${baseClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
    }
  };

  return (
    <div className="quick-reply-chips px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 justify-center">
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
  );
};