// PublishPro.jsx - Publish stage with review, export, and celebration

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import { renderMarkdown } from '../../lib/markdown.ts';
// Removed direct import - will lazy load html2pdf when needed
// import html2pdf from 'html2pdf.js';

// Icons
const Icons = {
  ProjectCraft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  GoogleClassroom: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L14.09 8.36L21 9.27L16.5 13.97L17.82 21L12 17.77L6.18 21L7.5 13.97L3 9.27L9.91 8.36L12 2z"/>
    </svg>
  ),
  Confetti: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m4.93 19.07 1.41-1.41"/>
      <path d="m17.66 6.34 1.41-1.41"/>
    </svg>
  )
};

// Review Section Component
const ReviewSection = ({ title, children, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md p-6 mb-4"
  >
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="text-primary-600" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="text-gray-700">{children}</div>
  </motion.div>
);

// Export Option Card
const ExportOption = ({ icon: Icon, title, description, onClick, disabled = false }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-4 bg-white rounded-lg shadow-md hover:shadow-lg 
               transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
        <Icon />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  </motion.button>
);

// Celebration Modal
const CelebrationModal = ({ isOpen, onClose, projectTitle }) => {
  if (!isOpen) {return null;}

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Confetti */}
          <motion.div
            className="mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Icons.Confetti className="w-20 h-20 mx-auto text-amber-500" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Congratulations! 🎉
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-700 mb-6"
          >
            Your <strong className="text-primary-600">{projectTitle}</strong> blueprint is complete and ready to inspire authentic learning!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 text-left bg-green-50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-green-700">
              <Icons.Check />
              <span>Ideation Framework Created</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Icons.Check />
              <span>Learning Journey Mapped</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Icons.Check />
              <span>Authentic Assessments Designed</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Icons.Check />
              <span>Ready for Implementation</span>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onClose}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold 
                     hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Component
const PublishPro = ({ projectInfo, onComplete, onCancel }) => {
  const { blueprint, updateBlueprint } = useBlueprint();
  const [activeTab, setActiveTab] = useState('review');
  const [isExporting, setIsExporting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);

  // Generate comprehensive summary
  const generateSummary = useCallback(() => {
    const { ideation, learningJourney, authenticDeliverables } = blueprint;
    
    const summary = `# ${projectInfo.subject} Learning Project

## Project Overview
- **Subject**: ${projectInfo.subject}
- **Audience**: ${projectInfo.ageGroup}
- **Scope**: ${projectInfo.projectScope}
- **Location**: ${projectInfo.location || 'Not specified'}

## Ideation Framework

### Big Idea
${ideation.bigIdea}

### Essential Question
${ideation.essentialQuestion}

### Challenge
${ideation.challenge}

### Key Issues
${ideation.issues.map(issue => `- ${issue}`).join('\n')}

## Learning Journey

### Phases
${learningJourney.phases.map((phase, index) => `
#### Phase ${index + 1}: ${phase.name}
Duration: ${phase.duration || 'TBD'}
Activities:
${(learningJourney.activities[phase.id] || []).map(activity => `- ${activity}`).join('\n')}
`).join('\n')}

### Resources
${learningJourney.resources.map(resource => `- [${resource.title}](${resource.url})`).join('\n')}

## Authentic Deliverables

### Milestones
${authenticDeliverables.milestones.map(milestone => `
- **${milestone.title}**: ${milestone.description}
  ${milestone.dueDate ? `Due: ${new Date(milestone.dueDate).toLocaleDateString()}` : ''}
`).join('\n')}

### Assessment Rubric
${authenticDeliverables.rubric.criteria.map(criteria => `
**${criteria.name}**
- Beginning: ${criteria.levels[0]?.description || 'TBD'}
- Developing: ${criteria.levels[1]?.description || 'TBD'}
- Proficient: ${criteria.levels[2]?.description || 'TBD'}
- Advanced: ${criteria.levels[3]?.description || 'TBD'}
`).join('\n')}

### Impact Plan
- **Audience**: ${authenticDeliverables.impactPlan.audience || 'TBD'}
- **Method**: ${authenticDeliverables.impactPlan.method || 'TBD'}
- **Date**: ${authenticDeliverables.impactPlan.date ? new Date(authenticDeliverables.impactPlan.date).toLocaleDateString() : 'TBD'}
- **Description**: ${authenticDeliverables.impactPlan.description || 'TBD'}

---
*Generated by ProjectCraft on ${new Date().toLocaleDateString()}*`;

    return summary;
  }, [blueprint, projectInfo]);

  // Export to PDF - Lazy loads html2pdf (saves 150KB from initial bundle)
  const exportToPDF = async () => {
    setIsExporting(true);
    
    // Show loading while PDF library loads
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'Loading PDF generator...';
    loadingToast.className = 'fixed top-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(loadingToast);
    
    try {
      // Lazy load html2pdf only when needed
      const html2pdf = (await import('html2pdf.js')).default;
      loadingToast.textContent = 'Generating PDF...';
      
      const summary = generateSummary();
      const element = document.createElement('div');
      element.innerHTML = renderMarkdown(summary).__html;
      element.style.padding = '40px';
      element.style.fontFamily = 'Arial, sans-serif';
      
      const opt = {
        margin: 1,
        filename: `${projectInfo.subject}_Blueprint.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      loadingToast.remove();
      
      // Record export
      const exportRecord = {
        type: 'pdf',
        timestamp: new Date().toISOString(),
        filename: opt.filename
      };
      setExportHistory(prev => [...prev, exportRecord]);
      updateBlueprint({
        publish: {
          ...blueprint.publish,
          exports: [...(blueprint.publish.exports || []), exportRecord]
        }
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      loadingToast.remove();
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.textContent = 'PDF export failed. Please try again.';
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    }
    setIsExporting(false);
  };

  // Generate share link
  const generateShareLink = async () => {
    setIsExporting(true);
    try {
      // In a real app, this would upload to a server
      // For now, we'll create a data URL
      const summary = generateSummary();
      const dataUrl = `data:text/markdown;base64,${btoa(summary)}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(dataUrl);
      
      // Record export
      const exportRecord = {
        type: 'link',
        timestamp: new Date().toISOString(),
        url: dataUrl
      };
      setExportHistory(prev => [...prev, exportRecord]);
      updateBlueprint({
        publish: {
          ...blueprint.publish,
          exports: [...(blueprint.publish.exports || []), exportRecord],
          shareUrl: dataUrl
        }
      });
      
      // User feedback
      try {
        const { showToast } = await import('../../utils/toast');
        showToast('Share link copied to clipboard!', 'success');
      } catch {
        // no-op if toast import fails
      }
    } catch (error) {
      console.error('Share link generation failed:', error);
    }
    setIsExporting(false);
  };

  // Export to Google Classroom
  const exportToGoogleClassroom = async () => {
    // In a real app, this would use Google Classroom API
    try {
      const { showToast } = await import('../../utils/toast');
      showToast('Google Classroom integration coming soon!', 'info');
    } catch {
      // no-op if toast import fails
    }
  };

  // Handle publish completion
  const handlePublish = () => {
    updateBlueprint({
      publish: {
        ...blueprint.publish,
        published: true,
        publishedAt: new Date().toISOString(),
        summary: generateSummary()
      }
    });
    setShowCelebration(true);
  };

  // Handle celebration close
  const handleCelebrationClose = () => {
    setShowCelebration(false);
    onComplete();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Publish Your Blueprint</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <Icons.Check className="inline mr-1" />
                Ready to Share
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'text-primary-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Icons.Eye className="inline mr-2" />
            Review
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'text-primary-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Icons.Download className="inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'review' ? (
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Review Your Complete Blueprint
              </h2>
              <p className="text-gray-600">
                Take a moment to review all the components of your {projectInfo.subject} project 
                before publishing and sharing with others.
              </p>
            </motion.div>

            {/* Ideation Review */}
            <ReviewSection title="Ideation Framework" icon={Icons.Sparkles}>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Big Idea:</span>
                  <p className="mt-1">{blueprint.ideation.bigIdea}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Essential Question:</span>
                  <p className="mt-1">{blueprint.ideation.essentialQuestion}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Challenge:</span>
                  <p className="mt-1">{blueprint.ideation.challenge}</p>
                </div>
                {blueprint.ideation.issues.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Key Issues:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {blueprint.ideation.issues.map((issue, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ReviewSection>

            {/* Learning Journey Review */}
            <ReviewSection title="Learning Journey" icon={() => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            )}>
              <div className="space-y-4">
                {blueprint.learningJourney.phases.map((phase, index) => (
                  <div key={phase.id} className="border-l-4 border-primary-200 pl-4">
                    <h4 className="font-medium text-gray-900">
                      Phase {index + 1}: {phase.name}
                    </h4>
                    <p className="text-sm text-gray-600">{phase.duration || 'Duration TBD'}</p>
                    {blueprint.learningJourney.activities[phase.id]?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {blueprint.learningJourney.activities[phase.id].map((activity, i) => (
                          <li key={i} className="text-sm text-gray-700">• {activity}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </ReviewSection>

            {/* Deliverables Review */}
            <ReviewSection title="Authentic Deliverables" icon={() => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            )}>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Milestones:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {blueprint.authenticDeliverables.milestones.length} checkpoints defined
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rubric:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {blueprint.authenticDeliverables.rubric.criteria.length} criteria with 4-level assessment
                  </p>
                </div>
                {blueprint.authenticDeliverables.impactPlan.audience && (
                  <div>
                    <span className="font-medium text-gray-700">Impact Plan:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Sharing with {blueprint.authenticDeliverables.impactPlan.audience} via{' '}
                      {blueprint.authenticDeliverables.impactPlan.method}
                    </p>
                  </div>
                )}
              </div>
            </ReviewSection>

            {/* Publish Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <button
                onClick={handlePublish}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg
                         hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl
                         transform hover:-translate-y-0.5"
              >
                <Icons.Sparkles className="inline mr-2" />
                Publish Blueprint
              </button>
              <p className="text-sm text-gray-600 mt-2">
                You can always make changes and republish later
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Export & Share Your Blueprint
              </h2>
              <p className="text-gray-600">
                Choose how you'd like to export and share your {projectInfo.subject} project blueprint.
              </p>
            </motion.div>

            <div className="grid gap-4">
              <ExportOption
                icon={Icons.Download}
                title="Download as PDF"
                description="Get a professionally formatted PDF document ready for printing or sharing"
                onClick={exportToPDF}
                disabled={isExporting}
              />

              <ExportOption
                icon={Icons.Share}
                title="Generate Share Link"
                description="Create a shareable link that others can use to view your blueprint"
                onClick={generateShareLink}
                disabled={isExporting}
              />

              <ExportOption
                icon={Icons.GoogleClassroom}
                title="Export to Google Classroom"
                description="Import your blueprint directly into Google Classroom as an assignment"
                onClick={exportToGoogleClassroom}
                disabled={isExporting}
              />
            </div>

            {/* Export History */}
            {exportHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Export History</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {exportHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {record.type === 'pdf' ? 'PDF Download' : 
                         record.type === 'link' ? 'Share Link Generated' : 
                         'Google Classroom Export'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        projectTitle={projectInfo.subject}
      />
    </div>
  );
};

export default PublishPro;
