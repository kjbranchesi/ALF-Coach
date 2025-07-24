import React from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { motion } from 'framer-motion';

// Wrapper component for Rive animations with enhanced features
export const RiveAnimation = ({
  src,
  stateMachines,
  animations,
  artboard,
  autoplay = true,
  className = '',
  style = {},
  fit = Fit.Contain,
  alignment = Alignment.Center,
  onLoad,
  onPlay,
  onPause,
  onStop,
  onStateChange,
  interactive = true,
  ...props
}) => {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines,
    animations,
    artboard,
    autoplay,
    onLoad,
    onPlay,
    onPause,
    onStop,
    onStateChange,
    ...props
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
      style={{ ...style, position: 'relative' }}
    >
      <RiveComponent 
        style={{ width: '100%', height: '100%' }}
        fit={fit}
        alignment={alignment}
      />
    </motion.div>
  );
};

// Interactive button with Rive animation
export const RiveButton = ({
  src,
  stateMachine = 'State Machine 1',
  onClick,
  children,
  className = '',
  disabled = false,
  hoverInputName = 'hover',
  pressInputName = 'press',
  ...props
}) => {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
  });

  const hoverInput = useStateMachineInput(rive, stateMachine, hoverInputName);
  const pressInput = useStateMachineInput(rive, stateMachine, pressInputName);

  const handleMouseEnter = () => {
    if (hoverInput && !disabled) {
      hoverInput.value = true;
    }
  };

  const handleMouseLeave = () => {
    if (hoverInput && !disabled) {
      hoverInput.value = false;
    }
  };

  const handleMouseDown = () => {
    if (pressInput && !disabled) {
      pressInput.value = true;
    }
  };

  const handleMouseUp = () => {
    if (pressInput && !disabled) {
      pressInput.value = false;
    }
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`relative ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <div className="absolute inset-0">
        <RiveComponent />
      </div>
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </button>
  );
};

// Loading spinner with Rive
export const RiveLoader = ({ 
  size = 100, 
  className = '',
  src = '/animations/rive/loader.riv' // You'll need to add this file
}) => {
  return (
    <RiveAnimation
      src={src}
      stateMachines="State Machine 1"
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

// Success animation with Rive
export const RiveSuccess = ({
  size = 100,
  className = '',
  src = '/animations/rive/success.riv', // You'll need to add this file
  onComplete,
  triggerInputName = 'trigger'
}) => {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: 'State Machine 1',
    autoplay: false,
  });

  const triggerInput = useStateMachineInput(rive, 'State Machine 1', triggerInputName);

  React.useEffect(() => {
    if (triggerInput) {
      triggerInput.fire();
    }
  }, [triggerInput]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <RiveComponent />
    </div>
  );
};

// Progress indicator with Rive
export const RiveProgress = ({
  progress = 0, // 0 to 100
  size = 200,
  className = '',
  src = '/animations/rive/progress.riv', // You'll need to add this file
  progressInputName = 'progress'
}) => {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const progressInput = useStateMachineInput(rive, 'State Machine 1', progressInputName);

  React.useEffect(() => {
    if (progressInput) {
      progressInput.value = progress;
    }
  }, [progressInput, progress]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <RiveComponent />
    </div>
  );
};

// Character animation for onboarding
export const RiveCharacter = ({
  mood = 'happy', // happy, thinking, celebrating
  size = 200,
  className = '',
  src = '/animations/rive/character.riv', // You'll need to add this file
  moodInputName = 'mood'
}) => {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const moodInput = useStateMachineInput(rive, 'State Machine 1', moodInputName);

  React.useEffect(() => {
    if (moodInput) {
      // Map mood strings to numeric values (adjust based on your Rive file)
      const moodMap = {
        happy: 0,
        thinking: 1,
        celebrating: 2
      };
      moodInput.value = moodMap[mood] || 0;
    }
  }, [moodInput, mood]);

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <RiveComponent />
    </motion.div>
  );
};

export default RiveAnimation;