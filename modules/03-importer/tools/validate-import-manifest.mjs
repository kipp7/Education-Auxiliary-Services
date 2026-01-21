import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/validate-import-manifest.mjs <import-manifest.json> [--out <jsonFile>]');
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

function isSha256(v) {
  return typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
}

function validateFileEntry(e, idx, errors) {
  const p = `files[${idx}]`;
  if (e == null || typeof e !== 'object') {
    pushError(errors, p, 'file entry must be an object.');
    return;
  }
  if (!isNonEmptyString(e.path)) pushError(errors, `${p}.path`, 'path is required.');
  if (!isSha256(e.sha256)) pushError(errors, `${p}.sha256`, 'sha256 must be 64 hex chars.');
  if (!isInt(e.bytes) || e.bytes < 0) pushError(errors, `${p}.bytes`, 'bytes must be an integer >= 0.');
}

function validateManifest(m) {
  const errors = [];
  if (m == null || typeof m !== 'object') {
    pushError(errors, '.', 'manifest must be an object.');
    return errors;
  }

  if (m.schema !== '03-importer/import-manifest.v0') pushError(errors, 'schema', 'schema must be 03-importer/import-manifest.v0.');
  if (!isNonEmptyString(m.createdAt)) pushError(errors, 'createdAt', 'createdAt is required.');
  if (m.source != null && typeof m.source !== 'string') pushError(errors, 'source', 'source must be a string when provided.');
  if (!isNonEmptyString(m.root)) pushError(errors, 'root', 'root is required.');
  if (!isSha256(m.importHash)) pushError(errors, 'importHash', 'importHash must be 64 hex chars.');

  if (!isInt(m.fileCount) || m.fileCount < 0) pushError(errors, 'fileCount', 'fileCount must be an integer >= 0.');

  if (!Array.isArray(m.files)) {
    pushError(errors, 'files', 'files must be an array.');
  } else {
    m.files.forEach((e, i) => validateFileEntry(e, i, errors));
    if (isInt(m.fileCount) && m.fileCount !== m.files.length) {
      pushError(errors, 'fileCount', `fileCount (${m.fileCount}) must equal files.length (${m.files.length}).`);
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
const raw = decodeTextFile(fs.readFileSync(abs));
const manifest = JSON.parse(raw);
const errors = validateManifest(manifest);

const result = {
  ok: errors.length === 0,
  input: input.replace(/\\/g, '/'),
  errorCount: errors.length,
  errors,
};

const json = JSON.stringify(result, null, 2);
if (outFile) fs.writeFileSync(path.resolve(process.cwd(), outFile), json, 'utf8');
else process.stdout.write(json);

process.exit(result.ok ? 0 : 1);
