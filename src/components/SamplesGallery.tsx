import React, { useMemo } from 'react';
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

  const cards: Card[] = useMemo(() => {
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700 hover-lift-soft"
            >
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

              <div className="flex items-center justify-between">
                <button
                  onClick={() => launchSample(c.sampleId)}
                  className="btn-pill-primary px-4 py-2 text-sm inline-flex items-center gap-2"
                >
                  Launch Sample <ArrowRight className="w-4 h-4" />
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
    </div>
  );
}

