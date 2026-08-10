const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', '_secrets', 'scratch', 'gsc', 'improvements', 'crawl_stats'].includes(entry.name)) {
      results.push(...getHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = getHtmlFiles(ROOT);
let titleMissing = [];
let titleLength = [];
let titleDupes = [];
let descMissing = [];
let descLength = [];

const titleCounts = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  // Title
  const title = $('title').text().trim();
  if (!title) {
    titleMissing.push(relPath);
  } else {
    if (title.length < 30 || title.length > 65) { // 65 is widely accepted max before truncation
      titleLength.push(`[${title.length} chars] ${relPath} => ${title}`);
    }
    titleCounts[title] = (titleCounts[title] || 0) + 1;
    if (titleCounts[title] > 1) {
      titleDupes.push(`Duplicate: ${title} in ${relPath}`);
    }
  }

  // Description
  const desc = $('meta[name="description"]').attr('content');
  if (!desc) {
    descMissing.push(relPath);
  } else {
    // 120-160 optimal CTR range
    if (desc.length < 120 || desc.length > 160) {
      descLength.push(`[${desc.length} chars] ${relPath}`);
    }
  }
});

console.log('--- TITLE TAGS (Steps 10 & 11) ---');
if (titleMissing.length > 0) console.log('Missing Titles:\n' + titleMissing.join('\n'));
if (titleLength.length > 0) console.log('\nSuboptimal Title Lengths:\n' + titleLength.join('\n'));
if (titleDupes.length > 0) console.log('\nDuplicate Titles:\n' + titleDupes.join('\n'));
if (titleMissing.length === 0 && titleLength.length === 0 && titleDupes.length === 0) {
  console.log('✅ ALL titles are present, unique, and optimally sized (30-65 chars).');
}

console.log('\n--- META DESCRIPTIONS (Steps 12 & 13) ---');
if (descMissing.length > 0) console.log('Missing Descriptions:\n' + descMissing.join('\n'));
if (descLength.length > 0) console.log('\nSuboptimal Description Lengths (not 120-160):\n' + descLength.join('\n'));
if (descMissing.length === 0 && descLength.length === 0) {
  console.log('✅ ALL descriptions are present and optimally sized (120-160 chars).');
}
