import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { type WizardData, type JourneyData, getJourneyData } from '../../types/blueprint';
import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import { getAllSampleBlueprints } from '../../utils/sampleBlueprints';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { type EnhancedHeroProjectData } from '../../services/HeroProjectTransformer';
import type { HeroProjectData } from '../../utils/hero/types';
// SECURITY: XSS prevention with DOMPurify sanitization
import {
  sanitizeStrict,
  sanitizeBasicText,
  sanitizeRichContent,
  sanitizeShowcase
} from '../../utils/sanitize';
// PHASE A: Cloud-first reads
import { projectLoadService } from '../../services/ProjectLoadService';
import { featureFlags } from '../../config/featureFlags';
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

function convertShowcaseToJourneyData(showcase: ProjectShowcaseV2): JourneyData {
  // SECURITY: Sanitize all content from showcase (already sanitized in parent, but defensive)
  const phases = (showcase.runOfShow || []).map((week, index) => {
    const name = sanitizeStrict(week.weekLabel || week.kind || `Week ${index + 1}`);
    const primaryDeliverable = sanitizeBasicText(week.deliverables?.[0] || '');
    const primaryActivity = sanitizeBasicText(week.students?.[0] || week.teacher?.[0] || '');

    return {
      id: `phase-${index + 1}`,
      name,
      description: sanitizeBasicText(week.focus || ''),
      goal: sanitizeBasicText(week.focus || ''),
      activity: primaryActivity,
      output: primaryDeliverable,
      duration: week.repeatable ? 'Multi-week' : '1 week',
      interdisciplinary: undefined
    };
  });

  const activities = (showcase.runOfShow || []).flatMap((week, index) => {
    const phaseId = `phase-${index + 1}`;
    const studentActivities = (week.students || []).map((entry, activityIndex) => ({
      id: `${phaseId}-student-${activityIndex + 1}`,
      name: sanitizeBasicText(entry),
      phaseId,
      description: sanitizeBasicText(entry),
      duration: ''
    }));

    const teacherActivities = (week.teacher || []).map((entry, activityIndex) => ({
      id: `${phaseId}-teacher-${activityIndex + 1}`,
      name: sanitizeBasicText(entry),
      phaseId,
      description: sanitizeBasicText(entry),
      duration: ''
    }));

    return [...studentActivities, ...teacherActivities];
  });

  const resources = [
    ...(showcase.materialsPrep?.coreKit || []).map(item => ({
      name: sanitizeStrict(item),
      type: 'material',
      description: 'Core kit material'
    })),
    ...(showcase.materialsPrep?.noTechFallback || []).map(item => ({
      name: sanitizeStrict(item),
      type: 'material',
      description: 'No-tech fallback'
    }))
  ];

  const rubricCriteria = (showcase.polish?.microRubric || []).map((criterion, index) => ({
    id: `criterion-${index + 1}`,
    name: sanitizeBasicText(criterion),
    description: sanitizeBasicText(criterion),
    levels: []
  }));

  const milestones = (showcase.runOfShow || []).flatMap((week, index) =>
    (week.deliverables || []).map((deliverable, deliverableIndex) => ({
      id: `milestone-${index + 1}-${deliverableIndex + 1}`,
      name: sanitizeBasicText(deliverable),
      description: sanitizeBasicText(week.focus || ''),
      dueDate: ''
    }))
  );

  return {
    phases,
    activities,
    resources,
    deliverables: {
      milestones,
      rubric: { criteria: rubricCriteria },
      impact: {
        audience: (showcase.outcomes?.audiences || []).join(', ') || 'Community stakeholders',
        method: 'Authentic showcase',
        timeline: showcase.schedule ? `${showcase.schedule.totalWeeks} weeks` : undefined,
        measures: showcase.outcomes?.core
      },
      assessmentStrategy: 'Students exhibit learning through authentic milestone deliverables.'
    }
  };
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

export default function ReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // EMERGENCY: Wrap entire component in error boundary
  React.useEffect(() => {
    console.log('🔍 ReviewScreen mounted with id:', id);
    console.log('🔍 URL:', window.location.href);
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 Project-specific keys:', Object.keys(localStorage).filter(k => k.includes(id || 'none')));
  }, [id]);

  // State for enhanced hero project data
  const [heroData, setHeroData] = useState<EnhancedHeroProjectData | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [heroError, setHeroError] = useState<Error | null>(null);
  const [rawProjectData, setRawProjectData] = useState<any>(null);

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
      console.log('[ReviewScreen] Skipping hero load:', { isPrebuiltHero, hasId: !!id });
      setIsLoadingHero(false);
      return;
    }

    const loadHeroData = async () => {
      try {
        setIsLoadingHero(true);
        setHeroError(null);

        console.log(`[ReviewScreen] =========== LOADING PROJECT DATA ===========`);
        console.log(`[ReviewScreen] Project ID: ${id}`);
        console.log(`[ReviewScreen] Cloud-first enabled: ${featureFlags.cloudFirstReads}`);

        // PHASE A: Cloud-first load with automatic fallbacks
        if (featureFlags.cloudFirstReads) {
          console.log(`[ReviewScreen] 🌥️ Attempting cloud-first load...`);
          const loadResult = await projectLoadService.loadProject(id);

          if (loadResult.success && loadResult.showcase) {
            console.log(
              `[ReviewScreen] ✅ Loaded from ${loadResult.source} ` +
              `(rev ${loadResult.rev || 'unknown'})`
            );

            // BUG FIX: Don't reference displayData (doesn't exist yet)
            // Just use the showcase data we got from cloud
            setRawProjectData({
              showcase: loadResult.showcase,
              wizardData: {}, // Will be populated from showcase if needed
              status: 'completed',
              stage: 'review'
            });

            // Try hero transformation (optional enhancement)
            try {
              const enhanced = await unifiedStorage.loadHeroProject(id);
              if (enhanced) {
                setHeroData(enhanced);
                console.log(`[ReviewScreen] ✅ Hero transformation successful`);
              }
            } catch (heroErr) {
              console.warn(`[ReviewScreen] Hero transformation failed (non-fatal):`, heroErr);
              // Continue without hero data - we have showcase
            }

            setIsLoadingHero(false);
            return; // Success - exit early!
          } else {
            // BUG FIX: Cloud-first load failed - DON'T return, fall through to local!
            console.warn(
              `[ReviewScreen] ⚠️ Cloud-first load failed, falling back to local storage:`,
              loadResult.error
            );
            // Continue to legacy path below instead of returning
          }
        }

        // LEGACY PATH: Original load logic continues below
        // EMERGENCY FIX: Load raw project data directly from localStorage
        const rawKey = `alf_project_${id}`;
        const rawData = localStorage.getItem(rawKey);
        console.log(`[ReviewScreen] Raw localStorage data exists:`, !!rawData);

        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            console.log(`[ReviewScreen] Raw project data loaded:`, {
              hasShowcase: !!parsed.showcase,
              hasWizardData: !!parsed.wizardData,
              hasCapturedData: !!parsed.capturedData,
              hasShowcaseRef: !!parsed.showcaseRef,
              status: parsed.status,
              stage: parsed.stage,
              keys: Object.keys(parsed)
            });

            // CRITICAL FIX: If showcaseRef exists, rehydrate from IDB immediately
            // This happens BEFORE we check heroData, because showcase might be offloaded
            if (parsed.showcaseRef) {
              console.log(`[ReviewScreen] ShowcaseRef detected, rehydrating from IDB:`, parsed.showcaseRef);
              try {
                const hydrated = await unifiedStorage.loadProject(id);
                if (hydrated && hydrated.showcase) {
                  console.log(`[ReviewScreen] ✅ Rehydrated showcase from IDB`);
                  setRawProjectData(hydrated);
                } else {
                  console.warn(`[ReviewScreen] ⚠️ IDB rehydration returned no showcase, using localStorage version`);
                  setRawProjectData(parsed);
                }
              } catch (idbError) {
                console.error(`[ReviewScreen] IDB rehydration failed:`, idbError);
                setRawProjectData(parsed);
              }
            } else {
              // No showcaseRef, use parsed data directly
              setRawProjectData(parsed);
            }
          } catch (parseError) {
            console.error(`[ReviewScreen] Failed to parse raw data:`, parseError);
          }
        }

        console.log(`[ReviewScreen] LocalStorage keys:`, Object.keys(localStorage).filter(k => k.includes(id)));

        // Try hero transformation (but don't fail if it doesn't work)
        try {
          const enhanced = await unifiedStorage.loadHeroProject(id);

          console.log(`[ReviewScreen] Hero data loaded:`, {
            exists: !!enhanced,
            keys: enhanced ? Object.keys(enhanced) : [],
            hasShowcase: !!(enhanced as any)?.showcase,
            transformationMeta: (enhanced as any)?.transformationMeta
          });

          if (enhanced) {
            setHeroData(enhanced);
            console.log(`[ReviewScreen] ✅ Hero data loaded successfully: ${id}`);
          } else {
            console.warn(`[ReviewScreen] ⚠️ No hero data returned, using raw project data`);
            // If raw has an IDB pointer, rehydrate from unified loader
            try {
              const rawParsed = rawData ? JSON.parse(rawData) : null;
              if (rawParsed?.showcaseRef) {
                const hydrated = await unifiedStorage.loadProject(id);
                if (hydrated) {
                  setRawProjectData(hydrated);
                  console.log('[ReviewScreen] Rehydrated raw project from IDB');
                }
              }
            } catch (e) {
              // ignore
            }

            // Cloud fallback: if Firestore blueprint has a Storage pointer, fetch it now
            try {
              const projectShowcaseRef = (firestoreBlueprint as any)?.projectData?.showcaseRef
                || (firestoreBlueprint as any)?.showcaseRef
                || (firestoreBlueprint as any)?.project?.showcaseRef;
              if (projectShowcaseRef?.storage === 'cloud') {
                const { CloudBlobService } = await import('../../services/CloudBlobService');
                const json = await CloudBlobService.downloadJSON(projectShowcaseRef);
                if (json) {
                  setRawProjectData((prev: any) => ({ ...(prev || {}), showcase: json }));
                  console.log('[ReviewScreen] Loaded showcase from Cloud Storage');
                }
              }
            } catch (e) {
              console.warn('[ReviewScreen] Cloud fallback failed', (e as Error)?.message);
            }
          }
        } catch (heroErr) {
          console.warn(`[ReviewScreen] Hero transformation failed, using raw data:`, heroErr);
        }

      } catch (error) {
        console.error(`[ReviewScreen] ❌ Project load failed:`, error);
        console.error(`[ReviewScreen] Error details:`, {
          message: (error as Error).message,
          stack: (error as Error).stack
        });
        setHeroError(error as Error);
      } finally {
        setIsLoadingHero(false);
        console.log(`[ReviewScreen] =========== LOAD COMPLETE ===========`);
      }
    };

    loadHeroData();
  }, [id, isPrebuiltHero]);

  // Combine the data sources based on project type
  const blueprint = isPrebuiltHero ? prebuiltHeroData : firestoreBlueprint;
  const loading = isPrebuiltHero ? false : (firestoreLoading || isLoadingHero);

  // EMERGENCY FIX: Accept ANY data source
  // Priority: heroData > rawProjectData > blueprint (Firestore)
  const hasAnyData = heroData || rawProjectData || blueprint;
  const error = isPrebuiltHero ? null : (hasAnyData ? null : (heroError || firestoreError));

  // EMERGENCY DEBUG
  console.log('🔍 ReviewScreen data check:', {
    id,
    isPrebuiltHero,
    hasHeroData: !!heroData,
    hasRawData: !!rawProjectData,
    hasBlueprint: !!blueprint,
    hasAnyData,
    hasError: !!error,
    loading,
    heroError: heroError?.message,
    firestoreError: firestoreError?.message
  });

  // Use best available data source
  const displayData = heroData || rawProjectData || blueprint;

  // Include raw local project showcase as a valid source to render
  // SECURITY: Sanitize showcase content to prevent XSS attacks
  const persistedShowcase = useMemo(() => {
    const rawShowcase = (rawProjectData as unknown as { showcase?: ProjectShowcaseV2 } | null)?.showcase;
    const heroShowcase = (heroData as unknown as { showcase?: ProjectShowcaseV2 } | null)?.showcase;
    const blueprintShowcase = (blueprint as unknown as { showcase?: ProjectShowcaseV2; projectData?: { showcase?: ProjectShowcaseV2 } } | null)?.showcase;
    const legacyShowcase = (blueprint as unknown as { projectData?: { showcase?: ProjectShowcaseV2 } } | null)?.projectData?.showcase;
    const unsanitizedShowcase = rawShowcase || heroShowcase || blueprintShowcase || legacyShowcase || null;

    // Sanitize the showcase to prevent XSS attacks
    return unsanitizedShowcase ? sanitizeShowcase(unsanitizedShowcase) : null;
  }, [heroData, rawProjectData, blueprint]);

  // Dev observability: which data source is used
  useEffect(() => {
    const source = heroData ? 'hero' : rawProjectData ? 'raw' : blueprint ? 'firestore' : 'none';
    console.log('[ReviewScreen] Selected data source:', { id, source, hasShowcase: !!persistedShowcase });
  }, [id, heroData, rawProjectData, blueprint, persistedShowcase]);

  // CRITICAL FIX: Define isEnhancedHero BEFORE journeyData useMemo to avoid TDZ error
  // Extract data based on whether we have enhanced hero data or legacy blueprint
  const isEnhancedHero = heroData !== null;

  // IMPORTANT: Hooks must always run in the same order on every render.
  // Define all hooks (useMemo/useEffect) before any early return.
  const journeyData = useMemo(() => {
    if (persistedShowcase) {
      return convertShowcaseToJourneyData(persistedShowcase);
    }

    if (isEnhancedHero && heroData) {
      return {
        phases: heroData?.journey?.phases || [],
        activities: heroData?.journey?.phases?.flatMap(p => p.activities) || [],
        resources: heroData?.resources?.required?.map(r => ({
          name: r.name,
          type: r.type,
          description: r.source || ''
        })) || [],
        deliverables: {
          milestones: heroData?.journey?.milestones || [],
          rubric: {
            criteria: heroData?.assessment?.rubric || []
          },
          impact: {
            audience: heroData?.impact?.audience?.primary?.join(', ') || '',
            method: heroData?.impact?.methods?.[0]?.method || ''
          }
        }
      };
    }

    // Safe fallback: if displayData is null, return empty journey data
    return displayData ? getJourneyData(displayData) : {};
  }, [persistedShowcase, isEnhancedHero, heroData, displayData]);

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
    // Log detailed error information for debugging
    console.error('[ReviewScreen] Error state:', {
      id,
      error,
      heroError,
      firestoreError,
      hasHeroData: !!heroData,
      hasBlueprint: !!blueprint,
      isPrebuiltHero,
      heroDataKeys: heroData ? Object.keys(heroData) : [],
      blueprintKeys: blueprint ? Object.keys(blueprint) : []
    });

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Project Preview</h2>
            <p className="text-gray-600 mb-4">
              {error ? error.message : "We couldn't locate the project preview data."}
            </p>
            <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>The project may still be processing - try refreshing in a moment</li>
                <li>Return to the chat to complete the project finalization</li>
                <li>Check your browser console for detailed error logs</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white border-2 border-primary-300 text-primary-700 rounded-2xl hover:bg-primary-50 transition-all duration-200 font-semibold"
              >
                Refresh Page
              </button>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // SECURITY: All user-facing content is sanitized to prevent XSS attacks
  const projectTitle = sanitizeStrict(
    persistedShowcase?.hero?.title
    || (isEnhancedHero ? heroData?.title : (displayData?.wizardData?.projectTopic || `${displayData?.wizardData?.subject || ''} Project`))
    || 'Untitled Project'
  );

  const projectDescription = sanitizeBasicText(
    persistedShowcase?.fullOverview
    || (isEnhancedHero ? heroData?.hero?.description : displayData?.wizardData?.motivation)
    || ''
  );

  const projectScope = sanitizeBasicText(
    persistedShowcase?.microOverview?.[0]
    || (isEnhancedHero ? (heroData?.context?.realWorld || heroData?.overview?.description) : displayData?.wizardData?.scope)
    || ''
  );

  const projectLocation = sanitizeStrict(
    persistedShowcase?.outcomes?.audiences?.join(', ')
    || (isEnhancedHero ? heroData?.impact?.audience?.primary?.join(', ') : displayData?.wizardData?.location)
    || 'Global Impact'
  );

  const baseWizardData = (displayData?.wizardData || {}) as Partial<WizardData>;
  // SECURITY: Sanitize all wizard data fields
  const wizardData = isEnhancedHero
    ? {
        ...baseWizardData,
        subject: sanitizeStrict(persistedShowcase?.hero?.subjects?.[0] || heroData?.subjects?.[0] || baseWizardData.subject || 'Interdisciplinary'),
        motivation: projectDescription || sanitizeBasicText(baseWizardData.motivation) || '',
        scope: projectScope || sanitizeBasicText(baseWizardData.scope) || '',
        location: projectLocation || sanitizeStrict(baseWizardData.location) || 'Global Impact',
        ageGroup: sanitizeStrict(persistedShowcase?.hero?.gradeBand || heroData?.gradeLevel || baseWizardData.ageGroup),
        duration: sanitizeStrict(persistedShowcase?.hero?.timeframe || heroData?.duration || baseWizardData.duration),
        materials: baseWizardData.materials ? sanitizeBasicText(baseWizardData.materials) : undefined
      }
    : {
        ...baseWizardData,
        subject: sanitizeStrict(persistedShowcase?.hero?.subjects?.[0] || baseWizardData.subject || 'Interdisciplinary'),
        motivation: projectDescription || sanitizeBasicText(baseWizardData.motivation) || '',
        scope: projectScope || sanitizeBasicText(baseWizardData.scope) || '',
        location: projectLocation || sanitizeStrict(baseWizardData.location) || 'Global Impact',
        ageGroup: sanitizeStrict(persistedShowcase?.hero?.gradeBand || baseWizardData.ageGroup),
        duration: sanitizeStrict(persistedShowcase?.hero?.timeframe || baseWizardData.duration),
        materials: baseWizardData.materials ? sanitizeBasicText(baseWizardData.materials) : undefined
      };

  

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
            {projectTitle}
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-xl text-gray-600 leading-relaxed mb-2">
              {projectDescription}
            </p>
            <p className="text-lg text-gray-500 font-medium">
              {projectScope || 'Project Overview'} • {projectLocation}
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

              {/* Assignments & Rubrics */}
              {persistedShowcase?.assignments && persistedShowcase.assignments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-success-600" />
                    Assignments & Rubrics
                  </h4>
                  <div className="space-y-4">
                    {persistedShowcase.assignments.map((a, idx) => (
                      <div key={a.id || idx} className="bg-white/60 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <h5 className="text-gray-900 font-semibold">{a.title}</h5>
                          {a.checkpoint && <span className="text-[11px] text-gray-500">Checkpoint: {a.checkpoint}</span>}
                        </div>
                        {a.summary && <p className="text-gray-700 mt-1">{a.summary}</p>}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="font-semibold text-gray-800">Student directions</p>
                            <ul className="mt-1 list-disc ml-5 space-y-1 text-gray-700">
                              {(a.studentDirections || []).slice(0,6).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Evidence</p>
                            <ul className="mt-1 list-disc ml-5 space-y-1 text-gray-700">
                              {(a.evidence || []).slice(0,3).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Success criteria</p>
                            <ul className="mt-1 list-disc ml-5 space-y-1 text-gray-700">
                              {(a.successCriteria || []).slice(0,5).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>

                        {a.rubric && a.rubric.criteria && a.rubric.criteria.length > 0 && (
                          <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-2 text-left border-b">Criterion</th>
                                  <th className="p-2 text-left border-b">Exemplary</th>
                                  <th className="p-2 text-left border-b">Proficient</th>
                                  <th className="p-2 text-left border-b">Developing</th>
                                  <th className="p-2 text-left border-b">Beginning</th>
                                </tr>
                              </thead>
                              <tbody>
                                {a.rubric.criteria.map((c, i) => (
                                  <tr key={i} className="align-top">
                                    <td className="p-2 border-t font-medium text-gray-900">{c.name}</td>
                                    <td className="p-2 border-t text-gray-700">{c.levels?.exemplary || ''}</td>
                                    <td className="p-2 border-t text-gray-700">{c.levels?.proficient || ''}</td>
                                    <td className="p-2 border-t text-gray-700">{c.levels?.developing || ''}</td>
                                    <td className="p-2 border-t text-gray-700">{c.levels?.beginning || ''}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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
