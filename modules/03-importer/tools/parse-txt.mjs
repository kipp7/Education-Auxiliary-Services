import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/parse-txt.mjs <file> [--category <path>]');
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
  // Supports: "A. ...", "A、...", "A ..." (space after key)
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
    // Accept: "AC", "A,C", "A C"
    const letters = v
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .filter(Boolean);
    return letters.join('');
  }

  // single
  const m = v.toUpperCase().match(/[A-Z]/);
  return m ? m[0] : v;
}

function detectTypeFromAnswer(rawAnswer) {
  if (rawAnswer == null) return null;
  const v = String(rawAnswer).trim();
  if (!v) return null;

  const upperLetters = v.toUpperCase().replace(/[^A-Z]/g, '');
  if (upperLetters.length >= 2) return 'multi';

  const lower = v.toLowerCase();
  if (['true', 'false', 't', 'f', '对', '错', '正确', '错误'].includes(lower)) return 'judge';

  return 'single';
}

function parseBlock(block, filePath, categoryPath, index) {
  const lines = normalizeNewlines(block.raw).split('\n');

  const options = [];
  const stemLines = [];
  const analysisLines = [];

  let state = 'stem';
  let rawAnswer = null;

  for (const line of lines) {
    const answer = parseLabelValue(line, ['Answer', '答案']);
    if (answer != null) {
      rawAnswer = answer;
      state = 'afterAnswer';
      continue;
    }

    const analysis = parseLabelValue(line, ['Analysis', '解析']);
    if (analysis != null) {
      analysisLines.push(analysis);
      state = 'analysis';
      continue;
    }

    if (state === 'analysis') {
      analysisLines.push(line.trimEnd());
      continue;
    }

    const opt = parseOptionLine(line);
    if (opt) {
      options.push(opt);
      continue;
    }

    // Default: part of stem
    stemLines.push(line.trimEnd());
  }

  const inferredType = options.length === 0 ? 'judge' : detectTypeFromAnswer(rawAnswer) ?? 'single';
  const type = options.length === 0 ? 'judge' : inferredType;

  return {
    id: `q-${String(index).padStart(4, '0')}`,
    type,
    stem: stemLines.join('\n').trim(),
    options: options.length ? options : undefined,
    answer: { value: normalizeAnswerValue(type, rawAnswer) },
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
          filePath,
          line: block.startLine,
        });
        continue;
      }
      if ((q.type === 'single' || q.type === 'multi') && (!q.options || q.options.length < 2)) {
        errors.push({
          code: 'PARSE_ERROR',
          message: 'Missing options (need >=2)',
          filePath,
          line: block.startLine,
        });
        continue;
      }
      if (!q.answer?.value) {
        errors.push({
          code: 'PARSE_ERROR',
          message: 'Missing answer',
          filePath,
          line: block.startLine,
        });
        continue;
      }
      questions.push(q);
    } catch (e) {
      errors.push({
        code: 'PARSE_ERROR',
        message: e?.message || String(e),
        filePath,
        line: block.startLine,
      });
    }
  }

  return { questions, errors };
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

let file = null;
let category = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--category') {
    category = args[i + 1] || '';
    i++;
    continue;
  }
  if (!file) file = a;
}
if (!file) usage();

const abs = path.resolve(process.cwd(), file);
const text = fs.readFileSync(abs, 'utf8');
const { questions, errors } = parseTextFile(text, path.normalize(file).replace(/\\/g, '/'), category);

const result = {
  file: { path: path.normalize(file).replace(/\\/g, '/') },
  categoryPath: category || undefined,
  questions,
  errors,
};

process.stdout.write(JSON.stringify(result, null, 2));
