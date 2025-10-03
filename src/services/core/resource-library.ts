/**
 * Resource Library Service
 * 
 * Simple, curated educational resources for ALF Coach alpha version
 */

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  subject: Subject[];
  gradeLevel: GradeLevel[];
  alfStage?: string[];
  tags: string[];
  rating: number;
  ratingCount: number;
  free: boolean;
  verified: boolean;
  dateAdded: Date;
  lastUpdated: Date;
}

export enum ResourceType {
  Article = 'article',
  Video = 'video',
  Tool = 'tool',
  Template = 'template',
  LessonPlan = 'lesson-plan',
  Assessment = 'assessment',
  Activity = 'activity',
  Reference = 'reference',
  Course = 'course',
  Book = 'book'
}

export enum Subject {
  Math = 'math',
  Science = 'science',
  ELA = 'ela',
  SocialStudies = 'social-studies',
  Arts = 'arts',
  Technology = 'technology',
  SEL = 'sel',
  WorldLanguages = 'world-languages',
  PE = 'pe',
  CTE = 'cte',
  General = 'general'
}

export enum GradeLevel {
  PreK = 'pre-k',
  Elementary = 'elementary',
  Middle = 'middle',
  High = 'high',
  AllGrades = 'all-grades'
}

export interface ResourceFilter {
  type?: ResourceType[];
  subject?: Subject[];
  gradeLevel?: GradeLevel[];
  alfStage?: string[];
  free?: boolean;
  minRating?: number;
}

export interface TeacherReview {
  id: string;
  resourceId: string;
  teacherId: string;
  teacherName: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  date: Date;
  verified: boolean;
  gradesTaught?: GradeLevel[];
  subjectsTaught?: Subject[];
}

export class ResourceLibraryService {
  private resources: Map<string, Resource> = new Map();
  private reviews: Map<string, TeacherReview[]> = new Map();
  private favorites: Map<string, Set<string>> = new Map(); // userId -> resourceIds
  
  constructor() {
    this.initializeResources();
  }
  
  /**
   * Get all resources with optional filtering
   */
  getResources(filter?: ResourceFilter): Resource[] {
    let resources = Array.from(this.resources.values());
    
    if (filter) {
      if (filter.type?.length) {
        resources = resources.filter(r => filter.type!.some(t => r.type === t));
      }
      
      if (filter.subject?.length) {
        resources = resources.filter(r => filter.subject!.some(s => r.subject.includes(s)));
      }
      
      if (filter.gradeLevel?.length) {
        resources = resources.filter(r => filter.gradeLevel!.some(g => r.gradeLevel.includes(g)));
      }
      
      if (filter.alfStage?.length) {
        resources = resources.filter(r => 
          r.alfStage && filter.alfStage!.some(s => r.alfStage!.includes(s))
        );
      }
      
      if (filter.free !== undefined) {
        resources = resources.filter(r => r.free === filter.free);
      }
      
      if (filter.minRating) {
        resources = resources.filter(r => r.rating >= filter.minRating!);
      }
    }
    
    // Sort by rating and recency
    resources.sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.1) {return ratingDiff;}
      return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    });
    
    return resources;
  }
  
  /**
   * Search resources by keyword
   */
  searchResources(query: string): Resource[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.resources.values()).filter(resource => 
      resource.title.toLowerCase().includes(lowercaseQuery) ||
      resource.description.toLowerCase().includes(lowercaseQuery) ||
      resource.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  /**
   * Get resource by ID
   */
  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }
  
  /**
   * Add resource to favorites
   */
  addToFavorites(userId: string, resourceId: string): void {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    this.favorites.get(userId)!.add(resourceId);
  }
  
  /**
   * Remove from favorites
   */
  removeFromFavorites(userId: string, resourceId: string): void {
    this.favorites.get(userId)?.delete(resourceId);
  }
  
  /**
   * Get user's favorite resources
   */
  getFavorites(userId: string): Resource[] {
    const favoriteIds = this.favorites.get(userId);
    if (!favoriteIds) {return [];}
    
    return Array.from(favoriteIds)
      .map(id => this.resources.get(id))
      .filter(r => r !== undefined);
  }
  
  /**
   * Add teacher review
   */
  addReview(review: Omit<TeacherReview, 'id' | 'date'>): TeacherReview {
    const fullReview: TeacherReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date()
    };
    
    if (!this.reviews.has(review.resourceId)) {
      this.reviews.set(review.resourceId, []);
    }
    this.reviews.get(review.resourceId)!.push(fullReview);
    
    // Update resource rating
    this.updateResourceRating(review.resourceId);
    
    return fullReview;
  }
  
  /**
   * Get reviews for a resource
   */
  getReviews(resourceId: string): TeacherReview[] {
    return this.reviews.get(resourceId) || [];
  }
  
  /**
   * Get recommended resources based on grade and subject
   */
  getRecommendations(gradeLevel: GradeLevel, subject: Subject, limit: number = 5): Resource[] {
    const filtered = this.getResources({
      gradeLevel: [gradeLevel],
      subject: [subject],
      minRating: 4.0
    });
    
    return filtered.slice(0, limit);
  }
  
  /**
   * Get resources for specific ALF stage
   */
  getALFStageResources(stage: string): Resource[] {
    return this.getResources({ alfStage: [stage] });
  }
  
  /**
   * Initialize with curated resources
   */
  private initializeResources(): void {
    const initialResources: Resource[] = [
      {
        id: 'res_1',
        title: 'Project-Based Learning Toolkit',
        description: 'Comprehensive guide to implementing PBL in your classroom with templates and examples',
        url: 'https://www.pblworks.org/what-is-pbl',
        type: ResourceType.Reference,
        subject: [Subject.General],
        gradeLevel: [GradeLevel.AllGrades],
        alfStage: ['catalyst', 'issues', 'methods'],
        tags: ['pbl', 'projects', 'methodology', 'planning'],
        rating: 4.8,
        ratingCount: 156,
        free: true,
        verified: true,
        dateAdded: new Date('2024-01-15'),
        lastUpdated: new Date('2024-11-20')
      },
      {
        id: 'res_2',
        title: 'Scratch - Creative Computing',
        description: 'Free coding platform perfect for student projects and creative expression',
        url: 'https://scratch.mit.edu/',
        type: ResourceType.Tool,
        subject: [Subject.Technology, Subject.Arts],
        gradeLevel: [GradeLevel.Elementary, GradeLevel.Middle],
        alfStage: ['methods', 'products'],
        tags: ['coding', 'creativity', 'animation', 'games'],
        rating: 4.9,
        ratingCount: 523,
        free: true,
        verified: true,
        dateAdded: new Date('2024-01-10'),
        lastUpdated: new Date('2024-12-01')
      },
      {
        id: 'res_3',
        title: 'Student Agency Rubric',
        description: 'Assessment tool for measuring and supporting student ownership of learning',
        url: '#',
        type: ResourceType.Assessment,
        subject: [Subject.General],
        gradeLevel: [GradeLevel.Middle, GradeLevel.High],
        alfStage: ['issues', 'methods', 'engagement'],
        tags: ['assessment', 'agency', 'rubric', 'student-voice'],
        rating: 4.6,
        ratingCount: 89,
        free: true,
        verified: true,
        dateAdded: new Date('2024-02-20'),
        lastUpdated: new Date('2024-10-15')
      },
      {
        id: 'res_4',
        title: 'Khan Academy',
        description: 'Free, personalized learning resources for math, science, and more',
        url: 'https://www.khanacademy.org/',
        type: ResourceType.Course,
        subject: [Subject.Math, Subject.Science, Subject.ELA],
        gradeLevel: [GradeLevel.AllGrades],
        alfStage: ['issues', 'methods'],
        tags: ['math', 'science', 'video', 'practice', 'self-paced'],
        rating: 4.7,
        ratingCount: 892,
        free: true,
        verified: true,
        dateAdded: new Date('2024-01-05'),
        lastUpdated: new Date('2024-12-10')
      },
      {
        id: 'res_5',
        title: 'Design Thinking for Educators',
        description: 'IDEO toolkit for bringing design thinking into education',
        url: 'https://designthinkingforeducators.com/',
        type: ResourceType.Reference,
        subject: [Subject.General],
        gradeLevel: [GradeLevel.AllGrades],
        alfStage: ['catalyst', 'issues', 'methods'],
        tags: ['design-thinking', 'creativity', 'problem-solving', 'innovation'],
        rating: 4.5,
        ratingCount: 234,
        free: true,
        verified: true,
        dateAdded: new Date('2024-03-01'),
        lastUpdated: new Date('2024-09-30')
      }
    ];
    
    initialResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
  }
  
  /**
   * Update resource rating based on reviews
   */
  private updateResourceRating(resourceId: string): void {
    const resource = this.resources.get(resourceId);
    const reviews = this.reviews.get(resourceId);
    
    if (resource && reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      resource.rating = totalRating / reviews.length;
      resource.ratingCount = reviews.length;
    }
  }
}

export default ResourceLibraryService;