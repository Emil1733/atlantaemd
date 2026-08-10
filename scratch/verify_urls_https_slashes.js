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

let urlStructureIssues = [];
let mixedContentIssues = [];
let trailingSlashIssues = [];

// Step 7: Check URL Structure (Filenames)
files.forEach(f => {
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');
  
  if (relPath !== relPath.toLowerCase()) {
    urlStructureIssues.push(`Uppercase characters found: ${relPath}`);
  }
  if (relPath.includes('_')) {
    urlStructureIssues.push(`Underscore found in filename: ${relPath}`);
  }
});

// Steps 8 & 9: Mixed Content & Trailing Slashes in internal links
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Check for HTTP (Mixed Content)
    if (href.startsWith('http://')) {
      mixedContentIssues.push(`Mixed Content (HTTP) link in ${relPath}: ${href}`);
    }

    // Check Trailing Slashes consistency
    // Valid: ends in .html
    // Valid: ends in / (like /blog/ or /)
    // Invalid: ends in /something (without .html or /)
    if (href.startsWith('http://atlantapoolremoval.com') || href.startsWith('https://atlantapoolremoval.com') || href.startsWith('/')) {
      // Ignore query params and hashes for this check
      let cleanHref = href.split('?')[0].split('#')[0];
      
      // If it doesn't end in .html and doesn't end in /, it's an inconsistent slash issue (unless it's empty)
      if (cleanHref.length > 0 && !cleanHref.endsWith('.html') && !cleanHref.endsWith('/')) {
        trailingSlashIssues.push(`Inconsistent trailing slash in ${relPath}: ${href}`);
      }
    }
  });

  // Check images for Mixed Content
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('http://')) {
      mixedContentIssues.push(`Mixed Content (HTTP) image in ${relPath}: ${src}`);
    }
  });
});

console.log('--- URL STRUCTURE (Step 7) ---');
if (urlStructureIssues.length > 0) {
  console.log(urlStructureIssues.join('\n'));
} else {
  console.log('✅ ALL filenames are lowercase and use hyphens.');
}

console.log('\n--- MIXED CONTENT (Step 8) ---');
if (mixedContentIssues.length > 0) {
  console.log(mixedContentIssues.join('\n'));
} else {
  console.log('✅ ZERO HTTP links/images found. Site is fully HTTPS.');
}

console.log('\n--- TRAILING SLASHES (Step 9) ---');
if (trailingSlashIssues.length > 0) {
  console.log(trailingSlashIssues.join('\n'));
} else {
  console.log('✅ ZERO Trailing Slash inconsistencies found.');
}
