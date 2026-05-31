/**
 * Internal Linking Audit
 * - Extracts all <a href> links from every HTML page
 * - Maps anchor text → destination URL
 * - Detects cannibalization (multiple pages targeting same keyword via same anchor)
 * - Detects orphan pages (no inbound links)
 * - Detects hub-and-spoke gaps (spokes not linked from their county hub)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://atlantapoolremoval.com';

// ── Page registry — target keyword for each page ──────────────────────────
const PAGE_TARGETS = {
  '/':                                          'atlanta pool removal',
  '/pool-removal.html':                         'pool removal atlanta',
  '/pool-demolition.html':                      'pool demolition atlanta',
  '/cost.html':                                 'pool removal cost atlanta',
  '/about.html':                                'about atlanta pool removal pros',
  '/contact.html':                              'contact pool removal atlanta',
  '/atlanta-pool-removal-permits.html':         'pool removal permits atlanta',
  '/alpharetta-pool-removal.html':              'pool removal alpharetta',
  '/buford-pool-removal.html':                  'pool removal buford',
  '/decatur-pool-removal.html':                 'pool removal decatur',
  '/duluth-pool-removal.html':                  'pool removal duluth',
  '/dunwoody-pool-removal.html':                'pool removal dunwoody',
  '/lawrenceville-pool-removal.html':           'pool removal lawrenceville',
  '/marietta-pool-removal.html':                'pool removal marietta',
  '/peachtree-city-pool-removal.html':          'pool removal peachtree city',
  '/roswell-pool-removal.html':                 'pool removal roswell',
  '/sandy-springs-pool-removal.html':           'pool removal sandy springs',
  '/snellville-pool-removal.html':              'pool removal snellville',
  '/suwanee-pool-removal.html':                 'pool removal suwanee',
  '/cobb-county-pool-removal.html':             'pool removal cobb county',
  '/dekalb-county-pool-removal.html':           'pool removal dekalb county',
  '/fulton-county-pool-removal.html':           'pool removal fulton county',
  '/gwinnett-county-pool-removal.html':         'pool removal gwinnett county',
  '/pool-removal-decatur-case-study.html':      'decatur pool removal case study',
  '/pool-removal-marietta-case-study.html':     'marietta pool removal case study',
  '/sandy-springs-pool-demolition-project.html':'sandy springs pool demolition project',
  '/blog/index.html':                           'pool removal blog atlanta',
  '/blog/atlanta-backyard-renovation-2026.html':'atlanta backyard renovation pool removal',
  '/blog/is-it-worth-removing-a-pool-in-atlanta.html': 'is it worth removing a pool atlanta',
  '/blog/is-your-atlanta-pool-a-money-pit.html':'atlanta pool money pit',
  '/blog/marietta-pool-removal-permit-guide.html': 'marietta pool removal permit guide',
  '/blog/cost-of-marietta-pool-removal-compliance.html': 'marietta pool removal compliance cost',
};

// ── Hub → Spoke map (expected links) ─────────────────────────────────────
const HUB_SPOKES = {
  '/gwinnett-county-pool-removal.html':  ['/lawrenceville-pool-removal.html', '/duluth-pool-removal.html', '/suwanee-pool-removal.html', '/snellville-pool-removal.html', '/buford-pool-removal.html'],
  '/fulton-county-pool-removal.html':    ['/alpharetta-pool-removal.html', '/roswell-pool-removal.html', '/sandy-springs-pool-removal.html'],
  '/cobb-county-pool-removal.html':      ['/marietta-pool-removal.html'],
  '/dekalb-county-pool-removal.html':    ['/decatur-pool-removal.html', '/dunwoody-pool-removal.html'],
};

// ── Helpers ───────────────────────────────────────────────────────────────
function getHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', '_secrets', 'scratch', 'gsc', 'improvements'].includes(entry.name)) {
      results.push(...getHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function fileToSlug(filePath) {
  let rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel;
}

function resolveHref(href, sourceSlug) {
  if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#')) return null;
  let resolved = href.replace(/^\.\//, '');
  // Handle relative paths from blog/
  if (sourceSlug.startsWith('/blog/') && !resolved.startsWith('/')) {
    if (resolved.startsWith('../')) resolved = resolved.replace('../', '/');
    else resolved = '/blog/' + resolved;
  } else if (!resolved.startsWith('/')) {
    resolved = '/' + resolved;
  }
  // Normalise index.html → /
  if (resolved === '/index.html') resolved = '/';
  return resolved;
}

function extractLinks(html, sourceSlug) {
  const links = [];
  const re = /<a\s[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const anchor = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const dest = resolveHref(href, sourceSlug);
    if (dest && dest in PAGE_TARGETS) {
      links.push({ anchor, dest });
    }
  }
  return links;
}

// ── Main ──────────────────────────────────────────────────────────────────
const files = getHtmlFiles(ROOT);

// Build link map: source → [{anchor, dest}]
const linkMap = {};      // source slug → outbound links
const inboundMap = {};   // dest slug → [{source, anchor}]
const anchorDestMap = {}; // anchor (lowercased) → Set of dest slugs

for (const slug of Object.keys(PAGE_TARGETS)) {
  linkMap[slug] = [];
  inboundMap[slug] = [];
}

for (const file of files) {
  const slug = fileToSlug(file);
  if (!(slug in PAGE_TARGETS)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const links = extractLinks(html, slug);
  linkMap[slug] = links;
  for (const { anchor, dest } of links) {
    if (!(dest in inboundMap)) inboundMap[dest] = [];
    inboundMap[dest].push({ source: slug, anchor });
    const key = anchor.toLowerCase();
    if (!anchorDestMap[key]) anchorDestMap[key] = new Set();
    anchorDestMap[key].add(dest);
  }
}

const output = [];
const log = (...args) => { const line = args.join(' '); console.log(line); output.push(line); };

log('══════════════════════════════════════════════════════');
log('         INTERNAL LINKING AUDIT — ATLANTAPOOLREMOVAL');
log('══════════════════════════════════════════════════════\n');

// ── SECTION 1: INBOUND LINK COUNT PER PAGE ────────────────────────────────
log('─── 1. INBOUND LINK COUNT (higher = more authority passed) ───');
const sorted = Object.keys(PAGE_TARGETS).sort((a, b) => (inboundMap[b]?.length || 0) - (inboundMap[a]?.length || 0));
for (const slug of sorted) {
  const count = inboundMap[slug]?.length || 0;
  const bar = '█'.repeat(Math.min(count, 30));
  const flag = count === 0 ? ' ← ⚠️  ORPHAN' : '';
  log(`  ${String(count).padStart(3)}  ${bar}  ${slug}${flag}`);
}

// ── SECTION 2: ORPHAN PAGES ───────────────────────────────────────────────
log('\n─── 2. ORPHAN PAGES (zero inbound internal links) ───');
const orphans = Object.keys(PAGE_TARGETS).filter(s => (inboundMap[s]?.length || 0) === 0);
if (orphans.length === 0) {
  log('  ✅ No orphans — all pages have at least one internal link pointing to them.');
} else {
  orphans.forEach(s => log(`  ❌ ORPHAN: ${s}`));
}

// ── SECTION 3: HUB → SPOKE GAPS ──────────────────────────────────────────
log('\n─── 3. HUB→SPOKE COVERAGE GAPS ───');
let hubGapsFound = false;
for (const [hub, spokes] of Object.entries(HUB_SPOKES)) {
  const hubLinks = linkMap[hub] || [];
  const hubDests = new Set(hubLinks.map(l => l.dest));
  for (const spoke of spokes) {
    if (!hubDests.has(spoke)) {
      log(`  ❌ ${hub} → MISSING link to ${spoke}`);
      hubGapsFound = true;
    } else {
      const anchor = hubLinks.find(l => l.dest === spoke)?.anchor;
      log(`  ✅ ${hub} → ${spoke}  (anchor: "${anchor}")`);
    }
  }
}
if (!hubGapsFound) log('  ✅ All hub→spoke links are in place.');

// ── SECTION 4: CANNIBALIZATION CHECK ─────────────────────────────────────
log('\n─── 4. CANNIBALIZATION RISK (same anchor → multiple pages) ───');
let cannibalFound = false;
for (const [anchor, dests] of Object.entries(anchorDestMap)) {
  if (dests.size > 1 && anchor.length > 4) {
    log(`  ⚠️  ANCHOR: "${anchor}"`);
    for (const d of dests) log(`       → ${d}`);
    cannibalFound = true;
  }
}
if (!cannibalFound) log('  ✅ No anchor-level cannibalization detected.');

// ── SECTION 5: ANCHOR TEXT AUDIT PER PAGE ────────────────────────────────
log('\n─── 5. INBOUND ANCHOR TEXT PER PAGE ───');
for (const slug of Object.keys(PAGE_TARGETS)) {
  const links = inboundMap[slug] || [];
  if (links.length === 0) continue;
  log(`\n  TARGET: ${slug}`);
  log(`  KEYWORD: "${PAGE_TARGETS[slug]}"`);
  const anchors = {};
  links.forEach(({ anchor, source }) => {
    if (!anchors[anchor]) anchors[anchor] = [];
    anchors[anchor].push(source);
  });
  for (const [anchor, sources] of Object.entries(anchors)) {
    const kw = PAGE_TARGETS[slug].toLowerCase();
    const isRelevant = anchor.toLowerCase().split(' ').some(w => kw.includes(w));
    const flag = isRelevant ? '✅' : '⚠️ ';
    log(`    ${flag} "${anchor}" ← from ${sources.length} page(s)`);
  }
}

log('\n══════════════════════════════════════════════════════');
log('AUDIT COMPLETE');
log('══════════════════════════════════════════════════════');

// Save report
const outPath = path.join(ROOT, 'gsc/05-30-2026/internal_linking_audit.md');
fs.writeFileSync(outPath, '# Internal Linking Audit\n\n```\n' + output.join('\n') + '\n```\n');
console.log('\n✅ Report saved to gsc/05-30-2026/internal_linking_audit.md');
