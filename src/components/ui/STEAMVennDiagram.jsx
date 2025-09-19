import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEAMVennDiagram = () => {
  const [hoveredCircle, setHoveredCircle] = useState(null);

  // Five circles with how Alf enhances each STEAM field
  const circles = [
    {
      id: 'science',
      label: 'Science',
      x: 150,
      y: 80,
      color: 'rgba(59, 130, 246, 0.6)', // blue - increased opacity
      hoverColor: 'rgba(59, 130, 246, 0.85)',
      borderColor: 'rgb(59, 130, 246)',
      delay: 0,
      enhancement: 'Real-world experiments',
      detail: 'Transform textbook concepts into hands-on investigations'
    },
    {
      id: 'technology',
      label: 'Technology',
      x: 220,
      y: 120,
      color: 'rgba(139, 92, 246, 0.6)', // purple
      hoverColor: 'rgba(139, 92, 246, 0.85)',
      borderColor: 'rgb(139, 92, 246)',
      delay: 0.2,
      enhancement: 'Digital creation tools',
      detail: 'Students build apps, websites, and digital solutions'
    },
    {
      id: 'engineering',
      label: 'Engineering',
      x: 200,
      y: 200,
      color: 'rgba(34, 197, 94, 0.6)', // emerald
      hoverColor: 'rgba(34, 197, 94, 0.85)',
      borderColor: 'rgb(34, 197, 94)',
      delay: 0.4,
      enhancement: 'Design thinking process',
      detail: 'Prototype, test, and iterate real solutions'
    },
    {
      id: 'arts',
      label: 'Arts',
      x: 100,
      y: 200,
      color: 'rgba(251, 146, 60, 0.6)', // coral
      hoverColor: 'rgba(251, 146, 60, 0.85)',
      borderColor: 'rgb(251, 146, 60)',
      delay: 0.6,
      enhancement: 'Creative expression',
      detail: 'Integrate visual, performing, and media arts'
    },
    {
      id: 'math',
      label: 'Mathematics',
      x: 80,
      y: 120,
      color: 'rgba(251, 191, 36, 0.6)', // amber
      hoverColor: 'rgba(251, 191, 36, 0.85)',
      borderColor: 'rgb(251, 191, 36)',
      delay: 0.8,
      enhancement: 'Applied problem-solving',
      detail: 'Use math to solve authentic challenges'
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
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.6)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </radialGradient>

          {/* Improved blend mode for better dark mode visibility */}
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* STEAM Circles with better dark mode support */}
        <g className="mix-blend-screen">
          {circles.map((circle) => (
            <g key={circle.id}>
              {/* Glow effect for dark mode */}
              <motion.circle
                cx={circle.x}
                cy={circle.y}
                r="82"
                fill={hoveredCircle === circle.id ? circle.hoverColor : circle.color}
                filter="url(#glow)"
                opacity="0.3"
                initial={{ scale: 0 }}
                animate={{ scale: hoveredCircle === circle.id ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Main circle */}
              <motion.circle
                cx={circle.x}
                cy={circle.y}
                r="80"
                fill={hoveredCircle === circle.id ? circle.hoverColor : circle.color}
                stroke={circle.borderColor}
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: circle.delay
                }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setHoveredCircle(circle.id)}
                onMouseLeave={() => setHoveredCircle(null)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          ))}
        </g>

        {/* STEAM Labels - only show on hover */}
        <AnimatePresence>
          {circles.map((circle) => {
            const isHovered = hoveredCircle === circle.id;

            return isHovered && (
              <motion.g
                key={`label-${circle.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Label background for better readability */}
                <rect
                  x={circle.x - 60}
                  y={circle.y - 25}
                  width="120"
                  height="50"
                  fill="white"
                  fillOpacity="0.95"
                  rx="8"
                  className="dark:fill-slate-900"
                />

                {/* STEAM field name */}
                <text
                  x={circle.x}
                  y={circle.y - 8}
                  textAnchor="middle"
                  className="fill-slate-900 dark:fill-slate-100 text-sm font-bold"
                >
                  {circle.label}
                </text>

                {/* Enhancement text */}
                <text
                  x={circle.x}
                  y={circle.y + 6}
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                >
                  {circle.enhancement}
                </text>

                {/* Detail text */}
                <text
                  x={circle.x}
                  y={circle.y + 18}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400"
                  style={{ fontSize: '10px' }}
                >
                  {circle.detail.length > 30
                    ? circle.detail.substring(0, 30) + '...'
                    : circle.detail}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

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
            className="fill-primary-600 dark:fill-primary-400 text-lg font-bold pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            Alf
          </motion.text>
        </motion.g>

        {/* Connection lines that appear on hover */}
        <AnimatePresence>
          {hoveredCircle && (
            <motion.line
              x1="150"
              y1="150"
              x2={circles.find(c => c.id === hoveredCircle)?.x}
              y2={circles.find(c => c.id === hoveredCircle)?.y}
              stroke={circles.find(c => c.id === hoveredCircle)?.borderColor}
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

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

      {/* Hover instruction */}
      <motion.div
        className="absolute -bottom-8 left-0 right-0 text-center text-xs text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: hoveredCircle ? 0 : 0.6 }}
        transition={{ duration: 0.3 }}
      >
        Hover to see how Alf enhances each field
      </motion.div>
    </div>
  );
};

export default STEAMVennDiagram;