import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/validate-ir.mjs <jsonFile>');
  process.exit(2);
}

function decodeTextFile(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le');
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8');
  }

  const sample = buf.subarray(0, Math.min(buf.length, 2048));
  let nulCount = 0;
  for (const b of sample) if (b === 0x00) nulCount++;
  if (nulCount > sample.length * 0.1) {
    return buf.toString('utf16le');
  }
  return buf.toString('utf8');
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function pushError(errors, pathStr, message) {
  errors.push({ path: pathStr, message });
}

function validateOption(opt, idx, errors, basePath) {
  if (opt == null || typeof opt !== 'object') {
    pushError(errors, `${basePath}.options[${idx}]`, 'Option must be an object.');
    return;
  }
  if (!isNonEmptyString(opt.key)) pushError(errors, `${basePath}.options[${idx}].key`, 'Option key is required.');
  if (typeof opt.text !== 'string') pushError(errors, `${basePath}.options[${idx}].text`, 'Option text must be a string.');
}

function validateQuestion(q, idx, errors) {
  const basePath = `questions[${idx}]`;
  if (q == null || typeof q !== 'object') {
    pushError(errors, basePath, 'Question must be an object.');
    return;
  }

  if (!isNonEmptyString(q.id)) pushError(errors, `${basePath}.id`, 'id is required.');

  const allowedTypes = new Set(['single', 'multi', 'judge', 'blank', 'essay']);
  if (!isNonEmptyString(q.type) || !allowedTypes.has(q.type)) {
    pushError(errors, `${basePath}.type`, `type must be one of: ${Array.from(allowedTypes).join(', ')}.`);
  }

  if (!isNonEmptyString(q.stem)) pushError(errors, `${basePath}.stem`, 'stem is required.');

  if (q.answer == null || typeof q.answer !== 'object') {
    pushError(errors, `${basePath}.answer`, 'answer object is required.');
  } else if (!isNonEmptyString(q.answer.value)) {
    pushError(errors, `${basePath}.answer.value`, 'answer.value is required.');
  }

  if (q.source == null || typeof q.source !== 'object') {
    pushError(errors, `${basePath}.source`, 'source object is required.');
  } else {
    if (!isNonEmptyString(q.source.filePath)) pushError(errors, `${basePath}.source.filePath`, 'source.filePath is required.');
    if (q.source.lineStart != null && (!Number.isInteger(q.source.lineStart) || q.source.lineStart < 1)) {
      pushError(errors, `${basePath}.source.lineStart`, 'source.lineStart must be an integer >= 1.');
    }
    if (q.source.lineEnd != null && (!Number.isInteger(q.source.lineEnd) || q.source.lineEnd < 1)) {
      pushError(errors, `${basePath}.source.lineEnd`, 'source.lineEnd must be an integer >= 1.');
    }
  }

  if (q.type === 'single' || q.type === 'multi') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      pushError(errors, `${basePath}.options`, 'options must be an array with >= 2 items for single/multi.');
    } else {
      q.options.forEach((opt, j) => validateOption(opt, j, errors, basePath));
    }
  } else if (q.options != null) {
    if (!Array.isArray(q.options)) {
      pushError(errors, `${basePath}.options`, 'options must be an array when provided.');
    }
  }

  if (q.score != null && !isFiniteNumber(q.score)) {
    pushError(errors, `${basePath}.score`, 'score must be a number.');
  }
  if (q.difficulty != null && typeof q.difficulty !== 'string') {
    pushError(errors, `${basePath}.difficulty`, 'difficulty must be a string.');
  }
  if (q.analysis != null && typeof q.analysis !== 'string') {
    pushError(errors, `${basePath}.analysis`, 'analysis must be a string.');
  }
  if (q.categoryPath != null && typeof q.categoryPath !== 'string') {
    pushError(errors, `${basePath}.categoryPath`, 'categoryPath must be a string.');
  }
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

const file = args[0];
const abs = path.resolve(process.cwd(), file);
const buf = fs.readFileSync(abs);
const raw = decodeTextFile(buf);
const data = JSON.parse(raw);

const questions = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : null;
if (!questions) {
  console.error(JSON.stringify({ ok: false, error: 'Input must be an array of questions or { questions: [...] }' }, null, 2));
  process.exit(1);
}

const errors = [];
questions.forEach((q, i) => validateQuestion(q, i, errors));

const result = {
  ok: errors.length === 0,
  input: file.replace(/\\/g, '/'),
  totalQuestions: questions.length,
  errorCount: errors.length,
  errors,
};

process.stdout.write(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
