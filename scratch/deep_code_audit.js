const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const canonicals = [];
const robots = [];
const contents = {};

files.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const $ = cheerio.load(content);
  
  // 1. Canonical Check
  const canonical = $('link[rel="canonical"]').attr('href');
  canonicals.push(`${f} -> ${canonical}`);
  if (canonical && !canonical.includes(f) && f !== 'index.html' && canonical !== 'https://atlantapoolremoval.com/') {
    // It's not self-referencing!
    console.log(`[WARNING] Canonical mismatch on ${f}: points to ${canonical}`);
  }

  // 2. Robots check
  const metaRobots = $('meta[name="robots"], meta[name="googlebot"]').attr('content');
  if (metaRobots && metaRobots.includes('noindex')) {
    console.log(`[CRITICAL] noindex found on ${f}`);
  }

  // 3. Extract text for duplicate content check
  // Remove nav, footer, scripts, head to compare pure main content
  $('nav, footer, script, style, header').remove();
  let text = $('body').text().replace(/\s+/g, ' ').trim();
  contents[f] = text;
});

// Compare Alpharetta vs Buford vs Decatur
function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength == 0) return 1.0;
  
  // Quick hacky similarity: compare word overlap
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });
  return intersection / Math.max(words1.size, words2.size);
}

console.log('--- DUPLICATE CONTENT CHECK ---');
console.log(`Alpharetta vs Buford: ${(similarity(contents['alpharetta-pool-removal.html'], contents['buford-pool-removal.html']) * 100).toFixed(2)}% word overlap`);
console.log(`Alpharetta vs Decatur: ${(similarity(contents['alpharetta-pool-removal.html'], contents['decatur-pool-removal.html']) * 100).toFixed(2)}% word overlap`);

// 4. Schema syntax check
console.log('\n--- SCHEMA CHECK ---');
files.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const $ = cheerio.load(content);
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      JSON.parse($(el).html());
    } catch (e) {
      console.log(`[CRITICAL] Invalid JSON-LD Schema on ${f}: ${e.message}`);
    }
  });
});

console.log('\nAudit finished.');
