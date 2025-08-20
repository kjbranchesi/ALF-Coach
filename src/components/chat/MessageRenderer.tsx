/**
 * MessageRenderer.tsx
 * 
 * Rich text rendering for chat messages with markdown support
 * Implements comprehensive security, performance optimization, and accessibility
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
      className={`message-content ${isAssistant ? 'prose prose-sm max-w-none' : ''}`}
      role="region"
      aria-label={`${role} message`}
    >
      {isAssistant ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeSanitize, sanitizeSchema]]} // SECURITY: Sanitize HTML
          components={{
            // Headers
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-2 mb-1 text-gray-800 dark:text-gray-200">{children}</h3>
            ),
            
            // Emphasis
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
            ),
            
            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="ml-2">{children}</li>
            ),
            
            // Blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <div className="text-gray-700 dark:text-gray-300 italic">{children}</div>
              </blockquote>
            ),
            
            // Code with security and performance enhancements
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const codeContent = String(children).replace(/\n$/, '');
              
              // Security: Limit code block length
              if (codeContent.length > MAX_CODE_BLOCK_LENGTH) {
                const truncated = codeContent.substring(0, MAX_CODE_BLOCK_LENGTH);
                const safeTruncated = truncated + '\n\n// [Code truncated for length]';
                
                if (!inline && match) {
                  return (
                    <div className="my-3 rounded-lg overflow-hidden">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          fontSize: '0.875rem',
                          lineHeight: '1.5'
                        }}
                        {...props}
                      >
                        {safeTruncated}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                
                return (
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm font-mono" {...props}>
                    {safeTruncated}
                  </code>
                );
              }
              
              if (!inline && match) {
                return (
                  <div className="my-3 rounded-lg overflow-hidden">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                      }}
                      wrapLines={true} // Performance: Enable line wrapping
                      wrapLongLines={true}
                      {...props}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            
            // Links with enhanced security
            a: ({ href, children }) => {
              // Security: Validate URL and prevent malicious links
              if (!href || !isValidUrl(href)) {
                return <span className="text-gray-500 italic">[Invalid link]</span>;
              }
              
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer nofollow" // Enhanced security
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  aria-label={`External link: ${href}`}
                >
                  {children}
                </a>
              );
            },
            
            // Paragraphs
            p: ({ children }) => (
              <p className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
            ),
            
            // Horizontal rule
            hr: () => (
              <hr className="my-4 border-t border-gray-200 dark:border-gray-700" />
            ),
            
            // Tables (with GFM)
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{children}</td>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      ) : (
        // User messages - simple text with security considerations
        <p className="whitespace-pre-wrap break-words">
          {processedContent}
        </p>
      )}
    </div>
  );
};

export default MessageRenderer;