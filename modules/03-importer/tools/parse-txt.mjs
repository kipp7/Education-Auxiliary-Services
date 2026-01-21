import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/parse-txt.mjs <file> [--category <path>] [--out <jsonFile>]');
  process.exit(2);
}

function normalizeNewlines(s) {
  return s.replace(/\r\n/g, '\n');
}

function splitBlocks(text) {
  const blocks = [];
  const lines = normalizeNewlines(text).split('\n');

  let current = [];
  let startLine = 1;

  function flush(endLine) {
    const trimmed = current.join('\n').trim();
    if (trimmed) {
      blocks.push({ startLine, endLine, raw: current.join('\n') });
    }
    current = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.trim() === '') {
      flush(lineNo);
      startLine = lineNo + 1;
      continue;
    }
    current.push(line);
  }
  flush(lines.length);
  return blocks;
}

function parseOptionLine(line) {
  const m = line.match(/^\s*([A-Z])\s*(?:[\.、]|\s)\s*(.+?)\s*$/);
  if (!m) return null;
  return { key: m[1], text: m[2] };
}

function parseLabelValue(line, labels) {
  const escaped = labels.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`^\\s*(?:${escaped.join('|')})\\s*[:：]\\s*(.+?)\\s*$`, 'i');
  const m = line.match(re);
  return m ? m[1] : null;
}

function normalizeAnswerValue(type, raw) {
  if (raw == null) return null;
  const v = String(raw).trim();
  if (!v) return null;

  if (type === 'judge') {
    const lower = v.toLowerCase();
    if (['true', 't', 'yes', 'y', '对', '正确'].includes(lower)) return 'true';
    if (['false', 'f', 'no', 'n', '错', '错误'].includes(lower)) return 'false';
    return v;
  }

  if (type === 'multi') {
    const letters = v
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .filter(Boolean);
    return letters.join('');
  }

  if (type === 'single') {
    const m = v.toUpperCase().match(/[A-Z]/);
    return m ? m[0] : v;
  }

  return v;
}

function detectChoiceTypeFromAnswer(rawAnswer) {
  if (rawAnswer == null) return 'single';
  const v = String(rawAnswer).trim();
  if (!v) return 'single';
  const letters = v.toUpperCase().replace(/[^A-Z]/g, '');
  return letters.length >= 2 ? 'multi' : 'single';
}

function detectExplicitType(rawType) {
  if (!rawType) return null;
  const v = String(rawType).trim().toLowerCase();
  if (['single', '单选'].includes(v)) return 'single';
  if (['multi', '多选'].includes(v)) return 'multi';
  if (['judge', '判断'].includes(v)) return 'judge';
  if (['blank', '填空'].includes(v)) return 'blank';
  if (['essay', '论述', '大题', '简答'].includes(v)) return 'essay';
  return null;
}

function parseBlock(block, filePath, categoryPath, index) {
  const lines = normalizeNewlines(block.raw).split('\n');

  const options = [];
  const stemLines = [];
  const analysisLines = [];

  let rawAnswer = null;
  let rawType = null;
  let inAnalysis = false;

  for (const line of lines) {
    const type = parseLabelValue(line, ['Type', '题型']);
    if (type != null) {
      rawType = type;
      continue;
    }

    const answer = parseLabelValue(line, ['Answer', '答案']);
    if (answer != null) {
      rawAnswer = answer;
      continue;
    }

    const analysis = parseLabelValue(line, ['Analysis', '解析']);
    if (analysis != null) {
      analysisLines.push(analysis);
      inAnalysis = true;
      continue;
    }

    if (inAnalysis) {
      analysisLines.push(line.trimEnd());
      continue;
    }

    const opt = parseOptionLine(line);
    if (opt) {
      options.push(opt);
      continue;
    }

    stemLines.push(line.trimEnd());
  }

  const explicit = detectExplicitType(rawType);
  const type = explicit ?? (options.length > 0 ? detectChoiceTypeFromAnswer(rawAnswer) : rawAnswer && String(rawAnswer).match(/^(对|错|正确|错误|true|false)$/i) ? 'judge' : 'essay');

  return {
    id: `q-${String(index).padStart(4, '0')}`,
    type,
    stem: stemLines.join('\n').trim(),
    options: options.length ? options : undefined,
    answer: { value: normalizeAnswerValue(type, rawAnswer) ?? '' },
    analysis: analysisLines.join('\n').trim() || undefined,
    source: {
      filePath,
      lineStart: block.startLine,
      lineEnd: block.endLine,
    },
    categoryPath: categoryPath || undefined,
  };
}

function parseTextFile(text, filePath, categoryPath) {
  const blocks = splitBlocks(text);
  const errors = [];
  const questions = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    try {
      const q = parseBlock(block, filePath, categoryPath, i + 1);
      if (!q.stem) {
        errors.push({
          code: 'PARSE_ERROR',
          message: 'Missing stem',
          suggestion: 'Add a non-empty question stem before options/answer.',
          filePath,
          line: block.startLine,
          lineStart: block.startLine,
          lineEnd: block.endLine,
        });
        continue;
      }
      if ((q.type === 'single' || q.type === 'multi') && (!q.options || q.options.length < 2)) {
        errors.push({
          code: 'PARSE_ERROR',
          message: 'Missing options (need >=2)',
          suggestion: 'Provide at least two options like "A. ..." and "B. ...".',
          filePath,
          line: block.startLine,
          lineStart: block.startLine,
          lineEnd: block.endLine,
        });
        continue;
      }
      if (!q.answer?.value) {
        errors.push({
          code: 'PARSE_ERROR',
          message: 'Missing answer',
          suggestion: 'Add a line like "答案：B" (choice) or "答案：对" (judge).',
          filePath,
          line: block.startLine,
          lineStart: block.startLine,
          lineEnd: block.endLine,
        });
        continue;
      }
      questions.push(q);
    } catch (e) {
      errors.push({
        code: 'PARSE_ERROR',
        message: e?.message || String(e),
        suggestion: 'Check the formatting of this question block.',
        filePath,
        line: block.startLine,
        lineStart: block.startLine,
        lineEnd: block.endLine,
      });
    }
  }

  return { questions, errors };
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

let file = null;
let category = '';
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--category') {
    category = args[i + 1] || '';
    i++;
    continue;
  }
  if (a === '--out') {
    outFile = args[i + 1] || '';
    i++;
    continue;
  }
  if (!file) file = a;
}
if (!file) usage();

const abs = path.resolve(process.cwd(), file);
const text = fs.readFileSync(abs, 'utf8');
const shownPath = path.normalize(file).replace(/\\/g, '/');
const { questions, errors } = parseTextFile(text, shownPath, category);

const result = {
  file: { path: shownPath },
  categoryPath: category || undefined,
  questions,
  errors,
};

const json = JSON.stringify(result, null, 2);
if (outFile) {
  const outAbs = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outAbs, json, 'utf8');
} else {
  process.stdout.write(json);
}
