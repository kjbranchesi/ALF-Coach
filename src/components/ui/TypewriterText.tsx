/**
 * TypewriterText Component
 * 
 * Renders text with a typewriter effect, revealing characters progressively
 * Optimized for chat responses with adjustable speed
 */

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface TypewriterTextProps {
  content: string;
  speed?: number; // characters per second
  className?: string;
  onComplete?: () => void;
  isMarkdown?: boolean;
  sanitizeSchema?: any;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  content,
  speed = 50, // Default: 50 characters per second (fast like ChatGPT)
  className = '',
  onComplete,
  isMarkdown = false,
  sanitizeSchema
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Memoize the content to avoid re-triggering effect on re-renders
  const memoizedContent = useMemo(() => content, [content]);

  useEffect(() => {
    if (currentIndex >= memoizedContent.length) {
      if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedContent(memoizedContent.slice(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    }, 1000 / speed);

    return () => clearTimeout(timer);
  }, [currentIndex, memoizedContent, speed, isComplete, onComplete]);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [memoizedContent]);

  if (isMarkdown) {
    return (
      <div className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={sanitizeSchema ? [[rehypeSanitize, sanitizeSchema]] : []}
        >
          {displayedContent}
        </ReactMarkdown>
        {!isComplete && (
          <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {displayedContent}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse" />
      )}
    </div>
  );
};