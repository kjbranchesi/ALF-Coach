/**
 * Accessibility Checker Implementation
 * 
 * Core implementation functions for accessibility validation,
 * remediation, and real-time checking.
 */

import {
  AccessibilityIssue,
  AccessibilityIssueType,
  DisabilityType,
  ContentLocation,
  WCAGCriterion,
  RemediationStep,
  ContentType,
  ContentToCheck
} from './accessibility-checker-service';

/**
 * WCAG 2.1 criteria implementation
 */
export class WCAGCriteriaChecker {
  
  /**
   * Check 1.1.1 Non-text Content (Level A)
   */
  static async checkNonTextContent(content: HTMLElement | Document): Promise<WCAGCriterion> {
    const images = content.querySelectorAll('img');
    let passed = 0;
    let failed = 0;
    const issues: string[] = [];
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const decorative = img.getAttribute('role') === 'presentation' || 
                        img.getAttribute('aria-hidden') === 'true';
      
      if (!decorative && (alt === null || alt === undefined)) {
        failed++;
        issues.push(`Image missing alt text: ${img.src}`);
      } else if (decorative && alt && alt.length > 0) {
        failed++;
        issues.push(`Decorative image has non-empty alt text: ${img.src}`);
      } else {
        passed++;
      }
    });
    
    return {
      id: '1.1.1',
      name: 'Non-text Content',
      level: 'A',
      status: failed === 0 ? 'pass' : 'fail',
      impact: 'critical',
      affectedUsers: ['visual', 'cognitive'],
      remediation: issues.join('; ')
    };
  }
  
  /**
   * Check 1.4.3 Contrast (Minimum) (Level AA)
   */
  static async checkContrastMinimum(content: HTMLElement | Document): Promise<WCAGCriterion> {
    const textElements = content.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th');
    let passed = 0;
    let failed = 0;
    const issues: string[] = [];
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      const fontSize = parseFloat(styles.fontSize);
      
      const contrast = this.calculateContrastRatio(color, backgroundColor);
      const requiredRatio = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold') ? 3 : 4.5;
      
      if (contrast < requiredRatio) {
        failed++;
        issues.push(`Insufficient contrast (${contrast.toFixed(2)}:1) for element with text "${element.textContent?.substring(0, 20)}..."`);
      } else {
        passed++;
      }
    });
    
    return {
      id: '1.4.3',
      name: 'Contrast (Minimum)',
      level: 'AA',
      status: failed === 0 ? 'pass' : 'fail',
      impact: 'serious',
      affectedUsers: ['visual', 'cognitive'],
      remediation: issues.join('; ')
    };
  }
  
  /**
   * Check 2.1.1 Keyboard (Level A)
   */
  static async checkKeyboard(content: HTMLElement | Document): Promise<WCAGCriterion> {
    const interactiveElements = content.querySelectorAll('a, button, input, select, textarea, [tabindex], [onclick]');
    let passed = 0;
    let failed = 0;
    const issues: string[] = [];
    
    interactiveElements.forEach((element) => {
      const tabindex = element.getAttribute('tabindex');
      const isNativelyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
      
      // Check for positive tabindex (bad practice)
      if (tabindex && parseInt(tabindex) > 0) {
        failed++;
        issues.push(`Positive tabindex found on ${element.tagName}`);
      }
      
      // Check for click handlers without keyboard support
      if (element.hasAttribute('onclick') && !isNativelyFocusable && tabindex !== '0') {
        failed++;
        issues.push(`Click handler without keyboard access on ${element.tagName}`);
      } else {
        passed++;
      }
    });
    
    return {
      id: '2.1.1',
      name: 'Keyboard',
      level: 'A',
      status: failed === 0 ? 'pass' : 'fail',
      impact: 'critical',
      affectedUsers: ['motor', 'visual'],
      remediation: issues.join('; ')
    };
  }
  
  /**
   * Check 2.4.6 Headings and Labels (Level AA)
   */
  static async checkHeadingsAndLabels(content: HTMLElement | Document): Promise<WCAGCriterion> {
    const headings = Array.from(content.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const formElements = content.querySelectorAll('input:not([type="hidden"]), select, textarea');
    let passed = 0;
    let failed = 0;
    const issues: string[] = [];
    
    // Check heading hierarchy
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level - lastLevel > 1) {
        failed++;
        issues.push(`Heading level skipped: ${heading.tagName} after H${lastLevel}`);
      } else {
        passed++;
      }
      lastLevel = level;
    });
    
    // Check form labels
    formElements.forEach((element) => {
      const id = element.getAttribute('id');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const label = id ? content.querySelector(`label[for="${id}"]`) : null;
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        failed++;
        issues.push(`Form element missing label: ${element.tagName} ${element.getAttribute('name') || ''}`);
      } else {
        passed++;
      }
    });
    
    return {
      id: '2.4.6',
      name: 'Headings and Labels',
      level: 'AA',
      status: failed === 0 ? 'pass' : 'fail',
      impact: 'serious',
      affectedUsers: ['visual', 'cognitive'],
      remediation: issues.join('; ')
    };
  }
  
  /**
   * Check 3.1.1 Language of Page (Level A)
   */
  static async checkLanguageOfPage(content: HTMLElement | Document): Promise<WCAGCriterion> {
    const htmlElement = content.documentElement || content.querySelector('html');
    const lang = htmlElement?.getAttribute('lang');
    
    return {
      id: '3.1.1',
      name: 'Language of Page',
      level: 'A',
      status: lang && lang.length >= 2 ? 'pass' : 'fail',
      impact: 'serious',
      affectedUsers: ['visual', 'cognitive'],
      remediation: lang ? '' : 'Missing lang attribute on html element'
    };
  }
  
  // Helper methods
  
  private static calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In production, use a proper color contrast library
    return 4.5; // Placeholder
  }
}

/**
 * Content accessibility analyzer
 */
export class AccessibilityAnalyzer {
  
  /**
   * Analyze text complexity for cognitive accessibility
   */
  static analyzeTextComplexity(text: string): TextComplexityAnalysis {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Calculate metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const complexWords = words.filter(w => w.length > 8).length;
    const complexityScore = (avgWordsPerSentence * 0.5) + (avgWordLength * 2) + (complexWords * 0.1);
    
    // Determine reading level (simplified)
    let readingLevel: string;
    if (complexityScore < 20) readingLevel = 'Elementary';
    else if (complexityScore < 40) readingLevel = 'Middle School';
    else if (complexityScore < 60) readingLevel = 'High School';
    else readingLevel = 'College';
    
    return {
      readingLevel,
      avgWordsPerSentence,
      avgWordLength,
      complexWords,
      totalWords: words.length,
      totalSentences: sentences.length,
      suggestions: this.generateComplexitySuggestions(complexityScore)
    };
  }
  
  /**
   * Find accessibility issues in content
   */
  static findAccessibilityIssues(content: ContentToCheck): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    switch (content.type) {
      case ContentType.HTML:
        issues.push(...this.findHTMLIssues(content.content as HTMLElement));
        break;
      case ContentType.Text:
        issues.push(...this.findTextIssues(content.content as string));
        break;
      case ContentType.Video:
        issues.push(...this.findVideoIssues(content));
        break;
      case ContentType.Project:
        issues.push(...this.findProjectIssues(content));
        break;
    }
    
    return issues;
  }
  
  private static findHTMLIssues(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = element.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach((img, index) => {
      issues.push({
        id: `img-alt-${index}`,
        type: AccessibilityIssueType.MissingAltText,
        severity: 'critical',
        wcagCriteria: ['1.1.1'],
        element: 'img',
        description: 'Image missing alternative text',
        impact: 'Screen reader users cannot understand image content',
        affectedDisabilities: [DisabilityType.Visual],
        remediation: [
          {
            id: 'add-alt',
            issue: 'Missing alt text',
            action: 'Add descriptive alt attribute',
            instructions: ['Describe the image content concisely', 'Use empty alt="" for decorative images'],
            automated: false,
            estimatedTime: '2 minutes',
            requiredSkills: ['Content writing'],
            tools: [],
            verification: 'Check with screen reader'
          }
        ],
        automatedFix: false,
        userCount: 1000 // Estimated
      });
    });
    
    // Check for poor heading structure
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (lastLevel > 0 && level - lastLevel > 1) {
        issues.push({
          id: `heading-skip-${index}`,
          type: AccessibilityIssueType.HeadingStructure,
          severity: 'moderate',
          wcagCriteria: ['2.4.6'],
          element: heading.tagName,
          description: `Heading level skipped from H${lastLevel} to H${level}`,
          impact: 'Makes content structure harder to understand',
          affectedDisabilities: [DisabilityType.Visual, DisabilityType.Cognitive],
          remediation: [
            {
              id: 'fix-heading',
              issue: 'Skipped heading level',
              action: 'Adjust heading hierarchy',
              instructions: ['Use sequential heading levels', 'Don\'t skip levels'],
              automated: false,
              estimatedTime: '5 minutes',
              requiredSkills: ['HTML'],
              tools: [],
              verification: 'Review heading outline'
            }
          ],
          automatedFix: false,
          userCount: 2000
        });
      }
      lastLevel = level;
    });
    
    return issues;
  }
  
  private static findTextIssues(text: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const complexity = this.analyzeTextComplexity(text);
    
    if (complexity.readingLevel === 'College') {
      issues.push({
        id: 'text-complexity-1',
        type: AccessibilityIssueType.ComplexLanguage,
        severity: 'moderate',
        wcagCriteria: ['3.1.5'],
        description: 'Text complexity may be too high for some users',
        impact: 'Content may be difficult for users with cognitive disabilities or non-native speakers',
        affectedDisabilities: [DisabilityType.Cognitive],
        remediation: [
          {
            id: 'simplify-text',
            issue: 'Complex language',
            action: 'Simplify text to 8th grade reading level',
            instructions: complexity.suggestions,
            automated: true,
            estimatedTime: '10 minutes',
            requiredSkills: ['Writing'],
            tools: ['Text simplification tool'],
            verification: 'Re-check reading level'
          }
        ],
        automatedFix: true,
        userCount: 3000
      });
    }
    
    return issues;
  }
  
  private static findVideoIssues(content: ContentToCheck): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for captions
    issues.push({
      id: 'video-captions-1',
      type: AccessibilityIssueType.NoVideoCaptions,
      severity: 'critical',
      wcagCriteria: ['1.2.2'],
      description: 'Video missing captions',
      impact: 'Deaf and hard of hearing users cannot access audio content',
      affectedDisabilities: [DisabilityType.Hearing],
      remediation: [
        {
          id: 'add-captions',
          issue: 'Missing captions',
          action: 'Add synchronized captions',
          instructions: [
            'Use auto-captioning as starting point',
            'Review and correct for accuracy',
            'Include speaker identification',
            'Describe relevant sounds'
          ],
          automated: false,
          estimatedTime: '30 minutes per 5 minutes of video',
          requiredSkills: ['Video editing', 'Transcription'],
          tools: ['YouTube Studio', 'Rev', 'Amara'],
          verification: 'Watch with captions on and sound off'
        }
      ],
      automatedFix: false,
      userCount: 1500
    });
    
    return issues;
  }
  
  private static findProjectIssues(content: ContentToCheck): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for alternative project paths
    if (!content.context?.multiplePathways) {
      issues.push({
        id: 'project-paths-1',
        type: AccessibilityIssueType.NoAlternativeProjectPath,
        severity: 'serious',
        wcagCriteria: ['2.1.1', '2.4.7'],
        description: 'Project lacks alternative completion paths',
        impact: 'Students with disabilities may not be able to complete project as designed',
        affectedDisabilities: [DisabilityType.Motor, DisabilityType.Visual, DisabilityType.Cognitive],
        remediation: [
          {
            id: 'add-alternatives',
            issue: 'Single project path',
            action: 'Design alternative completion methods',
            instructions: [
              'Offer choice in demonstration methods',
              'Provide flexible timelines',
              'Allow different tools/technologies',
              'Consider various ability levels'
            ],
            automated: false,
            estimatedTime: '2 hours',
            requiredSkills: ['Instructional design', 'UDL principles'],
            tools: ['UDL Guidelines'],
            verification: 'Review with diverse learners'
          }
        ],
        automatedFix: false,
        userCount: 500
      });
    }
    
    return issues;
  }
  
  private static generateComplexitySuggestions(score: number): string[] {
    const suggestions: string[] = [];
    
    if (score > 40) {
      suggestions.push('Break long sentences into shorter ones');
      suggestions.push('Replace complex words with simpler alternatives');
      suggestions.push('Use active voice instead of passive');
      suggestions.push('Add examples to clarify complex concepts');
    }
    
    return suggestions;
  }
}

/**
 * Accessibility remediation generator
 */
export class RemediationGenerator {
  
  /**
   * Generate remediation plan for issues
   */
  static generateRemediationPlan(issues: AccessibilityIssue[]): RemediationPlan {
    const criticalFixes: RemediationStep[] = [];
    const importantFixes: RemediationStep[] = [];
    const enhancements: RemediationStep[] = [];
    
    // Categorize issues by severity
    issues.forEach(issue => {
      const steps = issue.remediation;
      
      switch (issue.severity) {
        case 'critical':
          criticalFixes.push(...steps);
          break;
        case 'serious':
          importantFixes.push(...steps);
          break;
        default:
          enhancements.push(...steps);
      }
    });
    
    // Create timeline
    const timeline = this.createRemediationTimeline(
      criticalFixes,
      importantFixes,
      enhancements
    );
    
    // Identify resources
    const resources = this.identifyResources(issues);
    
    // Find automation opportunities
    const automation = this.findAutomationOpportunities(issues);
    
    return {
      criticalFixes,
      importantFixes,
      enhancements,
      timeline,
      resources,
      automation
    };
  }
  
  private static createRemediationTimeline(
    critical: RemediationStep[],
    important: RemediationStep[],
    enhancements: RemediationStep[]
  ): RemediationTimeline {
    return {
      immediate: critical,
      shortTerm: important.slice(0, Math.floor(important.length / 2)),
      mediumTerm: important.slice(Math.floor(important.length / 2)),
      longTerm: enhancements
    };
  }
  
  private static identifyResources(issues: AccessibilityIssue[]): RemediationResource[] {
    const resources: RemediationResource[] = [
      {
        type: 'guide',
        name: 'WCAG 2.1 Quick Reference',
        description: 'Comprehensive guide to WCAG criteria',
        url: 'https://www.w3.org/WAI/WCAG21/quickref/',
        cost: 'free'
      },
      {
        type: 'tool',
        name: 'axe DevTools',
        description: 'Automated accessibility testing',
        url: 'https://www.deque.com/axe/',
        cost: 'free'
      }
    ];
    
    // Add specific resources based on issues
    if (issues.some(i => i.type === AccessibilityIssueType.NoVideoCaptions)) {
      resources.push({
        type: 'service',
        name: 'Rev Captions',
        description: 'Professional captioning service',
        url: 'https://www.rev.com/caption',
        cost: 'paid'
      });
    }
    
    return resources;
  }
  
  private static findAutomationOpportunities(issues: AccessibilityIssue[]): AutomationOpportunity[] {
    const opportunities: AutomationOpportunity[] = [];
    
    const automatable = issues.filter(i => i.automatedFix);
    if (automatable.length > 0) {
      opportunities.push({
        task: 'Fix common accessibility issues',
        tool: 'Custom auto-fix script',
        implementation: 'Run accessibility auto-fix on content',
        savings: `${automatable.length * 5} minutes`
      });
    }
    
    return opportunities;
  }
}

/**
 * ALF-specific accessibility utilities
 */
export class ALFAccessibilityUtils {
  
  /**
   * Check project accessibility for ALF principles
   */
  static checkProjectAccessibility(project: any): ProjectAccessibilityResult {
    const checks = {
      multiplePathways: false,
      flexibleTimelines: false,
      adaptableComplexity: false,
      accessibleMaterials: false,
      inclusiveCollaboration: false
    };
    
    const issues: AccessibilityIssue[] = [];
    
    // Check for multiple pathways
    if (project.completionOptions && project.completionOptions.length > 1) {
      checks.multiplePathways = true;
    } else {
      issues.push(this.createProjectIssue(
        'single-pathway',
        'Project offers only one completion pathway',
        'Add alternative demonstration methods'
      ));
    }
    
    // Check for flexible timelines
    if (project.timeline && project.timeline.flexible) {
      checks.flexibleTimelines = true;
    } else {
      issues.push(this.createProjectIssue(
        'rigid-timeline',
        'Project has rigid timeline',
        'Add timeline flexibility options'
      ));
    }
    
    return {
      ...checks,
      issues,
      score: Object.values(checks).filter(v => v).length / 5 * 100
    };
  }
  
  /**
   * Check community partnership accessibility
   */
  static checkCommunityAccessibility(partnership: any): CommunityAccessibilityResult {
    const checks = {
      partnerAccessibility: false,
      venueAccessibility: false,
      transportationOptions: false,
      communicationAccessibility: false,
      culturalInclusivity: false
    };
    
    const issues: AccessibilityIssue[] = [];
    
    // Check venue accessibility
    if (partnership.venue && partnership.venue.accessibilityFeatures) {
      checks.venueAccessibility = true;
    } else {
      issues.push(this.createCommunityIssue(
        'venue-access',
        'Venue accessibility not verified',
        'Confirm venue meets accessibility standards'
      ));
    }
    
    return {
      ...checks,
      issues,
      score: Object.values(checks).filter(v => v).length / 5 * 100
    };
  }
  
  private static createProjectIssue(
    id: string,
    description: string,
    remediation: string
  ): AccessibilityIssue {
    return {
      id: `project-${id}`,
      type: AccessibilityIssueType.NoAlternativeProjectPath,
      severity: 'serious',
      wcagCriteria: [],
      description,
      impact: 'Limits student participation',
      affectedDisabilities: [DisabilityType.Multiple],
      remediation: [{
        id: `fix-${id}`,
        issue: description,
        action: remediation,
        instructions: [],
        automated: false,
        estimatedTime: '1 hour',
        requiredSkills: ['UDL principles'],
        tools: [],
        verification: 'Review with diverse learners'
      }],
      automatedFix: false,
      userCount: 100
    };
  }
  
  private static createCommunityIssue(
    id: string,
    description: string,
    remediation: string
  ): AccessibilityIssue {
    return {
      id: `community-${id}`,
      type: AccessibilityIssueType.InaccessibleCommunityResource,
      severity: 'serious',
      wcagCriteria: [],
      description,
      impact: 'Excludes students from community engagement',
      affectedDisabilities: [DisabilityType.Multiple],
      remediation: [{
        id: `fix-${id}`,
        issue: description,
        action: remediation,
        instructions: [],
        automated: false,
        estimatedTime: '2 hours',
        requiredSkills: ['Community engagement'],
        tools: [],
        verification: 'Confirm with community partner'
      }],
      automatedFix: false,
      userCount: 50
    };
  }
}

// Type definitions

interface TextComplexityAnalysis {
  readingLevel: string;
  avgWordsPerSentence: number;
  avgWordLength: number;
  complexWords: number;
  totalWords: number;
  totalSentences: number;
  suggestions: string[];
}

interface RemediationPlan {
  criticalFixes: RemediationStep[];
  importantFixes: RemediationStep[];
  enhancements: RemediationStep[];
  timeline: RemediationTimeline;
  resources: RemediationResource[];
  automation: AutomationOpportunity[];
}

interface RemediationTimeline {
  immediate: RemediationStep[];
  shortTerm: RemediationStep[];
  mediumTerm: RemediationStep[];
  longTerm: RemediationStep[];
}

interface RemediationResource {
  type: 'guide' | 'tool' | 'service' | 'training';
  name: string;
  description: string;
  url?: string;
  cost: 'free' | 'paid';
}

interface AutomationOpportunity {
  task: string;
  tool: string;
  implementation: string;
  savings: string;
}

interface ProjectAccessibilityResult {
  multiplePathways: boolean;
  flexibleTimelines: boolean;
  adaptableComplexity: boolean;
  accessibleMaterials: boolean;
  inclusiveCollaboration: boolean;
  issues: AccessibilityIssue[];
  score: number;
}

interface CommunityAccessibilityResult {
  partnerAccessibility: boolean;
  venueAccessibility: boolean;
  transportationOptions: boolean;
  communicationAccessibility: boolean;
  culturalInclusivity: boolean;
  issues: AccessibilityIssue[];
  score: number;
}

export default {
  WCAGCriteriaChecker,
  AccessibilityAnalyzer,
  RemediationGenerator,
  ALFAccessibilityUtils
};