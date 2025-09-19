import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Rocket,
  Brain,
  Users,
  Target,
  Compass,
  Lightbulb,
  Code,
  Layers,
  Hammer,
  Globe
} from 'lucide-react';

const TransformationAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Cycle through transformation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const phases = [
    {
      title: "Traditional Learning",
      subtitle: "One-Size-Fits-All",
      Icon: BookOpen,
      items: ["Passive Reception", "Standardized Tests", "Linear Progress"],
      color: "#64748b", // slate-500
      gradientFrom: "#cbd5e1", // slate-300
      gradientTo: "#94a3b8", // slate-400
      shadowColor: "rgba(100, 116, 139, 0.15)",
      iconSet: [BookOpen],
      pathData: "M 192 100 Q 100 192 192 284 Q 284 192 192 100", // Circle-like shape
      viewBox: "0 0 384 384"
    },
    {
      title: "Transforming",
      subtitle: "Discovering Potential",
      Icon: Sparkles,
      items: ["Active Inquiry", "Critical Thinking", "Adaptive Learning"],
      color: "#6366f1", // indigo-500
      gradientFrom: "#818cf8", // indigo-400
      gradientTo: "#4f46e5", // indigo-600
      shadowColor: "rgba(99, 102, 241, 0.2)",
      iconSet: [Compass, Brain, Lightbulb],
      pathData: "M 192 80 L 120 160 L 120 260 L 192 304 L 264 260 L 264 160 Z", // Hexagon
      viewBox: "0 0 384 384"
    },
    {
      title: "Project-Based",
      subtitle: "Real-World Impact",
      Icon: Rocket,
      items: ["Creative Solutions", "Collaboration", "Problem Solving"],
      color: "#f97316", // orange-500
      gradientFrom: "#fb923c", // orange-400
      gradientTo: "#ea580c", // orange-600
      shadowColor: "rgba(249, 115, 22, 0.2)",
      iconSet: [Code, Hammer, Users, Globe, Target],
      pathData: "M 192 60 L 100 140 L 100 244 L 192 324 L 284 244 L 284 140 Z", // Diamond/Star hybrid
      viewBox: "0 0 384 384"
    }
  ];

  const current = phases[currentPhase];

  // Path morphing transitions for smoother animation
  const shapeVariants = {
    0: { // Circle
      d: "M 192 60 Q 60 192 192 324 Q 324 192 192 60",
      rotate: 0,
    },
    1: { // Hexagon
      d: "M 192 60 L 90 150 L 90 234 L 192 324 L 294 234 L 294 150 Z",
      rotate: 30,
    },
    2: { // Star
      d: "M 192 40 L 120 140 L 20 160 L 106 244 L 86 344 L 192 292 L 298 344 L 278 244 L 364 160 L 264 140 Z",
      rotate: 0,
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            `radial-gradient(circle at 30% 50%, ${current.gradientFrom} 0%, transparent 50%)`,
            `radial-gradient(circle at 70% 50%, ${current.gradientTo} 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${current.gradientFrom} 0%, transparent 50%)`,
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Main morphing shape container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* SVG morphing shape */}
        <svg
          viewBox="0 0 384 384"
          className="absolute w-full h-full"
          style={{ maxWidth: '384px', maxHeight: '384px' }}
        >
          <defs>
            {/* Gradient definition */}
            <linearGradient id={`gradient-${currentPhase}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={current.gradientFrom} stopOpacity="0.8" />
              <stop offset="100%" stopColor={current.gradientTo} stopOpacity="0.8" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Morphing outline shape */}
          <motion.path
            variants={shapeVariants}
            animate={currentPhase}
            transition={{
              duration: 1.2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            fill="none"
            stroke={`url(#gradient-${currentPhase})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            opacity={0.9}
          />

          {/* Inner filled shape with lower opacity */}
          <motion.path
            variants={shapeVariants}
            animate={currentPhase}
            transition={{
              duration: 1.2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            fill={`url(#gradient-${currentPhase})`}
            opacity={0.1}
          />
        </svg>

        {/* Content inside the shape */}
        <div className="relative z-10 flex flex-col items-center justify-center px-8">
          {/* Main Icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`icon-${currentPhase}`}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="mb-4"
            >
              <current.Icon
                className="w-20 h-20"
                style={{
                  color: current.color,
                  filter: `drop-shadow(0 0 20px ${current.shadowColor})`
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Title and Subtitle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${currentPhase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <h3
                className="text-3xl font-bold mb-1"
                style={{ color: current.color }}
              >
                {current.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {current.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Activity items with stagger animation */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {current.items.map((item, index) => (
                <motion.div
                  key={`${currentPhase}-item-${index}`}
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0, x: -30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.8 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: current.color }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: current.color }}
                  >
                    {item}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Orbiting icons for enhanced visual interest */}
        <AnimatePresence>
          {current.iconSet.map((Icon, i) => (
            <motion.div
              key={`orbit-${currentPhase}-${i}`}
              className="absolute pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
                x: Math.cos((i * (360 / current.iconSet.length)) * Math.PI / 180) * 140,
                y: Math.sin((i * (360 / current.iconSet.length)) * Math.PI / 180) * 140,
                rotate: [0, 360]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 2.5,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut"
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{
                  color: current.color,
                  opacity: 0.7
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress indicator with enhanced design */}
      <div className="absolute bottom-8 flex items-center gap-3">
        {phases.map((phase, index) => (
          <motion.div
            key={`progress-${index}`}
            className="relative"
            animate={{
              scale: currentPhase === index ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-12 h-1 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700"
              style={{
                backgroundColor: currentPhase === index ? 'transparent' : undefined
              }}
            >
              {currentPhase === index && (
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: phase.color }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "linear" }}
                />
              )}
            </motion.div>

            {/* Tooltip on hover */}
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-white opacity-0 pointer-events-none"
              whileHover={{ opacity: 1 }}
            >
              {phase.title}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransformationAnimation;