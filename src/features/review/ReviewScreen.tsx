import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintDoc } from '../../hooks/useBlueprintDoc';
import { exportToMarkdown, exportToPDF } from './exportUtils';
import { 
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsiblePanel({ title, icon: Icon, children, defaultOpen = true }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-soft-lg"
    >
      <button
        onClick={() => { setIsOpen(!isOpen); }}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <Icon className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Removed local icon definitions - now using lucide-react

export function ReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blueprint, loading, error } = useBlueprintDoc(id || '');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Blueprint not found</h2>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { wizardData, journeyData } = blueprint;

  const handleExport = async (format: 'markdown' | 'pdf') => {
    setIsExporting(true);
    setExportMessage('');
    
    try {
      if (format === 'markdown') {
        const url = await exportToMarkdown(blueprint);
        window.open(url, '_blank');
        setExportMessage('Your blueprint is ready. Let me know if you\'d like refinements.');
      } else {
        await exportToPDF(blueprint);
        setExportMessage('Your blueprint PDF is ready. Let me know if you\'d like refinements.');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Blueprint Review</h1>
              <p className="text-slate-600 mt-2">
                Review and export your {wizardData.subject} {wizardData.scope}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('markdown')}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="w-4 h-4" />
                Markdown
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
          
          {exportMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{exportMessage}</p>
            </motion.div>
          )}
        </div>

        {/* Collapsible Panels */}
        <div className="space-y-4">
          {/* Wizard Summary */}
          <CollapsiblePanel title="Wizard Summary" icon={Sparkles}>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700">Motivation</h4>
                <p className="text-gray-600 mt-1">{wizardData.motivation}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Subject</h4>
                  <p className="text-gray-600">{wizardData.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Age Group</h4>
                  <p className="text-gray-600">{wizardData.ageGroup}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Location</h4>
                  <p className="text-gray-600">{wizardData.location || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Scope</h4>
                  <p className="text-gray-600">{wizardData.scope}</p>
                </div>
              </div>
              {wizardData.materials && (
                <div>
                  <h4 className="font-medium text-gray-700">Materials</h4>
                  <p className="text-gray-600">{wizardData.materials}</p>
                </div>
              )}
            </div>
          </CollapsiblePanel>

          {/* Ideation Overview */}
          <CollapsiblePanel title="Ideation Overview" icon={RefreshCw}>
            <div className="space-y-3">
              {journeyData?.phases && journeyData.phases.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">Big Idea</h4>
                  <p className="text-gray-600">{journeyData.phases[0]?.name || 'To be determined'}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-700">Essential Question</h4>
                <p className="text-gray-600">How might students apply their learning to create real impact?</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Challenge</h4>
                <p className="text-gray-600">Design solutions that address authentic community needs</p>
              </div>
            </div>
          </CollapsiblePanel>

          {/* Learning Journey */}
          <CollapsiblePanel title="Learning Journey" icon={ArrowRight}>
            <div className="space-y-4">
              {/* Phases */}
              {journeyData?.phases && journeyData.phases.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Phases</h4>
                  <div className="space-y-2">
                    {journeyData.phases.map((phase, index) => (
                      <div key={phase.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{phase.name}</h5>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {journeyData?.activities && Object.keys(journeyData.activities).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Activities</h4>
                  <div className="space-y-3">
                    {journeyData.phases.map(phase => {
                      const phaseActivities = journeyData.activities.filter(a => a.phaseId === phase.id);
                      if (phaseActivities.length === 0) {return null;}
                      
                      return (
                        <div key={phase.id}>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">{phase.name}</h5>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {phaseActivities.map(activity => (
                              <li key={activity.id} className="text-sm text-gray-600">
                                {activity.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resources */}
              {journeyData?.resources && journeyData.resources.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Resources</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {journeyData.resources.map((resource, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {resource.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsiblePanel>

          {/* Deliverables */}
          <CollapsiblePanel title="Deliverables" icon={CheckCircle}>
            <div className="space-y-4">
              {/* Milestones */}
              {journeyData?.deliverables?.milestones && journeyData.deliverables.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Milestones</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {journeyData.deliverables.milestones.map(milestone => (
                      <li key={milestone.id} className="text-sm text-gray-600">
                        {milestone.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rubric */}
              {journeyData?.deliverables?.rubric?.criteria && journeyData.deliverables.rubric.criteria.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Assessment Criteria</h4>
                  <div className="space-y-2">
                    {journeyData.deliverables.rubric.criteria.map(criterion => (
                      <div key={criterion.id}>
                        <h5 className="text-sm font-medium text-gray-700">{criterion.name}</h5>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact */}
              {journeyData?.deliverables?.impact?.audience && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Authentic Impact</h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Audience</h5>
                      <p className="text-sm text-gray-600">{journeyData.deliverables.impact.audience}</p>
                    </div>
                    {journeyData.deliverables.impact.method && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Method</h5>
                        <p className="text-sm text-gray-600">{journeyData.deliverables.impact.method}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsiblePanel>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate(`/app/blueprint/${id}/chat`)}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Editing
          </button>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}