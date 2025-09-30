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

// Simplified card: show title, updated date, and a minimal status.

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

  const stageLabel = draft?.stage ? String(draft.stage).replace(/_/g, ' ').toLowerCase() : 'draft';

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
        className="h-full cursor-pointer group overflow-hidden transition-all duration-150 bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md"
        onClick={handleOpen}
      >
        <div className="p-5 sm:p-6 h-full flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <Heading
              level={3}
              className="truncate group-hover:text-primary-600 transition-colors"
              title={draft?.title || 'Untitled project'}
            >
              {draft?.title || 'Untitled project'}
            </Heading>
            <div className="flex items-center gap-2">
              <Caption color="muted">Updated {formatDate(draft?.updatedAt)}</Caption>
              <span className="text-gray-300">•</span>
              <Caption color="muted">{stageLabel}</Caption>
            </div>
          </div>
          <Divider />

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
              Open
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
