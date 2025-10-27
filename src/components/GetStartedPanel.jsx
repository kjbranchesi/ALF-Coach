/**
 * GetStartedPanel
 * Simple, benefit-oriented starter panel for first-time users.
 */
import React from 'react';
import { Lightbulb, Map, Package, Play } from 'lucide-react';

export default function GetStartedPanel({ onStart, onHowItWorks }) {
  const items = [
    {
      icon: Lightbulb,
      title: 'Ideation (5–10 min)',
      desc: 'Big Idea, Essential Question, and Challenge.'
    },
    {
      icon: Map,
      title: 'Journey (20–45 min)',
      desc: 'Add 3+ phases; reorder and refine later.'
    },
    {
      icon: Package,
      title: 'Deliverables (15–30 min)',
      desc: '3 milestones, 1+ artifact, 3 rubric criteria.'
    }
  ];

  return (
    <section
      className="squircle-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 p-6"
      role="region"
      aria-label="Get started"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" aria-hidden>
              <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Autosaves your progress — work in short planning blocks and resume anytime.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onHowItWorks}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Learn how it works"
          >
            How it works
          </button>
          <button
            onClick={onStart}
            className="squircle-button inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-sm"
            aria-label="Start new project"
          >
            <Play className="w-4 h-4" />
            <span>Start New Project</span>
          </button>
        </div>
      </div>
    </section>
  );
}

