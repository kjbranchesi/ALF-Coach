/**
 * Professional Development Service
 * 
 * Simple PD resources and support for teachers implementing ALF methodology
 */

export interface PDResource {
  id: string;
  title: string;
  description: string;
  type: PDType;
  format: PDFormat;
  duration: string;
  difficulty: DifficultyLevel;
  topics: string[];
  objectives: string[];
  materials?: string[];
  url?: string;
  downloadable?: boolean;
  certification?: boolean;
  prerequisities?: string[];
}

export enum PDType {
  Guide = 'guide',
  Video = 'video',
  Workshop = 'workshop',
  Template = 'template',
  Checklist = 'checklist',
  CaseStudy = 'case-study',
  WebinarRecording = 'webinar-recording',
  CourseModule = 'course-module'
}

export enum PDFormat {
  PDF = 'pdf',
  Video = 'video',
  Interactive = 'interactive',
  Document = 'document',
  Slides = 'slides',
  Audio = 'audio'
}

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export interface TeacherProgress {
  teacherId: string;
  completedResources: string[];
  inProgressResources: string[];
  certificates: Certificate[];
  totalHours: number;
  lastActivity: Date;
  favoriteResources: string[];
}

export interface Certificate {
  id: string;
  resourceId: string;
  title: string;
  dateEarned: Date;
  validUntil?: Date;
  verificationCode: string;
}

export interface Discussion {
  id: string;
  resourceId?: string;
  topic: string;
  author: string;
  content: string;
  date: Date;
  replies: Reply[];
  tags: string[];
  helpful: number;
}

export interface Reply {
  id: string;
  author: string;
  content: string;
  date: Date;
  helpful: number;
}

export class ProfessionalDevelopmentService {
  private resources: Map<string, PDResource> = new Map();
  private progress: Map<string, TeacherProgress> = new Map();
  private discussions: Map<string, Discussion> = new Map();
  
  constructor() {
    this.initializeResources();
  }
  
  /**
   * Get PD resources by category
   */
  getResourcesByType(type?: PDType): PDResource[] {
    const resources = Array.from(this.resources.values());
    if (!type) return resources;
    return resources.filter(r => r.type === type);
  }
  
  /**
   * Get beginner resources for new teachers
   */
  getBeginnerPath(): PDResource[] {
    return Array.from(this.resources.values())
      .filter(r => r.difficulty === DifficultyLevel.Beginner)
      .sort((a, b) => {
        // Order by logical progression
        const order = ['guide', 'video', 'template', 'checklist'];
        return order.indexOf(a.type) - order.indexOf(b.type);
      });
  }
  
  /**
   * Search resources by topic
   */
  searchResources(query: string): PDResource[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.resources.values()).filter(resource =>
      resource.title.toLowerCase().includes(lowercaseQuery) ||
      resource.description.toLowerCase().includes(lowercaseQuery) ||
      resource.topics.some(t => t.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  /**
   * Get teacher progress
   */
  getTeacherProgress(teacherId: string): TeacherProgress {
    if (!this.progress.has(teacherId)) {
      this.progress.set(teacherId, {
        teacherId,
        completedResources: [],
        inProgressResources: [],
        certificates: [],
        totalHours: 0,
        lastActivity: new Date(),
        favoriteResources: []
      });
    }
    return this.progress.get(teacherId)!;
  }
  
  /**
   * Mark resource as started
   */
  startResource(teacherId: string, resourceId: string): void {
    const progress = this.getTeacherProgress(teacherId);
    if (!progress.inProgressResources.includes(resourceId) && 
        !progress.completedResources.includes(resourceId)) {
      progress.inProgressResources.push(resourceId);
      progress.lastActivity = new Date();
    }
  }
  
  /**
   * Mark resource as completed
   */
  completeResource(teacherId: string, resourceId: string): Certificate | null {
    const progress = this.getTeacherProgress(teacherId);
    const resource = this.resources.get(resourceId);
    
    if (!resource) return null;
    
    // Move from in-progress to completed
    progress.inProgressResources = progress.inProgressResources.filter(id => id !== resourceId);
    if (!progress.completedResources.includes(resourceId)) {
      progress.completedResources.push(resourceId);
      
      // Add to total hours
      const hours = this.parseDuration(resource.duration);
      progress.totalHours += hours;
      progress.lastActivity = new Date();
      
      // Generate certificate if applicable
      if (resource.certification) {
        const certificate: Certificate = {
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resourceId,
          title: `Certificate of Completion: ${resource.title}`,
          dateEarned: new Date(),
          verificationCode: this.generateVerificationCode()
        };
        progress.certificates.push(certificate);
        return certificate;
      }
    }
    
    return null;
  }
  
  /**
   * Get recommended next resources
   */
  getRecommendedNext(teacherId: string): PDResource[] {
    const progress = this.getTeacherProgress(teacherId);
    const completed = new Set(progress.completedResources);
    const inProgress = new Set(progress.inProgressResources);
    
    // Get resources that haven't been started
    const available = Array.from(this.resources.values()).filter(r => 
      !completed.has(r.id) && !inProgress.has(r.id)
    );
    
    // If beginner, recommend beginner resources
    if (progress.completedResources.length < 3) {
      return available
        .filter(r => r.difficulty === DifficultyLevel.Beginner)
        .slice(0, 3);
    }
    
    // Otherwise, recommend based on completed topics
    const completedTopics = new Set<string>();
    progress.completedResources.forEach(id => {
      const resource = this.resources.get(id);
      resource?.topics.forEach(t => completedTopics.add(t));
    });
    
    // Find resources with related topics
    return available
      .filter(r => r.topics.some(t => completedTopics.has(t)))
      .slice(0, 3);
  }
  
  /**
   * Get recent discussions
   */
  getDiscussions(limit: number = 10): Discussion[] {
    return Array.from(this.discussions.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
  
  /**
   * Add a discussion post
   */
  addDiscussion(discussion: Omit<Discussion, 'id' | 'date' | 'replies' | 'helpful'>): Discussion {
    const newDiscussion: Discussion = {
      ...discussion,
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      replies: [],
      helpful: 0
    };
    
    this.discussions.set(newDiscussion.id, newDiscussion);
    return newDiscussion;
  }
  
  /**
   * Add a reply to discussion
   */
  addReply(discussionId: string, reply: Omit<Reply, 'id' | 'date' | 'helpful'>): Reply | null {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return null;
    
    const newReply: Reply = {
      ...reply,
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      helpful: 0
    };
    
    discussion.replies.push(newReply);
    return newReply;
  }
  
  /**
   * Initialize with core PD resources
   */
  private initializeResources(): void {
    const resources: PDResource[] = [
      // Beginner Resources
      {
        id: 'pd_1',
        title: 'Introduction to ALF Methodology',
        description: 'Learn the core principles of the Active Learning Framework and how it transforms student engagement',
        type: PDType.Guide,
        format: PDFormat.PDF,
        duration: '30 minutes',
        difficulty: DifficultyLevel.Beginner,
        topics: ['ALF Basics', 'Student Agency', 'Project-Based Learning'],
        objectives: [
          'Understand the 5 phases of ALF',
          'Identify opportunities for student agency',
          'Plan your first ALF project'
        ],
        downloadable: true,
        certification: false
      },
      {
        id: 'pd_2',
        title: 'ALF in Action: Classroom Video Tour',
        description: 'See real teachers implementing ALF methodology with practical examples and student testimonials',
        type: PDType.Video,
        format: PDFormat.Video,
        duration: '45 minutes',
        difficulty: DifficultyLevel.Beginner,
        topics: ['ALF Basics', 'Classroom Management', 'Student Voice'],
        objectives: [
          'Observe ALF implementation strategies',
          'Hear from teachers and students',
          'Identify adaptable practices'
        ],
        url: 'https://example.com/alf-video',
        certification: false
      },
      {
        id: 'pd_3',
        title: 'Project Planning Template',
        description: 'Ready-to-use template for planning your first ALF project with built-in scaffolding',
        type: PDType.Template,
        format: PDFormat.Document,
        duration: '20 minutes',
        difficulty: DifficultyLevel.Beginner,
        topics: ['Project Planning', 'Scaffolding', 'Assessment'],
        objectives: [
          'Structure an ALF project',
          'Plan assessment checkpoints',
          'Create student resources'
        ],
        downloadable: true,
        certification: false
      },
      
      // Intermediate Resources
      {
        id: 'pd_4',
        title: 'Facilitating Student Agency',
        description: 'Advanced strategies for shifting from teacher-directed to student-driven learning',
        type: PDType.Workshop,
        format: PDFormat.Interactive,
        duration: '2 hours',
        difficulty: DifficultyLevel.Intermediate,
        topics: ['Student Agency', 'Facilitation', 'Coaching'],
        objectives: [
          'Master facilitation techniques',
          'Build student decision-making skills',
          'Create agency-supportive structures'
        ],
        certification: true,
        prerequisities: ['pd_1']
      },
      {
        id: 'pd_5',
        title: 'Community Partnerships Workshop',
        description: 'Learn how to build and maintain authentic community partnerships for student projects',
        type: PDType.Workshop,
        format: PDFormat.Video,
        duration: '90 minutes',
        difficulty: DifficultyLevel.Intermediate,
        topics: ['Community Engagement', 'Partnerships', 'Real-World Learning'],
        objectives: [
          'Identify partnership opportunities',
          'Develop partnership proposals',
          'Manage ongoing relationships'
        ],
        materials: ['Partnership agreement template', 'Communication guide'],
        certification: true
      },
      
      // Advanced Resources
      {
        id: 'pd_6',
        title: 'ALF Assessment Strategies',
        description: 'Deep dive into authentic assessment methods that honor student agency and growth',
        type: PDType.CourseModule,
        format: PDFormat.Interactive,
        duration: '3 hours',
        difficulty: DifficultyLevel.Advanced,
        topics: ['Assessment', 'Rubrics', 'Portfolio', 'Reflection'],
        objectives: [
          'Design competency-based assessments',
          'Create student-friendly rubrics',
          'Implement portfolio systems'
        ],
        certification: true,
        prerequisities: ['pd_1', 'pd_4']
      },
      
      // Quick References
      {
        id: 'pd_7',
        title: 'ALF Implementation Checklist',
        description: 'Quick reference checklist for each phase of the ALF process',
        type: PDType.Checklist,
        format: PDFormat.PDF,
        duration: '10 minutes',
        difficulty: DifficultyLevel.Beginner,
        topics: ['ALF Basics', 'Implementation', 'Quick Reference'],
        objectives: [
          'Track ALF implementation',
          'Ensure phase completion',
          'Self-assess progress'
        ],
        downloadable: true,
        certification: false
      },
      {
        id: 'pd_8',
        title: 'Success Stories: ALF Case Studies',
        description: 'Real examples of successful ALF projects across grade levels and subjects',
        type: PDType.CaseStudy,
        format: PDFormat.PDF,
        duration: '1 hour',
        difficulty: DifficultyLevel.Intermediate,
        topics: ['Case Studies', 'Best Practices', 'Inspiration'],
        objectives: [
          'Learn from successful implementations',
          'Adapt ideas for your context',
          'Avoid common pitfalls'
        ],
        downloadable: true,
        certification: false
      }
    ];
    
    resources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
    
    // Add sample discussions
    this.addDiscussion({
      topic: 'Tips for First-Time ALF Teachers',
      author: 'Sarah M.',
      content: 'Just finished my first ALF project with 8th graders. Key learning: start small! We did a 2-week mini-project first to practice the process.',
      tags: ['beginner', 'tips', 'middle-school']
    });
    
    this.addDiscussion({
      topic: 'Community Partner Success Story',
      author: 'James K.',
      content: 'Our local science museum became an amazing partner. They provided mentors for our environmental projects. Happy to share the partnership template I used!',
      tags: ['partnerships', 'science', 'success-story']
    });
  }
  
  /**
   * Parse duration string to hours
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)\s*(hour|minute)/i);
    if (!match) return 0.5; // Default 30 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit.includes('hour') ? value : value / 60;
  }
  
  /**
   * Generate verification code for certificates
   */
  private generateVerificationCode(): string {
    return `ALF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
}

export default ProfessionalDevelopmentService;