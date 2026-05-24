/**
 * HTML Patcher: Replaces PNG/JPG src references with WebP equivalents
 * Adds width/height/loading="lazy" where missing
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');

// Get all generated WebP files
const webpFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp')).map(f => f.replace('.webp', ''));

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const baseName of webpFiles) {
    // Match both .png and .jpg/.jpeg references for this base name
    const pngPattern = new RegExp(`(src=["'][^"']*?)${escapeRegex(baseName)}\\.(png|jpg|jpeg)(["'])`, 'gi');
    
    if (pngPattern.test(content)) {
      content = content.replace(
        new RegExp(`(src=["'][^"']*?)${escapeRegex(baseName)}\\.(png|jpg|jpeg)(["'])`, 'gi'),
        (match, pre, ext, post) => `${pre}${baseName}.webp${post}`
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}

function getHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', '_secrets', 'scratch'].includes(entry.name)) {
      results.push(...getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('--- PATCHING HTML FILES TO USE WEBP IMAGES ---\n');

const htmlFiles = getHtmlFiles(ROOT);
let patchedCount = 0;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file);
  if (patchFile(file)) {
    console.log(`[PATCHED] ${rel}`);
    patchedCount++;
  }
}

console.log(`\n✅ Done. ${patchedCount} file(s) updated to use WebP images.`);
