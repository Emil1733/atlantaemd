const fs = require('fs');
const path = require('path');

// List of pages that ACTUALLY exist in the filesystem
const existingPages = [
  'index.html',
  'pool-removal.html',
  'pool-demolition.html',
  'cost.html',
  'about.html',
  'contact.html',
  'atlanta-pool-removal-permits.html',
  'cobb-county-pool-removal.html',
  'decatur-pool-removal.html',
  'peachtree-city-pool-removal.html',
  'marietta-pool-removal.html',
  'alpharetta-pool-removal.html',
  'sandy-springs-pool-removal.html',
  'roswell-pool-removal.html',
  'fulton-county-pool-removal.html',
  'dekalb-county-pool-removal.html',
  'blog/is-your-atlanta-pool-a-money-pit.html'
];

const filesToClean = [
  'index.html',
  'pool-removal.html',
  'pool-demolition.html',
  'cost.html',
  'about.html',
  'contact.html',
  'atlanta-pool-removal-permits.html',
  'cobb-county-pool-removal.html',
  'decatur-pool-removal.html',
  'peachtree-city-pool-removal.html',
  'marietta-pool-removal.html',
  'alpharetta-pool-removal.html',
  'sandy-springs-pool-removal.html',
  'roswell-pool-removal.html',
  'fulton-county-pool-removal.html',
  'dekalb-county-pool-removal.html'
];

filesToClean.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Identify all <a> tags
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
    let match;
    let modified = false;

    while ((match = linkRegex.exec(content)) !== null) {
        const href = match[1];
        
        // Skip external links, anchors, or relative jumps
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) continue;
        
        // Clean the href to check against existing pages
        let cleanHref = href.split('#')[0].split('?')[0];
        if (cleanHref.startsWith('./')) cleanHref = cleanHref.substring(2);
        
        // If the page doesn't exist, remove the link (keep text) or link to parent hub
        if (!existingPages.includes(cleanHref) && cleanHref !== '') {
            console.log(`404 detected in ${file}: ${href}`);
            
            // Map 404s to their county hubs if possible
            let replacement = '#';
            if (href.includes('buckhead') || href.includes('sandy-springs') || href.includes('alpharetta') || href.includes('milton') || href.includes('johns-creek')) {
                replacement = 'fulton-county-pool-removal.html';
            } else if (href.includes('marietta') || href.includes('smyrna') || href.includes('kennesaw')) {
                replacement = 'cobb-county-pool-removal.html';
            } else if (href.includes('decatur') || href.includes('brookhaven') || href.includes('dunwoody') || href.includes('avondale')) {
                replacement = 'dekalb-county-pool-removal.html';
            }

            // Replace the href with the hub or # to save crawl budget
            const fullTag = match[0];
            const newTag = fullTag.replace(`href="${href}"`, `href="${replacement}"`);
            content = content.replace(fullTag, newTag);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Cleaned crawl budget waste in ${file}`);
    }
});
