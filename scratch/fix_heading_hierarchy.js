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

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Load the full document
  const $ = cheerio.load(content, { decodeEntities: false });
  let modified = false;

  const headings = $('h1, h2, h3, h4, h5, h6');
  let currentLevel = 1;

  headings.each((i, el) => {
    const originalLevel = parseInt(el.tagName.replace('h', ''));
    if (originalLevel > currentLevel + 1) {
      const newLevel = currentLevel + 1;
      el.tagName = `h${newLevel}`;
      modified = true;
      currentLevel = newLevel;
    } else {
      currentLevel = originalLevel;
    }
  });

  if (modified) {
    // Write the full HTML back
    fs.writeFileSync(f, $.html());
    console.log(`Fixed hierarchy in ${f.replace(ROOT, '')}`);
  }
});
