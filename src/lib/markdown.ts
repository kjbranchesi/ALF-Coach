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
    let html = String(result);
    
    // Add Tailwind classes to elements
    html = html
      .replace(/<h1([^>]*)>/g, '<h1$1 class="text-2xl font-bold text-purple-800 mt-4 mb-2">')
      .replace(/<h2([^>]*)>/g, '<h2$1 class="text-xl font-semibold text-purple-800 mt-3 mb-2">')
      .replace(/<h3([^>]*)>/g, '<h3$1 class="text-lg font-semibold text-purple-800 mt-3 mb-2">')
      .replace(/<h4([^>]*)>/g, '<h4$1 class="text-base font-semibold text-purple-800 mt-2 mb-1">')
      .replace(/<p([^>]*)>/g, '<p$1 class="text-gray-700 leading-relaxed mb-3">')
      .replace(/<strong([^>]*)>/g, '<strong$1 class="font-semibold text-gray-800">')
      .replace(/<em([^>]*)>/g, '<em$1 class="italic text-purple-700">')
      .replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc list-inside text-gray-700 space-y-1 mb-3">')
      .replace(/<ol([^>]*)>/g, '<ol$1 class="list-decimal list-inside text-gray-700 space-y-1 mb-3">')
      .replace(/<li([^>]*)>/g, '<li$1 class="leading-relaxed">');
    
    return { __html: html };
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Fallback to escaped HTML with basic formatting
    return { 
      __html: markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-purple-800 mt-3 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-purple-700">$1</em>')
        .replace(/^\d+\.\s+(.*)/gm, '<li class="leading-relaxed">$1</li>')
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