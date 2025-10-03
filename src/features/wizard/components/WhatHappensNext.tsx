/**
 * WhatHappensNext.tsx - Personalized next steps component
 * Shows users what to expect after completing the wizard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Brain, 
  FileText, 
  Palette, 
  Globe,
  Sparkles,
  Trophy,
  Target,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { type WizardData } from '../wizardSchema';

interface WhatHappensNextProps {
  data: WizardData;
  isVisible?: boolean;
}

export function WhatHappensNext({ data, isVisible = true }: WhatHappensNextProps) {
  if (!isVisible) {return null;}

  // Personalize content based on user inputs
  const getProjectType = () => {
    if (data.duration === 'short') {return 'Sprint Challenge';}
    if (data.duration === 'medium') {return 'Deep Exploration';}
    return 'Semester Journey';
  };

  const getTimeframe = () => {
    if (data.duration === 'short') {return '2-3 weeks';}
    if (data.duration === 'medium') {return '4-8 weeks';}
    return 'full semester';
  };

  const getStudentLevel = () => {
    const grade = data.gradeLevel?.toLowerCase() || '';
    if (grade.includes('k') || grade.includes('1') || grade.includes('2')) {return 'young learners';}
    if (grade.includes('3') || grade.includes('4') || grade.includes('5')) {return 'elementary students';}
    if (grade.includes('6') || grade.includes('7') || grade.includes('8')) {return 'middle schoolers';}
    if (grade.includes('9') || grade.includes('10') || grade.includes('11') || grade.includes('12')) {return 'high school students';}
    return 'students';
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Project Ideas',
      description: `Innovative ${data.subject || 'STEAM'} concepts tailored for ${getStudentLevel()}`,
      color: 'blue',
      delay: 0.1
    },
    {
      icon: FileText,
      title: 'Complete Learning Blueprint',
      description: `${getTimeframe()} plan with milestones and assessments`,
      color: 'emerald',
      delay: 0.2
    },
    {
      icon: Palette,
      title: 'Ready-to-Use Resources',
      description: `Activities and rubrics for ${data.gradeLevel || 'your grade level'}`,
      color: 'purple',
      delay: 0.3
    },
    {
      icon: Globe,
      title: 'Ongoing Support',
      description: 'AI assistance throughout implementation',
      color: 'orange',
      delay: 0.4
    }
  ];

  const benefits = [
    { text: 'Save 10+ hours of planning time', icon: Clock },
    { text: 'Engage students with real-world projects', icon: Target },
    { text: 'Meet curriculum standards effortlessly', icon: CheckCircle2 },
    { text: 'Join a community of innovative educators', icon: Users }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />
      
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-xl shadow-indigo-500/20"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Your {getProjectType()} Awaits!
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Here's how ALF Coach will transform your vision into an engaging {getTimeframe()} learning experience
          </p>
        </div>

        {/* Personalized Preview */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Personalized Project
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A {data.duration === 'short' ? 'fast-paced' : data.duration === 'medium' ? 'comprehensive' : 'deep'} {data.subject} experience 
                where {getStudentLevel()} will {data.vision ? data.vision.toLowerCase() : 'achieve amazing learning outcomes'}.
                {data.requiredResources && ` Optimized for your available resources: ${data.requiredResources}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: feature.delay }}
                className="flex gap-4"
              >
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl flex items-center justify-center shadow-lg shadow-${feature.color}-500/20`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Why Teachers Love ALF Coach
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <IconComponent className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{benefit.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">
              Everything is ready for your amazing project!
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click "Go to Ideation" to start creating with AI assistance
          </p>
        </motion.div>

        {/* Timeline visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mb-2" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Now</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Setup Complete</p>
            </div>
            
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 via-primary-500 to-purple-500 mx-4" />
            
            <div className="text-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mb-2" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Next</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">AI Ideation</p>
            </div>
            
            <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 mx-4" />
            
            <div className="text-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Then</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Build Blueprint</p>
            </div>
            
            <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500 mx-4" />
            
            <div className="text-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mb-2" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Launch</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Teach & Inspire</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}