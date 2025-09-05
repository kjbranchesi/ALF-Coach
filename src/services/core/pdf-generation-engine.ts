/**
 * PDF Generation Engine
 * 
 * Core service for generating professional PDFs from ALF projects,
 * including project plans, student work, and assessments.
 */

// Heavy PDF/image libs are dynamically imported within methods to avoid vendor init issues

export interface PDFDocument {
  id: string;
  title: string;
  type: DocumentType;
  metadata: DocumentMetadata;
  sections: DocumentSection[];
  styling: DocumentStyling;
  generatedDate: Date;
  fileSize?: number;
}

export enum DocumentType {
  ProjectPlan = 'project-plan',
  StudentPortfolio = 'student-portfolio',
  ProgressReport = 'progress-report',
  Assessment = 'assessment',
  Certificate = 'certificate',
  Rubric = 'rubric',
  LessonPlan = 'lesson-plan',
  ParentReport = 'parent-report'
}

export interface DocumentMetadata {
  author: string;
  subject: string;
  keywords: string[];
  school?: string;
  class?: string;
  studentName?: string;
  projectTitle?: string;
  dateRange?: DateRange;
  alfStage?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DocumentSection {
  type: SectionType;
  title: string;
  content: SectionContent;
  pageBreakAfter?: boolean;
  includeInTOC?: boolean;
}

export enum SectionType {
  CoverPage = 'cover-page',
  TableOfContents = 'table-of-contents',
  Introduction = 'introduction',
  ProjectOverview = 'project-overview',
  LearningObjectives = 'learning-objectives',
  Timeline = 'timeline',
  Resources = 'resources',
  StudentWork = 'student-work',
  Assessment = 'assessment',
  Reflection = 'reflection',
  NextSteps = 'next-steps',
  Appendix = 'appendix'
}

export type SectionContent = 
  | TextContent 
  | TableContent 
  | ImageContent 
  | ChartContent 
  | ListContent
  | MixedContent;

export interface TextContent {
  type: 'text';
  text: string;
  formatting?: TextFormatting;
}

export interface TextFormatting {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  lineHeight?: number;
}

export interface TableContent {
  type: 'table';
  headers: string[];
  rows: string[][];
  styling?: TableStyling;
}

export interface TableStyling {
  headerBackground?: string;
  headerColor?: string;
  borderColor?: string;
  alternateRows?: boolean;
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
}

export interface ChartContent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'radar';
  data: any;
  options?: any;
  title?: string;
  width?: number;
  height?: number;
}

export interface ListContent {
  type: 'list';
  items: ListItem[];
  ordered: boolean;
  style?: ListStyle;
}

export interface ListItem {
  text: string;
  subItems?: ListItem[];
  checked?: boolean; // for checklists
}

export interface ListStyle {
  bulletStyle?: string;
  indentLevel?: number;
  spacing?: number;
}

export interface MixedContent {
  type: 'mixed';
  elements: SectionContent[];
}

export interface DocumentStyling {
  fontFamily: string;
  baseFontSize: number;
  primaryColor: string;
  secondaryColor: string;
  margins: Margins;
  headerFooter: HeaderFooterConfig;
  watermark?: WatermarkConfig;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HeaderFooterConfig {
  showHeader: boolean;
  showFooter: boolean;
  headerText?: string;
  footerText?: string;
  showPageNumbers: boolean;
  showDate: boolean;
}

export interface WatermarkConfig {
  text: string;
  opacity: number;
  angle: number;
  fontSize: number;
}

export interface GenerationOptions {
  format: 'letter' | 'a4';
  orientation: 'portrait' | 'landscape';
  compress: boolean;
  embedFonts: boolean;
  accessibility: boolean;
}

export class PDFGenerationEngine {
  private defaultStyling: DocumentStyling = {
    fontFamily: 'Helvetica',
    baseFontSize: 12,
    primaryColor: '#2C3E50',
    secondaryColor: '#3498DB',
    margins: { top: 72, right: 72, bottom: 72, left: 72 },
    headerFooter: {
      showHeader: true,
      showFooter: true,
      showPageNumbers: true,
      showDate: true
    }
  };
  
  /**
   * Generate PDF from document specification
   */
  async generatePDF(
    document: PDFDocument,
    options: GenerationOptions = {
      format: 'letter',
      orientation: 'portrait',
      compress: true,
      embedFonts: true,
      accessibility: true
    }
  ): Promise<Blob> {
    
    // Create new jsPDF instance
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'pt',
      format: options.format,
      compress: options.compress
    });
    
    // Apply document styling
    const styling = { ...this.defaultStyling, ...document.styling };
    this.applyDocumentStyling(pdf, styling);
    
    // Add metadata
    this.addMetadata(pdf, document.metadata, options);
    
    // Generate sections
    let currentPage = 1;
    for (const section of document.sections) {
      await this.renderSection(pdf, section, styling, currentPage);
      
      if (section.pageBreakAfter && section !== document.sections[document.sections.length - 1]) {
        pdf.addPage();
        currentPage++;
      }
    }
    
    // Add header/footer to all pages
    if (styling.headerFooter.showHeader || styling.headerFooter.showFooter) {
      this.addHeadersFooters(pdf, styling.headerFooter, document.metadata);
    }
    
    // Add watermark if configured
    if (styling.watermark) {
      this.addWatermark(pdf, styling.watermark);
    }
    
    // Return as blob
    return pdf.output('blob');
  }
  
  /**
   * Generate project plan PDF
   */
  async generateProjectPlan(
    projectData: any,
    teacherName: string,
    options?: GenerationOptions
  ): Promise<Blob> {
    
    const document: PDFDocument = {
      id: `doc_${Date.now()}`,
      title: `Project Plan: ${projectData.title}`,
      type: DocumentType.ProjectPlan,
      metadata: {
        author: teacherName,
        subject: projectData.subject || 'General',
        keywords: ['project plan', 'ALF', projectData.subject].filter(Boolean),
        projectTitle: projectData.title,
        alfStage: projectData.alfStage
      },
      sections: [
        this.createCoverPage(projectData.title, 'Project Plan', teacherName),
        this.createTableOfContents([
          'Project Overview',
          'Learning Objectives',
          'Timeline & Milestones',
          'Resources Needed',
          'Assessment Plan',
          'Student Scaffolding'
        ]),
        this.createProjectOverview(projectData),
        this.createLearningObjectives(projectData.objectives),
        this.createTimeline(projectData.timeline),
        this.createResourcesList(projectData.resources),
        this.createAssessmentPlan(projectData.assessment),
        this.createScaffoldingGuide(projectData.scaffolding)
      ],
      styling: this.defaultStyling,
      generatedDate: new Date()
    };
    
    return this.generatePDF(document, options);
  }
  
  /**
   * Generate student portfolio PDF
   */
  async generateStudentPortfolio(
    studentData: any,
    projectData: any,
    options?: GenerationOptions
  ): Promise<Blob> {
    
    const document: PDFDocument = {
      id: `portfolio_${Date.now()}`,
      title: `${studentData.name} - Project Portfolio`,
      type: DocumentType.StudentPortfolio,
      metadata: {
        author: studentData.name,
        subject: projectData.subject || 'General',
        keywords: ['portfolio', 'student work', projectData.title],
        studentName: studentData.name,
        projectTitle: projectData.title,
        dateRange: {
          start: new Date(projectData.startDate),
          end: new Date(projectData.endDate || Date.now())
        }
      },
      sections: [
        this.createCoverPage(
          `${studentData.name}'s Portfolio`,
          projectData.title,
          studentData.school
        ),
        this.createTableOfContents([
          'About Me',
          'Project Journey',
          'My Work',
          'Reflections',
          'Skills Developed',
          'Next Steps'
        ]),
        this.createAboutMeSection(studentData),
        this.createProjectJourneySection(projectData, studentData),
        this.createStudentWorkSection(studentData.work),
        this.createReflectionsSection(studentData.reflections),
        this.createSkillsSection(studentData.skills),
        this.createNextStepsSection(studentData.goals)
      ],
      styling: {
        ...this.defaultStyling,
        primaryColor: '#27AE60',
        secondaryColor: '#2ECC71'
      },
      generatedDate: new Date()
    };
    
    return this.generatePDF(document, options);
  }
  
  /**
   * Generate progress report PDF
   */
  async generateProgressReport(
    studentData: any,
    progressData: any,
    teacherComments: string,
    options?: GenerationOptions
  ): Promise<Blob> {
    
    const document: PDFDocument = {
      id: `progress_${Date.now()}`,
      title: `Progress Report - ${studentData.name}`,
      type: DocumentType.ProgressReport,
      metadata: {
        author: studentData.teacher,
        subject: 'Progress Report',
        keywords: ['progress', 'assessment', studentData.name],
        studentName: studentData.name,
        class: studentData.class,
        dateRange: {
          start: new Date(progressData.periodStart),
          end: new Date(progressData.periodEnd)
        }
      },
      sections: [
        this.createCoverPage(
          'Progress Report',
          `${studentData.name}`,
          `${studentData.class} - ${studentData.school}`
        ),
        this.createProgressSummary(progressData),
        this.createCompetencyProgress(progressData.competencies),
        this.createProjectProgress(progressData.projects),
        this.createTeacherComments(teacherComments),
        this.createGoalsSection(progressData.goals),
        this.createParentCommunication()
      ],
      styling: this.defaultStyling,
      generatedDate: new Date()
    };
    
    return this.generatePDF(document, options);
  }
  
  /**
   * Generate simple certificate
   */
  async generateCertificate(
    recipientName: string,
    achievementTitle: string,
    date: Date,
    signatoryName: string,
    signatoryTitle: string,
    options?: GenerationOptions
  ): Promise<Blob> {
    
    const document: PDFDocument = {
      id: `cert_${Date.now()}`,
      title: `Certificate - ${recipientName}`,
      type: DocumentType.Certificate,
      metadata: {
        author: signatoryName,
        subject: 'Certificate of Achievement',
        keywords: ['certificate', achievementTitle],
        studentName: recipientName
      },
      sections: [
        {
          type: SectionType.CoverPage,
          title: 'Certificate',
          content: {
            type: 'mixed',
            elements: [
              {
                type: 'text',
                text: 'Certificate of Achievement',
                formatting: {
                  fontSize: 36,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#2C3E50'
                }
              },
              {
                type: 'text',
                text: '\n\nThis is to certify that\n\n',
                formatting: {
                  fontSize: 16,
                  textAlign: 'center'
                }
              },
              {
                type: 'text',
                text: recipientName,
                formatting: {
                  fontSize: 28,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#3498DB'
                }
              },
              {
                type: 'text',
                text: `\n\nhas successfully completed\n\n${achievementTitle}\n\n`,
                formatting: {
                  fontSize: 16,
                  textAlign: 'center'
                }
              },
              {
                type: 'text',
                text: `Awarded on ${date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}\n\n\n`,
                formatting: {
                  fontSize: 14,
                  textAlign: 'center'
                }
              },
              {
                type: 'text',
                text: `${signatoryName}\n${signatoryTitle}`,
                formatting: {
                  fontSize: 14,
                  textAlign: 'center',
                  fontStyle: 'italic'
                }
              }
            ]
          }
        }
      ],
      styling: {
        ...this.defaultStyling,
        margins: { top: 100, right: 100, bottom: 100, left: 100 }
      },
      generatedDate: new Date()
    };
    
    return this.generatePDF(document, {
      ...options,
      orientation: 'landscape'
    });
  }
  
  /**
   * Convert HTML element to PDF
   */
  async htmlToPDF(
    element: HTMLElement,
    title: string,
    options?: GenerationOptions
  ): Promise<Blob> {
    
    // Convert HTML to canvas
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Create PDF with canvas image
    const pdf = new jsPDF({
      orientation: options?.orientation || 'portrait',
      unit: 'pt',
      format: options?.format || 'letter'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdf.internal.pageSize.getWidth() - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.text(title, 20, 30);
    pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
    
    return pdf.output('blob');
  }
  
  // Helper methods for creating sections
  
  private createCoverPage(title: string, subtitle: string, author: string): DocumentSection {
    return {
      type: SectionType.CoverPage,
      title: 'Cover',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: title,
            formatting: {
              fontSize: 32,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#2C3E50'
            }
          },
          {
            type: 'text',
            text: `\n\n${subtitle}\n\n`,
            formatting: {
              fontSize: 20,
              textAlign: 'center',
              color: '#7F8C8D'
            }
          },
          {
            type: 'text',
            text: author,
            formatting: {
              fontSize: 16,
              textAlign: 'center',
              color: '#34495E'
            }
          },
          {
            type: 'text',
            text: `\n\n\n${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}`,
            formatting: {
              fontSize: 14,
              textAlign: 'center',
              color: '#95A5A6'
            }
          }
        ]
      },
      pageBreakAfter: true
    };
  }
  
  private createTableOfContents(sections: string[]): DocumentSection {
    return {
      type: SectionType.TableOfContents,
      title: 'Table of Contents',
      content: {
        type: 'list',
        items: sections.map((section, index) => ({
          text: `${index + 1}. ${section}`
        })),
        ordered: false,
        style: {
          bulletStyle: 'none',
          spacing: 8
        }
      },
      pageBreakAfter: true
    };
  }
  
  private createProjectOverview(projectData: any): DocumentSection {
    return {
      type: SectionType.ProjectOverview,
      title: 'Project Overview',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: projectData.description || 'No description provided.',
            formatting: { lineHeight: 1.5 }
          },
          {
            type: 'table',
            headers: ['Project Details', 'Information'],
            rows: [
              ['Subject Area', projectData.subject || 'General'],
              ['Grade Level', projectData.gradeLevel || 'Not specified'],
              ['Duration', projectData.duration || 'Ongoing'],
              ['ALF Stage', projectData.alfStage || 'Not specified'],
              ['Key Skills', (projectData.skills || []).join(', ') || 'Various']
            ],
            styling: {
              headerBackground: '#3498DB',
              headerColor: 'white',
              alternateRows: true
            }
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createLearningObjectives(objectives: string[]): DocumentSection {
    return {
      type: SectionType.LearningObjectives,
      title: 'Learning Objectives',
      content: {
        type: 'list',
        items: objectives.map(obj => ({ text: obj })),
        ordered: true,
        style: { spacing: 6 }
      },
      includeInTOC: true
    };
  }
  
  private createTimeline(timeline: any): DocumentSection {
    return {
      type: SectionType.Timeline,
      title: 'Timeline & Milestones',
      content: {
        type: 'table',
        headers: ['Phase', 'Duration', 'Key Activities', 'Deliverables'],
        rows: timeline?.phases?.map((phase: any) => [
          phase.name,
          phase.duration,
          phase.activities.join(', '),
          phase.deliverables.join(', ')
        ]) || [['No timeline specified', '-', '-', '-']]
      },
      includeInTOC: true
    };
  }
  
  private createResourcesList(resources: any): DocumentSection {
    return {
      type: SectionType.Resources,
      title: 'Resources Needed',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: 'Materials:',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'list',
            items: (resources?.materials || ['None specified']).map((r: string) => ({ text: r })),
            ordered: false
          },
          {
            type: 'text',
            text: '\nTechnology:',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'list',
            items: (resources?.technology || ['None specified']).map((r: string) => ({ text: r })),
            ordered: false
          },
          {
            type: 'text',
            text: '\nCommunity Partners:',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'list',
            items: (resources?.partners || ['None identified yet']).map((r: string) => ({ text: r })),
            ordered: false
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createAssessmentPlan(assessment: any): DocumentSection {
    return {
      type: SectionType.Assessment,
      title: 'Assessment Plan',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: 'Assessment Strategy:',
            formatting: { fontWeight: 'bold', fontSize: 14 }
          },
          {
            type: 'text',
            text: assessment?.strategy || 'Continuous formative assessment with final portfolio review.',
            formatting: { lineHeight: 1.5 }
          },
          {
            type: 'text',
            text: '\nAssessment Criteria:',
            formatting: { fontWeight: 'bold', fontSize: 14 }
          },
          {
            type: 'list',
            items: (assessment?.criteria || [
              'Quality of research and investigation',
              'Creativity and innovation in solutions',
              'Collaboration and teamwork',
              'Communication of findings',
              'Reflection and growth'
            ]).map((c: string) => ({ text: c })),
            ordered: true
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createScaffoldingGuide(scaffolding: any): DocumentSection {
    return {
      type: SectionType.ProjectOverview,
      title: 'Student Scaffolding',
      content: {
        type: 'text',
        text: scaffolding?.description || 
          'Differentiated support will be provided based on individual student needs, including:\n' +
          '• Visual aids and graphic organizers\n' +
          '• Peer collaboration opportunities\n' +
          '• Technology tools for research and creation\n' +
          '• Regular check-ins and feedback sessions\n' +
          '• Modified objectives as needed'
      },
      includeInTOC: true
    };
  }
  
  private createAboutMeSection(studentData: any): DocumentSection {
    return {
      type: SectionType.Introduction,
      title: 'About Me',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: `Name: ${studentData.name}\n` +
                  `Grade: ${studentData.grade}\n` +
                  `School: ${studentData.school}\n\n`,
            formatting: { lineHeight: 1.5 }
          },
          {
            type: 'text',
            text: 'My Interests:',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'text',
            text: studentData.interests || 'Learning new things and working on creative projects!',
            formatting: { lineHeight: 1.5 }
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createProjectJourneySection(projectData: any, studentData: any): DocumentSection {
    return {
      type: SectionType.ProjectOverview,
      title: 'My Project Journey',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: `Project: ${projectData.title}\n\n`,
            formatting: { fontWeight: 'bold', fontSize: 16 }
          },
          {
            type: 'text',
            text: 'Why I chose this project:\n',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'text',
            text: studentData.projectReason || 'I was interested in learning more about this topic.',
            formatting: { lineHeight: 1.5 }
          },
          {
            type: 'text',
            text: '\n\nMy driving question:\n',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'text',
            text: studentData.drivingQuestion || projectData.drivingQuestion || 'How can I make a difference?',
            formatting: { fontStyle: 'italic', fontSize: 14 }
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createStudentWorkSection(work: any[]): DocumentSection {
    if (!work || work.length === 0) {
      return {
        type: SectionType.StudentWork,
        title: 'My Work',
        content: {
          type: 'text',
          text: 'Work samples will be added as the project progresses.'
        },
        includeInTOC: true
      };
    }
    
    return {
      type: SectionType.StudentWork,
      title: 'My Work',
      content: {
        type: 'mixed',
        elements: work.map(item => ({
          type: 'mixed' as const,
          elements: [
            {
              type: 'text' as const,
              text: `${item.title}\n`,
              formatting: { fontWeight: 'bold', fontSize: 14 }
            },
            {
              type: 'text' as const,
              text: `${item.description}\n`,
              formatting: { lineHeight: 1.5 }
            },
            {
              type: 'text' as const,
              text: `Date: ${new Date(item.date).toLocaleDateString()}\n\n`,
              formatting: { fontStyle: 'italic', color: '#7F8C8D' }
            }
          ]
        }))
      },
      includeInTOC: true
    };
  }
  
  private createReflectionsSection(reflections: any[]): DocumentSection {
    return {
      type: SectionType.Reflection,
      title: 'My Reflections',
      content: {
        type: 'mixed',
        elements: (reflections || []).length > 0 ? reflections.map(r => ({
          type: 'text' as const,
          text: `${new Date(r.date).toLocaleDateString()}: ${r.content}\n\n`,
          formatting: { lineHeight: 1.5 }
        })) : [{
          type: 'text' as const,
          text: 'Reflections will be added throughout the project.',
          formatting: { fontStyle: 'italic' }
        }]
      },
      includeInTOC: true
    };
  }
  
  private createSkillsSection(skills: any): DocumentSection {
    return {
      type: SectionType.StudentWork,
      title: 'Skills I Developed',
      content: {
        type: 'list',
        items: (skills || [
          'Research and investigation',
          'Problem-solving',
          'Communication',
          'Collaboration',
          'Critical thinking'
        ]).map((skill: string) => ({ text: skill })),
        ordered: false,
        style: { bulletStyle: '✓', spacing: 6 }
      },
      includeInTOC: true
    };
  }
  
  private createNextStepsSection(goals: any): DocumentSection {
    return {
      type: SectionType.NextSteps,
      title: 'My Next Steps',
      content: {
        type: 'text',
        text: goals?.description || 
          'Continue exploring this topic and applying what I learned to new challenges.',
        formatting: { lineHeight: 1.5 }
      },
      includeInTOC: true
    };
  }
  
  private createProgressSummary(progressData: any): DocumentSection {
    return {
      type: SectionType.Introduction,
      title: 'Progress Summary',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: `Reporting Period: ${new Date(progressData.periodStart).toLocaleDateString()} - ${new Date(progressData.periodEnd).toLocaleDateString()}\n\n`,
            formatting: { fontSize: 14 }
          },
          {
            type: 'table',
            headers: ['Area', 'Progress', 'Notes'],
            rows: [
              ['Overall Progress', progressData.overall || 'On Track', progressData.overallNotes || ''],
              ['Engagement', progressData.engagement || 'Excellent', progressData.engagementNotes || ''],
              ['Collaboration', progressData.collaboration || 'Good', progressData.collaborationNotes || ''],
              ['Initiative', progressData.initiative || 'Developing', progressData.initiativeNotes || '']
            ],
            styling: {
              headerBackground: '#3498DB',
              headerColor: 'white'
            }
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  private createCompetencyProgress(competencies: any[]): DocumentSection {
    return {
      type: SectionType.Assessment,
      title: 'Competency Development',
      content: {
        type: 'table',
        headers: ['Competency', 'Level', 'Evidence'],
        rows: (competencies || [
          { name: 'Critical Thinking', level: 'Proficient', evidence: 'Demonstrates analysis in project work' },
          { name: 'Communication', level: 'Developing', evidence: 'Improving in presentations' },
          { name: 'Collaboration', level: 'Proficient', evidence: 'Works well with peers' }
        ]).map((c: any) => [c.name, c.level, c.evidence])
      },
      includeInTOC: true
    };
  }
  
  private createProjectProgress(projects: any[]): DocumentSection {
    return {
      type: SectionType.ProjectOverview,
      title: 'Project Progress',
      content: {
        type: 'mixed',
        elements: (projects || []).map(p => ({
          type: 'mixed' as const,
          elements: [
            {
              type: 'text' as const,
              text: `${p.title}\n`,
              formatting: { fontWeight: 'bold', fontSize: 14 }
            },
            {
              type: 'text' as const,
              text: `Status: ${p.status} | Completion: ${p.completion}%\n`,
              formatting: { color: '#3498DB' }
            },
            {
              type: 'text' as const,
              text: `${p.summary}\n\n`,
              formatting: { lineHeight: 1.5 }
            }
          ]
        }))
      },
      includeInTOC: true
    };
  }
  
  private createTeacherComments(comments: string): DocumentSection {
    return {
      type: SectionType.Assessment,
      title: 'Teacher Comments',
      content: {
        type: 'text',
        text: comments || 'No additional comments at this time.',
        formatting: { lineHeight: 1.5 }
      },
      includeInTOC: true
    };
  }
  
  private createGoalsSection(goals: any): DocumentSection {
    return {
      type: SectionType.NextSteps,
      title: 'Goals for Next Period',
      content: {
        type: 'list',
        items: (goals?.items || [
          'Continue developing research skills',
          'Increase leadership in group activities',
          'Complete project milestones on schedule'
        ]).map((g: string) => ({ text: g })),
        ordered: true,
        style: { spacing: 6 }
      },
      includeInTOC: true
    };
  }
  
  private createParentCommunication(): DocumentSection {
    return {
      type: SectionType.NextSteps,
      title: 'Parent/Guardian Communication',
      content: {
        type: 'mixed',
        elements: [
          {
            type: 'text',
            text: 'How to Support Your Child\'s Learning:\n\n',
            formatting: { fontWeight: 'bold', fontSize: 14 }
          },
          {
            type: 'list',
            items: [
              { text: 'Ask about their project and show interest in their discoveries' },
              { text: 'Encourage them to explain their thinking process' },
              { text: 'Help them connect their learning to real-world applications' },
              { text: 'Celebrate both successes and learning from challenges' },
              { text: 'Reach out if you have questions or concerns' }
            ],
            ordered: false,
            style: { spacing: 6 }
          },
          {
            type: 'text',
            text: '\n\nContact Information:\n',
            formatting: { fontWeight: 'bold' }
          },
          {
            type: 'text',
            text: 'Please feel free to contact me at [teacher email] or schedule a meeting through the school office.',
            formatting: { lineHeight: 1.5 }
          }
        ]
      },
      includeInTOC: true
    };
  }
  
  // PDF generation helper methods
  
  private applyDocumentStyling(pdf: jsPDF, styling: DocumentStyling): void {
    pdf.setFont(styling.fontFamily);
    pdf.setFontSize(styling.baseFontSize);
  }
  
  private addMetadata(pdf: jsPDF, metadata: DocumentMetadata, options: GenerationOptions): void {
    // Add PDF metadata
    pdf.setProperties({
      title: metadata.projectTitle || 'ALF Document',
      subject: metadata.subject,
      author: metadata.author,
      keywords: metadata.keywords.join(', '),
      creator: 'ALF Coach'
    });
    
    // Add accessibility tags if enabled
    if (options.accessibility) {
      // This would add PDF/UA tags in a full implementation
    }
  }
  
  private async renderSection(
    pdf: jsPDF,
    section: DocumentSection,
    styling: DocumentStyling,
    pageNumber: number
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margins = styling.margins;
    
    let y = margins.top;
    
    // Render section title
    if (section.title && section.type !== SectionType.CoverPage) {
      pdf.setFontSize(18);
      pdf.setTextColor(styling.primaryColor);
      pdf.text(section.title, margins.left, y);
      y += 30;
    }
    
    // Reset font
    pdf.setFontSize(styling.baseFontSize);
    pdf.setTextColor('#000000');
    
    // Render content based on type
    await this.renderContent(pdf, section.content, margins, y, pageWidth, pageHeight);
  }
  
  private async renderContent(
    pdf: jsPDF,
    content: SectionContent,
    margins: Margins,
    startY: number,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = startY;
    
    switch (content.type) {
      case 'text':
        const textContent = content as TextContent;
        if (textContent.formatting) {
          this.applyTextFormatting(pdf, textContent.formatting);
        }
        
        const lines = pdf.splitTextToSize(textContent.text, contentWidth);
        
        if (textContent.formatting?.textAlign === 'center') {
          lines.forEach((line: string) => {
            const textWidth = pdf.getTextWidth(line);
            const x = (pageWidth - textWidth) / 2;
            pdf.text(line, x, y);
            y += pdf.getTextDimensions(line).h * (textContent.formatting?.lineHeight || 1.2);
          });
        } else {
          pdf.text(lines, margins.left, y);
        }
        break;
        
      case 'table':
        const tableContent = content as TableContent;
        // Simple table rendering - in production would use a table plugin
        this.renderTable(pdf, tableContent, margins.left, y, contentWidth);
        break;
        
      case 'list':
        const listContent = content as ListContent;
        this.renderList(pdf, listContent, margins.left, y, contentWidth);
        break;
        
      case 'mixed':
        const mixedContent = content as MixedContent;
        for (const element of mixedContent.elements) {
          y = await this.renderContent(pdf, element, margins, y, pageWidth, pageHeight);
          y += 10; // Add spacing between elements
        }
        break;
    }
  }
  
  private applyTextFormatting(pdf: jsPDF, formatting: TextFormatting): void {
    if (formatting.fontSize) {
      pdf.setFontSize(formatting.fontSize);
    }
    if (formatting.fontWeight === 'bold') {
      pdf.setFont(pdf.getFont().fontName, 'bold');
    } else if (formatting.fontStyle === 'italic') {
      pdf.setFont(pdf.getFont().fontName, 'italic');
    } else {
      pdf.setFont(pdf.getFont().fontName, 'normal');
    }
    if (formatting.color) {
      pdf.setTextColor(formatting.color);
    }
  }
  
  private renderTable(
    pdf: jsPDF,
    table: TableContent,
    x: number,
    y: number,
    width: number
  ): void {
    const cellWidth = width / table.headers.length;
    const cellHeight = 20;
    
    // Render headers
    if (table.styling?.headerBackground) {
      pdf.setFillColor(table.styling.headerBackground);
      pdf.rect(x, y, width, cellHeight, 'F');
    }
    
    pdf.setTextColor(table.styling?.headerColor || '#000000');
    pdf.setFont(pdf.getFont().fontName, 'bold');
    
    table.headers.forEach((header, i) => {
      pdf.text(header, x + (i * cellWidth) + 5, y + 15);
    });
    
    y += cellHeight;
    
    // Render rows
    pdf.setFont(pdf.getFont().fontName, 'normal');
    pdf.setTextColor('#000000');
    
    table.rows.forEach((row, rowIndex) => {
      if (table.styling?.alternateRows && rowIndex % 2 === 1) {
        pdf.setFillColor('#F8F9FA');
        pdf.rect(x, y, width, cellHeight, 'F');
      }
      
      row.forEach((cell, i) => {
        pdf.text(cell, x + (i * cellWidth) + 5, y + 15);
      });
      
      y += cellHeight;
    });
  }
  
  private renderList(
    pdf: jsPDF,
    list: ListContent,
    x: number,
    y: number,
    width: number
  ): void {
    const bullet = list.style?.bulletStyle || (list.ordered ? '1.' : '•');
    const indent = list.style?.indentLevel || 20;
    const spacing = list.style?.spacing || 5;
    
    list.items.forEach((item, index) => {
      const marker = list.ordered ? `${index + 1}.` : bullet;
      pdf.text(marker, x, y);
      
      const lines = pdf.splitTextToSize(item.text, width - indent);
      pdf.text(lines, x + indent, y);
      
      y += (lines.length * pdf.getTextDimensions(item.text).h) + spacing;
    });
  }
  
  private addHeadersFooters(
    pdf: jsPDF,
    config: HeaderFooterConfig,
    metadata: DocumentMetadata
  ): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      if (config.showHeader && config.headerText) {
        pdf.setFontSize(10);
        pdf.setTextColor('#7F8C8D');
        pdf.text(config.headerText, 40, 30);
      }
      
      if (config.showFooter) {
        const footerY = pdf.internal.pageSize.getHeight() - 30;
        
        if (config.showPageNumbers) {
          pdf.setFontSize(10);
          pdf.setTextColor('#7F8C8D');
          pdf.text(
            `Page ${i} of ${pageCount}`,
            pdf.internal.pageSize.getWidth() / 2,
            footerY,
            { align: 'center' }
          );
        }
        
        if (config.showDate) {
          pdf.setFontSize(8);
          pdf.text(
            new Date().toLocaleDateString(),
            40,
            footerY
          );
        }
      }
    }
  }
  
  private addWatermark(pdf: jsPDF, watermark: WatermarkConfig): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.saveGraphicsState();
      
      pdf.setGState(new pdf.GState({ opacity: watermark.opacity }));
      pdf.setFontSize(watermark.fontSize);
      pdf.setTextColor('#CCCCCC');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.text(
        watermark.text,
        pageWidth / 2,
        pageHeight / 2,
        {
          angle: watermark.angle,
          align: 'center'
        }
      );
      
      pdf.restoreGraphicsState();
    }
  }
}

export default PDFGenerationEngine;
