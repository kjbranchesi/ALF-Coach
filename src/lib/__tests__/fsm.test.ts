import { JourneyFSM } from '../fsm';

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

    it('should not allow skipping required stages', () => {
      fsm.advance(); // Move to phases
      expect(fsm.canSkip()).toBe(false);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      expect(fsm.progress).toEqual({
        current: 1,
        total: 5,
        percentage: 0
      });

      fsm.advance(); // To phases
      expect(fsm.progress.current).toBe(2);
      expect(fsm.progress.percentage).toBe(25);
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
});