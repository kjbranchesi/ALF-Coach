/**
 * IconFixed Component - Fixed version without dynamic property access
 * This resolves the initialization error caused by dynamic lucide-react imports
 */

import React from 'react';
import {
  Home, ArrowLeft, ChevronDown, ChevronUp, ExternalLink,
  Plus, Minus, Edit3, Trash2, Save, Copy, Share2, Download, Upload, RefreshCw, Check,
  X, Search, Filter, Menu, MoreVertical, MoreHorizontal,
  AlertCircle, Info, HelpCircle, CheckCircle, XCircle,
  Lightbulb, Zap, Target, Flag, Calendar, Clock, Tag,
  FileText, Folder, Database, Code, Terminal,
  Users, UserPlus, UserCheck, MessageSquare, Send, Archive, Inbox,
  Star, Heart, ThumbsUp, Award, Trophy, Gift,
  Play, Pause, SkipForward, SkipBack, Volume2,
  Settings, LogOut, LogIn, Lock, Unlock, Eye, EyeOff,
  Book, BookOpen, GraduationCap, Briefcase, MapPin, Compass, Map, Package,
  Baby, School, Building, Calculator, FlaskConical, Globe, Activity, Languages,
  TrendingUp, Wrench, Scale, Video, Mic, Image, Layers, Sparkles, Bell
} from 'lucide-react';

// Static icon map - no dynamic property access
const iconComponents = {
  // Navigation & UI
  home: Home,
  back: ArrowLeft,
  expand: ChevronDown,
  collapse: ChevronUp,
  external: ExternalLink,
  
  // Actions
  add: Plus,
  remove: Minus,
  edit: Edit3,
  delete: Trash2,
  save: Save,
  copy: Copy,
  share: Share2,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  check: Check,
  
  // Common UI
  close: X,
  search: Search,
  filter: Filter,
  menu: Menu,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  
  // Status & Alerts
  alert: AlertCircle,
  info: Info,
  help: HelpCircle,
  success: CheckCircle,
  error: XCircle,
  
  // Content & Ideas
  idea: Lightbulb,
  spark: Zap,
  target: Target,
  flag: Flag,
  calendar: Calendar,
  clock: Clock,
  tag: Tag,
  
  // Files & Data
  file: FileText,
  folder: Folder,
  database: Database,
  code: Code,
  terminal: Terminal,
  
  // Users & Social
  users: Users,
  userAdd: UserPlus,
  userCheck: UserCheck,
  message: MessageSquare,
  send: Send,
  archive: Archive,
  inbox: Inbox,
  
  // Feedback & Rewards
  star: Star,
  heart: Heart,
  like: ThumbsUp,
  award: Award,
  trophy: Trophy,
  gift: Gift,
  
  // Media controls
  play: Play,
  pause: Pause,
  next: SkipForward,
  previous: SkipBack,
  volume: Volume2,
  
  // Auth & Settings
  settings: Settings,
  logout: LogOut,
  login: LogIn,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  eyeOff: EyeOff,
  
  // Education
  book: Book,
  bookOpen: BookOpen,
  graduationCap: GraduationCap,
  briefcase: Briefcase,
  location: MapPin,
  compass: Compass,
  
  // ALF Specific
  ideation: Lightbulb,
  journey: Map,
  deliverables: Package,
  completed: Award,
  
  // Additional educational icons
  baby: Baby,
  school: School,
  building: Building,
  calculator: Calculator,
  flask: FlaskConical,
  globe: Globe,
  activity: Activity,
  languages: Languages,
  trending: TrendingUp,
  tools: Wrench,
  scales: Scale,
  
  // Features
  chat: MessageSquare,
  analytics: TrendingUp,
  profile: Users,
  sparkles: Sparkles,
  bell: Bell,
  
  // Content types
  video: Video,
  audio: Mic,
  document: FileText,
  image: Image,
  
  // ALF Branding
  layers: Layers,
} as const;

export type IconName = keyof typeof iconComponents;

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
  const IconComponent = iconComponents[name];
  
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
  const configs = {
    success: { icon: 'success' as IconName, color: 'text-green-500' },
    error: { icon: 'error' as IconName, color: 'text-red-500' },
    warning: { icon: 'alert' as IconName, color: 'text-yellow-500' },
    info: { icon: 'info' as IconName, color: 'text-blue-500' },
  };
  
  const config = configs[status];
  
  return (
    <Icon
      name={config.icon}
      size={size}
      className={`${config.color} ${className}`}
    />
  );
};

// Animated icon wrapper
export const AnimatedIcon: React.FC<IconProps & { animate?: boolean }> = ({
  animate = false,
  ...props
}) => {
  return (
    <div className={animate ? 'animate-pulse' : ''}>
      <Icon {...props} />
    </div>
  );
};