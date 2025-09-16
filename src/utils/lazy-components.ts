/**
 * Lazy loading utilities for heavy components and features
 * This file enables dynamic imports to reduce initial bundle size
 */

import { lazy } from 'react';

// Markdown rendering (with syntax highlighting)
export const LazyMarkdownRenderer = lazy(() => 
  import('../components/chat/MarkdownRenderer').then(module => ({
    default: module.MarkdownRenderer
  }))
);

// PDF export service
export const LazyPDFExportService = lazy(() =>
  import('../core/services/PDFExportService').then(module => ({
    default: module.PDFExportService
  }))
);

// Lottie animations
export const LazyLottieAnimation = lazy(() =>
  import('../components/animations/LottieAnimation').then(module => ({
    default: module.LottieAnimation
  }))
);

// Data visualization (if using heavy chart libraries)
export const LazyDataVisualization = lazy(() =>
  import('../services/core/data-visualization-exports').catch(() => ({
    default: () => null // Fallback if module doesn't exist
  }))
);

// Loading wrapper for heavy features
export const withLazyLoading = <T,>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>
) => {
  return function LazyWrapper(props: T) {
    return (
      <React.Suspense 
        fallback={
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        }
      >
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
};