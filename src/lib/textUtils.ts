// Text utilities for cleaning up user inputs and formatting
export function titleCase(str: string): string {
  if (!str) {return str;}
  
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
  if (!str) {return str;}
  
  // Trim whitespace and ensure first letter is capitalized
  const trimmed = str.trim();
  if (!trimmed) {return trimmed;}
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function paraphraseIdea(idea: string, maxWords: number = 10): string {
  if (!idea) {return idea;}
  
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
  if (!input) {return input;}
  
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

// Comprehensive international education system terminology
const INTERNATIONAL_EDUCATION_TERMS: Record<string, { ages: string; country: string; equivalent: string }> = {
  // United Kingdom (England & Wales)
  'reception': { ages: '4-5', country: 'UK', equivalent: 'Pre-K/Kindergarten' },
  'year 1': { ages: '5-6', country: 'UK', equivalent: 'Kindergarten/1st Grade' },
  'year 2': { ages: '6-7', country: 'UK', equivalent: '1st Grade' },
  'year 3': { ages: '7-8', country: 'UK', equivalent: '2nd Grade' },
  'year 4': { ages: '8-9', country: 'UK', equivalent: '3rd Grade' },
  'year 5': { ages: '9-10', country: 'UK', equivalent: '4th Grade' },
  'year 6': { ages: '10-11', country: 'UK', equivalent: '5th Grade' },
  'year 7': { ages: '11-12', country: 'UK', equivalent: '6th Grade' },
  'year 8': { ages: '12-13', country: 'UK', equivalent: '7th Grade' },
  'year 9': { ages: '13-14', country: 'UK', equivalent: '8th Grade' },
  'year 10': { ages: '14-15', country: 'UK', equivalent: '9th Grade' },
  'year 11': { ages: '15-16', country: 'UK', equivalent: '10th Grade' },
  'year 12': { ages: '16-17', country: 'UK', equivalent: '11th Grade' },
  'year 13': { ages: '17-18', country: 'UK', equivalent: '12th Grade' },
  
  // Scotland
  'primary 1': { ages: '4-5', country: 'Scotland', equivalent: 'Pre-K/Kindergarten' },
  'primary 2': { ages: '5-6', country: 'Scotland', equivalent: 'Kindergarten' },
  'primary 3': { ages: '6-7', country: 'Scotland', equivalent: '1st Grade' },
  'primary 4': { ages: '7-8', country: 'Scotland', equivalent: '2nd Grade' },
  'primary 5': { ages: '8-9', country: 'Scotland', equivalent: '3rd Grade' },
  'primary 6': { ages: '9-10', country: 'Scotland', equivalent: '4th Grade' },
  'primary 7': { ages: '10-11', country: 'Scotland', equivalent: '5th Grade' },
  'secondary 1': { ages: '11-12', country: 'Scotland', equivalent: '6th Grade' },
  'secondary 2': { ages: '12-13', country: 'Scotland', equivalent: '7th Grade' },
  'secondary 3': { ages: '13-14', country: 'Scotland', equivalent: '8th Grade' },
  'secondary 4': { ages: '14-15', country: 'Scotland', equivalent: '9th Grade' },
  'secondary 5': { ages: '15-16', country: 'Scotland', equivalent: '10th Grade' },
  'secondary 6': { ages: '16-17', country: 'Scotland', equivalent: '11th Grade' },
  
  // Northern Ireland
  'primary 1 (ni)': { ages: '4-5', country: 'Northern Ireland', equivalent: 'Pre-K' },
  'primary 7 (ni)': { ages: '10-11', country: 'Northern Ireland', equivalent: '5th Grade' },
  'year 8 (ni)': { ages: '11-12', country: 'Northern Ireland', equivalent: '6th Grade' },
  'year 14 (ni)': { ages: '17-18', country: 'Northern Ireland', equivalent: '12th Grade' },
  
  // Ireland
  'senior infants': { ages: '5-6', country: 'Ireland', equivalent: 'Kindergarten' },
  'junior infants': { ages: '4-5', country: 'Ireland', equivalent: 'Pre-K' },
  'first class': { ages: '6-7', country: 'Ireland', equivalent: '1st Grade' },
  'second class': { ages: '7-8', country: 'Ireland', equivalent: '2nd Grade' },
  'third class': { ages: '8-9', country: 'Ireland', equivalent: '3rd Grade' },
  'fourth class': { ages: '9-10', country: 'Ireland', equivalent: '4th Grade' },
  'fifth class': { ages: '10-11', country: 'Ireland', equivalent: '5th Grade' },
  'sixth class': { ages: '11-12', country: 'Ireland', equivalent: '6th Grade' },
  'first year': { ages: '12-13', country: 'Ireland', equivalent: '7th Grade' },
  'second year': { ages: '13-14', country: 'Ireland', equivalent: '8th Grade' },
  'third year': { ages: '14-15', country: 'Ireland', equivalent: '9th Grade' },
  'transition year': { ages: '15-16', country: 'Ireland', equivalent: '10th Grade' },
  'fifth year': { ages: '16-17', country: 'Ireland', equivalent: '11th Grade' },
  'sixth year': { ages: '17-18', country: 'Ireland', equivalent: '12th Grade' },
  
  // Canada
  'grade k': { ages: '5-6', country: 'Canada', equivalent: 'Kindergarten' },
  'grade jr k': { ages: '4-5', country: 'Canada', equivalent: 'Pre-K' },
  'grade sk': { ages: '5-6', country: 'Canada', equivalent: 'Kindergarten' },
  
  // Australia
  'prep': { ages: '5-6', country: 'Australia', equivalent: 'Kindergarten' },
  'kindy': { ages: '4-5', country: 'Australia', equivalent: 'Pre-K' },
  'year 11 (aus)': { ages: '16-17', country: 'Australia', equivalent: '11th Grade' },
  'year 12 (aus)': { ages: '17-18', country: 'Australia', equivalent: '12th Grade' },
  
  // New Zealand
  'year 0': { ages: '4-5', country: 'New Zealand', equivalent: 'Pre-K' },
  'year 13 (nz)': { ages: '17-18', country: 'New Zealand', equivalent: '12th Grade' },
  
  // South Africa
  'grade r': { ages: '5-6', country: 'South Africa', equivalent: 'Kindergarten' },
  'grade 0': { ages: '4-5', country: 'South Africa', equivalent: 'Pre-K' },
  
  // UK School Structure Terms
  'lower school': { ages: '11-14', country: 'UK', equivalent: 'Middle School (6th-8th Grade)' },
  'upper school': { ages: '14-18', country: 'UK', equivalent: 'High School (9th-12th Grade)' },
  'sixth form': { ages: '16-18', country: 'UK', equivalent: 'High School Juniors/Seniors' },
  'key stage 1': { ages: '5-7', country: 'UK', equivalent: 'K-1st Grade' },
  'key stage 2': { ages: '7-11', country: 'UK', equivalent: '2nd-5th Grade' },
  'key stage 3': { ages: '11-14', country: 'UK', equivalent: '6th-8th Grade' },
  'key stage 4': { ages: '14-16', country: 'UK', equivalent: '9th-10th Grade' },
  'key stage 5': { ages: '16-18', country: 'UK', equivalent: '11th-12th Grade' },
  
  // University Terms (International)
  'undergraduate': { ages: '18-22', country: 'International', equivalent: 'College Students' },
  'postgraduate': { ages: '22+', country: 'International', equivalent: 'Graduate Students' },
  'masters': { ages: '22-24', country: 'International', equivalent: 'Graduate Students' },
  'phd': { ages: '24+', country: 'International', equivalent: 'Doctoral Students' },
  'doctorate': { ages: '24+', country: 'International', equivalent: 'Doctoral Students' },
};

// Format age group with international education system awareness
export function formatAgeGroup(ageGroup: string): string {
  if (!ageGroup) {return ageGroup;}
  
  const cleaned = cleanEducatorInput(ageGroup);
  const lower = cleaned.toLowerCase().trim();
  
  // Check for international education terminology
  for (const [term, info] of Object.entries(INTERNATIONAL_EDUCATION_TERMS)) {
    if (lower.includes(term)) {
      return `${titleCase(term)} (Ages ${info.ages}, ${info.country}) - ${info.equivalent}`;
    }
  }
  
  // Handle compound terms
  if (lower.includes('senior 5') || lower.includes('s5')) {
    return 'Senior 5 (Ages 15-16, Scotland) - 10th Grade';
  }
  if (lower.includes('senior 6') || lower.includes('s6')) {
    return 'Senior 6 (Ages 16-17, Scotland) - 11th Grade';
  }
  
  // Handle ambiguous US terms that need context
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
      return cleaned.replace(/freshm[ae]n/gi, 'High School Freshmen (Ages 14-15)');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/freshm[ae]n/gi, 'College Freshmen (Ages 18-19)');
    } else {
      return cleaned.replace(/freshm[ae]n/gi, 'Freshmen (specify: high school 14-15 or college 18-19)');
    }
  }
  
  // Similar handling for other US ambiguous terms
  if (lower.includes('sophomore')) {
    const isHighSchool = lower.includes('high school') || lower.includes('10th grade') || (/\b(15|16)\b/.test(lower));
    const isCollege = lower.includes('college') || lower.includes('university') || (/\b(19|20)\b/.test(lower));
    
    if (isHighSchool && !isCollege) {
      return cleaned.replace(/sophomore/gi, 'High School Sophomores (Ages 15-16)');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/sophomore/gi, 'College Sophomores (Ages 19-20)');
    }
  }
  
  if (lower.includes('junior') && !lower.includes('junior infants')) {
    const isHighSchool = lower.includes('high school') || lower.includes('11th grade') || (/\b(16|17)\b/.test(lower));
    const isCollege = lower.includes('college') || lower.includes('university') || (/\b(20|21)\b/.test(lower));
    
    if (isHighSchool && !isCollege) {
      return cleaned.replace(/junior/gi, 'High School Juniors (Ages 16-17)');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/junior/gi, 'College Juniors (Ages 20-21)');
    }
  }
  
  if (lower.includes('senior') && !lower.includes('senior 5') && !lower.includes('senior 6') && !lower.includes('senior infants')) {
    const isHighSchool = lower.includes('high school') || lower.includes('12th grade') || (/\b(17|18)\b/.test(lower));
    const isCollege = lower.includes('college') || lower.includes('university') || (/\b(21|22)\b/.test(lower));
    
    if (isHighSchool && !isCollege) {
      return cleaned.replace(/senior/gi, 'High School Seniors (Ages 17-18)');
    } else if (isCollege && !isHighSchool) {
      return cleaned.replace(/senior/gi, 'College Seniors (Ages 21-22)');
    }
  }
  
  return titleCase(cleaned);
}

// Get pedagogical context based on age group
export function getPedagogicalContext(ageGroup: string): {
  developmentalStage: string;
  learningStyle: string;
  recommendedApproach: string;
} {
  const lower = ageGroup.toLowerCase();
  
  // Extract age numbers
  const ageMatch = ageGroup.match(/(\d+)-?(\d+)?/);
  const minAge = ageMatch ? parseInt(ageMatch[1]) : null;
  
  if (minAge && minAge <= 6) {
    return {
      developmentalStage: 'Early Childhood',
      learningStyle: 'Play-based, sensory, concrete',
      recommendedApproach: 'Hands-on activities, stories, exploration'
    };
  } else if (minAge && minAge <= 11) {
    return {
      developmentalStage: 'Elementary/Primary',
      learningStyle: 'Concrete thinking, collaborative',
      recommendedApproach: 'Project-based learning, scaffolded inquiry'
    };
  } else if (minAge && minAge <= 14) {
    return {
      developmentalStage: 'Middle/Lower Secondary',
      learningStyle: 'Identity formation, peer-focused',
      recommendedApproach: 'Authentic challenges, social learning'
    };
  } else if (minAge && minAge <= 18) {
    return {
      developmentalStage: 'High/Upper Secondary',
      learningStyle: 'Abstract thinking, independence-seeking',
      recommendedApproach: 'Complex problems, real-world applications'
    };
  } else {
    return {
      developmentalStage: 'Adult/Higher Education',
      learningStyle: 'Self-directed, experience-based',
      recommendedApproach: 'Professional application, critical analysis'
    };
  }
}