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
let errors = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');
  let expectedUrl = 'https://atlantapoolremoval.com/' + (relPath === 'index.html' ? '' : relPath);
  const canonical = $('link[rel="canonical"]').attr('href');
  
  if (!canonical || canonical !== expectedUrl) {
    errors.push(`${relPath} (Found: ${canonical}, Expected: ${expectedUrl})`);
  }
});

if (errors.length > 0) {
  console.log('Canonical errors found:');
  console.log(errors.join('\n'));
} else {
  console.log('All canonical tags are perfectly self-referencing.');
}
