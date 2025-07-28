import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

// Wrapper component for Lottie animations with enhanced features
export const LottieAnimation = ({ 
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style = {},
  onComplete,
  speed = 1,
  direction = 1,
  segments,
  interactivity,
  ...props
}) => {
  const lottieRef = React.useRef();

  // Handle interactive behaviors
  React.useEffect(() => {
    if (lottieRef.current && interactivity) {
      const animation = lottieRef.current;
      
      if (interactivity.hover) {
        animation.addEventListener('mouseenter', () => animation.play());
        animation.addEventListener('mouseleave', () => animation.pause());
      }
      
      if (interactivity.click) {
        animation.addEventListener('click', () => {
          animation.stop();
          animation.play();
        });
      }
    }
  }, [interactivity]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={style}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        speed={speed}
        direction={direction}
        segments={segments}
        {...props}
      />
    </motion.div>
  );
};

// Preloader animation component
export const LottieLoader = ({ size = 100, className = '' }) => {
  // Using a simple loading animation data inline
  const loadingAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [{
          d: 1,
          ty: "el",
          s: { a: 0, k: [60, 60] },
          p: { a: 0, k: [0, 0] }
        }, {
          ty: "st",
          c: { a: 0, k: [0.4, 0.2, 0.8, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 1,
          ml: 10,
          bm: 0,
          d: [{
            n: "d",
            nm: "dash",
            v: { a: 0, k: 30 }
          }, {
            n: "g",
            nm: "gap",
            v: { a: 0, k: 70 }
          }]
        }, {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 }
        }]
      }]
    }]
  };

  return (
    <LottieAnimation
      animationData={loadingAnimation}
      style={{ width: size, height: size }}
      className={className}
    />
  );
};

// Success checkmark animation
export const LottieSuccess = ({ size = 100, onComplete, className = '' }) => {
  const successAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 30,
    w: 100,
    h: 100,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [120, 120, 100] },
          { t: 15, s: [120, 120, 100], e: [100, 100, 100] },
          { t: 30, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [{
          ind: 0,
          ty: "sh",
          ks: {
            a: 0,
            k: {
              i: [[0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0]],
              v: [[-20, 0], [-5, 15], [20, -10]],
              c: false
            }
          }
        }, {
          ty: "st",
          c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 6 },
          lc: 2,
          lj: 2,
          bm: 0
        }, {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 }
        }]
      }]
    }]
  };

  return (
    <LottieAnimation
      animationData={successAnimation}
      loop={false}
      style={{ width: size, height: size }}
      className={className}
      onComplete={onComplete}
    />
  );
};

// Celebration confetti animation
export const LottieCelebration = ({ className = '', duration = 3000 }) => {
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) {return null;}

  // Simplified confetti animation
  const confettiAnimation = {
    v: "5.5.7",
    fr: 60,
    ip: 0,
    op: 180,
    w: 400,
    h: 400,
    nm: "Confetti",
    ddd: 0,
    assets: [],
    layers: Array.from({ length: 20 }, (_, i) => ({
      ddd: 0,
      ind: i + 1,
      ty: 4,
      nm: `Particle ${i}`,
      sr: 1,
      ks: {
        o: { a: 1, k: [
          { t: 0, s: [100], e: [100] },
          { t: 150, s: [100], e: [0] },
          { t: 180, s: [0] }
        ]},
        r: { a: 1, k: [{ t: 0, s: [0], e: [360 * (i % 2 === 0 ? 1 : -1)] }, { t: 180, s: [360 * (i % 2 === 0 ? 1 : -1)] }] },
        p: { a: 1, k: [
          { t: 0, s: [200, 400, 0], e: [200 + (Math.random() - 0.5) * 300, -50, 0] },
          { t: 180, s: [200 + (Math.random() - 0.5) * 300, -50, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [{
          ty: "rc",
          d: 1,
          s: { a: 0, k: [10, 15] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 3 }
        }, {
          ty: "fl",
          c: { a: 0, k: [
            [1, 0.4, 0.4, 1],
            [0.4, 0.4, 1, 1],
            [1, 1, 0.4, 1],
            [0.4, 1, 0.4, 1],
            [1, 0.4, 1, 1]
          ][i % 5] },
          o: { a: 0, k: 100 }
        }, {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 }
        }]
      }]
    }))
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <LottieAnimation
        animationData={confettiAnimation}
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieAnimation;