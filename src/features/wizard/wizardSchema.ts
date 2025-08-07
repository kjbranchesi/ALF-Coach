import { z } from 'zod';

export const wizardSchema = z.object({
  motivation: z.string().min(10, 'Please describe your motivation (at least 10 characters)'),
  subject: z.string().min(2, 'Subject is required'),
  ageGroup: z.string().min(3, 'Age group is required (e.g., "14-16")'),
  duration: z.string().optional(), // Duration like "3 weeks", "1 semester"
  alfFocus: z.string().optional(), // ALF framework focus area
  location: z.string().optional(),
  materials: z.string().optional(),
  teacherResources: z.string().optional(),
  scope: z.enum(['lesson', 'unit', 'course'], {
    required_error: 'Please select a scope',
  }),
});

export type WizardData = z.infer<typeof wizardSchema>;

export const defaultWizardData: WizardData = {
  motivation: '',
  subject: '',
  ageGroup: '',
  duration: '',
  alfFocus: '',
  location: '',
  materials: '',
  teacherResources: '',
  scope: 'unit',
};