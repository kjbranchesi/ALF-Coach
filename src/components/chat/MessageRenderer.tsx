/**
 * MessageRenderer.tsx
 * 
 * Rich text rendering for chat messages with markdown support
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageRendererProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content, role }) => {
  const isAssistant = role === 'assistant';
  
  return (
    <div className={`message-content ${isAssistant ? 'prose prose-sm max-w-none' : ''}`}>
      {isAssistant ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headers
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-2 mb-1 text-gray-800">{children}</h3>
            ),
            
            // Emphasis
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800">{children}</em>
            ),
            
            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 my-2 text-gray-700">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-2 text-gray-700">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="ml-2">{children}</li>
            ),
            
            // Blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 rounded-r-lg">
                <div className="text-gray-700 italic">{children}</div>
              </blockquote>
            ),
            
            // Code
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              
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
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            
            // Links
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {children}
              </a>
            ),
            
            // Paragraphs
            p: ({ children }) => (
              <p className="my-2 leading-relaxed text-gray-700">{children}</p>
            ),
            
            // Horizontal rule
            hr: () => (
              <hr className="my-4 border-t border-gray-200" />
            ),
            
            // Tables (with GFM)
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-sm text-gray-700">{children}</td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        // User messages - simple text
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
};

export default MessageRenderer;