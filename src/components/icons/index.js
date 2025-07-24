// Centralized icon exports from lucide-react
export {
  // Navigation
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  
  // Content & UI
  Lightbulb,
  FileText,
  HelpCircle,
  BookOpen,
  Clipboard,
  
  // Actions
  Edit2 as Edit,
  RefreshCw as Refresh,
  Plus,
  Send,
  Link,
  Printer,
  LogOut,
  
  // States & Feedback
  Check,
  CheckCircle,
  AlertTriangle,
  Eye,
  Shield,
  X,
  Loader2 as Loader,
  
  // Objects & Concepts
  User,
  Users,
  Target,
  Rocket,
  Sparkles,
  MessageCircle as ChatBubble,
  Map,
  Package,
  Home,
  Moon,
  Sun,
  Bot,
  MapPin as Location,
  Wrench as Tools,
  
  // Document
  FileText as Document,
  PlusCircle,
  
} from 'lucide-react';

// Animation wrapper for consistent icon animations
export const AnimatedIcon = ({ icon: Icon, className = "", animate = false, ...props }) => {
  const animationClass = animate ? "animate-pulse" : "";
  return <Icon className={`${className} ${animationClass}`} {...props} />;
};

// Consistent icon sizing
export const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10"
};

// Default icon props
export const defaultIconProps = {
  className: iconSizes.md,
  strokeWidth: 2
};