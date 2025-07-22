import { JourneyFSM } from '../fsm';
import type { Phase, Activity, Resource, Milestone, RubricCriterion, Impact } from '../fsm';

describe('JourneyFSM', () => {
  let fsm: JourneyFSM;

  beforeEach(() => {
    fsm = new JourneyFSM();
  });

  describe('State Transitions', () => {
    it('should start at JOURNEY_OVERVIEW', () => {
      expect(fsm.current).toBe('JOURNEY_OVERVIEW');
    });

    it('should advance through states in correct order', () => {
      const expectedOrder = [
        'JOURNEY_OVERVIEW',
        'JOURNEY_PHASES',
        'JOURNEY_ACTIVITIES',
        'JOURNEY_RESOURCES',
        'JOURNEY_REVIEW',
        'COMPLETE'
      ];

      expectedOrder.forEach((expectedState, index) => {
        expect(fsm.current).toBe(expectedState);
        if (index < expectedOrder.length - 1) {
          // Add minimal data to pass validation
          if (expectedState === 'JOURNEY_PHASES') {
            fsm.updateData({
              phases: [
                { id: '1', name: 'Phase 1', description: 'First phase' },
                { id: '2', name: 'Phase 2', description: 'Second phase' }
              ]
            });
          } else if (expectedState === 'JOURNEY_ACTIVITIES') {
            fsm.updateData({
              activities: [
                { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
                { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
              ]
            });
          }
          
          const result = fsm.advance();
          expect(result.success).toBe(true);
        }
      });
    });

    it('should not advance beyond COMPLETE', () => {
      // Advance to COMPLETE
      while (fsm.current !== 'COMPLETE') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }

      const result = fsm.advance();
      expect(result.success).toBe(false);
      expect(result.message).toContain('complete');
    });
  });

  describe('Validation', () => {
    it('should require at least 2 phases to advance from JOURNEY_PHASES', () => {
      fsm.advance(); // Skip overview
      
      // Try to advance without phases
      let result = fsm.advance();
      expect(result.success).toBe(false);
      expect(result.message).toContain('at least 2 phases');

      // Add one phase - still not enough
      fsm.updateData({
        phases: [{ id: '1', name: 'Phase 1', description: 'First phase' }]
      });
      result = fsm.advance();
      expect(result.success).toBe(false);

      // Add second phase - should work
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      result = fsm.advance();
      expect(result.success).toBe(true);
    });

    it('should require activities for each phase', () => {
      fsm.advance(); // Skip overview
      
      // Add phases
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.advance(); // Move to activities

      // Try to advance without activities
      let result = fsm.advance();
      expect(result.success).toBe(false);
      expect(result.message).toContain('Each phase needs at least one activity');

      // Add activity for only one phase
      fsm.updateData({
        activities: [
          { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' }
        ]
      });
      result = fsm.advance();
      expect(result.success).toBe(false);

      // Add activity for second phase
      fsm.updateData({
        activities: [
          { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
          { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
        ]
      });
      result = fsm.advance();
      expect(result.success).toBe(true);
    });
  });

  describe('Edit Functionality', () => {
    it('should allow editing previous states', () => {
      // Advance to activities
      fsm.advance(); // Skip overview
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.advance(); // Move to activities

      // Edit phases
      const result = fsm.edit('JOURNEY_PHASES');
      expect(result.success).toBe(true);
      expect(fsm.current).toBe('JOURNEY_PHASES');
    });

    it('should not allow editing future states', () => {
      const result = fsm.edit('JOURNEY_RESOURCES');
      expect(result.success).toBe(false);
      expect(fsm.current).toBe('JOURNEY_OVERVIEW');
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping JOURNEY_OVERVIEW', () => {
      expect(fsm.canSkip()).toBe(true);
    });

    it('should allow skipping JOURNEY_RESOURCES', () => {
      // Advance to resources
      while (fsm.current !== 'JOURNEY_RESOURCES') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }

      expect(fsm.canSkip()).toBe(true);
    });

    it('should allow skipping all DELIVER stages', () => {
      // Advance to DELIVER stages
      const skipToDeliverStages = () => {
        while (!fsm.current.startsWith('DELIVER')) {
          if (fsm.current === 'JOURNEY_PHASES') {
            fsm.updateData({
              phases: [
                { id: '1', name: 'Phase 1', description: 'First phase' },
                { id: '2', name: 'Phase 2', description: 'Second phase' }
              ]
            });
          } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
            fsm.updateData({
              activities: [
                { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
                { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
              ]
            });
          }
          fsm.advance();
        }
      };

      skipToDeliverStages();
      
      // Test each DELIVER stage
      expect(fsm.current).toBe('DELIVER_MILESTONES');
      expect(fsm.canSkip()).toBe(true);
      
      fsm.advance();
      expect(fsm.current).toBe('DELIVER_RUBRIC');
      expect(fsm.canSkip()).toBe(true);
      
      fsm.advance();
      expect(fsm.current).toBe('DELIVER_IMPACT');
      expect(fsm.canSkip()).toBe(true);
    });

    it('should not allow skipping required stages', () => {
      fsm.advance(); // Move to phases
      expect(fsm.canSkip()).toBe(false);
    });

    it('should reach PUBLISH_REVIEW even when skipping all optional stages', () => {
      // Skip overview
      fsm.advance();
      
      // Add required phases
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.advance();
      
      // Add required activities
      fsm.updateData({
        activities: [
          { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
          { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
        ]
      });
      fsm.advance();
      
      // Skip resources
      expect(fsm.canSkip()).toBe(true);
      fsm.advance();
      
      // Journey review
      fsm.advance();
      
      // Skip all deliver stages
      expect(fsm.current).toBe('DELIVER_MILESTONES');
      expect(fsm.canSkip()).toBe(true);
      fsm.advance();
      
      expect(fsm.current).toBe('DELIVER_RUBRIC');
      expect(fsm.canSkip()).toBe(true);
      fsm.advance();
      
      expect(fsm.current).toBe('DELIVER_IMPACT');
      expect(fsm.canSkip()).toBe(true);
      fsm.advance();
      
      // Should reach PUBLISH_REVIEW
      expect(fsm.current).toBe('PUBLISH_REVIEW');
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      expect(fsm.progress.current).toBe(1);
      expect(fsm.progress.total).toBe(9); // Total stages excluding COMPLETE
      expect(fsm.progress.percentage).toBe(0);
      expect(fsm.progress.segment).toBe('journey');

      // Advance through journey stages
      fsm.advance(); // To phases
      expect(fsm.progress.current).toBe(2);
      expect(fsm.progress.segment).toBe('journey');
      
      // Skip to deliver stages
      while (!fsm.current.startsWith('DELIVER')) {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }
      
      expect(fsm.progress.segment).toBe('deliver');
      
      // Advance to PUBLISH_REVIEW
      while (fsm.current !== 'PUBLISH_REVIEW') {
        fsm.advance();
      }
      expect(fsm.progress.segment).toBe('deliver');
      
      // Complete
      fsm.advance();
      expect(fsm.current).toBe('COMPLETE');
      expect(fsm.progress.segment).toBe('complete');
    });
  });

  describe('State Export/Import', () => {
    it('should export and import state correctly', () => {
      // Set up some state
      fsm.advance();
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.addReflection('This is going well!');

      // Export state
      const exported = fsm.exportState();
      
      // Create new FSM and import
      const newFsm = new JourneyFSM();
      newFsm.importState(exported);

      // Verify state was restored
      expect(newFsm.current).toBe(fsm.current);
      expect(newFsm.data).toEqual(fsm.data);
      expect(newFsm.data.reflections).toContain('This is going well!');
    });
  });

  describe('processInput method', () => {
    it('should reject empty input', () => {
      const result = fsm.processInput('');
      expect(result.success).toBe(false);
      expect(result.message).toContain('provide some input');
    });

    it('should reject whitespace-only input', () => {
      const result = fsm.processInput('   \n\t   ');
      expect(result.success).toBe(false);
      expect(result.message).toContain('provide some input');
    });

    it('should accept valid input for JOURNEY_OVERVIEW', () => {
      const result = fsm.processInput('Students will create robots to help elderly people');
      expect(result.success).toBe(true);
      expect(result.readyForNext).toBe(true);
    });

    it('should parse phases from numbered list', () => {
      fsm.advance(); // to JOURNEY_PHASES
      const input = `
        1. Discovery Phase - Students explore the problem space
        2. Design Phase - Create innovative solutions
        3. Implementation - Build and test prototypes
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.phases).toHaveLength(3);
      expect(fsm.data.phases[0].name).toBe('Discovery Phase');
      expect(fsm.data.phases[0].description).toContain('explore the problem');
    });

    it('should parse activities with phase associations', () => {
      // Set up phases first
      fsm.advance();
      fsm.updateData({
        phases: [
          { id: '1', name: 'Research', description: 'Research phase' },
          { id: '2', name: 'Build', description: 'Build phase' }
        ]
      });
      fsm.advance(); // to JOURNEY_ACTIVITIES
      
      const input = `
        Research: Interview experts, Survey community
        Build: Create prototypes, Test solutions
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.activities).toHaveLength(4);
      expect(fsm.data.activities[0].name).toBe('Interview experts');
      expect(fsm.data.activities[0].phaseId).toBeTruthy();
    });

    it('should parse resources correctly', () => {
      // Advance to RESOURCES
      fsm.advance(); // PHASES
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.advance(); // ACTIVITIES
      fsm.updateData({
        activities: [
          { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
          { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
        ]
      });
      fsm.advance(); // RESOURCES
      
      const input = `
        - Arduino documentation
        - 3D printing tutorial videos
        - Local maker space
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.resources).toHaveLength(3);
      expect(fsm.data.resources[0].name).toBe('Arduino documentation');
      expect(fsm.data.resources[0].type).toBe('other');
    });

    it('should parse milestones correctly', () => {
      // Advance to DELIVER_MILESTONES
      while (fsm.current !== 'DELIVER_MILESTONES') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }
      
      const input = `
        Week 2: Complete research phase
        Week 4: Finish prototype design
        Week 8: Final presentation
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.deliverables?.milestones).toHaveLength(3);
      expect(fsm.data.deliverables?.milestones?.[0].name).toContain('Complete research');
    });

    it('should parse rubric criteria correctly', () => {
      // Advance to DELIVER_RUBRIC
      while (fsm.current !== 'DELIVER_RUBRIC') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }
      
      const input = `
        Innovation: Creative problem-solving approach
        Technical Skills: Effective use of tools and technologies
        Collaboration: Teamwork and communication
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.deliverables?.rubric?.criteria).toHaveLength(3);
      expect(fsm.data.deliverables?.rubric?.criteria?.[0].name).toBe('Innovation');
      expect(fsm.data.deliverables?.rubric?.criteria?.[0].description).toContain('Creative problem-solving');
    });

    it('should parse impact correctly', () => {
      // Advance to DELIVER_IMPACT
      while (fsm.current !== 'DELIVER_IMPACT') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }
      
      const input = `
        Audience: Local senior center residents
        Method: Students will present their assistive robots and train staff
      `;
      
      const result = fsm.processInput(input);
      expect(result.success).toBe(true);
      expect(fsm.data.deliverables?.impact?.audience).toBe('Local senior center residents');
      expect(fsm.data.deliverables?.impact?.method).toContain('present their assistive robots');
    });
  });

  describe('getTransitionMessage', () => {
    it('should return appropriate message for each state', () => {
      const states = [
        'JOURNEY_OVERVIEW',
        'JOURNEY_PHASES',
        'JOURNEY_ACTIVITIES',
        'JOURNEY_RESOURCES',
        'JOURNEY_REVIEW',
        'DELIVER_MILESTONES',
        'DELIVER_RUBRIC',
        'DELIVER_IMPACT',
        'PUBLISH_REVIEW',
        'COMPLETE'
      ];

      const messages = new Set<string>();
      
      // Advance through all states and collect messages
      while (fsm.current !== 'COMPLETE') {
        const message = fsm.getTransitionMessage();
        messages.add(message);
        
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        fsm.advance();
      }
      
      // Add final message
      messages.add(fsm.getTransitionMessage());
      
      // Each state should have a unique message
      expect(messages.size).toBeGreaterThanOrEqual(states.length - 1); // -1 because COMPLETE might reuse
    });
  });

  describe('Error handling', () => {
    it('should handle malformed phase input gracefully', () => {
      fsm.advance(); // to JOURNEY_PHASES
      const result = fsm.processInput('This is not a proper phase format');
      
      expect(result.success).toBe(true);
      expect(fsm.data.phases).toHaveLength(1);
      expect(fsm.data.phases[0].name).toBe('This is not a proper phase format');
    });

    it('should handle extremely long input', () => {
      const longInput = 'A'.repeat(10000);
      const result = fsm.processInput(longInput);
      
      expect(result.success).toBe(true);
      expect(result.readyForNext).toBe(true);
    });

    it('should handle mixed format activity input', () => {
      // Set up phases
      fsm.advance();
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' },
          { id: '2', name: 'Phase 2', description: 'Second phase' }
        ]
      });
      fsm.advance(); // to ACTIVITIES
      
      const input = 'Some activities without proper format, but still valid text';
      const result = fsm.processInput(input);
      
      expect(result.success).toBe(true);
      expect(fsm.data.activities).toHaveLength(1);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle full journey with all data', () => {
      // Overview
      fsm.processInput('Building sustainable communities through technology');
      expect(fsm.advance().success).toBe(true);
      
      // Phases
      fsm.processInput('1. Research: Understanding community needs\n2. Design: Creating solutions\n3. Implementation: Building and deploying');
      expect(fsm.advance().success).toBe(true);
      
      // Activities
      fsm.processInput('Research: Surveys, Interviews\nDesign: Prototyping, Testing\nImplementation: Development, Deployment');
      expect(fsm.advance().success).toBe(true);
      
      // Resources
      fsm.processInput('- Community partners\n- Technical documentation\n- Funding sources');
      expect(fsm.advance().success).toBe(true);
      
      // Review
      expect(fsm.advance().success).toBe(true);
      
      // Milestones
      fsm.processInput('Week 2: Research complete\nWeek 6: Prototype ready\nWeek 10: Final deployment');
      expect(fsm.advance().success).toBe(true);
      
      // Rubric
      fsm.processInput('Innovation: 40%\nImplementation: 30%\nImpact: 30%');
      expect(fsm.advance().success).toBe(true);
      
      // Impact
      fsm.processInput('Audience: Local community organizations\nMethod: Direct deployment and training');
      expect(fsm.advance().success).toBe(true);
      
      // Publish review
      expect(fsm.advance().success).toBe(true);
      
      // Complete
      expect(fsm.current).toBe('COMPLETE');
      
      // Verify all data is preserved
      const finalData = fsm.data;
      expect(finalData.phases).toHaveLength(3);
      expect(finalData.activities).toHaveLength(6);
      expect(finalData.resources).toHaveLength(3);
      expect(finalData.deliverables?.milestones).toHaveLength(3);
      expect(finalData.deliverables?.rubric?.criteria).toHaveLength(3);
      expect(finalData.deliverables?.impact?.audience).toBe('Local community organizations');
    });

    it('should handle journey with minimal required data and skips', () => {
      // Skip overview
      expect(fsm.advance().success).toBe(true);
      
      // Add minimal phases
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First' },
          { id: '2', name: 'Phase 2', description: 'Second' }
        ]
      });
      expect(fsm.advance().success).toBe(true);
      
      // Add minimal activities
      fsm.updateData({
        activities: [
          { id: '1', phaseId: '1', name: 'Act 1', description: 'Activity 1' },
          { id: '2', phaseId: '2', name: 'Act 2', description: 'Activity 2' }
        ]
      });
      expect(fsm.advance().success).toBe(true);
      
      // Skip resources
      expect(fsm.advance().success).toBe(true);
      
      // Journey review
      expect(fsm.advance().success).toBe(true);
      
      // Skip all deliverables
      expect(fsm.advance().success).toBe(true); // skip milestones
      expect(fsm.advance().success).toBe(true); // skip rubric
      expect(fsm.advance().success).toBe(true); // skip impact
      
      // Should reach publish review
      expect(fsm.current).toBe('PUBLISH_REVIEW');
      expect(fsm.advance().success).toBe(true);
      
      // Should be complete
      expect(fsm.current).toBe('COMPLETE');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      // Advance and add data
      fsm.advance();
      fsm.updateData({
        phases: [
          { id: '1', name: 'Phase 1', description: 'First phase' }
        ]
      });

      // Reset
      fsm.reset();
      
      expect(fsm.current).toBe('JOURNEY_OVERVIEW');
      expect(fsm.data.phases).toHaveLength(0);
    });

    it('should preserve phases when requested', () => {
      // Add phases
      fsm.advance();
      const phases = [
        { id: '1', name: 'Phase 1', description: 'First phase' },
        { id: '2', name: 'Phase 2', description: 'Second phase' }
      ];
      fsm.updateData({ phases });

      // Reset with preserve
      fsm.reset(true);
      
      expect(fsm.current).toBe('JOURNEY_OVERVIEW');
      expect(fsm.data.phases).toEqual(phases);
      expect(fsm.data.activities).toHaveLength(0);
    });
  });

  describe('Additional coverage tests', () => {
    it('should handle all state types correctly', () => {
      const allStates = [
        'JOURNEY_OVERVIEW',
        'JOURNEY_PHASES', 
        'JOURNEY_ACTIVITIES',
        'JOURNEY_RESOURCES',
        'JOURNEY_REVIEW',
        'DELIVER_MILESTONES',
        'DELIVER_RUBRIC',
        'DELIVER_IMPACT',
        'PUBLISH_REVIEW',
        'COMPLETE'
      ];

      // Test that all states are reachable
      const visitedStates = new Set<string>();
      visitedStates.add(fsm.current);

      while (fsm.current !== 'COMPLETE') {
        if (fsm.current === 'JOURNEY_PHASES') {
          fsm.updateData({
            phases: [
              { id: '1', name: 'Phase 1', description: 'First phase' },
              { id: '2', name: 'Phase 2', description: 'Second phase' }
            ]
          });
        } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
          fsm.updateData({
            activities: [
              { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
              { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
            ]
          });
        }
        
        const result = fsm.advance();
        if (result.success) {
          visitedStates.add(fsm.current);
        }
      }

      // Verify all states were visited
      expect(visitedStates.size).toBe(allStates.length);
      allStates.forEach(state => {
        expect(visitedStates.has(state)).toBe(true);
      });
    });

    it('should handle reflection additions throughout journey', () => {
      const reflections = [
        'Initial thoughts on the project',
        'Phases are coming together well',
        'Activities align with our goals',
        'Great resources identified',
        'Ready to move to deliverables'
      ];

      reflections.forEach((reflection, index) => {
        fsm.addReflection(reflection);
        
        // Advance if needed
        if (index < reflections.length - 1) {
          if (fsm.current === 'JOURNEY_PHASES') {
            fsm.updateData({
              phases: [
                { id: '1', name: 'Phase 1', description: 'First phase' },
                { id: '2', name: 'Phase 2', description: 'Second phase' }
              ]
            });
          } else if (fsm.current === 'JOURNEY_ACTIVITIES') {
            fsm.updateData({
              activities: [
                { id: '1', phaseId: '1', name: 'Activity 1', description: 'First activity' },
                { id: '2', phaseId: '2', name: 'Activity 2', description: 'Second activity' }
              ]
            });
          }
          fsm.advance();
        }
      });

      expect(fsm.data.reflections).toHaveLength(reflections.length);
      reflections.forEach(reflection => {
        expect(fsm.data.reflections).toContain(reflection);
      });
    });
  });
});