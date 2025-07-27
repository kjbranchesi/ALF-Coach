// Utility to sanitize AI-generated content before rendering
// Prevents JavaScript execution and ensures safe display

export function sanitizeAIContent(content: string): string {
  if (!content || typeof content !== 'string') {
    console.warn('sanitizeAIContent received invalid input:', typeof content);
    return '';
  }

  // First, escape any HTML entities to prevent injection
  let sanitized = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Then restore markdown formatting elements
  sanitized = sanitized
    // Restore bold markdown
    .replace(/\*\*([^*]+)\*\*/g, '**$1**')
    // Restore italic markdown
    .replace(/\*([^*]+)\*/g, '*$1*')
    // Restore code blocks
    .replace(/```([^`]*)```/g, '```$1```')
    // Restore inline code
    .replace(/`([^`]+)`/g, '`$1`')
    // Restore headers
    .replace(/^#+\s+(.+)$/gm, (match) => match)
    // Restore lists
    .replace(/^[\*\-]\s+(.+)$/gm, (match) => match)
    .replace(/^\d+\.\s+(.+)$/gm, (match) => match);

  // Remove any potential script tags or dangerous patterns that might have slipped through
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\s*\(/gi,
    /new\s+Function\s*\(/gi
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      console.error('Dangerous pattern detected in AI content:', pattern);
      sanitized = sanitized.replace(pattern, '[REMOVED]');
    }
  });

  return sanitized;
}

// Extract and validate code blocks from AI responses
export function extractCodeBlocks(content: string): { text: string; codeBlocks: Array<{ language: string; code: string }> } {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  let processedText = content;

  // Extract code blocks and replace with placeholders
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  let index = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2];
    
    codeBlocks.push({ language, code });
    processedText = processedText.replace(match[0], `[CODE_BLOCK_${index}]`);
    index++;
  }

  return { text: processedText, codeBlocks };
}

// Validate AI response structure
export function validateAIResponse(response: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for common AI generation errors
  if (response.includes('```') && !response.includes('```\n')) {
    errors.push('Malformed code blocks detected');
  }

  if (response.includes('undefined') || response.includes('null')) {
    errors.push('AI response contains undefined or null values');
  }

  // Check for incomplete markdown
  const boldCount = (response.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    errors.push('Unclosed bold markdown detected');
  }

  const codeCount = (response.match(/`/g) || []).length;
  const codeBlockCount = (response.match(/```/g) || []).length * 3;
  if ((codeCount - codeBlockCount) % 2 !== 0) {
    errors.push('Unclosed inline code markdown detected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}