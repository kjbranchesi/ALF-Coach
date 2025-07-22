import TurndownService from 'turndown';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { BlueprintDoc } from '../../hooks/useBlueprintDoc';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

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
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 8,
    color: '#374151',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 4,
    color: '#374151',
  },
  phaseContainer: {
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  phaseNumberText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#2563eb',
  },
  phaseName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e1b4b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
});

function formatBlueprintToMarkdown(blueprint: BlueprintDoc): string {
  const { wizardData, journeyData } = blueprint;
  
  let markdown = `# ${wizardData.subject} ${wizardData.scope}\n\n`;
  markdown += `*A project-based learning blueprint*\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `**Motivation:** ${wizardData.motivation}\n\n`;
  markdown += `**Subject:** ${wizardData.subject}\n\n`;
  markdown += `**Age Group:** ${wizardData.ageGroup}\n\n`;
  if (wizardData.location) {
    markdown += `**Location:** ${wizardData.location}\n\n`;
  }
  markdown += `**Scope:** ${wizardData.scope}\n\n`;
  if (wizardData.materials) {
    markdown += `**Materials:** ${wizardData.materials}\n\n`;
  }
  
  // Big Idea & Essential Question
  if (journeyData?.phases && journeyData.phases.length > 0) {
    markdown += `## Big Idea\n\n`;
    markdown += `${journeyData.phases[0]?.name || 'To be determined'}\n\n`;
  }
  
  markdown += `## Essential Question\n\n`;
  markdown += `How might students apply their learning to create real impact?\n\n`;
  
  // Learning Journey
  markdown += `## Learning Journey\n\n`;
  
  // Phases
  if (journeyData?.phases && journeyData.phases.length > 0) {
    markdown += `### Phases\n\n`;
    journeyData.phases.forEach((phase, index) => {
      markdown += `**Phase ${index + 1}: ${phase.name}**\n`;
      markdown += `${phase.description}\n\n`;
    });
  }
  
  // Activities
  if (journeyData?.activities && journeyData.activities.length > 0) {
    markdown += `### Activities\n\n`;
    journeyData.phases?.forEach(phase => {
      const phaseActivities = journeyData.activities.filter(a => a.phaseId === phase.id);
      if (phaseActivities.length > 0) {
        markdown += `**${phase.name}**\n`;
        phaseActivities.forEach(activity => {
          markdown += `- ${activity.name}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  // Resources
  if (journeyData?.resources && journeyData.resources.length > 0) {
    markdown += `### Resources\n\n`;
    journeyData.resources.forEach(resource => {
      markdown += `- ${resource.name}\n`;
    });
    markdown += `\n`;
  }
  
  // Deliverables
  markdown += `## Deliverables\n\n`;
  
  // Milestones
  if (journeyData?.deliverables?.milestones && journeyData.deliverables.milestones.length > 0) {
    markdown += `### Milestones\n\n`;
    journeyData.deliverables.milestones.forEach(milestone => {
      markdown += `- ${milestone.name}\n`;
    });
    markdown += `\n`;
  }
  
  // Assessment Criteria
  if (journeyData?.deliverables?.rubric?.criteria && journeyData.deliverables.rubric.criteria.length > 0) {
    markdown += `### Assessment Criteria\n\n`;
    journeyData.deliverables.rubric.criteria.forEach(criterion => {
      markdown += `**${criterion.name}**\n`;
      markdown += `${criterion.description}\n\n`;
    });
  }
  
  // Authentic Impact
  if (journeyData?.deliverables?.impact?.audience) {
    markdown += `### Authentic Impact\n\n`;
    markdown += `**Audience:** ${journeyData.deliverables.impact.audience}\n\n`;
    if (journeyData.deliverables.impact.method) {
      markdown += `**Method:** ${journeyData.deliverables.impact.method}\n\n`;
    }
  }
  
  // Footer
  markdown += `---\n\n`;
  markdown += `*Generated with ProjectCraft - Empowering educators to design transformative learning experiences*\n`;
  
  return markdown;
}

// PDF Component
const BlueprintPDF = ({ blueprint }: { blueprint: BlueprintDoc }) => {
  const { wizardData, journeyData } = blueprint;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{wizardData.subject} {wizardData.scope}</Text>
        <Text style={styles.subtitle}>A project-based learning blueprint</Text>
        
        {/* Executive Summary */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        
        <Text style={styles.label}>Motivation</Text>
        <Text style={styles.value}>{wizardData.motivation}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Subject</Text>
            <Text style={styles.value}>{wizardData.subject}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Age Group</Text>
            <Text style={styles.value}>{wizardData.ageGroup}</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{wizardData.location || 'Not specified'}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Scope</Text>
            <Text style={styles.value}>{wizardData.scope}</Text>
          </View>
        </View>
        
        {wizardData.materials && (
          <>
            <Text style={styles.label}>Materials</Text>
            <Text style={styles.value}>{wizardData.materials}</Text>
          </>
        )}
        
        {/* Big Idea */}
        {journeyData?.phases && journeyData.phases.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Big Idea</Text>
            <Text style={styles.text}>{journeyData.phases[0]?.name || 'To be determined'}</Text>
          </>
        )}
        
        {/* Essential Question */}
        <Text style={styles.sectionTitle}>Essential Question</Text>
        <Text style={styles.text}>How might students apply their learning to create real impact?</Text>
        
        {/* Learning Journey */}
        <Text style={styles.sectionTitle}>Learning Journey</Text>
        
        {/* Phases */}
        {journeyData?.phases && journeyData.phases.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Phases</Text>
            {journeyData.phases.map((phase, index) => (
              <View key={phase.id} style={styles.phaseContainer}>
                <View style={styles.phaseHeader}>
                  <View style={styles.phaseNumber}>
                    <Text style={styles.phaseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                </View>
                <Text style={styles.text}>{phase.description}</Text>
              </View>
            ))}
          </>
        )}
        
        {/* Activities */}
        {journeyData?.activities && journeyData.activities.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Activities</Text>
            {journeyData.phases?.map(phase => {
              const phaseActivities = journeyData.activities.filter(a => a.phaseId === phase.id);
              if (phaseActivities.length === 0) return null;
              
              return (
                <View key={phase.id} style={{ marginBottom: 8 }}>
                  <Text style={styles.label}>{phase.name}</Text>
                  {phaseActivities.map(activity => (
                    <Text key={activity.id} style={styles.listItem}>• {activity.name}</Text>
                  ))}
                </View>
              );
            })}
          </>
        )}
        
        {/* Footer */}
        <Text style={styles.footer}>
          Generated with ProjectCraft - Empowering educators to design transformative learning experiences
        </Text>
      </Page>
      
      {/* Second page for Deliverables if needed */}
      {(journeyData?.deliverables?.milestones?.length || 
        journeyData?.deliverables?.rubric?.criteria?.length || 
        journeyData?.deliverables?.impact?.audience) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Deliverables</Text>
          
          {/* Milestones */}
          {journeyData.deliverables.milestones && journeyData.deliverables.milestones.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Milestones</Text>
              {journeyData.deliverables.milestones.map(milestone => (
                <Text key={milestone.id} style={styles.listItem}>• {milestone.name}</Text>
              ))}
            </>
          )}
          
          {/* Assessment Criteria */}
          {journeyData.deliverables.rubric?.criteria && journeyData.deliverables.rubric.criteria.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Assessment Criteria</Text>
              {journeyData.deliverables.rubric.criteria.map(criterion => (
                <View key={criterion.id} style={{ marginBottom: 8 }}>
                  <Text style={styles.label}>{criterion.name}</Text>
                  <Text style={styles.text}>{criterion.description}</Text>
                </View>
              ))}
            </>
          )}
          
          {/* Authentic Impact */}
          {journeyData.deliverables.impact?.audience && (
            <>
              <Text style={styles.subsectionTitle}>Authentic Impact</Text>
              <Text style={styles.label}>Audience</Text>
              <Text style={styles.value}>{journeyData.deliverables.impact.audience}</Text>
              {journeyData.deliverables.impact.method && (
                <>
                  <Text style={styles.label}>Method</Text>
                  <Text style={styles.value}>{journeyData.deliverables.impact.method}</Text>
                </>
              )}
            </>
          )}
          
          <Text style={styles.footer}>
            Generated with ProjectCraft - Empowering educators to design transformative learning experiences
          </Text>
        </Page>
      )}
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
      a.download = `${blueprint.wizardData.subject}-blueprint.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up after short delay
      setTimeout(() => URL.revokeObjectURL(localUrl), 100);
      
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
      a.download = `${blueprint.wizardData.subject}-blueprint.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up after short delay
      setTimeout(() => URL.revokeObjectURL(localUrl), 100);
    }
  } catch (error) {
    console.error('Export to PDF failed:', error);
    throw error;
  }
}