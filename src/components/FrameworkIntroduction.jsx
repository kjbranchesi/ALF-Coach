import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FrameworkIntroduction = ({ onContinue, projectInfo }) => {
  const [currentView, setCurrentView] = useState('welcome');

  const getProfessionalExample = (subject) => {
    const examples = {
      'Urban Planning': {
        professional: 'urban planners',
        process: ['Research community needs & demographics', 'Analyze zoning laws & infrastructure', 'Design solutions & present to stakeholders'],
        outcome: 'Community development proposals'
      },
      'History': {
        professional: 'historians',
        process: ['Research primary & secondary sources', 'Analyze historical evidence & context', 'Present findings to academic community'],
        outcome: 'Historical analysis reports'
      },
      'Science': {
        professional: 'scientists',
        process: ['Formulate hypotheses & design experiments', 'Collect & analyze data', 'Present findings to scientific community'],
        outcome: 'Research publications'
      },
      'default': {
        professional: 'professionals',
        process: ['Research & investigate problems', 'Analyze information & develop solutions', 'Present recommendations to stakeholders'],
        outcome: 'Professional deliverables'
      }
    };
    
    return examples[subject] || examples.default;
  };

  const example = getProfessionalExample(projectInfo?.subject);

  const WelcomeView = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to the Active Learning Framework
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          You're about to design authentic learning that mirrors real professional work. 
          Your students won't just learn <em>about</em> {projectInfo?.subject?.toLowerCase() || 'your subject'} — 
          they'll <strong>do</strong> the work that {example.professional} actually do.
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">
          How We'll Build Your Framework
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">IDEATION</h3>
            <p className="text-sm text-gray-600 mb-3">Define the foundation</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Big Idea (theme that anchors everything)</li>
              <li>• Essential Question (drives inquiry)</li>
              <li>• Challenge (meaningful student work)</li>
            </ul>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">JOURNEY</h3>
            <p className="text-sm text-gray-600 mb-3">Map the learning process</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Learning Phases (major stages)</li>
              <li>• Student Activities (what they do)</li>
              <li>• Resources & Support (tools needed)</li>
            </ul>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-6 shadow-sm border-2 border-emerald-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">DELIVERABLES</h3>
            <p className="text-sm text-gray-600 mb-3">Design authentic outcomes</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Key Milestones (student products)</li>
              <li>• Assessment Methods (authentic evaluation)</li>
              <li>• Real-world impact</li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setCurrentView('professional')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            See How This Mirrors Professional Work →
          </button>
        </div>
      </div>
    </div>
  );

  const ProfessionalView = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Students Will Work Like Real {example.professional}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          The Active Learning Framework mirrors authentic professional practices. 
          Here's how real {example.professional} work, and how your students will too:
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Professional Work */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                👩‍💼
              </span>
              How {example.professional} work:
            </h3>
            <ol className="space-y-3">
              {example.process.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Result:</strong> {example.outcome}
              </p>
            </div>
          </div>

          {/* Student Mirror */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-emerald-200">
            <h3 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                🎓
              </span>
              How your students will work:
            </h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">
                  1
                </span>
                <span className="text-gray-700">Research & Investigation Phase</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">
                  2
                </span>
                <span className="text-gray-700">Analysis & Development Phase</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">
                  3
                </span>
                <span className="text-gray-700">Creation & Presentation Phase</span>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>Result:</strong> Authentic {projectInfo?.subject?.toLowerCase() || 'subject'} work with real impact
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm inline-block">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">✨ The Magic of Authentic Learning</h4>
            <p className="text-gray-600 max-w-2xl">
              Students don't just memorize facts about {projectInfo?.subject?.toLowerCase() || 'your subject'}. 
              They experience what it's like to BE a {example.professional.slice(0, -1)} — 
              solving real problems, making discoveries, and creating meaningful work.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentView('welcome')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Ready to Build Your Framework →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentView === 'welcome' ? <WelcomeView /> : <ProfessionalView />}
        </motion.div>
      </div>
    </div>
  );
};

export default FrameworkIntroduction;