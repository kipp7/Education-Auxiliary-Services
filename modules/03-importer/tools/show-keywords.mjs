import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/show-keywords.mjs [--file <TASKS.md>] [--out <jsonFile>]');
  process.exit(2);
}

const args = process.argv.slice(2);
let file = 'modules/03-importer/TASKS.md';
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--file') {
    file = args[i + 1] || file;
    i++;
    continue;
  }
  if (a === '--out') {
    outFile = args[i + 1] || '';
    i++;
    continue;
  }
  if (a === '--help' || a === '-h') usage();
}

const abs = path.resolve(process.cwd(), file);
const text = fs.readFileSync(abs, 'utf8');

const lines = text.split(/\r?\n/);
const keywordHeaderIdx = lines.findIndex((l) => l.includes('关键词') || l.toLowerCase().includes('keyword'));
let keywordLine = '';
if (keywordHeaderIdx >= 0) {
  for (let i = keywordHeaderIdx + 1; i < Math.min(lines.length, keywordHeaderIdx + 8); i++) {
    const l = lines[i];
    if (!l) continue;
    if (/^##\s+/.test(l)) break;
    if (l.includes('`')) {
      keywordLine = l;
      break;
    }
  }
} else {
  keywordLine = lines.find((l) => l.includes('`')) || '';
}

const keywords = [];
if (keywordLine) {
  const matches = keywordLine.match(/`([^`]+)`/g) || [];
  for (const m of matches) {
    const v = m.slice(1, -1).trim();
    if (v) keywords.push(v);
  }
}

const result = {
  file: file.replace(/\\/g, '/'),
  keywords,
};

const json = JSON.stringify(result, null, 2);
if (outFile) {
  const outAbs = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outAbs, json, 'utf8');
} else {
  process.stdout.write(json);
}
