import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TransformationAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Cycle through transformation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Create grid of dots for visualization
  const gridSize = 5;
  const dots = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      dots.push({ id: `${i}-${j}`, row: i, col: j });
    }
  }

  const getPosition = (dot, phase) => {
    const centerX = 192;
    const centerY = 192;
    const spacing = 50;

    if (phase === 0) {
      // Traditional: Rigid grid
      return {
        x: (dot.col - 2) * spacing + centerX,
        y: (dot.row - 2) * spacing + centerY,
        scale: 1,
        opacity: 0.4
      };
    } else if (phase === 1) {
      // Transforming: Starting to move
      const offset = Math.sin(dot.row + dot.col) * 15;
      return {
        x: (dot.col - 2) * spacing + centerX + offset,
        y: (dot.row - 2) * spacing + centerY + offset,
        scale: 1.2,
        opacity: 0.6
      };
    } else {
      // Project-Based: Dynamic clusters
      const angle = (dot.row * 72 + dot.col * 30) * Math.PI / 180;
      const radius = 80 + (dot.row % 3) * 40;
      const cluster = dot.row % 3;
      const clusterOffset = cluster * 120;

      return {
        x: centerX + Math.cos(angle + clusterOffset) * radius,
        y: centerY + Math.sin(angle + clusterOffset) * radius,
        scale: 1.5,
        opacity: 0.8
      };
    }
  };

  const getColor = (dot, phase) => {
    if (phase === 0) return 'rgb(148, 163, 184)'; // slate
    if (phase === 1) return 'rgb(99, 102, 241)'; // primary

    // Project-Based: Different colors for different clusters
    const cluster = dot.row % 3;
    const colors = [
      'rgb(251, 146, 60)', // coral
      'rgb(59, 130, 246)', // blue
      'rgb(34, 197, 94)'   // emerald
    ];
    return colors[cluster];
  };

  // Connection lines for project-based phase
  const getConnections = () => {
    if (currentPhase !== 2) return [];

    const connections = [];
    // Create some sample connections between dots
    for (let i = 0; i < 8; i++) {
      const from = dots[Math.floor(Math.random() * dots.length)];
      const to = dots[Math.floor(Math.random() * dots.length)];
      const fromPos = getPosition(from, 2);
      const toPos = getPosition(to, 2);

      connections.push({
        id: `conn-${i}`,
        x1: fromPos.x,
        y1: fromPos.y,
        x2: toPos.x,
        y2: toPos.y
      });
    }
    return connections;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 384 384"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background subtle gradient */}
        <defs>
          <radialGradient id="bgGradient">
            <stop offset="0%" stopColor={currentPhase === 0 ? 'rgba(148, 163, 184, 0.05)' : currentPhase === 1 ? 'rgba(99, 102, 241, 0.05)' : 'rgba(251, 146, 60, 0.05)'} />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="192"
          cy="192"
          r="180"
          fill="url(#bgGradient)"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Connection lines for project-based phase */}
        {currentPhase === 2 && (
          <g>
            {getConnections().map((conn) => (
              <motion.line
                key={conn.id}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1 }}
              />
            ))}
          </g>
        )}

        {/* Dots representing students/elements */}
        {dots.map((dot) => {
          const position = getPosition(dot, currentPhase);
          const color = getColor(dot, currentPhase);

          return (
            <motion.g key={dot.id}>
              {/* Outer glow */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="12"
                fill={color}
                opacity="0.1"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: dot.row * 0.1 + dot.col * 0.1,
                  ease: "easeInOut"
                }}
              />

              {/* Main dot */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="4"
                fill={color}
                animate={{
                  x: position.x - 192,
                  y: position.y - 192,
                  scale: position.scale,
                  opacity: position.opacity
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
          );
        })}

        {/* Central focus point */}
        <motion.circle
          cx="192"
          cy="192"
          r="3"
          fill={currentPhase === 0 ? 'rgb(148, 163, 184)' : currentPhase === 1 ? 'rgb(99, 102, 241)' : 'rgb(251, 146, 60)'}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0.4, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Phase indicator rings */}
        <motion.circle
          cx="192"
          cy="192"
          r={currentPhase === 0 ? 100 : currentPhase === 1 ? 120 : 140}
          fill="none"
          stroke={currentPhase === 0 ? 'rgba(148, 163, 184, 0.2)' : currentPhase === 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(251, 146, 60, 0.2)'}
          strokeWidth="1"
          strokeDasharray="4 8"
          animate={{
            rotate: currentPhase === 2 ? 360 : 0
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: "192px 192px" }}
        />
      </svg>

      {/* Minimal phase indicators at bottom */}
      <div className="absolute bottom-4 flex justify-center gap-2">
        {[0, 1, 2].map((phase) => (
          <motion.div
            key={phase}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: phase === 0 ? 'rgb(148, 163, 184)' : phase === 1 ? 'rgb(99, 102, 241)' : 'rgb(251, 146, 60)',
            }}
            animate={{
              scale: currentPhase === phase ? 1.5 : 1,
              opacity: currentPhase === phase ? 1 : 0.3
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default TransformationAnimation;