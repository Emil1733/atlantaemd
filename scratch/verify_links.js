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
let brokenLinks = [];
let redirectChains = []; // We will check for meta refresh tags

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  const currentDir = path.dirname(f);
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  // Check for meta refresh (client-side redirects)
  const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
  if (metaRefresh) {
    redirectChains.push(`${relPath} has a meta refresh redirect: ${metaRefresh}`);
  }

  // Check <a> links
  $('a').each((i, el) => {
    let href = $(el).attr('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
    
    // Resolve relative path
    // Remove query params or hashes for file checking
    href = href.split('#')[0].split('?')[0];
    if (!href) return; // it was just a hash

    // We assume href is relative to the current HTML file
    let targetPath;
    if (href.startsWith('/')) {
      targetPath = path.join(ROOT, href.substring(1));
    } else {
      targetPath = path.join(currentDir, href);
    }

    if (!fs.existsSync(targetPath)) {
      // Sometimes links might be to a directory (e.g., /blog/), in a static site that usually implies index.html
      const indexPath = path.join(targetPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        brokenLinks.push(`Broken Link in ${relPath}: ${href}`);
      }
    }
  });

  // Check <img> src
  $('img').each((i, el) => {
    let src = $(el).attr('src');
    if (!src || src.startsWith('http') || src.startsWith('data:')) return;
    
    src = src.split('?')[0];
    
    let targetPath;
    if (src.startsWith('/')) {
      targetPath = path.join(ROOT, src.substring(1));
    } else {
      targetPath = path.join(currentDir, src);
    }

    if (!fs.existsSync(targetPath)) {
      brokenLinks.push(`Broken Image in ${relPath}: ${src}`);
    }
  });
});

if (brokenLinks.length > 0) {
  console.log('--- BROKEN LINKS FOUND ---');
  console.log(brokenLinks.join('\n'));
} else {
  console.log('✅ ZERO Broken Links or Images Found.');
}

if (redirectChains.length > 0) {
  console.log('--- META REDIRECTS FOUND ---');
  console.log(redirectChains.join('\n'));
} else {
  console.log('✅ ZERO Meta Redirects Found.');
}
