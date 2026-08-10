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

const files = getHtmlFiles(ROOT).map(f => f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/'));
const graph = {}; // page -> set of linked pages
const reverseGraph = {}; // page -> set of pages linking to it
const anchorTexts = [];

files.forEach(f => {
  graph[f] = new Set();
  if (!reverseGraph[f]) reverseGraph[f] = new Set();
});

files.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const $ = cheerio.load(content);
  const currentDir = path.dirname(f) === '.' ? '' : path.dirname(f);

  $('a').each((i, el) => {
    let href = $(el).attr('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

    href = href.split('#')[0].split('?')[0];
    if (!href) return;

    let targetPath;
    if (href.startsWith('/')) {
      targetPath = href.substring(1);
    } else {
      targetPath = currentDir ? path.posix.join(currentDir, href) : href;
    }
    
    // normalize targetPath
    targetPath = path.posix.normalize(targetPath);
    if (targetPath.endsWith('/')) targetPath += 'index.html';
    if (!targetPath.endsWith('.html')) {
      // directory link
      if (fs.existsSync(path.join(ROOT, targetPath, 'index.html'))) {
        targetPath = path.posix.join(targetPath, 'index.html');
      }
    }

    if (files.includes(targetPath)) {
      graph[f].add(targetPath);
      reverseGraph[targetPath].add(f);
      
      const text = $(el).text().trim().toLowerCase();
      if (!text) {
        anchorTexts.push(`Empty Anchor in ${f} pointing to ${targetPath}`);
      } else if (text === 'click here' || text === 'read more') {
        anchorTexts.push(`Generic Anchor "${text}" in ${f} pointing to ${targetPath}`);
      }
    }
  });
});

// Calculate Click Depth (BFS from index.html)
const depths = {};
const queue = [{ page: 'index.html', depth: 0 }];
const visited = new Set(['index.html']);

while (queue.length > 0) {
  const { page, depth } = queue.shift();
  depths[page] = depth;
  for (const neighbor of graph[page]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      queue.push({ page: neighbor, depth: depth + 1 });
    }
  }
}

let depthIssues = [];
let orphanPages = [];

files.forEach(f => {
  // Depth check
  if (depths[f] === undefined) {
    depthIssues.push(`UNREACHABLE from homepage: ${f}`);
  } else if (depths[f] > 3) {
    depthIssues.push(`Too deep (${depths[f]} clicks): ${f}`);
  }

  // Orphan check (no incoming links at all)
  if (reverseGraph[f].size === 0 && f !== 'index.html') {
    orphanPages.push(`ORPHAN PAGE (0 internal links): ${f}`);
  }
});

console.log('--- CLICK DEPTH (Step 19) ---');
if (depthIssues.length > 0) console.log(depthIssues.join('\n'));
else console.log('✅ All pages are reachable within 3 clicks from the homepage.');

console.log('\n--- ORPHAN PAGES (Step 20) ---');
if (orphanPages.length > 0) console.log(orphanPages.join('\n'));
else console.log('✅ ZERO orphan pages found. Every page has at least 1 incoming link.');

console.log('\n--- ANCHOR TEXT (Step 21) ---');
if (anchorTexts.length > 0) console.log(anchorTexts.join('\n'));
else console.log('✅ ALL internal links have descriptive anchor text (no "click here").');

console.log('\n--- NAVIGATION & FOOTER EQUILIBRIUM (Step 22) ---');
console.log(`Homepage has ${graph['index.html'].size} outgoing internal links.`);
console.log(`Average incoming links per page: ${(Object.values(reverseGraph).reduce((acc, set) => acc + set.size, 0) / files.length).toFixed(1)}`);
