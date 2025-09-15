/**
 * Seed data for hero sustainability campaign sample
 * Per Codex's implementation brief
 */

export const heroSampleData = {
  // Standards for coverage map
  standards: [
    { id: 's1', code: 'HS-ESS3-4', label: 'Evaluate solutions to reduce human impact', framework: 'NGSS' },
    { id: 's2', code: 'HS-ETS1-3', label: 'Evaluate solution priorities and trade-offs', framework: 'NGSS' },
    { id: 's3', code: 'RST.11-12.1', label: 'Cite textual evidence for analysis', framework: 'CCSS-ELA' }
  ],
  
  // Milestones for coverage map
  milestones: [
    { id: 'm1', name: 'Research Phase' },
    { id: 'm2', name: 'Data Collection' },
    { id: 'm3', name: 'Solution Design' },
    { id: 'm4', name: 'Implementation' },
    { id: 'm5', name: 'Presentation' }
  ],
  
  // Coverage mappings
  coverage: [
    { standardId: 's1', milestoneId: 'm1', emphasis: 'introduce' as const },
    { standardId: 's1', milestoneId: 'm2', emphasis: 'develop' as const },
    { standardId: 's1', milestoneId: 'm4', emphasis: 'master' as const },
    { standardId: 's2', milestoneId: 'm3', emphasis: 'introduce' as const },
    { standardId: 's2', milestoneId: 'm4', emphasis: 'develop' as const },
    { standardId: 's3', milestoneId: 'm1', emphasis: 'introduce' as const },
    { standardId: 's3', milestoneId: 'm5', emphasis: 'master' as const }
  ],
  
  // Feasibility data
  constraints: {
    budgetUSD: 500,
    techAccess: 'full' as const,
    materials: ['Chromebooks', 'Poster boards', 'Art supplies', 'Camera equipment'],
    safetyRequirements: ['Adult supervision for community visits', 'Permission slips for off-campus work']
  },
  
  risks: [
    {
      id: 'r1',
      name: 'Community partner availability',
      likelihood: 'med' as const,
      impact: 'high' as const,
      mitigation: 'Have backup virtual meetings and pre-recorded expert videos ready'
    },
    {
      id: 'r2',
      name: 'Weather delays for outdoor data collection',
      likelihood: 'low' as const,
      impact: 'med' as const,
      mitigation: 'Build buffer time into schedule and have indoor alternatives'
    }
  ],
  
  contingencies: [
    {
      id: 'c1',
      scenario: 'Timeline compressed by school events',
      plan: 'Combine research and data collection phases, reduce iteration cycles'
    },
    {
      id: 'c2',
      scenario: 'Partner organization unavailable',
      plan: 'Pivot to virtual collaboration with environmental NGO'
    }
  ]
};