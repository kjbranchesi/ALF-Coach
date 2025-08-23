/**
 * Heavy markdown rendering component - lazy loaded only when needed
 */

import React from 'react';
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
  tagNames: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'del', 'blockquote', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  attributes: {
    '*': ['className'],
    a: ['href', 'title'],
    code: ['className'],
    pre: ['className']
  }
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
    components={{
      h1: ({ children }) => (
        <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-base font-semibold mt-2 mb-1 text-gray-800 dark:text-gray-200">{children}</h3>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
      ),
      p: ({ children }) => (
        <p className="mb-2 last:mb-0 text-gray-700 dark:text-gray-300">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>
      ),
      li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-blue-300 pl-3 italic text-gray-600 dark:text-gray-400 my-2">
          {children}
        </blockquote>
      ),
      code: ({ inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-md my-2"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
            {children}
          </code>
        );
      }
    }}
  >
    {content}
  </ReactMarkdown>
);