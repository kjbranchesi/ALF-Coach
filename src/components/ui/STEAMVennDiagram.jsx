import React, { useState } from 'react';
import { motion } from 'framer-motion';

const STEAMVennDiagram = () => {
  const [hoveredCircle, setHoveredCircle] = useState(null);

  // Five circles arranged in a pentagram pattern for STEAM
  const circles = [
    {
      id: 'science',
      label: 'Science',
      x: 150,
      y: 80,
      labelX: 150,
      labelY: 50,
      color: 'rgba(59, 130, 246, 0.25)', // blue
      borderColor: 'rgb(59, 130, 246)',
      delay: 0
    },
    {
      id: 'technology',
      label: 'Technology',
      x: 220,
      y: 120,
      labelX: 250,
      labelY: 100,
      color: 'rgba(139, 92, 246, 0.25)', // purple
      borderColor: 'rgb(139, 92, 246)',
      delay: 0.2
    },
    {
      id: 'engineering',
      label: 'Engineering',
      x: 200,
      y: 200,
      labelX: 220,
      labelY: 240,
      color: 'rgba(34, 197, 94, 0.25)', // emerald
      borderColor: 'rgb(34, 197, 94)',
      delay: 0.4
    },
    {
      id: 'arts',
      label: 'Arts',
      x: 100,
      y: 200,
      labelX: 70,
      labelY: 240,
      color: 'rgba(251, 146, 60, 0.25)', // coral
      borderColor: 'rgb(251, 146, 60)',
      delay: 0.6
    },
    {
      id: 'math',
      label: 'Mathematics',
      x: 80,
      y: 120,
      labelX: 50,
      labelY: 100,
      color: 'rgba(251, 191, 36, 0.25)', // amber
      borderColor: 'rgb(251, 191, 36)',
      delay: 0.8
    }
  ];

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background subtle glow */}
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </radialGradient>
        </defs>

        {/* STEAM Circles - always visible with color */}
        {circles.map((circle) => (
          <g key={circle.id}>
            {/* Main circle */}
            <motion.circle
              cx={circle.x}
              cy={circle.y}
              r="80"
              fill={circle.color}
              stroke={circle.borderColor}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{
                scale: hoveredCircle === circle.id ? 1.1 : 1
              }}
              transition={{
                scale: {
                  duration: 0.3
                },
                default: {
                  duration: 0.8,
                  delay: circle.delay
                }
              }}
              onMouseEnter={() => setHoveredCircle(circle.id)}
              onMouseLeave={() => setHoveredCircle(null)}
              style={{ cursor: 'pointer', mixBlendMode: 'multiply' }}
              className="dark:mix-blend-screen"
            />

            {/* Label - positioned to avoid overlap with Alf center */}
            <motion.text
              x={circle.labelX}
              y={circle.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={circle.borderColor}
              className="text-sm font-semibold pointer-events-none select-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: hoveredCircle === circle.id ? 1 : 0.7,
                scale: hoveredCircle === circle.id ? 1.1 : 1
              }}
              transition={{ duration: 0.3, delay: circle.delay + 0.3 }}
            >
              {circle.label}
            </motion.text>
          </g>
        ))}

        {/* Center intersection - Alf */}
        <motion.g>
          {/* Glowing background for center */}
          <motion.circle
            cx="150"
            cy="150"
            r="35"
            fill="url(#centerGlow)"
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Alf center circle */}
          <motion.circle
            cx="150"
            cy="150"
            r="25"
            fill="white"
            stroke="rgb(99, 102, 241)"
            strokeWidth="3"
            className="dark:fill-slate-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 1,
              type: "spring",
              stiffness: 200
            }}
          />

          {/* Alf text */}
          <motion.text
            x="150"
            y="155"
            textAnchor="middle"
            className="fill-primary-600 dark:fill-primary-400 text-lg font-bold font-sans pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            Alf
          </motion.text>
        </motion.g>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60) * Math.PI / 180;
          const radius = 90;

          return (
            <motion.circle
              key={i}
              r="2"
              className="fill-primary-400/60 dark:fill-primary-300/60 pointer-events-none"
              animate={{
                cx: [
                  150 + Math.cos(angle) * 30,
                  150 + Math.cos(angle) * radius,
                  150 + Math.cos(angle) * 30
                ],
                cy: [
                  150 + Math.sin(angle) * 30,
                  150 + Math.sin(angle) * radius,
                  150 + Math.sin(angle) * 30
                ],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default STEAMVennDiagram;