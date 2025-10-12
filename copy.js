// dump-files.js
// Run: node dump-files.js
// Output: ./output.txt

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'output.txt');

// Directories to walk
const TARGET_DIRS = ['server', 'frontend'];

// Safety directory ignores (by basename). Adjust if needed.
const DIR_BASENAME_IGNORES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.cache',
  '.gradle',
  '.idea',
]);

// Additional path-based directory ignores (relative to root, normalized)
const DIR_PATH_IGNORES = [
  'backend/tests',
  'frontend/src/CSS',
].map(p => p.toLowerCase());

// Exact file ignores (relative to project root, using forward slashes)
const FRONTEND_IGNORES = new Set([
  'frontend/public/favicon.ico',
  'frontend/public/logo192.png',
  'frontend/public/logo512.png',
  'frontend/package-lock.json',
  'frontend/README.md',
  'frontend/src/logo.svg',
  'frontend/.gitignore',
].map(n => n.toLowerCase()));

const BACKEND_IGNORES = new Set([
  'backend/package-lock.json',
].map(n => n.toLowerCase()));

// Optional root files to include if they exist
const ROOT_OPTIONAL_FILES = [
  '.firebaserc',
  'Dockerfile.dockerhub',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'package.json',
  'vercel.json',
];

// Utility: normalize to forward slashes, lowercase
function norm(p) {
  return p.split(path.sep).join('/').toLowerCase();
}

// Determine if a directory should be skipped
function shouldSkipDir(absDirPath, relDirPath) {
  // 1) Basename-based ignores (node_modules, .git, etc.)
  const name = path.basename(absDirPath);
  if (DIR_BASENAME_IGNORES.has(name)) return true;

  // 2) Path-based ignores (backend/tests, frontend/src/__tests__)
  const n = norm(relDirPath);
  for (const ig of DIR_PATH_IGNORES) {
    if (n === ig || n.startsWith(ig + '/')) return true;
  }
  return false;
}

// Determine if a file should be skipped based on rules
function shouldSkipFile(fileRel) {
  const n = norm(fileRel);
  if (n.startsWith('frontend/')) {
    if (FRONTEND_IGNORES.has(n)) return true;
  } else if (n.startsWith('backend/')) {
    if (BACKEND_IGNORES.has(n)) return true;
  }
  return false;
}

// Write one file entry to the stream
async function writeFileEntry(stream, relPath) {
  const absPath = path.join(PROJECT_ROOT, relPath);

  let content;
  try {
    content = await fsp.readFile(absPath, 'utf8');
  } catch (err) {
    const buf = await fsp.readFile(absPath);
    content = `[[BINARY_OR_NON_UTF8 — ${buf.length} bytes, base64]]\n` + buf.toString('base64');
  }

  stream.write(`\n=== FILE START ===\n`);
  stream.write(`Path: ${relPath}\n`);
  stream.write(`--- CONTENT START ---\n`);
  stream.write(content);
  if (!content.endsWith('\n')) stream.write('\n');
  stream.write(`--- CONTENT END ---\n`);
  stream.write(`=== FILE END ===\n`);
}

// Recursively walk a directory and write entries
async function walkDir(stream, baseRel) {
  const baseAbs = path.join(PROJECT_ROOT, baseRel);
  let entries;
  try {
    entries = await fsp.readdir(baseAbs, { withFileTypes: true });
  } catch {
    // Directory doesn’t exist — skip quietly
    return;
  }

  for (const entry of entries) {
    const rel = path.join(baseRel, entry.name);
    const abs = path.join(baseAbs, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(abs, rel)) continue;
      await walkDir(stream, rel);
    } else if (entry.isFile()) {
      if (shouldSkipFile(rel)) continue;
      await writeFileEntry(stream, rel);
    }
    // symlinks and others are ignored
  }
}

(async () => {
  const out = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf8' });

  const startTime = new Date().toISOString();
  out.write(`Output generated at: ${startTime}\n`);
  out.write(`Project root: ${PROJECT_ROOT}\n`);
  out.write(`\n====================\n`);
  out.write(`DUMP FROM DIRECTORIES\n`);
  out.write(`====================\n`);

  // Walk backend and frontend
  for (const dir of TARGET_DIRS) {
    await walkDir(out, dir);
  }

  out.write(`\n====================\n`);
  out.write(`OPTIONAL ROOT FILES\n`);
  out.write(`====================\n`);

  // Include optional root-level files if present
  for (const fileName of ROOT_OPTIONAL_FILES) {
    const abs = path.join(PROJECT_ROOT, fileName);
    try {
      const stat = await fsp.stat(abs);
      if (stat.isFile()) {
        await writeFileEntry(out, fileName);
      }
    } catch {
      // not found — skip
    }
  }

  out.end(() => {
    console.log(`Done. Wrote to ${OUTPUT_FILE}`);
  });
})().catch(err => {
  console.error('Error while generating output.txt:', err);
  process.exit(1);
});
