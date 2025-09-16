/**
 * Spacing Configuration
 * Centralized spacing system for consistent header clearance and layout spacing
 */

// Header spacing constants
export const HEADER_CONSTANTS = {
  // Fixed header height
  HEIGHT: 80, // 80px = 5rem = pt-20

  // Spacing variations for different page types
  CLEARANCE: {
    // Minimal spacing for full-screen experiences
    MINIMAL: 'pt-20', // 80px - matches header height exactly

    // Standard spacing for comfortable viewing
    STANDARD: 'pt-24', // 96px - header + 16px breathing room

    // Generous spacing for content-heavy pages
    GENEROUS: 'pt-28', // 112px - header + 32px breathing room

    // Extra generous for hero sections
    HERO: 'pt-32', // 128px - header + 48px breathing room
  },

  // Responsive spacing adjustments
  RESPONSIVE: {
    MOBILE: 'pt-20 md:pt-24', // Compact on mobile, standard on tablet+
    STANDARD: 'pt-24 lg:pt-28', // Standard on small, generous on large
    GENEROUS: 'pt-28 lg:pt-32', // Generous on small, hero on large
  }
} as const;

// Page type spacing mapping
export const PAGE_SPACING = {
  // Chat and blueprint pages need minimal spacing for full-screen experience
  CHAT: HEADER_CONSTANTS.CLEARANCE.MINIMAL,
  BLUEPRINT: HEADER_CONSTANTS.CLEARANCE.MINIMAL,
  PROJECT: HEADER_CONSTANTS.CLEARANCE.MINIMAL,

  // Landing page needs generous spacing for hero impact
  LANDING: HEADER_CONSTANTS.CLEARANCE.GENEROUS,

  // Dashboard needs comfortable standard spacing
  DASHBOARD: HEADER_CONSTANTS.CLEARANCE.STANDARD,

  // Content-heavy pages need generous spacing
  SAMPLES_GALLERY: HEADER_CONSTANTS.CLEARANCE.GENEROUS,
  SAMPLE_DETAIL: HEADER_CONSTANTS.CLEARANCE.GENEROUS,
  REVIEW: HEADER_CONSTANTS.CLEARANCE.GENEROUS,

  // Default for other pages
  DEFAULT: HEADER_CONSTANTS.CLEARANCE.MINIMAL,
} as const;

// Helper function to get spacing based on page type
export const getLayoutSpacing = (pageType: keyof typeof PAGE_SPACING): string => {
  return PAGE_SPACING[pageType] || PAGE_SPACING.DEFAULT;
};

// Helper function to get responsive spacing based on context
export const getResponsiveHeaderSpacing = (context: 'minimal' | 'standard' | 'generous'): string => {
  switch (context) {
    case 'minimal':
      return HEADER_CONSTANTS.RESPONSIVE.MOBILE;
    case 'standard':
      return HEADER_CONSTANTS.RESPONSIVE.STANDARD;
    case 'generous':
      return HEADER_CONSTANTS.RESPONSIVE.GENEROUS;
    default:
      return HEADER_CONSTANTS.CLEARANCE.MINIMAL;
  }
};

// Layout spacing utility for common patterns
export const LAYOUT_SPACING = {
  // Standard page container padding
  CONTAINER: 'px-4 sm:px-6 lg:px-8',

  // Section spacing
  SECTION: {
    COMPACT: 'py-8',
    STANDARD: 'py-16',
    GENEROUS: 'py-20',
  },

  // Content spacing
  CONTENT: {
    TIGHT: 'space-y-4',
    STANDARD: 'space-y-6',
    RELAXED: 'space-y-8',
    LOOSE: 'space-y-12',
  }
} as const;

// Complete spacing system export
export const spacing = {
  header: HEADER_CONSTANTS,
  page: PAGE_SPACING,
  layout: LAYOUT_SPACING,
  helpers: {
    getLayoutSpacing,
    getResponsiveHeaderSpacing,
  }
} as const;

export default spacing;