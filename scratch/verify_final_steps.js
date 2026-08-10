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

let missingViewport = [];
let unoptimizedImages = [];
let missingSchema = [];
let missingSocial = [];
let missingLang = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(content);
  const relPath = f.replace(ROOT, '').replace(/^\\|^\//, '').replace(/\\/g, '/');

  // 23: Viewport
  if ($('meta[name="viewport"]').length === 0) {
    missingViewport.push(relPath);
  }

  // 25: WebP Images
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.endsWith('.webp') && !src.startsWith('data:') && !src.includes('favicon')) {
      if (!unoptimizedImages.includes(src)) {
        unoptimizedImages.push(src);
      }
    }
  });

  // 27: Schema
  if ($('script[type="application/ld+json"]').length === 0) {
    missingSchema.push(relPath);
  }

  // 28: Social
  if ($('meta[property^="og:"]').length === 0 || $('meta[name^="twitter:"]').length === 0) {
    missingSocial.push(relPath);
  }

  // 29: Lang
  if ($('html').attr('lang') !== 'en') {
    missingLang.push(relPath);
  }
});

// 26 & 30: Minification & Favicon
let minificationIssues = [];
const cssPath = path.join(ROOT, 'assets', 'styles.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  if (cssContent.includes('  ') || cssContent.includes('\\n\\n')) {
    minificationIssues.push('styles.css is not minified.');
  }
}
const jsPath = path.join(ROOT, 'assets', 'calculator.js');
if (fs.existsSync(jsPath)) {
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  if (jsContent.includes('  ') || jsContent.includes('\\n\\n')) {
    minificationIssues.push('calculator.js is not minified.');
  }
}

const faviconExists = fs.existsSync(path.join(ROOT, 'favicon.ico'));


console.log('--- MOBILE & PERFORMANCE (Steps 23-26) ---');
if (missingViewport.length > 0) console.log('Missing Viewport:\n' + missingViewport.join('\n'));
else console.log('✅ Step 23: Viewport tags exist on all pages.');

if (unoptimizedImages.length > 0) console.log('\nUnoptimized Images (Not WebP):\n' + unoptimizedImages.join('\n'));
else console.log('✅ Step 25: All content images are next-gen WebP format.');

if (minificationIssues.length > 0) console.log('\nMinification Issues:\n' + minificationIssues.join('\n'));
else console.log('✅ Step 26: CSS and JS are minified.');

console.log('\n--- STRUCTURED DATA & GLOBAL (Steps 27-30) ---');
if (missingSchema.length > 0) console.log('Missing Schema:\n' + missingSchema.join('\n'));
else console.log('✅ Step 27: JSON-LD Schema verified on all pages.');

if (missingSocial.length > 0) console.log('\nMissing Social Cards:\n' + missingSocial.join('\n'));
else console.log('✅ Step 28: OpenGraph and Twitter Cards verified on all pages.');

if (missingLang.length > 0) console.log('\nMissing lang="en":\n' + missingLang.join('\n'));
else console.log('✅ Step 29: Language tag <html lang="en"> verified on all pages.');

if (faviconExists) console.log('✅ Step 30: favicon.ico exists in root directory.');
else console.log('❌ Step 30: favicon.ico is MISSING.');
