import {
  assignmentsWithAI,
  getAllProjects,
  percentage,
  ratio,
  successCriteriaNotStudentVoice,
  weakDirections,
  weakWeekBullets,
  weeksWithCheckpoint,
  uniqueAssignmentIds,
  referencesUnknownAssignments
} from './enrichment-utils';

interface MetricsRow {
  id: string;
  title: string;
  batch: 'A' | 'B' | 'C';
  weekCount: number;
  assignments: number;
  aiCount: number;
  aiPercent: number;
  checkpointCount: number;
  checkpointPercent: number;
  weakDirections: number;
  weakWeekBullets: number;
  studentVoiceGaps: number;
  missingPlanningNotes: boolean;
  microRubricCount: number;
  noTechFallbackCount: number;
  safetyEthicsCount: number;
  unknownAssignments: number;
}

type MetricsInput = Omit<MetricsRow, 'batch'>;

function decideBatch(row: MetricsInput): 'A' | 'B' | 'C' {
  const aiRatio = ratio(row.aiCount, row.assignments);
  const checkpointRatio = ratio(row.checkpointCount, row.weekCount);
  const weakScore = row.weakDirections + row.weakWeekBullets;
  const needsMicroRubric = row.microRubricCount < 4;
  const needsFallback = row.noTechFallbackCount < 2;
  const needsSafety = row.safetyEthicsCount === 0;
  const needsPlanning = row.missingPlanningNotes;
  const needsStudentVoice = row.studentVoiceGaps > 1;

  if (
    aiRatio < 0.5 ||
    checkpointRatio < 0.5 ||
    weakScore >= 4 ||
    needsMicroRubric ||
    needsFallback ||
    needsSafety ||
    needsPlanning ||
    needsStudentVoice
  ) {
    return 'A';
  }
  if (
    aiRatio < 0.7 ||
    checkpointRatio < 0.6 ||
    weakScore > 0 ||
    row.studentVoiceGaps > 0 ||
    row.microRubricCount < 5
  ) {
    return 'B';
  }
  return 'C';
}

function main() {
  const projects = getAllProjects();

  const rows: MetricsRow[] = projects.map(({ id, project }) => {
    const assignmentCount = project.assignments.length;
    const aiCount = assignmentsWithAI(project.assignments);
    const weekCount = project.runOfShow.length;
    const checkpointCount = weeksWithCheckpoint(project.runOfShow);
    const weakDirectionIssues = weakDirections(project.assignments);
    const weakWeekIssues = weakWeekBullets(project.runOfShow);
    const studentVoiceIssues = successCriteriaNotStudentVoice(project.assignments);
    const planningNotesMissing = !project.planningNotes || project.planningNotes.trim().length === 0;
    const microRubricCount = project.polish?.microRubric?.length ?? 0;
    const noTechFallbackCount = project.materialsPrep.noTechFallback.length;
    const safetyEthicsCount = project.materialsPrep.safetyEthics.length;
    const knownAssignmentIds = uniqueAssignmentIds(project.assignments);
    const unknownAssignmentRefs = project.runOfShow.flatMap(week => referencesUnknownAssignments(week, knownAssignmentIds)).length;

    const aiPercent = percentage(aiCount, assignmentCount);
    const checkpointPercent = percentage(checkpointCount, weekCount);

    const baseRow: MetricsInput = {
      id,
      title: project.hero.title,
      weekCount,
      aiPercent,
      checkpointPercent,
      assignments: assignmentCount,
      aiCount,
      checkpointCount,
      weakDirections: weakDirectionIssues.length,
      weakWeekBullets: weakWeekIssues.length,
      studentVoiceGaps: studentVoiceIssues.length,
      missingPlanningNotes: planningNotesMissing,
      microRubricCount,
      noTechFallbackCount,
      safetyEthicsCount,
      unknownAssignments: unknownAssignmentRefs
    };

    const batch = decideBatch(baseRow);

    return {
      ...baseRow,
      batch
    };
  });

  rows.sort((a, b) => a.batch.localeCompare(b.batch) || a.id.localeCompare(b.id));

  console.log('Project Enrichment Audit (ProjectShowcaseV2)');
  console.log('='.repeat(80));
  console.log('id,batch,aiPercent,checkpointPercent,weakDirections,weakWeekBullets,studentVoiceGaps,microRubric,noTechFallback,planningNotes,safetyEthics,unknownAssignmentRefs');
  rows.forEach(row => {
    const planningStatus = row.missingPlanningNotes ? 'missing' : 'ok';
    const safetyStatus = row.safetyEthicsCount > 0 ? 'ok' : 'missing';
    console.log([
      row.id,
      row.batch,
      row.aiPercent,
      row.checkpointPercent,
      row.weakDirections,
      row.weakWeekBullets,
      row.studentVoiceGaps,
      row.microRubricCount,
      row.noTechFallbackCount,
      planningStatus,
      safetyStatus,
      row.unknownAssignments
    ].join(','));
  });

  const batchGroups = rows.reduce<Record<'A' | 'B' | 'C', MetricsRow[]>>(
    (acc, row) => {
      acc[row.batch].push(row);
      return acc;
    },
    { A: [], B: [], C: [] }
  );

  const avgAiPercent = Math.round(rows.reduce((sum, row) => sum + row.aiPercent, 0) / rows.length);
  const avgCheckpointPercent = Math.round(rows.reduce((sum, row) => sum + row.checkpointPercent, 0) / rows.length);
  const totalWeakDirections = rows.reduce((sum, row) => sum + row.weakDirections, 0);
  const totalWeakWeekBullets = rows.reduce((sum, row) => sum + row.weakWeekBullets, 0);
  const totalStudentVoice = rows.reduce((sum, row) => sum + row.studentVoiceGaps, 0);

  console.log('\nBatch Assignments');
  console.log('------------------');
  (['A', 'B', 'C'] as const).forEach(batch => {
    const items = batchGroups[batch].map(row => row.id);
    console.log(`Batch ${batch} (${items.length}): ${items.join(', ')}`);
  });

  console.log('\nPortfolio Stats');
  console.log('----------------');
  console.log(`Average AI coverage: ${avgAiPercent}%`);
  console.log(`Average checkpoint coverage: ${avgCheckpointPercent}%`);
  console.log(`Total weak student directions: ${totalWeakDirections}`);
  console.log(`Total weak week bullets: ${totalWeakWeekBullets}`);
  console.log(`Assignments missing student voice criteria: ${totalStudentVoice}`);
}

main();
