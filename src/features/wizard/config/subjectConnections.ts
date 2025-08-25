/**
 * Subject Connection Engine
 * 
 * Intelligent system for suggesting meaningful subject connections
 * based on natural affinities, surprising combinations, and powerful synergies
 */

export type ConnectionType = 'natural' | 'surprising' | 'powerful';
export type ConnectionStrength = 'strong' | 'moderate' | 'emerging';

export interface SubjectConnection {
  primary: string;
  secondary: string;
  connectionType: ConnectionType;
  strength: ConnectionStrength;
  rationale: string;
  projectPotential: string[];
  gradeAppropriate: {
    elementary: boolean;  // K-5
    middle: boolean;      // 6-8
    high: boolean;        // 9-12
  };
  requiredResources?: string[];
}

export const SUBJECT_CONNECTIONS: SubjectConnection[] = [
  // Natural Connections (obvious and frequently used)
  {
    primary: 'Science',
    secondary: 'Mathematics',
    connectionType: 'natural',
    strength: 'strong',
    rationale: 'Data analysis, modeling, and quantitative reasoning',
    projectPotential: [
      'Scientific research with statistical analysis',
      'Environmental data collection and graphing',
      'Physics equations and real-world applications'
    ],
    gradeAppropriate: { elementary: true, middle: true, high: true }
  },
  {
    primary: 'History',
    secondary: 'English Language Arts',
    connectionType: 'natural',
    strength: 'strong',
    rationale: 'Historical narratives, primary source analysis, and persuasive writing',
    projectPotential: [
      'Historical fiction writing',
      'Document-based inquiry projects',
      'Oral history interviews and transcription'
    ],
    gradeAppropriate: { elementary: true, middle: true, high: true }
  },
  {
    primary: 'Art',
    secondary: 'Technology',
    connectionType: 'natural',
    strength: 'strong',
    rationale: 'Digital creation tools and modern artistic expression',
    projectPotential: [
      'Digital art portfolio',
      'Animation and motion graphics',
      '3D modeling and printing'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true },
    requiredResources: ['Computers', 'Design software']
  },
  
  // Surprising Connections (unexpected but valuable)
  {
    primary: 'Mathematics',
    secondary: 'Music',
    connectionType: 'surprising',
    strength: 'strong',
    rationale: 'Mathematical patterns in rhythm, harmony, and frequency',
    projectPotential: [
      'Algorithmic music composition',
      'Analyzing mathematical ratios in musical scales',
      'Creating percussion patterns with fractions'
    ],
    gradeAppropriate: { elementary: true, middle: true, high: true }
  },
  {
    primary: 'Physical Education',
    secondary: 'Physics',
    connectionType: 'surprising',
    strength: 'moderate',
    rationale: 'Biomechanics, force, and motion in sports',
    projectPotential: [
      'Optimizing athletic technique through physics',
      'Sports equipment design and testing',
      'Analyzing trajectories in different sports'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true }
  },
  {
    primary: 'Chemistry',
    secondary: 'Culinary Arts',
    connectionType: 'surprising',
    strength: 'strong',
    rationale: 'Chemical reactions in cooking and food science',
    projectPotential: [
      'Molecular gastronomy experiments',
      'Fermentation science project',
      'Recipe optimization through chemistry'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true },
    requiredResources: ['Kitchen/lab space', 'Cooking equipment']
  },
  {
    primary: 'History',
    secondary: 'Chemistry',
    connectionType: 'surprising',
    strength: 'moderate',
    rationale: 'Materials science shaped civilizations and historical events',
    projectPotential: [
      'Ancient metallurgy investigation',
      'Historical forensics and artifact analysis',
      'Industrial revolution through chemistry lens'
    ],
    gradeAppropriate: { elementary: false, middle: false, high: true }
  },
  
  // Powerful Connections (transformative when combined)
  {
    primary: 'Social Studies',
    secondary: 'Data Science',
    connectionType: 'powerful',
    strength: 'strong',
    rationale: 'Data-driven social analysis and evidence-based policy',
    projectPotential: [
      'Community demographic analysis',
      'Social media sentiment mapping',
      'Election data visualization'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true },
    requiredResources: ['Computers', 'Spreadsheet software']
  },
  {
    primary: 'Biology',
    secondary: 'Engineering',
    connectionType: 'powerful',
    strength: 'strong',
    rationale: 'Biomimicry and bio-inspired design',
    projectPotential: [
      'Nature-inspired invention',
      'Ecosystem engineering solutions',
      'Prosthetic device design'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true }
  },
  {
    primary: 'Literature',
    secondary: 'Psychology',
    connectionType: 'powerful',
    strength: 'moderate',
    rationale: 'Character psychology and human behavior in narrative',
    projectPotential: [
      'Psychological analysis of literary characters',
      'Writing with authentic mental health representation',
      'Exploring bias through literature'
    ],
    gradeAppropriate: { elementary: false, middle: false, high: true }
  },
  {
    primary: 'Environmental Science',
    secondary: 'Economics',
    connectionType: 'powerful',
    strength: 'strong',
    rationale: 'Sustainability economics and cost-benefit analysis',
    projectPotential: [
      'Green business plan development',
      'Carbon credit market analysis',
      'Sustainable development proposals'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true }
  },
  {
    primary: 'Computer Science',
    secondary: 'Ethics',
    connectionType: 'powerful',
    strength: 'emerging',
    rationale: 'AI ethics, privacy, and digital citizenship',
    projectPotential: [
      'Ethical AI guidelines development',
      'Privacy policy analysis and redesign',
      'Digital rights awareness campaign'
    ],
    gradeAppropriate: { elementary: false, middle: true, high: true }
  }
];

// Intelligent suggestion functions

export function getConnectionsForSubject(subject: string): SubjectConnection[] {
  return SUBJECT_CONNECTIONS.filter(
    conn => conn.primary.toLowerCase() === subject.toLowerCase() ||
            conn.secondary.toLowerCase() === subject.toLowerCase()
  );
}

export function getConnectionStrength(subject1: string, subject2: string): ConnectionStrength | null {
  const connection = SUBJECT_CONNECTIONS.find(
    conn => (conn.primary.toLowerCase() === subject1.toLowerCase() && 
             conn.secondary.toLowerCase() === subject2.toLowerCase()) ||
            (conn.primary.toLowerCase() === subject2.toLowerCase() && 
             conn.secondary.toLowerCase() === subject1.toLowerCase())
  );
  return connection?.strength || null;
}

export function getSurprisingConnections(currentSubjects: string[]): SubjectConnection[] {
  return SUBJECT_CONNECTIONS.filter(
    conn => conn.connectionType === 'surprising' &&
            currentSubjects.some(s => 
              s.toLowerCase() === conn.primary.toLowerCase() ||
              s.toLowerCase() === conn.secondary.toLowerCase()
            )
  );
}

export function getPowerfulConnections(currentSubjects: string[]): SubjectConnection[] {
  return SUBJECT_CONNECTIONS.filter(
    conn => conn.connectionType === 'powerful' &&
            currentSubjects.some(s => 
              s.toLowerCase() === conn.primary.toLowerCase() ||
              s.toLowerCase() === conn.secondary.toLowerCase()
            )
  );
}

export function getGradeAppropriateConnections(
  gradeLevel: number,
  currentSubjects: string[]
): SubjectConnection[] {
  const gradeCategory = gradeLevel <= 5 ? 'elementary' : 
                        gradeLevel <= 8 ? 'middle' : 'high';
  
  return SUBJECT_CONNECTIONS.filter(conn => {
    const isAppropriate = conn.gradeAppropriate[gradeCategory];
    const isRelevant = currentSubjects.length === 0 || 
                      currentSubjects.some(s => 
                        s.toLowerCase() === conn.primary.toLowerCase() ||
                        s.toLowerCase() === conn.secondary.toLowerCase()
                      );
    return isAppropriate && isRelevant;
  });
}

// Generate smart suggestions based on context
export interface SubjectSuggestion {
  subjects: string[];
  rationale: string;
  connectionType: ConnectionType;
  projectExample: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function generateSmartSuggestions(
  context: {
    gradeLevel: number;
    currentSubjects: string[];
    problemContext?: string;
    resourceLevel?: 'low' | 'medium' | 'high';
  }
): SubjectSuggestion[] {
  const suggestions: SubjectSuggestion[] = [];
  const appropriateConnections = getGradeAppropriateConnections(
    context.gradeLevel,
    context.currentSubjects
  );
  
  // Add natural connections for foundation
  const naturalConns = appropriateConnections.filter(c => c.connectionType === 'natural').slice(0, 2);
  naturalConns.forEach(conn => {
    suggestions.push({
      subjects: [conn.primary, conn.secondary],
      rationale: conn.rationale,
      connectionType: 'natural',
      projectExample: conn.projectPotential[0],
      difficulty: 'beginner'
    });
  });
  
  // Add one surprising connection for engagement
  const surprisingConns = appropriateConnections.filter(c => c.connectionType === 'surprising').slice(0, 1);
  surprisingConns.forEach(conn => {
    suggestions.push({
      subjects: [conn.primary, conn.secondary],
      rationale: conn.rationale,
      connectionType: 'surprising',
      projectExample: conn.projectPotential[0],
      difficulty: 'intermediate'
    });
  });
  
  // Add one powerful connection for depth
  const powerfulConns = appropriateConnections.filter(c => c.connectionType === 'powerful').slice(0, 1);
  powerfulConns.forEach(conn => {
    // Check resource requirements
    if (!conn.requiredResources || context.resourceLevel !== 'low') {
      suggestions.push({
        subjects: [conn.primary, conn.secondary],
        rationale: conn.rationale,
        connectionType: 'powerful',
        projectExample: conn.projectPotential[0],
        difficulty: 'advanced'
      });
    }
  });
  
  return suggestions;
}