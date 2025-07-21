// Text utilities for cleaning up user inputs and formatting
export function titleCase(str: string): string {
  if (!str) return str;
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases for common educational terms
      const specialCases: Record<string, string> = {
        'ap': 'AP',
        'ib': 'IB',
        'stem': 'STEM',
        'ela': 'ELA',
        'pe': 'PE',
        'it': 'IT',
        'ai': 'AI',
        'ui': 'UI',
        'ux': 'UX',
        'k-12': 'K-12',
        'pre-k': 'Pre-K',
        'covid': 'COVID',
        'nasa': 'NASA',
        'fbi': 'FBI',
        'cia': 'CIA',
        'usa': 'USA',
        'uk': 'UK',
        'eu': 'EU'
      };
      
      const lower = word.toLowerCase();
      if (specialCases[lower]) {
        return specialCases[lower];
      }
      
      // Handle hyphenated words
      if (word.includes('-')) {
        return word.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }
      
      // Standard title case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function fixCommonCaps(str: string): string {
  if (!str) return str;
  
  // Trim whitespace and ensure first letter is capitalized
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function paraphraseIdea(idea: string, maxWords: number = 10): string {
  if (!idea) return idea;
  
  const words = idea.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return fixCommonCaps(idea);
  }
  
  // Extract key concepts - remove filler words and keep important ones
  const fillerWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 
    'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 
    'over', 'under', 'again', 'further', 'then', 'once', 'very', 'also',
    'just', 'only', 'really', 'quite', 'rather', 'such', 'some', 'many',
    'much', 'more', 'most', 'other', 'another', 'any', 'all', 'both',
    'each', 'few', 'several', 'own', 'same', 'different', 'new', 'old',
    'first', 'last', 'next', 'previous', 'this', 'that', 'these', 'those'
  ]);
  
  const keyWords = words.filter(word => {
    const clean = word.toLowerCase().replace(/[^\w]/g, '');
    return clean.length > 2 && !fillerWords.has(clean);
  });
  
  // If we have too many key words, take the first maxWords
  const result = keyWords.slice(0, maxWords).join(' ');
  return fixCommonCaps(result);
}

// Clean up common spelling mistakes and formatting issues
export function cleanEducatorInput(input: string): string {
  if (!input) return input;
  
  const corrections: Record<string, string> = {
    // Common typos
    'histry': 'History',
    'hitory': 'History',
    'sophmore': 'Sophomore',
    'sophomore': 'Sophomore',
    'freshmn': 'Freshmen',
    'elementry': 'elementary',
    'middel': 'middle',
    'highschool': 'high school',
    'architechture': 'Architecture',
    'architecure': 'Architecture',
    'architeture': 'Architecture',
    
    // Grade level standardization
    '9th grade': 'Ninth Grade',
    '10th grade': 'Tenth Grade',
    '11th grade': 'Eleventh Grade',
    '12th grade': 'Twelfth Grade',
    'k-12': 'K-12',
    'pre-k': 'Pre-K',
    
    // Subject area standardization
    'math': 'Mathematics',
    'sci': 'Science',
    'eng': 'English',
    'hist': 'History',
    'geo': 'Geography',
    'bio': 'Biology',
    'chem': 'Chemistry',
    'phys': 'Physics'
  };
  
  let cleaned = input.trim();
  
  // Apply corrections
  Object.entries(corrections).forEach(([mistake, correction]) => {
    const regex = new RegExp(`\\b${mistake}\\b`, 'gi');
    cleaned = cleaned.replace(regex, correction);
  });
  
  return cleaned;
}

// Format age group with context disambiguation
export function formatAgeGroup(ageGroup: string): string {
  if (!ageGroup) return ageGroup;
  
  const cleaned = cleanEducatorInput(ageGroup);
  const lower = cleaned.toLowerCase();
  
  // Handle ambiguous terms that need context
  if (lower.includes('freshman') || lower.includes('freshmen')) {
    const isHighSchool = lower.includes('high school') || 
                        lower.includes('9th grade') || 
                        lower.includes('grade 9') ||
                        lower.includes('secondary') ||
                        (/\b(14|15)\b/.test(lower));
                        
    const isCollege = lower.includes('college') || 
                     lower.includes('university') || 
                     lower.includes('1st year') ||
                     lower.includes('first year') ||
                     (/\b(18|19)\b/.test(lower));
    
    if (isHighSchool && !isCollege) {
      return cleaned.replace(/freshm[ae]n/gi, 'High School Freshmen');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/freshm[ae]n/gi, 'College Freshmen');
    }
  }
  
  // Similar handling for sophomores, juniors, seniors...
  if (lower.includes('sophomore')) {
    const isHighSchool = lower.includes('high school') || lower.includes('10th grade') || (/\b(15|16)\b/.test(lower));
    const isCollege = lower.includes('college') || lower.includes('university') || (/\b(19|20)\b/.test(lower));
    
    if (isHighSchool && !isCollege) {
      return cleaned.replace(/sophomore/gi, 'High School Sophomores');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/sophomore/gi, 'College Sophomores');
    }
  }
  
  return titleCase(cleaned);
}