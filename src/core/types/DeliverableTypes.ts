/**
 * DeliverableTypes.ts - Extended types for generating teacher/student materials
 */

import { type BlueprintDoc } from './SOPTypes';

// Additional data we'll collect during the flow
export interface DeliverableEnhancements {
  // Basic project metadata
  projectTitle?: string;
  teacherName?: string;
  schoolName?: string;
  estimatedDuration?: string; // "3 weeks", "1 month", etc.
  
  // Simple timeline
  timeline?: {
    phase1Duration?: string;
    phase2Duration?: string;
    phase3Duration?: string;
    totalWeeks?: number;
  };
  
  // Student-friendly versions
  studentFriendly?: {
    challengeDescription?: string;
    whatYouWillLearn?: string[];
    howToSucceed?: string[];
  };
  
  // Additional teacher notes
  teacherNotes?: {
    materialsNeeded?: string[];
    techRequirements?: string[];
    differentiation?: string;
    extensionIdeas?: string;
  };
}

// Complete deliverable data
export interface DeliverableData extends BlueprintDoc {
  enhancements?: DeliverableEnhancements;
}

// Export format options
export type ExportFormat = 'pdf' | 'preview' | 'json';

// Document templates
export interface DocumentTemplate {
  type: 'teacher-guide' | 'student-guide';
  title: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  title: string;
  content: string | string[] | any;
  style?: 'heading' | 'paragraph' | 'list' | 'table' | 'highlight';
}