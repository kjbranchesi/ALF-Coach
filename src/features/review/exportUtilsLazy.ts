/**
 * Lazy-loaded export utilities
 * Reduces initial bundle by ~450KB by loading PDF libraries only when needed
 */

import { type EnhancedBlueprintDoc } from '../../types/blueprint';

// Use the enhanced blueprint type
type BlueprintDoc = EnhancedBlueprintDoc;

/**
 * Export to Markdown - lightweight, no external dependencies
 */
export async function exportToMarkdown(blueprint: BlueprintDoc): Promise<void> {
  if (import.meta.env?.VITE_ENABLE_DOWNLOADS !== 'true') {
    throw new Error('Downloads disabled');
  }
  // Markdown export doesn't need heavy libraries
  const { exportToMarkdown: originalExport } = await import('./exportUtils');
  return originalExport(blueprint);
}

/**
 * Export to PDF - lazy loads heavy PDF libraries only when needed
 */
export async function exportToPDF(blueprint: BlueprintDoc): Promise<void> {
  if (import.meta.env?.VITE_PDF_EXPORT_ENABLED !== 'true') {
    throw new Error('PDF export is disabled');
  }
  console.log('[Performance] Lazy loading PDF libraries...');
  
  // Show loading indicator while libraries load
  const loadingToast = document.createElement('div');
  loadingToast.textContent = 'Loading PDF generator...';
  loadingToast.className = 'fixed top-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  document.body.appendChild(loadingToast);
  
  try {
    // Dynamically import the heavy PDF export function
    const { exportToPDF: originalExport } = await import('./exportUtils');
    
    // Remove loading indicator
    loadingToast.remove();
    
    // Call the original export function
    return await originalExport(blueprint);
  } catch (error) {
    loadingToast.remove();
    console.error('[PDF Export] Failed to load PDF libraries:', error);
    throw error;
  }
}

/**
 * Export to Google Docs - lazy loads when needed
 */
export async function exportToGoogleDocs(blueprint: BlueprintDoc): Promise<void> {
  const { exportToGoogleDocs: originalExport } = await import('./exportUtils');
  return originalExport(blueprint);
}

/**
 * Export blueprint data - lightweight
 */
export async function exportBlueprintData(blueprint: BlueprintDoc): Promise<void> {
  if (import.meta.env?.VITE_ENABLE_DOWNLOADS !== 'true') {
    throw new Error('Downloads disabled');
  }
  // This is just JSON, no heavy libraries needed
  const dataStr = JSON.stringify(blueprint, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `blueprint-${blueprint.id || 'export'}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
