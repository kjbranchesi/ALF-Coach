const fs = require('fs');
const path = require('path');

const showcaseDir = path.join(__dirname, '..', 'src', 'data', 'showcaseV2');

function ensureSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function lowerFirst(text) {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function escapeSingleQuotes(text) {
  return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildWeekFocus(focus, teacherBlock, studentBlock) {
  const teacherMatch = teacherBlock.match(/'([^']+)'/);
  const studentMatch = studentBlock.match(/'([^']+)'/);
  const teacherLine = teacherMatch ? teacherMatch[1] : '';
  const studentLine = studentMatch ? studentMatch[1] : '';
  const sentence1 = ensureSentence(focus);
  const sentence2 = teacherLine ? ` Teachers ${lowerFirst(teacherLine)}.` : '';
  const sentence3 = studentLine ? ` Students ${lowerFirst(studentLine)}.` : '';
  const combined = `${sentence1}${sentence2}${sentence3}`.trim();
  return escapeSingleQuotes(combined);
}

function buildAssignmentSummary(summary, studentBlock, teacherBlock) {
  const studentMatch = studentBlock.match(/'([^']+)'/);
  const teacherMatch = teacherBlock.match(/'([^']+)'/);
  const studentLine = studentMatch ? studentMatch[1] : '';
  const teacherLine = teacherMatch ? teacherMatch[1] : '';
  const sentence1 = ensureSentence(summary);
  const sentence2 = studentLine ? ` Students ${lowerFirst(studentLine)}.` : '';
  const sentence3 = teacherLine ? ` Teachers ${lowerFirst(teacherLine)}.` : '';
  const combined = `${sentence1}${sentence2}${sentence3}`.trim();
  return escapeSingleQuotes(combined);
}

fs.readdirSync(showcaseDir)
  .filter(file => file.endsWith('.showcase.ts'))
  .forEach(file => {
    const fullPath = path.join(showcaseDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/focus: '([^']*)',\s+teacher: \[(.*?)\],\s+students: \[(.*?)\],/gs, (match, focus, teacherBlock, studentBlock) => {
      const newFocus = buildWeekFocus(focus, teacherBlock, studentBlock);
      return `focus: '${newFocus}',\n      teacher: [${teacherBlock}],\n      students: [${studentBlock}],`;
    });

    content = content.replace(/summary: '([^']*)',\s+studentDirections: \[(.*?)\],\s+teacherSetup: \[(.*?)\],/gs, (match, summary, studentBlock, teacherBlock) => {
      const newSummary = buildAssignmentSummary(summary, studentBlock, teacherBlock);
      return `summary: '${newSummary}',\n      studentDirections: [${studentBlock}],\n      teacherSetup: [${teacherBlock}],`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
  });

console.log('Updated week focuses and assignment summaries.');
