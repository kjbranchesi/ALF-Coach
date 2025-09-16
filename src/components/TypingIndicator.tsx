import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function TypingIndicator({ size = 'medium', color = 'currentColor' }: TypingIndicatorProps) {
  const dotSize = size === 'small' ? 6 : size === 'large' ? 10 : 8;
  const spacing = size === 'small' ? 12 : size === 'large' ? 20 : 16;
  
  return (
    <div className="flex items-center space-x-1" style={{ gap: `${spacing * 0.25}px` }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="rounded-full"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -dotSize, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function TypingBubble({ userName = "ALF" }: { userName?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
        {userName.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1">{userName} is typing...</div>
        <div className="inline-flex items-center px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
          <TypingIndicator color="var(--gray-500)" />
        </div>
      </div>
    </div>
  );
}