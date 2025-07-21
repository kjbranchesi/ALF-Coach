// Safe Markdown rendering with sanitization
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Create a processor with GFM support and sanitization
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

export function renderMarkdown(markdown: string): { __html: string } {
  if (!markdown) {
    return { __html: '' };
  }
  
  try {
    const result = processor.processSync(markdown);
    return { __html: String(result) };
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Fallback to escaped HTML
    return { 
      __html: markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br/>')
    };
  }
}

// Helper to strip markdown for plain text contexts
export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .trim();
}

// Validate that content is safe (additional check beyond sanitizer)
export function isMarkdownSafe(markdown: string): boolean {
  if (!markdown) return true;
  
  // Check for potentially dangerous patterns that might slip through
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(markdown));
}