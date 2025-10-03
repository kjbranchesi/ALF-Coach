/**
 * Community Connections Service
 * 
 * Simple directory of local organizations and community partners for ALF projects
 */

export interface CommunityPartner {
  id: string;
  name: string;
  type: PartnerType;
  description: string;
  contact: ContactInfo;
  location: LocationInfo;
  offerings: string[];
  subjects: string[];
  gradelevels: string[];
  availability: string;
  requirements?: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  reviews: number;
  rating: number;
}

export enum PartnerType {
  Museum = 'museum',
  Library = 'library',
  Business = 'business',
  NonProfit = 'non-profit',
  Government = 'government',
  University = 'university',
  CommunityCenter = 'community-center',
  Professional = 'professional',
  Artist = 'artist',
  Environmental = 'environmental',
  Healthcare = 'healthcare',
  Technology = 'technology'
}

export interface ContactInfo {
  contactName?: string;
  email?: string;
  phone?: string;
  preferredMethod: 'email' | 'phone' | 'website';
  responseTime?: string;
}

export interface LocationInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  virtualAvailable: boolean;
  serviceRadius?: number; // miles
}

export interface PartnershipRequest {
  id: string;
  partnerId: string;
  teacherId: string;
  studentName?: string;
  projectDescription: string;
  requestedSupport: string[];
  proposedDates?: string;
  status: RequestStatus;
  submittedDate: Date;
  responseDate?: Date;
  notes?: string;
}

export enum RequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
  InProgress = 'in-progress',
  Completed = 'completed'
}

export interface PartnerSearch {
  type?: PartnerType[];
  subjects?: string[];
  location?: {
    zip: string;
    radius: number;
  };
  virtualOk?: boolean;
  offerings?: string[];
}

export class CommunityConnectionsService {
  private partners: Map<string, CommunityPartner> = new Map();
  private requests: Map<string, PartnershipRequest> = new Map();
  private templates: Map<string, string> = new Map();
  
  constructor() {
    this.initializePartners();
    this.initializeTemplates();
  }
  
  /**
   * Search for community partners
   */
  searchPartners(criteria: PartnerSearch): CommunityPartner[] {
    let results = Array.from(this.partners.values());
    
    // Filter by type
    if (criteria.type?.length) {
      results = results.filter(p => criteria.type!.includes(p.type));
    }
    
    // Filter by subjects
    if (criteria.subjects?.length) {
      results = results.filter(p => 
        p.subjects.some(s => criteria.subjects!.includes(s))
      );
    }
    
    // Filter by location
    if (criteria.location) {
      results = results.filter(p => {
        if (p.location.virtualAvailable && criteria.virtualOk) {return true;}
        // Simple zip code prefix matching for MVP
        return p.location.zip.startsWith(criteria.location!.zip.substring(0, 3));
      });
    }
    
    // Filter by offerings
    if (criteria.offerings?.length) {
      results = results.filter(p =>
        p.offerings.some(o => criteria.offerings!.includes(o))
      );
    }
    
    // Sort by rating and featured status
    results.sort((a, b) => {
      if (a.featured && !b.featured) {return -1;}
      if (!a.featured && b.featured) {return 1;}
      return b.rating - a.rating;
    });
    
    return results;
  }
  
  /**
   * Get partner by ID
   */
  getPartner(id: string): CommunityPartner | undefined {
    return this.partners.get(id);
  }
  
  /**
   * Get featured partners
   */
  getFeaturedPartners(): CommunityPartner[] {
    return Array.from(this.partners.values())
      .filter(p => p.featured)
      .sort((a, b) => b.rating - a.rating);
  }
  
  /**
   * Submit partnership request
   */
  submitRequest(request: Omit<PartnershipRequest, 'id' | 'status' | 'submittedDate'>): PartnershipRequest {
    const fullRequest: PartnershipRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: RequestStatus.Pending,
      submittedDate: new Date()
    };
    
    this.requests.set(fullRequest.id, fullRequest);
    
    // In a real app, this would send an email/notification
    console.log('Partnership request submitted:', fullRequest);
    
    return fullRequest;
  }
  
  /**
   * Get teacher's partnership requests
   */
  getTeacherRequests(teacherId: string): PartnershipRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.teacherId === teacherId)
      .sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
  }
  
  /**
   * Update request status
   */
  updateRequestStatus(requestId: string, status: RequestStatus, notes?: string): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.status = status;
      request.responseDate = new Date();
      if (notes) {request.notes = notes;}
    }
  }
  
  /**
   * Get email templates
   */
  getEmailTemplate(type: 'initial' | 'followup' | 'thankyou'): string {
    return this.templates.get(type) || '';
  }
  
  /**
   * Get partners by offering type
   */
  getPartnersByOffering(offering: string): CommunityPartner[] {
    return Array.from(this.partners.values())
      .filter(p => p.offerings.includes(offering))
      .sort((a, b) => b.rating - a.rating);
  }
  
  /**
   * Initialize with sample partners
   */
  private initializePartners(): void {
    const samplePartners: CommunityPartner[] = [
      {
        id: 'partner_1',
        name: 'City Science Museum',
        type: PartnerType.Museum,
        description: 'Interactive science museum with hands-on exhibits and educational programs',
        contact: {
          contactName: 'Sarah Chen',
          email: 'education@citysciencemuseum.org',
          phone: '(555) 123-4567',
          preferredMethod: 'email',
          responseTime: '2-3 business days'
        },
        location: {
          address: '123 Discovery Lane',
          city: 'Anytown',
          state: 'CA',
          zip: '94000',
          virtualAvailable: true,
          serviceRadius: 25
        },
        offerings: [
          'Field Trips',
          'Guest Speakers',
          'Workshops',
          'Virtual Tours',
          'Mentorship'
        ],
        subjects: ['Science', 'Technology', 'Engineering'],
        gradelevels: ['Elementary', 'Middle', 'High'],
        availability: 'Tuesday-Friday, 9am-3pm',
        requirements: 'Book at least 2 weeks in advance',
        website: 'https://citysciencemuseum.org',
        verified: true,
        featured: true,
        reviews: 45,
        rating: 4.8
      },
      {
        id: 'partner_2',
        name: 'Tech Solutions Inc.',
        type: PartnerType.Business,
        description: 'Local tech company offering coding workshops and career mentorship',
        contact: {
          contactName: 'Marcus Johnson',
          email: 'community@techsolutions.com',
          phone: '(555) 234-5678',
          preferredMethod: 'email',
          responseTime: '1 week'
        },
        location: {
          address: '456 Innovation Blvd',
          city: 'Anytown',
          state: 'CA',
          zip: '94001',
          virtualAvailable: true,
          serviceRadius: 50
        },
        offerings: [
          'Mentorship',
          'Workshops',
          'Internships',
          'Career Talks',
          'Project Sponsorship'
        ],
        subjects: ['Technology', 'Computer Science', 'Business'],
        gradelevels: ['High'],
        availability: 'Flexible, prefer afternoons',
        website: 'https://techsolutions.com/community',
        verified: true,
        featured: false,
        reviews: 23,
        rating: 4.6
      },
      {
        id: 'partner_3',
        name: 'Green Earth Initiative',
        type: PartnerType.NonProfit,
        description: 'Environmental nonprofit focused on sustainability education and action',
        contact: {
          contactName: 'Elena Rodriguez',
          email: 'elena@greenearthinitiative.org',
          phone: '(555) 345-6789',
          preferredMethod: 'phone',
          responseTime: '24-48 hours'
        },
        location: {
          address: '789 Eco Way',
          city: 'Anytown',
          state: 'CA',
          zip: '94002',
          virtualAvailable: true,
          serviceRadius: 30
        },
        offerings: [
          'Service Learning',
          'Guest Speakers',
          'Field Trips',
          'Project Guidance',
          'Community Gardens'
        ],
        subjects: ['Science', 'Environmental Studies', 'Social Studies'],
        gradelevels: ['Elementary', 'Middle', 'High'],
        availability: 'Year-round, flexible schedule',
        website: 'https://greenearthinitiative.org',
        verified: true,
        featured: true,
        reviews: 67,
        rating: 4.9
      },
      {
        id: 'partner_4',
        name: 'City Public Library - Main Branch',
        type: PartnerType.Library,
        description: 'Public library with maker space, research resources, and meeting rooms',
        contact: {
          email: 'youth@citylibrary.org',
          phone: '(555) 456-7890',
          preferredMethod: 'email',
          responseTime: '1-2 business days'
        },
        location: {
          address: '100 Main Street',
          city: 'Anytown',
          state: 'CA',
          zip: '94000',
          virtualAvailable: true,
          serviceRadius: 15
        },
        offerings: [
          'Research Support',
          'Meeting Space',
          'Maker Space',
          'Digital Resources',
          'Workshops'
        ],
        subjects: ['All Subjects'],
        gradelevels: ['All Grades'],
        availability: 'Monday-Saturday, 9am-8pm',
        website: 'https://citylibrary.org',
        verified: true,
        featured: false,
        reviews: 89,
        rating: 4.7
      }
    ];
    
    samplePartners.forEach(partner => {
      this.partners.set(partner.id, partner);
    });
  }
  
  /**
   * Initialize email templates
   */
  private initializeTemplates(): void {
    this.templates.set('initial', `Dear [Contact Name],

I am a teacher at [School Name] working with students on an exciting project about [Project Topic]. We are using the Active Learning Framework (ALF) approach, which emphasizes real-world connections and authentic learning experiences.

We would love to partner with [Organization Name] to:
[List specific requests]

Our timeline is [Timeline] and we have [Number] students participating.

Would you be available to discuss this partnership opportunity? We're flexible with scheduling and can work around your availability.

Thank you for considering this opportunity to make a real impact on our students' learning!

Best regards,
[Your Name]
[School Name]
[Contact Information]`);

    this.templates.set('followup', `Dear [Contact Name],

Thank you for your interest in partnering with our class! Following up on our conversation, here are the details we discussed:

Project Details:
- Topic: [Project Topic]
- Number of Students: [Number]
- Grade Level: [Grade]
- Timeline: [Start Date] to [End Date]

Requested Support:
[List agreed upon support]

Next Steps:
[List next steps]

Please let me know if you need any additional information. We're excited to work with you!

Best regards,
[Your Name]`);

    this.templates.set('thankyou', `Dear [Contact Name],

On behalf of my students and [School Name], I want to express our sincere gratitude for your partnership on our [Project Topic] project.

Your contribution of [Specific Contribution] made a tremendous impact. Students particularly appreciated [Specific Highlight].

Some outcomes from our partnership:
[List 2-3 specific outcomes or student quotes]

We would love to stay connected for future projects. Thank you again for investing in our students' learning!

With appreciation,
[Your Name] and the students of [Class/School Name]`);
  }
}

export default CommunityConnectionsService;