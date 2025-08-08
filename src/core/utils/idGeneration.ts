/**
 * Secure ID generation utilities
 * Replaces predictable Date.now() with cryptographically secure alternatives
 */

/**
 * Generate a cryptographically secure random ID
 * Uses crypto.getRandomValues() when available, fallback for older browsers
 */
export function generateSecureId(prefix?: string): string {
  // Use crypto.getRandomValues for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    const randomId = Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
    return prefix ? `${prefix}-${randomId}` : randomId;
  }
  
  // Fallback for environments without crypto (should be rare)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const fallbackId = `${timestamp}-${randomPart}`;
  return prefix ? `${prefix}-${fallbackId}` : fallbackId;
}

/**
 * Validate that an ID follows expected format patterns
 */
export function isValidId(id: string): boolean {
  // Allow alphanumeric characters, hyphens, and underscores
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 4 && id.length <= 50;
}