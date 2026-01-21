import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function usage() {
  console.error('Usage: node modules/03-importer/tools/parse-pdf.mjs <pdfFile> [--category <path>]');
  process.exit(2);
}

function normalizeRel(p) {
  return p.replace(/\\/g, '/');
}

function decodePdfString(s) {
  // Basic PDF literal string decoding for our controlled sample.
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

function extractTextOperators(pdfText) {
  // Very small extractor: supports uncompressed content streams with (text) Tj and T* for newline.
  // Not a general PDF text extractor.
  const pieces = [];

  // Extract all stream bodies that are not obviously compressed.
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m;
  while ((m = streamRe.exec(pdfText)) !== null) {
    const body = m[1];
    if (body.includes('/FlateDecode')) continue;
    pieces.push(body);
  }

  const content = pieces.join('\n');
  if (!content.trim()) {
    return { text: '', unsupported: true };
  }

  const out = [];

  // Parse tokens linearly.
  // Handle: (.. ) Tj
  // Handle: T* as newline
  const tokenRe = /(\([^\)]*(?:\\\)[^\)]*)*\))\s*Tj|T\*|\r?\n/g;
  let t;
  while ((t = tokenRe.exec(content)) !== null) {
    if (t[0] === 'T*') {
      out.push('\n');
      continue;
    }
    if (t[1]) {
      // strip surrounding parentheses
      const raw = t[1].slice(1, -1);
      out.push(decodePdfString(raw));
    }
  }

  return { text: out.join(''), unsupported: false };
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

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
const buf = fs.readFileSync(abs);

// For this minimal implementation we assume the PDF content is mostly ASCII.
const pdfText = buf.toString('latin1');
const { text, unsupported } = extractTextOperators(pdfText);

if (unsupported) {
  process.stderr.write('PDF parsing unsupported: only uncompressed text streams are supported in this MVP\n');
}

const tmpTxt = path.join(os.tmpdir(), `03-importer-pdf-${Date.now()}.txt`);
fs.writeFileSync(tmpTxt, text, 'utf8');

const txtParser = path.resolve(process.cwd(), 'modules/03-importer/tools/parse-txt.mjs');
const result = spawnSync(process.execPath, [txtParser, tmpTxt, '--category', category], { encoding: 'utf8' });
if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Failed to parse extracted text\n');
  process.exit(result.status ?? 1);
}

// Patch file path in output to be the PDF path
const parsed = JSON.parse(result.stdout);
parsed.file = { path: normalizeRel(file) };
parsed.extractedTextPreview = text.slice(0, 200);

process.stdout.write(JSON.stringify(parsed, null, 2));
