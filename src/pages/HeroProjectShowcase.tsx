import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Star, Clock, Users, Target, BookOpen, 
  FileText, Award, Lightbulb, Map, CheckCircle, 
  Layers, Rocket, Eye, Download, Share2, Heart,
  ArrowRight, Sparkles, Grid3x3, Brain, Compass,
  GraduationCap, BarChart3, MessageSquare, Shield
} from 'lucide-react';
import { auth } from '../firebase/firebase';
import { copy } from '../utils/copy';
import { FlowChip } from '../components/ui/FlowChip';
import { getHeroProject, HeroProjectData } from '../utils/hero-projects';
import { ProjectAnimation } from '../components/ProjectAnimation';

// Lazy load heavy components per Codex's perf requirements
const StandardsCoverageMap = lazy(() => 
  import('../components/standards/StandardsCoverageMap').then(m => ({ default: m.StandardsCoverageMap }))
);
const FeasibilityPanel = lazy(() => 
  import('../components/feasibility/FeasibilityPanel').then(m => ({ default: m.FeasibilityPanel }))
);

// Navigation sidebar for long content
const NavigationSidebar = ({ sections, activeSection }: { sections: string[], activeSection: string }) => {
  return (
    <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-20">
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-4 shadow-xl">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section}>
              <a
                href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === section
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {section}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Badge component for three-tier system
const ContentBadge = ({ type }: { type: 'core' | 'scaffold' | 'aspirational' }) => {
  const badges = {
    core: {
      icon: Sparkles,
      label: 'Alf Generated',
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-blue-800'
    },
    scaffold: {
      icon: Layers,
      label: 'Alf Framework + Your Input',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    aspirational: {
      icon: Target,
      label: 'Example Only',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {badge.label}
    </div>
  );
};

// Section component with glass morphism and flow indicator
const Section = ({ id, title, icon: Icon, children, className = '', badgeType, flowMode }: any) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative mb-12 ${className}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30">
              <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {flowMode && <FlowChip variant={flowMode} />}
            {badgeType && <ContentBadge type={badgeType} />}
          </div>
        </div>
        {children}
      </div>
    </motion.section>
  );
};

// Phase card component
const PhaseCard = ({ phase, index }: any) => {
  const phaseIcons: any = {
    'Discover': Brain,
    'Define': Compass,
    'Develop': Rocket,
    'Deliver': Star
  };
  const Icon = phaseIcons[phase.name] || phaseIcons[index % 4];
  
  const phaseColors: any = {
    'Discover': 'from-blue-100 to-cyan-100 dark:from-primary-900/30 dark:to-cyan-900/30',
    'Define': 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    'Develop': 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    'Deliver': 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`bg-gradient-to-r ${phaseColors[phase.name] || phaseColors[0]} p-4 border-b border-slate-200 dark:border-slate-700`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{phase.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
                  {phase.duration}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{phase.description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {phase.keyQuestion && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400 italic">
                "{phase.keyQuestion}"
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Goal: </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{phase.goal}</span>
              </div>
            </div>
            
            {phase.activities && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Activities:</h4>
                <ul className="space-y-1">
                  {phase.activities.slice(0, 3).map((activity: any, i: number) => {
                    // Handle both string and Activity object formats
                    const activityName = typeof activity === 'string' ? activity : activity.name;
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                        <span>{activityName}</span>
                      </li>
                    );
                  })}
                  {phase.activities.length > 3 && (
                    <li className="text-sm text-slate-500 dark:text-slate-500 italic ml-3.5">
                      +{phase.activities.length - 3} more activities...
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {phase.studentChoice && (
              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Student Choice: </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{phase.studentChoice}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Output: </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{phase.output}</span>
              </div>
            </div>
            
            {phase.formativeAssessment && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Assessment: </span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{phase.formativeAssessment}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Standards badge component
const StandardsBadge = ({ family, items }: any) => {
  const familyColors: any = {
    'NGSS': 'from-emerald-500 to-teal-500',
    'Common Core Math': 'from-primary-500 to-indigo-500',
    'Common Core ELA': 'from-purple-500 to-pink-500',
    'C3 Framework': 'from-amber-500 to-orange-500',
    'ISTE': 'from-cyan-500 to-primary-500',
    'CASEL': 'from-rose-500 to-pink-500'
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${familyColors[family] || 'from-slate-500 to-slate-600'} text-white text-sm font-medium mb-3`}>
        <Shield className="w-4 h-4" />
        {family}
      </div>
      <div className="space-y-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.code}:</span>
            <span className="text-slate-600 dark:text-slate-400 ml-2">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HeroProjectShowcase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Overview');

  // Get the hero project data - single source of truth
  const heroData = getHeroProject(id || '');

  // If no project found, show error
  if (!heroData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Project Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The project "{id}" could not be found.</p>
          <button
            onClick={() => navigate('/app/samples')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  // Extract data from heroData
  const ideation = {
    essentialQuestion: heroData.bigIdea.essentialQuestion,
    challenge: heroData.bigIdea.challenge || heroData.context.problem,
    bigIdea: heroData.bigIdea.statement,
    studentVoice: {
      drivingQuestions: heroData.bigIdea.subQuestions,
      choicePoints: [
        'Choose their specific focus area within the project theme',
        'Select research methods and data collection approaches',
        'Design their final deliverable format and presentation style',
        'Identify community partners and stakeholders to engage',
        'Determine project timeline and milestone priorities'
      ]
    }
  };

  const journey = {
    phases: heroData.journey.phases,
    resources: heroData.resources.required.concat(heroData.resources.optional),
    resourcesExplanation: {
      teacherProvided: 'Core materials, frameworks, and rubrics curated to scaffold learning',
      studentFound: 'Research articles, community resources, and expert interviews discovered through investigation',
      alfGenerated: 'Custom learning materials, assessments, and differentiated resources created by AI',
      collaborative: 'Shared documents, peer feedback systems, and co-created knowledge bases',
      howAlfHelps: 'Alf Coach generates personalized resources, creates assessment tools, provides research guidance, and offers real-time feedback tailored to each student\'s needs and interests'
    }
  };

  const deliverables = {
    milestones: heroData.journey.milestones?.map((m: any) => ({
      id: m.id,
      name: m.title,
      timeline: `Week ${m.week}`,
      description: m.description,
      deliverable: m.evidence?.[0],
      successCriteria: m.evidence || [],
      studentProducts: [m.celebration || 'Showcase']
    })),
    rubric: {
      criteria: heroData.assessment.rubric?.map((r: any) => ({
        id: r.category,
        name: r.category,
        weight: `${r.weight}%`,
        description: `Assessment of ${r.category.toLowerCase()} throughout the project`,
        exemplary: r.exemplary?.description || 'Exceeds all expectations with exceptional quality',
        proficient: r.proficient?.description || 'Meets all requirements with good quality',
        developing: r.developing?.description || 'Meets most requirements with adequate quality',
        beginning: r.beginning?.description || 'Meets some requirements with basic quality'
      }))
    },
    impact: {
      measures: heroData.impact?.metrics?.map((m: any) => ({
        metric: m.metric,
        target: m.target,
        method: m.measurement
      }))
    }
  };
  
  // Sections for navigation
  const sections = [
    'Context',
    'Overview',
    'Big Idea',
    'Standards',
    'Journey',
    'Milestones',
    'Assessment',
    'Resources',
    'Impact'
  ];
  
  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => 
        document.getElementById(s.toLowerCase().replace(/\s+/g, '-'))
      );
      
      const scrollPosition = window.scrollY + 200;
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!heroData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Project not found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/app/samples')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Gallery
          </button>
        </motion.div>
      </div>
    );
  }

  // Use hero data - safely handle when heroData exists
  const projectData = heroData;
  const subjects = heroData?.subjects || [];
  const gradeLevel = heroData?.gradeLevel || '';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 pt-20">
      {/* Navigation Sidebar */}
      <NavigationSidebar sections={sections} activeSection={activeSection} />

      {/* Header */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/10 via-purple-600/5 to-transparent h-96"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Hero Section with Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-blue-900/20">
              {/* Desktop Layout: Split View */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                {/* Content Side */}
                <div className="p-8 lg:p-12 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                    <Star className="w-4 h-4 fill-current" />
                    Complete Hero Project
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                    {heroData?.title}
                  </h1>

                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {heroData?.tagline}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {heroData?.gradeLevel}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {heroData?.duration}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-sm">{heroData?.subjects?.slice(0, 3).join(', ')}{heroData?.subjects?.length > 3 && '...'}</span>
                  </div>
                </div>

                {/* Image Side - Desktop Only */}
                {heroData?.image && (
                  <motion.div
                    className="hidden lg:block relative h-full min-h-[400px]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-purple-600/10 to-emerald-600/10 rounded-2xl"></div>
                    <img
                      src={heroData.image}
                      alt={heroData.title}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50"
                      style={{ objectPosition: 'center center' }}
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                  </motion.div>
                )}
              </div>

              {/* Mobile/Tablet Image Background */}
              {heroData?.image && (
                <div className="lg:hidden relative -mt-8 mx-4 mb-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl shadow-xl"
                  >
                    <img
                      src={heroData.image}
                      alt={heroData.title}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/20 to-transparent"></div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Course Abstract - NEW SECTION */}
        {heroData?.courseAbstract && (
          <Section
            id="abstract"
            title="Course Overview"
            icon={BookOpen}
            className="mb-12"
          >
            <div className="space-y-6">
              {/* Overview */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  {heroData.courseAbstract.overview}
                </p>
              </div>

              {/* Learning Objectives */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  What Students Will Learn
                </h3>
                <ul className="space-y-2">
                  {heroData.courseAbstract.learningObjectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methodology & Outcomes */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Our Approach
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {heroData.courseAbstract.methodology}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Expected Outcomes
                  </h3>
                  <ul className="space-y-1">
                    {heroData.courseAbstract.expectedOutcomes.map((outcome, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Context Section - Alf Coach Exemplar - DISCOVER (DIVERGE) */}
        <Section 
          id="context" 
          title="About This Exemplar"
          icon={Lightbulb}
          flowMode="diverge"
          badgeType="scaffold"
        >
          <div className="space-y-8">
            {/* Project Introduction with Visual Preview */}
            <div className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 rounded-xl overflow-hidden border border-primary-200 dark:border-blue-800">
              <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                {/* Text Content */}
                <div className="lg:col-span-2 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{heroData?.title || 'Project Unit'}</h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    {heroData?.hero.description ||
                      `This project was designed using Alf Coach to create an authentic, engaging learning experience that connects classroom learning to real-world impact.`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {heroData?.overview.description ||
                      `Students engage in a comprehensive learning journey that builds critical skills while addressing authentic challenges in their community.`}
                  </p>
                </div>

                {/* Visual Preview - Desktop Only */}
                {heroData?.image && (
                  <div className="hidden lg:block relative">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="h-full relative overflow-hidden"
                    >
                      <img
                        src={heroData.image}
                        alt={`${heroData.title} preview`}
                        className="w-full h-full object-cover opacity-80"
                        style={{ objectPosition: 'center center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-primary-600/20"></div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Design Rationale */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  The Challenge
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-3">
                  {heroData?.context.problem ||
                    `Students need authentic, real-world challenges that connect their learning to meaningful impact.`}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  {heroData?.context.significance ||
                    `This project transforms passive learning into active problem-solving with measurable community impact.`}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  The Solution
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-3">
                  {heroData?.context.realWorld ||
                    `Students engage with authentic challenges, work with real stakeholders, and create solutions that have genuine impact.`}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  {heroData?.context.authenticity ||
                    `Every phase builds authentic skills while meeting rigorous academic standards across multiple disciplines.`}
                </p>
              </div>
            </div>

            {/* How Alf Helps Create Projects Like This */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">How Alf Coach Builds Your Project</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-primary-600 dark:text-primary-400">Discovery</div>
                  <div className="flex-1">
                    <div className="text-slate-700 dark:text-slate-300">Understand your goals, constraints, and student needs through conversational planning</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-primary-600 dark:text-primary-400">Design</div>
                  <div className="flex-1">
                    <div className="text-slate-700 dark:text-slate-300">Generate customized learning journeys aligned to your standards and objectives</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-primary-600 dark:text-primary-400">Develop</div>
                  <div className="flex-1">
                    <div className="text-slate-700 dark:text-slate-300">Create detailed rubrics, milestones, and resources tailored to your context</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-primary-600 dark:text-primary-400">Deploy</div>
                  <div className="flex-1">
                    <div className="text-slate-700 dark:text-slate-300 font-medium">Export ready-to-use materials and continue iterating based on classroom experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exemplar Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Week Duration</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary-900/20 dark:to-blue-800/20">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">6</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Subject Areas</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">15+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Standards Aligned</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">4</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Learning Phases</div>
              </div>
            </div>

            {/* Key Features of This Exemplar */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                What Makes {heroData?.title?.split(':')[0] || 'This Project'} Effective
              </h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {heroData?.overview.keyFeatures ? (
                  heroData.overview.keyFeatures.map((feature: string, i: number) => {
                    const colonIndex = feature.indexOf(':');
                    const title = colonIndex > -1 ? feature.substring(0, colonIndex) : feature;
                    const description = colonIndex > -1 ? feature.substring(colonIndex + 1) : '';
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {colonIndex > -1 ? (
                            <>
                              <strong>{title}:</strong>{description}
                            </>
                          ) : (
                            feature
                          )}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Systems Thinking:</strong> Students analyze waste, energy, water, and transportation as interconnected systems rather than isolated problems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Data-Driven Approach:</strong> Students collect real baseline data, track metrics, and measure actual environmental impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Stakeholder Engagement:</strong> Students interview cafeteria staff, facilities managers, administrators, and community members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Action Research Cycle:</strong> Students prototype solutions, test interventions, and iterate based on real-world feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Policy & Advocacy:</strong> Students present to school board, write policy proposals, and create lasting institutional change</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* How to Use This Exemplar */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 text-center">How to Use This Exemplar</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-4">
                This project unit can be adapted to your specific context. Use Alf Coach to:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  Adjust for your grade level
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  Align to your standards
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  Modify timeline and scope
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  Generate custom resources
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  Create differentiation strategies
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Overview Section */}
        {/* Project Overview - DISCOVER (DIVERGE) */}
        <Section 
          id="overview" 
          title="Project Overview"
          icon={Eye} 
          badgeType="core"
          flowMode="diverge"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Essential Question</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  {ideation?.essentialQuestion || 'How can we create meaningful change in our community through collaborative action?'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Learning Goals</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {heroData?.standards?.objectives?.[0]?.items?.join('. ') || 'Students will develop critical thinking, collaboration, and problem-solving skills through authentic project-based learning.'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Challenge</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {ideation?.challenge || 'Students will tackle real-world challenges that matter to their community'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Materials Needed</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {heroData?.resources?.required?.map(r => r.name).join(', ') || 'Research materials, collaboration tools, presentation resources'}
                </p>
              </div>
            </div>
          </div>
        </Section>
        
        {/* Big Idea Section */}
        {/* Big Idea - DEFINE (CONVERGE) */}
        <Section 
          id="big-idea" 
          title="The Big Idea"
          icon={Lightbulb} 
          badgeType="core"
          flowMode="converge"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              {heroData?.bigIdea.statement || ideation?.bigIdea}
            </p>
          </div>

          {(heroData?.bigIdea.subQuestions || ideation?.studentVoice) && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Driving Questions</h3>
                <ul className="space-y-2">
                  {(heroData?.bigIdea.subQuestions || ideation?.studentVoice?.drivingQuestions)?.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Student Choice Points</h3>
                <ul className="space-y-2">
                  {ideation?.studentVoice?.choicePoints?.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>
        
        {/* Standards Alignment Section */}
        {/* Standards - DEFINE (CONVERGE) */}
        {heroData?.standards?.alignments && Object.keys(heroData.standards.alignments).length > 0 && (
          <Section
            id="standards"
            title="Standards Alignment"
            icon={Shield}
            badgeType="core"
            flowMode="converge"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(heroData.standards.alignments).map(([family, standards]) => (
                <StandardsBadge
                  key={family}
                  family={family}
                  items={standards.slice(0, 3).map(std => ({
                    code: std.code,
                    description: std.text.length > 60 ? std.text.substring(0, 60) + '...' : std.text
                  }))}
                />
              ))}
            </div>

            {/* Standards Coverage Map - Show for all hero projects */}
            {heroData && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Coverage Progression
                </h3>
                <Suspense fallback={<div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />}>
                  <StandardsCoverageMap
                    standards={
                      heroData?.standards?.alignments ?
                        Object.entries(heroData.standards.alignments).flatMap(([family, stds]: [string, any[]]) =>
                          (Array.isArray(stds) ? stds : []).slice(0, 2).map((std: any, index: number) => ({
                            id: `${family}-${index}`,
                            code: std.code || `${family}-${index + 1}`,
                            label: std.text ? (std.text.substring(0, 50) + '...') : family,
                            framework: family
                          }))
                        ) : []
                    }
                    milestones={
                      heroData?.journey?.milestones ?
                        heroData.journey.milestones.map((m: any) => ({
                          id: m.id || `milestone-${m.week}`,
                          name: m.title || `Week ${m.week} Milestone`
                        })) : []
                    }
                    coverage={
                      heroData?.journey?.milestones && heroData?.standards?.alignments ?
                        heroData.journey.milestones.flatMap((m: any, mIndex: number) =>
                          Object.entries(heroData.standards.alignments).flatMap(([family, stds]: [string, any[]]) =>
                            (Array.isArray(stds) ? stds : []).slice(0, 2).map((std: any, sIndex: number) => ({
                              standardId: `${family}-${sIndex}`,
                              milestoneId: m.id || `milestone-${m.week}`,
                              emphasis: mIndex === 0 ? 'introduce' as const :
                                       mIndex < heroData.journey.milestones.length - 1 ? 'develop' as const :
                                       'master' as const
                            }))
                          )
                        ) : []
                    }
                  />
                </Suspense>
              </div>
            )}
          </Section>
        )}
        
        {/* Feasibility & Risks - DELIVER (CONVERGE) */}
        {heroData && (
          <Section
            id="feasibility"
            title="Feasibility & Risk Management"
            icon={Shield}
            badgeType="scaffold"
            flowMode="converge"
          >
            <Suspense fallback={<div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />}>
              <FeasibilityPanel
                constraints={
                  heroData ? {
                    budgetUSD: 500,
                    techAccess: 'limited' as const,
                    materials: ['Computers/tablets', 'Research materials', 'Presentation tools'],
                    safetyRequirements: ['Adult supervision for community engagement', 'Digital citizenship guidelines']
                  } : undefined
                }
                risks={
                  heroData ? [
                    {
                      id: 'r1',
                      name: 'Technology access gaps',
                      likelihood: 'med' as const,
                      impact: 'med' as const,
                      mitigation: 'Provide alternative offline activities'
                    },
                    {
                      id: 'r2',
                      name: 'Student motivation',
                      likelihood: 'low' as const,
                      impact: 'high' as const,
                      mitigation: 'Use choice and authentic connections'
                    },
                    {
                      id: 'r3',
                      name: 'Project scope creep',
                      likelihood: 'med' as const,
                      impact: 'med' as const,
                      mitigation: 'Clear milestones and checkpoints'
                    }
                  ] : []
                }
                contingencies={
                  heroData ? [
                    { id: 'c1', scenario: 'Limited technology access', plan: 'Provide paper-based alternatives and peer sharing' },
                    { id: 'c2', scenario: 'Community partner unavailable', plan: 'Use virtual connections or recorded interviews' },
                    { id: 'c3', scenario: 'Behind schedule', plan: 'Adjust scope while maintaining core objectives' }
                  ] : []
                }
              />
            </Suspense>
          </Section>
        )}
        
        {/* Learning Journey Section */}
        {/* Learning Journey - DEVELOP (DIVERGE) */}
        <Section 
          id="journey" 
          title="Learning Journey"
          icon={Map} 
          badgeType="core"
          flowMode="diverge"
        >
          <div className="space-y-6">
            {/* Framework Explanation */}
            {journey?.framework && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Design Thinking Framework
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">{journey.framework}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {journey.scaffolding && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scaffolding Strategy:</h4>
                      <ul className="space-y-1">
                        {journey.scaffolding.slice(0, 3).map((item: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {journey.differentiation && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Differentiation Options:</h4>
                      <ul className="space-y-1">
                        {journey.differentiation.slice(0, 3).map((item: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Phase Cards */}
            <div className="space-y-4">
              {(heroData?.journey.phases || journey?.phases)?.map((phase: any, i: number) => (
                <PhaseCard key={phase.id} phase={phase} index={i} />
              ))}
            </div>
          </div>
        </Section>
        
        {/* Milestones Section */}
        {/* Milestones - DEVELOP (DIVERGE) */}
        <Section 
          id="milestones" 
          title="Key Milestones"
          icon={CheckCircle}
          badgeType="scaffold"
          flowMode="diverge"
        >
          <div className="space-y-6">
            {deliverables?.milestones?.map((milestone: any, i: number) => (
              <motion.div
                key={milestone.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{milestone.name}</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">{milestone.timeline}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{milestone.description}</p>
                    
                    {milestone.deliverable && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deliverable:</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          {milestone.deliverable}
                        </p>
                      </div>
                    )}
                    
                    {milestone.successCriteria && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Success Criteria:</h4>
                        <ul className="space-y-1">
                          {milestone.successCriteria.map((criteria: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {milestone.studentProducts && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Student Products:</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.studentProducts.map((product: string, j: number) => (
                            <span key={j} className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
        
        {/* Assessment Section */}
        {/* Assessment - DELIVER (CONVERGE) */}
        <Section 
          id="assessment" 
          title="Assessment Rubric"
          icon={Award}
          badgeType="core"
          flowMode="converge"
        >
          <div className="space-y-6">
            {/* Rubric Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                This comprehensive rubric provides clear expectations across four performance levels. Each criterion is weighted to reflect its importance in the overall project assessment.
              </p>
            </div>
            
            {/* Detailed Rubric */}
            {deliverables?.rubric?.criteria?.map((criterion: any, i: number) => (
              <div key={criterion.id || i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{criterion.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium">
                      {criterion.weight}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{criterion.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {criterion.exemplary && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Exemplary (4)</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{criterion.exemplary}</p>
                      </div>
                    )}
                    
                    {criterion.proficient && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                          <h4 className="text-sm font-medium text-primary-700 dark:text-primary-400">Proficient (3)</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{criterion.proficient}</p>
                      </div>
                    )}
                    
                    {criterion.developing && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Developing (2)</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{criterion.developing}</p>
                      </div>
                    )}
                    
                    {criterion.beginning && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Beginning (1)</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{criterion.beginning}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Grading Notes */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assessment Notes:</h4>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>• Students receive feedback on each criterion throughout the project</li>
                <li>• Self-assessment and peer assessment opportunities at each milestone</li>
                <li>• Final grade combines rubric scores with completion of required deliverables</li>
                <li>• Opportunities for revision and improvement before final submission</li>
              </ul>
            </div>
          </div>
        </Section>
        
        {/* Resources Section */}
        {journey?.resources && journey.resources.length > 0 && (
          <Section id="resources" title="Resources & Materials" icon={Grid3x3} badgeType="scaffold">
            <div className="space-y-6">
              {/* Resource Explanation */}
              {journey.resourcesExplanation && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Understanding Resources in PBL
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Teacher-Provided:</strong> {journey.resourcesExplanation.teacherProvided}
                    </p>
                    <p>
                      <strong>Student-Found:</strong> {journey.resourcesExplanation.studentFound}
                    </p>
                    <p>
                      <strong>Alf-Generated:</strong> {journey.resourcesExplanation.alfGenerated}
                    </p>
                    <p>
                      <strong>Collaborative:</strong> {journey.resourcesExplanation.collaborative}
                    </p>
                    <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <p className="font-medium text-primary-600 dark:text-primary-400 mb-1">How Alf Coach Helps:</p>
                      <p>{journey.resourcesExplanation.howAlfHelps}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resource Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {journey.resources.map((resource: any, i: number) => {
                  const typeColors: any = {
                    'Teacher-Provided Resource': 'from-blue-50 to-blue-100 dark:from-primary-900/20 dark:to-blue-800/20',
                    'Student-Found Resource': 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
                    'Alf-Generated Resource': 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
                    'Alf-Generated Assessment': 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
                    'Class-Built Resource': 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
                    'Technology Tool': 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20',
                    'Digital Platform': 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
                    'Teacher-Curated Examples': 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20'
                  };
                  
                  const bgColor = typeColors[resource.type] || 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700';
                  
                  return (
                    <div key={i} className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border border-slate-200 dark:border-slate-700`}>
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white mb-1">{resource.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{resource.type}</p>
                          {resource.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{resource.description}</p>
                          )}
                          {resource.when && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">When: {resource.when}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        )}
        
        {/* Authentic Impact Section */}
        {/* Impact - REFLECT */}
        <Section 
          id="impact" 
          title="Authentic Impact"
          icon={Rocket} 
          badgeType="aspirational"
          flowMode="reflect"
        >
          <div className="space-y-6">
            {/* Impact Overview */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Creating Real-World Change</h3>
              <p className="text-slate-700 dark:text-slate-300">
                {deliverables?.impact?.measures?.description || 
                'Authentic impact means students see their work create measurable change beyond the classroom. This project connects learning to real stakeholders, real decisions, and real outcomes.'}
              </p>
            </div>
            
            {/* Audience */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Authentic Audiences</h3>
              </div>
              
              {deliverables?.impact?.audience ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Decision-Makers:</h4>
                    <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.audience.primary}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Secondary Stakeholders:</h4>
                    <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.audience.secondary}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Community Partners:</h4>
                    <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.audience.community}</p>
                  </div>
                  {deliverables.impact.audience.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-3">
                      {deliverables.impact.audience.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">School Board, City Council, Community Members</p>
              )}
            </div>
            
            {/* Methods */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sharing Methods</h3>
              </div>
              
              {deliverables?.impact?.method ? (
                <div className="space-y-3">
                  {deliverables.impact.method.formal && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Formal Presentation:</h4>
                      <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.method.formal}</p>
                    </div>
                  )}
                  {deliverables.impact.method.public && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Public Engagement:</h4>
                      <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.method.public}</p>
                    </div>
                  )}
                  {deliverables.impact.method.digital && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Digital Outreach:</h4>
                      <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.method.digital}</p>
                    </div>
                  )}
                  {deliverables.impact.method.media && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Media Coverage:</h4>
                      <p className="text-slate-600 dark:text-slate-400">{deliverables.impact.method.media}</p>
                    </div>
                  )}
                  {deliverables.impact.method.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-3">
                      {deliverables.impact.method.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">Policy presentations, media coverage, community forums</p>
              )}
            </div>
            
            {/* Measures */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Success Measures</h3>
              </div>
              
              {deliverables?.impact?.measures ? (
                <div className="space-y-4">
                  {deliverables.impact.measures.quantitative && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantitative Metrics:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {deliverables.impact.measures.quantitative.map((measure: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span>{measure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {deliverables.impact.measures.qualitative && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Qualitative Outcomes:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {deliverables.impact.measures.qualitative.map((measure: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                            <span>{measure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {deliverables.impact.measures.description && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {deliverables.impact.measures.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <div>• Environmental impact reduction</div>
                  <div>• Policy adoption rate</div>
                  <div>• Community engagement metrics</div>
                </div>
              )}
            </div>
            
            {/* How Alf Helps Define Impact */}
            <div className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 rounded-xl p-4 border border-primary-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                How Alf Coach Helps Define Authentic Impact
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Alf Coach helps you identify appropriate stakeholders in your community, suggests presentation formats matched to your students' abilities, 
                and provides frameworks for measuring both quantitative and qualitative impact. The AI adapts suggestions based on your local context, 
                available resources, and curriculum requirements.
              </p>
            </div>
          </div>
        </Section>
        
      </div>
    </div>
  );
}
