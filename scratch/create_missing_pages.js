const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Helper to generate a page based on marietta's template
function generatePage(city, county, hubLink, hubText, template) {
  let content = template.replace(/Marietta/g, city);
  content = content.replace(/marietta/g, city.toLowerCase().replace(/\s+/g, '-'));
  
  if (city === 'Kennesaw') {
    content = content.replace('Is your Kennesaw pool a $2,000/year liability?', 'Reclaim your Kennesaw property from high-maintenance pool costs.');
    content = content.replace('As the historic heart of Cobb County', 'Located near the historic Kennesaw Mountain battlefield');
    content = content.replace('Kennesaw Square / Whitlock Corridor', 'Kennesaw State University Corridor');
  } else if (city === 'Vinings') {
    content = content.replace('Is your Vinings pool a $2,000/year liability?', 'Transform your tight-access Vinings lot into premium outdoor living space.');
    content = content.replace('As the historic heart of Cobb County', 'Nestled along the Chattahoochee River corridor');
    content = content.replace('Vinings Square / Whitlock Corridor', 'Paces Ferry & Chattahoochee Corridors');
    content = content.replace('Kennesaw Mountain / West Cobb', 'Inside The Perimeter (ITP) Logistics');
  } else if (city === 'Woodstock') {
    content = content.replace(/Cobb County/g, 'Cherokee County');
    content = content.replace('Is your Woodstock pool a $2,000/year liability?', 'Eliminate your Woodstock pool liability and expand your backyard.');
    content = content.replace('As the historic heart of Cherokee County', 'As one of Metro Atlanta’s fastest-growing suburbs');
    content = content.replace('Woodstock Square / Whitlock Corridor', 'Towne Lake Corridor');
    content = content.replace('Kennesaw Mountain / West Cobb', 'Downtown Woodstock Proximity');
    content = content.replace('cobb-county-pool-removal.html', 'index.html');
    content = content.replace('Cobb Permits', 'Atlanta Home');
  }

  // Update canonical
  const slug = city.toLowerCase().replace(/\s+/g, '-');
  content = content.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="https://atlantapoolremoval.com/${slug}-pool-removal.html">`);

  fs.writeFileSync(path.join(ROOT, `${slug}-pool-removal.html`), content);
  console.log(`Created: ${slug}-pool-removal.html`);
}

const template = fs.readFileSync(path.join(ROOT, 'marietta-pool-removal.html'), 'utf8');

generatePage('Kennesaw', 'Cobb', 'cobb-county-pool-removal.html', 'Cobb County', template);
generatePage('Vinings', 'Cobb', 'cobb-county-pool-removal.html', 'Cobb County', template);
generatePage('Woodstock', 'Cherokee', 'index.html', 'Atlanta Home', template);

// 2. Add them to sitemap
let sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const newUrls = `
  <url>
    <loc>https://atlantapoolremoval.com/kennesaw-pool-removal.html</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://atlantapoolremoval.com/vinings-pool-removal.html</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://atlantapoolremoval.com/woodstock-pool-removal.html</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
`;
sitemap = sitemap.replace('</urlset>', newUrls + '</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('Updated sitemap.xml');

// 3. Add to internal link audit target URLs
let auditScript = fs.readFileSync(path.join(ROOT, 'scratch', 'internal_link_audit.js'), 'utf8');
if (!auditScript.includes('kennesaw-pool-removal.html')) {
  auditScript = auditScript.replace(
    `    { path: '/suwanee-pool-removal.html', keyword: 'pool removal suwanee' },`,
    `    { path: '/suwanee-pool-removal.html', keyword: 'pool removal suwanee' },
    { path: '/kennesaw-pool-removal.html', keyword: 'pool removal kennesaw' },
    { path: '/vinings-pool-removal.html', keyword: 'pool removal vinings' },
    { path: '/woodstock-pool-removal.html', keyword: 'pool removal woodstock' },`
  );
  fs.writeFileSync(path.join(ROOT, 'scratch', 'internal_link_audit.js'), auditScript);
  console.log('Updated scratch/internal_link_audit.js');
}

// 4. Update gsc_audit.js URLs
let gscAudit = fs.readFileSync(path.join(ROOT, 'gsc_audit.js'), 'utf8');
if (!gscAudit.includes('kennesaw-pool-removal.html')) {
  gscAudit = gscAudit.replace(
    `'/alpharetta-pool-removal.html'`,
    `'/alpharetta-pool-removal.html',
  '/kennesaw-pool-removal.html',
  '/vinings-pool-removal.html',
  '/woodstock-pool-removal.html'`
  );
  fs.writeFileSync(path.join(ROOT, 'gsc_audit.js'), gscAudit);
  console.log('Updated gsc_audit.js');
}

// 5. Link from Cobb Hub
let cobbHub = fs.readFileSync(path.join(ROOT, 'cobb-county-pool-removal.html'), 'utf8');
if (!cobbHub.includes('kennesaw-pool-removal.html')) {
  const newCards = `
        <!-- Kennesaw -->
        <div class="card" style="padding: 30px; background: white;">
          <h3 style="color: var(--primary-orange); margin-bottom: 15px;">Kennesaw</h3>
          <p>Navigating historic proximities and Kennesaw Mountain topography. Specialized slope-stabilization protocols.</p>
          <a href="kennesaw-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Kennesaw Pool Removal Guide &rarr;</a>
        </div>

        <!-- Vinings -->
        <div class="card" style="padding: 30px; background: white;">
          <h3 style="color: var(--primary-orange); margin-bottom: 15px;">Vinings</h3>
          <p>Surgical extraction techniques for high-density, luxury properties. Protecting mature CRZs and tight ingress points.</p>
          <a href="vinings-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Vinings Pool Removal Guide &rarr;</a>
        </div>
`;
  // Let's find where to insert. Look for Smyrna maybe? Wait, Cobb only had Marietta.
  // We'll just replace the Marietta card and add the others below it.
  cobbHub = cobbHub.replace(
    `        <div class="card" style="padding: 30px; background: white;">
          <h3 style="color: var(--primary-orange); margin-bottom: 15px;">Marietta</h3>
          <p>Navigating historic districts and tight-access constraints in the city center. Specialized protocols for zero-impact operations.</p>
          <a href="marietta-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Marietta Pool Removal Guide &rarr;</a>
        </div>`,
    `        <div class="card" style="padding: 30px; background: white;">
          <h3 style="color: var(--primary-orange); margin-bottom: 15px;">Marietta</h3>
          <p>Navigating historic districts and tight-access constraints in the city center. Specialized protocols for zero-impact operations.</p>
          <a href="marietta-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Marietta Pool Removal Guide &rarr;</a>
        </div>
${newCards}`
  );
  fs.writeFileSync(path.join(ROOT, 'cobb-county-pool-removal.html'), cobbHub);
  console.log('Updated cobb-county-pool-removal.html with Kennesaw and Vinings cards.');
}

// 6. Link Woodstock from index.html
let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!indexHtml.includes('woodstock-pool-removal.html')) {
  // Add to footer
  indexHtml = indexHtml.replace(
    `<li style="margin-bottom: 10px;"><a href="buford-pool-removal.html" style="color: white; text-decoration: none;">Buford</a></li>`,
    `<li style="margin-bottom: 10px;"><a href="buford-pool-removal.html" style="color: white; text-decoration: none;">Buford</a></li>
            <li style="margin-bottom: 10px;"><a href="woodstock-pool-removal.html" style="color: white; text-decoration: none;">Woodstock</a></li>`
  );
  fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml);
  console.log('Updated index.html with Woodstock link.');
}
