/**
 * StreamingText Component
 * 
 * Renders text with a streaming effect like ChatGPT/Gemini where chunks of text
 * appear rapidly and somewhat randomly, not character by character
 */

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface StreamingTextProps {
  content: string;
  className?: string;
  onComplete?: () => void;
  isMarkdown?: boolean;
  sanitizeSchema?: any;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  className = '',
  onComplete,
  isMarkdown = false,
  sanitizeSchema
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Memoize the content to avoid re-triggering effect on re-renders
  const memoizedContent = useMemo(() => content, [content]);

  useEffect(() => {
    if (!memoizedContent) {return;}
    
    setDisplayedContent('');
    setIsComplete(false);
    
    // Split content into chunks (words, punctuation, etc.)
    const chunks = memoizedContent.match(/\S+\s*/g) || [memoizedContent];
    let currentChunkIndex = 0;
    
    const streamChunks = () => {
      if (currentChunkIndex >= chunks.length) {
        setIsComplete(true);
        onComplete?.();
        return;
      }

      // Add the current chunk
      const newContent = chunks.slice(0, currentChunkIndex + 1).join('');
      setDisplayedContent(newContent);
      currentChunkIndex++;

      // Random delay between 20-80ms for natural streaming feel
      const delay = Math.random() * 60 + 20;
      setTimeout(streamChunks, delay);
    };

    // Start streaming after a brief initial delay
    const initialTimer = setTimeout(streamChunks, 50);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [memoizedContent, onComplete]);

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
          <span className="inline-block w-0.5 h-5 bg-primary-500 ml-1 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {displayedContent}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-primary-500 ml-1 animate-pulse" />
      )}
    </div>
  );
};