import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { type WizardData, type JourneyData, getJourneyData } from '../../types/blueprint';
import { getAllSampleBlueprints } from '../../utils/sampleBlueprints';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { type EnhancedHeroProjectData } from '../../services/HeroProjectTransformer';
import type { HeroProjectData } from '../../utils/hero/types';
// Export functionality removed as requested
import { 
  ChevronDown,
  ChevronLeft,
  FileText,
  Sparkles,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Star,
  Award,
  Target,
  BookOpen,
  Users,
  Lightbulb,
  Zap,
  Globe,
  Calendar,
  Settings,
  Eye,
  Heart,
  TrendingUp,
  Shield,
  Navigation,
  MapPin,
  Clock,
  Layers,
  Beaker,
  PieChart,
  BarChart3,
  MessageCircle,
  Share2,
  Download
} from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'primary' | 'ai' | 'coral' | 'success' | 'premium' | 'impact';
  badge?: string;
  estimatedReadTime?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string;
}

function CollapsiblePanel({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  defaultOpen = true, 
  variant = 'primary',
  badge 
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantClasses = {
    primary: {
      gradient: 'from-primary-50 via-primary-50/50 to-transparent',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      border: 'border-primary-200/60 hover:border-primary-300',
      shadow: 'hover:shadow-primary/20',
      badge: 'bg-primary-500 text-white'
    },
    ai: {
      gradient: 'from-ai-50 via-ai-50/50 to-transparent',
      iconBg: 'bg-gradient-to-br from-ai-500 to-ai-600',
      border: 'border-ai-200/60 hover:border-ai-300',
      shadow: 'hover:shadow-ai/20',
      badge: 'bg-ai-500 text-white'
    },
    coral: {
      gradient: 'from-coral-50 via-coral-50/50 to-transparent',
      iconBg: 'bg-gradient-to-br from-coral-500 to-coral-600',
      border: 'border-coral-200/60 hover:border-coral-300',
      shadow: 'hover:shadow-coral/20',
      badge: 'bg-coral-500 text-white'
    },
    success: {
      gradient: 'from-success-50 via-success-50/50 to-transparent',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
      border: 'border-success-200/60 hover:border-success-300',
      shadow: 'hover:shadow-success/20',
      badge: 'bg-success-500 text-white'
    }
  };

  const classes = variantClasses[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden bg-white dark:bg-gray-800/50 
        rounded-3xl border ${classes.border}
        shadow-elevation-2 hover:shadow-elevation-4 ${classes.shadow}
        backdrop-blur-sm transition-all duration-300 
        hover:bg-gradient-to-br hover:${classes.gradient}
      `}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full px-8 py-6 flex items-center justify-between group transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          {/* Enhanced icon with pillbox design */}
          <div className={`
            relative p-3 ${classes.iconBg} rounded-2xl shadow-elevation-2
            group-hover:shadow-elevation-3 transition-all duration-200
            group-hover:scale-105 transform
          `}>
            <Icon className="w-6 h-6 text-white" />
            {badge && (
              <div className={`
                absolute -top-2 -right-2 px-2 py-1 
                ${classes.badge} rounded-full text-xs font-semibold
                shadow-sm animate-pulse-soft
              `}>
                {badge}
              </div>
            )}
          </div>
          
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 group-hover:bg-gray-200 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative px-8 pb-8 pt-2">
              {/* Content container with subtle background */}
              <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Hero Stats Component
function HeroStats({ wizardData, journeyData }: { wizardData: WizardData, journeyData?: JourneyData }) {
  const stats = [
    {
      icon: Users,
      label: 'Age Group',
      value: wizardData.ageGroup || 'Not specified',
      color: 'primary'
    },
    {
      icon: Target,
      label: 'Learning Phases',
      value: journeyData?.phases?.length || 0,
      color: 'ai'
    },
    {
      icon: CheckCircle,
      label: 'Activities',
      value: journeyData?.activities?.length || 0,
      color: 'coral'
    },
    {
      icon: BookOpen,
      label: 'Resources',
      value: journeyData?.resources?.length || 0,
      color: 'success'
    }
  ];

  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    ai: 'from-ai-500 to-ai-600', 
    coral: 'from-coral-500 to-coral-600',
    success: 'from-success-500 to-success-600'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} rounded-xl`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Project Quality Badge Component
function QualityBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-warning-400 to-warning-500 text-white px-4 py-2 rounded-full shadow-elevation-2 hover:shadow-elevation-3 transition-all"
    >
      <Star className="w-4 h-4 fill-current" />
      <span className="text-sm font-semibold">World-Class PBL</span>
    </motion.div>
  );
}

export function ReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for enhanced hero project data
  const [heroData, setHeroData] = useState<EnhancedHeroProjectData | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [heroError, setHeroError] = useState<Error | null>(null);

  // For pre-built hero projects, we need to get the sample data directly
  const isPrebuiltHero = id?.startsWith('hero-');

  // Use a different hook based on whether it's a pre-built hero project or regular blueprint
  const { blueprint: firestoreBlueprint, loading: firestoreLoading, error: firestoreError } = useBlueprintDoc(isPrebuiltHero ? '' : (id || ''));

  // Get pre-built hero project data if needed
  const prebuiltHeroData = React.useMemo(() => {
    if (!isPrebuiltHero || !id) {return null;}
    const samples = getAllSampleBlueprints('anonymous');
    return samples.find(s => s.id === id);
  }, [id, isPrebuiltHero]);

  // Load enhanced hero project data for educator projects
  useEffect(() => {
    if (isPrebuiltHero || !id) {
      setIsLoadingHero(false);
      return;
    }

    const loadHeroData = async () => {
      try {
        setIsLoadingHero(true);
        setHeroError(null);

        console.log(`[ReviewScreen] Loading enhanced hero data for: ${id}`);
        const enhanced = await unifiedStorage.loadHeroProject(id);

        if (enhanced) {
          setHeroData(enhanced);
          console.log(`[ReviewScreen] Enhanced hero data loaded successfully: ${id}`);
        } else {
          console.warn(`[ReviewScreen] No hero data found for: ${id}`);
        }
      } catch (error) {
        console.error(`[ReviewScreen] Failed to load hero data:`, error);
        setHeroError(error as Error);
      } finally {
        setIsLoadingHero(false);
      }
    };

    loadHeroData();
  }, [id, isPrebuiltHero]);

  // Combine the data sources based on project type
  const blueprint = isPrebuiltHero ? prebuiltHeroData : firestoreBlueprint;
  const loading = isPrebuiltHero ? false : (firestoreLoading || isLoadingHero);
  const error = isPrebuiltHero ? null : (firestoreError || heroError);

  // Use enhanced hero data if available, otherwise fall back to blueprint
  const displayData = heroData || blueprint;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-ai-50/30 to-coral-50/20 p-6 flex items-center justify-center">
        <motion.div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mb-4"
          >
            <Sparkles className="w-16 h-16 text-ai-600 mx-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Creating Your Project Review</h2>
            <p className="text-gray-600">Preparing your world-class PBL presentation...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error || !displayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-ai-50/30 to-coral-50/20 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-elevation-3 p-8 text-center border border-white/30">
            <div className="w-16 h-16 bg-gradient-to-br from-error-400 to-error-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't locate the requested project.</p>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Extract data based on whether we have enhanced hero data or legacy blueprint
  const isEnhancedHero = heroData !== null;

  // For enhanced hero projects, use the rich hero structure
  // For legacy blueprints, extract from wizardData/journeyData
  const projectTitle = isEnhancedHero
    ? heroData.title
    : `${displayData.wizardData?.subject  } Project` || 'Untitled Project';

  const projectDescription = isEnhancedHero
    ? heroData.hero.description
    : displayData.wizardData?.motivation || '';

  const projectScope = isEnhancedHero
    ? heroData.context?.realWorld || heroData.overview?.description
    : displayData.wizardData?.scope || '';

  const projectLocation = isEnhancedHero
    ? heroData.impact?.audience?.primary?.join(', ') || 'Global Impact'
    : displayData.wizardData?.location || 'Global Impact';

  // For backward compatibility with existing display logic
  const wizardData = isEnhancedHero
    ? {
        subject: heroData.subjects?.[0] || 'Interdisciplinary',
        motivation: heroData.hero.description,
        scope: heroData.context?.realWorld || heroData.overview?.description,
        location: heroData.impact?.audience?.primary?.join(', ') || 'Global Impact',
        ageGroup: heroData.gradeLevel,
        duration: heroData.duration
      }
    : displayData.wizardData || {};

  const journeyData = isEnhancedHero
    ? {
        phases: heroData.journey?.phases || [],
        activities: heroData.journey?.phases?.flatMap(p => p.activities) || [],
        resources: heroData.resources?.required?.map(r => ({
          name: r.name,
          type: r.type,
          description: r.source || ''
        })) || [],
        deliverables: {
          milestones: heroData.journey?.milestones || [],
          rubric: {
            criteria: heroData.assessment?.rubric || []
          },
          impact: {
            audience: heroData.impact?.audience?.primary?.join(', ') || '',
            method: heroData.impact?.methods?.[0]?.method || ''
          }
        }
      }
    : getJourneyData(displayData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-ai-50/30 to-coral-50/20">
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <QualityBadge />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            {wizardData.subject} Project
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-xl text-gray-600 leading-relaxed mb-2">
              {wizardData.motivation}
            </p>
            <p className="text-lg text-gray-500 font-medium">
              {wizardData.scope} • {wizardData.location || 'Global Impact'}
            </p>
          </motion.div>
          
          {/* Floating Icons */}
          <div className="absolute top-10 left-10 animate-float">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl shadow-elevation-2 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute top-20 right-16 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-500 rounded-xl shadow-elevation-2 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
            <div className="w-8 h-8 bg-gradient-to-br from-ai-400 to-ai-500 rounded-lg shadow-elevation-2 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>
        
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <HeroStats wizardData={wizardData} journeyData={journeyData} />
        </motion.div>

        {/* Enhanced Content Panels */}
        <div className="space-y-8">
          {/* Project Foundation */}
          <CollapsiblePanel 
            title="Project Foundation" 
            subtitle="Core vision and parameters that drive this learning experience"
            icon={Sparkles}
            variant="primary"
            badge="Core"
          >
            <div className="space-y-6">
              {/* Motivation as hero element */}
              <div className="bg-gradient-to-r from-primary-50 to-ai-50 rounded-2xl p-6 border border-primary-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  Mission & Vision
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">{wizardData.motivation}</p>
              </div>
              
              {/* Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Subject Area</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{wizardData.subject}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Target Audience</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{wizardData.ageGroup}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Context</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{wizardData.location || 'Universal Application'}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Scope</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{wizardData.scope}</p>
                </div>
              </div>
              
              {wizardData.materials && (
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Required Materials</h4>
                  </div>
                  <p className="text-gray-700">{wizardData.materials}</p>
                </div>
              )}
            </div>
          </CollapsiblePanel>

          {/* Strategic Framework */}
          <CollapsiblePanel 
            title="Strategic Framework" 
            subtitle="The pedagogical approach and thinking framework"
            icon={Lightbulb}
            variant="ai"
            badge="AI Enhanced"
          >
            <div className="space-y-6">
              {/* Big Idea Hero */}
              {journeyData?.phases && journeyData.phases.length > 0 && (
                <div className="bg-gradient-to-r from-ai-50 to-coral-50 rounded-2xl p-6 border border-ai-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-ai-600" />
                    Big Idea
                  </h4>
                  <p className="text-gray-700 text-lg font-medium">{journeyData.phases[0]?.name || 'To be determined'}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-ai-600" />
                    <h4 className="font-semibold text-gray-900">Essential Question</h4>
                  </div>
                  <p className="text-gray-700">How might students apply their learning to create real impact?</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-ai-600" />
                    <h4 className="font-semibold text-gray-900">Core Challenge</h4>
                  </div>
                  <p className="text-gray-700">Design solutions that address authentic community needs</p>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          {/* Learning Journey */}
          <CollapsiblePanel 
            title="Learning Journey" 
            subtitle="Structured progression through authentic experiences"
            icon={ArrowRight}
            variant="coral"
            badge="Interactive"
          >
            <div className="space-y-8">
              {/* Learning Phases Timeline */}
              {journeyData?.phases && journeyData.phases.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-coral-600" />
                    Learning Phases
                  </h4>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gradient-to-b from-coral-200 to-coral-100"></div>
                    
                    <div className="space-y-6">
                      {journeyData.phases.map((phase, index) => (
                        <motion.div 
                          key={phase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="relative flex items-start gap-4"
                        >
                          {/* Timeline Node */}
                          <div className="w-12 h-12 bg-gradient-to-br from-coral-400 to-coral-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-elevation-2">
                            <span className="text-sm font-bold text-white">{index + 1}</span>
                          </div>
                          
                          {/* Phase Content */}
                          <div className="bg-white/60 rounded-xl p-4 border border-coral-100 flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">{phase.name}</h5>
                            <p className="text-gray-700 leading-relaxed">{phase.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activities by Phase */}
              {journeyData?.activities && journeyData.activities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-coral-600" />
                    Learning Activities
                  </h4>
                  <div className="grid gap-4">
                    {journeyData.phases.map(phase => {
                      const phaseActivities = journeyData.activities.filter(a => a.phaseId === phase.id);
                      if (phaseActivities.length === 0) {return null;}
                      
                      return (
                        <div key={phase.id} className="bg-white/40 rounded-xl p-4 border border-gray-100">
                          <h5 className="font-semibold text-gray-800 mb-3">{phase.name}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {phaseActivities.map(activity => (
                              <div key={activity.id} className="flex items-center gap-2 text-gray-700">
                                <div className="w-2 h-2 bg-coral-400 rounded-full flex-shrink-0"></div>
                                <span className="text-sm">{activity.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              {journeyData?.resources && journeyData.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-coral-600" />
                    Learning Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {journeyData.resources.map((resource, index) => (
                      <div key={index} className="bg-white/60 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-coral-100 to-coral-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-coral-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{resource.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsiblePanel>

          {/* Assessment & Impact */}
          <CollapsiblePanel 
            title="Assessment & Impact" 
            subtitle="Measuring success and authentic real-world connections"
            icon={Award}
            variant="success"
            badge="Outcomes"
          >
            <div className="space-y-8">
              {/* Learning Milestones */}
              {journeyData?.deliverables?.milestones && journeyData.deliverables.milestones.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    Learning Milestones
                  </h4>
                  <div className="grid gap-3">
                    {journeyData.deliverables.milestones.map((milestone, index) => (
                      <motion.div 
                        key={milestone.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/60 rounded-xl p-4 border border-success-100 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-success-400 to-success-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{milestone.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Framework */}
              {journeyData?.deliverables?.rubric?.criteria && journeyData.deliverables.rubric.criteria.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-success-600" />
                    Assessment Criteria
                  </h4>
                  <div className="grid gap-4">
                    {journeyData.deliverables.rubric.criteria.map(criterion => (
                      <div key={criterion.id} className="bg-white/40 rounded-xl p-4 border border-gray-100">
                        <h5 className="font-semibold text-gray-900 mb-2">{criterion.name}</h5>
                        <p className="text-gray-700 leading-relaxed">{criterion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-World Impact */}
              {journeyData?.deliverables?.impact?.audience && (
                <div className="bg-gradient-to-r from-success-50 to-ai-50 rounded-2xl p-6 border border-success-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-success-600" />
                    Authentic Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Target Audience</h5>
                      <p className="text-gray-700">{journeyData.deliverables.impact.audience}</p>
                    </div>
                    {journeyData.deliverables.impact.method && (
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Impact Method</h5>
                        <p className="text-gray-700">{journeyData.deliverables.impact.method}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsiblePanel>
        </div>

        {/* Enhanced Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-elevation-2 text-center"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Bring This Vision to Life?</h3>
            <p className="text-gray-600">Take the next step in your project-based learning journey</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/app/blueprint/${id}/chat`)}
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2 font-semibold text-gray-700 hover:text-primary-700 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Continue Refining
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-ai-500 text-white rounded-2xl hover:from-primary-600 hover:to-ai-600 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 font-semibold flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Back to Dashboard
            </motion.button>
          </div>
          
          {/* Inspiration Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500 italic">
              "Every great project starts with a vision. You've just created one that will inspire students for years to come."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
