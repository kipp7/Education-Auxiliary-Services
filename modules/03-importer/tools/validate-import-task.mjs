import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/validate-import-task.mjs <import-task.json> [--out <jsonFile>]');
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
  if (nulCount > sample.length * 0.1) return buf.toString('utf16le');
  return buf.toString('utf8');
}

function pushError(errors, pathStr, message) {
  errors.push({ path: pathStr, message });
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isInt(v) {
  return Number.isInteger(v);
}

function validateImportTask(task) {
  const errors = [];
  const base = '';

  if (task == null || typeof task !== 'object') {
    pushError(errors, base || '.', 'Task must be an object.');
    return errors;
  }

  if (!isNonEmptyString(task.id)) pushError(errors, 'id', 'id is required.');

  const allowedStatus = new Set(['queued', 'running', 'done', 'failed']);
  if (!isNonEmptyString(task.status) || !allowedStatus.has(task.status)) {
    pushError(errors, 'status', `status must be one of: ${Array.from(allowedStatus).join(', ')}.`);
  }

  if (!isInt(task.progress) || task.progress < 0 || task.progress > 100) {
    pushError(errors, 'progress', 'progress must be an integer between 0 and 100.');
  }

  if (task.stage != null && typeof task.stage !== 'string') pushError(errors, 'stage', 'stage must be a string.');
  if (task.createdAt != null && typeof task.createdAt !== 'string') pushError(errors, 'createdAt', 'createdAt must be a string.');
  if (task.updatedAt != null && typeof task.updatedAt !== 'string') pushError(errors, 'updatedAt', 'updatedAt must be a string.');

  if (task.result != null) {
    if (typeof task.result !== 'object') {
      pushError(errors, 'result', 'result must be an object.');
    } else {
      for (const k of ['parsedCount', 'importedCount', 'skippedCount', 'errorCount']) {
        if (task.result[k] != null && (!isInt(task.result[k]) || task.result[k] < 0)) {
          pushError(errors, `result.${k}`, `${k} must be an integer >= 0.`);
        }
      }
    }
  }

  if (task.errors != null) {
    if (!Array.isArray(task.errors)) {
      pushError(errors, 'errors', 'errors must be an array.');
    } else {
      task.errors.forEach((e, i) => {
        const p = `errors[${i}]`;
        if (e == null || typeof e !== 'object') {
          pushError(errors, p, 'error item must be an object.');
          return;
        }
        if (!isNonEmptyString(e.code)) pushError(errors, `${p}.code`, 'code is required.');
        if (!isNonEmptyString(e.message)) pushError(errors, `${p}.message`, 'message is required.');
        if (e.file != null && typeof e.file !== 'string') pushError(errors, `${p}.file`, 'file must be a string.');
        if (e.line != null && (!isInt(e.line) || e.line < 1)) pushError(errors, `${p}.line`, 'line must be an integer >= 1.');
      });
    }
  }

  return errors;
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

let input = null;
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') {
    outFile = args[i + 1] || '';
    i++;
    continue;
  }
  if (!input) input = a;
}
if (!input) usage();

const abs = path.resolve(process.cwd(), input);
const buf = fs.readFileSync(abs);
const raw = decodeTextFile(buf);
const task = JSON.parse(raw);
const errors = validateImportTask(task);

const result = {
  ok: errors.length === 0,
  input: input.replace(/\\/g, '/'),
  errorCount: errors.length,
  errors,
};

const json = JSON.stringify(result, null, 2);
if (outFile) {
  const outAbs = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outAbs, json, 'utf8');
} else {
  process.stdout.write(json);
}

process.exit(result.ok ? 0 : 1);
