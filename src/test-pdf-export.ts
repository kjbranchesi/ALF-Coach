/**
 * Test script for PDF export functionality
 */

import { PDFExportService } from './core/services/PDFExportService';
import { BlueprintDoc } from './core/types/SOPTypes';

// Sample blueprint data for testing
const sampleBlueprint: BlueprintDoc = {
  wizard: {
    vision: 'Create an engaging learning experience about renewable energy',
    subject: 'Science',
    students: 'Grade 7-8',
    location: 'Urban Middle School',
    resources: 'Computer lab, 3D printer, basic materials',
    scope: 'unit'
  },
  ideation: {
    bigIdea: 'Students design sustainable energy solutions for their community',
    essentialQuestion: 'How can we harness renewable energy to solve real problems?',
    challenge: 'Design and prototype a renewable energy device that addresses a community need'
  },
  journey: {
    phases: [
      {
        title: 'Discover & Research',
        description: 'Students explore renewable energy types and community needs'
      },
      {
        title: 'Design & Prototype',
        description: 'Teams design and build working prototypes'
      },
      {
        title: 'Test & Present',
        description: 'Students test solutions and present to community stakeholders'
      }
    ],
    activities: [
      'Energy audit of school building',
      'Interview community members about energy needs',
      'Research different renewable energy technologies',
      'Sketch and CAD design sessions',
      'Prototype building workshops',
      'Testing and data collection',
      'Presentation preparation',
      'Community showcase event'
    ],
    resources: [
      'Solar panel kits',
      'Wind turbine materials',
      'Online renewable energy simulators',
      'Guest speaker from local energy company',
      'Design thinking templates',
      'Presentation rubrics'
    ]
  },
  deliverables: {
    milestones: [
      { 
        id: 'm1',
        title: 'Research Portfolio',
        description: 'Comprehensive research on renewable energy and community needs',
        phase: 'phase1'
      },
      {
        id: 'm2', 
        title: 'Working Prototype',
        description: 'Functional renewable energy device with documentation',
        phase: 'phase2'
      },
      {
        id: 'm3',
        title: 'Community Presentation',
        description: 'Professional presentation of solution to stakeholders',
        phase: 'phase3'
      }
    ],
    rubric: {
      criteria: [
        {
          criterion: 'Research Quality',
          description: 'Thorough investigation of energy types and community needs',
          weight: 25
        },
        {
          criterion: 'Design Innovation',
          description: 'Creative and practical solution design',
          weight: 25
        },
        {
          criterion: 'Prototype Function',
          description: 'Working prototype that demonstrates concept',
          weight: 25
        },
        {
          criterion: 'Communication',
          description: 'Clear presentation of process and solution',
          weight: 25
        }
      ]
    },
    impact: {
      audience: 'Parents, school board, and local environmental groups',
      method: 'Science fair style showcase with demonstrations',
      purpose: 'Share innovative solutions and inspire community action'
    },
    timeline: {
      totalWeeks: 6,
      phaseDurations: {
        phase1: 2,
        phase2: 3,
        phase3: 1
      }
    }
  },
  timestamps: {
    created: new Date(),
    updated: new Date()
  },
  schemaVersion: '1.0'
};

// Test the PDF export
async function testPDFExport() {
  console.log('Testing PDF Export Service...');
  
  const pdfService = new PDFExportService();
  
  try {
    // Test teacher guide generation
    console.log('Generating teacher guide...');
    const teacherBlob = await pdfService.exportTeacherGuide(sampleBlueprint);
    console.log('Teacher guide generated:', teacherBlob.size, 'bytes');
    
    // Test student guide generation
    console.log('Generating student guide...');
    const studentBlob = await pdfService.exportStudentGuide(sampleBlueprint);
    console.log('Student guide generated:', studentBlob.size, 'bytes');
    
    // Test complete package
    console.log('Generating complete package...');
    const package = await pdfService.exportCompletePackage(sampleBlueprint);
    console.log('Complete package generated');
    console.log('- Teacher guide:', package.teacher.size, 'bytes');
    console.log('- Student guide:', package.student.size, 'bytes');
    
    console.log('PDF Export tests completed successfully!');
  } catch (error) {
    console.error('PDF Export test failed:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPDFExport();
}

export { testPDFExport, sampleBlueprint };