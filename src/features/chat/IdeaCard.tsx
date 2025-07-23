import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, LightbulbIcon, RefreshIcon } from '../../components/icons/ButtonIcons';

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
    sparkles: SparklesIcon,
    lightbulb: LightbulbIcon,
    beaker: RefreshIcon
  };
  
  const Icon = icons[icon];
  
  const variants = {
    primary: {
      base: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      icon: 'text-purple-600 bg-purple-100',
      title: 'text-purple-900',
      description: 'text-gray-700'
    },
    secondary: {
      base: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      icon: 'text-blue-600 bg-blue-100',
      title: 'text-blue-900',
      description: 'text-gray-700'
    }
  };
  
  const styles = variants[variant];
  
  return (
    <motion.button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-lg border text-left
        transition-all duration-300 transform hover:scale-[1.005]
        hover:shadow-md cursor-pointer
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