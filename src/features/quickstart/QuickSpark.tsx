import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuickSparkResult, QuickSparkInput } from './QuickSparkPrompt';
import { generateQuickSpark } from './QuickSparkPrompt';
import { convertToProject } from './QuickSparkActions';
import type { UnifiedProject } from '../../types/project';

interface FormState {
  subject: string;
  gradeBand: string;
  topic: string;
}

const INITIAL_FORM: FormState = {
  subject: '',
  gradeBand: '6-8',
  topic: '',
};

const gradeOptions = ['K-2', '3-5', '6-8', '9-12'];

const QuickSpark: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<QuickSparkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      const input: QuickSparkInput = {
        subject: form.subject.trim(),
        gradeBand: form.gradeBand,
        topic: form.topic.trim() || undefined,
      };
      const generated = await generateQuickSpark(input);
      setResult(generated);
    } catch (err) {
      console.error('[QuickSpark] Failed to generate quick spark', err);
      setError('Unable to generate Quick Spark right now. Please try again.');
      setResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvert = async () => {
    if (!result) {return;}
    setIsConverting(true);
    setError(null);
    try {
      const project: UnifiedProject = await convertToProject({
        input: {
          subject: form.subject.trim(),
          gradeBand: form.gradeBand,
          topic: form.topic.trim() || undefined,
        },
        result,
      });
      navigate(`/app/showcase/${project.meta.id}`);
    } catch (err) {
      console.error('[QuickSpark] Failed to convert project', err);
      setError('Could not save the project. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-12 text-center space-y-3">
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Quick Spark</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Generate hooks and a mini activity to launch a new Showcase project in minutes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleGenerate}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200/70 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="subject">
                Subject focus
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g., Climate Science"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="gradeBand">
                Grade band
              </label>
              <select
                id="gradeBand"
                name="gradeBand"
                value={form.gradeBand}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {gradeOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="topic">
                Optional context or topic
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g., Heat islands around campus"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium shadow hover:bg-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating…' : 'Generate Quick Spark'}
            </button>

            {error && (
              <p className="text-sm text-rose-600">{error}</p>
            )}
          </form>

          <aside className="bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preview</h2>

            {result ? (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Hooks</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {result.hooks.map((hook, index) => (
                      <li key={index}>{hook}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Mini activity</h3>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div>
                      <p className="font-semibold">Do</p>
                      <ul className="list-disc pl-6 space-y-1">
                        {result.miniActivity.do.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Share</p>
                      <ul className="list-disc pl-6 space-y-1">
                        {result.miniActivity.share.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Reflect</p>
                      <ul className="list-disc pl-6 space-y-1">
                        {result.miniActivity.reflect.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Materials</p>
                      <ul className="list-disc pl-6 space-y-1">
                        {result.miniActivity.materials.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-slate-500">
                      Time window: {result.miniActivity.timeWindow} · Differentiation: {result.miniActivity.differentiationHint}
                    </p>
                    {result.miniActivity.aiTip && (
                      <p className="text-xs text-slate-500">AI tip: {result.miniActivity.aiTip}</p>
                    )}
                  </div>
                </section>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? 'Saving…' : 'Convert to project'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Generate a Quick Spark to view hooks and a ready-to-run mini activity.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default QuickSpark;
