import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const HowItWorksIntro = ({ onContinue }) => {
  const timelineRef = useRef(null);
  const alignmentRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true });
  const alignmentInView = useInView(alignmentRef, { once: true });

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        className="px-4 py-16 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Design Learning That <span className="text-emerald-600">Changes Lives</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Don't just teach content—<strong>inspire professional skills</strong>. ProjectCraft guides your students step-by-step through meaningful research, real-world challenges, and authentic projects that make an impact.
        </p>
        
        <button
          onClick={scrollToTimeline}
          className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
        >
          → Discover the 3-Step Process
        </button>
      </motion.div>

      {/* Three-Step Timeline */}
      <div ref={timelineRef} className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0 }}
            animate={timelineInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            The Active Learning Framework
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Ideation */}
            <motion.div
              className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200"
              initial={{ opacity: 0, y: 30 }}
              animate={timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Step 1: Ideation</h3>
              <p className="text-gray-600 leading-relaxed">
                Define your Big Idea, Essential Question, and an inspiring student Challenge.
              </p>
            </motion.div>

            {/* Step 2: Learning Journey */}
            <motion.div
              className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200"
              initial={{ opacity: 0, y: 30 }}
              animate={timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Step 2: Learning Journey</h3>
              <p className="text-gray-600 leading-relaxed">
                Craft clear phases and activities guiding students from inquiry to insight.
              </p>
            </motion.div>

            {/* Step 3: Authentic Deliverables */}
            <motion.div
              className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200"
              initial={{ opacity: 0, y: 30 }}
              animate={timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-3">Step 3: Authentic Deliverables</h3>
              <p className="text-gray-600 leading-relaxed">
                Create meaningful milestones, practical assessments, and real-world impact.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Professional vs Student Alignment */}
      <div ref={alignmentRef} className="py-16 px-4 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0 }}
            animate={alignmentInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            Students Work Like Professionals, From Day One
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professionals Card */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={alignmentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👩‍💼</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Professionals</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Research critical problems
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Analyze insights & craft solutions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Present compelling recommendations
                </li>
              </ul>
            </motion.div>

            {/* Students Card */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-lg border-2 border-emerald-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={alignmentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-800">Your Students</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Investigate real-world questions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Develop authentic solutions & ideas
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Showcase impactful, meaningful work
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <motion.div 
        className="bg-white border-t border-gray-200 py-6 px-4 sticky bottom-0 shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg text-gray-700 font-medium">
            Ready to unlock authentic learning?
          </p>
          <button
            onClick={onContinue}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Designing Your Framework →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorksIntro;