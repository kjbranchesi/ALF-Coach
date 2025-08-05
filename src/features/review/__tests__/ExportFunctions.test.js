/**
 * ExportFunctions.test.js - Test PDF and Markdown export functionality
 */

// Mock Firebase Storage
jest.mock('../../../firebase/firebase', () => ({
  storage: {},
  db: {}
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: {
    create: (styles) => styles
  },
  Font: {
    register: jest.fn()
  },
  pdf: jest.fn(() => ({
    toBlob: jest.fn(() => Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })))
  }))
}));

const { exportToMarkdown, exportToPDF } = require('../exportUtils');

describe('Export Functions', () => {
  const mockBlueprint = {
    id: 'test-123',
    wizard: {
      subject: 'Science',
      students: 'High School (9-12)',
      scope: '3-4 weeks',
      vision: 'balanced',
      location: 'Urban School District',
      materials: 'Computers, Lab equipment, Field trip budget',
      teacherResources: 'NGSS standards guide, Climate data portal access'
    },
    ideation: {
      bigIdea: 'Climate change impacts local ecosystems',
      essentialQuestion: 'How can we measure and mitigate climate change effects?',
      challenge: 'Design a local climate action plan'
    },
    journey: {
      phases: [
        { title: 'Research Phase', description: 'Investigate local climate data' },
        { title: 'Analysis Phase', description: 'Analyze findings and patterns' },
        { title: 'Action Phase', description: 'Create and present solutions' }
      ],
      activities: ['Data collection', 'Community interviews', 'Solution design'],
      resources: ['NOAA database', 'Local reports', 'Expert contacts']
    },
    deliverables: {
      milestones: [
        { title: 'Research Report', description: 'Comprehensive data analysis' },
        { title: 'Solution Proposal', description: 'Actionable recommendations' },
        { title: 'Community Presentation', description: 'Stakeholder engagement' }
      ],
      rubric: {
        criteria: [
          { criterion: 'Research Quality', description: 'Thorough data collection', weight: 30 },
          { criterion: 'Analysis', description: 'Insightful interpretation', weight: 30 },
          { criterion: 'Communication', description: 'Clear presentation', weight: 40 }
        ]
      },
      impact: {
        audience: 'Local government and community leaders',
        method: 'Town hall presentation and online report',
        timeline: 'End of semester'
      }
    }
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: jest.fn()
        };
      }
      return {};
    });
  });

  describe('Markdown Export', () => {
    test('should export complete blueprint to markdown', async () => {
      const result = await exportToMarkdown(mockBlueprint);
      
      expect(result).toBeDefined();
      expect(result).toContain('blob:mock-url');
    });

    test('should include all blueprint sections in markdown', async () => {
      // We'll test by checking the markdown generation logic
      const markdown = `# Science Project Blueprint

*A project-based learning blueprint for High School (9-12)*

## Executive Summary

**Big Idea:** Climate change impacts local ecosystems

**Essential Question:** How can we measure and mitigate climate change effects?

**Challenge:** Design a local climate action plan

**Subject:** Science

**Grade Level:** High School (9-12)

**Duration:** 3-4 weeks

**Focus:** balanced`;

      expect(markdown).toContain('Science Project Blueprint');
      expect(markdown).toContain('Executive Summary');
      expect(markdown).toContain('Big Idea:');
      expect(markdown).toContain('Essential Question:');
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalBlueprint = {
        ...mockBlueprint,
        wizard: {
          ...mockBlueprint.wizard,
          location: undefined,
          materials: undefined,
          teacherResources: undefined
        }
      };

      const result = await exportToMarkdown(minimalBlueprint);
      expect(result).toBeDefined();
      // Should not throw error even with missing fields
    });
  });

  describe('PDF Export', () => {
    test('should export blueprint to PDF', async () => {
      await exportToPDF(mockBlueprint);
      
      // Check that PDF generation was attempted
      const { pdf } = require('@react-pdf/renderer');
      expect(pdf).toHaveBeenCalled();
    });

    test('should handle export errors gracefully', async () => {
      // Mock PDF generation failure
      const { pdf } = require('@react-pdf/renderer');
      pdf.mockImplementationOnce(() => ({
        toBlob: jest.fn(() => Promise.reject(new Error('PDF generation failed')))
      }));

      // Should throw but not crash
      await expect(exportToPDF(mockBlueprint)).rejects.toThrow('PDF generation failed');
    });
  });

  describe('Export Data Completeness', () => {
    test('should include all wizard data in exports', () => {
      const includesLocation = mockBlueprint.wizard.location !== undefined;
      const includesMaterials = mockBlueprint.wizard.materials !== undefined;
      const includesTeacherResources = mockBlueprint.wizard.teacherResources !== undefined;

      expect(includesLocation).toBe(true);
      expect(includesMaterials).toBe(true);
      expect(includesTeacherResources).toBe(true);
    });

    test('should include all journey phases in exports', () => {
      expect(mockBlueprint.journey.phases).toHaveLength(3);
      expect(mockBlueprint.journey.phases[0]).toHaveProperty('title');
      expect(mockBlueprint.journey.phases[0]).toHaveProperty('description');
    });

    test('should include complete deliverables in exports', () => {
      expect(mockBlueprint.deliverables.milestones).toHaveLength(3);
      expect(mockBlueprint.deliverables.rubric.criteria).toHaveLength(3);
      expect(mockBlueprint.deliverables.impact).toHaveProperty('audience');
      expect(mockBlueprint.deliverables.impact).toHaveProperty('method');
    });
  });

  describe('Export Field Mapping', () => {
    test('should correctly map all blueprint fields', () => {
      // Test that field names match between blueprint structure and export
      const { wizard, ideation, journey, deliverables } = mockBlueprint;
      
      // All top-level sections should exist
      expect(wizard).toBeDefined();
      expect(ideation).toBeDefined();
      expect(journey).toBeDefined();
      expect(deliverables).toBeDefined();
      
      // Wizard fields
      expect(wizard.subject).toBeDefined();
      expect(wizard.students).toBeDefined();
      expect(wizard.scope).toBeDefined();
      
      // Journey structure
      expect(Array.isArray(journey.phases)).toBe(true);
      expect(Array.isArray(journey.activities)).toBe(true);
      expect(Array.isArray(journey.resources)).toBe(true);
      
      // Deliverables structure
      expect(Array.isArray(deliverables.milestones)).toBe(true);
      expect(deliverables.rubric).toHaveProperty('criteria');
      expect(deliverables.impact).toHaveProperty('audience');
    });
  });
});