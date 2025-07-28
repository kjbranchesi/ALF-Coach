import React from 'react';
import { renderMarkdown } from '../../lib/markdown';

interface MessageContentProps {
  content: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, className = '' }) => {
  // Validate and sanitize content
  const sanitizedContent = React.useMemo(() => {
    if (!content) {return '';}
    
    // Handle different types of content
    if (typeof content !== 'string') {
      console.warn('MessageContent received non-string content:', typeof content);
      return String(content);
    }
    
    // Check for and remove any potentially dangerous patterns
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];
    
    let clean = content;
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(clean)) {
        console.warn('Dangerous pattern detected and removed:', pattern);
        clean = clean.replace(pattern, '');
      }
    });
    
    return clean;
  }, [content]);
  
  // Use the safe markdown renderer
  const htmlContent = React.useMemo(() => {
    try {
      return renderMarkdown(sanitizedContent);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      // Fallback to escaped text
      return { 
        __html: sanitizedContent
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\n/g, '<br />')
      };
    }
  }, [sanitizedContent]);
  
  return (
    <div 
      className={`prose prose-sm max-w-none 
        prose-purple prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-strong:text-gray-800 dark:prose-strong:text-gray-200
        prose-code:text-purple-700 dark:prose-code:text-purple-400
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-ul:list-disc prose-ul:pl-6
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        ${className}
      `}
      dangerouslySetInnerHTML={htmlContent}
    />
  );
};