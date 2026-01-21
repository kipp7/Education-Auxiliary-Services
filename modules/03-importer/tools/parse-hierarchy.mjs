import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/parse-hierarchy.mjs <fileList.txt> [--out <jsonFile>]');
  process.exit(2);
}

function normalizeRelPath(p) {
  return p.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}

function isJunk(p) {
  const lower = p.toLowerCase();
  if (!p) return true;
  if (lower === '.ds_store' || lower.endsWith('/.ds_store')) return true;
  if (lower === 'thumbs.db' || lower.endsWith('/thumbs.db')) return true;
  if (lower.startsWith('__macosx/')) return true;
  return false;
}

function splitSegments(p) {
  return p.split('/').filter(Boolean);
}

function collapseSingleRoot(paths) {
  // Collapse wrapper root folder if ALL paths share the same first segment AND there is no file at root.
  const segs = paths.map(splitSegments);
  if (segs.length === 0) return paths;
  const first = segs[0][0];
  if (!first) return paths;
  if (!segs.every((s) => s[0] === first)) return paths;

  // If any path is exactly that root (i.e. file at root) then do not collapse
  const hasRootFile = segs.some((s) => s.length === 1);
  if (hasRootFile) return paths;

  return segs.map((s) => s.slice(1).join('/'));
}

function ensureChild(parent, name) {
  let child = parent.children.find((c) => c.name === name);
  if (!child) {
    const childPath = parent.path ? `${parent.path}/${name}` : name;
    child = { name, path: childPath, children: [] };
    parent.children.push(child);
  }
  return child;
}

function buildTree(filePaths) {
  const root = { name: '', path: '', children: [] };
  const fileToCategory = [];

  const normalized = filePaths
    .map(normalizeRelPath)
    .filter((p) => !isJunk(p))
    .filter(Boolean);

  const collapsed = collapseSingleRoot(normalized);

  for (const fp of collapsed) {
    const segs = splitSegments(fp);
    if (segs.length === 0) continue;

    // category segments are directory segments (exclude last filename)
    const dirSegs = segs.slice(0, -1);
    let node = root;

    if (dirSegs.length === 0) {
      node = ensureChild(root, '未分类');
    } else {
      for (const seg of dirSegs) {
        node = ensureChild(node, seg);
      }
    }

    fileToCategory.push({ file: fp, categoryPath: node.path || '未分类' });
  }

  // stable order for output
  function sortNode(n) {
    n.children.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    n.children.forEach(sortNode);
  }
  sortNode(root);

  return { tree: root.children, fileToCategory };
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

let listArg = null;
let outFile = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') {
    outFile = args[i + 1] || '';
    i++;
    continue;
  }
  if (!listArg) listArg = a;
}
if (!listArg) usage();

const listFile = path.resolve(process.cwd(), listArg);
const raw = fs.readFileSync(listFile, 'utf8');
const filePaths = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const result = buildTree(filePaths);
const json = JSON.stringify(result, null, 2);
if (outFile) {
  const outAbs = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outAbs, json, 'utf8');
} else {
  process.stdout.write(json);
}
