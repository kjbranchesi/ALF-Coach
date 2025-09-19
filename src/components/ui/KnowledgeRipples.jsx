import React from 'react';
import { motion } from 'framer-motion';

const KnowledgeRipples = () => {
  // Multiple ripple waves for depth
  const ripples = [
    { id: 1, delay: 0, duration: 4, maxScale: 3 },
    { id: 2, delay: 1, duration: 4, maxScale: 3 },
    { id: 3, delay: 2, duration: 4, maxScale: 3 },
    { id: 4, delay: 3, duration: 4, maxScale: 3 },
  ];

  return (
    <div className="relative w-[500px] h-[500px] md:w-[600px] md:h-[600px] mx-auto">
      {/* Position ripples to expand behind text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            {/* Gradient for ripples - Alf blue */}
            <radialGradient id="rippleGradient">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(96, 165, 250)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(147, 197, 253)" stopOpacity="0" />
            </radialGradient>

            {/* Secondary gradient for variety */}
            <radialGradient id="rippleGradient2">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(129, 140, 248)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(165, 180, 252)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Main ripples */}
          {ripples.map((ripple) => (
            <motion.circle
              key={ripple.id}
              cx="200"
              cy="200"
              r="40"
              fill="none"
              stroke="url(#rippleGradient)"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: ripple.maxScale,
                opacity: [0, 0.8, 0.6, 0.3, 0],
                strokeWidth: [2, 1.5, 1, 0.5, 0.2]
              }}
              transition={{
                duration: ripple.duration,
                delay: ripple.delay,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{ transformOrigin: "200px 200px" }}
            />
          ))}

          {/* Secondary ripples for depth */}
          {ripples.map((ripple) => (
            <motion.circle
              key={`secondary-${ripple.id}`}
              cx="200"
              cy="200"
              r="30"
              fill="none"
              stroke="url(#rippleGradient2)"
              strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: ripple.maxScale * 1.1,
                opacity: [0, 0.6, 0.4, 0.2, 0],
                strokeWidth: [1.5, 1, 0.5, 0.3, 0.1]
              }}
              transition={{
                duration: ripple.duration,
                delay: ripple.delay + 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{ transformOrigin: "200px 200px" }}
            />
          ))}

          {/* Filled ripples for subtle background effect */}
          {ripples.map((ripple) => (
            <motion.circle
              key={`filled-${ripple.id}`}
              cx="200"
              cy="200"
              r="50"
              fill="url(#rippleGradient)"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: ripple.maxScale * 0.9,
                opacity: [0, 0.2, 0.1, 0.05, 0]
              }}
              transition={{
                duration: ripple.duration * 1.2,
                delay: ripple.delay + 0.25,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{ transformOrigin: "200px 200px" }}
            />
          ))}

          {/* Central Alf core */}
          <motion.g>
            {/* Outer glow */}
            <motion.circle
              cx="200"
              cy="200"
              r="25"
              fill="rgb(59, 130, 246)"
              opacity="0.3"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "200px 200px" }}
            />

            {/* Inner core */}
            <motion.circle
              cx="200"
              cy="200"
              r="15"
              fill="rgb(59, 130, 246)"
              opacity="0.8"
              animate={{
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "200px 200px" }}
            />

            {/* Center highlight */}
            <circle
              cx="200"
              cy="200"
              r="8"
              fill="white"
              opacity="0.9"
            />
          </motion.g>

          {/* Subtle particle field */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const radius = 60 + Math.random() * 40;

            return (
              <motion.circle
                key={`particle-${i}`}
                r="1.5"
                fill="rgb(147, 197, 253)"
                animate={{
                  cx: [
                    200 + Math.cos(angle) * 20,
                    200 + Math.cos(angle) * radius * 2.5,
                    200 + Math.cos(angle) * 20
                  ],
                  cy: [
                    200 + Math.sin(angle) * 20,
                    200 + Math.sin(angle) * radius * 2.5,
                    200 + Math.sin(angle) * 20
                  ],
                  opacity: [0, 0.7, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Subtle gradient overlay for depth */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(59, 130, 246, 0.05) 100%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default KnowledgeRipples;