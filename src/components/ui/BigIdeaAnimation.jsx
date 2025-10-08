import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';

const BigIdeaAnimation = () => {
  const [stage, setStage] = useState('typing'); // typing, processing, refined
  const [currentExample, setCurrentExample] = useState(0);

  // Real examples matching the video script and use cases
  const examples = [
    {
      input: "Acoustic Design",
      thinking: "Exploring sound and learning environments...",
      output: "How does sound shape the way we learn and work?"
    },
    {
      input: "Water Quality",
      thinking: "Connecting to community and environment...",
      output: "Is our local water safe for the community?"
    },
    {
      input: "Street Safety",
      thinking: "Analyzing real-world data and solutions...",
      output: "How can we make our neighborhood safer to navigate?"
    }
  ];

  const current = examples[currentExample];

  // Animation cycle
  useEffect(() => {
    const cycle = async () => {
      setStage('typing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStage('processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStage('refined');
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Move to next example
      setCurrentExample((prev) => (prev + 1) % examples.length);
    };

    const interval = setInterval(cycle, 6000);
    return () => clearInterval(interval);
  }, [currentExample]);

  return (
    <div className="relative w-full h-80 md:h-96 overflow-visible rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 md:p-10 flex items-center justify-center">

      {/* Floating sparkles during processing */}
      <AnimatePresence>
        {stage === 'processing' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: 190,
                  y: 120,
                  opacity: 0
                }}
                animate={{
                  x: 190 + Math.cos((i * Math.PI) / 4) * 60,
                  y: 120 + Math.sin((i * Math.PI) / 4) * 60,
                  opacity: [0, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-primary-500" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md space-y-6">

        {/* Teacher Input */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: stage === 'typing' ? 1 : 0.5,
            y: 0,
            scale: stage === 'typing' ? 1 : 0.95
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Teacher</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`input-${currentExample}`}
                  className="text-sm font-medium text-slate-900 dark:text-slate-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {stage === 'typing' && (
                    <>
                      {current.input}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        |
                      </motion.span>
                    </>
                  )}
                  {stage !== 'typing' && current.input}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ALF Processing */}
        <AnimatePresence>
          {stage === 'processing' && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium italic">{current.thinking}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ALF Refined Output */}
        <AnimatePresence>
          {stage === 'refined' && (
            <motion.div
              className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 rounded-xl p-4 shadow-md border-2 border-primary-200 dark:border-primary-700"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-primary-700 dark:text-primary-300 mb-1 font-medium">ALF Coach</div>
                  <motion.div
                    className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {current.output}
                  </motion.div>
                </div>
              </div>

              {/* Success indicator */}
              <motion.div
                className="mt-3 flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Essential Question defined</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {['typing', 'processing', 'refined'].map((s, i) => (
          <motion.div
            key={s}
            className={`w-2 h-2 rounded-full ${
              stage === s
                ? 'bg-primary-600 dark:bg-primary-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
            animate={{
              scale: stage === s ? 1.2 : 1,
              opacity: stage === s ? 1 : 0.5
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default BigIdeaAnimation;
