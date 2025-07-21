import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FrameworkCelebration = ({ 
  projectInfo, 
  ideationData, 
  journeyData, 
  deliverablesData,
  onStartNew,
  onDownload,
  onShare 
}) => {
  const [currentView, setCurrentView] = useState('celebration');

  const getStudentPerspective = (subject) => {
    const perspectives = {
      'Urban Planning': {
        quote: "I'm investigating how airports impact communities, just like real urban planners do!",
        experience: "Students research community needs, analyze development patterns, and present solutions to local officials.",
        impact: "Your students will understand urban development through authentic professional work."
      },
      'History': {
        quote: "I'm analyzing historical sources and presenting findings, just like real historians do!",
        experience: "Students research primary sources, analyze historical context, and present to academic audiences.",
        impact: "Your students will think like historians, not just memorize historical facts."
      },
      'Science': {
        quote: "I'm conducting real research and presenting discoveries, just like real scientists do!",
        experience: "Students formulate hypotheses, collect data, and present findings to scientific community.",
        impact: "Your students will experience the process of scientific discovery firsthand."
      },
      'default': {
        quote: "I'm doing real professional work that matters to the community!",
        experience: "Students engage in authentic problem-solving and present solutions to real stakeholders.",
        impact: "Your students will develop professional skills through meaningful work."
      }
    };
    
    return perspectives[subject] || perspectives.default;
  };

  const perspective = getStudentPerspective(projectInfo?.subject);

  const CelebrationView = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Your Active Learning Framework is Complete!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You've designed authentic learning that mirrors real professional work. 
            Your {projectInfo?.ageGroup?.toLowerCase() || 'students'} will experience what it's like to be 
            actual {projectInfo?.subject?.toLowerCase().includes('planning') ? 'urban planners' : 
                   projectInfo?.subject?.toLowerCase().includes('history') ? 'historians' :
                   projectInfo?.subject?.toLowerCase().includes('science') ? 'scientists' : 'professionals'}.
          </p>
        </motion.div>

        {/* Student Voice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-8 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <blockquote className="text-lg font-medium text-gray-800 italic text-center mb-2">
            "{perspective.quote}"
          </blockquote>
          <p className="text-sm text-gray-600 text-center">
            — Your student's experience
          </p>
        </motion.div>
      </div>

      {/* Framework Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          What You've Created
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Authentic Work */}
          <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="font-semibold text-purple-800 mb-2">Authentic Work</h3>
            <p className="text-sm text-gray-600">
              ✓ Mirrors real professional practices<br/>
              ✓ Connects to community impact<br/>
              ✓ Meaningful student engagement
            </p>
          </div>

          {/* Deep Learning */}
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="font-semibold text-blue-800 mb-2">Deep Learning</h3>
            <p className="text-sm text-gray-600">
              ✓ Process-based understanding<br/>
              ✓ Critical thinking development<br/>
              ✓ Professional skill building
            </p>
          </div>

          {/* Real Impact */}
          <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="font-semibold text-emerald-800 mb-2">Real Impact</h3>
            <p className="text-sm text-gray-600">
              ✓ Community-connected outcomes<br/>
              ✓ Professional-quality deliverables<br/>
              ✓ Lasting student pride
            </p>
          </div>
        </div>

        {/* Framework Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Complete Framework:</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🎯 Foundation</h4>
              <ul className="space-y-1 text-gray-600">
                <li><strong>Big Idea:</strong> {ideationData?.bigIdea}</li>
                <li><strong>Question:</strong> {ideationData?.essentialQuestion}</li>
                <li><strong>Challenge:</strong> {ideationData?.challenge}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🗺️ Journey</h4>
              <ul className="space-y-1 text-gray-600">
                <li><strong>Phases:</strong> {journeyData?.phases?.length || 0} defined</li>
                {journeyData?.phases?.slice(0, 2).map((phase, index) => (
                  <li key={index} className="text-xs">• {phase.title || phase}</li>
                ))}
                <li><strong>Resources:</strong> {journeyData?.resources?.length || 0} identified</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">📋 Deliverables</h4>
              <ul className="space-y-1 text-gray-600">
                <li><strong>Milestones:</strong> {deliverablesData?.milestones?.length || 0} defined</li>
                {deliverablesData?.milestones?.slice(0, 2).map((milestone, index) => (
                  <li key={index} className="text-xs">• {milestone.title || milestone}</li>
                ))}
                <li><strong>Assessment:</strong> Authentic methods defined</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={() => setCurrentView('implementation')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          🚀 Ready to Implement?
        </button>
        <button
          onClick={onDownload}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          📄 Download Framework
        </button>
        <button
          onClick={onShare}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          📤 Share Framework
        </button>
        <button
          onClick={onStartNew}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ➕ Start New Project
        </button>
      </motion.div>
    </div>
  );

  const ImplementationView = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Implementation Support
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Your framework is ready! Here's everything you need to bring this authentic learning experience to life.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              📋
            </span>
            Next Steps
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">1</span>
              <div>
                <p className="font-medium">Review Framework with Colleagues</p>
                <p className="text-sm text-gray-600">Share your framework for feedback and refinement</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">2</span>
              <div>
                <p className="font-medium">Plan Your Timeline</p>
                <p className="text-sm text-gray-600">Map phases to your academic calendar</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">3</span>
              <div>
                <p className="font-medium">Prepare Resources</p>
                <p className="text-sm text-gray-600">Gather materials and community connections</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium flex items-center justify-center mr-3 mt-0.5">4</span>
              <div>
                <p className="font-medium">Launch with Students</p>
                <p className="text-sm text-gray-600">Introduce the authentic work opportunity</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Support Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              🛠️
            </span>
            Support Resources
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Lesson Plan Templates</h4>
              <p className="text-sm text-gray-600">Ready-to-use templates for each phase</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Assessment Rubrics</h4>
              <p className="text-sm text-gray-600">Authentic assessment tools and guidelines</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <h4 className="font-medium text-emerald-800">Community Connection Guide</h4>
              <p className="text-sm text-gray-600">Tips for engaging real professionals</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-800">Student Reflection Tools</h4>
              <p className="text-sm text-gray-600">Help students process their learning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            🌟 You're About to Transform Learning
          </h4>
          <p className="text-gray-600">
            Your students will experience authentic {projectInfo?.subject?.toLowerCase() || 'professional'} work, 
            develop real skills, and create meaningful impact in their community. 
            This is education at its most powerful.
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentView('celebration')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to Framework
        </button>
        <button
          onClick={onDownload}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          📄 Download Complete Package
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentView === 'celebration' ? <CelebrationView /> : <ImplementationView />}
        </motion.div>
      </div>
    </div>
  );
};

export default FrameworkCelebration;