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
      base: 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100',
      icon: 'text-purple-600 bg-purple-100',
      title: 'text-purple-900',
      description: 'text-gray-700'
    },
    secondary: {
      base: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100',
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
        w-full p-6 rounded-xl border-2 text-left
        transition-all duration-300 transform hover:scale-[1.02]
        hover:shadow-lg cursor-pointer
        ${styles.base}
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex gap-4">
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-full
          flex items-center justify-center
          ${styles.icon}
        `}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-2 ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm leading-relaxed ${styles.description}`}>
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};