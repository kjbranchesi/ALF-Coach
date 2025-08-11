/**
 * colorMappings.ts
 * 
 * Static Tailwind class mappings to ensure classes are included in build
 * Addresses dynamic class generation issues in Sprint 4 components
 */

// Phase color mappings
export const phaseColorClasses = {
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    textDark: 'text-blue-900',
    textLight: 'text-blue-600',
    fill: 'fill-blue-500',
    ring: 'ring-blue-500'
  },
  yellow: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    textDark: 'text-yellow-900',
    textLight: 'text-yellow-600',
    fill: 'fill-yellow-500',
    ring: 'ring-yellow-500'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    textDark: 'text-purple-900',
    textLight: 'text-purple-600',
    fill: 'fill-purple-500',
    ring: 'ring-purple-500'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    textDark: 'text-green-900',
    textLight: 'text-green-600',
    fill: 'fill-green-500',
    ring: 'ring-green-500'
  },
  gray: {
    border: 'border-gray-500',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    textDark: 'text-gray-900',
    textLight: 'text-gray-600',
    fill: 'fill-gray-500',
    ring: 'ring-gray-500'
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    textDark: 'text-orange-900',
    textLight: 'text-orange-600',
    fill: 'fill-orange-500',
    ring: 'ring-orange-500'
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    textDark: 'text-pink-900',
    textLight: 'text-pink-600',
    fill: 'fill-pink-500',
    ring: 'ring-pink-500'
  },
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    textDark: 'text-red-900',
    textLight: 'text-red-600',
    fill: 'fill-red-500',
    ring: 'ring-red-500'
  }
};

// Get phase color class
export const getPhaseColorClass = (
  phase: 'ANALYZE' | 'BRAINSTORM' | 'PROTOTYPE' | 'EVALUATE',
  type: keyof typeof phaseColorClasses['blue']
): string => {
  const colorMap = {
    ANALYZE: 'blue',
    BRAINSTORM: 'yellow',
    PROTOTYPE: 'purple',
    EVALUATE: 'green'
  };
  
  const color = colorMap[phase] as keyof typeof phaseColorClasses;
  return phaseColorClasses[color][type];
};

// Performance level color mappings
export const performanceLevelColors = {
  exemplary: phaseColorClasses.green,
  proficient: phaseColorClasses.blue,
  developing: phaseColorClasses.yellow,
  beginning: phaseColorClasses.gray
};

// Achievement category color mappings
export const achievementCategoryColors = {
  phase: phaseColorClasses.blue,
  iteration: phaseColorClasses.purple,
  collaboration: phaseColorClasses.green,
  excellence: phaseColorClasses.yellow,
  growth: phaseColorClasses.pink
};

// Feedback type color mappings
export const feedbackTypeColors = {
  strength: phaseColorClasses.green,
  improvement: phaseColorClasses.orange,
  question: phaseColorClasses.blue,
  suggestion: phaseColorClasses.purple
};

// Recognition type color mappings
export const recognitionTypeColors = {
  collaboration: phaseColorClasses.blue,
  creativity: phaseColorClasses.purple,
  leadership: phaseColorClasses.yellow,
  support: phaseColorClasses.pink,
  quality: phaseColorClasses.green
};

// Status color mappings
export const statusColors = {
  success: phaseColorClasses.green,
  warning: phaseColorClasses.yellow,
  error: phaseColorClasses.red,
  info: phaseColorClasses.blue,
  neutral: phaseColorClasses.gray
};

// Utility function to safely get color classes
export const getColorClass = (
  colorKey: string,
  classType: 'border' | 'bg' | 'text' | 'textDark' | 'textLight' | 'fill' | 'ring'
): string => {
  const colors = phaseColorClasses[colorKey as keyof typeof phaseColorClasses];
  if (!colors) {
    console.warn(`Unknown color key: ${colorKey}, falling back to gray`);
    return phaseColorClasses.gray[classType];
  }
  return colors[classType];
};

// Export all color keys for Tailwind safelist
export const tailwindSafelistClasses = [
  // Borders
  'border-blue-500', 'border-yellow-500', 'border-purple-500', 'border-green-500',
  'border-gray-500', 'border-orange-500', 'border-pink-500', 'border-red-500',
  'border-blue-300', 'border-yellow-300', 'border-purple-300', 'border-green-300',
  
  // Backgrounds
  'bg-blue-50', 'bg-yellow-50', 'bg-purple-50', 'bg-green-50',
  'bg-gray-50', 'bg-orange-50', 'bg-pink-50', 'bg-red-50',
  'bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 'bg-green-100',
  
  // Text colors
  'text-blue-600', 'text-yellow-600', 'text-purple-600', 'text-green-600',
  'text-blue-700', 'text-yellow-700', 'text-purple-700', 'text-green-700',
  'text-blue-900', 'text-yellow-900', 'text-purple-900', 'text-green-900',
  'text-gray-600', 'text-orange-600', 'text-pink-600', 'text-red-600',
  'text-gray-700', 'text-orange-700', 'text-pink-700', 'text-red-700',
  'text-gray-900', 'text-orange-900', 'text-pink-900', 'text-red-900',
  
  // Fill colors
  'fill-yellow-500', 'fill-blue-500', 'fill-green-500', 'fill-purple-500',
  
  // Ring colors
  'ring-blue-500', 'ring-yellow-500', 'ring-purple-500', 'ring-green-500',
  
  // Hover states
  'hover:border-blue-300', 'hover:border-yellow-300', 'hover:border-purple-300',
  'hover:bg-blue-50', 'hover:bg-yellow-50', 'hover:bg-purple-50',
  'hover:text-blue-700', 'hover:text-yellow-700', 'hover:text-purple-700',
  
  // Animation classes
  'animate-ping', 'animate-pulse', 'animate-spin',
  
  // Opacity
  'opacity-75', 'opacity-60', 'opacity-50'
];