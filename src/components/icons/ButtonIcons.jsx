// ButtonIcons.jsx - Centralized lucide-react icons for buttons
// All icons now come from lucide-react for consistency

export {
  // Navigation
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  SkipForward as SkipForwardIcon,
  
  // Content & UI
  Lightbulb as LightbulbIcon,
  FileText as FileTextIcon,
  HelpCircle as HelpCircleIcon,
  
  // Actions
  Edit2 as EditIcon,
  RefreshCw as RefreshIcon,
  
  // States & Feedback
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Eye as EyeIcon,
  Shield as ShieldIcon,
  
  // General
  Plus as PlusIcon,
  Sparkles as SparklesIcon,
  X,
  User as UserIcon,
  Send as SendIcon,
  Link,
  MessageCircle as ChatBubbleIcon,
  Map as MapIcon,
  Package as PackageIcon,
  
} from 'lucide-react';

// Re-export for backward compatibility
export const ButtonIconComponents = {
  ArrowRight: 'ArrowRightIcon',
  ArrowLeft: 'ArrowLeftIcon',
  Lightbulb: 'LightbulbIcon',
  FileText: 'FileTextIcon',
  HelpCircle: 'HelpCircleIcon',
  Edit: 'EditIcon',
  Refresh: 'RefreshIcon',
  Check: 'CheckIcon',
  CheckCircle: 'CheckCircleIcon',
  AlertTriangle: 'AlertTriangleIcon',
  Eye: 'EyeIcon',
  Shield: 'ShieldIcon',
  Plus: 'PlusIcon',
  Send: 'SendIcon',
  Sparkles: 'SparklesIcon',
  X: 'X',
  Link: 'Link'
};