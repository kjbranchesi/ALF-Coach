// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal.jsx';

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

const COMPLETENESS_PALETTE = {
  core: 'from-primary-500 to-primary-600',
  context: 'from-ai-500 to-ai-600',
  progressive: 'from-coral-500 to-coral-600'
};

const COMPLETENESS_LABELS = {
  core: 'Core',
  context: 'Context',
  progressive: 'Progressive'
};

const TIER_BADGES = {
  core: 'bg-primary-50 text-primary-600 border-primary-100',
  scaffold: 'bg-purple-50 text-purple-600 border-purple-100',
  aspirational: 'bg-amber-50 text-amber-600 border-amber-100'
};

const DEFAULT_METRICS = {
  learningGoals: 0,
  successCriteria: 0,
  phases: 0,
  milestones: 0,
  artifacts: 0,
  rubrics: 0,
  roles: 0,
  scaffolds: 0,
  checkpoints: 0,
  risks: 0
};

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function ProjectCard({ draft, onDelete, onOpen }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const overall = Math.round(draft?.completeness?.overall ?? 0);
  const completionBreakdown = [
    { key: 'core', value: Math.round(draft?.completeness?.core ?? 0) },
    { key: 'context', value: Math.round(draft?.completeness?.context ?? 0) },
    { key: 'progressive', value: Math.round(draft?.completeness?.progressive ?? 0) }
  ];

  const tierCounts = [
    { key: 'core', value: draft?.tierCounts?.core ?? 0 },
    { key: 'scaffold', value: draft?.tierCounts?.scaffold ?? 0 },
    { key: 'aspirational', value: draft?.tierCounts?.aspirational ?? 0 }
  ];

  const metrics = draft?.metrics ?? DEFAULT_METRICS;
  const metricPairs = [
    { label: 'Phases', value: metrics.phases, secondaryLabel: 'Milestones', secondaryValue: metrics.milestones },
    { label: 'Artifacts', value: metrics.artifacts, secondaryLabel: 'Rubrics', secondaryValue: metrics.rubrics },
    { label: 'Roles', value: metrics.roles, secondaryLabel: 'Scaffolds', secondaryValue: metrics.scaffolds },
    { label: 'Checkpoints', value: metrics.checkpoints, secondaryLabel: 'Risks', secondaryValue: metrics.risks }
  ];

  const handleOpen = () => {
    if (!draft?.id) {
      return;
    }
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
      <Card
        hover
        className="h-full cursor-pointer group overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
        onClick={handleOpen}
      >
        <div className="p-6 h-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Heading
              level={3}
              className="truncate group-hover:text-primary-600 transition-colors"
              title={draft?.title || 'Untitled project'}
            >
              {draft?.title || 'Untitled project'}
            </Heading>
            <Caption color="muted">
              Updated {formatDate(draft?.updatedAt)}
            </Caption>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Overall completeness</span>
                <span>{overall}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                  style={{ width: `${Math.min(Math.max(overall, 0), 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {completionBreakdown.map(({ key, value }) => (
                <div
                  key={key}
                  className={`rounded-xl border border-white/40 bg-white/70 dark:bg-slate-900/40 px-3 py-2 shadow-sm`}
                >
                  <Text size="xs" className="uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {COMPLETENESS_LABELS[key]}
                  </Text>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${COMPLETENESS_PALETTE[key]}`}
                      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Divider className="mb-3" />
            <div className="flex flex-wrap gap-2">
              {tierCounts.map(({ key, value }) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${TIER_BADGES[key]}`}
                >
                  <span className="capitalize">{key}</span>
                  <span className="text-slate-600 dark:text-slate-300">{value}</span>
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {metricPairs.map(({ label, value, secondaryLabel, secondaryValue }) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {label} • {secondaryLabel}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ {secondaryValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <IconButton
              icon="delete"
              label="Delete project"
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="hover:text-red-600 transition-colors"
            />
            <Button
              variant="ghost"
              size="sm"
              rightIcon="forward"
              onClick={handleOpen}
              className="hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Delete “${draft?.title || 'Untitled project'}”? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting…' : 'Delete'}
        disabled={isDeleting}
      />
    </>
  );
}
