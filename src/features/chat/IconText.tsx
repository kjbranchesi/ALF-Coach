import React from 'react';
import {
  // Only import icons that are actually used in the app
  Rocket,
  Lightbulb,
  MousePointer,
  Send,
  Check,
  Edit,
  HelpCircle,
  RefreshCw,
  Info,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Bug,
  CheckCircle,
  Sparkles,
  Beaker,
  ArrowLeft,
  User,
  Award,
  BookOpen,
  Zap,
  Target,
  Activity,
  CheckSquare,
  Link,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  Star,
  Heart,
  ThumbsUp,
  Share2,
  Copy,
  Clipboard,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wifi,
  Battery,
  type LucideIcon
} from 'lucide-react';

// Create a registry of available icons
const iconRegistry: Record<string, LucideIcon> = {
  Rocket,
  Lightbulb,
  MousePointer,
  Send,
  Check,
  Edit,
  HelpCircle,
  RefreshCw,
  Info,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Bug,
  CheckCircle,
  Sparkles,
  Beaker,
  ArrowLeft,
  User,
  Award,
  BookOpen,
  Zap,
  Target,
  Activity,
  CheckSquare,
  Link,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  Star,
  Heart,
  ThumbsUp,
  Share2,
  Copy,
  Clipboard,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wifi,
  Battery
};

interface IconTextProps {
  icon: string;
  text?: string;
  size?: number;
  className?: string;
}

export function IconText({ icon, text, size = 16, className = '' }: IconTextProps) {
  // Get the icon component from the registry
  const IconComponent = iconRegistry[icon];
  
  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found in registry. Add it to IconText.tsx if needed.`);
    return <span>{text || icon}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <IconComponent size={size} className="inline-block" />
      {text && <span>{text}</span>}
    </span>
  );
}

// Helper function to parse text with icon markers
export function parseIconText(text: string): React.ReactNode[] {
  // Pattern to match {{IconName}} or {{IconName:text}}
  const iconPattern = /\{\{(\w+)(?::([^}]+))?\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = iconPattern.exec(text)) !== null) {
    // Add text before the icon
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the icon
    const iconName = match[1];
    const iconText = match[2];
    parts.push(
      <IconText 
        key={`icon-${match.index}`}
        icon={iconName} 
        text={iconText}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Example usage in messages:
// "Welcome to {{Rocket}} ProjectCraft!"
// "Click {{MousePointer:here}} to continue"
// "{{Lightbulb}} Ideas - Get suggestions"