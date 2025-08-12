/**
 * Data Validator for ALF Coach
 * Ensures consistent data structure across Firebase and localStorage
 */

import { serverTimestamp } from 'firebase/firestore';

export interface BlueprintData {
  // Core identifiers
  id?: string;
  userId: string;
  
  // Basic info
  title: string;
  abstract: string;
  subject: string;
  ageGroup: string;
  educatorPerspective: string;
  projectScope: string;
  
  // Stage tracking
  stage: 'IDEATION' | 'LEARNING_JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  
  // Timestamps
  createdAt: any; // Firebase Timestamp or Date
  updatedAt?: any;
  
  // Ideation data
  ideation?: {
    bigIdea: string;
    essentialQuestion: string;
    challenge: string;
  };
  
  // Learning Journey data
  learningJourney?: {
    phaseBreakdown?: {
      analyze: { duration: string; activities: string[] };
      brainstorm: { duration: string; activities: string[] };
      prototype: { duration: string; activities: string[] };
      evaluate: { duration: string; activities: string[] };
    };
    iterations?: any;
  };
  
  // Deliverables
  studentDeliverables?: any;
  
  // Chat histories
  ideationChat?: any[];
  learningJourneyChat?: any[];
  studentDeliverablesChat?: any[];
  chatHistory?: any[];
  
  // Legacy fields (for backward compatibility)
  coreIdea?: string;
  challenge?: string;
  curriculumDraft?: string;
  assignments?: any[];
  assessmentMethods?: string;
  location?: string;
  initialMaterials?: string;
  
  // Wizard data (if created via wizard)
  wizard?: {
    educatorPerspective: string;
    subject: string;
    ageGroup: string;
    location?: string;
    materials?: string;
    scope: string;
    motivation?: string;
  };
}

/**
 * Validates and normalizes blueprint data
 */
export function validateBlueprintData(data: any): BlueprintData {
  // Ensure required fields
  if (!data.userId) {
    throw new Error('Blueprint must have a userId');
  }
  
  // Set defaults for required fields
  const validated: BlueprintData = {
    userId: data.userId,
    title: data.title || 'Untitled Blueprint',
    abstract: data.abstract || '',
    subject: data.subject || 'General',
    ageGroup: data.ageGroup || 'K-12',
    educatorPerspective: data.educatorPerspective || 'Teacher',
    projectScope: data.projectScope || data.scope || 'Unit',
    stage: data.stage || 'IDEATION',
    createdAt: data.createdAt || serverTimestamp(),
    
    // Include optional fields if present
    ...(data.id && { id: data.id }),
    ...(data.updatedAt && { updatedAt: data.updatedAt }),
    ...(data.ideation && { ideation: data.ideation }),
    ...(data.learningJourney && { learningJourney: data.learningJourney }),
    ...(data.studentDeliverables && { studentDeliverables: data.studentDeliverables }),
    
    // Chat histories
    ...(data.ideationChat && { ideationChat: data.ideationChat }),
    ...(data.learningJourneyChat && { learningJourneyChat: data.learningJourneyChat }),
    ...(data.studentDeliverablesChat && { studentDeliverablesChat: data.studentDeliverablesChat }),
    ...(data.chatHistory && { chatHistory: data.chatHistory }),
    
    // Legacy fields
    ...(data.coreIdea && { coreIdea: data.coreIdea }),
    ...(data.challenge && { challenge: data.challenge }),
    ...(data.curriculumDraft && { curriculumDraft: data.curriculumDraft }),
    ...(data.assignments && { assignments: data.assignments }),
    ...(data.assessmentMethods && { assessmentMethods: data.assessmentMethods }),
    ...(data.location && { location: data.location }),
    ...(data.initialMaterials && { initialMaterials: data.initialMaterials }),
    
    // Wizard data
    ...(data.wizard && { wizard: data.wizard })
  };
  
  return validated;
}

/**
 * Merges blueprint data from different sources
 * Firebase data takes precedence over localStorage
 */
export function mergeBlueprintData(firebaseData: any, localData: any): BlueprintData {
  // Start with local data as base
  const merged = { ...localData };
  
  // Override with Firebase data
  Object.keys(firebaseData).forEach(key => {
    if (firebaseData[key] !== undefined && firebaseData[key] !== null) {
      merged[key] = firebaseData[key];
    }
  });
  
  return validateBlueprintData(merged);
}

/**
 * Prepares blueprint data for saving to Firebase
 */
export function prepareBlueprintForSave(data: BlueprintData): any {
  const prepared = { ...data };
  
  // Remove id field (stored as document ID)
  delete prepared.id;
  
  // Ensure timestamps
  if (!prepared.createdAt) {
    prepared.createdAt = serverTimestamp();
  }
  prepared.updatedAt = serverTimestamp();
  
  return prepared;
}

/**
 * Prepares blueprint data for localStorage
 */
export function prepareBlueprintForLocalStorage(data: BlueprintData): any {
  const prepared = { ...data };
  
  // Convert Firebase timestamps to ISO strings
  if (prepared.createdAt?.toDate) {
    prepared.createdAt = prepared.createdAt.toDate().toISOString();
  } else if (prepared.createdAt instanceof Date) {
    prepared.createdAt = prepared.createdAt.toISOString();
  }
  
  if (prepared.updatedAt?.toDate) {
    prepared.updatedAt = prepared.updatedAt.toDate().toISOString();
  } else if (prepared.updatedAt instanceof Date) {
    prepared.updatedAt = prepared.updatedAt.toISOString();
  }
  
  return prepared;
}