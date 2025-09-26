import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProjectAnimationProps {
  projectId: string;
  staticImage: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ProjectAnimation: React.FC<ProjectAnimationProps> = ({
  projectId,
  staticImage,
  title,
  className = '',
  style = {}
}) => {
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [animationError, setAnimationError] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Try to get animation from public folder (moved from utils for Vite compatibility)
  const getAnimationPath = (id: string) => {
    // Convert projectId to match animation filename
    // e.g., 'hero-community-history' -> 'LivingHistoryPreservingCommunityStories'
    const animationMap: { [key: string]: string } = {
      'hero-community-history': 'LivingHistoryPreservingCommunityStories'
      // Add more mappings as you create animations
    };

    const animationName = animationMap[id];
    if (!animationName) {
      return null;
    }

    // Use public folder for video files (Vite friendly)
    return `/animations/${animationName}.webm`;
  };

  const animationPath = getAnimationPath(projectId);

  useEffect(() => {
    if (!animationPath) {
      setAnimationError(true);
      return;
    }

    // Create a new video element to test if animation exists
    const testVideo = document.createElement('video');
    testVideo.src = animationPath;

    testVideo.onloadeddata = () => {
      setAnimationLoaded(true);
      setShowAnimation(true);
    };

    testVideo.onerror = () => {
      console.log(`Animation not found for ${projectId}, using static image`);
      setAnimationError(true);
    };

    // Start loading
    testVideo.load();

    return () => {
      testVideo.onloadeddata = null;
      testVideo.onerror = null;
    };
  }, [animationPath, projectId]);

  if (animationError || !animationPath) {
    // Fallback to static image
    return (
      <img
        src={staticImage}
        alt={title}
        className={className}
        style={style}
        loading="eager"
      />
    );
  }

  return (
    <div className="relative">
      {/* Static image shown first */}
      <motion.img
        src={staticImage}
        alt={title}
        className={`${className} transition-opacity duration-500 ${showAnimation ? 'opacity-0' : 'opacity-100'}`}
        style={style}
        loading="eager"
      />

      {/* Animation overlay */}
      {animationLoaded && showAnimation && (
        <motion.video
          ref={videoRef}
          src={animationPath}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 ${className} transition-opacity duration-500`}
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onError={() => {
            console.log('Video playback error, falling back to static image');
            setShowAnimation(false);
            setAnimationError(true);
          }}
        />
      )}
    </div>
  );
};
