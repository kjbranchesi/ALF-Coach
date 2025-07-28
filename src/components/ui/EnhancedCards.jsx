import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, Sparkles } from 'lucide-react';

export const StageCard = ({ 
  stage, 
  isActive, 
  isCompleted, 
  isLocked, 
  onClick,
  progress = 0 
}) => {
  const getStatusIcon = () => {
    if (isCompleted) {return <CheckCircle className="w-6 h-6 text-green-500" />;}
    if (isLocked) {return <Lock className="w-6 h-6 text-gray-400" />;}
    if (isActive) {return <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />;}
    return <Circle className="w-6 h-6 text-gray-300" />;
  };

  const getCardStyles = () => {
    if (isActive) {return 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50';}
    if (isCompleted) {return 'border-green-500 bg-green-50';}
    if (isLocked) {return 'border-gray-300 bg-gray-50 opacity-60';}
    return 'border-gray-300 hover:border-gray-400';
  };

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${getCardStyles()}`}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">{stage.title}</h3>
          {getStatusIcon()}
        </div>
        
        <p className="text-gray-600 mb-4">{stage.description}</p>
        
        {isActive && progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
        
        {isCompleted && (
          <div className="mt-4 text-sm text-green-600 font-medium">
            ✓ Completed
          </div>
        )}
        
        {isLocked && (
          <div className="mt-4 text-sm text-gray-500">
            Complete previous stages to unlock
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ConversationCard = ({ 
  message, 
  isUser, 
  timestamp,
  isTyping = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isTyping ? (
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        {timestamp && (
          <p className="text-xs text-gray-500 mt-1 px-1">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const ProgressCard = ({ 
  title, 
  value, 
  maxValue, 
  icon: Icon,
  color = 'blue' 
}) => {
  const percentage = (value / maxValue) * 100;
  
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-500',
    green: 'bg-green-500 text-green-500',
    purple: 'bg-purple-500 text-purple-500',
    orange: 'bg-orange-500 text-orange-500'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-800">{title}</h4>
        {Icon && <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />}
      </div>
      
      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">/ {maxValue}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colorClasses[color].split(' ')[0]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'blue',
  disabled = false 
}) => {
  const colorClasses = {
    blue: 'hover:border-blue-500 hover:bg-blue-50 text-blue-600',
    green: 'hover:border-green-500 hover:bg-green-50 text-green-600',
    purple: 'hover:border-purple-500 hover:bg-purple-50 text-purple-600',
    orange: 'hover:border-orange-500 hover:bg-orange-50 text-orange-600'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`w-full p-6 rounded-lg border-2 border-gray-200 text-left transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${colorClasses[color]}`
      }`}
    >
      <div className="flex items-start">
        {Icon && (
          <div className={`mr-4 ${disabled ? 'text-gray-400' : ''}`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

export const InsightCard = ({ 
  insight, 
  type = 'info' 
}) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    tip: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const typeIcons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    tip: '💫'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${typeStyles[type]}`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3">{typeIcons[type]}</span>
        <div className="flex-1">
          <p className="text-sm">{insight}</p>
        </div>
      </div>
    </motion.div>
  );
};