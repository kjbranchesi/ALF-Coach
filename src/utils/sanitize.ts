/**
 * XSS Prevention and Content Sanitization
 *
 * CRITICAL SECURITY: All user-generated content MUST be sanitized before rendering
 * to prevent Cross-Site Scripting (XSS) attacks and session token theft.
 *
 * Attack vectors include:
 * - Project titles, descriptions, topics
 * - AI-generated content (showcases, run-of-show, assignments)
 * - User profile data
 * - Chat messages
 *
 * @module sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Sanitization configuration presets
 */
export const SanitizePresets = {
  /**
   * STRICT: Remove all HTML tags and attributes
   * Use for: Titles, short text fields, metadata
   */
  STRICT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },

  /**
   * BASIC_TEXT: Allow basic formatting (bold, italic, paragraphs, lists)
   * Use for: Descriptions, user bios, general content
   */
  BASIC_TEXT: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },

  /**
   * RICH_CONTENT: Allow rich formatting including links and headings
   * Use for: AI-generated showcases, assignments, rich descriptions
   */
  RICH_CONTENT: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: {
      a: ['href', 'title', 'target', 'rel'],
    },
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
  },

  /**
   * MARKDOWN_SAFE: Similar to rich content but more permissive for markdown rendering
   * Use for: Markdown-rendered content, documentation
   */
  MARKDOWN_SAFE: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'strike', 'del',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'img',
    ],
    ALLOWED_ATTR: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'], // For syntax highlighting
    },
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
  },
} as const;

/**
 * Sanitize user content with strict filtering (removes all HTML)
 *
 * @param content - User-provided content to sanitize
 * @returns Sanitized plain text with no HTML tags
 *
 * @example
 * ```typescript
 * const userTitle = '<img src=x onerror="alert(1)">My Project';
 * const safe = sanitizeStrict(userTitle);
 * // Returns: "My Project"
 * ```
 */
export function sanitizeStrict(content: string | null | undefined): string {
  if (!content) {return '';}
  return DOMPurify.sanitize(String(content), SanitizePresets.STRICT);
}

/**
 * Sanitize content allowing basic text formatting
 *
 * @param content - Content with basic HTML formatting
 * @returns Sanitized content with safe formatting tags only
 *
 * @example
 * ```typescript
 * const description = '<p>This is <strong>bold</strong> text</p><script>alert(1)</script>';
 * const safe = sanitizeBasicText(description);
 * // Returns: "<p>This is <strong>bold</strong> text</p>"
 * ```
 */
export function sanitizeBasicText(content: string | null | undefined): string {
  if (!content) {return '';}
  return DOMPurify.sanitize(String(content), SanitizePresets.BASIC_TEXT);
}

/**
 * Sanitize rich content allowing formatting, links, and headings
 *
 * @param content - Rich HTML content
 * @returns Sanitized content with safe rich formatting
 *
 * @example
 * ```typescript
 * const showcase = '<h2>Phase 1</h2><p>Students will <a href="https://example.com">research</a>...</p>';
 * const safe = sanitizeRichContent(showcase);
 * // Returns: Sanitized version with links converted to safe format
 * ```
 */
export function sanitizeRichContent(content: string | null | undefined): string {
  if (!content) {return '';}

  // Add rel="noopener noreferrer" to all external links for security
  const config = {
    ...SanitizePresets.RICH_CONTENT,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  };

  const sanitized = DOMPurify.sanitize(String(content), config);

  // Post-process links to add security attributes
  return sanitized.replace(
    /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
    (match, attrs) => {
      // Check if target="_blank" is present
      const hasBlank = /target\s*=\s*["']_blank["']/i.test(attrs);
      const hasRel = /rel\s*=/i.test(attrs);

      if (hasBlank && !hasRel) {
        return `<a ${attrs} rel="noopener noreferrer">`;
      }
      if (hasBlank && hasRel) {
        // Ensure noopener noreferrer is included
        return match.replace(
          /rel\s*=\s*["']([^"']*)["']/i,
          (relMatch, relValue) => {
            const rels = new Set(relValue.split(/\s+/));
            rels.add('noopener');
            rels.add('noreferrer');
            return `rel="${Array.from(rels).join(' ')}"`;
          }
        );
      }
      return match;
    }
  );
}

/**
 * Sanitize markdown-rendered content
 *
 * @param content - Markdown-rendered HTML
 * @returns Sanitized content safe for rendering
 */
export function sanitizeMarkdown(content: string | null | undefined): string {
  if (!content) {return '';}
  return DOMPurify.sanitize(String(content), SanitizePresets.MARKDOWN_SAFE);
}

/**
 * Sanitize with custom DOMPurify config
 *
 * @param content - Content to sanitize
 * @param config - Custom DOMPurify configuration
 * @returns Sanitized content
 */
export function sanitizeCustom(
  content: string | null | undefined,
  config: DOMPurify.Config
): string {
  if (!content) {return '';}
  return DOMPurify.sanitize(String(content), config);
}

/**
 * Type-safe sanitization for project data
 * Automatically applies appropriate sanitization to each field
 */
export interface SanitizedProjectData {
  title: string;
  topic: string;
  description: string;
  gradeLevel: string;
  subjects: string[];
  duration: string;
  [key: string]: any;
}

/**
 * Sanitize all user-facing fields in project data
 *
 * @param data - Raw project data from storage
 * @returns Project data with all fields sanitized
 *
 * @example
 * ```typescript
 * const raw = await loadProjectFromStorage(id);
 * const safe = sanitizeProjectData(raw);
 * // Now safe to render in UI
 * ```
 */
export function sanitizeProjectData(data: any): SanitizedProjectData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid project data: expected object');
  }

  return {
    ...data,
    // Strict sanitization for titles and short fields
    title: sanitizeStrict(data.title),
    topic: sanitizeStrict(data.topic),
    gradeLevel: sanitizeStrict(data.gradeLevel),
    duration: sanitizeStrict(data.duration),

    // Basic text for descriptions
    description: sanitizeBasicText(data.description),

    // Array fields
    subjects: Array.isArray(data.subjects)
      ? data.subjects.map((s: any) => sanitizeStrict(String(s)))
      : [],

    // Rich content fields (if present)
    ...(data.essentialQuestion && {
      essentialQuestion: sanitizeBasicText(data.essentialQuestion),
    }),
    ...(data.challenge && {
      challenge: sanitizeBasicText(data.challenge),
    }),
  };
}

/**
 * Sanitize showcase content (AI-generated content with rich formatting)
 *
 * @param showcase - Raw showcase data
 * @returns Sanitized showcase
 */
export function sanitizeShowcase(showcase: any): any {
  if (!showcase || typeof showcase !== 'object') {
    return showcase;
  }

  const sanitized: any = { ...showcase };

  // Sanitize microOverview
  if (typeof sanitized.microOverview === 'string') {
    sanitized.microOverview = sanitizeRichContent(sanitized.microOverview);
  }

  // Sanitize runOfShow phases
  if (Array.isArray(sanitized.runOfShow)) {
    sanitized.runOfShow = sanitized.runOfShow.map((phase: any) => ({
      ...phase,
      title: sanitizeStrict(phase.title),
      description: sanitizeRichContent(phase.description),
      activities: Array.isArray(phase.activities)
        ? phase.activities.map((activity: any) =>
            typeof activity === 'string'
              ? sanitizeRichContent(activity)
              : activity
          )
        : phase.activities,
    }));
  }

  // Sanitize assignments
  if (Array.isArray(sanitized.assignments)) {
    sanitized.assignments = sanitized.assignments.map((assignment: any) => ({
      ...assignment,
      title: sanitizeStrict(assignment.title),
      description: sanitizeRichContent(assignment.description),
      instructions: sanitizeRichContent(assignment.instructions),
    }));
  }

  // Sanitize outcomes
  if (Array.isArray(sanitized.outcomes)) {
    sanitized.outcomes = sanitized.outcomes.map((outcome: any) =>
      typeof outcome === 'string' ? sanitizeBasicText(outcome) : outcome
    );
  }

  return sanitized;
}

/**
 * Validation: Check if content is safe (for testing/debugging)
 *
 * @param content - Content to check
 * @returns True if content appears safe, false if potentially malicious
 */
export function isSafeContent(content: string): boolean {
  if (!content) {return true;}

  // Check for common XSS patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers like onclick=
    /javascript:/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(content));
}

/**
 * React hook for sanitizing content in components
 *
 * @example
 * ```tsx
 * function ProjectCard({ project }) {
 *   const safeProject = useSanitize(project);
 *   return <div>{safeProject.title}</div>;
 * }
 * ```
 */
export function useSanitizeProject(data: any): SanitizedProjectData {
  // In React, we'd use useMemo for performance
  // For now, just sanitize directly
  return sanitizeProjectData(data);
}
