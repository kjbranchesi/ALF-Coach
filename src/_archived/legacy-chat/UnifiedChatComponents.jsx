// [ARCHIVED 2025-08-31] UnifiedChatComponents.jsx - Legacy shared chat widgets

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles, CheckCircle, AlertCircle, Info, Target, BookOpen, FileText } from 'lucide-react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';

// Icon mappings for different card types
const cardIcons = {
  suggestion: Sparkles,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  objective: Target,
  resource: BookOpen,
  document: FileText,
  default: Info
};

// Card type color schemes following ALF design system
const cardColorSchemes = {
  suggestion: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    text: 'text-primary-900'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900'
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    text: 'text-orange-900'
  },
  info: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    text: 'text-gray-900'
  },
  objective: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-900'
  },
  resource: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    text: 'text-teal-900'
  },
  document: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    text: 'text-indigo-900'
  },
  default: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    text: 'text-gray-900'
  }
};

/**
 * Unified Message Component for consistent chat UI
 */
export const UnifiedMessage = ({ 
  role, 
  content, 
  timestamp, 
  showAvatar = true,
  className = '' 
}) => {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${className}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
            : 'bg-gradient-to-br from-purple-100 to-purple-200'
          }
        `}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-purple-600" />
          )}
        </div>
      )}
      
      {/* Message Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`
          rounded-2xl px-5 py-4 shadow-sm
          ${isUser 
            ? 'bg-gradient-to-br from-primary-600 to-blue-700 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
          }
        `}>
          {typeof content === 'string' ? (
            <Remark
              remarkPlugins={[remarkGfm]}
              className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
            >
              {content}
            </Remark>
          ) : (
            content
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <span className={`text-xs px-2 ${isUser ? 'text-right text-gray-500' : 'text-gray-500'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Unified Card Component with visual hierarchy
 */
export const UnifiedCard = ({ 
  type = 'default',
  title,
  content,
  action,
  onAction,
  className = '',
  compact = false
}) => {
  const colors = cardColorSchemes[type] || cardColorSchemes.default;
  const IconComponent = cardIcons[type] || cardIcons.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`
        ${colors.bg} ${colors.border} border rounded-xl overflow-hidden
        ${compact ? 'p-3' : 'p-4'} ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${compact ? 'mt-0.5' : 'mt-1'}`}>
          <IconComponent className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} ${colors.icon}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${colors.text} ${compact ? 'text-sm mb-1' : 'mb-2'}`}>
              {title}
            </h4>
          )}
          <div className={`${colors.text} opacity-90 ${compact ? 'text-sm' : ''}`}>
            {typeof content === 'string' ? (
              <Remark remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                {content}
              </Remark>
            ) : (
              content
            )}
          </div>
          
          {/* Action Button */}
          {action && onAction && (
            <button
              onClick={onAction}
              className={`
                mt-3 text-sm font-medium ${colors.icon} hover:underline
                flex items-center gap-1 transition-colors
              `}
            >
              {action}
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Loading Animation Component
 */
export const UnifiedLoading = ({ message = "ALF is thinking..." }) => {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex gap-1">
        <motion.div
          className="w-2 h-2 bg-purple-600 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-600 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-600 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-sm text-gray-600 italic">{message}</span>
    </div>
  );
};

/**
 * Empty State Component
 */
export const UnifiedEmptyState = ({ 
  title = "No content yet",
  description = "Start a conversation to see messages here",
  icon: IconComponent = Sparkles
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm">{description}</p>
    </div>
  );
};

/**
 * Chat Input Component
 */
export const UnifiedChatInput = ({ 
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  showSuggestions = false,
  suggestions = []
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <div className="space-y-2">
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onChange(suggestion)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Input Field */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
