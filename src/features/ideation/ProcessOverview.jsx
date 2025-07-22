// ProcessOverview.jsx - Shows the blueprint building process after initial data collection

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from '../../components/icons/ButtonIcons';

const ProcessOverview = ({ onContinue, projectData }) => {
  const stages = [
    {
      title: "Ideation",
      icon: "Lightbulb",
      description: "Define your Big Idea, Essential Question, and Challenge",
      steps: ["Big Idea (10 words)", "Essential Question", "Student Challenge"]
    },
    {
      title: "Learning Journey", 
      icon: "Map",
      description: "Design the phases and activities for your project",
      steps: ["Project Phases", "Student Activities", "Resources"]
    },
    {
      title: "Deliverables",
      icon: "Package",
      description: "Create milestones, rubrics, and impact plans",
      steps: ["Milestones", "Assessment Rubric", "Impact & Audience"]
    },
    {
      title: "Publish",
      icon: "Send",
      description: "Review and share your complete blueprint",
      steps: ["Final Review", "Export Options", "Share Link"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Blueprint Builder!</h2>
          <p className="text-blue-100 text-lg">
            Let's create a meaningful {projectData.subject} project for your {projectData.ageGroup} students
          </p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-600 mb-8">
            We'll guide you through 4 stages to build your complete project blueprint:
          </p>

          {/* Stages */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {stages.map((stage, index) => {
              const IconComponent = Icons[`${stage.icon}Icon`];
              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{stage.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                      <ul className="space-y-1">
                        {stage.steps.map((step, i) => (
                          <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Features */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Icons.SparklesIcon className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">AI-powered suggestions personalized to your vision</span>
              </div>
              <div className="flex items-center gap-3">
                <Icons.ChatBubbleIcon className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Conversational guidance through each step</span>
              </div>
              <div className="flex items-center gap-3">
                <Icons.CheckCircleIcon className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Progress tracking so you always know where you are</span>
              </div>
            </div>
          </div>

          {/* Time estimate */}
          <div className="text-center text-gray-600">
            <p className="text-sm">Estimated time: 15-20 minutes</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Let's Get Started
              <Icons.ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProcessOverview;