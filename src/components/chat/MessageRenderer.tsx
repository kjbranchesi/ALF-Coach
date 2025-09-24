/**
 * MessageRenderer.tsx
 * 
 * Rich text rendering for chat messages with markdown support
 * Implements comprehensive security, performance optimization, and accessibility
 */

import React, { useMemo } from 'react';
import { StreamingText } from '../ui/TypewriterText';

// Security configuration for rehype-sanitize
const sanitizeSchema = {
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https']
  },
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 'del', 'ins',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'hr'
  ],
  attributes: {
    '*': ['className', 'id'],
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'pre': ['className'],
    'code': ['className']
  },
  clobberPrefix: 'user-content-',
  clobber: ['name', 'id']
};

interface MessageRendererProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  maxLength?: number; // Security: Limit content length
}

// Content length limits for DoS prevention
const MAX_CONTENT_LENGTH = 50000; // 50KB max
const MAX_CODE_BLOCK_LENGTH = 10000; // 10KB max for code blocks

// Utility function to truncate content safely
const truncateContent = (content: string, maxLength: number = MAX_CONTENT_LENGTH): string => {
  if (content.length <= maxLength) return content;
  
  // Find a safe truncation point (end of sentence or paragraph)
  const truncated = content.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastParagraph = truncated.lastIndexOf('\n\n');
  
  const cutoff = Math.max(lastSentence, lastParagraph);
  if (cutoff > maxLength * 0.8) { // Only use if we're not cutting too much
    return truncated.substring(0, cutoff + 1) + '\n\n*[Content truncated for length]*';
  }
  
  return truncated + '\n\n*[Content truncated for length]*';
};

// Validate and sanitize URLs
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  role, 
  maxLength = MAX_CONTENT_LENGTH 
}) => {
  const isAssistant = role === 'assistant';
  
  // Detect if content needs markdown processing
  const hasMarkdown = useMemo(() => {
    if (!content || role !== 'assistant') return false;
    return /[#*`_\[\]]/g.test(content) || content.includes('```') || content.includes('\n-') || content.includes('\n1.');
  }, [content, role]);

  // Memoize processed content for performance
  const processedContent = useMemo(() => {
    if (!content) return '';
    return truncateContent(content.trim(), maxLength);
  }, [content, maxLength]);
  
  // Early return for empty content
  if (!processedContent) {
    return <div className="text-gray-400 italic">No content</div>;
  }
  
  return (
    <div 
      className="message-content"
      role="region"
      aria-label={`${role} message`}
    >
      {isAssistant ? (
        <StreamingText
          content={processedContent}
          isMarkdown={true}
          sanitizeSchema={sanitizeSchema}
          className="prose prose-sm max-w-none prose-gray dark:prose-invert text-gray-800 dark:text-gray-100"
        />
      ) : (
        <div className="text-gray-800 dark:text-gray-200">{processedContent}</div>
      )}
    </div>
  );
};

export default MessageRenderer;
