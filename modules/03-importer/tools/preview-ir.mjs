import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/preview-ir.mjs <parsed.json> [--limit N] [--out <jsonFile>]');
  process.exit(2);
}

function asInt(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function decodeTextFile(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le');
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8');
  }

  // Heuristic: if many NUL bytes, assume UTF-16LE (PowerShell redirection output)
  const sample = buf.subarray(0, Math.min(buf.length, 2048));
  let nulCount = 0;
  for (const b of sample) if (b === 0x00) nulCount++;
  if (nulCount > sample.length * 0.1) {
    return buf.toString('utf16le');
  }

  return buf.toString('utf8');
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

let input = null;
let limit = 10;
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--limit') {
    limit = asInt(args[i + 1], 10);
    i++;
    continue;
  }
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
const parsed = JSON.parse(raw);

const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
const preview = questions.slice(0, Math.max(0, limit)).map((q) => ({
  id: q.id,
  type: q.type,
  stem: q.stem,
  options: q.options,
  answer: q.answer,
  analysis: q.analysis,
  source: q.source,
  categoryPath: q.categoryPath,
}));

const result = {
  input: input.replace(/\\/g, '/'),
  totalQuestions: questions.length,
  previewCount: preview.length,
  preview,
};

const json = JSON.stringify(result, null, 2);
if (outFile) {
  const outAbs = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outAbs, json, 'utf8');
} else {
  process.stdout.write(json);
}
