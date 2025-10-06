import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { JourneyPhaseDraft } from './JourneyBoard';

type PhaseEditorDrawerProps = {
  open: boolean;
  phase: JourneyPhaseDraft | null;
  onClose(): void;
  onSave(phase: JourneyPhaseDraft): void;
};

export function PhaseEditorDrawer({ open, phase, onClose, onSave }: PhaseEditorDrawerProps) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [activitiesText, setActivitiesText] = useState('');
  const [checkpoint, setCheckpoint] = useState('');

  useMemo(() => {
    if (!open || !phase) {return;}
    setName(phase.name ?? '');
    setFocus(phase.focus ?? '');
    setActivitiesText((phase.activities ?? []).join('\n'));
    setCheckpoint(phase.checkpoint ?? '');
  }, [open, phase]);

  if (!open || !phase) {
    return null;
  }

  const handleSave = () => {
    const normalizedActivities = activitiesText
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean);

    onSave({
      ...phase,
      name: name.trim() || phase.name,
      focus: focus.trim(),
      activities: normalizedActivities,
      checkpoint: checkpoint.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Zoom in</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="space-y-1">
            <label htmlFor="phase-name" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Phase name
            </label>
            <input
              id="phase-name"
              value={name}
              onChange={event => setName(event.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Investigate the context"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phase-focus" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Goal / focus
            </label>
            <textarea
              id="phase-focus"
              value={focus}
              onChange={event => setFocus(event.target.value)}
              className="w-full min-h-[96px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Audit current realities, interview stakeholders, capture key insights."
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              What students accomplish by the end of this phase.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="phase-activities" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Activities (one per line)
            </label>
            <textarea
              id="phase-activities"
              value={activitiesText}
              onChange={event => setActivitiesText(event.target.value)}
              className="w-full min-h-[112px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder={'Interview community partners\nSynthesize findings with team\nDefine opportunity statement'}
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              List the key teacher- or student-led moves that build toward the checkpoint.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="phase-checkpoint" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Checkpoint
            </label>
            <input
              id="phase-checkpoint"
              value={checkpoint}
              onChange={event => setCheckpoint(event.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Draft empathy map complete and teacher-approved."
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              How students demonstrate progress at the end of this phase.
            </p>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Save phase
          </button>
        </footer>
      </div>
    </div>
  );
}

