import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AssignmentCard, UnifiedProject } from '../../types/project';
import { loadUnified, saveUnifiedProject } from '../../services/ShowcaseStorage';

interface AssignmentEditorState {
  project: UnifiedProject | null;
  isLoading: boolean;
  error: string | null;
  info: string | null;
}

const DEFAULT_ASSIGNMENT: AssignmentCard = {
  id: 'A1',
  title: 'New assignment',
  when: 'Week 1',
  studentDirections: ['Add student directions'],
  teacherSetup: ['Add teacher setup'],
  evidence: ['Define evidence to collect'],
  successCriteria: ['List success indicators'],
  checkpoint: '',
  aiOptional: '',
};

const listLimits: Record<keyof Pick<AssignmentCard, 'studentDirections' | 'teacherSetup' | 'evidence' | 'successCriteria'>, number> = {
  studentDirections: 7,
  teacherSetup: 5,
  evidence: 3,
  successCriteria: 5,
};

const listLabels: Record<keyof Pick<AssignmentCard, 'studentDirections' | 'teacherSetup' | 'evidence' | 'successCriteria'>, string> = {
  studentDirections: 'Student directions',
  teacherSetup: 'Teacher setup',
  evidence: 'Evidence to collect',
  successCriteria: 'Success criteria',
};

const toText = (items: string[]): string => items.join('\n');

const fromText = (value: string): string[] =>
  value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

const AssignmentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<AssignmentEditorState>({
    project: null,
    isLoading: true,
    error: null,
    info: null,
  });
  const [assignments, setAssignments] = useState<AssignmentCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      if (!id) {
        setState({ project: null, isLoading: false, error: 'Missing project id', info: null });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null, info: null }));
      try {
        const project = await loadUnified(id);
        if (!cancelled) {
          if (project) {
            setState({ project, isLoading: false, error: null, info: null });
            setAssignments(project.assignments?.length ? project.assignments : [DEFAULT_ASSIGNMENT]);
          } else {
            setState({ project: null, isLoading: false, error: 'Project not found in storage. Convert it via Quick Spark first.', info: null });
          }
        }
      } catch (error) {
        console.error('[AssignmentEditor] Failed to load project', error);
        if (!cancelled) {
          setState({ project: null, isLoading: false, error: 'Unable to load project', info: null });
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateAssignment = (index: number, next: Partial<AssignmentCard>) => {
    setAssignments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...next };
      return updated;
    });
  };

  const handleListChange = (
    index: number,
    key: keyof Pick<AssignmentCard, 'studentDirections' | 'teacherSetup' | 'evidence' | 'successCriteria'>,
    value: string
  ) => {
    updateAssignment(index, { [key]: fromText(value) } as Partial<AssignmentCard>);
  };

  const handleFieldChange = (index: number, key: keyof AssignmentCard, value: string) => {
    updateAssignment(index, { [key]: value });
  };

  const addAssignment = () => {
    setAssignments(prev => {
      const nextIndex = prev.length + 1;
      const nextId = `A${nextIndex}`;
      return [...prev, { ...DEFAULT_ASSIGNMENT, id: nextId }];
    });
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((assignment, idx) => ({
        ...assignment,
        id: `A${idx + 1}`,
      }));
    });
  };

  const moveAssignment = (index: number, direction: -1 | 1) => {
    setAssignments(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {return prev;}
      const copy = [...prev];
      const temp = copy[target];
      copy[target] = copy[index];
      copy[index] = temp;
      return copy.map((assignment, idx) => ({
        ...assignment,
        id: `A${idx + 1}`
      }));
    });
  };

  const limitWarnings = useMemo(() => {
    return assignments.map(assignment => {
      const warnings: string[] = [];
      (Object.keys(listLimits) as Array<keyof typeof listLimits>).forEach(key => {
        const items = assignment[key] || [];
        if (items.length > listLimits[key]) {
          warnings.push(`${listLabels[key]} has ${items.length} items (recommended ≤ ${listLimits[key]}).`);
        }
      });
      return warnings;
    });
  }, [assignments]);

  const handleSave = async () => {
    if (!state.project) {return;}
    setState(prev => ({ ...prev, error: null, info: null }));

    try {
      const projectToSave: UnifiedProject = {
        ...state.project,
        assignments,
        metadata: {
          ...state.project.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      await saveUnifiedProject(projectToSave);
      setState(prev => ({ ...prev, project: projectToSave, info: 'Assignments saved successfully.' }));
    } catch (error) {
      console.error('[AssignmentEditor] Failed to save project', error);
      setState(prev => ({ ...prev, error: 'Unable to save assignments. Please try again.' }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-slate-600">Loading assignments…</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <p className="text-slate-600">{state.error}</p>
        <button
          type="button"
          onClick={() => navigate('/app/samples?show=showcase')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  if (!state.project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Edit assignments</h1>
            <p className="text-sm text-slate-500">{state.project.meta.title}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/app/showcase/${state.project?.meta.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              View project
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-500"
            >
              Save assignments
            </button>
            <button
              type="button"
              onClick={addAssignment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Add assignment
            </button>
          </div>
        </header>

        {state.info && <p className="text-sm text-emerald-600">{state.info}</p>}

        <div className="space-y-6">
          {assignments.map((assignment, index) => (
            <section
              key={assignment.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {assignment.id} — {assignment.title || 'Untitled'}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => moveAssignment(index, -1)}
                    className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                    disabled={index === 0}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAssignment(index, 1)}
                    className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                    disabled={index === assignments.length - 1}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAssignment(index)}
                    className="px-3 py-1 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Assignment title</label>
                  <input
                    type="text"
                    value={assignment.title}
                    onChange={event => handleFieldChange(index, 'title', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">When</label>
                  <input
                    type="text"
                    value={assignment.when}
                    onChange={event => handleFieldChange(index, 'when', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {(Object.keys(listLimits) as Array<keyof typeof listLimits>).map(key => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{listLabels[key]}</label>
                    <span className="text-xs text-slate-400">Recommend ≤ {listLimits[key]} bullets</span>
                  </div>
                  <textarea
                    value={toText(assignment[key] || [])}
                    onChange={event => handleListChange(index, key, event.target.value)}
                    rows={assignment[key]?.length ? Math.max(assignment[key]?.length + 1, 4) : 4}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Checkpoint (optional)</label>
                  <textarea
                    value={assignment.checkpoint || ''}
                    onChange={event => handleFieldChange(index, 'checkpoint', event.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">AI optional (optional)</label>
                  <textarea
                    value={assignment.aiOptional || ''}
                    onChange={event => handleFieldChange(index, 'aiOptional', event.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {limitWarnings[index]?.length > 0 && (
                <ul className="list-disc pl-6 text-xs text-amber-600 space-y-1">
                  {limitWarnings[index].map((warning, warningIdx) => (
                    <li key={warningIdx}>{warning}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentEditor;
