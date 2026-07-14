const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');

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

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(content, { decodeEntities: false });
  const relPath = file.replace(ROOT, '').replace(/\\/g, '/');
  
  const title = $('title').text().trim() || 'Atlanta Pool Removal Pros';
  const desc = $('meta[name="description"]').attr('content') || 'Atlanta Pool Removal Pros';
  const url = `https://atlantapoolremoval.com${relPath === '/index.html' ? '/' : relPath}`;
  const image = 'https://atlantapoolremoval.com/assets/hero.png';

  let toInject = '';

  if ($('meta[property^="og:"]').length === 0) {
    toInject += `
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
  <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="${image}">`;
  }

  if ($('meta[name^="twitter:"]').length === 0) {
    toInject += `
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">
  <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="${image}">`;
  }

  if ($('script[type="application/ld+json"]').length === 0) {
    const isBlog = relPath.includes('/blog/');
    const schemaObj = isBlog ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": desc,
      "image": image,
      "author": { "@type": "Organization", "name": "Atlanta Pool Removal Pros" }
    } : {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Atlanta Pool Removal Pros",
      "image": image,
      "@id": "https://atlantapoolremoval.com/",
      "url": "https://atlantapoolremoval.com/",
      "telephone": "+14045557823",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1234 Roswell Rd NE",
        "addressLocality": "Atlanta",
        "addressRegion": "GA",
        "postalCode": "30319",
        "addressCountry": "US"
      }
    };
    toInject += `\n  <script type="application/ld+json">\n  ${JSON.stringify(schemaObj, null, 2)}\n  </script>`;
  }

  if (toInject) {
    // Escape $ so replace doesn't interpret it
    toInject = toInject.replace(/\$/g, '$$$$');
    let fresh = fs.readFileSync(file, 'utf8');
    fresh = fresh.replace(/<\/head>/i, `${toInject}\n</head>`);
    fs.writeFileSync(file, fresh);
    console.log(`Injected missing metadata for ${relPath}`);
  }
}
