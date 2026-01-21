import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node modules/03-importer/tools/prepare-ocr-review.mjs <imageOrListFile> [--category <path>]');
  console.error('  <imageOrListFile> can be an image path or a .txt file (one path per line).');
  process.exit(2);
}

function isImageFile(p) {
  const ext = path.extname(p).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext);
}

function readPaths(inputPath) {
  const p = inputPath.trim();
  const ext = path.extname(p).toLowerCase();
  if (ext === '.txt') {
    const raw = fs.readFileSync(p, 'utf8');
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return [p];
}

function rel(p) {
  return p.replace(/\\/g, '/');
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

let input = null;
let category = '';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--category') {
    category = args[i + 1] || '';
    i++;
    continue;
  }
  if (!input) input = a;
}
if (!input) usage();

const absInput = path.resolve(process.cwd(), input);
const list = readPaths(absInput);

const questions = [];
const errors = [];

let idx = 0;
for (const rawPath of list) {
  const abs = path.resolve(path.dirname(absInput), rawPath);
  const shown = rel(path.relative(process.cwd(), abs));

  idx++;

  if (!isImageFile(shown)) {
    errors.push({
      code: 'OCR_INPUT_INVALID',
      message: 'Not an image file',
      suggestion: 'Provide .png/.jpg/.jpeg/.webp/.bmp paths.',
      filePath: shown,
    });
    continue;
  }

  if (!fs.existsSync(abs)) {
    errors.push({
      code: 'FILE_NOT_FOUND',
      message: 'Image file not found',
      suggestion: 'Check the path or ensure the file is uploaded/extracted.',
      filePath: shown,
    });
  }

  questions.push({
    id: `q-ocr-${String(idx).padStart(4, '0')}`,
    type: 'essay',
    stem: `【OCR待处理】请在校对界面录入题干/选项/答案：${path.basename(shown)}`,
    answer: { value: '' },
    analysis: '',
    source: {
      filePath: shown,
    },
    categoryPath: category || undefined,
  });

  errors.push({
    code: 'OCR_PENDING',
    message: 'OCR not implemented; manual review required',
    suggestion: 'Open the review output and fill in stem/options/answer based on the image.',
    filePath: shown,
  });
}

const result = {
  input: rel(input),
  categoryPath: category || undefined,
  questions,
  errors,
};

process.stdout.write(JSON.stringify(result, null, 2));
