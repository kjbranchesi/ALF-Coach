import React from 'react';
import { LottieLoader } from './LottieAnimation';
import { Loader2 } from 'lucide-react';

export const AnimatedLoader = ({ 
  type = 'lottie', // 'lottie', 'lucide', 'dots'
  size = 40,
  className = '',
  text = 'Loading...',
  showText = true
}) => {
  if (type === 'lottie') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <LottieLoader size={size} />
        {showText && (
          <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (type === 'lucide') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <Loader2 className="icon-spin text-blue-600" style={{ width: size, height: size }} />
        {showText && (
          <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Dots loader
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
      {showText && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default AnimatedLoader;