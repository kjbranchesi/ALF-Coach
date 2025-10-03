/**
 * Standards Database - Dynamically loaded to reduce bundle size
 * This file is separated from components to enable code splitting
 */

export type StandardsFramework = 'NGSS' | 'CCSS-ELA' | 'CCSS-MATH' | 'ISTE' | 'CASEL' | 'NCSS' | 'CUSTOM';

export interface StandardEntry {
  code: string;
  label: string;
  description: string;
  gradeLevel: string[];
  subjects: string[];
}

export const STANDARDS_DATABASE: Record<StandardsFramework, StandardEntry[]> = {
  NGSS: [
    {
      code: 'K-2-ETS1-1',
      label: 'Engineering Design',
      description: 'Ask questions, make observations, and gather information about a situation people want to change to define a simple problem that can be solved through the development of a new or improved object or tool.',
      gradeLevel: ['K', '1', '2'],
      subjects: ['Science', 'Engineering']
    },
    {
      code: '3-5-ETS1-1',
      label: 'Engineering Design',
      description: 'Define a simple design problem reflecting a need or a want that includes specified criteria for success and constraints on materials, time, or cost.',
      gradeLevel: ['3', '4', '5'],
      subjects: ['Science', 'Engineering']
    },
    {
      code: 'MS-ESS3-3',
      label: 'Earth and Human Activity',
      description: 'Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment.',
      gradeLevel: ['6', '7', '8'],
      subjects: ['Science', 'Environmental Science']
    },
    {
      code: 'HS-ETS1-2',
      label: 'Engineering Design',
      description: 'Design a solution to a complex real-world problem by breaking it down into smaller, more manageable problems that can be solved through engineering.',
      gradeLevel: ['9', '10', '11', '12'],
      subjects: ['Science', 'Engineering']
    }
  ],
  
  'CCSS-ELA': [
    {
      code: 'CCSS.ELA-LITERACY.W.3.1',
      label: 'Opinion Writing',
      description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons.',
      gradeLevel: ['3'],
      subjects: ['English Language Arts', 'Writing']
    },
    {
      code: 'CCSS.ELA-LITERACY.RI.5.7',
      label: 'Integration of Knowledge',
      description: 'Draw on information from multiple print or digital sources, demonstrating the ability to locate an answer to a question quickly or to solve a problem efficiently.',
      gradeLevel: ['5'],
      subjects: ['English Language Arts', 'Reading']
    },
    {
      code: 'CCSS.ELA-LITERACY.SL.8.5',
      label: 'Presentation of Knowledge',
      description: 'Integrate multimedia and visual displays into presentations to clarify information, strengthen claims and evidence, and add interest.',
      gradeLevel: ['8'],
      subjects: ['English Language Arts', 'Speaking & Listening']
    },
    {
      code: 'CCSS.ELA-LITERACY.RST.11-12.9',
      label: 'Integration of Knowledge',
      description: 'Synthesize information from a range of sources into a coherent understanding of a process, phenomenon, or concept.',
      gradeLevel: ['11', '12'],
      subjects: ['English Language Arts', 'Science & Technical']
    }
  ],
  
  'CCSS-MATH': [
    {
      code: 'CCSS.MATH.CONTENT.3.MD.B.3',
      label: 'Represent and Interpret Data',
      description: 'Draw a scaled picture graph and a scaled bar graph to represent a data set with several categories.',
      gradeLevel: ['3'],
      subjects: ['Mathematics', 'Data Analysis']
    },
    {
      code: 'CCSS.MATH.CONTENT.6.SP.B.5',
      label: 'Statistics & Probability',
      description: 'Summarize numerical data sets in relation to their context.',
      gradeLevel: ['6'],
      subjects: ['Mathematics', 'Statistics']
    },
    {
      code: 'CCSS.MATH.CONTENT.HSA.CED.A.3',
      label: 'Creating Equations',
      description: 'Represent constraints by equations or inequalities, and by systems of equations and/or inequalities.',
      gradeLevel: ['9', '10', '11', '12'],
      subjects: ['Mathematics', 'Algebra']
    }
  ],
  
  ISTE: [
    {
      code: 'ISTE.1.1',
      label: 'Empowered Learner',
      description: 'Students leverage technology to take an active role in choosing, achieving and demonstrating competency in their learning goals.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Technology', 'Digital Citizenship']
    },
    {
      code: 'ISTE.1.3',
      label: 'Knowledge Constructor',
      description: 'Students critically curate a variety of resources using digital tools to construct knowledge and produce creative artifacts.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Technology', 'Research']
    },
    {
      code: 'ISTE.1.5',
      label: 'Computational Thinker',
      description: 'Students develop and employ strategies for understanding and solving problems in ways that leverage the power of technological methods.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Technology', 'Computer Science']
    }
  ],
  
  CASEL: [
    {
      code: 'CASEL.1',
      label: 'Self-Awareness',
      description: 'The ability to accurately recognize emotions and thoughts and their influence on behavior.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social-Emotional Learning']
    },
    {
      code: 'CASEL.3',
      label: 'Social Awareness',
      description: 'The ability to take the perspective of and empathize with others from diverse backgrounds and cultures.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social-Emotional Learning']
    },
    {
      code: 'CASEL.5',
      label: 'Responsible Decision-Making',
      description: 'The ability to make constructive and respectful choices about personal behavior and social interactions.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social-Emotional Learning']
    }
  ],
  
  NCSS: [
    {
      code: 'NCSS.2',
      label: 'Time, Continuity, and Change',
      description: 'Understanding the ways human beings view themselves in and over time.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social Studies', 'History']
    },
    {
      code: 'NCSS.5',
      label: 'Individuals, Groups, and Institutions',
      description: 'Understanding interactions among individuals, groups, and institutions.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social Studies', 'Civics']
    },
    {
      code: 'NCSS.10',
      label: 'Civic Ideals and Practices',
      description: 'Understanding the ideals, principles, and practices of citizenship in a democratic republic.',
      gradeLevel: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Social Studies', 'Civics']
    }
  ],
  
  CUSTOM: []
};

// Helper function to search standards
export function searchStandards(
  framework: StandardsFramework,
  query: string,
  gradeLevel?: string,
  subject?: string
): StandardEntry[] {
  const standards = STANDARDS_DATABASE[framework] || [];
  
  return standards.filter(standard => {
    const matchesQuery = !query || 
      standard.code.toLowerCase().includes(query.toLowerCase()) ||
      standard.label.toLowerCase().includes(query.toLowerCase()) ||
      standard.description.toLowerCase().includes(query.toLowerCase());
    
    const matchesGrade = !gradeLevel || 
      standard.gradeLevel.includes(gradeLevel);
    
    const matchesSubject = !subject ||
      standard.subjects.some(s => 
        s.toLowerCase().includes(subject.toLowerCase())
      );
    
    return matchesQuery && matchesGrade && matchesSubject;
  });
}

// Helper function to get recommended standards
export function getRecommendedStandards(
  gradeLevel: string,
  subjects: string[]
): Array<{ framework: StandardsFramework; standards: StandardEntry[] }> {
  const recommendations = [];
  
  for (const [framework, standards] of Object.entries(STANDARDS_DATABASE)) {
    if (framework === 'CUSTOM') {continue;}
    
    const relevant = standards.filter(standard => {
      const matchesGrade = standard.gradeLevel.includes(gradeLevel) ||
        standard.gradeLevel.includes('K') && gradeLevel <= '12';
      
      const matchesSubject = subjects.some(subject =>
        standard.subjects.some(s => 
          s.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(s.toLowerCase())
        )
      );
      
      return matchesGrade && matchesSubject;
    });
    
    if (relevant.length > 0) {
      recommendations.push({
        framework: framework as StandardsFramework,
        standards: relevant.slice(0, 3) // Top 3 from each framework
      });
    }
  }
  
  return recommendations;
}