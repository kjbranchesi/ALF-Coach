import { z } from 'zod';

// Simplified schema - only essential fields for PBL generation
export const wizardSchema = z.object({
  // Step 1: Learning Vision - Most important field
  vision: z.string().min(20, 'Please describe your learning vision (at least 20 characters)'),
  
  // Step 1: Optional required resources/readings
  requiredResources: z.string().optional(),
  
  // Step 2: Subject & Scope combined
  subject: z.string().min(2, 'Subject area is required'),
  duration: z.enum(['short', 'medium', 'long'], {
    required_error: 'Please select a project duration',
  }), // short=2-3 weeks, medium=4-8 weeks, long=semester
  
  // Step 3: Students
  gradeLevel: z.string().min(2, 'Grade level is required (e.g., "7th grade", "Ages 12-14")'),
});

// Legacy field mapping for backward compatibility
export const legacyFieldMapping = {
  motivation: 'vision',
  ageGroup: 'gradeLevel',
  scope: 'duration', // Will convert lesson->short, unit->medium, course->long
};

export type WizardData = z.infer<typeof wizardSchema>;

export const defaultWizardData: WizardData = {
  vision: '',
  requiredResources: '',
  subject: '',
  duration: 'medium', // Default to 4-8 weeks
  gradeLevel: '',
};

// Duration display labels
export const DURATION_LABELS = {
  short: '2-3 weeks',
  medium: '4-8 weeks', 
  long: 'Full semester',
} as const;

// Helper to convert duration to scope for SOPFlowManager
export function durationToScope(duration: WizardData['duration']): 'lesson' | 'unit' | 'course' {
  switch (duration) {
    case 'short': return 'lesson';
    case 'medium': return 'unit';
    case 'long': return 'course';
    default: return 'unit';
  }
}