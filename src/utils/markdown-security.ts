/**
 * markdown-security.ts
 * 
 * Centralized security configuration and utilities for markdown rendering
 * Implements defense-in-depth security practices
 */

// Content Security Policy for markdown content
export const MARKDOWN_CSP = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'https:', 'data:'],
  'style-src': ["'self'", "'unsafe-inline'"], // Required for syntax highlighting
  'script-src': ["'none'"], // No JavaScript execution in markdown
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"]
};

// Rate limiting configuration
export const RATE_LIMITS = {
  maxMessagesPerMinute: 30,
  maxContentLengthPerMessage: 50000,
  maxCodeBlockLength: 10000,
  maxImageSize: 5 * 1024 * 1024, // 5MB
} as const;

// Allowed protocols for links
export const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const;

// Dangerous patterns to watch for
export const SECURITY_PATTERNS = {
  // XSS attempts
  scriptTags: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  eventHandlers: /on\w+\s*=/gi,
  javascriptUrls: /javascript:/gi,
  dataUrls: /data:(?!image\/)/gi, // Allow image data URLs only
  
  // HTML injection attempts
  iframeTags: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  objectTags: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  embedTags: /<embed\b[^<]*>/gi,
  
  // Potential markdown abuse
  excessiveNesting: /(?:#{6,}|>{20,}|\*{10,})/g,
  suspiciousUrls: /(?:file|ftp|blob|filesystem):/gi,
} as const;

/**
 * Validates URL safety
 */
export function isUrlSafe(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol as any)) {
      return false;
    }
    
    // Block potentially dangerous domains
    const hostname = urlObj.hostname.toLowerCase();
    const dangerousDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'internal',
      'private',
    ];
    
    if (dangerousDomains.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // Check for suspicious patterns
    if (SECURITY_PATTERNS.suspiciousUrls.test(url)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Scans content for security issues
 */
export function scanContentSecurity(content: string): {
  safe: boolean;
  issues: string[];
  sanitizedContent: string;
} {
  const issues: string[] = [];
  let sanitizedContent = content;
  
  // Check for script injection
  if (SECURITY_PATTERNS.scriptTags.test(content)) {
    issues.push('Script tags detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.scriptTags, '[Removed: Script tag]');
  }
  
  // Check for event handlers
  if (SECURITY_PATTERNS.eventHandlers.test(content)) {
    issues.push('Event handlers detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.eventHandlers, 'removed=');
  }
  
  // Check for JavaScript URLs
  if (SECURITY_PATTERNS.javascriptUrls.test(content)) {
    issues.push('JavaScript URLs detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.javascriptUrls, 'removed:');
  }
  
  // Check for suspicious data URLs
  if (SECURITY_PATTERNS.dataUrls.test(content)) {
    issues.push('Suspicious data URLs detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.dataUrls, 'removed:');
  }
  
  // Check for iframe injection
  if (SECURITY_PATTERNS.iframeTags.test(content)) {
    issues.push('Iframe tags detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.iframeTags, '[Removed: Iframe]');
  }
  
  // Check for object/embed tags
  if (SECURITY_PATTERNS.objectTags.test(content) || SECURITY_PATTERNS.embedTags.test(content)) {
    issues.push('Object/embed tags detected');
    sanitizedContent = sanitizedContent
      .replace(SECURITY_PATTERNS.objectTags, '[Removed: Object tag]')
      .replace(SECURITY_PATTERNS.embedTags, '[Removed: Embed tag]');
  }
  
  // Check for excessive nesting (DoS prevention)
  if (SECURITY_PATTERNS.excessiveNesting.test(content)) {
    issues.push('Excessive markdown nesting detected');
    sanitizedContent = sanitizedContent.replace(SECURITY_PATTERNS.excessiveNesting, (match) => {
      // Limit to reasonable nesting levels
      if (match.startsWith('#')) {return '######';} // Max 6 heading levels
      if (match.startsWith('>')) {return '> > > > >';} // Max 5 quote levels  
      if (match.startsWith('*')) {return '***';} // Max 3 emphasis levels
      return match;
    });
  }
  
  return {
    safe: issues.length === 0,
    issues,
    sanitizedContent
  };
}

/**
 * Comprehensive content validation
 */
export function validateMarkdownContent(content: string): {
  isValid: boolean;
  errors: string[];
  processedContent: string;
} {
  const errors: string[] = [];
  
  // Length validation
  if (content.length > RATE_LIMITS.maxContentLengthPerMessage) {
    errors.push(`Content too long: ${content.length} > ${RATE_LIMITS.maxContentLengthPerMessage}`);
    content = `${content.substring(0, RATE_LIMITS.maxContentLengthPerMessage)  }\n\n[Content truncated]`;
  }
  
  // Security scan
  const securityResults = scanContentSecurity(content);
  if (!securityResults.safe) {
    errors.push(...securityResults.issues);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    processedContent: securityResults.sanitizedContent
  };
}

/**
 * Rate limiting utility
 */
export class MarkdownRateLimit {
  private messageTimestamps: number[] = [];
  
  public canProcessMessage(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Remove old timestamps
    this.messageTimestamps = this.messageTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Check if under limit
    if (this.messageTimestamps.length >= RATE_LIMITS.maxMessagesPerMinute) {
      return false;
    }
    
    // Record this message
    this.messageTimestamps.push(now);
    return true;
  }
  
  public getTimeUntilReset(): number {
    if (this.messageTimestamps.length === 0) {return 0;}
    
    const oldestTimestamp = Math.min(...this.messageTimestamps);
    const resetTime = oldestTimestamp + 60 * 1000;
    return Math.max(0, resetTime - Date.now());
  }
}