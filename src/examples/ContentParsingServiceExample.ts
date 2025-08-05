/**
 * ContentParsingServiceExample.ts - Demonstration of ContentParsingService usage
 * Shows how to use the new parsing service with various AI response formats
 */

import { ContentParsingService } from '../core/services/ContentParsingService';

// Example AI responses in different formats
const examplePhaseResponse1 = `
Phase 1: Introduction and Setup (Week 1-2)
* Focus: Understanding the problem and gathering resources
* Activities: Research, brainstorming, initial planning

Phase 2: Development and Implementation (Week 3-4)  
* Focus: Building the solution and testing approaches
* Activities: Design, prototype creation, testing iterations

Phase 3: Refinement and Presentation (Week 5-6)
* Focus: Polishing the solution and preparing for presentation
* Activities: Final testing, documentation, presentation prep
`;

const examplePhaseResponse2 = `
1. Research Phase: Students conduct background research on renewable energy sources
2. Design Phase: Teams create initial designs for their energy solution
3. Build Phase: Construct and test prototypes of energy devices
4. Evaluate Phase: Analyze effectiveness and make improvements
5. Present Phase: Share findings and solutions with the community
`;

const exampleActivitiesResponse = `
1. Conduct interviews with community members about energy needs
2. Research different types of renewable energy technologies online
3. Create initial sketches and design concepts for energy solutions
4. Build working prototypes using available materials
5. Test prototypes under different conditions and document results
6. Iterate on designs based on testing feedback
7. Prepare presentation materials and practice delivery
8. Present final solutions to community stakeholders
`;

const exampleMilestonesResponse = `
Milestone 1: Research Complete
Students have completed background research and identified community energy needs through interviews and surveys.

Milestone 2: Design Approved  
Teams have created detailed design plans that have been reviewed and approved by instructors.

Milestone 3: Prototype Built
Working prototypes have been constructed and initial testing has been completed with documented results.
`;

const exampleRubricResponse = `
1. Content Knowledge: Demonstrates understanding of renewable energy concepts and principles (30 points)
2. Design Process: Shows evidence of systematic design thinking and iteration (25 points)  
3. Technical Implementation: Successfully builds and tests working prototype (25 points)
4. Communication: Clearly presents findings and solutions to target audience (20 points)
`;

const exampleImpactResponse = `
Students will present their renewable energy solutions to local community leaders and environmental organizations. The presentation will take place at the end of the project timeline through a community showcase event where students demonstrate their prototypes and share their research findings.
`;

// Demonstration function
export async function demonstrateContentParsingService() {
  console.log('=== ContentParsingService Demonstration ===\n');
  
  // Create a parsing service instance with custom configuration
  const parser = new ContentParsingService({
    verbose: true,
    minPhases: 3,
    minActivities: 5,
    minResources: 3,
    cleanMarkdown: true
  });
  
  // 1. Parse Journey Phases
  console.log('1. PARSING JOURNEY PHASES\n');
  
  console.log('Example 1: Phase format with bullets');
  const phases1 = parser.parseJourneyPhases(examplePhaseResponse1);
  console.log('Result:', JSON.stringify(phases1, null, 2));
  console.log();
  
  console.log('Example 2: Numbered list format');
  const phases2 = parser.parseJourneyPhases(examplePhaseResponse2);
  console.log('Result:', JSON.stringify(phases2, null, 2));
  console.log();
  
  // 2. Parse Activities
  console.log('2. PARSING ACTIVITIES\n');
  
  const activities = parser.parseActivities(exampleActivitiesResponse);
  console.log('Activities parsed:', activities.activities.length);
  console.log('Format used:', activities.format);
  console.log('Confidence:', activities.confidence);
  console.log('Sample activities:');
  activities.activities.slice(0, 3).forEach((activity, idx) => {
    console.log(`  ${idx + 1}. ${activity}`);
  });
  console.log();
  
  // 3. Parse Milestones
  console.log('3. PARSING MILESTONES\n');
  
  const milestones = await parser.parseMilestones(exampleMilestonesResponse);
  console.log('Milestones parsed:', milestones.milestones.length);
  console.log('Format used:', milestones.format);
  console.log('Confidence:', milestones.confidence);
  console.log('Sample milestones:');
  milestones.milestones.forEach(milestone => {
    console.log(`  - ${milestone.title}: ${milestone.description}`);
  });
  console.log();
  
  // 4. Parse Rubric Criteria
  console.log('4. PARSING RUBRIC CRITERIA\n');
  
  const rubric = await parser.parseRubricCriteria(exampleRubricResponse);
  console.log('Criteria parsed:', rubric.criteria.length);
  console.log('Format used:', rubric.format);
  console.log('Confidence:', rubric.confidence);
  console.log('Sample criteria:');
  rubric.criteria.forEach(criterion => {
    console.log(`  - ${criterion.criterion} (${criterion.weight} points): ${criterion.description}`);
  });
  console.log();
  
  // 5. Parse Impact
  console.log('5. PARSING IMPACT\n');
  
  const impact = await parser.parseImpact(exampleImpactResponse);
  console.log('Impact parsed:');
  console.log(`  Audience: ${impact.audience}`);
  console.log(`  Method: ${impact.method}`);
  console.log(`  Purpose: ${impact.purpose}`);
  console.log(`  Format used: ${impact.format}`);
  console.log(`  Confidence: ${impact.confidence}`);
  console.log();
  
  // 6. Parse Ideation Content
  console.log('6. PARSING IDEATION CONTENT\n');
  
  const multipleIdeas = `
1. Solar-Powered Water Purification System
   Create a portable device that uses solar energy to purify water for communities

2. Wind-Powered Phone Charging Station  
   Design a small wind turbine that can charge mobile devices in remote areas

3. Biogas Generator from Food Waste
   Build a system that converts organic waste into usable cooking gas
`;
  
  const bigIdea = parser.parseBigIdea(multipleIdeas);
  console.log('Big Idea parsed:');
  console.log(`  Content: ${bigIdea.content}`);
  console.log(`  Format used: ${bigIdea.format}`);
  console.log(`  Confidence: ${bigIdea.confidence}`);
  console.log();
  
  // 7. Test Configuration Changes
  console.log('7. TESTING CONFIGURATION CHANGES\n');
  
  console.log('Current config:', parser.getConfig());
  
  parser.updateConfig({ 
    verbose: false, 
    minActivities: 10,
    cleanMarkdown: false 
  });
  
  console.log('Updated config:', parser.getConfig());
  
  // Test with new config
  const activitiesWithNewConfig = parser.parseActivities(exampleActivitiesResponse);
  console.log('Activities with new min requirement:', activitiesWithNewConfig.activities.length);
  
  // Reset to defaults
  parser.resetConfig();
  console.log('Reset to default config:', parser.getConfig());
  
  console.log('\n=== Demonstration Complete ===');
}

// Usage in a real application:
export function integrateWithSOPFlowManager() {
  console.log('=== Integration Example ===\n');
  
  // This shows how SOPFlowManager now uses ContentParsingService
  const exampleUsage = `
  // Before (in updateStepData):
  case 'JOURNEY_PHASES':
    // 200+ lines of complex parsing logic...
    
  // After (in updateStepData):  
  case 'JOURNEY_PHASES':
    const parsedPhases = contentParsingService.parseJourneyPhases(data);
    blueprintDoc.journey.phases = parsedPhases.phases;
    console.log(\`Parsed \${parsedPhases.phases.length} phases using \${parsedPhases.format} format (confidence: \${parsedPhases.confidence})\`);
    break;
    
  // Benefits:
  // 1. Single responsibility - SOPFlowManager focuses on state management
  // 2. Testable - ContentParsingService can be unit tested independently  
  // 3. Reusable - Other components can use the same parsing logic
  // 4. Maintainable - All parsing logic is centralized in one service
  // 5. Configurable - Parsing behavior can be customized per use case
  `;
  
  console.log(exampleUsage);
}

// Example of creating custom parser configurations for different contexts
export function customConfigurationExamples() {
  console.log('=== Custom Configuration Examples ===\n');
  
  // For testing - more lenient requirements
  const testParser = new ContentParsingService({
    minPhases: 1,
    minActivities: 1, 
    minResources: 1,
    minMilestones: 1,
    verbose: true
  });
  
  // For production - strict requirements
  const productionParser = new ContentParsingService({
    minPhases: 3,
    minActivities: 5,
    minResources: 3,
    minMilestones: 3,
    verbose: false,
    cleanMarkdown: true
  });
  
  // For debugging - detailed logging
  const debugParser = new ContentParsingService({
    verbose: true,
    cleanMarkdown: false // Keep original formatting for analysis
  });
  
  console.log('Test config:', testParser.getConfig());
  console.log('Production config:', productionParser.getConfig());
  console.log('Debug config:', debugParser.getConfig());
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateContentParsingService()
    .then(() => {
      integrateWithSOPFlowManager();
      customConfigurationExamples();
    })
    .catch(console.error);
}