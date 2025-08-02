/**
 * ALF Progression Types
 * 
 * Shared types for ALF stages, project types, and community connections
 * used across multiple services.
 */

export enum ALFStage {
  Explorer = 'explorer',
  Investigator = 'investigator',
  Creator = 'creator',
  Innovator = 'innovator',
  ChangeAgent = 'change-agent'
}

export enum ProjectType {
  Research = 'research',
  Design = 'design',
  Build = 'build',
  Service = 'service',
  Advocacy = 'advocacy',
  Creative = 'creative',
  Technical = 'technical',
  Environmental = 'environmental',
  Social = 'social',
  Scientific = 'scientific',
  Entrepreneurial = 'entrepreneurial',
  Community = 'community'
}

export interface CommunityConnection {
  id: string;
  name: string;
  type: 'organization' | 'business' | 'nonprofit' | 'government' | 'individual';
  description: string;
  contactInfo: ContactInfo;
  partnershipLevel: 'informal' | 'formal' | 'strategic';
  projects: string[];
  resources: string[];
  expertise: string[];
}

export interface ContactInfo {
  primaryContact?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  socialMedia?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface ALFProjectStageRequirements {
  stage: ALFStage;
  minimumDuration: number; // days
  requiredElements: string[];
  assessmentCriteria: string[];
  communityEngagement: boolean;
  expertSupport: boolean;
  peerCollaboration: boolean;
  reflection: boolean;
  presentation: boolean;
}

export const ALF_STAGE_REQUIREMENTS: Record<ALFStage, ALFProjectStageRequirements> = {
  [ALFStage.Explorer]: {
    stage: ALFStage.Explorer,
    minimumDuration: 7,
    requiredElements: [
      'Topic exploration',
      'Initial research',
      'Question formulation',
      'Resource discovery'
    ],
    assessmentCriteria: [
      'Curiosity demonstrated',
      'Questions identified',
      'Resources found',
      'Initial understanding shown'
    ],
    communityEngagement: false,
    expertSupport: false,
    peerCollaboration: true,
    reflection: true,
    presentation: false
  },
  [ALFStage.Investigator]: {
    stage: ALFStage.Investigator,
    minimumDuration: 14,
    requiredElements: [
      'Deep research',
      'Data collection',
      'Analysis',
      'Hypothesis development'
    ],
    assessmentCriteria: [
      'Research quality',
      'Data analysis',
      'Critical thinking',
      'Conclusions drawn'
    ],
    communityEngagement: true,
    expertSupport: true,
    peerCollaboration: true,
    reflection: true,
    presentation: true
  },
  [ALFStage.Creator]: {
    stage: ALFStage.Creator,
    minimumDuration: 21,
    requiredElements: [
      'Solution design',
      'Prototype/product creation',
      'Testing and iteration',
      'Documentation'
    ],
    assessmentCriteria: [
      'Design thinking',
      'Creation quality',
      'Problem-solving',
      'Iteration based on feedback'
    ],
    communityEngagement: true,
    expertSupport: true,
    peerCollaboration: true,
    reflection: true,
    presentation: true
  },
  [ALFStage.Innovator]: {
    stage: ALFStage.Innovator,
    minimumDuration: 30,
    requiredElements: [
      'Novel approach',
      'Advanced implementation',
      'Impact measurement',
      'Scalability planning'
    ],
    assessmentCriteria: [
      'Innovation demonstrated',
      'Implementation quality',
      'Impact achieved',
      'Future planning'
    ],
    communityEngagement: true,
    expertSupport: true,
    peerCollaboration: true,
    reflection: true,
    presentation: true
  },
  [ALFStage.ChangeAgent]: {
    stage: ALFStage.ChangeAgent,
    minimumDuration: 45,
    requiredElements: [
      'Community impact',
      'Leadership',
      'Sustainability plan',
      'Knowledge transfer'
    ],
    assessmentCriteria: [
      'Leadership shown',
      'Community impact',
      'Sustainability',
      'Others empowered'
    ],
    communityEngagement: true,
    expertSupport: true,
    peerCollaboration: true,
    reflection: true,
    presentation: true
  }
};