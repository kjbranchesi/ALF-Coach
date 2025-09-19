import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      title: "Traditional",
      icon: "📚",
      items: ["Worksheets", "Memorization", "Tests"],
      color: "rgb(148, 163, 184)", // slate-400
      bgColor: "rgba(148, 163, 184, 0.1)"
    },
    {
      title: "Transforming",
      icon: "✨",
      items: ["Questions", "Exploration", "Discovery"],
      color: "rgb(99, 102, 241)", // primary
      bgColor: "rgba(99, 102, 241, 0.1)"
    },
    {
      title: "Project-Based",
      icon: "🚀",
      items: ["Creating", "Collaborating", "Solving"],
      color: "rgb(251, 146, 60)", // coral
      bgColor: "rgba(251, 146, 60, 0.1)"
    }
  ];

  const current = phases[currentPhase];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background circles */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: currentPhase * 120
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {phases.map((phase, index) => (
          <motion.div
            key={index}
            className="absolute w-32 h-32 rounded-full"
            style={{
              backgroundColor: phase.bgColor,
              transform: `rotate(${index * 120}deg) translateY(-80px)`,
            }}
            animate={{
              scale: currentPhase === index ? 1.2 : 0.8,
              opacity: currentPhase === index ? 1 : 0.3
            }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 text-center">
        {/* Phase icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            {current.icon}
          </motion.div>
        </AnimatePresence>

        {/* Phase title */}
        <AnimatePresence mode="wait">
          <motion.h3
            key={`title-${currentPhase}`}
            className="text-2xl font-bold mb-3"
            style={{ color: current.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {current.title}
          </motion.h3>
        </AnimatePresence>

        {/* Activity items */}
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {current.items.map((item, index) => (
              <motion.div
                key={`${currentPhase}-${index}`}
                className="text-sm text-slate-600 dark:text-slate-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {phases.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: currentPhase === index ? current.color : 'rgba(148, 163, 184, 0.3)'
              }}
              animate={{
                scale: currentPhase === index ? 1.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Floating elements */}
      {currentPhase === 2 && (
        <>
          {["💡", "🎨", "🔧", "🌱", "⚡"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{
                x: 0,
                y: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos((i * 72) * Math.PI / 180) * 150,
                y: Math.sin((i * 72) * Math.PI / 180) * 150,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default TransformationAnimation;