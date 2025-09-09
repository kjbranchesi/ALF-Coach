import React from 'react';

export default function HowItWorksDebug() {
  console.log('HowItWorksDebug component rendering');
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">How It Works (Debug Version)</h1>
        
        <div className="space-y-6">
          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Tell ALF Your Goal</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Share your teaching objectives and ALF will help you create a complete project-based learning experience.
            </p>
          </section>
          
          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Customize Your Blueprint</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Work with ALF to refine the project, add resources, and align with standards.
            </p>
          </section>
          
          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 3: Launch With Students</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Get your complete project blueprint ready to use in your classroom.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}