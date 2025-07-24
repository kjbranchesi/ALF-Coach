import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LottieAnimation, 
  LottieLoader, 
  LottieSuccess, 
  LottieCelebration 
} from './animations/LottieAnimation';
import { AnimatedLoader } from './animations/AnimatedLoader';
import educationAnimation from '../animations/lottie/education-icons.json';
import { Play, Pause, RotateCw, Check } from 'lucide-react';

export const AnimationShowcase = ({ onClose }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeLoader, setActiveLoader] = useState('lottie');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Animation Showcase</h2>
          
          {/* Lottie Animations Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lottie Animations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Education Animation */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="font-medium text-gray-700 mb-2">Education Icons</h4>
                <LottieAnimation
                  animationData={educationAnimation}
                  style={{ width: 120, height: 120 }}
                  className="mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">Animated lightbulb with sparkles</p>
              </div>
              
              {/* Success Animation */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="font-medium text-gray-700 mb-2">Success Check</h4>
                <LottieSuccess size={120} className="mx-auto" />
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
                >
                  <RotateCw className="w-3 h-3" /> Replay
                </button>
              </div>
              
              {/* Loader Animation */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="font-medium text-gray-700 mb-2">Loading Spinner</h4>
                <LottieLoader size={120} className="mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Continuous loading animation</p>
              </div>
            </div>
          </div>
          
          {/* Celebration Animation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Celebration Effects</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <button
                onClick={() => setShowCelebration(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Trigger Celebration
              </button>
              {showCelebration && (
                <LottieCelebration 
                  duration={3000} 
                  onComplete={() => setShowCelebration(false)}
                />
              )}
            </div>
          </div>
          
          {/* Loader Variations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Loader Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`bg-gray-50 rounded-lg p-4 text-center cursor-pointer transition-all ${
                  activeLoader === 'lottie' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveLoader('lottie')}
              >
                <AnimatedLoader type="lottie" size={60} showText={false} />
                <p className="text-sm font-medium text-gray-700 mt-2">Lottie Loader</p>
              </div>
              
              <div 
                className={`bg-gray-50 rounded-lg p-4 text-center cursor-pointer transition-all ${
                  activeLoader === 'lucide' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveLoader('lucide')}
              >
                <AnimatedLoader type="lucide" size={60} showText={false} />
                <p className="text-sm font-medium text-gray-700 mt-2">Lucide Spinner</p>
              </div>
              
              <div 
                className={`bg-gray-50 rounded-lg p-4 text-center cursor-pointer transition-all ${
                  activeLoader === 'dots' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveLoader('dots')}
              >
                <AnimatedLoader type="dots" showText={false} />
                <p className="text-sm font-medium text-gray-700 mt-2">Bouncing Dots</p>
              </div>
            </div>
          </div>
          
          {/* Interactive Animation Example */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactive Animations</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-4">
                Hover over the animation below to see interactive behavior:
              </p>
              <LottieAnimation
                animationData={educationAnimation}
                style={{ width: 150, height: 150 }}
                className="mx-auto cursor-pointer"
                interactivity={{
                  hover: true,
                  click: true
                }}
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Hover to play/pause • Click to restart
              </p>
            </div>
          </div>
          
          {/* Usage Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">Implementation Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lottie animations are JSON-based and fully customizable</li>
              <li>• Rive animations support state machines for complex interactions</li>
              <li>• All animations are optimized for performance</li>
              <li>• Easy to integrate with existing components</li>
            </ul>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close Showcase
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnimationShowcase;