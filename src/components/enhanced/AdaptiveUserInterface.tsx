import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  HelpCircle, 
  Zap,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  RotateCcw
} from 'lucide-react';

export type UserPersona = 'new' | 'experienced' | 'expert';

interface AdaptiveUserInterfaceProps {
  userType: UserPersona;
  onUserTypeChange: (type: UserPersona) => void;
  children: React.ReactNode;
  className?: string;
}

interface PersonaConfig {
  label: string;
  description: string;
  uiDensity: 'spacious' | 'balanced' | 'compact';
  showTooltips: boolean;
  showDescriptions: boolean;
  showExamples: boolean;
  autoAdvance: boolean;
  verboseHelp: boolean;
}

const personaConfigs: Record<UserPersona, PersonaConfig> = {
  new: {
    label: 'New Teacher',
    description: 'First time designing PBL experiences',
    uiDensity: 'spacious',
    showTooltips: true,
    showDescriptions: true,
    showExamples: true,
    autoAdvance: false,
    verboseHelp: true
  },
  experienced: {
    label: 'Experienced Teacher',
    description: 'Some PBL experience, want guidance',
    uiDensity: 'balanced',
    showTooltips: true,
    showDescriptions: true,
    showExamples: false,
    autoAdvance: false,
    verboseHelp: false
  },
  expert: {
    label: 'Expert Teacher',
    description: 'Frequent PBL designer, want efficiency',
    uiDensity: 'compact',
    showTooltips: false,
    showDescriptions: false,
    showExamples: false,
    autoAdvance: true,
    verboseHelp: false
  }
};

export function AdaptiveUserInterface({
  userType,
  onUserTypeChange,
  children,
  className = ''
}: AdaptiveUserInterfaceProps) {
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const config = personaConfigs[userType];

  // Apply CSS custom properties based on persona
  useEffect(() => {
    const root = document.documentElement;
    
    // Spacing adjustments
    switch (config.uiDensity) {
      case 'spacious':
        root.style.setProperty('--chat-spacing', '1.5rem');
        root.style.setProperty('--button-padding', '1rem 1.5rem');
        root.style.setProperty('--card-padding', '1.5rem');
        break;
      case 'compact':
        root.style.setProperty('--chat-spacing', '0.75rem');
        root.style.setProperty('--button-padding', '0.5rem 1rem');
        root.style.setProperty('--card-padding', '1rem');
        break;
      default: // balanced
        root.style.setProperty('--chat-spacing', '1rem');
        root.style.setProperty('--button-padding', '0.75rem 1.25rem');
        root.style.setProperty('--card-padding', '1.25rem');
    }
  }, [config.uiDensity]);

  return (
    <div className={`adaptive-ui ${userType} ${className}`} data-user-type={userType}>
      {/* Persona Indicator & Selector */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {!isMinimized ? (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                  ${userType === 'new' ? 'bg-green-500' :
                    userType === 'experienced' ? 'bg-blue-500' :
                    'bg-purple-500'}
                `}>
                  {userType === 'new' ? '🌱' : userType === 'experienced' ? '⚡' : '🚀'}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{config.label}</div>
                  <div className="text-gray-500 text-xs">{config.description}</div>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick Switch Buttons */}
              <div className="flex gap-1">
                {Object.entries(personaConfigs).map(([type, conf]) => (
                  <button
                    key={type}
                    onClick={() => onUserTypeChange(type as UserPersona)}
                    className={`
                      px-2 py-1 rounded text-xs transition-colors
                      ${userType === type ? 
                        'bg-blue-100 text-blue-700' : 
                        'text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    {conf.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Main Content with Persona Context */}
      <PersonaProvider value={{ userType, config }}>
        {children}
      </PersonaProvider>
    </div>
  );
}

// Context for sharing persona config throughout the component tree
const PersonaContext = React.createContext<{
  userType: UserPersona;
  config: PersonaConfig;
} | null>(null);

const PersonaProvider = PersonaContext.Provider;

export function usePersona() {
  const context = React.useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}

// Adaptive Components that respond to persona

export function AdaptiveTooltip({
  content,
  children,
  force = false
}: {
  content: string;
  children: React.ReactNode;
  force?: boolean;
}) {
  const { config } = usePersona();
  
  if (!config.showTooltips && !force) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {content}
      </div>
    </div>
  );
}

export function AdaptiveDescription({
  children,
  force = false
}: {
  children: React.ReactNode;
  force?: boolean;
}) {
  const { config } = usePersona();
  
  if (!config.showDescriptions && !force) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="text-sm text-gray-600 mt-1"
    >
      {children}
    </motion.div>
  );
}

export function AdaptiveExample({
  children,
  force = false
}: {
  children: React.ReactNode;
  force?: boolean;
}) {
  const { config } = usePersona();
  
  if (!config.showExamples && !force) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="text-xs bg-blue-50 text-blue-700 p-2 rounded mt-2 border-l-2 border-blue-200"
    >
      <strong>Example:</strong> {children}
    </motion.div>
  );
}

export function AdaptiveHelp({
  title,
  verboseContent,
  briefContent,
  force = false
}: {
  title: string;
  verboseContent: React.ReactNode;
  briefContent: React.ReactNode;
  force?: boolean;
}) {
  const { config } = usePersona();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!config.verboseHelp && !force) {
    return (
      <div className="text-sm text-gray-600">
        {briefContent}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-blue-900 text-sm">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-blue-800"
          >
            {verboseContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Density-aware spacing component
export function AdaptiveSpacing({
  size = 'normal',
  children
}: {
  size?: 'small' | 'normal' | 'large';
  children: React.ReactNode;
}) {
  const { config } = usePersona();
  
  const getSpacing = () => {
    const baseSpacing = {
      small: { spacious: '0.75rem', balanced: '0.5rem', compact: '0.25rem' },
      normal: { spacious: '1.5rem', balanced: '1rem', compact: '0.75rem' },
      large: { spacious: '2.5rem', balanced: '2rem', compact: '1.5rem' }
    };
    
    return baseSpacing[size][config.uiDensity];
  };

  return (
    <div style={{ marginBottom: getSpacing() }}>
      {children}
    </div>
  );
}

// Auto-advance wrapper for expert users
export function AutoAdvanceWrapper({
  condition,
  onAdvance,
  delay = 2000,
  children
}: {
  condition: boolean;
  onAdvance: () => void;
  delay?: number;
  children: React.ReactNode;
}) {
  const { config } = usePersona();
  
  useEffect(() => {
    if (config.autoAdvance && condition) {
      const timer = setTimeout(onAdvance, delay);
      return () => clearTimeout(timer);
    }
  }, [condition, config.autoAdvance, onAdvance, delay]);

  return <>{children}</>;
}