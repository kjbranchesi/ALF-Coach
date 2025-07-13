// src/components/LandingPage.jsx

import React from 'react';
import { Button } from './ui/Button';
import { Feather, Lightbulb, BookOpenCheck, Target } from 'lucide-react';

// A modern, visually appealing landing page to introduce users to ProjectCraft.
// It uses the new color palette and a clean, spacious layout.

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-neutral-800">{title}</h3>
        <p className="text-neutral-600">{description}</p>
    </div>
);

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="bg-white text-neutral-800 animate-fade-in">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Feather className="h-7 w-7 text-primary-600" />
            <h1 className="text-xl font-bold">ProjectCraft</h1>
        </div>
        <Button variant="ghost" onClick={onGetStarted}>Sign In</Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 max-w-3xl">
          Stop Designing Alone.
          <br />
          <span className="text-primary-600">Start Co-Creating.</span>
        </h2>
        <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mb-8">
          ProjectCraft is your AI-powered partner for building powerful, project-based learning experiences. Go from a spark of an idea to a classroom-ready curriculum with a guide by your side.
        </p>
        <Button onClick={onGetStarted} size="lg" className="shadow-lg">
          Get Started For Free
        </Button>
      </main>

      {/* Features Section */}
      <section className="bg-neutral-50 py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
                icon={<Lightbulb className="w-8 h-8"/>}
                title="Guided Ideation"
                description="Transform a fleeting thought into a fully-framed project. Our AI coach helps you discover compelling challenges and real-world connections."
            />
             <FeatureCard 
                icon={<BookOpenCheck className="w-8 h-8"/>}
                title="Collaborative Curriculum"
                description="Co-write learning plans with an AI that understands pedagogy. Outline modules, design activities, and build a rich curriculum, step-by-step."
            />
             <FeatureCard 
                icon={<Target className="w-8 h-8"/>}
                title="Authentic Assessments"
                description="Move beyond traditional tests. Design meaningful assignments, tasks, and rubrics that connect your students' work to a real-world audience."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-neutral-500">
        <p>&copy; {new Date().getFullYear()} ProjectCraft. An AI-powered design partner for educators.</p>
      </footer>
    </div>
  );
}
