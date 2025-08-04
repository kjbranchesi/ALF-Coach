/**
 * Utility function for combining class names
 * Similar to clsx but simplified for our use case
 */

export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}