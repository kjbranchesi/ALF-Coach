/**
 * RubricGeneration.test.js - Test rubric processing logic
 */

describe('Rubric Generation and Processing', () => {
  // Mock rubric parser function
  const parseRubricCriteria = (input) => {
    if (typeof input !== 'string') {return [];}
    
    const criteria = [];
    const lines = input.split('\n').filter(line => line.trim());
    const weight = Math.floor(100 / lines.length);
    
    lines.forEach((line, index) => {
      const match = line.match(/^(?:\d+\.|[•·-])\s*([^:]+)(?::\s*(.+))?/);
      if (match) {
        criteria.push({
          criterion: match[1].trim(),
          description: match[2]?.trim() || 'Assessment of this criterion',
          weight: index === lines.length - 1 ? 100 - (weight * (lines.length - 1)) : weight
        });
      }
    });
    
    return criteria.length > 0 ? criteria : [{
      criterion: 'General Assessment',
      description: input.trim(),
      weight: 100
    }];
  };

  describe('Rubric Parsing', () => {
    test('should parse numbered rubric criteria', () => {
      const aiResponse = `1. Research Skills: Students demonstrate ability to gather and analyze data
2. Critical Thinking: Students evaluate information and draw conclusions
3. Communication: Students present findings clearly
4. Collaboration: Students work effectively in teams`;

      const criteria = parseRubricCriteria(aiResponse);

      expect(criteria).toBeDefined();
      expect(Array.isArray(criteria)).toBe(true);
      expect(criteria.length).toBe(4);
      
      // Check first criterion
      expect(criteria[0].criterion).toBe('Research Skills');
      expect(criteria[0].weight).toBe(25); // Should distribute evenly
    });

    test('should parse bullet point rubric criteria', () => {
      const aiResponse = `• Content Knowledge: Demonstrates understanding of climate science concepts
• Application: Applies knowledge to local context
• Innovation: Develops creative solutions`;

      const criteria = parseRubricCriteria(aiResponse);

      expect(criteria).toBeDefined();
      expect(criteria.length).toBe(3);
      expect(criteria[0].criterion).toBe('Content Knowledge');
      
      // Check weight distribution
      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBe(100);
    });

    test('should handle empty input gracefully', () => {
      const criteria = parseRubricCriteria('');
      expect(criteria).toBeDefined();
      expect(criteria.length).toBe(1);
      expect(criteria[0].criterion).toBe('General Assessment');
      expect(criteria[0].weight).toBe(100);
    });
  });

  describe('Rubric Weight Distribution', () => {
    test('should ensure weights always sum to 100', () => {
      const testCases = [
        '1. Criterion A\n2. Criterion B\n3. Criterion C',
        '• First criterion: Description\n• Second criterion: Description',
        '- Single criterion with full description'
      ];

      testCases.forEach(aiResponse => {
        const criteria = parseRubricCriteria(aiResponse);
        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });

    test('should handle uneven distribution correctly', () => {
      // 3 criteria should be 33, 33, 34 to sum to 100
      const response = '1. A\n2. B\n3. C';
      const criteria = parseRubricCriteria(response);
      
      expect(criteria[0].weight).toBe(33);
      expect(criteria[1].weight).toBe(33);
      expect(criteria[2].weight).toBe(34); // Last one gets remainder
      
      const total = criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(total).toBe(100);
    });
  });

  describe('Journey Data to Rubric Connection', () => {
    test('should create rubric aligned with journey phases', () => {
      const journeyPhases = [
        'Research & Data Collection',
        'Analysis & Solution Design',
        'Implementation & Communication'
      ];

      // Simulate AI generating rubric based on phases
      const aiGeneratedRubric = journeyPhases.map((phase, i) => 
        `${i + 1}. ${phase}: Students demonstrate competency in ${phase.toLowerCase()}`
      ).join('\n');

      const criteria = parseRubricCriteria(aiGeneratedRubric);

      expect(criteria.length).toBe(3);
      expect(criteria[0].criterion).toContain('Research');
      expect(criteria[1].criterion).toContain('Analysis');
      expect(criteria[2].criterion).toContain('Implementation');
    });
  });

  describe('Grade-Appropriate Rubrics', () => {
    test('should handle elementary-appropriate language', () => {
      const elementaryRubric = `1. Understanding: Shows they get the main ideas
2. Trying Hard: Does their best work
3. Working Together: Helps their friends`;

      const criteria = parseRubricCriteria(elementaryRubric);

      expect(criteria.length).toBe(3);
      expect(criteria[0].criterion).toBe('Understanding');
      expect(criteria[1].criterion).toBe('Trying Hard');
      expect(criteria[2].criterion).toBe('Working Together');
    });

    test('should handle high school-appropriate language', () => {
      const hsRubric = `1. Critical Analysis: Synthesizes complex information and draws evidence-based conclusions
2. Innovation: Develops creative solutions demonstrating original thinking
3. Academic Communication: Presents findings using discipline-specific conventions`;

      const criteria = parseRubricCriteria(hsRubric);

      expect(criteria.length).toBe(3);
      expect(criteria[0].description).toContain('Synthesizes complex information');
    });
  });
});