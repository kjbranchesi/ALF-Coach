/**
 * Stage components barrel export
 * Only export components that are actually used to reduce bundle size
 */

// Core stages
export { StageInitiator } from './StageInitiator';
export { EnhancedStageInitiator } from './EnhancedStageInitiator';
export { StepPrompt } from './StepPrompt';
export { StageClarifier } from './StageClarifier';

// Journey stages
export { JourneyDetailsStage } from './JourneyDetailsStage';
export { MethodSelectionStage } from './MethodSelectionStage';
export { LearningJourneyBuilderEnhanced } from './LearningJourneyBuilderEnhanced';

// Activity and Resource stages
export { ActivityBuilderEnhanced } from './ActivityBuilderEnhanced';
export { ResourceSelector } from './ResourceSelector';

// Assessment stages
export { RubricStage } from './RubricStage';
export { RubricBuilderEnhanced } from './RubricBuilderEnhanced';

// Additional stage components (only export those actually used)
export { JourneyPhaseSelectorDraggable } from './JourneyPhaseSelectorDraggable';
export { MilestoneSelectorDraggable } from './MilestoneSelectorDraggable';
export { ImpactDesignerEnhanced } from './ImpactDesignerEnhanced';

// Commented out unused exports to reduce bundle size:
// export { JourneyPhaseSelector } from './JourneyPhaseSelector';
// export { ActivityBuilder } from './ActivityBuilder';
// export { MilestoneSelector } from './MilestoneSelector';
// export { RubricBuilder } from './RubricBuilder';
// export { ImpactDesigner } from './ImpactDesigner';