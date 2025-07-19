/**
 * Clean age group text while preserving teacher's original phrasing
 * Ensures "year-olds" format for numeric ages, otherwise capitalizes first letter
 */
export function cleanAge(str: string): string {
  if (!str) return '';
  
  const trimmed = str.trim();
  if (!trimmed) return '';
  
  // Check if it contains numbers and "year" but not "year-olds"
  const hasYear = /\byear\b/i.test(trimmed);
  const hasYearOlds = /\byear-olds?\b/i.test(trimmed);
  const hasNumbers = /\d+/.test(trimmed);
  
  if (hasNumbers && hasYear && !hasYearOlds) {
    // Convert "15 year" or "15 years" to "15 year-olds"
    return trimmed.replace(/(\d+)\s*years?\b/gi, '$1 year-olds');
  }
  
  // Otherwise just capitalize first letter and return as-is
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Paraphrase idea text to 8-12 words, removing trailing punctuation
 * Keeps the core meaning while cleaning up rough input
 */
export function paraphrase(str: string): string {
  if (!str) return '';
  
  const trimmed = str.trim();
  if (!trimmed) return '';
  
  // Split into words and take first 8-12
  const words = trimmed.split(/\s+/);
  const truncated = words.slice(0, Math.min(12, words.length));
  
  // Join and remove trailing punctuation
  let result = truncated.join(' ');
  result = result.replace(/[.,;:!?]+$/, '');
  
  // Basic cleanup for common issues
  result = result.replace(/^and\s+/i, ''); // Remove leading "and"
  result = result.replace(/\s*,\s*and\s*/, ' and '); // Clean up "Crackers, and" to "Crackers and"
  
  return result;
}

/**
 * Check if materials string has meaningful content
 */
export function hasMaterials(str: string): boolean {
  return str && str.trim().length > 0;
}

/**
 * LocalStorage key for onboarding data
 */
export const ONBOARD_STORAGE_KEY = 'pc_onboard';

/**
 * Onboarding data structure
 */
export interface OnboardData {
  done: boolean;
  subject: string;
  ageGroup: string;
  idea: string;
  materials: string;
}

/**
 * Get onboarding data from localStorage
 */
export function getOnboardData(): OnboardData | null {
  try {
    const stored = localStorage.getItem(ONBOARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save onboarding data to localStorage
 */
export function saveOnboardData(data: OnboardData): void {
  try {
    localStorage.setItem(ONBOARD_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Check if onboarding is completed
 */
export function isOnboardingComplete(): boolean {
  const data = getOnboardData();
  return data?.done === true;
}