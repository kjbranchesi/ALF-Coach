import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllSampleBlueprints } from '../utils/sampleBlueprints';
import { auth } from '../firebase/firebase';
import HeroProjectShowcase from './HeroProjectShowcase';

export default function SamplePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // For the sustainability hero project, we can optionally use the showcase component
  // But for now, let's use the standard preview for all projects to ensure correct content
  // if (id === 'hero-sustainability-campaign') {
  //   return <HeroProjectShowcase />;
  // }

  const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
  const sample = getAllSampleBlueprints(uid).find((s) => s.id === id);

  if (!sample) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="glass-squircle border p-6">
          <h1 className="text-xl font-semibold mb-2">Sample not found</h1>
          <button className="px-4 py-2 rounded-full border" onClick={() => navigate('/app/samples')}>Back to Samples</button>
        </div>
      </div>
    );
  }

  const { wizardData, ideation, journey, deliverables, assignments, alignment } = sample as any;



  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
        <button onClick={() => navigate('/app/samples')} className="hover:underline">Samples</button>
        <span className="mx-1">/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{wizardData?.projectTopic}</span>
      </nav>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{wizardData?.projectTopic}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {(Array.isArray(wizardData?.subjects) ? wizardData.subjects.join(', ') : wizardData?.subject) || 'General'}
            {' • '} {wizardData?.gradeLevel || 'All levels'} {' • '} {wizardData?.duration || 'short'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/app/samples')} className="px-4 py-2 rounded-full border">Back</button>
          {/* Enhanced view button removed - all projects use standard preview */}
        </div>
      </div>

      {alignment && (
        <div className="mt-2 glass-squircle border p-5" role="region" aria-labelledby="standards-h">
          <h2 id="standards-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Standards Alignment</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {Object.entries(alignment).map(([family, items]: any) => (
              <div key={family} className="bg-white/50 dark:bg-gray-800/50 border rounded-md p-3">
                <div className="font-medium mb-1">{family}</div>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  {items.map((s: any, i: number) => (
                    <li key={i}><span className="font-medium">{s.code}:</span> {s.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-squircle border p-5" role="region" aria-labelledby="big-idea-h">
          <h2 id="big-idea-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Big Idea</h2>
          <p className="text-gray-700 dark:text-gray-300">{ideation?.bigIdea}</p>
        </div>
        <div className="glass-squircle border p-5" role="region" aria-labelledby="eq-h">
          <h2 id="eq-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Essential Question</h2>
          <p className="text-gray-700 dark:text-gray-300">{ideation?.essentialQuestion}</p>
        </div>
        <div className="glass-squircle border p-5 md:col-span-2" role="region" aria-labelledby="challenge-h">
          <h2 id="challenge-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Challenge</h2>
          <p className="text-gray-700 dark:text-gray-300">{ideation?.challenge}</p>
        </div>
      </div>

      <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="journey-h">
        <h2 id="journey-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Learning Journey</h2>
        {Array.isArray(journey?.phases) && journey.phases.length > 0 ? (
          <div className="space-y-4">
            {journey.phases.map((phase: any, i: number) => (
              <div key={phase.id || i} className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{phase.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{phase.description}</p>
                {phase.goal && <p className="text-gray-700 dark:text-gray-300"><strong>Goal:</strong> {phase.goal}</p>}
                {phase.keyQuestion && <p className="text-gray-700 dark:text-gray-300"><strong>Key Question:</strong> {phase.keyQuestion}</p>}
                {phase.duration && <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {phase.duration}</p>}
              </div>
            ))}
          </div>
        ) : (
          <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
            {journey && Object.entries(journey).filter(([k]) => k !== 'activities' && k !== 'resources' && k !== 'phases').map(([k, v]: any) => (
              <li key={k}><strong className="capitalize">{k}:</strong> {typeof v === 'object' ? (v?.goal || v?.activity || JSON.stringify(v)) : v}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="milestones-h">
        <h2 id="milestones-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Milestones</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {Array.isArray(deliverables?.milestones) && deliverables.milestones.length > 0 ? (
            typeof deliverables.milestones[0] === 'string' ?
              deliverables.milestones.join(', ') :
              deliverables.milestones.map((m: any) => m.name || m.title || m).join(', ')
          ) : 'TBD'}
        </p>
      </div>

      {Array.isArray(journey?.activities) && journey.activities.length > 0 && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="activities-h">
          <h2 id="activities-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Suggested Activities</h2>
          <ol className="list-decimal ml-6 space-y-1 text-gray-700 dark:text-gray-300">
            {journey.activities.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </div>
      )}

      {Array.isArray(journey?.resources) && journey.resources.length > 0 && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="resources-h">
          <h2 id="resources-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Resources</h2>
          <ul className="list-disc ml-5 space-y-2 text-gray-700 dark:text-gray-300">
            {journey.resources.map((r: any, i: number) => (
              <li key={i}>
                {typeof r === 'string' ? (
                  r
                ) : (
                  <div>
                    <strong>{r.name}</strong>
                    {r.type && <span className="text-sm text-gray-600 dark:text-gray-400"> ({r.type})</span>}
                    {r.description && <div className="text-sm">{r.description}</div>}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {r.url}
                      </a>
                    )}
                    {r.when && <div className="text-sm italic">{r.when}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(deliverables?.milestones) && deliverables.milestones.length > 0 && typeof deliverables.milestones[0] === 'object' && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="milestones-detailed-h">
          <h2 id="milestones-detailed-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Detailed Milestones</h2>
          <ul className="space-y-2">
            {deliverables.milestones.map((m: any, i: number) => (
              <li key={i} className="border rounded-md p-3 bg-white/50 dark:bg-gray-800/50">
                <div className="font-medium">{m.title}</div>
                {m.description && <div className="text-sm text-gray-600 dark:text-gray-400">{m.description}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {deliverables?.rubric?.criteria && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="rubric-h">
          <h2 id="rubric-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Assessment Rubric</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400">
                  <th className="py-2 pr-4">Criterion</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4 text-right">Weight</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.rubric.criteria.map((c: any, i: number) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2 pr-4 font-medium">{c.criterion}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{c.description}</td>
                    <td className="py-2 pr-4 text-right">{c.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(deliverables?.impact?.audience || deliverables?.impact?.method || deliverables?.impact?.timeline) && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="impact-h">
          <h2 id="impact-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Authentic Impact</h2>
          <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
            {deliverables?.impact?.audience && (
              <li>
                <strong>Audience:</strong> {
                  typeof deliverables.impact.audience === 'string'
                    ? deliverables.impact.audience
                    : deliverables.impact.audience.description ||
                      [deliverables.impact.audience.primary, deliverables.impact.audience.secondary, deliverables.impact.audience.community]
                        .filter(Boolean)
                        .join(', ')
                }
              </li>
            )}
            {deliverables?.impact?.method && (
              <li>
                <strong>Method:</strong> {
                  typeof deliverables.impact.method === 'string'
                    ? deliverables.impact.method
                    : deliverables.impact.method.description ||
                      [deliverables.impact.method.formal, deliverables.impact.method.digital, deliverables.impact.method.media, deliverables.impact.method.direct]
                        .filter(Boolean)
                        .join(', ')
                }
              </li>
            )}
            {deliverables?.impact?.timeline && <li><strong>Timeline:</strong> {deliverables.impact.timeline}</li>}
          </ul>
        </div>
      )}

      {Array.isArray(assignments) && assignments.length > 0 && (
        <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="lessonplans-h">
          <h2 id="lessonplans-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Phase Lesson Plans</h2>

          <div className="space-y-6">
            {assignments.map((a: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4 bg-white/60 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{a.phase}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{a.duration}</div>
                </div>

                {a.objectives && (
                  <div className="mt-2">
                    <div className="font-medium">Objectives</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                      {a.objectives.map((o: string, i: number) => (<li key={i}>{o}</li>))}
                    </ul>
                  </div>
                )}

                {a.standards && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Standards</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(a.standards).flatMap(([fam, list]: any) => list.map((code: string, i: number) => (
                        <span key={`${fam}-${code}-${i}`} className="px-2 py-0.5 rounded-full border text-xs bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700">{fam}: {code}</span>
                      )))}
                    </div>
                  </div>
                )}

                {a.materials && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Materials</div>
                    <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                      {a.materials.map((m: string, i: number) => (<li key={i}>{m}</li>))}
                    </ul>
                  </div>
                )}

                {a.procedure && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Procedure</div>
                    <ol className="list-decimal ml-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {a.procedure.map((p: any, i: number) => (
                        <li key={i}><span className="font-medium">{p.step}</span> ({p.time}) — {p.detail}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {(a.formativeChecks || a.successCriteria) && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                    {a.formativeChecks && (
                      <div>
                        <div className="font-medium">Formative Checks</div>
                        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                          {a.formativeChecks.map((f: string, i: number) => (<li key={i}>{f}</li>))}
                        </ul>
                      </div>
                    )}
                    {a.successCriteria && (
                      <div>
                        <div className="font-medium">Success Criteria</div>
                        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                          {a.successCriteria.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {a.rubric && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Assignment Rubric</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-600 dark:text-gray-400">
                            <th className="py-2 pr-4">Criterion</th>
                            <th className="py-2 pr-4">Descriptor</th>
                            <th className="py-2 pr-4">Levels</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.rubric.map((r: any, i: number) => (
                            <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="py-2 pr-4 font-medium">{r.criterion}</td>
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{r.descriptor}</td>
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{Array.isArray(r.levels) ? r.levels.join(' • ') : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(a.accommodations || a.udl) && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                    {a.accommodations && (
                      <div>
                        <div className="font-medium">Accommodations</div>
                        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                          {a.accommodations.map((ac: string, i: number) => (<li key={i}>{ac}</li>))}
                        </ul>
                      </div>
                    )}
                    {a.udl && (
                      <div>
                        <div className="font-medium">UDL</div>
                        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                          {a.udl.map((u: string, i: number) => (<li key={i}>{u}</li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {a.deliverable && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Assignment Deliverable</div>
                    <p className="text-gray-700 dark:text-gray-300">{a.deliverable}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
