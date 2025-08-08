// ALFOnboarding.tsx - Premium 2-screen onboarding that inspires and excites teachers

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Heart, TrendingUp, Users, 
  Lightbulb, Map, Target, CheckCircle, X, SkipForward,
  Star, Rocket, Zap, Award, Globe, BookOpen
} from 'lucide-react';

interface OnboardingScreen {
  id: 'welcome' | 'how-it-works';
  content: React.ReactNode;
}

// Floating particle animation for background
const FloatingParticle = ({ delay = 0, duration = 20, className = "" }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ y: "100vh", opacity: 0 }}
    animate={{ 
      y: "-10vh", 
      opacity: [0, 1, 1, 0],
      x: [0, 30, -30, 0]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-40" />
  </motion.div>
);

const onboardingScreens: OnboardingScreen[] = [
  {
    id: 'welcome',
    content: (
      <div className="text-center space-y-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.div 
            className="relative w-24 h-24 mx-auto mb-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 rounded-3xl opacity-90 shadow-2xl" />
            <div className="absolute inset-1 bg-gradient-to-br from-rose-300 via-fuchsia-400 to-indigo-400 rounded-3xl" />
            <motion.div 
              className="absolute inset-2 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(236, 72, 153, 0.4)",
                  "0 0 0 10px rgba(236, 72, 153, 0)",
                  "0 0 0 0 rgba(236, 72, 153, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-8 h-8 text-transparent bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-600 bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
              Your Teaching
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Create <span className="text-transparent bg-gradient-to-r from-rose-500 to-fuchsia-500 bg-clip-text font-semibold">magical</span> project-based learning experiences that 
            <span className="text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text font-semibold">ignite curiosity</span> and prepare students for an amazing future.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-br from-rose-400/10 via-rose-500/20 to-pink-600/10 backdrop-blur-sm p-8 rounded-3xl border border-rose-200/50 dark:border-rose-800/50 hover:shadow-2xl hover:shadow-rose-500/25 transition-all duration-500"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-300/20 to-transparent rounded-full blur-2xl" />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-rose-500 mb-6 drop-shadow-lg" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600 transition-colors">
              Students Love It
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Real-world projects that matter to them <span className="font-semibold text-rose-600">increase engagement by 40%</span> and reduce behavior issues.
            </p>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Star className="w-5 h-5 text-rose-400" />
            </div>
          </motion.div>
          
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-400/10 via-teal-500/20 to-green-600/10 backdrop-blur-sm p-8 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-300/20 to-transparent rounded-full blur-2xl" />
            <motion.div
              animate={{ 
                y: [0, -5, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingUp className="w-10 h-10 text-emerald-500 mb-6 drop-shadow-lg" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors">
              Better Results
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Research shows <span className="font-semibold text-emerald-600">8-10 point gains</span> on assessments while building critical thinking skills.
            </p>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
          </motion.div>
          
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-400/10 via-blue-500/20 to-purple-600/10 backdrop-blur-sm p-8 rounded-3xl border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-300/20 to-transparent rounded-full blur-2xl" />
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users className="w-10 h-10 text-indigo-500 mb-6 drop-shadow-lg" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
              You're Not Alone
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Join <span className="font-semibold text-indigo-600">thousands of educators</span> creating meaningful learning experiences every day.
            </p>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/20 to-teal-500/10 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 max-w-3xl mx-auto shadow-2xl hover:shadow-3xl transition-all duration-500"
          whileHover={{ y: -4 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-indigo-500 to-teal-500" />
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20" />
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-15" />
          
          <motion.div
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                S
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed">
                "My students are <span className="text-transparent bg-gradient-to-r from-rose-500 to-fuchsia-500 bg-clip-text">asking for more projects</span>. They're solving real problems and <span className="text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text">loving school again</span>."
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                — Sarah Chen, 7th Grade Science Teacher, Oakland
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    )
  },
  {
    id: 'how-it-works',
    content: (
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-gradient-to-r from-rose-400 to-indigo-500 rounded-full flex items-center justify-center"
            >
              <Rocket className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-transparent bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text font-semibold text-lg">
              Your Journey Begins
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text">
              Three Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            ALF Coach guides you through creating <span className="font-semibold text-transparent bg-gradient-to-r from-rose-500 to-fuchsia-500 bg-clip-text">engaging</span> project-based learning experiences 
            that connect to your curriculum and <span className="font-semibold text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text">captivate</span> your students.
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          {/* Step 1 */}
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500/10 via-fuchsia-500/15 to-pink-500/10 backdrop-blur-sm p-8 rounded-3xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-700"
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full blur-lg" />
            
            <div className="flex items-start gap-6">
              <motion.div 
                className="relative flex-shrink-0"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotateY: [0, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl group-hover:shadow-purple-500/50 transition-shadow duration-500">
                  1
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                >
                  <Zap className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Lightbulb className="w-7 h-7 text-purple-500 drop-shadow-lg" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300">
                    Spark the Big Idea
                  </h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Transform your curriculum into <span className="font-semibold text-purple-600">compelling challenges</span> that connect to real-world issues students actually care about.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-yellow-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-200/50 dark:border-orange-800/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-700"
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-yellow-400/20 to-transparent rounded-full blur-lg" />
            
            <div className="flex items-start gap-6">
              <motion.div 
                className="relative flex-shrink-0"
                animate={{ 
                  y: [0, -5, 0],
                  rotateZ: [0, 5, 0]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl group-hover:shadow-orange-500/50 transition-shadow duration-500">
                  2
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center"
                >
                  <Star className="w-3 h-3 text-white fill-current" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Map className="w-7 h-7 text-orange-500 drop-shadow-lg" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors duration-300">
                    Map the Journey
                  </h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Design the learning path with activities that <span className="font-semibold text-orange-600">build skills step by step</span>, keeping students engaged and growing.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-green-500/10 backdrop-blur-sm p-8 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-700"
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-bl from-emerald-400/30 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-full blur-lg" />
            
            <div className="flex items-start gap-6">
              <motion.div 
                className="relative flex-shrink-0"
                animate={{ 
                  scale: [1, 1.03, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl group-hover:shadow-emerald-500/50 transition-shadow duration-500">
                  3
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
                  >
                    <Target className="w-7 h-7 text-emerald-500 drop-shadow-lg" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors duration-300">
                    Create & Celebrate
                  </h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Students produce <span className="font-semibold text-emerald-600">authentic work they're proud to share</span>, demonstrating deep learning and real impact.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* What You'll Get */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/15 to-teal-500/10 backdrop-blur-sm p-8 rounded-3xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl max-w-4xl mx-auto"
          whileHover={{ y: -4, scale: 1.01 }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-indigo-500 via-purple-500 to-teal-500 rounded-t-3xl" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-full blur-xl" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Award className="w-6 h-6 text-white" />
              </motion.div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ready to export in <span className="text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">15 minutes</span>:
              </h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="flex items-center gap-4 group"
                whileHover={{ x: 4 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 drop-shadow-md group-hover:text-emerald-600 transition-colors" />
                </motion.div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">
                  Complete project blueprint
                </span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 group"
                whileHover={{ x: 4 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 drop-shadow-md group-hover:text-emerald-600 transition-colors" />
                </motion.div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">
                  Student-friendly materials
                </span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 group"
                whileHover={{ x: 4 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 drop-shadow-md group-hover:text-emerald-600 transition-colors" />
                </motion.div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">
                  Assessment rubrics
                </span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 group"
                whileHover={{ x: 4 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 drop-shadow-md group-hover:text-emerald-600 transition-colors" />
                </motion.div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">
                  Implementation timeline
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
];

interface ALFOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const ALFOnboarding: React.FC<ALFOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const controls = useAnimationControls();
  
  useEffect(() => {
    // Add floating particles
    const particles = Array.from({ length: 6 }, (_, i) => i);
    return () => {};
  }, []);
  
  const screen = onboardingScreens[currentScreen];
  const isFirstScreen = currentScreen === 0;
  const isLastScreen = currentScreen === onboardingScreens.length - 1;
  
  const goToNext = async () => {
    if (isLastScreen) {
      setIsLoading(true);
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      onComplete();
    } else {
      setDirection(1);
      setCurrentScreen(prev => prev + 1);
    }
  };
  
  const goToPrevious = () => {
    setDirection(-1);
    setCurrentScreen(prev => prev - 1);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (onSkip) {
      onSkip();
    } else {
      onComplete(); // Fallback if no skip handler provided
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-500/20 via-purple-600/30 to-indigo-600/40 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* Floating Particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <FloatingParticle 
          key={i}
          delay={i * 2}
          duration={15 + i * 3}
          className={`${i % 2 === 0 ? 'left-1/4' : 'right-1/4'} opacity-30`}
        />
      ))}
      
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-rose-400/20 to-pink-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/10 to-emerald-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-600/50 max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Header with Skip */}
        <div className="relative p-6 border-b border-white/50 dark:border-gray-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div 
                className="relative w-10 h-10 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    "0 4px 20px rgba(236, 72, 153, 0.3)",
                    "0 8px 30px rgba(79, 70, 229, 0.4)",
                    "0 4px 20px rgba(236, 72, 153, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="absolute inset-0.5 bg-white/20 rounded-lg" />
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-indigo-700 bg-clip-text text-transparent">
                  ALF Coach
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Your Teaching Adventure Begins
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-6">
              {/* Enhanced Progress Indicator */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {currentScreen + 1} of {onboardingScreens.length}
                </span>
                <div className="flex gap-2">
                  {onboardingScreens.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`relative h-2 rounded-full transition-all duration-500 ${
                        index === currentScreen 
                          ? 'w-8 bg-gradient-to-r from-rose-500 to-indigo-600' 
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                      animate={index === currentScreen ? {
                        boxShadow: [
                          "0 0 0 0 rgba(236, 72, 153, 0.4)",
                          "0 0 0 4px rgba(236, 72, 153, 0.1)",
                          "0 0 0 0 rgba(236, 72, 153, 0)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      whileHover={{ scale: 1.2 }}
                    >
                      {index === currentScreen && (
                        <motion.div
                          className="absolute inset-0 bg-white/30 rounded-full"
                          animate={{ scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Skip Button */}
              <motion.button
                onClick={handleSkip}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Skip onboarding introduction"
              >
                {isLoading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <SkipForward className="w-4 h-4" />
                )}
                Skip intro
              </motion.button>
              
              {/* Close Button */}
              <motion.button
                onClick={handleSkip}
                disabled={isLoading}
                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close onboarding"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-8 md:p-12 lg:p-16 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              initial={{ 
                x: direction > 0 ? 100 : -100, 
                opacity: 0, 
                scale: 0.95,
                rotateY: direction > 0 ? 10 : -10
              }}
              animate={{ 
                x: 0, 
                opacity: 1, 
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                x: direction > 0 ? -100 : 100, 
                opacity: 0, 
                scale: 0.95,
                rotateY: direction > 0 ? -10 : 10
              }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {screen.content}
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle gradient overlay at bottom for scroll indication */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-800/80 pointer-events-none" />
        </div>
        
        {/* Actions */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-white/80 via-white/90 to-white/80 dark:from-gray-800/80 dark:via-gray-800/90 dark:to-gray-800/80 backdrop-blur-sm border-t border-white/50 dark:border-gray-600/50 flex items-center justify-between">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent dark:via-gray-600" />
          
          <div>
            {!isFirstScreen && (
              <motion.button
                onClick={goToPrevious}
                disabled={isLoading}
                className="flex items-center gap-3 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-all duration-300 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.03, x: -3 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Go back to previous screen"
              >
                <motion.div
                  animate={{ x: [-2, 0, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </motion.div>
                Back
              </motion.button>
            )}
          </div>
          
          <motion.button
            onClick={goToNext}
            disabled={isLoading}
            className={`
              relative overflow-hidden px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center gap-3 shadow-2xl hover:shadow-3xl transform
              ${isLastScreen
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-green-700 hover:-translate-y-1 hover:scale-105'
                : 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-600 text-white hover:from-rose-600 hover:via-fuchsia-600 hover:to-indigo-700 hover:-translate-y-1 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
            whileHover={{ 
              scale: isLoading ? 1 : 1.05,
              y: isLoading ? 0 : -2
            }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            aria-label={isLastScreen ? "Start building amazing projects" : "See how ALF Coach works"}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {isLoading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Starting your adventure...</span>
              </>
            ) : isLastScreen ? (
              <>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <span>Let's Build Something Amazing</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Rocket className="w-5 h-5" />
                </motion.div>
              </>
            ) : (
              <>
                <span>See How It Works</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </>
            )}
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-200%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-rose-400 to-indigo-400 rounded-full opacity-60" />
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60" />
        <div className="absolute top-1/2 left-2 w-1 h-1 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full opacity-40" />
      </motion.div>
    </div>
  );
};

// Export default for easier imports
export default ALFOnboarding;