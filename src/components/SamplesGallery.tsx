import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Map, Target, ArrowRight } from 'lucide-react';
import { getAllSampleBlueprints } from '../utils/sampleBlueprints';
import { auth } from '../firebase/firebase';

type Card = {
  id: string;
  title: string;
  subtitle?: string;
  gradeLevel?: string;
  duration?: string;
  subject?: string;
  sampleId: string;
};

export default function SamplesGallery() {
  const navigate = useNavigate();
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawCards: Card[] = useMemo(() => {
    const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
    const samples = getAllSampleBlueprints(uid);
    return samples.map((s) => ({
      id: s.id,
      title: s.wizardData?.projectTopic || 'Sample Project',
      subtitle: s.ideation?.essentialQuestion || s.ideation?.bigIdea,
      gradeLevel: s.wizardData?.gradeLevel,
      duration: s.wizardData?.duration,
      subject: Array.isArray(s.wizardData?.subjects) ? s.wizardData.subjects.join(', ') : s.wizardData?.subject,
      sampleId: s.id,
    }));
  }, []);

  const cards = useMemo(() => {
    return rawCards.filter(c => {
      const gradeOk = gradeFilter === 'all' || c.gradeLevel === gradeFilter;
      const subjectOk = subjectFilter === 'all' || (c.subject || '').toLowerCase().includes(subjectFilter);
      return gradeOk && subjectOk;
    });
  }, [rawCards, gradeFilter, subjectFilter]);

  const gradeAccent = (grade?: string) => {
    switch (grade) {
      case 'early-elementary': return 'from-amber-200 to-amber-100 border-amber-300';
      case 'elementary': return 'from-green-200 to-green-100 border-green-300';
      case 'middle': return 'from-blue-200 to-blue-100 border-blue-300';
      case 'upper-secondary': return 'from-purple-200 to-purple-100 border-purple-300';
      case 'higher-ed': return 'from-indigo-200 to-indigo-100 border-indigo-300';
      case 'adult': return 'from-rose-200 to-rose-100 border-rose-300';
      default: return 'from-gray-100 to-white border-gray-200';
    }
  };

  const launchSample = (sampleId: string) => {
    try {
      const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
      const sample = getAllSampleBlueprints(uid).find((s) => s.id === sampleId);
      if (!sample) return;

      const newId = `bp_sample_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const payload: any = {
        id: newId,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wizardData: sample.wizardData || {},
        ideation: sample.ideation || {},
        journey: sample.journey || {},
        deliverables: sample.deliverables || {},
        sample: true,
        chatHistory: [],
      };

      localStorage.setItem(`blueprint_${newId}`, JSON.stringify(payload));
      navigate(`/app/blueprint/${newId}`);
    } catch (e) {
      console.error('Failed to launch sample', e);
    }
  };

  const copySample = (sampleId: string) => {
    try {
      const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
      const sample = getAllSampleBlueprints(uid).find((s) => s.id === sampleId);
      if (!sample) return;
      const newId = `bp_copy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload: any = {
        id: newId,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wizardData: sample.wizardData || {},
        ideation: sample.ideation || {},
        journey: sample.journey || {},
        deliverables: sample.deliverables || {},
        sample: true,
        chatHistory: [],
      };
      localStorage.setItem(`blueprint_${newId}`, JSON.stringify(payload));
      setCopiedId(sampleId);
      // Ask dashboard (if open) to refresh its list
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
      setTimeout(() => setCopiedId(null), 1600);
    } catch (e) {
      console.error('Failed to copy sample', e);
    }
  };

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sample Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">Explore ready-to-launch examples across levels and subjects.</p>
          </div>
          <a href="/app/dashboard" className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm">Back to Dashboard</a>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {['all','early-elementary','elementary','middle','upper-secondary','higher-ed','adult'].map(g => (
            <button key={g} onClick={() => setGradeFilter(g)} className={`px-3 py-1.5 rounded-full border text-sm ${gradeFilter===g ? 'btn-pill-primary text-white' : 'border-gray-300 dark:border-gray-700'}`}>
              {g}
            </button>
          ))}
          <select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)} className="ml-auto px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-900">
            <option value="all">All subjects</option>
            <option value="science">Science</option>
            <option value="mathematics">Mathematics</option>
            <option value="language-arts">Language Arts</option>
            <option value="social-studies">Social Studies</option>
            <option value="technology">Technology</option>
            <option value="engineering">Engineering</option>
            <option value="health">Health</option>
            <option value="arts">Arts</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className={`relative glass-squircle card-pad-lg anim-ease border hover-lift-soft bg-gradient-to-br ${gradeAccent(c.gradeLevel)} dark:bg-gray-900/50`}
            >
              <div className="absolute inset-0 rounded-[22px] pointer-events-none" />
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{c.title}</h3>
              </div>
              {c.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{c.subtitle}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4">
                {c.subject && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Map className="w-3 h-3" /> {c.subject}
                  </span>
                )}
                {c.gradeLevel && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Target className="w-3 h-3" /> {c.gradeLevel}
                  </span>
                )}
                {c.duration && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    ⏱ {c.duration}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => launchSample(c.sampleId)}
                  className="btn-pill-primary px-4 py-2 text-sm inline-flex items-center gap-2"
                >
                  Launch Sample <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copySample(c.sampleId)}
                  className="px-3 py-2 rounded-full border text-sm border-gray-300 dark:border-gray-700"
                  title="Copy to My Projects"
                >
                  {copiedId === c.sampleId ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setPreviewId(c.sampleId)}
                  className="px-3 py-2 rounded-full border text-sm border-gray-300 dark:border-gray-700"
                  title="Preview"
                >
                  Preview
                </button>
                <a
                  className="text-sm text-blue-700 dark:text-blue-300 hover:underline"
                  href="/how-it-works"
                >How it works</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Drawer */}
      {previewId && (() => {
        const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
        const sample = getAllSampleBlueprints(uid).find(s => s.id === previewId);
        if (!sample) return null;
        const { wizardData, ideation, journey, deliverables } = sample;
        return (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewId(null)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-xl glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Preview: {wizardData?.projectTopic}</h3>
                <button onClick={() => setPreviewId(null)} className="px-3 py-1.5 rounded-full border">Close</button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium">Context</h4>
                  <p className="text-gray-600 dark:text-gray-400">{Array.isArray(wizardData?.subjects) ? wizardData.subjects.join(', ') : wizardData?.subject} • {wizardData?.gradeLevel} • {wizardData?.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium">Big Idea</h4>
                  <p className="text-gray-700 dark:text-gray-300">{ideation?.bigIdea}</p>
                </div>
                <div>
                  <h4 className="font-medium">Essential Question</h4>
                  <p className="text-gray-700 dark:text-gray-300">{ideation?.essentialQuestion}</p>
                </div>
                <div>
                  <h4 className="font-medium">Challenge</h4>
                  <p className="text-gray-700 dark:text-gray-300">{ideation?.challenge}</p>
                </div>
                <div>
                  <h4 className="font-medium">Journey</h4>
                  <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {journey && Object.entries(journey).map(([k,v]: any) => (
                      <li key={k}><strong className="capitalize">{k}:</strong> {(v as any)?.goal} — {(v as any)?.activity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Deliverables</h4>
                  <p className="text-gray-700 dark:text-gray-300">Milestones: {(deliverables?.milestones || []).join(', ')}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => copySample(sample.id)} className="btn-pill-primary px-4 py-2">Copy to My Projects</button>
                  <button onClick={() => launchSample(sample.id)} className="px-4 py-2 rounded-full border">Launch</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
