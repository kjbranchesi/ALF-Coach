import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  onVisible?: () => void;
}

/**
 * Lazy load component using Intersection Observer
 * Renders placeholder until component is in viewport
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            if (onVisible) {
              onVisible();
            }
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      ) : (
        placeholder || <DefaultPlaceholder />
      )}
    </div>
  );
};

/**
 * Default placeholder component
 */
const DefaultPlaceholder: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
  </div>
);

/**
 * Lazy image component with progressive loading
 */
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load the actual image
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              if (onLoad) {
                onLoad();
              }
            };
            
            img.onerror = () => {
              if (onError) {
                onError();
              }
            };
            
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'} transition-opacity duration-300`}
      style={{ opacity: isLoaded ? 1 : 0.7 }}
    />
  );
};

/**
 * Progressive component loader with skeleton
 */
interface ProgressiveLoaderProps<TProps extends Record<string, unknown> = Record<string, unknown>> {
  component: () => Promise<{ default: React.ComponentType<TProps> }>;
  props?: TProps;
  skeleton?: React.ReactNode;
}

export function ProgressiveLoader<TProps extends Record<string, unknown> = Record<string, unknown>>({
  component,
  props,
  skeleton
}: ProgressiveLoaderProps<TProps>) {
  const [Component, setComponent] = useState<React.ComponentType<TProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    component()
      .then(module => {
        if (mounted) {
          setComponent(() => module.default);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [component]);

  if (isLoading) {
    return <>{skeleton || <DefaultSkeleton />}</>;
  }

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (Component) {
    const componentProps = (props ?? {}) as TProps;
    return <Component {...componentProps} />;
  }

  return null;
}

/**
 * Default skeleton loader
 */
const DefaultSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
  </div>
);

/**
 * Error fallback component
 */
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
    <p className="text-red-600 dark:text-red-400">
      Failed to load component: {error.message}
    </p>
  </div>
);

/**
 * Virtual list for large datasets
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  buffer?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  buffer = 3,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
