import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Clock, Users, 
  Calculator, Beaker, BookOpen, Globe, Palette, 
  Music, Code, Heart, Dumbbell, Languages, Theater, Camera,
  ChevronLeft, Star, ArrowRight
} from 'lucide-react';
import { getHeroProjectsMetadata } from '../utils/hero-projects';
import { listShowcaseProjects, getShowcaseProject } from '../utils/showcase-projects';
import { listUnified, deleteUnified, saveUnifiedProject } from '../services/ShowcaseStorage';
import { seedBlueprintFromUnified } from '../utils/seed/seedBlueprint';
import { fromShowcase } from '../utils/transformers/projectTransformers';

type Card = {
  id: string;
  title: string;
  subtitle?: string;
  gradeLevel?: string;
  duration?: string;
  subject?: string;
  sampleId: string;
  featured?: boolean;
  isComplete?: boolean;
  image?: string;
};

type GalleryTab = 'showcase' | 'legacy';

interface ShowcaseCard {
  id: string;
  title: string;
  tagline?: string;
  gradeBands: string[];
  subjects: string[];
  duration: string;
  microOverview: string;
}

interface UserProjectSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

// Subject to icon mapping with refined colors for Apple HIG compliance
const getSubjectIcon = (subject: string | undefined) => {
  // Always return a valid icon object with Sparkles as the fallback
  if (!subject) {
    return { Icon: Sparkles, color: 'text-primary-600', bgColor: 'bg-primary-50' };
  }

  const subjectLower = subject.toLowerCase();

  // Order matters: check for more specific terms before general ones
  // Check STEM-related first (as STEM projects often have multiple subjects)
  if (subjectLower.includes('stem')) {
    return { Icon: Beaker, color: 'text-purple-600', bgColor: 'bg-purple-50' };
  }
  if (subjectLower.includes('technology') || subjectLower.includes('computer') || subjectLower.includes('coding') || subjectLower.includes('engineering')) {
    return { Icon: Code, color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
  }
  if (subjectLower.includes('science') || subjectLower.includes('biology') || subjectLower.includes('chemistry') || subjectLower.includes('physics')) {
    return { Icon: Beaker, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  }
  if (subjectLower.includes('math')) {
    return { Icon: Calculator, color: 'text-primary-600', bgColor: 'bg-primary-50' };
  }

  // Health and Physical Education
  if (subjectLower.includes('health')) {
    return { Icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' };
  }
  if (subjectLower.includes('physical') || subjectLower.includes('pe') || subjectLower.includes('fitness')) {
    return { Icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-50' };
  }

  // Language Arts
  if (subjectLower.includes('english') || subjectLower.includes('language arts') || subjectLower.includes('literature')) {
    return { Icon: BookOpen, color: 'text-violet-600', bgColor: 'bg-violet-50' };
  }
  if (subjectLower.includes('language') || subjectLower.includes('spanish') || subjectLower.includes('french')) {
    return { Icon: Languages, color: 'text-teal-600', bgColor: 'bg-teal-50' };
  }

  // Social Studies
  if (subjectLower.includes('social') || subjectLower.includes('history') || subjectLower.includes('geography')) {
    return { Icon: Globe, color: 'text-amber-600', bgColor: 'bg-amber-50' };
  }

  // Arts
  if (subjectLower.includes('art') || subjectLower.includes('visual')) {
    return { Icon: Palette, color: 'text-pink-600', bgColor: 'bg-pink-50' };
  }
  if (subjectLower.includes('music')) {
    return { Icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
  }
  if (subjectLower.includes('theater') || subjectLower.includes('drama')) {
    return { Icon: Theater, color: 'text-purple-600', bgColor: 'bg-purple-50' };
  }
  if (subjectLower.includes('photo')) {
    return { Icon: Camera, color: 'text-slate-600', bgColor: 'bg-slate-50' };
  }

  // Default fallback
  return { Icon: Sparkles, color: 'text-primary-600', bgColor: 'bg-primary-50' };
};

// Map grade levels to friendly display names
const getGradeDisplay = (gradeLevel?: string) => {
  switch (gradeLevel) {
    case 'early-elementary': return 'K-2';
    case 'elementary': return 'Grades 3-5';
    case 'middle': return 'Grades 6-8';
    case 'high': return 'Grades 9-12';
    case 'upper-secondary': return 'Grades 9-12';
    case 'higher-ed': return 'College';
    case 'adult': return 'Adult';
    default: return 'All Ages';
  }
};

export default function SamplesGallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('show') === 'legacy' ? 'legacy' : 'showcase') as GalleryTab;
  const [activeTab, setActiveTab] = useState<GalleryTab>(initialTab);
  const [userProjects, setUserProjects] = useState<UserProjectSummary[]>([]);
  const [userProjectsLoading, setUserProjectsLoading] = useState<boolean>(true);
  const [userProjectsError, setUserProjectsError] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    const nextTab = (searchParams.get('show') === 'legacy' ? 'legacy' : 'showcase') as GalleryTab;
    setActiveTab(prev => (prev === nextTab ? prev : nextTab));
  }, [searchParams]);

  const handleTabChange = (tab: GalleryTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchParams({ show: tab }, { replace: true });
  };

  const refreshUserProjects = useCallback(async () => {
    try {
      setUserProjectsLoading(true);
      setUserProjectsError(null);
      const entries = await listUnified();
      const mapped = entries.map(entry => ({
        id: entry.id,
        title: entry.title || 'Untitled project',
        updatedAt: new Date(entry.updatedAt),
      }));
      setUserProjects(mapped);
    } catch (error) {
      console.error('[SamplesGallery] Failed to load user projects', error);
      setUserProjectsError('Unable to load your projects right now.');
    } finally {
      setUserProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserProjects();
  }, [refreshUserProjects]);

  const rawCards: Card[] = useMemo(() => {
    // Use the simplified hero projects metadata
    const heroProjects = getHeroProjectsMetadata();
    return heroProjects.map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.description.substring(0, 150) + '...',
      gradeLevel: project.gradeLevel.includes('High') ? 'high' :
                  project.gradeLevel.includes('Middle') ? 'middle' : 'elementary',
      duration: project.duration,
      subject: project.subject,
      sampleId: project.id,
      featured: true,
      isComplete: true, // All hero projects are complete
      image: project.image, // Include the image if available
    }));
  }, []);

  // No search filtering needed - just use all cards
  const cards = rawCards;

  const showcaseCards: ShowcaseCard[] = useMemo(() => {
    return listShowcaseProjects()
      .map(({ id }) => {
        const project = getShowcaseProject(id);
        if (!project) {
          return undefined;
        }

        const { meta, microOverview } = project;
        return {
          id,
          title: meta.title,
          tagline: meta.tagline,
          gradeBands: meta.gradeBands,
          subjects: meta.subjects,
          duration: meta.duration,
          microOverview: microOverview.microOverview,
        } as ShowcaseCard;
      })
      .filter((card): card is ShowcaseCard => Boolean(card))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  // Navigate to project detail page
  const viewProject = (projectId: string) => {
    navigate(`/app/samples/${projectId}`);
  };

  const openShowcaseProject = (projectId: string) => {
    navigate(`/app/showcase/${projectId}`);
  };

  const isShowcaseActive = activeTab === 'showcase';
  const isLegacyActive = activeTab === 'legacy';

  const formatUpdatedAt = (date: Date) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

const handleCloneFromCurated = useCallback(
  async (projectId: string) => {
    try {
      const showcase = getShowcaseProject(projectId);
      if (!showcase) {
          console.warn('[SamplesGallery] Unable to locate showcase project', projectId);
          return;
        }
      const unified = fromShowcase(showcase);
      unified.metadata = {
        ...unified.metadata,
        variant: 'showcase',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seedSourceId: showcase.meta.id,
      };
      const clonedId = await saveUnifiedProject({
        ...unified,
        meta: {
          ...unified.meta,
            id: `showcase-${projectId}-${Date.now()}`,
            title: `${unified.meta.title} (Copy)`,
          },
        });
        await refreshUserProjects();
        navigate(`/app/showcase/${clonedId}/edit`);
      } catch (error) {
        console.error('[SamplesGallery] Failed to clone curated project', error);
      setUserProjectsError('Unable to use this template right now.');
    }
  },
  [navigate, refreshUserProjects]
);

const handleDesignFromCurated = useCallback(
  async (projectId: string) => {
    try {
      const showcase = getShowcaseProject(projectId);
      if (!showcase) {
        console.warn('[SamplesGallery] Unable to locate showcase project', projectId);
        return;
      }
      const unified = fromShowcase(showcase);
      const blueprintId = seedBlueprintFromUnified({
        ...unified,
        metadata: {
          ...unified.metadata,
          seedSourceId: showcase.meta.id,
          updatedAt: new Date().toISOString(),
        },
      });
      navigate(`/app/blueprint/${blueprintId}?skip=true`);
    } catch (error) {
      console.error('[SamplesGallery] Failed to open design studio for curated project', error);
      setUserProjectsError('Unable to open Design Studio for this template right now.');
    }
  },
  [navigate]
);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      setDeletingProjectId(projectId);
      try {
        await deleteUnified(projectId);
        await refreshUserProjects();
      } catch (error) {
        console.error('[SamplesGallery] Failed to delete project', error);
        setUserProjectsError('Unable to delete this project right now.');
      } finally {
        setDeletingProjectId(null);
      }
    },
    [refreshUserProjects]
  );

  const renderShowcaseMeta = (card: ShowcaseCard) => {
    const gradeDisplay = card.gradeBands.length > 0 ? card.gradeBands.join(', ') : 'All Grades';
    const subjectsDisplay = card.subjects.length > 0 ? card.subjects.join(', ') : 'Interdisciplinary';

    return (
      <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          <Users className="w-3.5 h-3.5" />
          {gradeDisplay}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          <Clock className="w-3.5 h-3.5" />
          {card.duration}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          {subjectsDisplay}
        </span>
      </div>
    );
  };

  // All projects in one grid - no featured separation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
        {/* Navigation now handled in main Header component */}

        {/* Hero Section - proper spacing for fixed header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16 mt-8"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            See What's Possible with <span className="font-sans font-bold">Alf</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            These aren't templates—they're complete project units created with <span className="font-sans font-bold">Alf</span> Coach in minutes. Each one includes
            standards alignments, assessment rubrics, differentiation strategies, and everything you need to run transformative PBL.
          </p>
        </motion.div>


        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleTabChange('showcase')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isShowcaseActive
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Showcase Projects
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('legacy')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isLegacyActive
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Legacy Projects
            </button>
          </div>
        </div>

        {isShowcaseActive && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-10"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Showcase Projects</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Teacher-ready spotlights built on the new Showcase framework. Each project captures the Micro Overview, Quick Spark, Outcome Menu, and Assignment Cards so you can remix or run it right away.
              </p>
            </div>

            {showcaseCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {showcaseCards.map((card, idx) => (
                    <motion.article
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className="h-full"
                    >
                      <div className="h-full flex flex-col gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-sm px-6 py-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                            {card.tagline ?? card.microOverview}
                          </p>
                        </div>

                        {renderShowcaseMeta(card)}

                        <div className="mt-auto flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCloneFromCurated(card.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium shadow hover:bg-primary-500 transition"
                          >
                            Use this template
                          </button>
                          <button
                            type="button"
                            onClick={() => openShowcaseProject(card.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDesignFromCurated(card.id)}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            Advanced: Design Studio
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Showcase projects coming soon</h3>
                <p className="text-slate-600 dark:text-slate-400">We’re actively converting the full library into the Showcase format.</p>
              </div>
            )}
          </motion.section>
        )}

        {isShowcaseActive && (
          <section className="mt-16 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Projects</h2>
            </div>
            {userProjectsError && (
              <p className="text-sm text-rose-600">{userProjectsError}</p>
            )}
            {userProjectsLoading ? (
              <p className="text-sm text-slate-500">Loading your projects…</p>
            ) : userProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No saved projects yet. Start a new project or use a template to begin.</p>
            ) : (
              <div className="space-y-3">
                {userProjects.map(project => (
                  <div
                    key={project.id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-sm p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                        <p className="text-xs text-slate-500">Updated {formatUpdatedAt(project.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/app/showcase/${project.id}`)}
                        className="px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-medium hover:bg-primary-500 transition"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/app/showcase/${project.id}/edit`)}
                        className="px-3 py-1.5 rounded-full bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition"
                      >
                        Edit assignments
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deletingProjectId === project.id}
                        className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium hover:bg-rose-200 transition disabled:opacity-60"
                      >
                        {deletingProjectId === project.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {isLegacyActive && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Legacy Projects</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Explore the original Hero projects while we finish the Showcase refresh. These still include the full legacy write-ups, rubrics, and assets.
              </p>
            </div>

            {cards.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {cards.map((project, idx) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="group relative"
                      >
                        <div
                          onClick={() => viewProject(project.sampleId)}
                          className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        >
                          {project.image ? (
                            <div className="relative w-full h-48 mb-4">
                              <img
                                src={project.image}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover rounded-t-2xl"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-t-2xl" />
                            </div>
                          ) : (
                            <div className="p-6 pb-0">
                              {(() => {
                                const iconData = getSubjectIcon(project.subject);

                                if (!iconData || !iconData.Icon) {
                                  return (
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4">
                                      <Sparkles className="w-6 h-6 text-primary-600" />
                                    </div>
                                  );
                                }

                                const { Icon, color, bgColor } = iconData;
                                return (
                                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bgColor} mb-4`}>
                                    <Icon className={`w-6 h-6 ${color}`} />
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <div className="px-6 pb-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                              {project.title}
                            </h3>

                            {project.subtitle && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                {project.subtitle}
                              </p>
                            )}

                            <div className="flex flex-col gap-2 mb-4">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium">{getGradeDisplay(project.gradeLevel)}</span>
                              </span>
                              {project.duration && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  Duration: {project.duration}
                                </span>
                              )}
                            </div>

                        <div className="flex items-center justify-between">
                          {project.isComplete ? (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Complete
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Preview
                            </span>
                          )}
                          {project.subject && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {project.subject.split(',')[0].trim()}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation();
                              openShowcaseProject(project.sampleId);
                            }}
                            className="px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-medium hover:bg-primary-500 transition"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={async event => {
                              event.stopPropagation();
                              await handleDesignFromCurated(project.sampleId);
                            }}
                            className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition"
                          >
                            Design Studio
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16"
              >
                <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No legacy projects found</h3>
                <p className="text-slate-600 dark:text-slate-400">Check back soon for refreshed Showcase versions.</p>
              </motion.div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}
