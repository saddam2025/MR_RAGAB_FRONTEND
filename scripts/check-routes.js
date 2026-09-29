// scripts/check-routes.js
import { readdir, stat, readFile } from 'fs/promises';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'src', 'pages');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && /\.(jsx|tsx|js)$/.test(full)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  try {
    const s = await stat(pagesDir).catch(() => null);
    if (!s || !s.isDirectory()) {
      console.error('Directory not found:', pagesDir);
      process.exit(1);
    }

    const files = await walk(pagesDir);
    const missing = [];

    for (const file of files) {
      const content = await readFile(file, 'utf8');
      // Accept either "export const route =" or named re-export "export { route }"
      if (!/export\s+const\s+route\s*=/.test(content) && !/export\s*\{\s*route\s*\}/.test(content)) {
        missing.push(path.relative(projectRoot, file));
      }
    }

    if (missing.length) {
      console.error('Pages missing route metadata:');
      missing.forEach((f) => console.error('  -', f));
      console.error('\nAdd `export const route = { path: \'/your/path\' }` to each page file.');
      process.exit(2);
    }

    console.log('All pages export route metadata.');
    process.exit(0);
  } catch (err) {
    console.error('Error while checking routes:', err);
    process.exit(3);
  }
}

main();
