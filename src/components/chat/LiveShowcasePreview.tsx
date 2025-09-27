import React, { useCallback, useEffect, useState } from 'react';
import { unifiedStorage } from '../../services/UnifiedStorageManager';

interface Props {
  projectId: string;
  onClose?: () => void;
}

export const LiveShowcasePreview: React.FC<Props> = ({ projectId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hero, setHero] = useState<any | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await unifiedStorage.loadHeroProject(projectId);
      setHero(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const json = await unifiedStorage.exportProject(projectId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectId}-project.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Showcase Preview</h3>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">Refresh</button>
          <button disabled={exporting} onClick={handleExport} className="text-xs px-2 py-1 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">{exporting ? 'Exporting…' : 'Export JSON'}</button>
          {onClose && (
            <button onClick={onClose} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">Close</button>
          )}
        </div>
      </div>
      <div className="p-4 text-sm text-gray-800 dark:text-gray-200 space-y-4 max-h-[70vh] overflow-auto">
        {loading && (
          <div className="text-gray-600 dark:text-gray-400">Building preview…</div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}
        {!loading && !error && hero && (
          <>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Title</div>
              <div className="text-base font-semibold">{hero.title || 'Untitled Project'}</div>
            </div>

            {hero.hero?.description && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Overview</div>
                <div>{hero.hero.description}</div>
              </div>
            )}

            {(hero.context?.problem || hero.challenge) && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Challenge</div>
                <div>{hero.context?.problem || hero.challenge}</div>
              </div>
            )}

            {/* Learning Objectives */}
            {Array.isArray(hero?.courseAbstract?.learningObjectives) && hero.courseAbstract.learningObjectives.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Learning Objectives</div>
                <ul className="list-disc list-inside space-y-1">
                  {hero.courseAbstract.learningObjectives.slice(0,6).map((o: any, idx: number) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Phases */}
            {Array.isArray(hero?.phases) && hero.phases.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Phases</div>
                <ul className="space-y-1">
                  {hero.phases.slice(0,6).map((p: any, idx: number) => (
                    <li key={p.id || idx} className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="font-medium">{p.name || p.title}</span>
                      {p.duration && <span className="text-gray-500">• {p.duration}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Milestones */}
            {Array.isArray(hero.milestones) && hero.milestones.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Milestones</div>
                <ul className="list-disc list-inside space-y-1">
                  {hero.milestones.slice(0,6).map((m: any) => (
                    <li key={m.id || m.name}>{m.name || m.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Artifacts */}
            {Array.isArray(hero?.artifacts) && hero.artifacts.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Artifacts</div>
                <ul className="list-disc list-inside space-y-1">
                  {hero.artifacts.slice(0,6).map((a: any, idx: number) => (
                    <li key={a.id || idx}>{a.name || a.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(hero.rubrics) && hero.rubrics.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Rubric</div>
                <div>{hero.rubrics[0]?.criteria?.length || 0} criteria</div>
              </div>
            )}

            {(hero.exhibition?.audience || hero.exhibition?.format) && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Exhibition</div>
                <div>
                  {hero.exhibition?.audience ? `Audience: ${hero.exhibition.audience}` : ''}
                  {hero.exhibition?.format ? ` • Format: ${hero.exhibition.format}` : ''}
                </div>
              </div>
            )}

            {/* Roles */}
            {Array.isArray(hero?.roles) && hero.roles.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Roles</div>
                <div className="flex flex-wrap gap-2">
                  {hero.roles.slice(0,8).map((r: any, idx: number) => (
                    <span key={r.id || idx} className="px-2 py-1 rounded-full border text-xs bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300">
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Standards Summary */}
            {Array.isArray(hero?.standards) && hero.standards.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Standards Summary</div>
                <div className="text-gray-700 dark:text-gray-300">
                  {hero.standards.length} standards • {hero.standards.slice(0,3).map((s: any) => s.code || s.id).filter(Boolean).join(', ')}
                </div>
              </div>
            )}

            {/* Communications Overview */}
            {Array.isArray(hero?.communications) && hero.communications.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Communications</div>
                <ul className="list-disc list-inside space-y-1">
                  {hero.communications.slice(0,5).map((c: any, idx: number) => (
                    <li key={c.id || idx}>{c.audience ? `${c.audience}: ` : ''}{c.subject || c.title || 'Message'}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {!loading && !error && !hero && (
          <div className="text-gray-600 dark:text-gray-400">No preview available yet.</div>
        )}
      </div>
    </div>
  );
};

export default LiveShowcasePreview;
