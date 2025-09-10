/**
 * Portfolio Export System
 * 
 * Manages the collection, organization, and export of student work
 * into comprehensive portfolios for assessment and sharing.
 */

// Removed static PDF import - will lazy load when needed

export interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  dateCreated: Date;
  lastModified: Date;
  sections: PortfolioSection[];
  metadata: PortfolioMetadata;
  sharing: SharingSettings;
  exports: ExportRecord[];
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  items: PortfolioItem[];
  visible: boolean;
  customizable: boolean;
}

export enum SectionType {
  Introduction = 'introduction',
  ProjectOverview = 'project-overview',
  ProcessDocumentation = 'process-documentation',
  FinalProducts = 'final-products',
  Reflections = 'reflections',
  PeerFeedback = 'peer-feedback',
  TeacherAssessment = 'teacher-assessment',
  SkillsDemonstrated = 'skills-demonstrated',
  NextSteps = 'next-steps',
  Custom = 'custom'
}

export interface PortfolioItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  content: ItemContent;
  dateAdded: Date;
  tags: string[];
  reflection?: string;
  visibility: 'private' | 'portfolio' | 'public';
}

export enum ItemType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Link = 'link',
  Code = 'code',
  Presentation = 'presentation',
  DataSet = 'dataset',
  Model3D = '3d-model'
}

export type ItemContent = 
  | TextItemContent
  | MediaItemContent
  | LinkItemContent
  | FileItemContent;

export interface TextItemContent {
  type: 'text';
  text: string;
  format?: 'plain' | 'markdown' | 'html';
}

export interface MediaItemContent {
  type: 'media';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for video/audio
  dimensions?: { width: number; height: number }; // for images
  caption?: string;
}

export interface LinkItemContent {
  type: 'link';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface FileItemContent {
  type: 'file';
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  preview?: string;
}

export interface PortfolioMetadata {
  subject?: string;
  gradeLevel?: string;
  duration?: string;
  skills: string[];
  standards?: string[];
  learningObjectives?: string[];
  keywords: string[];
}

export interface SharingSettings {
  isPublic: boolean;
  shareUrl?: string;
  password?: string;
  allowComments: boolean;
  allowDownload: boolean;
  expirationDate?: Date;
  sharedWith: SharedUser[];
}

export interface SharedUser {
  email: string;
  role: 'viewer' | 'commenter' | 'editor';
  sharedDate: Date;
  lastViewed?: Date;
}

export interface ExportRecord {
  id: string;
  format: ExportFormat;
  dateExported: Date;
  exportedBy: string;
  fileName: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;
}

export enum ExportFormat {
  PDF = 'pdf',
  HTML = 'html',
  ZIP = 'zip',
  GoogleDrive = 'google-drive',
  OneDrive = 'onedrive',
  Print = 'print'
}

export interface ExportOptions {
  format: ExportFormat;
  includeReflections: boolean;
  includeAssessments: boolean;
  includeFeedback: boolean;
  includeMetadata: boolean;
  watermark?: string;
  password?: string;
  compression?: boolean;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSectionConfig[];
  defaultItems?: DefaultItemConfig[];
  styling?: PortfolioStyling;
}

export interface TemplateSectionConfig {
  type: SectionType;
  title: string;
  required: boolean;
  minItems?: number;
  maxItems?: number;
  prompts?: string[];
  rubric?: string;
}

export interface DefaultItemConfig {
  sectionType: SectionType;
  itemType: ItemType;
  title: string;
  prompt?: string;
  required: boolean;
}

export interface PortfolioStyling {
  theme: 'professional' | 'creative' | 'academic' | 'minimal';
  primaryColor: string;
  fontFamily?: string;
  includeSchoolBranding?: boolean;
}

export class PortfolioExportSystem {
  private portfolios: Map<string, Portfolio> = new Map();
  private templates: Map<string, PortfolioTemplate> = new Map();
  private pdfEngine: any; // Will be initialized on first use
  
  constructor() {
    this.initializeTemplates();
  }
  
  /**
   * Lazy load PDF engine
   */
  private async ensurePdfEngine(): Promise<void> {
    if (!this.pdfEngine) {
      const { PDFGenerationEngine } = await import('./pdf-generation-engine');
      this.pdfEngine = new PDFGenerationEngine();
    }
  }
  
  /**
   * Create a new portfolio
   */
  createPortfolio(
    studentId: string,
    studentName: string,
    projectId: string,
    projectTitle: string,
    templateId?: string
  ): Portfolio {
    
    const template = templateId ? this.templates.get(templateId) : this.getDefaultTemplate();
    
    const portfolio: Portfolio = {
      id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      studentName,
      projectId,
      projectTitle,
      dateCreated: new Date(),
      lastModified: new Date(),
      sections: this.createSectionsFromTemplate(template),
      metadata: {
        skills: [],
        keywords: []
      },
      sharing: {
        isPublic: false,
        allowComments: false,
        allowDownload: false,
        sharedWith: []
      },
      exports: []
    };
    
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }
  
  /**
   * Add item to portfolio
   */
  addItem(
    portfolioId: string,
    sectionType: SectionType,
    item: Omit<PortfolioItem, 'id' | 'dateAdded'>
  ): PortfolioItem {
    
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    const section = portfolio.sections.find(s => s.type === sectionType);
    if (!section) {
      throw new Error(`Section not found: ${sectionType}`);
    }
    
    const fullItem: PortfolioItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date()
    };
    
    section.items.push(fullItem);
    portfolio.lastModified = new Date();
    
    return fullItem;
  }
  
  /**
   * Update portfolio item
   */
  updateItem(
    portfolioId: string,
    itemId: string,
    updates: Partial<PortfolioItem>
  ): void {
    
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    // Find item in sections
    for (const section of portfolio.sections) {
      const item = section.items.find(i => i.id === itemId);
      if (item) {
        Object.assign(item, updates);
        portfolio.lastModified = new Date();
        return;
      }
    }
    
    throw new Error(`Item not found: ${itemId}`);
  }
  
  /**
   * Reorder sections
   */
  reorderSections(portfolioId: string, sectionIds: string[]): void {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    const reorderedSections = sectionIds
      .map(id => portfolio.sections.find(s => s.id === id))
      .filter(s => s !== undefined) as PortfolioSection[];
    
    portfolio.sections = reorderedSections;
    portfolio.sections.forEach((section, index) => {
      section.order = index;
    });
    
    portfolio.lastModified = new Date();
  }
  
  /**
   * Export portfolio to PDF
   */
  async exportToPDF(
    portfolioId: string,
    options: ExportOptions
  ): Promise<Blob> {
    
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    // Ensure PDF engine is loaded
    await this.ensurePdfEngine();
    
    // Prepare portfolio data for PDF generation
    const portfolioData = this.preparePortfolioData(portfolio, options);
    
    // Generate PDF
    const pdfBlob = await this.pdfEngine.generateStudentPortfolio(
      {
        name: portfolio.studentName,
        id: portfolio.studentId,
        school: 'School Name', // Would come from user data
        grade: portfolio.metadata.gradeLevel || 'Not specified',
        interests: 'Student interests', // Would come from profile
        work: this.extractWorkSamples(portfolio),
        reflections: options.includeReflections ? this.extractReflections(portfolio) : [],
        skills: portfolio.metadata.skills,
        goals: this.extractGoals(portfolio)
      },
      {
        title: portfolio.projectTitle,
        id: portfolio.projectId,
        subject: portfolio.metadata.subject,
        startDate: portfolio.dateCreated,
        endDate: portfolio.lastModified
      }
    );
    
    // Record export
    const exportRecord: ExportRecord = {
      id: `export_${Date.now()}`,
      format: ExportFormat.PDF,
      dateExported: new Date(),
      exportedBy: 'current-user', // Would come from auth
      fileName: `${portfolio.studentName}_Portfolio_${portfolio.projectTitle}.pdf`
    };
    
    portfolio.exports.push(exportRecord);
    
    return pdfBlob;
  }
  
  /**
   * Export portfolio to HTML
   */
  async exportToHTML(
    portfolioId: string,
    options: ExportOptions
  ): Promise<string> {
    
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    // Generate HTML structure
    const html = this.generateHTMLPortfolio(portfolio, options);
    
    // Record export
    const exportRecord: ExportRecord = {
      id: `export_${Date.now()}`,
      format: ExportFormat.HTML,
      dateExported: new Date(),
      exportedBy: 'current-user',
      fileName: `${portfolio.studentName}_Portfolio_${portfolio.projectTitle}.html`
    };
    
    portfolio.exports.push(exportRecord);
    
    return html;
  }
  
  /**
   * Share portfolio
   */
  sharePortfolio(
    portfolioId: string,
    emails: string[],
    role: 'viewer' | 'commenter' | 'editor' = 'viewer',
    message?: string
  ): string {
    
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    // Generate share URL if not exists
    if (!portfolio.sharing.shareUrl) {
      portfolio.sharing.shareUrl = this.generateShareUrl(portfolioId);
    }
    
    // Add shared users
    emails.forEach(email => {
      if (!portfolio.sharing.sharedWith.find(u => u.email === email)) {
        portfolio.sharing.sharedWith.push({
          email,
          role,
          sharedDate: new Date()
        });
      }
    });
    
    // In a real app, send email notifications
    console.log(`Sharing portfolio with: ${emails.join(', ')}`);
    if (message) {
      console.log(`Message: ${message}`);
    }
    
    return portfolio.sharing.shareUrl;
  }
  
  /**
   * Get portfolio statistics
   */
  getPortfolioStats(portfolioId: string): PortfolioStatistics {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    const itemCounts = new Map<ItemType, number>();
    let totalItems = 0;
    let totalReflections = 0;
    
    portfolio.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        itemCounts.set(item.type, (itemCounts.get(item.type) || 0) + 1);
        if (item.reflection) totalReflections++;
      });
    });
    
    return {
      totalSections: portfolio.sections.length,
      totalItems,
      itemsByType: Object.fromEntries(itemCounts),
      reflectionCount: totalReflections,
      lastModified: portfolio.lastModified,
      shareCount: portfolio.sharing.sharedWith.length,
      exportCount: portfolio.exports.length,
      completeness: this.calculateCompleteness(portfolio)
    };
  }
  
  /**
   * Get portfolio templates
   */
  getTemplates(): PortfolioTemplate[] {
    return Array.from(this.templates.values());
  }
  
  /**
   * Get user's portfolios
   */
  getUserPortfolios(userId: string): Portfolio[] {
    return Array.from(this.portfolios.values())
      .filter(p => p.studentId === userId)
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }
  
  /**
   * Delete portfolio item
   */
  deleteItem(portfolioId: string, itemId: string): void {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    for (const section of portfolio.sections) {
      const index = section.items.findIndex(i => i.id === itemId);
      if (index !== -1) {
        section.items.splice(index, 1);
        portfolio.lastModified = new Date();
        return;
      }
    }
  }
  
  /**
   * Duplicate portfolio
   */
  duplicatePortfolio(portfolioId: string, newProjectTitle: string): Portfolio {
    const original = this.portfolios.get(portfolioId);
    if (!original) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    const duplicate: Portfolio = {
      ...original,
      id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectTitle: newProjectTitle,
      dateCreated: new Date(),
      lastModified: new Date(),
      sections: original.sections.map(section => ({
        ...section,
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: section.items.map(item => ({
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: new Date()
        }))
      })),
      sharing: {
        isPublic: false,
        allowComments: false,
        allowDownload: false,
        sharedWith: []
      },
      exports: []
    };
    
    this.portfolios.set(duplicate.id, duplicate);
    return duplicate;
  }
  
  // Private helper methods
  
  private initializeTemplates(): void {
    // Standard ALF Portfolio Template
    const alfTemplate: PortfolioTemplate = {
      id: 'alf-standard',
      name: 'ALF Standard Portfolio',
      description: 'Complete portfolio template for ALF projects',
      sections: [
        {
          type: SectionType.Introduction,
          title: 'About Me & My Project',
          required: true,
          minItems: 1,
          prompts: [
            'Introduce yourself and your interests',
            'Why did you choose this project?',
            'What did you hope to learn?'
          ]
        },
        {
          type: SectionType.ProjectOverview,
          title: 'Project Overview',
          required: true,
          minItems: 1,
          prompts: [
            'Describe your project',
            'What problem are you trying to solve?',
            'Who will benefit from your work?'
          ]
        },
        {
          type: SectionType.ProcessDocumentation,
          title: 'My Process',
          required: true,
          minItems: 3,
          prompts: [
            'Document your research process',
            'Show your iterations and improvements',
            'Include challenges and how you overcame them'
          ]
        },
        {
          type: SectionType.FinalProducts,
          title: 'Final Products',
          required: true,
          minItems: 1,
          prompts: [
            'Present your final work',
            'Explain your choices',
            'Show different angles/aspects'
          ]
        },
        {
          type: SectionType.Reflections,
          title: 'My Reflections',
          required: true,
          minItems: 2,
          prompts: [
            'What did you learn?',
            'How did you grow?',
            'What would you do differently?',
            'What are you most proud of?'
          ]
        },
        {
          type: SectionType.PeerFeedback,
          title: 'Peer Feedback',
          required: false,
          prompts: [
            'Include feedback from classmates',
            'How did their input help your project?'
          ]
        },
        {
          type: SectionType.SkillsDemonstrated,
          title: 'Skills I Developed',
          required: true,
          minItems: 1,
          prompts: [
            'List and provide evidence of skills gained',
            'Connect skills to real-world applications'
          ]
        },
        {
          type: SectionType.NextSteps,
          title: 'Where I Go From Here',
          required: true,
          minItems: 1,
          prompts: [
            'How will you continue this work?',
            'What new questions do you have?',
            'What impact do you hope to make?'
          ]
        }
      ],
      styling: {
        theme: 'professional',
        primaryColor: '#3498DB'
      }
    };
    
    // Quick Portfolio Template
    const quickTemplate: PortfolioTemplate = {
      id: 'quick-portfolio',
      name: 'Quick Portfolio',
      description: 'Simplified portfolio for shorter projects',
      sections: [
        {
          type: SectionType.ProjectOverview,
          title: 'My Project',
          required: true,
          minItems: 1
        },
        {
          type: SectionType.FinalProducts,
          title: 'What I Created',
          required: true,
          minItems: 1
        },
        {
          type: SectionType.Reflections,
          title: 'What I Learned',
          required: true,
          minItems: 1
        }
      ],
      styling: {
        theme: 'minimal',
        primaryColor: '#27AE60'
      }
    };
    
    this.templates.set(alfTemplate.id, alfTemplate);
    this.templates.set(quickTemplate.id, quickTemplate);
  }
  
  private getDefaultTemplate(): PortfolioTemplate {
    return this.templates.get('alf-standard')!;
  }
  
  private createSectionsFromTemplate(template: PortfolioTemplate): PortfolioSection[] {
    return template.sections.map((config, index) => ({
      id: `section_${Date.now()}_${index}`,
      type: config.type,
      title: config.title,
      order: index,
      items: [],
      visible: true,
      customizable: !config.required
    }));
  }
  
  private preparePortfolioData(portfolio: Portfolio, options: ExportOptions): any {
    return {
      portfolio,
      includeReflections: options.includeReflections,
      includeAssessments: options.includeAssessments,
      includeFeedback: options.includeFeedback,
      includeMetadata: options.includeMetadata
    };
  }
  
  private extractWorkSamples(portfolio: Portfolio): any[] {
    const workSamples: any[] = [];
    
    portfolio.sections.forEach(section => {
      if (section.type === SectionType.FinalProducts || 
          section.type === SectionType.ProcessDocumentation) {
        section.items.forEach(item => {
          workSamples.push({
            title: item.title,
            description: item.description || '',
            date: item.dateAdded,
            type: item.type,
            content: this.extractItemContent(item)
          });
        });
      }
    });
    
    return workSamples;
  }
  
  private extractReflections(portfolio: Portfolio): any[] {
    const reflections: any[] = [];
    
    const reflectionSection = portfolio.sections.find(s => s.type === SectionType.Reflections);
    if (reflectionSection) {
      reflectionSection.items.forEach(item => {
        if (item.type === ItemType.Text) {
          const content = item.content as TextItemContent;
          reflections.push({
            date: item.dateAdded,
            content: content.text
          });
        }
      });
    }
    
    // Also extract reflections from individual items
    portfolio.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.reflection) {
          reflections.push({
            date: item.dateAdded,
            content: item.reflection
          });
        }
      });
    });
    
    return reflections;
  }
  
  private extractGoals(portfolio: Portfolio): any {
    const nextStepsSection = portfolio.sections.find(s => s.type === SectionType.NextSteps);
    if (nextStepsSection && nextStepsSection.items.length > 0) {
      const firstItem = nextStepsSection.items[0];
      if (firstItem.type === ItemType.Text) {
        const content = firstItem.content as TextItemContent;
        return { description: content.text };
      }
    }
    return { description: 'Continue learning and growing!' };
  }
  
  private extractItemContent(item: PortfolioItem): string {
    switch (item.content.type) {
      case 'text':
        return (item.content as TextItemContent).text;
      case 'media':
        const media = item.content as MediaItemContent;
        return media.caption || media.url;
      case 'link':
        const link = item.content as LinkItemContent;
        return `${link.title}: ${link.url}`;
      case 'file':
        const file = item.content as FileItemContent;
        return `File: ${file.fileName}`;
      default:
        return item.description || '';
    }
  }
  
  private generateHTMLPortfolio(portfolio: Portfolio, options: ExportOptions): string {
    const sections = portfolio.sections
      .filter(s => s.visible)
      .map(section => `
        <section class="portfolio-section">
          <h2>${section.title}</h2>
          ${section.items.map(item => this.renderHTMLItem(item, options)).join('')}
        </section>
      `).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${portfolio.studentName} - ${portfolio.projectTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2C3E50; }
          h2 { color: #3498DB; margin-top: 30px; }
          .portfolio-section { margin-bottom: 40px; }
          .portfolio-item { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .item-date { color: #7F8C8D; font-size: 0.9em; }
          .reflection { font-style: italic; color: #34495E; margin-top: 10px; }
          img { max-width: 100%; height: auto; }
          .metadata { background: #ECF0F1; padding: 10px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>${portfolio.studentName}'s Portfolio</h1>
        <h2>${portfolio.projectTitle}</h2>
        <p class="item-date">Created: ${portfolio.dateCreated.toLocaleDateString()}</p>
        
        ${sections}
        
        ${options.includeMetadata ? `
          <div class="metadata">
            <h3>Portfolio Information</h3>
            <p><strong>Skills:</strong> ${portfolio.metadata.skills.join(', ')}</p>
            <p><strong>Keywords:</strong> ${portfolio.metadata.keywords.join(', ')}</p>
            ${portfolio.metadata.standards ? `<p><strong>Standards:</strong> ${portfolio.metadata.standards.join(', ')}</p>` : ''}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }
  
  private renderHTMLItem(item: PortfolioItem, options: ExportOptions): string {
    let content = '';
    
    switch (item.content.type) {
      case 'text':
        content = `<p>${(item.content as TextItemContent).text}</p>`;
        break;
      case 'media':
        const media = item.content as MediaItemContent;
        if (item.type === ItemType.Image) {
          content = `<img src="${media.url}" alt="${item.title}">`;
        } else {
          content = `<a href="${media.url}">${item.title}</a>`;
        }
        if (media.caption) {
          content += `<p class="caption">${media.caption}</p>`;
        }
        break;
      case 'link':
        const link = item.content as LinkItemContent;
        content = `<a href="${link.url}" target="_blank">${link.title}</a>`;
        if (link.description) {
          content += `<p>${link.description}</p>`;
        }
        break;
      case 'file':
        const file = item.content as FileItemContent;
        content = `<p>📎 ${file.fileName} (${this.formatFileSize(file.fileSize)})</p>`;
        break;
    }
    
    return `
      <div class="portfolio-item">
        <h3>${item.title}</h3>
        <p class="item-date">${item.dateAdded.toLocaleDateString()}</p>
        ${item.description ? `<p>${item.description}</p>` : ''}
        ${content}
        ${options.includeReflections && item.reflection ? 
          `<p class="reflection">Reflection: ${item.reflection}</p>` : ''}
      </div>
    `;
  }
  
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  private generateShareUrl(portfolioId: string): string {
    // In a real app, this would generate a secure, unique URL
    return `https://alfcoach.app/portfolio/${portfolioId}`;
  }
  
  private calculateCompleteness(portfolio: Portfolio): number {
    let requiredComplete = 0;
    let requiredTotal = 0;
    
    const template = this.getDefaultTemplate();
    
    template.sections.forEach(templateSection => {
      if (templateSection.required) {
        requiredTotal++;
        const portfolioSection = portfolio.sections.find(s => s.type === templateSection.type);
        if (portfolioSection && portfolioSection.items.length >= (templateSection.minItems || 1)) {
          requiredComplete++;
        }
      }
    });
    
    return requiredTotal > 0 ? (requiredComplete / requiredTotal) * 100 : 100;
  }
}

// Supporting types

export interface PortfolioStatistics {
  totalSections: number;
  totalItems: number;
  itemsByType: Record<string, number>;
  reflectionCount: number;
  lastModified: Date;
  shareCount: number;
  exportCount: number;
  completeness: number; // percentage
}

export default PortfolioExportSystem;