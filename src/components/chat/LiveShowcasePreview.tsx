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
      <div className="p-4 text-sm text-gray-800 dark:text-gray-200 space-y-3 max-h-[70vh] overflow-auto">
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

