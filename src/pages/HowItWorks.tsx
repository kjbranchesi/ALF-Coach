import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Map, Target, CheckCircle2, BookOpen, HelpCircle } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="max-w-5xl mx-auto mb-12">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h2>
    <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{children}</div>
  </section>
);

const StepCard: React.FC<{ icon: React.ReactNode; title: string; text: string; accent: string }>
  = ({ icon, title, text, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4 }}
    className="glass-squircle border border-gray-200 dark:border-gray-700 p-5 shadow-soft"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center text-white`}>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-700 dark:text-gray-300 text-sm">{text}</p>
  </motion.div>
);

export default function HowItWorks() {
  const ImageWithFallback = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => {
    const [show, setShow] = React.useState(true);
    if (!show) return null;
    return <img src={src} alt={alt} className={className} onError={() => setShow(false)} />;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Design impactful projects with the Active Learning Framework
          </h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-3xl">
            ALF Coach helps you build a project students care about—one step at a time. You bring your subject and students; we guide the process and save as you go.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="/signin"
              className="btn-pill-primary px-5 py-2 text-sm"
            >Start a New Project</a>
            <a
              href="/"
              className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >Back to Home</a>
          </div>
        </motion.div>
      </div>

      {/* Animated Pipeline */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Optional diagram if present */}
        <div className="mb-6">
          <ImageWithFallback src="/images/alf-diagram.svg" alt="ALF Diagram" className="w-full max-h-64 object-contain" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <StepCard
            icon={<Lightbulb className="w-5 h-5" />}
            title="Ideation"
            text="Define the Big Idea (what students should deeply understand), an Essential Question to drive inquiry, and a real Challenge to give purpose. • Validate clarity and relevance."
            accent="bg-amber-500"
          />
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '100%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden md:block h-1 rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-green-500 self-center"
            style={{ gridColumn: '1 / span 2' }}
          />
          <StepCard
            icon={<Map className="w-5 h-5" />}
            title="Learning Journey"
            text="Plan four phases students will experience: Analyze, Brainstorm, Prototype, Evaluate. We prompt for goal, activity, output, and duration; refine with feedback."
            accent="bg-blue-600"
          />
          <StepCard
            icon={<Target className="w-5 h-5" />}
            title="Deliverables"
            text="Set 3 milestones, a simple rubric, and an impact plan (authentic audience and sharing). This makes expectations clear for students and families."
            accent="bg-green-600"
          />
        </div>
        {/* Simple inline timeline */}
        <div className="mt-4 mb-2">
          <div className="h-1 rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-green-500" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Ideation</span>
            <span>Journey</span>
            <span>Deliverables</span>
          </div>
        </div>
      </div>

      {/* Deep dive: stages within stages */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <Section title="What happens inside each stage?">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-squircle border border-amber-200 dark:border-amber-800 p-5">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Lightbulb className="w-4 h-4" /> Ideation
              </h4>
              <ul className="list-disc ml-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Draft Big Idea → refine</li>
                <li>Write Essential Question</li>
                <li>Choose authentic Challenge</li>
              </ul>
            </div>
            <div className="glass-squircle border border-blue-200 dark:border-blue-800 p-5">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Map className="w-4 h-4" /> Journey
              </h4>
              <ul className="list-disc ml-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Analyze: goal, activity, output, time</li>
                <li>Brainstorm: ideate + select</li>
                <li>Prototype: draft + feedback</li>
                <li>Evaluate: refine + share</li>
              </ul>
            </div>
            <div className="glass-squircle border border-green-200 dark:border-green-800 p-5">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <Target className="w-4 h-4" /> Deliverables
              </h4>
              <ul className="list-disc ml-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>3 milestones students hit</li>
                <li>Rubric: 3–4 criteria</li>
                <li>Impact: audience + method</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      {/* For New Educators */}
      <Section title="If you’re new to project-based learning">
        <ul className="list-disc ml-5 space-y-2">
          <li><span className="font-medium">We ask one question at a time.</span> You can always refine later.</li>
          <li><span className="font-medium">We save as you go.</span> The compact recap pill shows what’s saved and what’s next.</li>
          <li><span className="font-medium">You can edit any stage from the sidebar.</span> Click “Edit” to jump back and tweak.</li>
          <li><span className="font-medium">Preview anytime.</span> See your blueprint take shape before exporting.</li>
        </ul>
      </Section>

      {/* Definitions */}
      <Section title="Quick definitions (no jargon)">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="glass-squircle p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold">Big Idea</h4>
            </div>
            <p className="text-sm">A powerful, transferable concept students should deeply understand by the end.</p>
          </div>
          <div className="glass-squircle p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold">Essential Question</h4>
            </div>
            <p className="text-sm">A compelling, open question that drives inquiry and keeps learning meaningful.</p>
          </div>
          <div className="glass-squircle p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold">Challenge</h4>
            </div>
            <p className="text-sm">An authentic task or problem that gives students a purpose and audience.</p>
          </div>
        </div>
      </Section>

      {/* What you’ll get */}
      <Section title="What you’ll get (Blueprint)">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="glass-squircle p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold">Clear plan</h4>
            </div>
            <p className="text-sm">A structured project plan with your context, Big Idea/EQ/Challenge, journey phases, and deliverables.</p>
          </div>
          <div className="glass-squircle p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold">Ready to share</h4>
            </div>
            <p className="text-sm">Preview in the app or download as a PDF; share with colleagues or families.</p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="glass-squircle p-5 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ready to start?</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">It takes about 10–15 minutes to create your first project.</p>
          </div>
          <a href="/signin" className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">Start a New Project</a>
        </div>
      </div>
    </div>
  );
}
