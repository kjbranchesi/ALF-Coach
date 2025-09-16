/**
 * SupportResources.tsx
 * 
 * Contextual support resources for iteration management
 * Part of Sprint 3: Full Iteration Support System
 * 
 * FEATURES:
 * - Phase-specific resources
 * - Iteration type guidance
 * - Best practices library
 * - Video tutorials
 * - Templates and worksheets
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Video,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Tag,
  Bookmark,
  Share2,
  CheckCircle,
  PlayCircle,
  File,
  Link2
} from 'lucide-react';
import { PhaseType, IterationType, GradeLevel } from '../types';

interface SupportResourcesProps {
  currentPhase: PhaseType;
  gradeLevel: GradeLevel;
  recentIterationType?: IterationType;
  onResourceClick?: (resource: Resource) => void;
  className?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'template' | 'worksheet' | 'guide';
  phase: PhaseType | 'all';
  gradeLevel: GradeLevel[];
  iterationType?: IterationType;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  url?: string;
  downloadUrl?: string;
  featured: boolean;
  popularity: number;
  lastUpdated: Date;
}

interface ResourceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  count: number;
}

const RESOURCES: Resource[] = [
  // Analyze Phase Resources
  {
    id: 'analyze-guide-1',
    title: 'Effective Research Strategies',
    description: 'Learn how to conduct thorough research and avoid common pitfalls that lead to iterations.',
    type: 'guide',
    phase: 'ANALYZE',
    gradeLevel: ['middle', 'high'],
    duration: '15 min read',
    difficulty: 'intermediate',
    tags: ['research', 'planning', 'analysis'],
    featured: true,
    popularity: 95,
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'analyze-template-1',
    title: 'Problem Definition Worksheet',
    description: 'A structured template to clearly define your problem before moving forward.',
    type: 'worksheet',
    phase: 'ANALYZE',
    gradeLevel: ['elementary', 'middle', 'high'],
    difficulty: 'beginner',
    tags: ['problem-solving', 'planning'],
    downloadUrl: '/templates/problem-definition.pdf',
    featured: false,
    popularity: 88,
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'analyze-video-1',
    title: 'Avoiding Analysis Paralysis',
    description: 'Video tutorial on knowing when you have enough information to proceed.',
    type: 'video',
    phase: 'ANALYZE',
    gradeLevel: ['high'],
    duration: '12 min',
    difficulty: 'advanced',
    tags: ['decision-making', 'efficiency'],
    url: '/videos/analysis-paralysis',
    featured: true,
    popularity: 92,
    lastUpdated: new Date('2024-01-20')
  },

  // Brainstorm Phase Resources
  {
    id: 'brainstorm-guide-1',
    title: 'Creative Ideation Techniques',
    description: 'Master various brainstorming methods to generate innovative solutions.',
    type: 'guide',
    phase: 'BRAINSTORM',
    gradeLevel: ['middle', 'high'],
    duration: '20 min read',
    difficulty: 'intermediate',
    tags: ['creativity', 'ideation', 'collaboration'],
    featured: true,
    popularity: 90,
    lastUpdated: new Date('2024-01-18')
  },
  {
    id: 'brainstorm-template-1',
    title: 'Idea Evaluation Matrix',
    description: 'Template for systematically evaluating and prioritizing ideas.',
    type: 'template',
    phase: 'BRAINSTORM',
    gradeLevel: ['middle', 'high'],
    difficulty: 'intermediate',
    tags: ['evaluation', 'decision-making'],
    downloadUrl: '/templates/idea-matrix.xlsx',
    featured: false,
    popularity: 85,
    lastUpdated: new Date('2024-01-12')
  },

  // Prototype Phase Resources
  {
    id: 'prototype-guide-1',
    title: 'Rapid Prototyping Methods',
    description: 'Build quick, testable prototypes without overcommitting resources.',
    type: 'guide',
    phase: 'PROTOTYPE',
    gradeLevel: ['high'],
    duration: '25 min read',
    difficulty: 'advanced',
    tags: ['prototyping', 'testing', 'iteration'],
    featured: true,
    popularity: 93,
    lastUpdated: new Date('2024-01-22')
  },
  {
    id: 'prototype-video-1',
    title: 'Testing Your Prototype',
    description: 'Learn effective testing strategies to identify issues early.',
    type: 'video',
    phase: 'PROTOTYPE',
    gradeLevel: ['middle', 'high'],
    duration: '18 min',
    difficulty: 'intermediate',
    tags: ['testing', 'feedback', 'improvement'],
    url: '/videos/prototype-testing',
    featured: false,
    popularity: 87,
    lastUpdated: new Date('2024-01-16')
  },

  // Evaluate Phase Resources
  {
    id: 'evaluate-template-1',
    title: 'Reflection Framework',
    description: 'Structured reflection template to capture learnings and improvements.',
    type: 'worksheet',
    phase: 'EVALUATE',
    gradeLevel: ['elementary', 'middle', 'high'],
    difficulty: 'beginner',
    tags: ['reflection', 'assessment', 'learning'],
    downloadUrl: '/templates/reflection-framework.pdf',
    featured: true,
    popularity: 91,
    lastUpdated: new Date('2024-01-19')
  },

  // Iteration-specific Resources
  {
    id: 'iteration-guide-1',
    title: 'When to Iterate: Decision Guide',
    description: 'Clear criteria for deciding when iteration is necessary vs. moving forward.',
    type: 'guide',
    phase: 'all',
    gradeLevel: ['middle', 'high'],
    iterationType: 'quick_loop',
    duration: '10 min read',
    difficulty: 'intermediate',
    tags: ['iteration', 'decision-making'],
    featured: true,
    popularity: 96,
    lastUpdated: new Date('2024-01-25')
  },
  {
    id: 'iteration-video-1',
    title: 'Managing Major Pivots',
    description: 'Strategies for handling significant project changes without losing momentum.',
    type: 'video',
    phase: 'all',
    gradeLevel: ['high'],
    iterationType: 'major_pivot',
    duration: '22 min',
    difficulty: 'advanced',
    tags: ['iteration', 'change-management', 'resilience'],
    url: '/videos/major-pivots',
    featured: true,
    popularity: 89,
    lastUpdated: new Date('2024-01-21')
  },
  {
    id: 'iteration-template-1',
    title: 'Iteration Planning Checklist',
    description: 'Ensure your iteration is well-planned and time-boxed.',
    type: 'template',
    phase: 'all',
    gradeLevel: ['elementary', 'middle', 'high'],
    iterationType: 'complete_restart',
    difficulty: 'beginner',
    tags: ['planning', 'iteration', 'checklist'],
    downloadUrl: '/templates/iteration-checklist.pdf',
    featured: false,
    popularity: 84,
    lastUpdated: new Date('2024-01-14')
  }
];

const CATEGORIES: ResourceCategory[] = [
  { id: 'guide', name: 'Guides', icon: BookOpen, description: 'In-depth explanations', count: 0 },
  { id: 'video', name: 'Videos', icon: Video, description: 'Visual tutorials', count: 0 },
  { id: 'template', name: 'Templates', icon: FileText, description: 'Ready-to-use formats', count: 0 },
  { id: 'worksheet', name: 'Worksheets', icon: File, description: 'Interactive exercises', count: 0 }
];

export const SupportResources: React.FC<SupportResourcesProps> = ({
  currentPhase,
  gradeLevel,
  recentIterationType,
  onResourceClick,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  // Filter resources based on current context
  const filteredResources = useMemo(() => {
    let filtered = [...RESOURCES];

    // Filter by phase
    filtered = filtered.filter(r => 
      r.phase === 'all' || r.phase === currentPhase
    );

    // Filter by grade level
    filtered = filtered.filter(r => 
      r.gradeLevel.includes(gradeLevel)
    );

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by featured
    if (showFeaturedOnly) {
      filtered = filtered.filter(r => r.featured);
    }

    // Sort by relevance
    filtered.sort((a, b) => {
      // Prioritize iteration-specific resources if there's a recent iteration
      if (recentIterationType) {
        const aMatch = a.iterationType === recentIterationType ? 10 : 0;
        const bMatch = b.iterationType === recentIterationType ? 10 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }

      // Then sort by popularity
      return b.popularity - a.popularity;
    });

    return filtered;
  }, [currentPhase, gradeLevel, selectedCategory, searchQuery, showFeaturedOnly, recentIterationType]);

  // Get recommended resources
  const recommendedResources = useMemo(() => {
    const recommendations: Resource[] = [];

    // Add phase-specific featured resource
    const phaseFeatured = RESOURCES.find(r => 
      r.phase === currentPhase && 
      r.featured && 
      r.gradeLevel.includes(gradeLevel)
    );
    if (phaseFeatured) recommendations.push(phaseFeatured);

    // Add iteration-specific resource if applicable
    if (recentIterationType) {
      const iterationResource = RESOURCES.find(r => 
        r.iterationType === recentIterationType &&
        r.gradeLevel.includes(gradeLevel)
      );
      if (iterationResource) recommendations.push(iterationResource);
    }

    // Add popular general resource
    const popularGeneral = RESOURCES
      .filter(r => r.phase === 'all' && r.gradeLevel.includes(gradeLevel))
      .sort((a, b) => b.popularity - a.popularity)[0];
    if (popularGeneral && !recommendations.includes(popularGeneral)) {
      recommendations.push(popularGeneral);
    }

    return recommendations.slice(0, 3);
  }, [currentPhase, gradeLevel, recentIterationType]);

  // Update category counts
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      count: filteredResources.filter(r => r.type === cat.id).length
    }));
  }, [filteredResources]);

  // Handle saving/bookmarking resources
  const handleSaveResource = (resourceId: string) => {
    setSavedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  // Get icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'guide': return BookOpen;
      case 'video': return PlayCircle;
      case 'template': return FileText;
      case 'worksheet': return File;
      default: return FileText;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: Resource['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-orange-600 bg-orange-100';
      case 'advanced': return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Support Resources
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Curated resources for your current phase and grade level
            </p>
          </div>
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
              showFeaturedOnly
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Featured
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-primary-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {categoriesWithCounts.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommended Resources */}
      {recommendedResources.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <div className="p-6 bg-primary-50 border-b border-primary-100">
          <h3 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendedResources.map(resource => {
              const Icon = getResourceIcon(resource.type);
              return (
                <motion.div
                  key={resource.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-3 cursor-pointer border border-primary-200 hover:shadow-md transition-shadow"
                  onClick={() => onResourceClick && onResourceClick(resource)}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-primary-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Categories */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoriesWithCounts.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <category.icon className={`w-5 h-5 mb-1 ${
                selectedCategory === category.id ? 'text-primary-600' : 'text-gray-600'
              }`} />
              <div className="text-sm font-medium text-gray-900">{category.name}</div>
              <div className="text-xs text-gray-500">{category.count} available</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
        {filteredResources.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No resources found matching your criteria</p>
          </div>
        ) : (
          filteredResources.map(resource => {
            const Icon = getResourceIcon(resource.type);
            const isExpanded = expandedResource === resource.id;
            const isSaved = savedResources.has(resource.id);

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedResource(isExpanded ? null : resource.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {resource.title}
                              {resource.featured && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                          {resource.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {resource.duration}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {resource.popularity}% helpful
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveResource(resource.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-primary-600 bg-primary-100'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 p-4 bg-gray-50"
                    >
                      <div className="space-y-3">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          {resource.url && (
                            <button
                              onClick={() => onResourceClick && onResourceClick(resource)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              {resource.type === 'video' ? (
                                <>
                                  <PlayCircle className="w-4 h-4" />
                                  Watch
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4" />
                                  Open
                                </>
                              )}
                            </button>
                          )}
                          {resource.downloadUrl && (
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          )}
                          <button className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-gray-500">
                          Last updated: {resource.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Saved Resources Count */}
      {savedResources.size > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {savedResources.size} resource{savedResources.size !== 1 ? 's' : ''} saved
            </span>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View Saved
            </button>
          </div>
        </div>
      )}
    </div>
  );
};