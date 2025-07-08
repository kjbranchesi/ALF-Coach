// src/components/LandingPage.jsx

import React from 'react';

// --- Icon Components for features ---
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);
const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12"cy="12" r="2"/>
    </svg>
);


export default function LandingPage({ onGetStarted }) {
  return (
    <div className="bg-slate-900 text-white min-h-screen animate-fade-in">
      {/* Header */}
      <header className="py-4 px-8">
        <h1 className="text-2xl font-bold">ProjectCraft</h1>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Stop Designing Alone.
          <br />
          <span className="text-purple-400">Start Co-Creating.</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
          ProjectCraft is your AI-powered partner for building powerful, project-based learning experiences. Go from a spark of an idea to a classroom-ready curriculum with a guide by your side.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          Get Started For Free
        </button>
      </main>

      {/* Features Section */}
      <section className="bg-slate-800 py-20">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/30 p-4 rounded-full mb-4">
                <LightbulbIcon />
              </div>
              <h3 className="text-xl font-bold mb-2">Guided Ideation</h3>
              <p className="text-slate-400">
                Transform a fleeting thought into a fully-framed project. Our AI coach helps you discover compelling challenges and real-world connections.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/30 p-4 rounded-full mb-4">
                <BookOpenIcon />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaborative Curriculum</h3>
              <p className="text-slate-400">
                Co-write learning plans with an AI that understands pedagogy. Outline modules, design activities, and build a rich curriculum, step-by-step.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/30 p-4 rounded-full mb-4">
                <TargetIcon />
              </div>
              <h3 className="text-xl font-bold mb-2">Authentic Assessments</h3>
              <p className="text-slate-400">
                Move beyond traditional tests. Design meaningful assignments, tasks, and rubrics that connect your students' work to a real-world audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500">
        <p>&copy; {new Date().getFullYear()} ProjectCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
