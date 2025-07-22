// ConversationButton.jsx - Standardized button component for conversational UI

import React from 'react';
import { motion } from 'framer-motion';
import { ButtonTypes, getButtonStyle } from '../features/ideation/ButtonFramework';
import * as Icons from './icons/ButtonIcons';

const ConversationButton = ({ 
  text, 
  command, 
  icon, 
  onClick, 
  disabled = false,
  type = 'neutral',
  index = 0,
  fullWidth = true
}) => {
  // Get the appropriate icon component
  const IconComponent = icon && Icons[`${icon}Icon`];
  
  // Get button style based on command or type
  const buttonStyle = command ? getButtonStyle(command) : ButtonTypes[type.toUpperCase()]?.className || ButtonTypes.NEUTRAL.className;
  
  // Remove any emoji from text
  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onClick={() => onClick(text)}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-lg
        font-medium text-sm
        transition-all duration-200
        shadow-soft hover:shadow-soft-lg
        ${buttonStyle}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      <span>{cleanText}</span>
    </motion.button>
  );
};

export default ConversationButton;