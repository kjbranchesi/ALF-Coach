/**
 * Certificate Generation Service
 * 
 * Creates professional certificates for student achievements,
 * project completion, and skill mastery in ALF projects.
 */

import { PDFGenerationEngine } from './pdf-generation-engine';
// jsPDF is dynamically imported at call time to avoid vendor init issues

export interface Certificate {
  id: string;
  type: CertificateType;
  recipientName: string;
  recipientId: string;
  issueDate: Date;
  expirationDate?: Date;
  issuerName: string;
  issuerTitle: string;
  schoolName: string;
  schoolLogo?: string;
  template: CertificateTemplate;
  metadata: CertificateMetadata;
  verificationCode: string;
  signature?: SignatureData;
  seal?: SealData;
}

export enum CertificateType {
  ProjectCompletion = 'project-completion',
  SkillMastery = 'skill-mastery',
  AcademicAchievement = 'academic-achievement',
  Participation = 'participation',
  Excellence = 'excellence',
  Leadership = 'leadership',
  Collaboration = 'collaboration',
  Innovation = 'innovation',
  CommunityImpact = 'community-impact',
  GrowthMindset = 'growth-mindset'
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type: CertificateType;
  design: DesignConfig;
  layout: LayoutConfig;
  content: ContentConfig;
  requirements?: RequirementConfig;
}

export interface DesignConfig {
  theme: 'classic' | 'modern' | 'playful' | 'professional' | 'academic';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderStyle: 'none' | 'simple' | 'ornate' | 'geometric';
  backgroundPattern?: 'none' | 'watermark' | 'gradient' | 'texture';
  fontFamily: string;
  includeRibbon?: boolean;
  includeStars?: boolean;
}

export interface LayoutConfig {
  orientation: 'landscape' | 'portrait';
  size: 'letter' | 'a4' | 'tabloid';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  logoPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-center';
  signaturePosition: 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ContentConfig {
  title: string;
  subtitle?: string;
  bodyTemplate: string; // Template with placeholders
  achievementDetails?: string[];
  includeCriteria?: boolean;
  includeSkills?: boolean;
  includeStandards?: boolean;
  includeQRCode?: boolean;
}

export interface RequirementConfig {
  minProgress?: number;
  requiredSkills?: string[];
  requiredPhases?: string[];
  minQualityScore?: number;
  peerEndorsements?: number;
}

export interface CertificateMetadata {
  projectId?: string;
  projectTitle?: string;
  subject?: string;
  gradeLevel?: string;
  duration?: string;
  skills?: string[];
  standards?: string[];
  score?: number;
  rank?: string;
  specialNotes?: string;
}

export interface SignatureData {
  name: string;
  title: string;
  imageUrl?: string;
  isDigital: boolean;
  timestamp?: Date;
}

export interface SealData {
  type: 'school' | 'district' | 'state' | 'organization';
  imageUrl: string;
  name: string;
}

export interface VerificationData {
  code: string;
  url: string;
  qrCode?: string;
  expiresAt?: Date;
}

export interface CertificateBatch {
  id: string;
  templateId: string;
  recipients: RecipientData[];
  commonMetadata: Partial<CertificateMetadata>;
  issueDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedCertificates: string[]; // Certificate IDs
}

export interface RecipientData {
  name: string;
  id: string;
  email?: string;
  customData?: Record<string, any>;
}

export class CertificateGenerationService {
  private pdfEngine: PDFGenerationEngine;
  private templates: Map<string, CertificateTemplate> = new Map();
  private certificates: Map<string, Certificate> = new Map();
  private verificationCodes: Set<string> = new Set();
  
  constructor() {
    this.pdfEngine = new PDFGenerationEngine();
    this.initializeTemplates();
  }
  
  /**
   * Generate a single certificate
   */
  async generateCertificate(
    recipientName: string,
    recipientId: string,
    certificateType: CertificateType,
    metadata: CertificateMetadata,
    options?: GenerationOptions
  ): Promise<Certificate> {
    
    const template = options?.templateId ? 
      this.templates.get(options.templateId) : 
      this.getDefaultTemplate(certificateType);
    
    if (!template) {
      throw new Error(`No template found for certificate type: ${certificateType}`);
    }
    
    // Validate requirements if any
    if (template.requirements) {
      this.validateRequirements(metadata, template.requirements);
    }
    
    const certificate: Certificate = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: certificateType,
      recipientName,
      recipientId,
      issueDate: new Date(),
      issuerName: options?.issuerName || 'ALF Coach Administrator',
      issuerTitle: options?.issuerTitle || 'Program Director',
      schoolName: options?.schoolName || 'ALF Learning Academy',
      template,
      metadata,
      verificationCode: this.generateVerificationCode(),
      signature: options?.signature,
      seal: options?.seal
    };
    
    if (options?.expirationDate) {
      certificate.expirationDate = options.expirationDate;
    }
    
    this.certificates.set(certificate.id, certificate);
    this.verificationCodes.add(certificate.verificationCode);
    
    return certificate;
  }
  
  /**
   * Generate certificate PDF
   */
  async generatePDF(certificateId: string): Promise<Blob> {
    const certificate = this.certificates.get(certificateId);
    if (!certificate) {
      throw new Error(`Certificate not found: ${certificateId}`);
    }
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: certificate.template.layout.orientation,
      unit: 'mm',
      format: certificate.template.layout.size
    });
    
    // Apply design theme
    await this.applyDesignTheme(doc, certificate);
    
    // Add border
    if (certificate.template.design.borderStyle !== 'none') {
      this.addBorder(doc, certificate.template);
    }
    
    // Add school logo
    if (certificate.schoolLogo) {
      await this.addLogo(doc, certificate);
    }
    
    // Add main content
    this.addMainContent(doc, certificate);
    
    // Add achievement details
    if (certificate.template.content.achievementDetails) {
      this.addAchievementDetails(doc, certificate);
    }
    
    // Add skills if included
    if (certificate.template.content.includeSkills && certificate.metadata.skills) {
      this.addSkills(doc, certificate);
    }
    
    // Add signature
    if (certificate.signature) {
      await this.addSignature(doc, certificate);
    }
    
    // Add seal
    if (certificate.seal) {
      await this.addSeal(doc, certificate);
    }
    
    // Add verification
    this.addVerification(doc, certificate);
    
    // Add QR code if requested
    if (certificate.template.content.includeQRCode) {
      await this.addQRCode(doc, certificate);
    }
    
    return doc.output('blob');
  }
  
  /**
   * Generate batch certificates
   */
  async generateBatch(
    templateId: string,
    recipients: RecipientData[],
    commonMetadata: Partial<CertificateMetadata>,
    options?: BatchOptions
  ): Promise<CertificateBatch> {
    
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const batch: CertificateBatch = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      recipients,
      commonMetadata,
      issueDate: new Date(),
      status: 'processing',
      generatedCertificates: []
    };
    
    try {
      // Generate certificates for each recipient
      for (const recipient of recipients) {
        const metadata = {
          ...commonMetadata,
          ...recipient.customData
        };
        
        const certificate = await this.generateCertificate(
          recipient.name,
          recipient.id,
          template.type,
          metadata as CertificateMetadata,
          {
            templateId,
            ...options
          }
        );
        
        batch.generatedCertificates.push(certificate.id);
      }
      
      batch.status = 'completed';
    } catch (error) {
      batch.status = 'failed';
      throw error;
    }
    
    return batch;
  }
  
  /**
   * Verify certificate
   */
  verifyCertificate(verificationCode: string): VerificationResult {
    if (!this.verificationCodes.has(verificationCode)) {
      return {
        valid: false,
        message: 'Invalid verification code'
      };
    }
    
    const certificate = Array.from(this.certificates.values())
      .find(c => c.verificationCode === verificationCode);
    
    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found'
      };
    }
    
    if (certificate.expirationDate && certificate.expirationDate < new Date()) {
      return {
        valid: false,
        message: 'Certificate has expired',
        certificate
      };
    }
    
    return {
      valid: true,
      message: 'Certificate is valid',
      certificate
    };
  }
  
  /**
   * Get certificate templates
   */
  getTemplates(type?: CertificateType): CertificateTemplate[] {
    const templates = Array.from(this.templates.values());
    if (type) {
      return templates.filter(t => t.type === type);
    }
    return templates;
  }
  
  /**
   * Get certificates for a recipient
   */
  getRecipientCertificates(recipientId: string): Certificate[] {
    return Array.from(this.certificates.values())
      .filter(c => c.recipientId === recipientId)
      .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }
  
  /**
   * Create custom template
   */
  createTemplate(template: Omit<CertificateTemplate, 'id'>): CertificateTemplate {
    const newTemplate: CertificateTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }
  
  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    // Project Completion Certificate
    const projectCompletion: CertificateTemplate = {
      id: 'project-completion-classic',
      name: 'Classic Project Completion',
      type: CertificateType.ProjectCompletion,
      design: {
        theme: 'classic',
        primaryColor: '#1E3A8A', // Navy blue
        secondaryColor: '#F59E0B', // Gold
        accentColor: '#DC2626', // Red
        borderStyle: 'ornate',
        backgroundPattern: 'watermark',
        fontFamily: 'Times-Roman',
        includeRibbon: true,
        includeStars: false
      },
      layout: {
        orientation: 'landscape',
        size: 'letter',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        logoPosition: 'top-center',
        signaturePosition: 'bottom-center'
      },
      content: {
        title: 'Certificate of Project Completion',
        subtitle: 'Active Learning Framework',
        bodyTemplate: 'This certifies that {{recipientName}} has successfully completed the project "{{projectTitle}}" demonstrating mastery of key concepts and skills through the Active Learning Framework.',
        achievementDetails: [
          'Successfully completed all project phases',
          'Demonstrated critical thinking and problem-solving',
          'Collaborated effectively with peers',
          'Presented findings to authentic audience'
        ],
        includeCriteria: true,
        includeSkills: true,
        includeStandards: false,
        includeQRCode: true
      },
      requirements: {
        minProgress: 100,
        requiredPhases: ['catalyst', 'issues', 'methods', 'products', 'engagement']
      }
    };
    
    // Skill Mastery Certificate
    const skillMastery: CertificateTemplate = {
      id: 'skill-mastery-modern',
      name: 'Modern Skill Mastery',
      type: CertificateType.SkillMastery,
      design: {
        theme: 'modern',
        primaryColor: '#7C3AED', // Purple
        secondaryColor: '#10B981', // Green
        accentColor: '#F59E0B', // Amber
        borderStyle: 'geometric',
        backgroundPattern: 'gradient',
        fontFamily: 'Helvetica',
        includeRibbon: false,
        includeStars: true
      },
      layout: {
        orientation: 'portrait',
        size: 'letter',
        margins: { top: 30, right: 25, bottom: 30, left: 25 },
        logoPosition: 'top-left',
        signaturePosition: 'bottom-right'
      },
      content: {
        title: 'Certificate of Skill Mastery',
        bodyTemplate: 'This certifies that {{recipientName}} has achieved mastery level in {{skills}} through dedicated practice and application in real-world contexts.',
        includeCriteria: true,
        includeSkills: true,
        includeStandards: true,
        includeQRCode: false
      },
      requirements: {
        minQualityScore: 4,
        requiredSkills: []
      }
    };
    
    // Excellence Award
    const excellence: CertificateTemplate = {
      id: 'excellence-professional',
      name: 'Professional Excellence Award',
      type: CertificateType.Excellence,
      design: {
        theme: 'professional',
        primaryColor: '#0F172A', // Slate
        secondaryColor: '#D97706', // Amber
        accentColor: '#BE185D', // Pink
        borderStyle: 'simple',
        backgroundPattern: 'texture',
        fontFamily: 'Helvetica-Bold',
        includeRibbon: true,
        includeStars: true
      },
      layout: {
        orientation: 'landscape',
        size: 'letter',
        margins: { top: 15, right: 15, bottom: 15, left: 15 },
        logoPosition: 'top-right',
        signaturePosition: 'bottom-left'
      },
      content: {
        title: 'Award of Excellence',
        subtitle: 'Outstanding Achievement',
        bodyTemplate: 'In recognition of {{recipientName}} for exceptional performance and dedication in {{projectTitle}}, setting a standard of excellence for others to follow.',
        achievementDetails: [
          'Exceeded all project expectations',
          'Demonstrated exceptional creativity',
          'Showed outstanding leadership',
          'Made significant impact on community'
        ],
        includeCriteria: false,
        includeSkills: false,
        includeStandards: false,
        includeQRCode: true
      }
    };
    
    // Student-friendly participation certificate
    const participation: CertificateTemplate = {
      id: 'participation-playful',
      name: 'Playful Participation',
      type: CertificateType.Participation,
      design: {
        theme: 'playful',
        primaryColor: '#3B82F6', // Blue
        secondaryColor: '#10B981', // Green
        accentColor: '#F59E0B', // Yellow
        borderStyle: 'none',
        backgroundPattern: 'none',
        fontFamily: 'Helvetica',
        includeRibbon: false,
        includeStars: true
      },
      layout: {
        orientation: 'landscape',
        size: 'letter',
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
        logoPosition: 'top-center',
        signaturePosition: 'bottom-center'
      },
      content: {
        title: 'Certificate of Participation',
        bodyTemplate: 'This certifies that {{recipientName}} actively participated in {{projectTitle}} and contributed to the learning community.',
        includeCriteria: false,
        includeSkills: false,
        includeStandards: false,
        includeQRCode: false
      }
    };
    
    this.templates.set(projectCompletion.id, projectCompletion);
    this.templates.set(skillMastery.id, skillMastery);
    this.templates.set(excellence.id, excellence);
    this.templates.set(participation.id, participation);
  }
  
  /**
   * Get default template for certificate type
   */
  private getDefaultTemplate(type: CertificateType): CertificateTemplate | undefined {
    const typeTemplates = this.getTemplates(type);
    return typeTemplates[0];
  }
  
  /**
   * Validate requirements
   */
  private validateRequirements(
    metadata: CertificateMetadata,
    requirements: RequirementConfig
  ): void {
    
    if (requirements.minProgress && metadata.score) {
      if (metadata.score < requirements.minProgress) {
        throw new Error(`Minimum progress requirement not met: ${requirements.minProgress}%`);
      }
    }
    
    if (requirements.requiredSkills && metadata.skills) {
      const hasAllSkills = requirements.requiredSkills.every(
        skill => metadata.skills!.includes(skill)
      );
      if (!hasAllSkills) {
        throw new Error('Required skills not demonstrated');
      }
    }
  }
  
  /**
   * Generate unique verification code
   */
  private generateVerificationCode(): string {
    let code: string;
    do {
      code = `ALF-${Date.now().toString(36).toUpperCase()}-${
        Math.random().toString(36).substr(2, 6).toUpperCase()
      }`;
    } while (this.verificationCodes.has(code));
    
    return code;
  }
  
  /**
   * Apply design theme to PDF
   */
  private async applyDesignTheme(doc: jsPDF, certificate: Certificate): Promise<void> {
    const design = certificate.template.design;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Background
    if (design.backgroundPattern === 'gradient') {
      // Simple gradient effect using rectangles
      for (let i = 0; i < 10; i++) {
        const alpha = 0.02;
        doc.setFillColor(design.primaryColor);
        doc.setGState(new doc.GState({ opacity: alpha }));
        doc.rect(0, i * (pageHeight / 10), pageWidth, pageHeight / 10, 'F');
      }
      doc.setGState(new doc.GState({ opacity: 1 }));
    } else if (design.backgroundPattern === 'watermark') {
      // Add watermark text
      doc.setTextColor(design.primaryColor);
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.setFontSize(60);
      doc.text('ALF', pageWidth / 2, pageHeight / 2, { 
        align: 'center',
        angle: 45
      });
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  }
  
  /**
   * Add border to certificate
   */
  private addBorder(doc: jsPDF, template: CertificateTemplate): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = template.layout.margins;
    
    doc.setDrawColor(template.design.primaryColor);
    
    switch (template.design.borderStyle) {
      case 'simple':
        doc.setLineWidth(2);
        doc.rect(margins.left, margins.top, 
          pageWidth - margins.left - margins.right,
          pageHeight - margins.top - margins.bottom);
        break;
        
      case 'ornate':
        // Double border
        doc.setLineWidth(3);
        doc.rect(margins.left - 5, margins.top - 5,
          pageWidth - margins.left - margins.right + 10,
          pageHeight - margins.top - margins.bottom + 10);
        doc.setLineWidth(1);
        doc.rect(margins.left, margins.top,
          pageWidth - margins.left - margins.right,
          pageHeight - margins.top - margins.bottom);
        break;
        
      case 'geometric':
        // Corner decorations
        doc.setLineWidth(2);
        const cornerSize = 20;
        // Top left
        doc.line(margins.left, margins.top + cornerSize, margins.left, margins.top);
        doc.line(margins.left, margins.top, margins.left + cornerSize, margins.top);
        // Top right
        doc.line(pageWidth - margins.right - cornerSize, margins.top, pageWidth - margins.right, margins.top);
        doc.line(pageWidth - margins.right, margins.top, pageWidth - margins.right, margins.top + cornerSize);
        // Bottom left
        doc.line(margins.left, pageHeight - margins.bottom - cornerSize, margins.left, pageHeight - margins.bottom);
        doc.line(margins.left, pageHeight - margins.bottom, margins.left + cornerSize, pageHeight - margins.bottom);
        // Bottom right
        doc.line(pageWidth - margins.right - cornerSize, pageHeight - margins.bottom, pageWidth - margins.right, pageHeight - margins.bottom);
        doc.line(pageWidth - margins.right, pageHeight - margins.bottom - cornerSize, pageWidth - margins.right, pageHeight - margins.bottom);
        break;
    }
  }
  
  /**
   * Add logo to certificate
   */
  private async addLogo(doc: jsPDF, certificate: Certificate): Promise<void> {
    if (!certificate.schoolLogo) {return;}
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margins = certificate.template.layout.margins;
    const logoSize = 30;
    
    let x = margins.left;
    const y = margins.top;
    
    switch (certificate.template.layout.logoPosition) {
      case 'top-center':
        x = (pageWidth - logoSize) / 2;
        break;
      case 'top-right':
        x = pageWidth - margins.right - logoSize;
        break;
    }
    
    // In real implementation, would load and add image
    // For now, add placeholder
    doc.setDrawColor(certificate.template.design.primaryColor);
    doc.rect(x, y, logoSize, logoSize);
    doc.setFontSize(8);
    doc.text('LOGO', x + logoSize/2, y + logoSize/2, { align: 'center' });
  }
  
  /**
   * Add main content
   */
  private addMainContent(doc: jsPDF, certificate: Certificate): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const design = certificate.template.design;
    const content = certificate.template.content;
    
    // Title
    doc.setFont(design.fontFamily, 'bold');
    doc.setFontSize(36);
    doc.setTextColor(design.primaryColor);
    doc.text(content.title, pageWidth / 2, pageHeight * 0.3, { align: 'center' });
    
    // Subtitle
    if (content.subtitle) {
      doc.setFontSize(18);
      doc.setTextColor(design.secondaryColor);
      doc.text(content.subtitle, pageWidth / 2, pageHeight * 0.35, { align: 'center' });
    }
    
    // Recipient name
    doc.setFont(design.fontFamily, 'bold');
    doc.setFontSize(28);
    doc.setTextColor('#000000');
    doc.text(certificate.recipientName, pageWidth / 2, pageHeight * 0.45, { align: 'center' });
    
    // Body text
    const bodyText = this.processTemplate(content.bodyTemplate, certificate);
    doc.setFont(design.fontFamily, 'normal');
    doc.setFontSize(14);
    doc.setTextColor('#333333');
    
    const lines = doc.splitTextToSize(bodyText, pageWidth - 60);
    let yPosition = pageHeight * 0.55;
    lines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    });
    
    // Date
    doc.setFontSize(12);
    doc.text(
      `Issued on ${certificate.issueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`,
      pageWidth / 2,
      pageHeight * 0.75,
      { align: 'center' }
    );
  }
  
  /**
   * Add achievement details
   */
  private addAchievementDetails(doc: jsPDF, certificate: Certificate): void {
    const details = certificate.template.content.achievementDetails;
    if (!details || details.length === 0) {return;}
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    
    let yPosition = pageHeight * 0.65;
    details.forEach(detail => {
      doc.text(`• ${detail}`, pageWidth * 0.3, yPosition);
      yPosition += 6;
    });
  }
  
  /**
   * Add skills section
   */
  private addSkills(doc: jsPDF, certificate: Certificate): void {
    if (!certificate.metadata.skills || certificate.metadata.skills.length === 0) {return;}
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(10);
    doc.setFont(certificate.template.design.fontFamily, 'bold');
    doc.text('Skills Demonstrated:', pageWidth * 0.2, pageHeight * 0.8);
    
    doc.setFont(certificate.template.design.fontFamily, 'normal');
    doc.text(certificate.metadata.skills.join(', '), pageWidth * 0.35, pageHeight * 0.8);
  }
  
  /**
   * Add signature
   */
  private async addSignature(doc: jsPDF, certificate: Certificate): Promise<void> {
    if (!certificate.signature) {return;}
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = certificate.template.layout.margins;
    
    let x = pageWidth / 2;
    const y = pageHeight - margins.bottom - 40;
    
    switch (certificate.template.layout.signaturePosition) {
      case 'bottom-left':
        x = margins.left + 60;
        break;
      case 'bottom-right':
        x = pageWidth - margins.right - 60;
        break;
    }
    
    // Signature line
    doc.setDrawColor('#666666');
    doc.line(x - 40, y, x + 40, y);
    
    // Name and title
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    doc.text(certificate.signature.name, x, y + 6, { align: 'center' });
    doc.text(certificate.signature.title, x, y + 12, { align: 'center' });
  }
  
  /**
   * Add seal
   */
  private async addSeal(doc: jsPDF, certificate: Certificate): Promise<void> {
    if (!certificate.seal) {return;}
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const sealSize = 25;
    
    // Position seal opposite of signature
    let x = pageWidth / 2;
    if (certificate.template.layout.signaturePosition === 'bottom-left') {
      x = pageWidth - certificate.template.layout.margins.right - sealSize - 20;
    } else if (certificate.template.layout.signaturePosition === 'bottom-right') {
      x = certificate.template.layout.margins.left + 20;
    }
    
    const y = pageHeight - certificate.template.layout.margins.bottom - 50;
    
    // Placeholder seal
    doc.setDrawColor(certificate.template.design.accentColor);
    doc.setLineWidth(2);
    doc.circle(x + sealSize/2, y + sealSize/2, sealSize/2);
    doc.setFontSize(8);
    doc.text('SEAL', x + sealSize/2, y + sealSize/2, { align: 'center' });
  }
  
  /**
   * Add verification info
   */
  private addVerification(doc: jsPDF, certificate: Certificate): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text(
      `Verification Code: ${certificate.verificationCode}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  /**
   * Add QR code
   */
  private async addQRCode(doc: jsPDF, certificate: Certificate): Promise<void> {
    // In real implementation, would generate QR code
    // For now, add placeholder
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrSize = 20;
    
    doc.setDrawColor('#000000');
    doc.rect(
      pageWidth - certificate.template.layout.margins.right - qrSize,
      pageHeight - certificate.template.layout.margins.bottom - qrSize,
      qrSize,
      qrSize
    );
    
    doc.setFontSize(6);
    doc.text('QR', 
      pageWidth - certificate.template.layout.margins.right - qrSize/2,
      pageHeight - certificate.template.layout.margins.bottom - qrSize/2,
      { align: 'center' }
    );
  }
  
  /**
   * Process template placeholders
   */
  private processTemplate(template: string, certificate: Certificate): string {
    let processed = template;
    
    // Replace standard placeholders
    processed = processed.replace('{{recipientName}}', certificate.recipientName);
    processed = processed.replace('{{schoolName}}', certificate.schoolName);
    processed = processed.replace('{{issuerName}}', certificate.issuerName);
    processed = processed.replace('{{date}}', certificate.issueDate.toLocaleDateString());
    
    // Replace metadata placeholders
    if (certificate.metadata.projectTitle) {
      processed = processed.replace('{{projectTitle}}', certificate.metadata.projectTitle);
    }
    if (certificate.metadata.skills) {
      processed = processed.replace('{{skills}}', certificate.metadata.skills.join(', '));
    }
    if (certificate.metadata.subject) {
      processed = processed.replace('{{subject}}', certificate.metadata.subject);
    }
    
    return processed;
  }
}

// Supporting types

export interface GenerationOptions {
  templateId?: string;
  issuerName?: string;
  issuerTitle?: string;
  schoolName?: string;
  schoolLogo?: string;
  signature?: SignatureData;
  seal?: SealData;
  expirationDate?: Date;
}

export interface BatchOptions extends GenerationOptions {
  emailRecipients?: boolean;
  generatePDFs?: boolean;
  archiveResults?: boolean;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  certificate?: Certificate;
}

export default CertificateGenerationService;
