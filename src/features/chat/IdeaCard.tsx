import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Beaker } from 'lucide-react';

interface IdeaCardProps {
  title: string;
  description: string;
  onSelect: () => void;
  icon?: 'sparkles' | 'lightbulb' | 'beaker';
  variant?: 'primary' | 'secondary';
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  title, 
  description, 
  onSelect, 
  icon = 'sparkles',
  variant = 'primary' 
}) => {
  const icons = {
    sparkles: Sparkles,
    lightbulb: Lightbulb,
    beaker: Beaker
  };
  
  const Icon = icons[icon];
  
  const variants = {
    primary: {
      base: 'soft-card hover:shadow-soft-lg',
      icon: 'text-purple-600 bg-purple-100 shadow-soft-sm',
      title: 'text-purple-900',
      description: 'text-gray-700'
    },
    secondary: {
      base: 'soft-card hover:shadow-soft-lg',
      icon: 'text-blue-600 bg-blue-100 shadow-soft-sm',
      title: 'text-blue-900',
      description: 'text-gray-700'
    }
  };
  
  const styles = variants[variant];
  
  return (
    <motion.button
      onClick={onSelect}
      className={`
        w-full p-4 soft-rounded text-left
        soft-transition hover:lift cursor-pointer
        ${styles.base}
      `}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex gap-3 items-center">
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full
          flex items-center justify-center
          ${styles.icon}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-base ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm leading-snug mt-0.5 ${styles.description}`}>
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};