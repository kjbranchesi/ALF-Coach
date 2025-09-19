import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IdeationAnimation = () => {
  const [currentExample, setCurrentExample] = useState(0);

  // Real transformations from standard to engaging question
  const transformations = [
    {
      standard: "Students will understand photosynthesis",
      question: "How can we design a vertical garden to feed our community?",
      keywords: ["carbon", "energy", "growth", "life"]
    },
    {
      standard: "Analyze the Civil Rights Movement",
      question: "What does justice look like in our community today?",
      keywords: ["equality", "change", "voice", "action"]
    },
    {
      standard: "Apply geometric principles",
      question: "Can we redesign our playground for maximum fun?",
      keywords: ["angles", "space", "design", "play"]
    }
  ];

  // Cycle through examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % transformations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = transformations[currentExample];

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-8">
      {/* Floating keywords */}
      {current.keywords.map((keyword, i) => (
        <motion.div
          key={`${currentExample}-${keyword}`}
          className="absolute text-amber-600/40 dark:text-amber-400/40 text-sm font-medium"
          initial={{
            x: Math.random() * 300,
            y: Math.random() * 200,
            opacity: 0
          }}
          animate={{
            x: [null, Math.random() * 300, Math.random() * 300],
            y: [null, Math.random() * 200, Math.random() * 200],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 6,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {keyword}
        </motion.div>
      ))}

      <div className="relative z-10 space-y-6">
        {/* Standard text that fades out */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`standard-${currentExample}`}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <span className="line-through">{current.standard}</span>
          </motion.div>
        </AnimatePresence>

        {/* Arrow transformation */}
        <motion.div
          className="flex justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <motion.path
              d="M20 10 L20 30 M15 25 L20 30 L25 25"
              stroke="rgb(251, 146, 60)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            />
          </svg>
        </motion.div>

        {/* Engaging question that appears */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`question-${currentExample}`}
            className="text-lg font-semibold text-slate-800 dark:text-slate-200"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {current.question}
          </motion.div>
        </AnimatePresence>

        {/* Sparkles appearing around the question */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="relative">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.div
                key={angle}
                className="absolute w-2 h-2 bg-amber-400 rounded-full"
                style={{
                  transform: `rotate(${angle}deg) translateY(-60px)`
                }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay: 1 + (angle / 360), repeat: Infinity, repeatDelay: 2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdeationAnimation;