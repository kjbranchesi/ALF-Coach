/**
 * Shared type definitions for PBL stage tracking
 * Extracted from ProgressSidebar.tsx for reusability
 */

import { ReactNode } from 'react';

export interface Stage {
  id: string;
  label: string;
  icon: ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  substeps?: SubStep[];
}

export interface SubStep {
  id: string;
  label: string;
  completed: boolean;
}
