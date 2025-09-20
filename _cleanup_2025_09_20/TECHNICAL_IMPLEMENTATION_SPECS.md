# ALF COACH - TECHNICAL IMPLEMENTATION SPECIFICATIONS

## Phase 1: Foundation Restoration - Technical Specs

### 1.1 Data Flow Fix: Wizard → Chat Integration

**Problem**: ProjectSetupData interface inconsistency causing data loss between wizard and chat.

**Current Issue**:
```typescript
// In ProjectOnboardingWizard.tsx (lines 480-516)
onComplete({
  ...projectData,
  wizardData: {
    subject: data.subject,
    gradeLevel: data.gradeLevel,
    // Inconsistent data structure
  }
});

// In ChatbotFirstInterfaceFixed.tsx (lines 125-152)
context: {
  subject: projectData?.wizardData?.subject || projectData?.subject || '',
  // Multiple fallback checks indicate broken contract
}
```

**Solution**:
```typescript
// Standardize ProjectSetupData interface
interface ProjectSetupData {
  subject: string | string[]; // Allow multi-subject
  gradeLevel: string;
  duration: string;
  location: string;
  initialIdeas: string[];
  materials: {
    readings: string[];
    tools: string[];
  };
}

// Fix wizard completion callback
const handleOnboardingComplete = (data: ProjectSetupData) => {
  setProjectState(prev => ({
    ...prev,
    stage: 'GROUNDING',
    context: {
      subject: Array.isArray(data.subject) ? data.subject.join(', ') : data.subject,
      gradeLevel: data.gradeLevel,
      duration: data.duration,
      location: data.location,
      materials: formatMaterials(data.materials)
    },
    ideation: {
      ...prev.ideation,
      initialIdeas: data.initialIdeas
    }
  }));
};
```

**Files to Modify**:
1. `/src/features/wizard/wizardSchema.ts` - Standardize interface
2. `/src/components/onboarding/ProjectOnboardingWizard.tsx` - Fix data structure
3. `/src/components/chat/ChatbotFirstInterfaceFixed.tsx` - Remove fallback logic

### 1.2 Connection Status Removal

**Problem**: ConnectionIndicator cluttering chat UI and confusing users.

**Current Implementation**:
```tsx
// In ChatbotFirstInterfaceFixed.tsx (lines 656-668)
<div className="mb-3 flex items-center justify-between">
  <ConnectionIndicator detailed={true} />
  // This should be removed entirely
</div>
```

**Solution**:
```typescript
// Modify ConnectionStatusService.ts for console-only logging
class ConnectionStatusService {
  private logToConsole(status: ConnectionStatus) {
    console.group('🔌 ALF Coach Connection Status');
    console.log('Overall Status:', this.getOverallStatus());
    console.log('API Status:', status.geminiApi);
    console.log('Firebase Status:', status.firebase);
    console.log('Error Counts:', status.errorCounts);
    console.groupEnd();
  }
  
  // Remove UI notification methods
  // Keep only console logging and internal state management
}
```

**Files to Modify**:
1. `/src/components/chat/ChatbotFirstInterfaceFixed.tsx` - Remove ConnectionIndicator
2. `/src/services/ConnectionStatusService.ts` - Add console-only logging
3. `/src/components/ui/ConnectionIndicator.tsx` - Mark as deprecated or remove

### 1.3 Suggestion Cards System Restoration

**Problem**: Missing Ideas/Examples/WhatIf buttons for contextual assistance.

**Current State**: Basic suggestion system exists but lacks contextual intelligence.

**Solution**:
```typescript
// Enhanced suggestion content system
const getStageSuggestions = (stage: string, context: ProjectContext) => {
  const suggestions = {
    'GROUNDING': [
      {
        id: 'explore-subject',
        text: `Tell me more about teaching ${context.subject} to ${context.gradeLevel} students`,
        category: 'idea' as const
      },
      {
        id: 'what-if-duration',
        text: `What if I had ${context.duration === '1-2 weeks' ? 'more' : 'less'} time for this project?`,
        category: 'whatif' as const
      }
    ],
    'IDEATION': [
      {
        id: 'big-idea-examples',
        text: `Show me examples of compelling big ideas for ${context.subject}`,
        category: 'example' as const
      },
      {
        id: 'essential-question-help',
        text: 'Help me craft an essential question that drives inquiry',
        category: 'idea' as const
      }
    ]
  };
  
  return suggestions[stage] || [];
};

// Enhanced button system
const renderSuggestionButtons = (messageId: string, stage: string) => (
  <div className="mt-2 flex gap-2">
    <SuggestionButton 
      type="ideas" 
      onClick={() => showContextualSuggestions(messageId, 'idea')}
      label="Ideas"
    />
    <SuggestionButton 
      type="examples" 
      onClick={() => showContextualSuggestions(messageId, 'example')}
      label="Examples"
    />
    <SuggestionButton 
      type="whatif" 
      onClick={() => showContextualSuggestions(messageId, 'whatif')}
      label="What If"
    />
  </div>
);
```

**Files to Modify**:
1. `/src/utils/suggestionContent.ts` - Add contextual suggestion generation
2. `/src/components/chat/ImprovedSuggestionCards.tsx` - Enhance with context awareness
3. `/src/components/chat/ChatbotFirstInterfaceFixed.tsx` - Integrate button system

### 1.4 Gemini API Rate Limiting Fix

**Problem**: Rate limiting (429 errors) causing chat failures.

**Current Implementation**: Basic error handling without graceful degradation.

**Solution**:
```typescript
// Enhanced GeminiService with robust rate limiting
class GeminiService {
  private requestQueue: Array<() => Promise<void>> = [];
  private rateLimitUntil: number = 0;
  private responseCache = new Map<string, {response: string, timestamp: number}>();
  
  async generateResponse(prompt: string, options: GenerationOptions): Promise<string> {
    // Check cache first
    const cacheKey = this.generateCacheKey(prompt, options);
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;
    
    // Check rate limit
    if (this.isRateLimited()) {
      return this.getFallbackResponse(prompt);
    }
    
    try {
      const response = await this.makeAPIRequest(prompt, options);
      this.cacheResponse(cacheKey, response);
      return response;
    } catch (error) {
      if (error.status === 429) {
        this.handleRateLimit(error.headers['retry-after']);
        return this.getFallbackResponse(prompt);
      }
      throw error;
    }
  }
  
  private getFallbackResponse(prompt: string): string {
    const fallbacks = {
      'big-idea': "I'm currently experiencing high demand. While I process your request, consider: What real-world challenge could your students tackle that connects to your subject area?",
      'essential-question': "Let me help you in a moment. Meanwhile, think about: What question would make your students curious and drive their entire learning journey?",
      'default': "I'm experiencing high demand right now. Please try again in about 30 seconds, or feel free to continue with your own ideas!"
    };
    
    return this.getContextualFallback(prompt, fallbacks);
  }
}
```

**Files to Modify**:
1. `/src/services/GeminiService.ts` - Add caching and graceful degradation
2. `/netlify/functions/gemini.js` - Add server-side rate limiting
3. Environment configuration - Add proper API key management

---

## Phase 2: Design System Modernization - Technical Specs

### 2.1 Wizard Design Updates

**Problem**: Current wizard looks dated (described as "1997 look" in requirements).

**Current Issues**:
- Basic card styling without proper elevation
- Inconsistent spacing and typography
- Poor mobile responsiveness
- Lack of visual hierarchy

**Solution**:
```tsx
// Modern wizard card component
const ModernWizardCard = ({ children, isActive = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      bg-white dark:bg-gray-800 
      rounded-2xl shadow-elevation-2 
      border border-gray-200 dark:border-gray-700
      p-8 backdrop-blur-sm
      ${isActive ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
      transition-all duration-300
    `}
  >
    {children}
  </motion.div>
);

// Enhanced subject cards
const SubjectCard = ({ subject, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      relative p-6 rounded-xl border-2 transition-all duration-300
      ${isSelected
        ? `${subject.borderColor} ${subject.bgColor} shadow-elevation-2`
        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
      }
      group overflow-hidden
    `}
  >
    {/* Gradient overlay */}
    <div className={`
      absolute inset-0 bg-gradient-to-br ${subject.color} 
      opacity-0 transition-opacity duration-300
      ${isSelected ? 'opacity-10' : 'group-hover:opacity-5'}
    `} />
    
    {/* Content */}
    <div className="relative z-10">
      <div className={`
        inline-flex p-3 rounded-lg bg-gradient-to-br ${subject.color} 
        text-white shadow-lg mb-3
      `}>
        {subject.icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        {subject.name}
      </h3>
    </div>
  </motion.button>
);
```

### 2.2 Multi-Subject Selection

**Problem**: Current wizard only allows single subject selection.

**Solution**:
```typescript
// Enhanced subject selection state
interface WizardState {
  selectedSubjects: string[];
  primarySubject: string;
  isInterdisciplinary: boolean;
}

const handleSubjectSelection = (subjectName: string) => {
  setData(prev => {
    const isSelected = prev.selectedSubjects.includes(subjectName);
    const newSelections = isSelected
      ? prev.selectedSubjects.filter(s => s !== subjectName)
      : [...prev.selectedSubjects, subjectName];
    
    return {
      ...prev,
      selectedSubjects: newSelections,
      primarySubject: newSelections[0] || '',
      isInterdisciplinary: newSelections.length > 1,
      subject: newSelections.length === 1 ? newSelections[0] : newSelections
    };
  });
};

// Multi-selection UI
const MultiSelectIndicator = ({ selectedSubjects }) => (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Users className="w-4 h-4" />
      <span>
        {selectedSubjects.length === 0 && "Select one or more subjects"}
        {selectedSubjects.length === 1 && "Single subject project"}
        {selectedSubjects.length > 1 && `Interdisciplinary project (${selectedSubjects.length} subjects)`}
      </span>
    </div>
    
    {selectedSubjects.length > 1 && (
      <div className="flex flex-wrap gap-2">
        {selectedSubjects.map((subject, index) => (
          <span key={subject} className={`
            px-2 py-1 rounded-md text-xs font-medium
            ${index === 0 
              ? 'bg-primary-100 text-primary-800' 
              : 'bg-gray-100 text-gray-700'
            }
          `}>
            {index === 0 && '★ '}{subject}
          </span>
        ))}
      </div>
    )}
  </div>
);
```

---

## Phase 3: Feature Restoration - Technical Specs

### 3.1 Stage Initiation Cards Enhancement

**Problem**: Current stage cards lack contextual intelligence and visual polish.

**Solution**:
```typescript
// Enhanced stage card system with context awareness
interface StageCard {
  id: string;
  title: string;
  description: string;
  example: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'purple';
  starterPrompt: string;
  contextRequirements?: string[];
  stage: string[];
}

const generateContextualCards = (stage: string, context: ProjectContext): StageCard[] => {
  const baseCards = STAGE_CARDS[stage] || [];
  
  return baseCards.map(card => ({
    ...card,
    starterPrompt: replaceContextPlaceholders(card.starterPrompt, context),
    example: generateContextualExample(card.type, context)
  }));
};

const replaceContextPlaceholders = (prompt: string, context: ProjectContext): string => {
  return prompt
    .replace(/\[subject\]/g, context.subject)
    .replace(/\[grade\]/g, context.gradeLevel)
    .replace(/\[duration\]/g, context.duration)
    .replace(/\[location\]/g, context.location);
};

// Smart card appearance logic
const shouldShowStageCards = (
  stage: string, 
  messageCount: number, 
  lastInteraction: number
): boolean => {
  const timeSinceLastInteraction = Date.now() - lastInteraction;
  const isUserIdle = timeSinceLastInteraction > 30000; // 30 seconds
  const hasLowMessageCount = messageCount < 3;
  const isAppropriateStage = ['GROUNDING', 'IDEATION', 'JOURNEY'].includes(stage);
  
  return isAppropriateStage && (hasLowMessageCount || isUserIdle);
};
```

### 3.2 Progress Tracking Restoration

**Problem**: Progress sidebar not accurately reflecting conversation state.

**Solution**:
```typescript
// Enhanced progress tracking system
interface ProgressState {
  stages: {
    [key: string]: {
      status: 'pending' | 'in-progress' | 'completed';
      substeps: Array<{
        id: string;
        label: string;
        completed: boolean;
        data?: any;
      }>;
      completedAt?: Date;
      timeSpent?: number;
    };
  };
  overallProgress: number;
  currentStage: string;
}

const calculateProgress = (projectState: ProjectState): ProgressState => {
  const stages = {
    grounding: {
      status: calculateStageStatus('grounding', projectState),
      substeps: [
        { id: 'subject', label: 'Subject Area', completed: !!projectState.context.subject },
        { id: 'grade', label: 'Grade Level', completed: !!projectState.context.gradeLevel },
        { id: 'duration', label: 'Duration', completed: !!projectState.context.duration },
        { id: 'location', label: 'Environment', completed: !!projectState.context.location }
      ]
    },
    ideation: {
      status: calculateStageStatus('ideation', projectState),
      substeps: [
        { id: 'bigIdea', label: 'Big Idea', completed: projectState.ideation.bigIdeaConfirmed },
        { id: 'essential', label: 'Essential Question', completed: projectState.ideation.essentialQuestionConfirmed },
        { id: 'challenge', label: 'Challenge', completed: projectState.ideation.challengeConfirmed }
      ]
    }
  };
  
  const totalSteps = Object.values(stages).reduce((sum, stage) => sum + stage.substeps.length, 0);
  const completedSteps = Object.values(stages).reduce((sum, stage) => 
    sum + stage.substeps.filter(s => s.completed).length, 0
  );
  
  return {
    stages,
    overallProgress: Math.round((completedSteps / totalSteps) * 100),
    currentStage: projectState.stage
  };
};
```

### 3.3 Decision Tree Logic

**Problem**: Conversation flow lacks intelligent branching based on user responses.

**Solution**:
```typescript
// Enhanced conversation state machine
interface ConversationState {
  stage: string;
  step: string;
  context: ProjectContext;
  history: ConversationTurn[];
  decisionPoints: DecisionPoint[];
}

interface DecisionPoint {
  id: string;
  trigger: string;
  condition: (userInput: string, context: ProjectContext) => boolean;
  action: (state: ConversationState) => ConversationState;
}

const decisionTree: DecisionPoint[] = [
  {
    id: 'detect-big-idea-complete',
    trigger: 'user-confirms-big-idea',
    condition: (input, context) => {
      const confirmationKeywords = ['yes', 'that sounds good', 'perfect', 'exactly'];
      return confirmationKeywords.some(keyword => 
        input.toLowerCase().includes(keyword)
      ) && context.stage === 'BIG_IDEA';
    },
    action: (state) => ({
      ...state,
      stage: 'ESSENTIAL_QUESTION',
      ideation: {
        ...state.ideation,
        bigIdeaConfirmed: true
      }
    })
  },
  {
    id: 'detect-needs-more-examples',
    trigger: 'user-requests-examples',
    condition: (input, context) => {
      const exampleKeywords = ['example', 'examples', 'show me', 'what does that look like'];
      return exampleKeywords.some(keyword => 
        input.toLowerCase().includes(keyword)
      );
    },
    action: (state) => ({
      ...state,
      shouldShowExamples: true
    })
  }
];

const processUserInput = (
  input: string, 
  currentState: ConversationState
): ConversationState => {
  // Check each decision point
  for (const decision of decisionTree) {
    if (decision.condition(input, currentState.context)) {
      return decision.action(currentState);
    }
  }
  
  // Default progression logic
  return defaultStateProgression(input, currentState);
};
```

---

## Phase 4: Polish & Integration - Technical Specs

### 4.1 End-to-End Data Flow

**Solution**: Comprehensive data flow validation and error handling.

```typescript
// Data flow validation system
interface DataFlowValidator {
  validateWizardData(data: ProjectSetupData): ValidationResult;
  validateChatContext(context: ProjectContext): ValidationResult;
  validateProgressState(progress: ProgressState): ValidationResult;
  validateExportData(exportData: ExportData): ValidationResult;
}

const dataFlowValidator: DataFlowValidator = {
  validateWizardData: (data) => {
    const errors: string[] = [];
    
    if (!data.subject || (Array.isArray(data.subject) && data.subject.length === 0)) {
      errors.push('Subject selection required');
    }
    if (!data.gradeLevel) errors.push('Grade level required');
    if (!data.duration) errors.push('Duration required');
    if (!data.location) errors.push('Learning environment required');
    
    return { isValid: errors.length === 0, errors };
  },
  
  validateChatContext: (context) => {
    // Validate that all required context is available for AI prompts
    const requiredFields = ['subject', 'gradeLevel', 'duration'];
    const missingFields = requiredFields.filter(field => !context[field]);
    
    return {
      isValid: missingFields.length === 0,
      errors: missingFields.map(field => `Missing required context: ${field}`)
    };
  }
};

// Error boundary for data flow issues
class DataFlowErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message.includes('data flow')) {
      // Attempt to recover from data flow errors
      this.recoverFromDataFlowError(error);
    }
  }
  
  private recoverFromDataFlowError(error: Error) {
    // Log error for debugging
    console.error('Data flow error detected:', error);
    
    // Attempt to restore from localStorage
    const backupData = localStorage.getItem('alf-coach-backup');
    if (backupData) {
      try {
        const restored = JSON.parse(backupData);
        this.setState({ hasError: false, restoredData: restored });
      } catch (e) {
        console.error('Failed to restore backup data:', e);
      }
    }
  }
}
```

### 4.2 Performance Optimization

**Solution**: Address the 43/100 Lighthouse score with targeted optimizations.

```typescript
// Code splitting implementation
const Dashboard = lazy(() => import('./components/Dashboard'));
const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));
const OnboardingWizard = lazy(() => import('./components/onboarding/ProjectOnboardingWizard'));

// Vite configuration for bundle optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ai-services': ['./src/services/GeminiService.ts']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  }
});

// Preloading critical resources
const preloadCriticalResources = () => {
  // Preload critical chunks
  import('./components/chat/ChatInterface');
  
  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/fonts/inter-var.woff2';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};
```

This technical specification provides the detailed implementation approach for each phase of the restoration gameplan, ensuring that developers have clear guidance on exactly what needs to be built and how to build it.