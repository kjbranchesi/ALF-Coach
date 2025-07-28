// Input validation and sanitization utilities
export class InputValidator {
  private static readonly MAX_INPUT_LENGTH = 2000;
  private static readonly MAX_PASTE_LENGTH = 5000;
  private static readonly DANGEROUS_PATTERNS = [
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
  ];

  static validateAndSanitize(input: string): {
    isValid: boolean;
    sanitized: string;
    issues: string[];
    metadata: {
      originalLength: number;
      wasModified: boolean;
      detectedLanguage?: string;
      hasMathSymbols: boolean;
      hasCodeBlock: boolean;
    };
  } {
    const issues: string[] = [];
    let sanitized = input;
    const originalLength = input.length;
    let wasModified = false;

    // Check for empty input
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        sanitized: '',
        issues: ['Input cannot be empty'],
        metadata: {
          originalLength: 0,
          wasModified: false,
          hasMathSymbols: false,
          hasCodeBlock: false
        }
      };
    }

    // Handle extremely long input
    if (originalLength > this.MAX_INPUT_LENGTH) {
      // Intelligent truncation - try to find a sentence boundary
      const truncateAt = this.findSentenceBoundary(input, this.MAX_INPUT_LENGTH);
      sanitized = `${input.substring(0, truncateAt)  }...`;
      issues.push(`Input was truncated from ${originalLength} to ${truncateAt} characters`);
      wasModified = true;
    }

    // Remove dangerous patterns
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        issues.push('Potentially dangerous content removed');
        wasModified = true;
      }
    });

    // Normalize whitespace
    const normalizedWhitespace = sanitized.replace(/\s+/g, ' ').trim();
    if (normalizedWhitespace !== sanitized) {
      sanitized = normalizedWhitespace;
      wasModified = true;
    }

    // Detect special content
    const metadata = {
      originalLength,
      wasModified,
      detectedLanguage: this.detectLanguage(input),
      hasMathSymbols: this.containsMathSymbols(input),
      hasCodeBlock: this.containsCodeBlock(input)
    };

    return {
      isValid: issues.length === 0 || (issues.length === 1 && issues[0].includes('truncated')),
      sanitized,
      issues,
      metadata
    };
  }

  static validatePastedContent(content: string): {
    isValid: boolean;
    processedContent: string;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let processedContent = content;

    if (content.length > this.MAX_PASTE_LENGTH) {
      // For very long pastes, extract key points
      processedContent = this.extractKeyPoints(content);
      suggestions.push('Your content was summarized. Consider breaking it into smaller, focused inputs.');
    }

    // Detect if it's a structured document
    if (this.isStructuredDocument(content)) {
      suggestions.push('It looks like you pasted a structured document. Try focusing on one section at a time.');
      processedContent = this.extractFirstSection(content);
    }

    // Check for multiple questions
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 3) {
      suggestions.push(`You've asked ${questionCount} questions. Consider focusing on one at a time for better guidance.`);
    }

    return {
      isValid: true,
      processedContent,
      suggestions
    };
  }

  private static findSentenceBoundary(text: string, maxLength: number): number {
    // Look for sentence endings before maxLength
    const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let bestBreak = maxLength;

    for (const ender of sentenceEnders) {
      const lastIndex = text.lastIndexOf(ender, maxLength);
      if (lastIndex > maxLength * 0.8 && lastIndex < bestBreak) {
        bestBreak = lastIndex + ender.length;
      }
    }

    // If no good break found, try paragraph break
    if (bestBreak === maxLength) {
      const paragraphBreak = text.lastIndexOf('\n\n', maxLength);
      if (paragraphBreak > maxLength * 0.7) {
        bestBreak = paragraphBreak;
      }
    }

    return bestBreak;
  }

  private static detectLanguage(text: string): string | undefined {
    // Simple language detection based on common patterns
    const patterns = {
      spanish: /\b(el|la|los|las|de|que|y|en|un|una)\b/gi,
      french: /\b(le|la|les|de|et|un|une|que|dans)\b/gi,
      german: /\b(der|die|das|und|in|von|zu|mit|auf)\b/gi,
    };

    const counts: Record<string, number> = {};
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches) {
        counts[lang] = matches.length;
      }
    }

    const detectedLang = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0];

    return detectedLang && detectedLang[1] > 5 ? detectedLang[0] : undefined;
  }

  private static containsMathSymbols(text: string): boolean {
    const mathPatterns = [
      /[∑∏∫∂∇≈≠≤≥±∞]/,
      /\b(sin|cos|tan|log|sqrt|exp)\b/i,
      /\^|\*\*/,
      /\d+\/\d+/
    ];

    return mathPatterns.some(pattern => pattern.test(text));
  }

  private static containsCodeBlock(text: string): boolean {
    const codePatterns = [
      /```[\s\S]*```/,
      /function\s*\w*\s*\(/,
      /if\s*\(.*\)\s*{/,
      /for\s*\(.*\)\s*{/,
      /class\s+\w+/,
      /import\s+.*from/,
    ];

    return codePatterns.some(pattern => pattern.test(text));
  }

  private static isStructuredDocument(text: string): boolean {
    // Check for document-like structure
    const hasHeaders = /^#+\s/m.test(text) || /^[A-Z][^.!?]*:$/m.test(text);
    const hasBulletPoints = /^[\*\-•]\s/m.test(text);
    const hasNumberedList = /^\d+\.\s/m.test(text);
    const hasMultipleSections = (text.match(/\n\n/g) || []).length > 5;

    return (hasHeaders || hasBulletPoints || hasNumberedList) && hasMultipleSections;
  }

  private static extractKeyPoints(text: string): string {
    // Extract first paragraph and any bullet points
    const paragraphs = text.split(/\n\n+/);
    const firstParagraph = paragraphs[0];
    
    // Find bullet points or numbered lists
    const bulletPoints = text.match(/^[\*\-•]\s.+$/gm) || [];
    const numberedPoints = text.match(/^\d+\.\s.+$/gm) || [];
    
    let extracted = firstParagraph;
    
    if (bulletPoints.length > 0) {
      extracted += `\n\nKey points:\n${  bulletPoints.slice(0, 5).join('\n')}`;
    } else if (numberedPoints.length > 0) {
      extracted += `\n\nMain items:\n${  numberedPoints.slice(0, 5).join('\n')}`;
    }

    return extracted;
  }

  private static extractFirstSection(text: string): string {
    // Try to extract the first meaningful section
    const sections = text.split(/\n\n+/);
    
    // Skip very short sections (likely titles)
    for (const section of sections) {
      if (section.trim().length > 50) {
        return section.trim();
      }
    }

    return sections[0] || text.substring(0, 500);
  }

  // Validate specific action types
  static validateAction(action: string, data?: any): {
    isValid: boolean;
    error?: string;
  } {
    const validActions = [
      'start', 'continue', 'refine', 'help', 'ideas', 'whatif',
      'tellmore', 'proceed', 'edit', 'text', 'card_select'
    ];

    if (!validActions.includes(action)) {
      return { isValid: false, error: `Invalid action: ${action}` };
    }

    // Validate action-specific data
    if (action === 'text' && (!data || typeof data !== 'string')) {
      return { isValid: false, error: 'Text action requires string data' };
    }

    if (action === 'card_select' && (!data || !data.id || !data.title)) {
      return { isValid: false, error: 'Card selection requires valid card data' };
    }

    return { isValid: true };
  }
}