import TurndownService from 'turndown';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { BlueprintDoc } from '../../hooks/useBlueprintDoc';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase';

// Register fonts for React-PDF
Font.register({
  family: 'Urbanist',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/urbanist/v15/L0xjDF02iFML4hGCyOCpRdycFsGxSrqDyx8fFpOrS8SlKw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/urbanist/v15/L0xjDF02iFML4hGCyOCpRdycFsGxSrqD-x4fFpOrS8SlKw.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/urbanist/v15/L0xjDF02iFML4hGCyOCpRdycFsGxSrqDFxwfFpOrS8SlKw.ttf', fontWeight: 700 },
  ]
});

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Urbanist',
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#64748b',
    fontWeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 24,
    marginBottom: 12,
    fontWeight: 600,
    color: '#1e1b4b',
  },
  subsectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 600,
    color: '#374151',
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 2,
    color: '#64748b',
    fontWeight: 600,
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
    lineHeight: 1.6,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 12,
    color: '#374151',
  },
  phaseBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  phaseTitle: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 600,
    color: '#1e1b4b',
  },
  phaseDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  rubricRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  rubricCriterion: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    width: '30%',
  },
  rubricDescription: {
    fontSize: 12,
    color: '#64748b',
    width: '50%',
  },
  rubricWeight: {
    fontSize: 12,
    color: '#374151',
    width: '20%',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#9ca3af',
  },
});

function formatBlueprintToMarkdown(blueprint: BlueprintDoc): string {
  const { wizard, ideation, journey, deliverables } = blueprint;
  
  let markdown = `# ${wizard.subject} Project Blueprint\n\n`;
  markdown += `*A project-based learning blueprint for ${wizard.students}*\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `**Big Idea:** ${ideation.bigIdea || 'In development'}\n\n`;
  markdown += `**Essential Question:** ${ideation.essentialQuestion || 'In development'}\n\n`;
  markdown += `**Challenge:** ${ideation.challenge || 'In development'}\n\n`;
  markdown += `**Subject:** ${wizard.subject}\n\n`;
  markdown += `**Grade Level:** ${wizard.students}\n\n`;
  markdown += `**Duration:** ${wizard.scope}\n\n`;
  markdown += `**Focus:** ${wizard.vision || 'Balanced approach'}\n\n`;
  if (wizard.location) {
    markdown += `**Location:** ${wizard.location}\n\n`;
  }
  if (wizard.materials) {
    markdown += `**Student Materials:** ${wizard.materials}\n\n`;
  }
  if (wizard.teacherResources) {
    markdown += `**Teacher Resources:** ${wizard.teacherResources}\n\n`;
  }
  
  // Learning Journey
  if (journey?.phases && journey.phases.length > 0) {
    markdown += `## Learning Journey\n\n`;
    journey.phases.forEach((phase, index) => {
      const phaseText = typeof phase === 'string' ? phase : phase.title || phase.name;
      markdown += `### Phase ${index + 1}: ${phaseText}\n\n`;
      if (typeof phase === 'object' && phase.description) {
        markdown += `${phase.description}\n\n`;
      }
    });
  }
  
  // Activities
  if (journey?.activities && journey.activities.length > 0) {
    markdown += `## Activities\n\n`;
    journey.activities.forEach((activity: any, index: number) => {
      const activityText = typeof activity === 'string' ? activity : activity.title || activity.name;
      markdown += `${index + 1}. ${activityText}\n`;
    });
    markdown += '\n';
  }
  
  // Resources
  if (journey?.resources && journey.resources.length > 0) {
    markdown += `## Resources\n\n`;
    journey.resources.forEach((resource: any, index: number) => {
      const resourceText = typeof resource === 'string' ? resource : resource.title || resource.name;
      markdown += `${index + 1}. ${resourceText}\n`;
    });
    markdown += '\n';
  }
  
  // Deliverables
  if (deliverables) {
    markdown += `## Deliverables\n\n`;
    
    if (deliverables.milestones && deliverables.milestones.length > 0) {
      markdown += `### Milestones\n\n`;
      deliverables.milestones.forEach((milestone: any, index: number) => {
        const milestoneText = typeof milestone === 'string' ? milestone : milestone.title || milestone.name;
        markdown += `${index + 1}. ${milestoneText}\n`;
        if (typeof milestone === 'object' && milestone.description) {
          markdown += `   - ${milestone.description}\n`;
        }
      });
      markdown += '\n';
    }
    
    if (deliverables.rubric && deliverables.rubric.criteria) {
      markdown += `### Assessment Rubric\n\n`;
      
      deliverables.rubric.criteria.forEach((criterion: any) => {
        markdown += `**${criterion.criterion}** (${criterion.weight}%)\n`;
        markdown += `${criterion.description}\n\n`;
      });
    }
    
    if (deliverables.impact) {
      markdown += `### Impact\n\n`;
      markdown += `**Audience:** ${deliverables.impact.audience || 'TBD'}\n`;
      markdown += `**Method:** ${deliverables.impact.method || 'TBD'}\n`;
      if (deliverables.impact.timeline) {
        markdown += `**Timeline:** ${deliverables.impact.timeline}\n`;
      }
      markdown += '\n';
    }
  }
  
  // Footer
  markdown += `---\n\n`;
  markdown += `*Generated with ALF Coach - Empowering educators to design transformative learning experiences*\n`;
  
  return markdown;
}

// PDF Component
const BlueprintPDF = ({ blueprint }: { blueprint: BlueprintDoc }) => {
  const { wizard, ideation, journey, deliverables } = blueprint;
  
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.title}>{wizard.subject} Project</Text>
        <Text style={styles.subtitle}>A project-based learning blueprint for {wizard.students}</Text>
        
        {/* Executive Summary */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        
        <Text style={styles.label}>Big Idea</Text>
        <Text style={styles.value}>{ideation.bigIdea || 'In development'}</Text>
        
        <Text style={styles.label}>Essential Question</Text>
        <Text style={styles.value}>{ideation.essentialQuestion || 'In development'}</Text>
        
        <Text style={styles.label}>Challenge</Text>
        <Text style={styles.value}>{ideation.challenge || 'In development'}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Subject</Text>
            <Text style={styles.value}>{wizard.subject}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Grade Level</Text>
            <Text style={styles.value}>{wizard.students}</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{wizard.scope}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Focus</Text>
            <Text style={styles.value}>{wizard.vision || 'Balanced approach'}</Text>
          </View>
        </View>
        
        {wizard.location && (
          <>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{wizard.location}</Text>
          </>
        )}
        
        {wizard.materials && (
          <>
            <Text style={styles.label}>Student Materials</Text>
            <Text style={styles.value}>{wizard.materials}</Text>
          </>
        )}
        
        {wizard.teacherResources && (
          <>
            <Text style={styles.label}>Teacher Resources</Text>
            <Text style={styles.value}>{wizard.teacherResources}</Text>
          </>
        )}
        
        {/* Learning Journey */}
        {journey?.phases && journey.phases.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Learning Journey</Text>
            {journey.phases.map((phase, index) => {
              const phaseText = typeof phase === 'string' ? phase : phase.title || phase.name;
              const phaseDesc = typeof phase === 'object' ? phase.description : '';
              
              return (
                <View key={index} style={styles.phaseBox}>
                  <Text style={styles.phaseTitle}>Phase {index + 1}: {phaseText}</Text>
                  {phaseDesc && <Text style={styles.phaseDescription}>{phaseDesc}</Text>}
                </View>
              );
            })}
          </>
        )}
        
        {/* Activities */}
        {journey?.activities && journey.activities.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Activities</Text>
            {journey.activities.map((activity, index) => {
              const activityText = typeof activity === 'string' ? activity : activity.title || activity.name;
              return <Text key={index} style={styles.listItem}>• {activityText}</Text>;
            })}
          </>
        )}
        
        {/* Resources */}
        {journey?.resources && journey.resources.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Resources</Text>
            {journey.resources.map((resource, index) => {
              const resourceText = typeof resource === 'string' ? resource : resource.title || resource.name;
              return <Text key={index} style={styles.listItem}>• {resourceText}</Text>;
            })}
          </>
        )}
        
        {/* Milestones */}
        {deliverables?.milestones && deliverables.milestones.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {deliverables.milestones.map((milestone, index) => {
              const milestoneText = typeof milestone === 'string' ? milestone : milestone.title || milestone.name;
              return <Text key={index} style={styles.listItem}>• Phase {index + 1}: {milestoneText}</Text>;
            })}
          </>
        )}
        
        {/* Rubric */}
        {deliverables?.rubric?.criteria && deliverables.rubric.criteria.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Assessment Rubric</Text>
            {deliverables.rubric.criteria.map((criterion, index) => (
              <View key={index} style={styles.rubricRow}>
                <Text style={styles.rubricCriterion}>{criterion.criterion}</Text>
                <Text style={styles.rubricDescription}>{criterion.description}</Text>
                <Text style={styles.rubricWeight}>{criterion.weight}%</Text>
              </View>
            ))}
          </>
        )}
        
        {/* Impact */}
        {deliverables?.impact && (
          <>
            <Text style={styles.sectionTitle}>Authentic Impact</Text>
            <Text style={styles.label}>Audience</Text>
            <Text style={styles.value}>{deliverables.impact.audience || 'TBD'}</Text>
            <Text style={styles.label}>Method</Text>
            <Text style={styles.value}>{deliverables.impact.method || 'TBD'}</Text>
          </>
        )}
        
        <Text style={styles.footer}>
          Generated with ALF Coach - Empowering educators to design transformative learning experiences
        </Text>
      </Page>
    </Document>
  );
};

export async function exportToMarkdown(blueprint: BlueprintDoc): Promise<string> {
  try {
    // Convert blueprint to markdown
    const markdown = formatBlueprintToMarkdown(blueprint);
    
    // Create a blob from the markdown
    const blob = new Blob([markdown], { type: 'text/markdown' });
    
    // Upload to Firebase Storage with fallback to local download
    try {
      const fileName = `blueprints/${blueprint.id}/export-${Date.now()}.md`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (firebaseError) {
      console.warn('Firebase upload failed, falling back to local download:', firebaseError);
      
      // Fallback: Create local download URL
      const localUrl = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = `blueprint-${blueprint.id || 'export'}.md`;
      a.click();
      
      // Cleanup
      URL.revokeObjectURL(localUrl);
      
      return localUrl;
    }
  } catch (error) {
    console.error('Export to markdown failed:', error);
    throw error;
  }
}

export async function exportToPDF(blueprint: BlueprintDoc): Promise<void> {
  try {
    // Generate PDF
    const pdfDoc = <BlueprintPDF blueprint={blueprint} />;
    const blob = await pdf(pdfDoc).toBlob();
    
    // Try Firebase upload first
    try {
      const fileName = `blueprints/${blueprint.id}/export-${Date.now()}.pdf`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Open in new tab
      window.open(downloadUrl, '_blank');
    } catch (firebaseError) {
      console.warn('Firebase upload failed, falling back to local download:', firebaseError);
      
      // Fallback: Create local download
      const localUrl = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = `blueprint-${blueprint.id || 'export'}.pdf`;
      a.click();
      
      // Cleanup
      URL.revokeObjectURL(localUrl);
    }
  } catch (error) {
    console.error('Export to PDF failed:', error);
    throw error;
  }
}