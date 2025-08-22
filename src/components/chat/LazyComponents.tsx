import { lazy, Suspense } from 'react';
import { LoadingIndicator } from './LoadingIndicator';

// Lazy load heavy stage components
export const LazyLearningJourneyBuilder = lazy(() => 
  import('./stages/LearningJourneyBuilderEnhanced').then(module => ({
    default: module.LearningJourneyBuilderEnhanced
  }))
);

export const LazyRubricBuilder = lazy(() => 
  import('./stages/RubricBuilderEnhanced').then(module => ({
    default: module.RubricBuilderEnhanced
  }))
);

export const LazyActivityBuilder = lazy(() => 
  import('./stages/ActivityBuilderEnhanced').then(module => ({
    default: module.ActivityBuilderEnhanced
  }))
);

export const LazyImpactDesigner = lazy(() => 
  import('./stages/ImpactDesignerEnhanced').then(module => ({
    default: module.ImpactDesignerEnhanced
  }))
);

// Lazy load celebration system (only needed when stages complete)
export const LazyCelebrationSystem = lazy(() => 
  import('./CelebrationSystem').then(module => ({
    default: module.CelebrationSystem
  }))
);

// Wrapper component for lazy loading with fallback
export function LazyComponentWrapper({ 
  Component, 
  fallback = <LoadingIndicator />,
  ...props 
}: {
  Component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}