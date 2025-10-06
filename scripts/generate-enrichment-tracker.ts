import fs from 'node:fs';
import path from 'node:path';
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

type Batch = 'A' | 'B' | 'C';

function decideBatch(opts: {
  aiRatio: number;
  checkpointRatio: number;
  weakScore: number;
  microRubricCount: number;
  noTechFallbackCount: number;
  shortPlanningNotes: boolean;
  studentVoiceGaps: number;
}): Batch {
  const {
    aiRatio,
    checkpointRatio,
    weakScore,
    microRubricCount,
    noTechFallbackCount,
    shortPlanningNotes,
    studentVoiceGaps
  } = opts;

  if (
    aiRatio < 0.5 ||
    checkpointRatio < 0.5 ||
    weakScore >= 4 ||
    microRubricCount < 4 ||
    noTechFallbackCount < 2 ||
    shortPlanningNotes ||
    studentVoiceGaps > 1
  ) {
    return 'A';
  }
  if (
    aiRatio < 0.7 ||
    checkpointRatio < 0.6 ||
    weakScore > 0 ||
    microRubricCount < 5 ||
    studentVoiceGaps > 0
  ) {
    return 'B';
  }
  return 'C';
}

function priorityFor(batch: Batch): 'High' | 'Medium' | 'Low' {
  if (batch === 'A') {return 'High';}
  if (batch === 'B') {return 'Medium';}
  return 'Low';
}

function main() {
  const projects = getAllProjects();
  const PLANNING_NOTES_MIN = 120;

  const rows = projects.map(({ id, project }) => {
    const weekCount = project.runOfShow.length;
    const assignmentCount = project.assignments.length;
    const aiCount = assignmentsWithAI(project.assignments);
    const checkpointCount = weeksWithCheckpoint(project.runOfShow);
    const weakDir = weakDirections(project.assignments);
    const weakWeek = weakWeekBullets(project.runOfShow);
    const studentVoice = successCriteriaNotStudentVoice(project.assignments);
    const planningNotesRaw = project.planningNotes?.trim() ?? '';
    const planningNotesLength = planningNotesRaw.length;
    const shortPlanningNotes = planningNotesLength < PLANNING_NOTES_MIN;
    const microRubricCount = project.polish?.microRubric?.length ?? 0;
    const noTechFallbackCount = project.materialsPrep.noTechFallback.length;
    const knownIds = uniqueAssignmentIds(project.assignments);
    const unknownRefs = project.runOfShow.flatMap(week => referencesUnknownAssignments(week, knownIds));

    const aiRatio = ratio(aiCount, assignmentCount);
    const checkpointRatio = ratio(checkpointCount, weekCount);

    const batch = decideBatch({
      aiRatio,
      checkpointRatio,
      weakScore: weakDir.length + weakWeek.length,
      microRubricCount,
      noTechFallbackCount,
      shortPlanningNotes,
      studentVoiceGaps: studentVoice.length,
    });

    const fieldsNeedingWork: string[] = [];
    if (aiRatio < 0.6) fieldsNeedingWork.push(`aiOptional coverage ${percentage(aiCount, assignmentCount)}%`);
    if (checkpointRatio < 0.6) fieldsNeedingWork.push(`checkpoints ${percentage(checkpointCount, weekCount)}%`);
    if (weakDir.length > 0) fieldsNeedingWork.push(`weak studentDirections ${weakDir.length}`);
    if (weakWeek.length > 0) fieldsNeedingWork.push(`weak week bullets ${weakWeek.length}`);
    if (studentVoice.length > 0) fieldsNeedingWork.push(`student-voice gaps ${studentVoice.length}`);
    if (microRubricCount < 4) fieldsNeedingWork.push(`microRubric short (${microRubricCount})`);
    if (noTechFallbackCount < 2) fieldsNeedingWork.push(`noTechFallback ${noTechFallbackCount}`);
    if (shortPlanningNotes) fieldsNeedingWork.push(`planningNotes short (${planningNotesLength} chars)`);
    if (unknownRefs.length > 0) fieldsNeedingWork.push(`unknown assignment refs ${unknownRefs.length}`);

    return {
      id,
      title: project.hero.title,
      batch,
      priority: priorityFor(batch),
      fieldsNeedingWork: fieldsNeedingWork.join('; '),
      aiPercent: percentage(aiCount, assignmentCount),
      checkpointPercent: percentage(checkpointCount, weekCount),
      microRubricCount,
      noTechFallbackCount,
      planningNotesLength,
      shortPlanningNotes,
      studentVoiceGaps: studentVoice.length,
      weakDirections: weakDir.length,
      weakWeekBullets: weakWeek.length,
    };
  });

  // 1) Generate tracker CSV compatible with template
  const trackerHeader = [
    'Project ID',
    'Project Title',
    'Initial Score',
    'Criterion 1 (Objectives)',
    'Criterion 2 (Assignments)',
    'Criterion 3 (RunOfShow)',
    'Criterion 4 (Assessment)',
    'Criterion 5 (Materials)',
    'Criterion 6 (Audience)',
    'Batch',
    'Priority',
    'Status',
    'Assigned To',
    'Fields Needing Work',
    'Notes',
    'Completion Date'
  ];

  const trackerLines = [trackerHeader.join(',')];
  rows
    .sort((a, b) => (a.batch === b.batch ? a.id.localeCompare(b.id) : a.batch.localeCompare(b.batch)))
    .forEach(r => {
      const line = [
        r.id,
        r.title.replace(/[,\n]/g, ' '),
        '', // Initial Score (manual rubric pass later)
        '', // Criterion 1
        '', // Criterion 2
        '', // Criterion 3
        '', // Criterion 4
        '', // Criterion 5
        '', // Criterion 6
        r.batch,
        r.priority,
        'Not Started',
        '', // Assigned To
        r.fieldsNeedingWork.replace(/[,\n]/g, '; '),
        `AI ${r.aiPercent}%; Checkpoints ${r.checkpointPercent}%; microRubric ${r.microRubricCount}; noTechFallback ${r.noTechFallbackCount}; planningNotes ${r.planningNotesLength} chars${r.shortPlanningNotes ? ' (short)' : ''}; voiceGaps ${r.studentVoiceGaps}; weakDirs ${r.weakDirections}; weakWeek ${r.weakWeekBullets}`.replace(/[,\n]/g, '; '),
        '' // Completion Date
      ].join(',');
      trackerLines.push(line);
    });

  const trackerPath = path.resolve('ENRICHMENT_TRACKER_AUTO.csv');
  fs.writeFileSync(trackerPath, trackerLines.join('\n'));

  // 2) Generate batches summary markdown
  const group: Record<Batch, typeof rows> = { A: [], B: [], C: [] };
  rows.forEach(r => group[r.batch].push(r));
  const md: string[] = [];
  md.push('# Enrichment Batches');
  md.push('');
  (['A', 'B', 'C'] as Batch[]).forEach(batch => {
    const items = group[batch];
    md.push(`## Batch ${batch} (${items.length})`);
    if (items.length === 0) { md.push('None'); md.push(''); return; }
    items
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach(item => {
        md.push(`- ${item.id} — ${item.title} (AI ${item.aiPercent}%, Checkpoints ${item.checkpointPercent}%)`);
      });
    md.push('');
  });
  md.push('');
  md.push('Auto-generated from scripts/generate-enrichment-tracker.ts');
  const mdPath = path.resolve('ENRICHMENT_BATCHES.md');
  fs.writeFileSync(mdPath, md.join('\n'));

  console.log(`Wrote ${trackerPath}`);
  console.log(`Wrote ${mdPath}`);
}

main();
