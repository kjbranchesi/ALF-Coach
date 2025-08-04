/**
 * Icon Component - Unified icon system using Lucide React
 * Replaces all emoji usage with consistent, accessible icons
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { tokens } from '../tokens';

// Icon name mapping for easy emoji replacement
export const iconMap = {
  // Navigation & UI
  menu: 'Menu',
  close: 'X',
  back: 'ArrowLeft',
  forward: 'ArrowRight',
  expand: 'ChevronDown',
  collapse: 'ChevronUp',
  external: 'ExternalLink',
  
  // Actions
  add: 'Plus',
  remove: 'Minus',
  edit: 'Edit3',
  delete: 'Trash2',
  save: 'Save',
  copy: 'Copy',
  share: 'Share2',
  download: 'Download',
  upload: 'Upload',
  refresh: 'RefreshCw',
  
  // Navigation
  chevronLeft: 'ChevronLeft',
  chevronRight: 'ChevronRight',
  chevronDown: 'ChevronDown',
  chevronUp: 'ChevronUp',
  menu: 'Menu',
  close: 'X',
  x: 'X',
  moreHorizontal: 'MoreHorizontal',
  
  // Chat/AI
  bot: 'Bot',
  send: 'Send',
  forward: 'Forward',
  message: 'MessageSquare',
  
  // UI Elements
  sun: 'Sun',
  moon: 'Moon',
  user: 'User',
  paperclip: 'Paperclip',
  send: 'Send',
  
  // Status & Feedback
  checkCircle: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  help: 'HelpCircle',
  
  // Educational (Emoji replacements)
  target: 'Target',        // 🎯
  rocket: 'Rocket',        // 🚀
  book: 'BookOpen',        // 📚
  lightbulb: 'Lightbulb',  // 💡
  tool: 'Settings',        // 🔧
  star: 'Star',           // 🌟
  palette: 'Palette',      // 🎨
  chart: 'BarChart3',      // 📊
  search: 'Search',        // 🔍
  gem: 'Gem',             // 💎
  brain: 'Brain',         // 🧠
  users: 'Users',         // 👥
  clock: 'Clock',         // 🕐
  calendar: 'Calendar',    // 📅
  
  // Performance level indicators
  seedling: 'Sprout',     // 🌱
  leaf: 'Leaf',           // 🌿
  tree: 'TreePine',       // 🌳
  award: 'Award',         // 🏆
  zap: 'Zap',            // ⚡
  successCheck: 'CheckCircle', // ✅
  documentText: 'FileText',   // 📝
  
  // Project stages
  ideation: 'Lightbulb',
  journey: 'Map',
  deliverables: 'Package',
  completed: 'Award',
  
  // Additional educational icons for wizard
  baby: 'Baby',
  school: 'School',
  graduationCap: 'GraduationCap',
  building: 'Building',
  calculator: 'Calculator',
  flask: 'Flask',
  globe: 'Globe',
  activity: 'Activity',
  languages: 'Languages',
  trending: 'TrendingUp',
  tools: 'Wrench',
  scales: 'Scale',
  heart: 'Heart',
  gift: 'Gift',
  
  // Features
  chat: 'MessageSquare',
  analytics: 'TrendingUp',
  settings: 'Settings',
  profile: 'User',
  sparkles: 'Sparkles',
  search: 'Search',
  filter: 'Filter',
  bell: 'Bell',
  
  // Content types
  video: 'Video',
  audio: 'Mic',
  document: 'FileText',
  image: 'Image',
  code: 'Code',
  
  // ALF Branding (MUST use per DESIGN-SOP.md)
  layers: 'Layers',
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const sizeMap = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
}) => {
  const iconName = iconMap[name];
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<LucideIcons.LucideProps>;
  
  if (!IconComponent) {
    console.error(`Icon "${name}" not found in icon map`);
    return null;
  }
  
  return (
    <IconComponent
      size={sizeMap[size]}
      color={color}
      strokeWidth={strokeWidth}
      className={`alf-icon ${className}`}
      aria-hidden="true"
    />
  );
};


// Status icon with built-in colors
export const StatusIcon: React.FC<{
  status: 'success' | 'error' | 'warning' | 'info';
  size?: IconProps['size'];
  className?: string;
}> = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    success: { icon: 'checkCircle' as IconName, color: tokens.colors.semantic.success },
    error: { icon: 'error' as IconName, color: tokens.colors.semantic.error },
    warning: { icon: 'warning' as IconName, color: tokens.colors.semantic.warning },
    info: { icon: 'info' as IconName, color: tokens.colors.semantic.info },
  };
  
  const config = statusConfig[status];
  
  return (
    <Icon
      name={config.icon}
      size={size}
      color={config.color}
      className={className}
    />
  );
};