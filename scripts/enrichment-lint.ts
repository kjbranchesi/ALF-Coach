import {
  assignmentsWithAI,
  bulletTooLong,
  getAllProjects,
  hasStrongOutcomeVerb,
  percentage,
  ratio,
  successCriteriaNotStudentVoice,
  uniqueAssignmentIds,
  weakDirections,
  weakWeekBullets,
  weeksWithCheckpoint,
  wordCount,
  referencesUnknownAssignments
} from './enrichment-utils';

const MAX_BULLET_WORDS = 12;
const MIN_STUDENT_DIRECTIONS = 5;
const MAX_STUDENT_DIRECTIONS = 7;
const MIN_AI_RATIO = 0.6;
const MIN_CHECKPOINT_RATIO = 0.6;
const MIN_NO_TECH = 2;
const MIN_MICRO_RUBRIC = 4;
const MAX_MICRO_RUBRIC = 6;
const MIN_PROJECT_CHECKPOINTS = 2;
const MIN_PLANNING_NOTES_CHARS = 120;

function main() {
  const errors: string[] = [];
  const projects = getAllProjects();

  projects.forEach(({ id, path, project }) => {
    const header = `[${id}]`;

    project.outcomes.core.forEach(outcome => {
      if (!hasStrongOutcomeVerb(outcome)) {
        errors.push(`${header} outcomes.core missing strong verb: "${outcome}" (${path})`);
      }
    });

    const assignmentCount = project.assignments.length;
    const aiCount = assignmentsWithAI(project.assignments);
    const aiRatio = ratio(aiCount, assignmentCount);
    if (aiRatio < MIN_AI_RATIO) {
      errors.push(`${header} only ${percentage(aiCount, assignmentCount)}% assignments include aiOptional (target ${MIN_AI_RATIO * 100}%+) (${path})`);
    }

    project.assignments.forEach(assignment => {
      if (assignment.studentDirections.length < MIN_STUDENT_DIRECTIONS || assignment.studentDirections.length > MAX_STUDENT_DIRECTIONS) {
        errors.push(`${header} assignment ${assignment.id} has ${assignment.studentDirections.length} studentDirections (expected ${MIN_STUDENT_DIRECTIONS}-${MAX_STUDENT_DIRECTIONS}) (${path})`);
      }
      const longDirections = bulletTooLong(assignment.studentDirections, MAX_BULLET_WORDS);
      longDirections.forEach(value => {
        errors.push(`${header} assignment ${assignment.id} direction exceeds ${MAX_BULLET_WORDS} words: "${value}" (${path})`);
      });
      const weakDirectionIssues = weakDirections([assignment]);
      weakDirectionIssues.forEach(issue => {
        errors.push(`${header} assignment ${issue.assignmentId} direction needs stronger verb: "${issue.value}" (${path})`);
      });
      const longTeacherSetup = bulletTooLong(assignment.teacherSetup, MAX_BULLET_WORDS);
      longTeacherSetup.forEach(value => {
        errors.push(`${header} assignment ${assignment.id} teacherSetup exceeds ${MAX_BULLET_WORDS} words: "${value}" (${path})`);
      });
      const longEvidence = bulletTooLong(assignment.evidence, MAX_BULLET_WORDS);
      longEvidence.forEach(value => {
        if (wordCount(value) > MAX_BULLET_WORDS) {
          errors.push(`${header} assignment ${assignment.id} evidence exceeds ${MAX_BULLET_WORDS} words: "${value}" (${path})`);
        }
      });
    });

    const studentVoiceIssues = successCriteriaNotStudentVoice(project.assignments);
    studentVoiceIssues.forEach(issue => {
      errors.push(`${header} assignment ${issue.assignmentId} successCriteria missing student voice: "${issue.value}" (${path})`);
    });

    const weekCount = project.runOfShow.length;
    const checkpointCount = weeksWithCheckpoint(project.runOfShow);
    const checkpointRatio = ratio(checkpointCount, weekCount);
    if (checkpointRatio < MIN_CHECKPOINT_RATIO) {
      errors.push(`${header} checkpoints cover ${percentage(checkpointCount, weekCount)}% of weeks (target ${MIN_CHECKPOINT_RATIO * 100}%+) (${path})`);
    }

    project.runOfShow.forEach(week => {
      const longTeacher = bulletTooLong(week.teacher, MAX_BULLET_WORDS);
      longTeacher.forEach(value => {
        errors.push(`${header} ${week.weekLabel} teacher bullet exceeds ${MAX_BULLET_WORDS} words: "${value}" (${path})`);
      });
      const longStudent = bulletTooLong(week.students, MAX_BULLET_WORDS);
      longStudent.forEach(value => {
        errors.push(`${header} ${week.weekLabel} student bullet exceeds ${MAX_BULLET_WORDS} words: "${value}" (${path})`);
      });
      weakWeekBullets([week]).forEach(issue => {
        errors.push(`${header} ${issue.weekLabel} ${issue.role} bullet needs stronger verb: "${issue.value}" (${path})`);
      });
    });

    const planningNotesText = project.planningNotes?.trim() ?? '';
    if (planningNotesText.length < MIN_PLANNING_NOTES_CHARS) {
      errors.push(`${header} planningNotes under ${MIN_PLANNING_NOTES_CHARS} chars (${planningNotesText.length}) (${path})`);
    }

    if (project.materialsPrep.noTechFallback.length < MIN_NO_TECH) {
      errors.push(`${header} noTechFallback has ${project.materialsPrep.noTechFallback.length} entries (need ${MIN_NO_TECH}+) (${path})`);
    }

    const microRubricLength = project.polish?.microRubric?.length ?? 0;
    if (microRubricLength < MIN_MICRO_RUBRIC || microRubricLength > MAX_MICRO_RUBRIC) {
      errors.push(`${header} microRubric has ${microRubricLength} criteria (expected ${MIN_MICRO_RUBRIC}-${MAX_MICRO_RUBRIC}) (${path})`);
    }

    const polishCheckpoints = project.polish?.checkpoints?.length ?? 0;
    if (polishCheckpoints < MIN_PROJECT_CHECKPOINTS) {
      errors.push(`${header} polish.checkpoints has ${polishCheckpoints} entries (need ${MIN_PROJECT_CHECKPOINTS}+) (${path})`);
    }

    const knownIds = uniqueAssignmentIds(project.assignments);
    project.runOfShow.forEach(week => {
      const unknown = referencesUnknownAssignments(week, knownIds);
      unknown.forEach(value => {
        errors.push(`${header} ${week.weekLabel} references unknown assignment id "${value}" (${path})`);
      });
    });
  });

  if (errors.length > 0) {
    console.error('Enrichment lint found issues:');
    errors.forEach(error => {
      console.error(`- ${error}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log('Enrichment lint passed. Portfolio meets enrichment definition of done.');
}

main();
