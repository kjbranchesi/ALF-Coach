/**
 * ResourceCards.tsx
 * 
 * Practical resource management for educators
 * Simple lists with print-friendly formatting
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Link, 
  Package, 
  Tool, 
  BookOpen,
  Printer,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';

interface Resource {
  id: string;
  name: string;
  category: 'material' | 'tool' | 'reference' | 'link';
  description?: string;
  quantity?: number;
  unit?: string;
  url?: string;
  required: boolean;
}

interface ResourceCardsProps {
  resources: Resource[];
  projectTitle?: string;
  onUpdate?: (resources: Resource[]) => void;
  readOnly?: boolean;
}

const categoryIcons = {
  material: <Package className="w-4 h-4" />,
  tool: <Tool className="w-4 h-4" />,
  reference: <BookOpen className="w-4 h-4" />,
  link: <Link className="w-4 h-4" />
};

const categoryLabels = {
  material: 'Materials',
  tool: 'Tools & Equipment',
  reference: 'References & Reading',
  link: 'External Links'
};

const categoryColors = {
  material: 'coral',
  tool: 'primary',
  reference: 'success',
  link: 'ai'
};

export const ResourceCards: React.FC<ResourceCardsProps> = ({
  resources,
  projectTitle = 'Project',
  onUpdate,
  readOnly = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['material', 'tool', 'reference', 'link'])
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Copy resource list to clipboard
  const copyToClipboard = async (category?: string) => {
    const resourcesToCopy = category 
      ? groupedResources[category] || []
      : resources;
    
    const text = formatResourcesAsText(resourcesToCopy, category);
    await navigator.clipboard.writeText(text);
    setCopiedId(category || 'all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format resources as plain text for copying/printing
  const formatResourcesAsText = (resourceList: Resource[], category?: string) => {
    let text = `${projectTitle} - Resources\n`;
    text += '='.repeat(50) + '\n\n';
    
    if (category) {
      text += `${categoryLabels[category as keyof typeof categoryLabels]}\n`;
      text += '-'.repeat(30) + '\n';
      resourceList.forEach(resource => {
        text += `• ${resource.name}`;
        if (resource.quantity) {
          text += ` (${resource.quantity} ${resource.unit || ''})`;
        }
        if (resource.required) {
          text += ' [REQUIRED]';
        }
        text += '\n';
        if (resource.description) {
          text += `  ${resource.description}\n`;
        }
        if (resource.url) {
          text += `  Link: ${resource.url}\n`;
        }
        text += '\n';
      });
    } else {
      Object.entries(groupedResources).forEach(([cat, resList]) => {
        text += `${categoryLabels[cat as keyof typeof categoryLabels]}\n`;
        text += '-'.repeat(30) + '\n';
        resList.forEach(resource => {
          text += `• ${resource.name}`;
          if (resource.quantity) {
            text += ` (${resource.quantity} ${resource.unit || ''})`;
          }
          if (resource.required) {
            text += ' [REQUIRED]';
          }
          text += '\n';
          if (resource.description) {
            text += `  ${resource.description}\n`;
          }
          if (resource.url) {
            text += `  Link: ${resource.url}\n`;
          }
          text += '\n';
        });
        text += '\n';
      });
    }
    
    return text;
  };

  // Print resources
  const handlePrint = () => {
    const printContent = formatResourcesAsText(resources);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${projectTitle} Resources</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Resources</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {resources.length} total resources • {resources.filter(r => r.required).length} required
            </p>
          </div>
          <div className="flex gap-2">
            <EnhancedButton
              variant="outlined"
              size="sm"
              leftIcon={<Copy className="w-4 h-4" />}
              onClick={() => copyToClipboard()}
            >
              {copiedId === 'all' ? 'Copied!' : 'Copy All'}
            </EnhancedButton>
            <EnhancedButton
              variant="outlined"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      {Object.entries(groupedResources).map(([category, categoryResources]) => {
        const isExpanded = expandedCategories.has(category);
        const color = categoryColors[category as keyof typeof categoryColors];
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className={`w-full px-4 py-3 flex items-center justify-between
                       bg-gradient-to-r from-${color}-50 to-${color}-100
                       dark:from-${color}-900/20 dark:to-${color}-800/20
                       hover:from-${color}-100 hover:to-${color}-150
                       dark:hover:from-${color}-900/30 dark:hover:to-${color}-800/30
                       transition-colors duration-200`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white dark:bg-gray-700 rounded-lg text-${color}-600 dark:text-${color}-400`}>
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {categoryResources.length} items • 
                    {categoryResources.filter(r => r.required).length} required
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(category);
                  }}
                  className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded"
                >
                  {copiedId === category ? (
                    <Check className="w-4 h-4 text-success-600 dark:text-success-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </button>

            {/* Category Resources */}
            {isExpanded && (
              <div className="p-4 space-y-3">
                {categoryResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border
                             ${resource.required 
                               ? 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20' 
                               : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {resource.name}
                            {resource.quantity && (
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                ({resource.quantity} {resource.unit})
                              </span>
                            )}
                          </h4>
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {resource.description}
                            </p>
                          )}
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Resource
                            </a>
                          )}
                        </div>
                        {resource.required && (
                          <span className="px-2 py-1 text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {categoryResources.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                    No resources in this category
                  </p>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Empty State */}
      {resources.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Resources Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Resources will appear here as you build your project
          </p>
        </div>
      )}

      {/* Print-Friendly Version (Hidden, for printing) */}
      <div className="print:block hidden">
        <h1 className="text-2xl font-bold mb-4">{projectTitle} - Resources</h1>
        {Object.entries(groupedResources).map(([category, categoryResources]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {categoryResources.map(resource => (
                <li key={resource.id}>
                  <strong>{resource.name}</strong>
                  {resource.quantity && ` (${resource.quantity} ${resource.unit})`}
                  {resource.required && ' [REQUIRED]'}
                  {resource.description && (
                    <div className="ml-6 text-sm">{resource.description}</div>
                  )}
                  {resource.url && (
                    <div className="ml-6 text-sm">Link: {resource.url}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceCards;