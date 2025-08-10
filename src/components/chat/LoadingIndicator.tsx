/**
 * LoadingIndicator.tsx - Beautiful loading states for the chat interface
 * Provides context-aware loading messages
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Wand2 } from 'lucide-react';
import { textStyles } from '../../design-system/typography.config';

interface LoadingIndicatorProps {
  context?: 'thinking' | 'generating' | 'processing' | 'saving';
  message?: string;
  className?: string;
}

const loadingMessages = {
  thinking: [
    "Thinking about your response...",
    "Analyzing your input...",
    "Considering the best approach...",
    "Processing your ideas..."
  ],
  generating: [
    "Generating suggestions...",
    "Creating ideas for you...",
    "Building creative options...",
    "Crafting possibilities..."
  ],
  processing: [
    "Processing your request...",
    "Working on it...",
    "Almost there...",
    "Finalizing details..."
  ],
  saving: [
    "Saving your progress...",
    "Updating your project...",
    "Securing your work...",
    "Syncing changes..."
  ]
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  context = 'thinking',
  message,
  className = ''
}) => {
  // Select a random message if none provided
  const defaultMessage = message || loadingMessages[context][Math.floor(Math.random() * loadingMessages[context].length)];
  
  // Select icon based on context
  const Icon = context === 'generating' ? Wand2 : 
               context === 'thinking' ? Brain : 
               Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center justify-center p-8 ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated icon */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Loading text */}
        <div className="text-center">
          <motion.p 
            className={textStyles.chatAssistant}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {defaultMessage}
          </motion.p>
        </div>

        {/* Dots indicator */}
        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              animate={{ 
                y: [-4, 0, -4],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay 
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Inline loading indicator for chat bubbles
export const InlineLoadingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              delay 
            }}
            className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"
          />
        ))}
      </div>
      <span className={`${textStyles.chatRole} text-blue-500 dark:text-blue-400`}>
        ALF Coach is typing
      </span>
    </div>
  );
};

// Skeleton loader for content
export const ContentSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};