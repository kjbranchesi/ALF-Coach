# ALF Coach Progress Indicator System

A comprehensive progress tracking system that provides clear visual feedback for users navigating through the 9-step ALF Coach flow across 3 main stages.

## Overview

The progress system breaks down the ALF Coach experience into:

- **9 Total Steps** across the complete journey
- **3 Main Stages**: Ideation (steps 1-3), Journey (steps 4-6), Deliverables (steps 7-9)
- **Multi-device Support**: Optimized for desktop, tablet, and mobile
- **Real-time Updates**: Progress updates as users complete each step

## Components

### 1. EnhancedProgressIndicator

The main desktop progress component showing detailed step-by-step progress.

```tsx
import { EnhancedProgressIndicator } from './components/progress/EnhancedProgressIndicator';

<EnhancedProgressIndicator
  progress={{
    currentStage: 'IDEATION',
    currentStep: 'BIG_IDEA',
    completedSteps: [],
    totalSteps: 9
  }}
  variant="horizontal"
  showDetails={true}
  onStepClick={(stepId) => console.log('Navigate to:', stepId)}
/>
```

**Variants:**
- `horizontal` - Full desktop layout with detailed step breakdown
- `compact` - Condensed view for sidebars
- `floating` - Minimalist floating pill

### 2. MobileProgressIndicator

Mobile-optimized component with expandable details and touch-friendly interactions.

```tsx
import { MobileProgressIndicator } from './components/progress/MobileProgressIndicator';

<MobileProgressIndicator
  currentStage="JOURNEY"
  currentStep="PHASES"
  completedSteps={['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE']}
  onStepTap={(stepId) => handleStepNavigation(stepId)}
/>
```

**Features:**
- Collapsible detailed view
- Touch-optimized interactions
- Progress dots visualization
- Stage-specific step breakdown

### 3. HeaderProgressBar

Minimal header progress bar that integrates seamlessly with the chat interface.

```tsx
import { HeaderProgressBar } from './components/progress/HeaderProgressBar';

<HeaderProgressBar
  currentStage="DELIVERABLES"
  currentStep="MILESTONES"
  completedSteps={['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'PHASES', 'ACTIVITIES', 'RESOURCES']}
  showStageInfo={true}
/>
```

**Features:**
- 1px height progress bar
- Stage milestone markers
- Hover tooltips with detailed info
- Shimmer animation effects

## Integration Guide

### With Existing Chat Interface

Replace or enhance the existing progress components in the chat interface:

```tsx
// In ChatbotFirstInterfaceFixed.tsx
import { HeaderProgressBar } from './progress/HeaderProgressBar';
import { MobileProgressIndicator } from './progress/MobileProgressIndicator';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const ChatbotFirstInterfaceFixed = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [projectState, setProjectState] = useState(/* ... */);

  const progressData = {
    currentStage: projectState.stage,
    currentStep: getCurrentStep(),
    completedSteps: getCompletedSteps(),
    totalSteps: 9
  };

  return (
    <div className="chat-interface">
      {/* Header Progress */}
      {!isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <HeaderProgressBar {...progressData} />
        </div>
      )}

      {/* Mobile Progress */}
      {isMobile && (
        <div className="p-4">
          <MobileProgressIndicator
            currentStage={progressData.currentStage}
            currentStep={progressData.currentStep}
            completedSteps={progressData.completedSteps}
            onStepTap={handleStepNavigation}
          />
        </div>
      )}

      {/* Chat content */}
      <div className={`chat-content ${!isMobile ? 'pt-16' : ''}`}>
        {/* ... existing chat interface */}
      </div>
    </div>
  );
};
```

### With Progress Tracking Hook

Create a custom hook to manage progress state:

```tsx
// hooks/useProgressTracking.ts
import { useState, useEffect } from 'react';
import { type ProgressData, type StepStatus } from '../types/progress';
import { STEP_FLOW } from '../components/progress/EnhancedProgressIndicator';

export const useProgressTracking = (initialStage = 'IDEATION', initialStep = 'BIG_IDEA') => {
  const [progress, setProgress] = useState<ProgressData>({
    currentStage: initialStage,
    currentStep: initialStep,
    completedSteps: [],
    totalSteps: 9
  });

  const completeStep = (stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
  };

  const navigateToStep = (stepId: string) => {
    // Find stage containing this step
    const stageEntry = Object.entries(STEP_FLOW).find(([, stageData]) =>
      stageData.steps.some(step => step.id === stepId)
    );
    
    if (stageEntry) {
      const [stageKey] = stageEntry;
      setProgress(prev => ({
        ...prev,
        currentStage: stageKey as any,
        currentStep: stepId
      }));
    }
  };

  const getStepStatus = (stepId: string): StepStatus => {
    if (progress.completedSteps.includes(stepId)) return 'completed';
    if (progress.currentStep === stepId) return 'current';
    return 'upcoming';
  };

  return {
    progress,
    completeStep,
    navigateToStep,
    getStepStatus
  };
};
```

## Styling and Theming

The components use the established ALF design system tokens:

```tsx
// Design tokens used
const progressColors = {
  primary: tokens.colors.primary[500],    // Blue #3b82f6
  success: tokens.colors.semantic.success, // Green #059669
  background: tokens.colors.background.primary,
  text: tokens.colors.gray[900]
};
```

### Custom Styling

Override default styles using CSS classes:

```css
/* Custom progress bar styling */
.progress-indicator--custom {
  --progress-primary: #your-brand-color;
  --progress-success: #your-success-color;
  --progress-background: #your-bg-color;
}

.progress-indicator--custom .progress-fill {
  background: linear-gradient(90deg, var(--progress-primary), var(--progress-success));
}
```

## Responsive Behavior

### Breakpoint Strategy

- **Mobile (< 768px)**: Uses `MobileProgressIndicator` with collapsible details
- **Tablet (768px - 1024px)**: Uses `compact` variant of `EnhancedProgressIndicator`
- **Desktop (> 1024px)**: Uses `horizontal` variant with full details

### Layout Integration

```tsx
// Responsive progress selection
const ProgressComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

  if (isMobile) {
    return <MobileProgressIndicator {...props} />;
  }

  if (isTablet) {
    return <EnhancedProgressIndicator variant="compact" {...props} />;
  }

  return <EnhancedProgressIndicator variant="horizontal" {...props} />;
};
```

## Animation and Interactions

### Framer Motion Animations

The components use Framer Motion for smooth animations:

```tsx
// Progress bar fill animation
<motion.div
  className="progress-fill"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
/>

// Step completion animation
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="completion-indicator"
/>
```

### Interaction States

- **Hover**: Subtle scale and shadow effects
- **Active**: Pressed state with scale reduction
- **Focus**: Keyboard navigation support with focus rings
- **Loading**: Shimmer effects during updates

## Accessibility

### ARIA Labels and Roles

```tsx
<div
  role="progressbar"
  aria-valuenow={progress.percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Project progress: ${progress.percentage}% complete`}
>
```

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate step navigation
- **Arrow Keys**: Move between steps (when enabled)

### Screen Reader Support

- Progress announcements
- Step status descriptions
- Stage transition notifications

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components load only when needed
2. **Memoization**: React.memo for expensive calculations
3. **Debounced Updates**: Prevent excessive re-renders
4. **Efficient Animations**: Use CSS transforms over layout properties

### Bundle Size Impact

- **Base components**: ~8KB gzipped
- **With animations**: ~12KB gzipped (includes Framer Motion)
- **Full system**: ~15KB gzipped

## Testing

### Unit Tests

```tsx
// Example test for progress calculation
import { render, screen } from '@testing-library/react';
import { EnhancedProgressIndicator } from './EnhancedProgressIndicator';

test('displays correct progress percentage', () => {
  const props = {
    progress: {
      currentStage: 'JOURNEY',
      completedSteps: ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE'],
      totalSteps: 9
    }
  };

  render(<EnhancedProgressIndicator {...props} />);
  
  expect(screen.getByText('33%')).toBeInTheDocument();
  expect(screen.getByLabelText(/33% complete/)).toBeInTheDocument();
});
```

### Integration Tests

```tsx
// Test progress updates during user flow
test('updates progress as user completes steps', async () => {
  const { user } = renderWithProgressProvider(<ChatInterface />);
  
  // Complete first step
  await user.click(screen.getByText('Complete Big Idea'));
  expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();
  
  // Verify progress bar update
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '11');
});
```

## Migration from Existing System

### Step-by-Step Migration

1. **Phase 1**: Replace `ProgressIndicator.jsx` with `HeaderProgressBar`
2. **Phase 2**: Add mobile-specific progress with `MobileProgressIndicator`  
3. **Phase 3**: Integrate detailed progress with `EnhancedProgressIndicator`
4. **Phase 4**: Add progress state management hooks

### Backward Compatibility

The new components maintain compatibility with existing prop interfaces:

```tsx
// Old component props still work
<ProgressIndicator currentStage="Ideation" />

// Maps to new system
<EnhancedProgressIndicator 
  progress={{ currentStage: 'IDEATION', /* ... */ }} 
/>
```

## Examples

### Complete Integration Example

```tsx
// components/ChatWithProgress.tsx
import React from 'react';
import { HeaderProgressBar } from './progress/HeaderProgressBar';
import { MobileProgressIndicator } from './progress/MobileProgressIndicator';
import { EnhancedProgressIndicator } from './progress/EnhancedProgressIndicator';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useProgressTracking } from '../hooks/useProgressTracking';

export const ChatWithProgress = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { progress, completeStep, navigateToStep } = useProgressTracking();

  return (
    <div className="chat-container">
      {/* Desktop Header */}
      {!isMobile && (
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-40 p-4 border-b">
          <HeaderProgressBar
            currentStage={progress.currentStage}
            currentStep={progress.currentStep}
            completedSteps={progress.completedSteps}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 p-4">
            <EnhancedProgressIndicator
              progress={progress}
              variant="compact"
              onStepClick={navigateToStep}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1">
          {/* Mobile Progress */}
          {isMobile && (
            <div className="p-4 border-b">
              <MobileProgressIndicator
                currentStage={progress.currentStage}
                currentStep={progress.currentStep}
                completedSteps={progress.completedSteps}
                onStepTap={navigateToStep}
              />
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="chat-messages">
            {/* Your existing chat content */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

This comprehensive progress system provides clear visual feedback while maintaining the clean, professional design of ALF Coach and ensuring excellent user experience across all devices.