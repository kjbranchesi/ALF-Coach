import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Users, Rocket, Brain, Palette, Calculator, Beaker, Globe } from 'lucide-react';

const TransformationAnimation = () => {
  const icons = [
    { Icon: Calculator, color: 'rgb(99, 102, 241)' },
    { Icon: Beaker, color: 'rgb(34, 197, 94)' },
    { Icon: Globe, color: 'rgb(251, 146, 60)' },
    { Icon: BookOpen, color: 'rgb(139, 92, 246)' },
    { Icon: Palette, color: 'rgb(251, 191, 36)' },
    { Icon: Lightbulb, color: 'rgb(59, 130, 246)' },
    { Icon: Users, color: 'rgb(236, 72, 153)' },
    { Icon: Brain, color: 'rgb(168, 85, 247)' },
    { Icon: Rocket, color: 'rgb(14, 165, 233)' },
  ];

  const elements = icons.map((icon, id) => ({ ...icon, id }));

  const getPosition = (element) => {
    const centerX = 192;
    const centerY = 192;
    const radius = 120;
    const angle = (element.id * (360 / elements.length)) * Math.PI / 180;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 384 384" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="bgGradient">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="192"
          cy="192"
          r="180"
          fill="url(#bgGradient)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '192px 192px' }}
        >
          {elements.map((element) => {
            const position = getPosition(element);
            const Icon = element.Icon;

            return (
              <motion.g key={element.id}>
                <motion.circle
                  cx={position.x}
                  cy={position.y}
                  r="25"
                  fill={element.color}
                  opacity="0.12"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.1, 0.18, 0.1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: element.id * 0.1 }}
                />

                <motion.foreignObject
                  x={position.x - 18}
                  y={position.y - 18}
                  width="36"
                  height="36"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: element.id * 0.08 }}
                >
                  <div
                    className="w-full h-full rounded-full bg-white shadow-md flex items-center justify-center"
                    style={{ color: element.color }}
                  >
                    <Icon size={18} />
                  </div>
                </motion.foreignObject>
              </motion.g>
            );
          })}
        </motion.g>
      </svg>
    </div>
  );
};

export default TransformationAnimation;
