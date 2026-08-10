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

let h1Issues = [];
let hierarchyIssues = [];
let altIssues = [];
let thinContent = [];
let h1Tracker = {};
let cannibalization = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  // Step 14: H1 Tags
  const h1s = $('h1');
  if (h1s.length !== 1) {
    h1Issues.push(`${relPath} has ${h1s.length} H1 tags.`);
  } else {
    const h1Text = h1s.text().trim().toLowerCase();
    if (!h1Tracker[h1Text]) {
      h1Tracker[h1Text] = [relPath];
    } else {
      h1Tracker[h1Text].push(relPath);
    }
  }

  // Step 15: Heading Hierarchy
  const headings = $('h1, h2, h3, h4, h5, h6');
  let currentLevel = 1; // Start assuming we have an H1
  headings.each((i, el) => {
    const level = parseInt(el.tagName.replace('h', ''));
    if (level > currentLevel + 1) {
      hierarchyIssues.push(`${relPath}: Skipped heading level from H${currentLevel} to H${level} ("${$(el).text().substring(0,20)}...")`);
    }
    currentLevel = level;
  });

  // Step 16: Image Alt Text
  $('img').each((i, el) => {
    const alt = $(el).attr('alt');
    if (typeof alt === 'undefined' || alt.trim() === '') {
      altIssues.push(`${relPath}: Missing or empty alt text on image src="${$(el).attr('src')}"`);
    }
  });

  // Step 18: Thin Content
  // Extract visible text from body
  const bodyText = $('body').text().replace(/\\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length;
  if (wordCount < 300) {
    thinContent.push(`${relPath}: Only ${wordCount} words.`);
  }
});

// Step 17: Cannibalization (Multiple pages with exact same H1)
for (const [h1, paths] of Object.entries(h1Tracker)) {
  if (paths.length > 1) {
    cannibalization.push(`Multiple pages targeting identical H1 "${h1}":\n  - ` + paths.join('\n  - '));
  }
}

console.log('--- H1 TAGS (Step 14) ---');
if (h1Issues.length > 0) console.log(h1Issues.join('\n'));
else console.log('✅ ALL pages have exactly one H1 tag.');

console.log('\n--- HEADING HIERARCHY (Step 15) ---');
if (hierarchyIssues.length > 0) console.log(hierarchyIssues.join('\n'));
else console.log('✅ ALL heading structures are perfectly nested.');

console.log('\n--- IMAGE ALT TEXT (Step 16) ---');
if (altIssues.length > 0) console.log(altIssues.join('\n'));
else console.log('✅ ALL images have valid alt text.');

console.log('\n--- CANNIBALIZATION (Step 17) ---');
if (cannibalization.length > 0) console.log(cannibalization.join('\n'));
else console.log('✅ ZERO identical H1 tags found across the site.');

console.log('\n--- THIN CONTENT (Step 18) ---');
if (thinContent.length > 0) console.log(thinContent.join('\n'));
else console.log('✅ ALL core pages exceed 300 words.');
