// EmptyState.jsx - Empty state component for ALF Coach
// Follows ALF Design System specifications with soft shadows and blue primary color

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Search, 
  MessageSquare, 
  BookOpen, 
  Users, 
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Icon } from '../design-system';

const EmptyState = ({
  variant = 'default', // default, search, conversation, blueprints, community
  title,
  description,
  icon,
  action,
  onAction,
  actionIcon,
  className = '',
  size = 'md' // sm, md, lg
}) => {
  // Predefined variants with appropriate content
  const variants = {
    default: {
      icon: Sparkles,
      title: 'Nothing here yet',
      description: 'This space is waiting for content to be added.',
      colors: {
        iconBg: 'bg-primary-50',
        iconColor: 'text-primary-500',
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        actionColor: 'bg-primary-600 hover:bg-primary-700 text-white'
      }
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search terms or browse our featured content.',
      colors: {
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-400',
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        actionColor: 'bg-primary-600 hover:bg-primary-700 text-white'
      }
    },
    conversation: {
      icon: MessageSquare,
      title: 'Start a conversation',
      description: 'Ask ALF anything about lesson planning, curriculum design, or educational strategies.',
      action: 'Get started',
      actionIcon: ArrowRight,
      colors: {
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        actionColor: 'bg-primary-600 hover:bg-primary-700 text-white'
      }
    },
    blueprints: {
      icon: FileText,
      title: 'No blueprints yet',
      description: 'Create your first lesson blueprint to get started with ALF Coach.',
      action: 'Create Blueprint',
      actionIcon: PlusCircle,
      colors: {
        iconBg: 'bg-green-50',
        iconColor: 'text-green-500',
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        actionColor: 'bg-primary-600 hover:bg-primary-700 text-white'
      }
    },
    community: {
      icon: Users,
      title: 'Connect with educators',
      description: 'Join our community of educators to share ideas and best practices.',
      action: 'Explore Community',
      actionIcon: ArrowRight,
      colors: {
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        actionColor: 'bg-primary-600 hover:bg-primary-700 text-white'
      }
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'py-8 px-4',
      iconSize: 'w-12 h-12',
      iconContainer: 'w-12 h-12',
      titleSize: 'text-base font-semibold',
      descSize: 'text-sm',
      descWidth: 'max-w-xs',
      spacing: 'space-y-3',
      actionSize: 'text-sm px-4 py-2'
    },
    md: {
      container: 'py-12 px-6',
      iconSize: 'w-8 h-8',
      iconContainer: 'w-16 h-16',
      titleSize: 'text-lg font-semibold',
      descSize: 'text-sm',
      descWidth: 'max-w-sm',
      spacing: 'space-y-4',
      actionSize: 'text-sm px-5 py-2.5'
    },
    lg: {
      container: 'py-16 px-8',
      iconSize: 'w-10 h-10',
      iconContainer: 'w-20 h-20',
      titleSize: 'text-xl font-semibold',
      descSize: 'text-base',
      descWidth: 'max-w-md',
      spacing: 'space-y-6',
      actionSize: 'text-base px-6 py-3'
    }
  };

  const config = sizeConfig[size];
  const variantConfig = variants[variant] || variants.default;

  // Use props or fall back to variant defaults
  const finalIcon = icon || variantConfig.icon;
  const finalTitle = title || variantConfig.title;
  const finalDescription = description || variantConfig.description;
  const finalAction = action || variantConfig.action;
  const finalActionIcon = actionIcon || variantConfig.actionIcon;
  const colors = variantConfig.colors;

  const IconComponent = finalIcon;
  const ActionIconComponent = finalActionIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center ${config.container} ${className}`}
    >
      <div className={config.spacing}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`
            ${config.iconContainer} ${colors.iconBg} rounded-xl 
            flex items-center justify-center mx-auto shadow-sm
          `}
        >
          <IconComponent className={`${config.iconSize} ${colors.iconColor}`} />
        </motion.div>

        {/* Content */}
        <div className={config.spacing}>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={`${config.titleSize} ${colors.titleColor}`}
          >
            {finalTitle}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className={`${config.descSize} ${colors.descColor} ${config.descWidth} mx-auto leading-relaxed`}
          >
            {finalDescription}
          </motion.p>
        </div>

        {/* Action Button */}
        {finalAction && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className={`
              inline-flex items-center gap-2 ${config.actionSize} 
              ${colors.actionColor} rounded-lg font-medium
              shadow-md hover:shadow-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            `}
          >
            {finalAction}
            {ActionIconComponent && (
              <ActionIconComponent className="w-4 h-4" />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Helper components for common use cases
export const SearchEmptyState = (props) => (
  <EmptyState variant="search" {...props} />
);

export const ConversationEmptyState = (props) => (
  <EmptyState variant="conversation" {...props} />
);

export const BlueprintsEmptyState = (props) => (
  <EmptyState variant="blueprints" {...props} />
);

export const CommunityEmptyState = (props) => (
  <EmptyState variant="community" {...props} />
);

export default EmptyState;