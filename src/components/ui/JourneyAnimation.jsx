import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JourneyAnimation = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Journey milestones
  const milestones = [
    { id: 1, x: 50, y: 150, label: "Hook", description: "Engage curiosity", size: 20, delay: 0 },
    { id: 2, x: 120, y: 120, label: "Explore", description: "Build knowledge", size: 25, delay: 0.5 },
    { id: 3, x: 190, y: 140, label: "Create", description: "Apply learning", size: 30, delay: 1 },
    { id: 4, x: 260, y: 100, label: "Share", description: "Reflect & present", size: 35, delay: 1.5 },
    { id: 5, x: 330, y: 80, label: "Celebrate", description: "Recognize growth", size: 40, delay: 2 }
  ];

  // Scaffolding supports
  const scaffolds = [
    { x: 85, y: 180, height: 60, delay: 0.3 },
    { x: 155, y: 170, height: 50, delay: 0.8 },
    { x: 225, y: 160, height: 40, delay: 1.3 },
    { x: 295, y: 150, height: 30, delay: 1.8 }
  ];

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-8">
      <svg
        viewBox="0 0 380 220"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background grid for journey map feel */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20, 184, 166, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="380" height="220" fill="url(#grid)" />

        {/* Path connecting milestones */}
        <motion.path
          d="M 50 150 Q 120 100, 190 140 T 330 80"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />

        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Scaffolding supports */}
        {scaffolds.map((scaffold, i) => (
          <motion.g key={i}>
            <motion.rect
              x={scaffold.x - 2}
              y={220 - scaffold.height}
              width="4"
              height={scaffold.height}
              fill="rgba(20, 184, 166, 0.3)"
              initial={{ height: 0, y: 220 }}
              animate={{ height: scaffold.height, y: 220 - scaffold.height }}
              transition={{ duration: 0.5, delay: scaffold.delay }}
            />
            {/* Support beams */}
            <motion.line
              x1={scaffold.x - 10}
              y1={220 - scaffold.height + 10}
              x2={scaffold.x + 10}
              y2={220 - scaffold.height + 10}
              stroke="rgba(20, 184, 166, 0.4)"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: scaffold.delay + 0.2 }}
            />
          </motion.g>
        ))}

        {/* Journey milestones */}
        {milestones.map((milestone) => (
          <motion.g
            key={milestone.id}
            onMouseEnter={() => setHoveredNode(milestone.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Milestone circle */}
            <motion.circle
              cx={milestone.x}
              cy={milestone.y}
              r={milestone.size / 2}
              fill="rgb(20, 184, 166)"
              opacity={0.8}
              initial={{ scale: 0 }}
              animate={{
                scale: hoveredNode === milestone.id ? 1.2 : 1,
                opacity: hoveredNode === milestone.id ? 1 : 0.8
              }}
              transition={{ duration: 0.5, delay: milestone.delay }}
            />

            {/* Pulsing ring */}
            <motion.circle
              cx={milestone.x}
              cy={milestone.y}
              r={milestone.size / 2}
              fill="none"
              stroke="rgb(20, 184, 166)"
              strokeWidth="2"
              animate={{
                r: [milestone.size / 2, milestone.size / 2 + 10, milestone.size / 2],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: milestone.delay
              }}
            />

            {/* Label */}
            <motion.text
              x={milestone.x}
              y={milestone.y - milestone.size / 2 - 10}
              textAnchor="middle"
              className="fill-slate-700 dark:fill-slate-300 text-xs font-bold select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredNode === milestone.id ? 1 : 0.8 }}
              transition={{ duration: 0.3, delay: milestone.delay + 0.3 }}
            >
              {milestone.label}
            </motion.text>

            {/* Description on hover */}
            {hoveredNode === milestone.id && (
              <motion.text
                x={milestone.x}
                y={milestone.y + milestone.size / 2 + 15}
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-400 text-xs italic"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {milestone.description}
              </motion.text>
            )}

            {/* Student icon at milestone 3 */}
            {milestone.id === 3 && (
              <motion.g
                animate={{
                  x: [0, 5, 0, -5, 0],
                  y: [0, -3, 0, -3, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 2
                }}
              >
                <circle cx={milestone.x} cy={milestone.y} r="4" fill="white" />
              </motion.g>
            )}
          </motion.g>
        ))}

        {/* Moving student along path */}
        <motion.circle
          r="6"
          fill="rgb(251, 146, 60)"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
          style={{
            offsetPath: "path('M 50 150 Q 120 100, 190 140 T 330 80')",
            offsetRotate: "0deg"
          }}
        />
      </svg>

      {/* Journey label */}
      <motion.div
        className="absolute bottom-4 right-4 text-xs text-teal-600 dark:text-teal-400 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2 }}
      >
        Every learner's path is unique
      </motion.div>
    </div>
  );
};

export default JourneyAnimation;