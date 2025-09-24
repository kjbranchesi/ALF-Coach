import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ShowcaseProject } from '../types/showcase';
import type { UnifiedProject } from '../types/project';
import { getShowcaseProject } from '../utils/showcase-projects';
import { loadUnified } from '../services/ShowcaseStorage';
import { fromShowcase, toShowcase } from '../utils/transformers/projectTransformers';
import PolishPanel from '../features/showcase/PolishPanel';
import { seedBlueprintFromUnified } from '../utils/seed/seedBlueprint';

export default function ProjectShowcase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ShowcaseProject | null>(null);
  const [unifiedProject, setUnifiedProject] = useState<UnifiedProject | null>(null);
  const [source, setSource] = useState<'storage' | 'registry' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPolishPanel, setShowPolishPanel] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      if (!id) {
        setProject(null);
        setSource(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const storedUnified = await loadUnified(id);
        if (!cancelled && storedUnified) {
          setUnifiedProject(storedUnified);
          setProject(toShowcase(storedUnified));
          setSource('storage');
          setShowPolishPanel(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('[ProjectShowcase] Failed to load from storage', error);
      }

      if (cancelled) return;

      const registryProject = getShowcaseProject(id) ?? null;
      if (registryProject) {
        const unified = fromShowcase(registryProject);
        unified.metadata = {
          ...unified.metadata,
          variant: 'showcase',
        };
        setUnifiedProject(unified);
      } else {
        setUnifiedProject(null);
      }
      setProject(registryProject);
      setSource(registryProject ? 'registry' : null);
      setShowPolishPanel(false);
      setIsLoading(false);
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-slate-600">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-slate-600">Project not found.</p>
        <button className="mt-4 px-4 py-2 rounded bg-slate-200" onClick={() => navigate('/app/samples')}>
          Back to Gallery
        </button>
      </div>
    );
  }

  const { meta, microOverview, quickSpark, outcomeMenu, assignments } = project;
  const showEditButton = source === 'storage';
  const showSeedButton = Boolean(unifiedProject);

  const handleOpenInDesignStudio = () => {
    if (!unifiedProject) return;
    const unifiedForSeed: UnifiedProject = {
      ...unifiedProject,
      metadata: {
        ...unifiedProject.metadata,
        seedSourceId: unifiedProject.meta.id,
        updatedAt: new Date().toISOString(),
      },
    };
    const blueprintId = seedBlueprintFromUnified(unifiedForSeed);
    navigate(`/app/blueprint/${blueprintId}?skip=true`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{meta.title}</h1>
            {meta.tagline && <p className="text-lg text-slate-600">{meta.tagline}</p>}
            <p className="text-sm text-slate-500">
              {meta.duration} · {meta.gradeBands.join(', ')} · {meta.subjects.join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showSeedButton && (
              <button
                type="button"
                onClick={handleOpenInDesignStudio}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-500 transition"
              >
                Open in Design Studio
              </button>
            )}
            {showEditButton && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/app/showcase/${meta.id}/edit`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium shadow hover:bg-primary-500 transition"
                >
                  Edit assignments
                </button>
                <button
                  type="button"
                  onClick={() => setShowPolishPanel(prev => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition"
                >
                  {showPolishPanel ? 'Hide Polish' : 'Polish'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Micro Overview */}
      <section>
        <p className="text-slate-700">{microOverview.microOverview}</p>
        {microOverview.longOverview && (
          <details className="mt-2">
            <summary className="cursor-pointer text-primary-600">Read full overview ▸</summary>
            <div className="mt-2 text-slate-700 whitespace-pre-line">{microOverview.longOverview}</div>
          </details>
        )}
      </section>

      {/* Quick Spark */}
      {quickSpark && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Quick Spark</h2>
          <div>
            <h3 className="font-medium">Hooks</h3>
            <ul className="list-disc ml-6">
              {quickSpark.hooks.map((hook, index) => (
                <li key={index}>{hook}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Mini Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Do</p>
                <ul className="list-disc ml-6">
                  {quickSpark.miniActivity.do.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Share</p>
                <ul className="list-disc ml-6">
                  {quickSpark.miniActivity.share.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Reflect</p>
                <ul className="list-disc ml-6">
                  {quickSpark.miniActivity.reflect.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Materials</p>
                <ul className="list-disc ml-6">
                  {quickSpark.miniActivity.materials.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Time window: {quickSpark.miniActivity.timeWindow} · Differentiation: {quickSpark.miniActivity.differentiationHint}
            </p>
            {quickSpark.miniActivity.aiTip && (
              <p className="text-sm text-slate-500">AI (optional): {quickSpark.miniActivity.aiTip}</p>
            )}
          </div>
        </section>
      )}

      {/* Outcome Menu */}
      {outcomeMenu && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Outcome Menu</h2>
          <p>
            <span className="font-medium">Core:</span> {outcomeMenu.core}
          </p>
          {outcomeMenu.choices && outcomeMenu.choices.length > 0 && (
            <>
              <p className="font-medium">Choose 2–3 extras:</p>
              <ul className="list-disc ml-6">
                {outcomeMenu.choices.map((choice, index) => (
                  <li key={index}>{choice}</li>
                ))}
              </ul>
            </>
          )}
          {outcomeMenu.audiences && outcomeMenu.audiences.length > 0 && (
            <>
              <p className="font-medium">Authentic audiences:</p>
              <ul className="list-disc ml-6">
                {outcomeMenu.audiences.map((audience, index) => (
                  <li key={index}>{audience}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Assignments */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Assignments</h2>
        {assignments.map(assignment => (
          <article key={assignment.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">
              {assignment.id} — {assignment.title} <span className="text-sm text-slate-500">({assignment.when})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p className="font-medium">Student directions</p>
                <ul className="list-disc ml-6">
                  {assignment.studentDirections.map((direction, index) => (
                    <li key={index}>{direction}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Teacher setup</p>
                <ul className="list-disc ml-6">
                  {assignment.teacherSetup.map((setup, index) => (
                    <li key={index}>{setup}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Evidence to collect</p>
                <ul className="list-disc ml-6">
                  {assignment.evidence.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Success criteria</p>
                <ul className="list-disc ml-6">
                  {assignment.successCriteria.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
            </div>
            {assignment.checkpoint && <p className="text-sm text-slate-500 mt-2">Checkpoint: {assignment.checkpoint}</p>}
            {assignment.aiOptional && <p className="text-sm text-slate-500">AI (optional): {assignment.aiOptional}</p>}
          </article>
        ))}
      </section>

      {showEditButton && showPolishPanel && (
        <PolishPanel onClose={() => setShowPolishPanel(false)} />
      )}
    </div>
  );
}
