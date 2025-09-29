import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unifiedStorage } from '../../services/UnifiedStorageManager';

export default function ProjectShowcasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Treat slug as projectId for MVP
        const hero = await unifiedStorage.loadHeroProject(id || '');
        if (!mounted) return;
        setData(hero);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load project');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const title = data?.title || 'Untitled Project';
  const objectives = (data?.courseAbstract?.learningObjectives || []) as string[];
  const phases = (data?.phases || []) as any[];
  const artifacts = (data?.artifacts || []) as any[];
  const rubrics = (data?.rubrics || []) as any[];
  const checklists = (data?.checklists || []) as any[];
  const exhibition = data?.exhibition || {};
  const communications = (data?.communications || []) as any[];
  const standards = (data?.standards || []) as any[];
  const roles = (data?.roles || []) as any[];

  const handleExport = async () => {
    try {
      const json = await unifiedStorage.exportProject(id || '');
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}-project.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">Loading showcase…</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-xl border bg-white">
          <div className="text-red-600 mb-2">{error}</div>
          <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => navigate('/app/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            {data?.hero?.description && (
              <p className="text-gray-600 mt-1">{data.hero.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => navigate('/app/dashboard')}>Back</button>
            <button className="px-3 py-2 rounded-lg bg-primary-600 text-white" onClick={handleExport}>Download JSON</button>
          </div>
        </header>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Learning Objectives</h2>
          {objectives.length === 0 ? (
            <div className="text-gray-500">No objectives yet.</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Phases</h2>
          {phases.length === 0 ? (
            <div className="text-gray-500">No phases yet.</div>
          ) : (
            <div className="space-y-3">
              {phases.map((p, i) => (
                <div key={p.id || i} className="rounded-xl border p-3 bg-white">
                  <div className="font-medium">{p.name || p.title}</div>
                  {p.description && <div className="text-gray-600 text-sm mt-1">{p.description}</div>}
                  {p.milestones?.length > 0 && (
                    <div className="text-sm text-gray-600 mt-2">Milestones: {p.milestones.map((m: any) => m.name || m.title).join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Final Artifacts</h2>
          {artifacts.length === 0 ? (
            <div className="text-gray-500">No artifacts yet.</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {artifacts.map((a, i) => <li key={a.id || i}>{a.name || a.title}</li>)}
            </ul>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Rubrics</h2>
          {rubrics.length === 0 ? (
            <div className="text-gray-500">No rubric yet.</div>
          ) : (
            <div className="space-y-2">
              {rubrics.map((r, i) => (
                <details key={r.id || i} className="rounded-lg border bg-white">
                  <summary className="cursor-pointer px-3 py-2 font-medium">{r.title || `Rubric ${i+1}`}</summary>
                  <div className="px-3 pb-3 text-sm text-gray-700">
                    {r.criteria?.length ? `${r.criteria.length} criteria` : 'No criteria listed'}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Checklists</h2>
          {checklists.length === 0 ? (
            <div className="text-gray-500">No checklists yet.</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {checklists.map((c, i) => <li key={c.id || i}>{c.title}</li>)}
            </ul>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Exhibition</h2>
          <div className="text-gray-700">
            {exhibition?.format ? `Format: ${exhibition.format}` : 'No exhibition plan yet.'}
            {exhibition?.audience ? ` • Audience: ${Array.isArray(exhibition.audience) ? exhibition.audience.join(', ') : exhibition.audience}` : ''}
          </div>
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Communications</h2>
          {communications.length === 0 ? (
            <div className="text-gray-500">No communications yet.</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {communications.map((c, i) => (
                <li key={c.id || i}>{c.audience ? `${c.audience}: ` : ''}{c.subject || c.title || 'Message'}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="brand-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Standards</h2>
          {standards.length === 0 ? (
            <div className="text-gray-500">No standards yet.</div>
          ) : (
            <div className="text-gray-700 text-sm">
              {standards.slice(0,12).map((s, i) => <span key={s.id || i} className="inline-block mr-2 mb-1 px-2 py-1 rounded-full border bg-white">{s.code || s.id}</span>)}
            </div>
          )}
        </section>

        <section className="brand-section mb-12">
          <h2 className="text-xl font-semibold mb-2">Roles & Supports</h2>
          {roles.length === 0 ? (
            <div className="text-gray-500">No roles defined yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roles.map((r, i) => <span key={r.id || i} className="px-2 py-1 rounded-full border bg-white">{r.name}</span>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
