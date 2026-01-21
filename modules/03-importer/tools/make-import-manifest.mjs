import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function usage() {
  console.error('Usage: node modules/03-importer/tools/make-import-manifest.mjs --root <dir> [--source <path>] [--out <jsonFile>]');
  process.exit(2);
}

function isJunk(relPath) {
  const lower = relPath.toLowerCase();
  if (lower === '.ds_store' || lower.endsWith('/.ds_store')) return true;
  if (lower === 'thumbs.db' || lower.endsWith('/thumbs.db')) return true;
  if (lower.startsWith('__macosx/')) return true;
  return false;
}

function toRel(p) {
  return p.replace(/\\/g, '/');
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function walkFiles(rootAbs) {
  const out = [];
  function walk(dirAbs) {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      const abs = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (ent.isFile()) out.push(abs);
    }
  }
  walk(rootAbs);
  return out;
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

const now = new Date().toISOString();

const rootAbs = path.resolve(process.cwd(), rootDir);
if (!fs.existsSync(rootAbs) || !fs.statSync(rootAbs).isDirectory()) {
  console.error(JSON.stringify({ ok: false, error: `Root dir not found: ${toRel(rootDir)}` }, null, 2));
  process.exit(1);
}

const absFiles = walkFiles(rootAbs);
const files = [];
for (const abs of absFiles) {
  const rel = toRel(path.relative(rootAbs, abs));
  if (!rel || isJunk(rel)) continue;
  const buf = fs.readFileSync(abs);
  files.push({ path: rel, sha256: sha256(buf), bytes: buf.length });
}
files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
const canonical = files.map((f) => `${f.path}\0${f.sha256}`).join('\n');
const importHash = sha256(Buffer.from(canonical, 'utf8'));

const manifest = {
  schema: '03-importer/import-manifest.v0',
  createdAt: now,
  source: source ? String(source).replace(/\\/g, '/') : undefined,
  root: toRel(rootDir),
  importHash,
  fileCount: files.length,
  files,
};

const json = JSON.stringify(manifest, null, 2);
if (outFile) {
  fs.writeFileSync(path.resolve(process.cwd(), outFile), json, 'utf8');
} else {
  process.stdout.write(json);
}
