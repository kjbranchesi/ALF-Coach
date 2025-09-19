import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Users, Rocket, Brain, Palette, Calculator, Beaker, Globe } from 'lucide-react';

const TransformationAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Cycle through transformation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % 2); // Just 2 phases now
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Educational icons to represent different subjects
  const icons = [
    { Icon: Calculator, color: 'rgb(99, 102, 241)' }, // Math - blue
    { Icon: Beaker, color: 'rgb(34, 197, 94)' }, // Science - emerald
    { Icon: Globe, color: 'rgb(251, 146, 60)' }, // Social Studies - coral
    { Icon: BookOpen, color: 'rgb(139, 92, 246)' }, // English - purple
    { Icon: Palette, color: 'rgb(251, 191, 36)' }, // Art - amber
    { Icon: Lightbulb, color: 'rgb(59, 130, 246)' }, // Ideas - sky blue
    { Icon: Users, color: 'rgb(236, 72, 153)' }, // Collaboration - pink
    { Icon: Brain, color: 'rgb(168, 85, 247)' }, // Critical Thinking - violet
    { Icon: Rocket, color: 'rgb(14, 165, 233)' } // Innovation - sky
  ];

  // Create elements for animation
  const elements = icons.map((icon, i) => ({
    ...icon,
    id: i
  }));

  const getPosition = (element, phase) => {
    const centerX = 192;
    const centerY = 192;

    if (phase === 0) {
      // Traditional: Disconnected grid of subjects
      const gridSize = 3;
      const spacing = 80;
      const row = Math.floor(element.id / gridSize);
      const col = element.id % gridSize;

      // Center the grid
      const offsetX = -(gridSize - 1) * spacing / 2;
      const offsetY = -(gridSize - 1) * spacing / 2;

      return {
        x: centerX + col * spacing + offsetX,
        y: centerY + row * spacing + offsetY,
        scale: 0.9,
        opacity: 0.7,
        rotation: 0
      };
    } else {
      // Collaborative: All subjects spinning around central "Alf"
      const radius = 120;
      const angle = (element.id * (360 / elements.length) + phase * 180) * Math.PI / 180;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        scale: 1,
        opacity: 1,
        rotation: -angle * 180 / Math.PI // Keep icons upright
      };
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 384 384"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGradient">
            <stop offset="0%" stopColor={currentPhase === 0 ? 'rgba(148, 163, 184, 0.05)' : 'rgba(99, 102, 241, 0.1)'} />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="192"
          cy="192"
          r="180"
          fill="url(#bgGradient)"
          animate={{
            scale: currentPhase === 0 ? 1 : [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: currentPhase === 1 ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Connection lines when in collaborative mode */}
        {currentPhase === 1 && (
          <g>
            {elements.map((element) => {
              const pos = getPosition(element, 1);
              return (
                <motion.line
                  key={`line-${element.id}`}
                  x1="192"
                  y1="192"
                  x2={pos.x}
                  y2={pos.y}
                  stroke={element.color}
                  strokeOpacity="0.15"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.15 }}
                  transition={{ duration: 1 }}
                />
              );
            })}
          </g>
        )}

        {/* Icons representing different subjects */}
        {elements.map((element) => {
          const position = getPosition(element, currentPhase);
          const Icon = element.Icon;

          return (
            <motion.g key={element.id}>
              {/* Glow effect */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="25"
                fill={element.color}
                opacity="0.1"
                animate={{
                  scale: currentPhase === 1 ? [1, 1.2, 1] : 1,
                  opacity: currentPhase === 1 ? [0.1, 0.15, 0.1] : 0.05
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: element.id * 0.2,
                  ease: "easeInOut"
                }}
              />

              {/* Background circle for icon */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="20"
                fill="white"
                stroke={element.color}
                strokeWidth="2"
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
                className="dark:fill-slate-800"
              />

              {/* Icon */}
              <motion.g
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
              >
                <Icon
                  x={position.x - 12}
                  y={position.y - 12}
                  width={24}
                  height={24}
                  color={element.color}
                  strokeWidth={2}
                />
              </motion.g>
            </motion.g>
          );
        })}

        {/* Central Alf circle when in collaborative mode */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: currentPhase === 1 ? 1 : 0,
            opacity: currentPhase === 1 ? 1 : 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          {/* Glowing background for center */}
          <motion.circle
            cx="192"
            cy="192"
            r="40"
            fill="url(#centerGlow)"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </radialGradient>
          </defs>

          {/* Alf center circle */}
          <circle
            cx="192"
            cy="192"
            r="32"
            fill="white"
            stroke="rgb(99, 102, 241)"
            strokeWidth="3"
            className="dark:fill-slate-900"
          />

          {/* Alf text */}
          <text
            x="192"
            y="200"
            textAnchor="middle"
            className="fill-primary-600 dark:fill-primary-400 text-2xl font-bold font-sans pointer-events-none"
          >
            Alf
          </text>
        </motion.g>

        {/* Rotating ring when in collaborative mode */}
        {currentPhase === 1 && (
          <motion.circle
            cx="192"
            cy="192"
            r="145"
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 8"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: "192px 192px" }}
          />
        )}
      </svg>

      {/* Phase indicators with labels */}
      <div className="absolute bottom-0 w-full flex justify-center gap-6 px-4">
        {[
          { phase: 0, label: 'Disconnected', color: 'rgb(148, 163, 184)' },
          { phase: 1, label: 'Connected with Alf', color: 'rgb(99, 102, 241)' }
        ].map(({ phase, label, color }) => (
          <div key={phase} className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                scale: currentPhase === phase ? 1.5 : 1,
                opacity: currentPhase === phase ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
            />
            <span
              className="text-xs font-medium transition-opacity duration-300"
              style={{
                color: currentPhase === phase ? color : 'rgb(148, 163, 184)',
                opacity: currentPhase === phase ? 1 : 0.5
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransformationAnimation;