import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllSampleBlueprints } from '../utils/sampleBlueprints';
import { auth } from '../firebase/firebase';

export default function SamplePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const { wizardData, ideation, journey, deliverables } = sample as any;

  const [copied, setCopied] = React.useState(false);

  const copySample = () => {
    try {
      const newId = `bp_copy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload: any = {
        id: newId,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wizardData: wizardData || {},
        ideation: ideation || {},
        journey: journey || {},
        deliverables: deliverables || {},
        sample: true,
        chatHistory: [],
      };
      localStorage.setItem(`blueprint_${newId}`, JSON.stringify(payload));
      if ((window as any).refreshDashboard) (window as any).refreshDashboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const launchSample = () => {
    try {
      const newId = `bp_sample_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload: any = {
        id: newId,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wizardData: wizardData || {},
        ideation: ideation || {},
        journey: journey || {},
        deliverables: deliverables || {},
        sample: true,
        chatHistory: [],
      };
      localStorage.setItem(`blueprint_${newId}`, JSON.stringify(payload));
      navigate(`/app/blueprint/${newId}`);
    } catch (e) {
      console.error('Launch failed', e);
    }
  };

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
          <button onClick={copySample} className="btn-pill-primary px-4 py-2" aria-live="polite">
            {copied ? 'Copied!' : 'Copy to My Projects'}
          </button>
          <button onClick={launchSample} className="px-4 py-2 rounded-full border">Launch</button>
        </div>
      </div>

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
        <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          {journey && Object.entries(journey).map(([k, v]: any) => (
            <li key={k}><strong className="capitalize">{k}:</strong> {v?.goal} — {v?.activity}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 glass-squircle border p-5" role="region" aria-labelledby="milestones-h">
        <h2 id="milestones-h" className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Milestones</h2>
        <p className="text-gray-700 dark:text-gray-300">{(deliverables?.milestones || []).join(', ') || 'TBD'}</p>
      </div>
    </div>
  );
}
