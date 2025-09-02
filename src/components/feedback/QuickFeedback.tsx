import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  open: boolean;
  onClose: () => void;
  blueprintId?: string;
  userId?: string;
}

export const QuickFeedback: React.FC<Props> = ({ open, onClose, blueprintId, userId }) => {
  const [confusing, setConfusing] = useState<'yes' | 'no' | ''>('');
  const [step, setStep] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = ['Wizard', 'Big Idea', 'Essential Question', 'Challenge', 'Journey', 'Deliverables', 'Preview/Export'];

  const handleSubmit = async () => {
    const basePayload = {
      confusing,
      step,
      comments,
      blueprintId: blueprintId || null,
      userId: userId || 'anonymous',
    };
    try {
      setSubmitting(true);
      const payload = { ...basePayload, createdAt: serverTimestamp() } as any;
      await addDoc(collection(db, 'feedback'), payload);
      setSubmitted(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      console.error('Feedback submit failed', e);
      // fallback to localStorage
      try {
        const key = `feedback_local_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify({ ...basePayload, createdAt: new Date().toISOString() }));
        setSubmitted(true);
        setTimeout(onClose, 1200);
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-[min(92vw,560px)] glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">Quick Feedback</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Was anything confusing? This helps us improve for teachers.</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Was anything confusing?</label>
                <div className="mt-1 flex gap-2">
                  <button className={`px-3 py-1.5 rounded-full border ${confusing==='yes'?'glass-border-selected':''}`} onClick={() => setConfusing('yes')}>Yes</button>
                  <button className={`px-3 py-1.5 rounded-full border ${confusing==='no'?'glass-border-selected':''}`} onClick={() => setConfusing('no')}>No</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Which step?</label>
                <select value={step} onChange={(e) => setStep(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  <option value="">Select a step...</option>
                  {steps.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Comments (optional)</label>
                <textarea value={comments} onChange={(e)=>setComments(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Tell us more..." />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-2 rounded-full border">Cancel</button>
              <button onClick={handleSubmit} disabled={!confusing || submitting} className="btn-pill-primary px-4 py-2 disabled:opacity-50">
                {submitting ? 'Submitting...' : submitted ? 'Thanks!' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickFeedback;
