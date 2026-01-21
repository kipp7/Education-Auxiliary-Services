import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function usage() {
  console.error('Usage: node modules/03-importer/tools/make-import-manifest.mjs --root <dir> [--source <path>] [--out <jsonFile>]');
  process.exit(2);
}

const args = process.argv.slice(2);
let rootDir = '';
let source = '';
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--root') {
    rootDir = args[i + 1] || '';
    i++;
    continue;
  }
  if (a === '--source') {
    source = args[i + 1] || '';
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
if (!rootDir) usage();

const hashTool = path.resolve(process.cwd(), 'modules/03-importer/tools/hash-import.mjs');
const hashed = spawnSync(process.execPath, [hashTool, '--root', rootDir], { encoding: 'utf8' });
if (hashed.status !== 0) {
  process.stderr.write(hashed.stderr || hashed.stdout || 'Failed to hash import root\n');
  process.exit(hashed.status ?? 1);
}

const hashJson = JSON.parse(hashed.stdout);
const now = new Date().toISOString();

const manifest = {
  schema: '03-importer/import-manifest.v0',
  createdAt: now,
  source: source ? String(source).replace(/\\/g, '/') : undefined,
  root: hashJson.root,
  importHash: hashJson.importHash,
  fileCount: hashJson.fileCount,
  files: hashJson.files,
};

const json = JSON.stringify(manifest, null, 2);
if (outFile) {
  fs.writeFileSync(path.resolve(process.cwd(), outFile), json, 'utf8');
} else {
  process.stdout.write(json);
}
