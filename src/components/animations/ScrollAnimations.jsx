// ScrollAnimations.jsx - Professional scroll-triggered animations for landing pages

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useAnimation } from 'framer-motion';

/**
 * Professional Animation Variants for Educational UX
 * Inspired by Dropbox's smooth, purposeful motion design
 */
export const scrollAnimationVariants = {
  // Gentle fade up - perfect for content blocks
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 60,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }
    }
  },

  // Subtle slide from left - for framework stages
  slideLeft: {
    hidden: {
      opacity: 0,
      x: -40,
      transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
    }
  },

  // Scale emphasis - for statistics and key metrics
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
    }
  },

  // Staggered container - for card grids
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  },

  // Individual staggered items
  staggerItem: {
    hidden: {
      opacity: 0,
      y: 40,
      transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }
    }
  }
};

/**
 * Intersection Observer Hook for Scroll Triggers
 * Optimized for performance with educational content
 */
export const useScrollTrigger = (threshold = 0.1, rootMargin = "-10% 0px -10% 0px") => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    rootMargin,
    once: true // Animate only once for performance
  });

  return [ref, isInView];
};

/**
 * Scroll-Triggered Animation Wrapper
 * Professional timing suitable for educational interfaces
 */
export const ScrollReveal = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  threshold = 0.1,
  className = ''
}) => {
  const [ref, isInView] = useScrollTrigger(threshold);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scrollAnimationVariants[variant]}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered Animation Container
 * Perfect for feature cards and project showcases
 */
export const StaggeredReveal = ({ children, className = '', delay = 0 }) => {
  const [ref, isInView] = useScrollTrigger(0.1);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scrollAnimationVariants.staggerContainer}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Individual Staggered Item
 * Use within StaggeredReveal container
 */
export const StaggeredItem = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={scrollAnimationVariants.staggerItem}
    >
      {children}
    </motion.div>
  );
};

/**
 * Gentle Parallax Effect
 * Subtle background movement - professional, not distracting
 */
export const GentleParallax = ({ children, offset = 50, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -offset]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Progress-Driven Counter Animation
 * Perfect for statistics that need emphasis
 */
export const CountUp = ({
  end,
  prefix = '',
  suffix = '',
  duration = 2,
  className = ''
}) => {
  const [ref, isInView] = useScrollTrigger(0.3);
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
      });
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={controls}
    >
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration }}
        >
          {prefix}
          <motion.span
            initial={{ textContent: '0' }}
            animate={{ textContent: end }}
            transition={{
              duration,
              ease: "easeOut",
            }}
          />
          {suffix}
        </motion.span>
      )}
    </motion.div>
  );
};

/**
 * Sequential Text Reveal
 * For headlines that build narrative progression
 */
export const SequentialText = ({
  lines,
  className = '',
  lineDelay = 0.3,
  wordDelay = 0.05
}) => {
  const [ref, isInView] = useScrollTrigger(0.2);

  return (
    <div ref={ref} className={className}>
      {lines.map((line, lineIndex) => (
        <motion.div
          key={lineIndex}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: lineIndex * lineDelay }}
        >
          {line.split(' ').map((word, wordIndex) => (
            <motion.span
              key={wordIndex}
              className="inline-block mr-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                delay: (lineIndex * lineDelay) + (wordIndex * wordDelay),
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1]
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Card Hover Enhancement
 * Builds on existing hover patterns with scroll awareness
 */
export const ScrollAwareCard = ({
  children,
  className = '',
  hoverScale = 1.02,
  hoverShadow = "0 20px 40px rgba(0, 0, 0, 0.1)",
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...rest
}) => {
  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return (
    <ScrollReveal variant="staggerItem" className="h-full">
      <motion.div
        className={`h-full transform transition-all ${className}`}
        onClick={onClick}
        role={role ?? (onClick ? 'button' : undefined)}
        tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
        onKeyDown={handleKeyDown}
        whileHover={{
          scale: hoverScale,
          boxShadow: hoverShadow,
          transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        {...rest}
      >
        {children}
      </motion.div>
    </ScrollReveal>
  );
};

/**
 * Background Element Animation
 * For decorative gradients and shapes
 */
export const FloatingBackground = ({
  children,
  intensity = 20,
  duration = 8,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity, intensity, -intensity],
        x: [-intensity/2, intensity/2, -intensity/2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Performance Optimization Hook
 * Reduces animations on lower-powered devices
 */
export const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handler = () => setShouldReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return shouldReduceMotion;
};
