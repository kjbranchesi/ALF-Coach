// src/__tests__/orchestrator.test.js

import { buildIntakePrompt, buildCurriculumPrompt, buildAssignmentPrompt } from '../prompts/orchestrator';

describe('Prompt Orchestrator', () => {
  const mockProject = {
    ageGroup: 'Ages 11-14',
    scope: 'Classroom',
    subject: 'Marine Biology',
    location: 'Coastal Town',
    educatorPerspective: 'I want to do a project about ocean conservation.',
    initialMaterials: 'Some articles about plastic pollution.',
    title: 'Protecting Our Oceans',
    coreIdea: 'Students will learn about the impact of plastic pollution on marine life.',
    curriculumDraft: `### Phase 1: Research
* Objective: Understand the problem.`,
    assignments: [],
  };

  describe('buildIntakePrompt', () => {
    it('should return a valid intake prompt', () => {
      const prompt = buildIntakePrompt(mockProject);
      expect(prompt).toContain('# CORE IDENTITY: THE PEDAGOGICAL DESIGN PARTNER');
      expect(prompt).toContain('# COACHING ADJUSTMENT: AGES 11-14 (MIDDLE SCHOOL)');
      expect(prompt).toContain('# AI TASK: STAGE 1 - IDEATION');
      expect(prompt).toContain('The user is working on a project with the following details:');
      expect(prompt).toContain('Marine Biology');
    });
  });

  describe('buildCurriculumPrompt', () => {
    it('should return a valid curriculum prompt', () => {
      const prompt = buildCurriculumPrompt(mockProject);
      expect(prompt).toContain('# CORE IDENTITY: THE PEDAGOGICAL DESIGN PARTNER');
      expect(prompt).toContain('# COACHING ADJUSTMENT: AGES 11-14 (MIDDLE SCHOOL)');
      expect(prompt).toContain('# AI TASK: STAGE 2 - LEARNING JOURNEY');
      expect(prompt).toContain('Current Curriculum Draft:');
      expect(prompt).toContain('Protecting Our Oceans');
    });
  });

  describe('buildAssignmentPrompt', () => {
    it('should return a valid assignment prompt', () => {
      const prompt = buildAssignmentPrompt(mockProject);
      expect(prompt).toContain('# CORE IDENTITY: THE PEDAGOGICAL DESIGN PARTNER');
      expect(prompt).toContain('# COACHING ADJUSTMENT: AGES 11-14 (MIDDLE SCHOOL)');
      expect(prompt).toContain('# AI TASK: STAGE 3 - STUDENT DELIVERABLES');
      expect(prompt).toContain('Curriculum:');
      expect(prompt).toContain('Protecting Our Oceans');
    });
  });
});
