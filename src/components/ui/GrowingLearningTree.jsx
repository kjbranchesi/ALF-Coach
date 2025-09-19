import React from 'react';
import { motion } from 'framer-motion';

const GrowingLearningTree = () => {
  const branches = [
    { id: 1, angle: -45, length: 80, delay: 2, subject: 'Science', color: 'stroke-blue-400' },
    { id: 2, angle: -20, length: 90, delay: 2.5, subject: 'Math', color: 'stroke-emerald-400' },
    { id: 3, angle: 20, length: 85, delay: 3, subject: 'Arts', color: 'stroke-coral-400' },
    { id: 4, angle: 45, length: 75, delay: 3.5, subject: 'Social Studies', color: 'stroke-purple-400' },
    { id: 5, angle: -60, length: 60, delay: 4, subject: 'Language', color: 'stroke-amber-400' },
    { id: 6, angle: 60, length: 65, delay: 4.5, subject: 'PE', color: 'stroke-rose-400' }
  ];

  const leaves = [
    { id: 1, x: 120, y: 80, delay: 5, size: 8, color: 'fill-emerald-300' },
    { id: 2, x: 140, y: 90, delay: 5.2, size: 6, color: 'fill-blue-300' },
    { id: 3, x: 160, y: 70, delay: 5.4, size: 7, color: 'fill-coral-300' },
    { id: 4, x: 180, y: 85, delay: 5.6, size: 9, color: 'fill-purple-300' },
    { id: 5, x: 100, y: 95, delay: 5.8, size: 6, color: 'fill-amber-300' },
    { id: 6, x: 200, y: 75, delay: 6, size: 8, color: 'fill-rose-300' },
    { id: 7, x: 130, y: 60, delay: 6.2, size: 7, color: 'fill-teal-300' },
    { id: 8, x: 170, y: 100, delay: 6.4, size: 6, color: 'fill-indigo-300' }
  ];

  const flowers = [
    { id: 1, x: 125, y: 75, delay: 7, color: 'fill-coral-400' },
    { id: 2, x: 155, y: 85, delay: 7.5, color: 'fill-primary-400' },
    { id: 3, x: 175, y: 70, delay: 8, color: 'fill-emerald-400' }
  ];

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Ground/Root area */}
        <motion.ellipse
          cx="150"
          cy="280"
          rx="60"
          ry="15"
          className="fill-emerald-200/40 dark:fill-emerald-800/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Alf seed/root system */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <circle
            cx="150"
            cy="270"
            r="12"
            className="fill-primary-500 dark:fill-primary-400"
          />
          <motion.circle
            cx="150"
            cy="270"
            r="12"
            className="fill-none stroke-primary-300 dark:stroke-primary-500"
            animate={{
              r: [12, 18, 12],
              opacity: [0.8, 0.3, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <text
            x="150"
            y="275"
            textAnchor="middle"
            className="fill-white text-xs font-bold"
          >
            Alf
          </text>
        </motion.g>

        {/* Main trunk */}
        <motion.line
          x1="150"
          y1="270"
          x2="150"
          y2="180"
          strokeWidth="8"
          className="stroke-amber-700 dark:stroke-amber-600"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        />

        {/* Branches */}
        {branches.map((branch) => {
          const endX = 150 + Math.cos((branch.angle * Math.PI) / 180) * branch.length;
          const endY = 180 + Math.sin((branch.angle * Math.PI) / 180) * branch.length;

          return (
            <motion.g key={branch.id}>
              <motion.line
                x1="150"
                y1="180"
                x2={endX}
                y2={endY}
                strokeWidth="4"
                className={`${branch.color} dark:opacity-80`}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: branch.delay }}
              />

              {/* Subject label */}
              <motion.text
                x={endX + (endX > 150 ? 10 : -10)}
                y={endY}
                textAnchor={endX > 150 ? "start" : "end"}
                className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: branch.delay + 0.5 }}
              >
                {branch.subject}
              </motion.text>
            </motion.g>
          );
        })}

        {/* Leaves */}
        {leaves.map((leaf) => (
          <motion.g key={leaf.id}>
            <motion.ellipse
              cx={leaf.x}
              cy={leaf.y}
              rx={leaf.size}
              ry={leaf.size * 0.7}
              className={`${leaf.color} dark:opacity-80`}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: 1,
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                scale: { duration: 0.3, delay: leaf.delay },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: leaf.delay
                }
              }}
            />
          </motion.g>
        ))}

        {/* Flowers (project completions) */}
        {flowers.map((flower) => (
          <motion.g key={flower.id}>
            <motion.circle
              cx={flower.x}
              cy={flower.y}
              r="6"
              className={`${flower.color} dark:opacity-90`}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 0.8,
                delay: flower.delay,
                ease: "easeOut"
              }}
            />
            {/* Flower petals */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: flower.delay + 0.2 }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <ellipse
                  key={i}
                  cx={flower.x + Math.cos((angle * Math.PI) / 180) * 8}
                  cy={flower.y + Math.sin((angle * Math.PI) / 180) * 8}
                  rx="3"
                  ry="6"
                  className={`${flower.color} opacity-60`}
                  transform={`rotate(${angle} ${flower.x} ${flower.y})`}
                />
              ))}
            </motion.g>
          </motion.g>
        ))}

        {/* Floating particles/seeds */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            r="2"
            className="fill-primary-300/60 dark:fill-primary-400/60"
            animate={{
              x: [Math.random() * 300, Math.random() * 300],
              y: [Math.random() * 300, Math.random() * 300],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: 8 + Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Gentle tree sway */}
        <motion.g
          animate={{
            rotate: [0, 1, -1, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: "150px 270px" }}
        >
          {/* This creates a subtle swaying effect for the entire tree */}
        </motion.g>
      </svg>

      {/* Background subtle glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-emerald-100/20 via-transparent to-transparent rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default GrowingLearningTree;