const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');

const titleReplacements = {
  'atlanta-pool-removal-permits.html': 'Atlanta Pool Removal Permit Guide (2026)',
  'blog/atlanta-backyard-renovation-2026.html': '2026 Atlanta Backyard Renovation Trends',
  'blog/cost-of-marietta-pool-removal-compliance.html': 'The ROI of Marietta Pool Removal Permits',
  'blog/is-it-worth-removing-a-pool-in-atlanta.html': 'Is Removing a Pool in Atlanta Worth It?',
  'blog/is-your-atlanta-pool-a-money-pit.html': 'Is Your Atlanta Pool a Money Pit in 2026?',
  'blog/marietta-pool-removal-permit-guide.html': 'Marietta Pool Removal Permit Guide (2026)',
  'dekalb-county-pool-removal.html': 'DeKalb County Pool Removal Experts',
  'gwinnett-county-pool-removal.html': 'Gwinnett County Pool Removal Experts',
  'peachtree-city-pool-removal.html': 'Peachtree City Pool Removal Experts',
  'pool-removal-marietta-case-study.html': 'Marietta Pool Removal Case Study',
  'pool-removal.html': 'Full vs Partial Pool Removal in Atlanta',
  'sandy-springs-pool-demolition-project.html': 'Sandy Springs Pool Removal Case Study',
  'sandy-springs-pool-removal.html': 'Sandy Springs Pool Removal Experts',
  'woodstock-pool-removal.html': 'Woodstock Pool Removal Cost Estimate'
};

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
  let originalContent = content;
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  const $ = cheerio.load(content, { decodeEntities: false });
  let modified = false;

  // Title Replacement
  if (titleReplacements[relPath]) {
    const newTitle = titleReplacements[relPath];
    // Regex replace to preserve layout since cheerio .html() rewrites the whole file
    content = content.replace(/<title>.*?<\/title>/, `<title>${newTitle}</title>`);
    // Also update OG and Twitter titles
    content = content.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${newTitle}">`);
    content = content.replace(/<meta name="twitter:title" content=".*?">/, `<meta name="twitter:title" content="${newTitle}">`);
    modified = true;
  }

  // Description Optimization (120-160 chars)
  const descTag = $('meta[name="description"]');
  if (descTag.length > 0) {
    let desc = descTag.attr('content');
    if (desc.length > 158) {
      // Trim to ~155 chars at the last word
      let trimmed = desc.substring(0, 155);
      trimmed = trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
      
      content = content.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${trimmed}">`);
      content = content.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${trimmed}">`);
      content = content.replace(/<meta name="twitter:description" content=".*?">/, `<meta name="twitter:description" content="${trimmed}">`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(f, content);
    console.log(`Optimized Meta Tags for: ${relPath}`);
  }
});
