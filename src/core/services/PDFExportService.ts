/**
 * PDFExportService.ts - Simple PDF generation for deliverables
 */

import { BlueprintDoc } from '../types/SOPTypes';
import { DeliverableGenerator } from './DeliverableGenerator';

export class PDFExportService {
  private generator: DeliverableGenerator;
  
  constructor() {
    this.generator = new DeliverableGenerator();
  }
  
  /**
   * Export teacher guide as PDF
   */
  async exportTeacherGuide(blueprint: BlueprintDoc): Promise<Blob> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const guideData = this.generator.generateTeacherGuide(blueprint);
    
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    
    // Title Page
    doc.setFontSize(24);
    doc.text(guideData.title, 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    doc.setFontSize(14);
    doc.text('Teacher Implementation Guide', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(11);
    doc.text(`Subject: ${guideData.subject}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Grade Level: ${guideData.gradeLevel}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Duration: ${guideData.duration}`, 20, yPosition);
    yPosition += 20;
    
    // Project Overview Section
    doc.setFontSize(16);
    doc.text('Project Overview', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Big Idea:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += lineHeight;
    const bigIdeaLines = doc.splitTextToSize(guideData.projectOverview.bigIdea, 170);
    doc.text(bigIdeaLines, 20, yPosition);
    yPosition += bigIdeaLines.length * lineHeight + 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('Essential Question:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += lineHeight;
    const eqLines = doc.splitTextToSize(guideData.projectOverview.essentialQuestion, 170);
    doc.text(eqLines, 20, yPosition);
    yPosition += eqLines.length * lineHeight + 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('Driving Challenge:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += lineHeight;
    const challengeLines = doc.splitTextToSize(guideData.projectOverview.drivingChallenge, 170);
    doc.text(challengeLines, 20, yPosition);
    yPosition += challengeLines.length * lineHeight + 10;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Learning Journey Phases
    doc.setFontSize(16);
    doc.text('Learning Journey', 20, yPosition);
    yPosition += 10;
    
    guideData.phases.forEach((phase, index) => {
      // Check page break
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Phase ${phase.number}: ${phase.title}`, 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;
      
      doc.setFontSize(11);
      doc.text(`Duration: ${phase.duration}`, 20, yPosition);
      yPosition += lineHeight;
      
      const descLines = doc.splitTextToSize(phase.description, 170);
      doc.text(descLines, 20, yPosition);
      yPosition += descLines.length * lineHeight + 10;
    });
    
    // Assessment Rubric
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Assessment Plan', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text('Rubric Criteria:', 20, yPosition);
    yPosition += lineHeight;
    
    guideData.assessment.summative.rubric.criteria.forEach((criterion: any) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`• ${criterion.criterion} (${criterion.points} points)`, 25, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += lineHeight;
      
      const descLines = doc.splitTextToSize(criterion.description, 160);
      doc.text(descLines, 30, yPosition);
      yPosition += descLines.length * lineHeight + 5;
    });
    
    // Return as blob
    return doc.output('blob');
  }
  
  /**
   * Export student guide as PDF
   */
  async exportStudentGuide(blueprint: BlueprintDoc): Promise<Blob> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const guideData = this.generator.generateStudentGuide(blueprint);
    
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    
    // Fun title page for students
    doc.setFontSize(28);
    doc.text('Your Learning Adventure!', 105, yPosition, { align: 'center' });
    yPosition += 25;
    
    doc.setFontSize(14);
    doc.text('Project Guide', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Challenge introduction
    doc.setFontSize(16);
    doc.text('Your Challenge:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    const challengeLines = doc.splitTextToSize(guideData.welcome.challenge, 170);
    doc.text(challengeLines, 20, yPosition);
    yPosition += challengeLines.length * lineHeight + 10;
    
    // What you'll learn
    doc.setFontSize(16);
    doc.text('What You Will Learn:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    guideData.welcome.whatYouWillLearn.forEach((goal: string) => {
      doc.text(`• ${goal}`, 25, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 10;
    
    // Journey map
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(20);
    doc.text('Your Journey Map', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    guideData.journeyMap.forEach((phase: any) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Phase ${phase.phase}: ${phase.title}`, 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;
      
      doc.setFontSize(11);
      const whatLines = doc.splitTextToSize(phase.whatYouWillDo, 170);
      doc.text(whatLines, 20, yPosition);
      yPosition += whatLines.length * lineHeight + 10;
    });
    
    // Success tips
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(18);
    doc.text('How to Succeed', 20, yPosition);
    yPosition += 12;
    
    doc.setFontSize(11);
    guideData.howToSucceed.tipsForSuccess.forEach((tip: string) => {
      doc.text(`✓ ${tip}`, 25, yPosition);
      yPosition += lineHeight;
    });
    
    return doc.output('blob');
  }
  
  /**
   * Export complete package (both guides)
   */
  async exportCompletePackage(blueprint: BlueprintDoc): Promise<{ teacher: Blob; student: Blob }> {
    const teacherGuide = await this.exportTeacherGuide(blueprint);
    const studentGuide = await this.exportStudentGuide(blueprint);
    
    return {
      teacher: teacherGuide,
      student: studentGuide
    };
  }
  
  /**
   * Download helper
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
