// Project theme system - sophisticated, muted colors and icons aligned to subjects
// Inspired by macOS design language and educational contexts

export const subjectThemes = {
  // STEM subjects - cool, analytical tones
  'Mathematics': {
    icon: '∑',  // Sigma/summation symbol
    color: '#5B7C99',  // Muted slate blue
    bgLight: '#E8EDF2',
    bgDark: '#2A3844',
  },
  'Science': {
    icon: '⚛',  // Atom symbol
    color: '#6B8E7F',  // Muted sage green
    bgLight: '#E8F2ED',
    bgDark: '#2D403A',
  },
  'Engineering': {
    icon: '⚙',  // Gear
    color: '#7A7A8C',  // Muted steel gray
    bgLight: '#ECECF0',
    bgDark: '#37374A',
  },
  'Technology': {
    icon: '◧',  // Circuit-like symbol
    color: '#6B7FA8',  // Muted periwinkle
    bgLight: '#E9EDF5',
    bgDark: '#303847',
  },
  'Computer Science': {
    icon: '◱',  // Binary-inspired
    color: '#5D7B9E',  // Muted cornflower
    bgLight: '#E7EDF4',
    bgDark: '#2C3847',
  },

  // Humanities - warm, earthy tones
  'Language Arts': {
    icon: '✎',  // Pencil/writing
    color: '#8B7355',  // Warm taupe
    bgLight: '#F2EDEA',
    bgDark: '#3D362E',
  },
  'English': {
    icon: '⊞',  // Book pages
    color: '#8B7355',  // Warm taupe
    bgLight: '#F2EDEA',
    bgDark: '#3D362E',
  },
  'History': {
    icon: '⧗',  // Hourglass
    color: '#9B7B5F',  // Muted bronze
    bgLight: '#F3EDE7',
    bgDark: '#42382E',
  },
  'Social Studies': {
    icon: '◉',  // Globe representation
    color: '#7B8A7A',  // Muted olive
    bgLight: '#EDEFEC',
    bgDark: '#363E36',
  },
  'Geography': {
    icon: '⛰',  // Mountain
    color: '#6B8B8A',  // Muted teal-gray
    bgLight: '#E9F0F0',
    bgDark: '#2F3C3C',
  },

  // Arts - creative, balanced tones
  'Art': {
    icon: '▵',  // Palette triangle
    color: '#9B7B88',  // Muted mauve
    bgLight: '#F2ECF0',
    bgDark: '#3E3339',
  },
  'Music': {
    icon: '♪',  // Music note
    color: '#8A7B9B',  // Muted lavender
    bgLight: '#EFECF2',
    bgDark: '#38333E',
  },
  'Drama': {
    icon: '⎔',  // Theater masks
    color: '#9B8075',  // Muted terracotta
    bgLight: '#F2EDEB',
    bgDark: '#3E3631',
  },
  'Design': {
    icon: '◰',  // Design grid
    color: '#7A8A99',  // Muted blue-gray
    bgLight: '#ECEEF2',
    bgDark: '#343844',
  },

  // Physical & Health - energetic but calm tones
  'Physical Education': {
    icon: '◬',  // Movement
    color: '#7B9B7A',  // Muted grass green
    bgLight: '#ECF2EC',
    bgDark: '#343E34',
  },
  'Health': {
    icon: '✚',  // Medical cross
    color: '#7B9A9A',  // Muted seafoam
    bgLight: '#ECF2F2',
    bgDark: '#333E3E',
  },

  // Interdisciplinary - balanced, neutral
  'STEAM': {
    icon: '◈',  // Multi-faceted
    color: '#7A8599',  // Muted steel blue
    bgLight: '#ECEEF2',
    bgDark: '#34384A',
  },
  'Project-Based Learning': {
    icon: '⬡',  // Honeycomb (collaboration)
    color: '#8B8B7A',  // Muted khaki
    bgLight: '#F0F0EC',
    bgDark: '#3A3A32',
  },
  'Environmental Science': {
    icon: '❀',  // Flower/nature
    color: '#6B8B75',  // Muted forest
    bgLight: '#E9F0EC',
    bgDark: '#2F3D34',
  },

  // Default fallback
  'General': {
    icon: '◆',  // Diamond
    color: '#7A7A8A',  // Neutral gray-blue
    bgLight: '#ECECF0',
    bgDark: '#34343E',
  },
};

// Grade band colors - subtle, age-appropriate
export const gradeBandThemes = {
  'Elementary': {
    color: '#7B8B9A',  // Soft blue-gray
    badge: 'ES',
  },
  'ES': {
    color: '#7B8B9A',
    badge: 'ES',
  },
  'Middle School': {
    color: '#8A7B8B',  // Soft purple-gray
    badge: 'MS',
  },
  'MS': {
    color: '#8A7B8B',
    badge: 'MS',
  },
  'High School': {
    color: '#8B7B6A',  // Soft brown-gray
    badge: 'HS',
  },
  'HS': {
    color: '#8B7B6A',
    badge: 'HS',
  },
  'K-12': {
    color: '#7A8A7A',  // Soft green-gray
    badge: 'K-12',
  },
  'Higher Ed': {
    color: '#6A7A8A',  // Soft slate
    badge: 'HE',
  },
};

/**
 * Get theme for a subject with fallback
 * @param {string|string[]} subject - Subject name or array of subjects
 * @returns {object} Theme object with icon, color, and backgrounds
 */
export function getSubjectTheme(subject) {
  if (!subject) {return subjectThemes['General'];}

  // If array, use first subject
  const subjectName = Array.isArray(subject) ? subject[0] : subject;

  // Try exact match first
  if (subjectThemes[subjectName]) {
    return subjectThemes[subjectName];
  }

  // Try partial match (case-insensitive)
  const normalizedSubject = subjectName.toLowerCase();
  const matchedKey = Object.keys(subjectThemes).find(key =>
    key.toLowerCase().includes(normalizedSubject) ||
    normalizedSubject.includes(key.toLowerCase())
  );

  return subjectThemes[matchedKey] || subjectThemes['General'];
}

/**
 * Get grade band theme with fallback
 * @param {string} gradeBand - Grade band identifier
 * @returns {object} Grade band theme
 */
export function getGradeBandTheme(gradeBand) {
  if (!gradeBand) {return gradeBandThemes['K-12'];}

  // Try exact match
  if (gradeBandThemes[gradeBand]) {
    return gradeBandThemes[gradeBand];
  }

  // Try to extract from longer strings like "High School (9-12)"
  if (gradeBand.toLowerCase().includes('high')) {return gradeBandThemes['HS'];}
  if (gradeBand.toLowerCase().includes('middle')) {return gradeBandThemes['MS'];}
  if (gradeBand.toLowerCase().includes('elementary')) {return gradeBandThemes['ES'];}

  return gradeBandThemes['K-12'];
}

/**
 * Generate a gradient background for project cards
 * @param {object} theme - Subject theme
 * @param {boolean} isDark - Dark mode flag
 * @returns {string} CSS gradient string
 */
export function getProjectGradient(theme, isDark = false) {
  if (isDark) {
    return `linear-gradient(135deg, ${theme.bgDark} 0%, ${theme.bgDark}dd 100%)`;
  }
  return `linear-gradient(135deg, ${theme.bgLight} 0%, ${theme.bgLight}dd 100%)`;
}
