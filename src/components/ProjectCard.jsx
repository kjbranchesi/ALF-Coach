// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal.jsx';
import { getSubjectTheme, getGradeBandTheme } from '../utils/projectThemes';
import {
  Clock,
  BookOpen,
  Users,
  ChevronRight,
  Trash2,
  FlaskConical,
  Calculator,
  Cog,
  Cpu,
  Landmark,
  Globe2,
  Palette,
  Music,
  Dumbbell,
  HeartPulse,
  Leaf,
  Sparkles
} from 'lucide-react';

// Design System imports
import {
  Card,
  Heading,
  Text,
  Button,
  IconButton,
  Divider,
  Caption
} from '../design-system';

// Sophisticated card with macOS Tahoe-style design

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  // Relative time for recent dates
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {return 'Today';}
  if (diffDays === 1) {return 'Yesterday';}
  if (diffDays < 7) {return `${diffDays} days ago`;}
  if (diffDays < 30) {return `${Math.floor(diffDays / 7)} weeks ago`;}

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatRelativeTime(value) {
  if (!value) {return '';}
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {return '';}

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {return 'Just now';}
  if (diffMins < 60) {return `${diffMins}m ago`;}
  if (diffHours < 24) {return `${diffHours}h ago`;}
  if (diffDays === 1) {return 'Yesterday';}
  if (diffDays < 7) {return `${diffDays}d ago`;}

  return formatDate(value);
}

const SUBJECT_ICON_MAP = [
  { keywords: ['math', 'mathematics'], icon: Calculator },
  { keywords: ['science', 'stem', 'biology', 'chemistry', 'physics'], icon: FlaskConical },
  { keywords: ['engineering'], icon: Cog },
  { keywords: ['technology', 'computer science', 'coding'], icon: Cpu },
  { keywords: ['language arts', 'english', 'ela', 'writing', 'literacy'], icon: BookOpen },
  { keywords: ['history', 'social studies', 'civics'], icon: Landmark },
  { keywords: ['geography', 'global', 'world'], icon: Globe2 },
  { keywords: ['art', 'design', 'visual'], icon: Palette },
  { keywords: ['music'], icon: Music },
  { keywords: ['physical education', 'physical ed', 'pe', 'athletic', 'sports'], icon: Dumbbell },
  { keywords: ['health', 'wellness'], icon: HeartPulse },
  { keywords: ['environment', 'environmental', 'ecology', 'sustainability'], icon: Leaf },
  { keywords: ['steam', 'pbl', 'project-based', 'interdisciplinary'], icon: Sparkles },
];

function resolveSubjectIcon(subjectLabel) {
  if (!subjectLabel) {return Sparkles;}
  const normalized = subjectLabel.toLowerCase();
  const match = SUBJECT_ICON_MAP.find(entry =>
    entry.keywords.some(keyword => normalized.includes(keyword))
  );
  return match ? match.icon : Sparkles;
}

export default function ProjectCard({ draft, onDelete, onOpen }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract project metadata with intelligent defaults
  const title = draft?.title || 'Untitled Project';
  const description = draft?.description || ''; // Course description
  const subject = draft?.subject || draft?.subjects?.[0] || 'General';
  const gradeBand = draft?.gradeBand || draft?.grade_level || 'K-12';
  const duration = draft?.duration || draft?.timeframe || null;
  const topic = draft?.projectTopic || draft?.overview || '';
  const updatedAt = draft?.updatedAt || draft?.updated_at;
  const stage = draft?.stage || 'draft';
  const status = draft?.status || 'draft';
  const source = draft?.source || 'wizard';

  // Get theme based on subject
  const resolvedSubject = Array.isArray(subject) ? subject[0] : subject;
  const theme = getSubjectTheme(resolvedSubject);
  const gradeTheme = getGradeBandTheme(gradeBand);
  const SubjectIcon = resolveSubjectIcon(resolvedSubject);

  // Format stage label
  const stageLabel = String(stage).replace(/_/g, ' ').toLowerCase();
  const stageDisplay = stageLabel.replace(/\b\w/g, char => char.toUpperCase());
  const isComplete = stageLabel.includes('complete') || status === 'ready' || status === 'published';

  // Determine badge type and text
  const getBadge = () => {
    if (source === 'sample') {return { text: 'Sample', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60' };}
    if (status === 'ready' || isComplete) {return { text: 'Ready', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60' };}
    if (status === 'in-progress') {return { text: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60' };}
    return { text: 'Draft', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60' };
  };
  const badge = getBadge();

  // Show description if available, otherwise show topic
  const showDescription = description && description.trim();
  const showTopic = !showDescription && topic && topic.trim() && topic.trim().toLowerCase() !== title.trim().toLowerCase();

  const handleOpen = () => {
    if (!draft?.id) {return;}
    if (typeof onOpen === 'function') {
      onOpen(draft.id);
    }
  };

  const handleDeleteClick = event => {
    event.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!draft?.id || !onDelete) {
      setIsModalOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(draft.id);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <article
        onClick={handleOpen}
        className="squircle-card group relative overflow-hidden cursor-pointer
                   bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg
                   border border-slate-200/50 dark:border-slate-700/50
                   shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
                   hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]
                   hover:scale-[1.01] active:scale-[0.99]
                   transition-all duration-240"
      >
        {/* Accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px] rounded-l-[20px]"
          style={{ backgroundColor: theme.color, opacity: 0.85 }}
        />

        {/* Subtle gradient overlay based on subject */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${theme.bgLight} 0%, transparent 100%)`
          }}
        />

        <div className="relative p-7 sm:p-8 flex flex-col gap-5 h-full">
          {/* Header: Icon + Title */}
          <div className="flex items-start gap-4">
            {/* Subject Icon */}
            <div
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center squircle-pure"
              style={{
                backgroundColor: theme.bgLight,
                color: theme.color,
              }}
            >
              <SubjectIcon className="w-6 h-6" />
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </h3>
              {showDescription && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                  {description}
                </p>
              )}
              {showTopic && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                  {topic}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-wide ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="flex flex-wrap gap-2">
            {/* Grade Band Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <Users className="w-3.5 h-3.5" style={{ color: gradeTheme.color }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {gradeTheme.badge}
              </span>
            </div>

            {/* Duration Badge */}
            {duration && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {duration}
                </span>
              </div>
            )}

            {/* Subject Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <BookOpen className="w-3.5 h-3.5" style={{ color: theme.color }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {resolvedSubject}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/60 dark:border-slate-700/60" />

          {/* Footer: Updated time + Actions */}
          <div className="flex items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Updated {formatRelativeTime(updatedAt)}</span>
              {isComplete && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Complete</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                aria-label="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Open Button */}
              <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
              >
                <span>Open</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Delete "${title}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting…' : 'Delete'}
        disabled={isDeleting}
      />
    </>
  );
}
