/**
 * Simple Accessibility Helper
 * 
 * Basic accessibility utilities for ALF Coach alpha version
 */

export interface AccessibilityCheck {
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export class SimpleAccessibilityHelper {
  /**
   * Basic contrast check
   */
  static checkContrast(foreground: string, background: string): AccessibilityCheck {
    // Simplified check - in reality would calculate actual contrast ratio
    const darkColors = ['black', '#000', '#333', '#666'];
    const lightColors = ['white', '#fff', '#eee', '#ddd'];
    
    const isDarkFg = darkColors.some(c => foreground.toLowerCase().includes(c));
    const isLightBg = lightColors.some(c => background.toLowerCase().includes(c));
    
    return {
      passed: (isDarkFg && isLightBg) || (!isDarkFg && !isLightBg),
      message: 'Check color contrast for readability',
      severity: 'warning'
    };
  }
  
  /**
   * Check for alt text on images
   */
  static checkAltText(element: HTMLElement): AccessibilityCheck[] {
    const checks: AccessibilityCheck[] = [];
    const images = element.querySelectorAll('img');
    
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        checks.push({
          passed: false,
          message: `Image ${index + 1} missing alt text`,
          severity: 'error'
        });
      }
    });
    
    if (checks.length === 0) {
      checks.push({
        passed: true,
        message: 'All images have alt text',
        severity: 'info'
      });
    }
    
    return checks;
  }
  
  /**
   * Simple reading level estimate
   */
  static estimateReadingLevel(text: string): string {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    
    if (avgWordsPerSentence < 10) return 'Elementary';
    if (avgWordsPerSentence < 15) return 'Middle School';
    if (avgWordsPerSentence < 20) return 'High School';
    return 'College';
  }
  
  /**
   * Check for heading structure
   */
  static checkHeadings(element: HTMLElement): AccessibilityCheck {
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    let skipped = false;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (lastLevel > 0 && level - lastLevel > 1) {
        skipped = true;
      }
      lastLevel = level;
    });
    
    return {
      passed: !skipped,
      message: skipped ? 'Heading levels should not skip' : 'Heading structure is good',
      severity: skipped ? 'warning' : 'info'
    };
  }
}

export default SimpleAccessibilityHelper;