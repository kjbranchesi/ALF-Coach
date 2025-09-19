import React from 'react';
import { motion } from 'framer-motion';

const STEAMVennDiagram = () => {
  // Five circles arranged in a pentagram pattern for STEAM
  const circles = [
    {
      id: 'science',
      label: 'Science',
      x: 150,
      y: 80,
      color: 'rgba(59, 130, 246, 0.3)', // blue
      borderColor: 'rgb(59, 130, 246)',
      delay: 0
    },
    {
      id: 'technology',
      label: 'Technology',
      x: 220,
      y: 120,
      color: 'rgba(139, 92, 246, 0.3)', // purple
      borderColor: 'rgb(139, 92, 246)',
      delay: 0.2
    },
    {
      id: 'engineering',
      label: 'Engineering',
      x: 200,
      y: 200,
      color: 'rgba(34, 197, 94, 0.3)', // emerald
      borderColor: 'rgb(34, 197, 94)',
      delay: 0.4
    },
    {
      id: 'arts',
      label: 'Arts',
      x: 100,
      y: 200,
      color: 'rgba(251, 146, 60, 0.3)', // coral
      borderColor: 'rgb(251, 146, 60)',
      delay: 0.6
    },
    {
      id: 'math',
      label: 'Math',
      x: 80,
      y: 120,
      color: 'rgba(251, 191, 36, 0.3)', // amber
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

          {/* Define blend mode for overlapping areas */}
          <filter id="blend">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* STEAM Circles */}
        <g style={{ mixBlendMode: 'multiply' }} className="dark:mix-blend-screen">
          {circles.map((circle) => (
            <motion.g key={circle.id}>
              {/* Main circle */}
              <motion.circle
                cx={circle.x}
                cy={circle.y}
                r="80"
                fill={circle.color}
                stroke={circle.borderColor}
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: 1
                }}
                transition={{
                  scale: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: circle.delay
                  },
                  opacity: {
                    duration: 0.8,
                    delay: circle.delay
                  }
                }}
              />

              {/* Circle label - always visible */}
              <text
                x={circle.x}
                y={circle.y - 50}
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 text-sm font-semibold"
                opacity="0.9"
              >
                {circle.label}
              </text>
            </motion.g>
          ))}
        </g>

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
            className="fill-primary-600 dark:fill-primary-400 text-lg font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            Alf
          </motion.text>
        </motion.g>

        {/* Floating particles connecting the circles */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const startRadius = 30;
          const endRadius = 100;

          return (
            <motion.circle
              key={i}
              r="2"
              className="fill-primary-400/60 dark:fill-primary-300/60"
              animate={{
                cx: [
                  150 + Math.cos(angle) * startRadius,
                  150 + Math.cos(angle) * endRadius,
                  150 + Math.cos(angle) * startRadius
                ],
                cy: [
                  150 + Math.sin(angle) * startRadius,
                  150 + Math.sin(angle) * endRadius,
                  150 + Math.sin(angle) * startRadius
                ],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Subtle rotating accent */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: "150px 150px" }}
        >
          <circle
            cx="150"
            cy="50"
            r="3"
            className="fill-primary-300/40"
          />
        </motion.g>
      </svg>

    </div>
  );
};

export default STEAMVennDiagram;