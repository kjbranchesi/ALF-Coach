import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Palette, Users, Target, Check, Star, BarChart3, Lightbulb } from 'lucide-react';

const DeliverablesAnimation = () => {
  const [selectedCell, setSelectedCell] = useState(null);

  // Rubric structure with icons instead of emojis
  const criteria = [
    { id: 1, name: "Research", Icon: BookOpen },
    { id: 2, name: "Creativity", Icon: Palette },
    { id: 3, name: "Collaboration", Icon: Users },
    { id: 4, name: "Presentation", Icon: Target }
  ];

  const levels = [
    { id: 1, name: "Emerging", color: "rgba(251, 191, 36, 0.2)", borderColor: "rgb(251, 191, 36)" },
    { id: 2, name: "Developing", color: "rgba(251, 146, 60, 0.2)", borderColor: "rgb(251, 146, 60)" },
    { id: 3, name: "Proficient", color: "rgba(34, 197, 94, 0.2)", borderColor: "rgb(34, 197, 94)" },
    { id: 4, name: "Advanced", color: "rgba(59, 130, 246, 0.2)", borderColor: "rgb(59, 130, 246)" }
  ];

  // Sample descriptors that appear
  const descriptors = {
    "1-1": "Beginning to explore sources",
    "1-2": "Using multiple sources",
    "1-3": "Synthesizing information",
    "1-4": "Original insights from research",
    "2-1": "Following examples",
    "2-2": "Adding personal touches",
    "2-3": "Unique approach",
    "2-4": "Innovative solutions",
    "3-1": "Contributing to group",
    "3-2": "Supporting teammates",
    "3-3": "Leading initiatives",
    "3-4": "Elevating entire team",
    "4-1": "Basic communication",
    "4-2": "Clear delivery",
    "4-3": "Engaging audience",
    "4-4": "Inspiring action"
  };

  const floatingIcons = [Check, Star, BarChart3, Lightbulb, Target];

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-coral-50 to-pink-50 dark:from-coral-900/20 dark:to-pink-900/20 p-6">
      {/* Floating assessment elements */}
      {floatingIcons.map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * 300,
            y: -20,
            opacity: 0
          }}
          animate={{
            y: [null, 250],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 8,
            delay: i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon className="w-6 h-6 text-coral-400/50" />
        </motion.div>
      ))}

      {/* Rubric Grid */}
      <div className="relative z-10">
        <div className="grid grid-cols-5 gap-1 text-xs">
          {/* Header row */}
          <div className="p-1 text-center font-semibold text-slate-600 dark:text-slate-400">
            Criteria
          </div>
          {levels.map((level) => (
            <motion.div
              key={level.id}
              className="p-1 text-center font-semibold text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: level.id * 0.1 }}
            >
              {level.name}
            </motion.div>
          ))}

          {/* Rubric cells */}
          {criteria.map((criterion, rowIndex) => (
            <React.Fragment key={criterion.id}>
              {/* Criterion label */}
              <motion.div
                className="p-2 text-center font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.2 + 0.5 }}
              >
                <criterion.Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">{criterion.name}</span>
              </motion.div>

              {/* Level cells */}
              {levels.map((level, colIndex) => {
                const cellId = `${criterion.id}-${level.id}`;
                const isSelected = selectedCell === cellId;

                return (
                  <motion.div
                    key={cellId}
                    className="relative p-1 cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: isSelected ? level.color : 'transparent',
                      borderWidth: '1px',
                      borderColor: isSelected ? level.borderColor : 'rgba(0,0,0,0.1)',
                      borderRadius: '4px'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: isSelected ? 1.05 : 1
                    }}
                    transition={{
                      delay: rowIndex * 0.1 + colIndex * 0.1 + 0.5,
                      duration: 0.3
                    }}
                    onMouseEnter={() => setSelectedCell(cellId)}
                    onMouseLeave={() => setSelectedCell(null)}
                  >
                    {/* Cell content */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="text-xs text-slate-600 dark:text-slate-300 text-center"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          {descriptors[cellId]?.substring(0, 15)}...
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Fill animation */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: level.color,
                        zIndex: -1,
                        originX: 0
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: rowIndex * 0.2 + colIndex * 0.15 + 1,
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                    />
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          className="mt-4 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-coral-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity
              }}
            />
          ))}
        </motion.div>

        {/* Hover instruction */}
        <motion.div
          className="absolute -bottom-2 right-0 text-xs text-coral-600 dark:text-coral-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          Hover to explore criteria
        </motion.div>
      </div>
    </div>
  );
};

export default DeliverablesAnimation;