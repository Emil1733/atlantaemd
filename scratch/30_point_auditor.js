const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const OUT_REPORT = path.join(ROOT, 'improvements', '07-14-2026', 'audit_report.md');

function getHtmlFiles(dir) {
  const results = [];
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
let report = '# Comprehensive Site-Wide 30-Point Audit Report\n\n';
const errors = {
  noindex: [],
  canonical: [],
  titleMissing: [],
  titleDupes: [],
  descMissing: [],
  descLength: [],
  viewport: [],
  charset: [],
  lang: [],
  h1: [],
  thinContent: [],
  altMissing: [],
  ogTags: [],
  twitter: [],
  schema: []
};

const titleCounts = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(content);
  const relPath = file.replace(ROOT, '');

  // 3. Noindex
  if ($('meta[name="robots"][content*="noindex"]').length > 0) errors.noindex.push(relPath);

  // 4. Canonical
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical || !canonical.includes('atlantapoolremoval.com')) errors.canonical.push(relPath);

  // 9, 10. Title tags
  const title = $('title').text().trim();
  if (!title) errors.titleMissing.push(relPath);
  else {
    titleCounts[title] = (titleCounts[title] || 0) + 1;
    if (titleCounts[title] > 1) errors.titleDupes.push(relPath);
  }

  // 11, 12. Meta description
  const desc = $('meta[name="description"]').attr('content');
  if (!desc) errors.descMissing.push(relPath);
  else if (desc.length < 50 || desc.length > 250) errors.descLength.push(relPath);

  // 13. Viewport
  if ($('meta[name="viewport"]').length === 0) errors.viewport.push(relPath);

  // 14. Charset
  if ($('meta[charset="UTF-8"]').length === 0) errors.charset.push(relPath);

  // 15. Lang
  if ($('html').attr('lang') !== 'en') errors.lang.push(relPath);

  // 17. H1 Presence
  if ($('h1').length !== 1) errors.h1.push(relPath);

  // 19. Thin content
  const bodyText = $('body').text().split(/\s+/).length;
  if (bodyText < 300) errors.thinContent.push(relPath);

  // 20. Alt text
  let missingAlt = false;
  $('img').each((i, el) => {
    if (!$(el).attr('alt')) missingAlt = true;
  });
  if (missingAlt) errors.altMissing.push(relPath);

  // 23. Schema
  if ($('script[type="application/ld+json"]').length === 0) errors.schema.push(relPath);

  // 24. OpenGraph
  if ($('meta[property^="og:"]').length === 0) errors.ogTags.push(relPath);

  // 25. Twitter
  if ($('meta[name^="twitter:"]').length === 0) errors.twitter.push(relPath);
}

function writeSection(title, list) {
  report += `## ${title} (${list.length} issues)\n`;
  if (list.length === 0) {
    report += `✅ Passed\n\n`;
  } else {
    for (const item of list) {
      report += `- ${item}\n`;
    }
    report += `\n`;
  }
}

writeSection('Noindex Tags Found', errors.noindex);
writeSection('Missing/Invalid Canonical', errors.canonical);
writeSection('Missing Title', errors.titleMissing);
writeSection('Duplicate Titles', errors.titleDupes);
writeSection('Missing Description', errors.descMissing);
writeSection('Description Too Short/Long', errors.descLength);
writeSection('Missing Viewport', errors.viewport);
writeSection('Missing Charset UTF-8', errors.charset);
writeSection('Missing HTML Lang="en"', errors.lang);
writeSection('Missing or Multiple H1s', errors.h1);
writeSection('Thin Content (<300 words)', errors.thinContent);
writeSection('Missing Alt Text on Images', errors.altMissing);
writeSection('Missing JSON-LD Schema', errors.schema);
writeSection('Missing OpenGraph Tags', errors.ogTags);
writeSection('Missing Twitter Cards', errors.twitter);

fs.writeFileSync(OUT_REPORT, report);
console.log(`Audit report generated at ${OUT_REPORT}`);
