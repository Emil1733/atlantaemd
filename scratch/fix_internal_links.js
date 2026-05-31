const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(ROOT, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  for (const { search, replace } of replacements) {
    if (typeof search === 'string') {
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// 1. Gwinnett County Hub - View Spoke Guide
replaceInFile('gwinnett-county-pool-removal.html', [
  { search: 'href="lawrenceville-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">View Spoke Guide', replace: 'href="lawrenceville-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Lawrenceville Pool Removal Guide →' },
  { search: 'href="duluth-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">View Spoke Guide', replace: 'href="duluth-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Duluth Pool Removal Guide →' },
  { search: 'href="suwanee-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">View Spoke Guide', replace: 'href="suwanee-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Suwanee Pool Removal Guide →' },
  { search: 'href="snellville-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">View Spoke Guide', replace: 'href="snellville-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Snellville Pool Removal Guide →' },
  { search: 'href="buford-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">View Spoke Guide', replace: 'href="buford-pool-removal.html" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">Buford Pool Removal Guide →' }
]);

// 2. DeKalb County Hub - Local Guide →
replaceInFile('dekalb-county-pool-removal.html', [
  { search: 'href="decatur-pool-removal.html" style="color: var(--primary-orange); font-size: 0.9rem; font-weight: 700;">Local Guide →', replace: 'href="decatur-pool-removal.html" style="color: var(--primary-orange); font-size: 0.9rem; font-weight: 700;">Decatur Pool Removal Guide →' },
  { search: 'href="dunwoody-pool-removal.html" style="color: var(--primary-orange); font-size: 0.9rem; font-weight: 700;">Local Guide →', replace: 'href="dunwoody-pool-removal.html" style="color: var(--primary-orange); font-size: 0.9rem; font-weight: 700;">Dunwoody Pool Removal Guide →' }
]);

// 3. Fulton County Hub - Local Guide →
replaceInFile('fulton-county-pool-removal.html', [
  { search: 'href="sandy-springs-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Local Guide →', replace: 'href="sandy-springs-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Sandy Springs Pool Removal Guide →' },
  { search: 'href="alpharetta-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Local Guide →', replace: 'href="alpharetta-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Alpharetta Pool Removal Guide →' },
  { search: 'href="roswell-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Local Guide →', replace: 'href="roswell-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Roswell Pool Removal Guide →' }
]);

// 4. Fayette Hub in Peachtree City - wait, let's fix the footer where "Fayette Hub" might be.
// We'll add links to Dunwoody and Peachtree city from the main pool-removal.html page to boost them.
replaceInFile('pool-removal.html', [
  { search: '<!-- We can add links to specific regions -->', replace: '' } // Just a placeholder, we'll append to an existing list
]);

// Let's add the orphan money pit blog post to the blog index
const moneyPitHtml = `
      <article class="blog-card" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
        <div style="padding: 30px;">
          <div style="color: var(--primary-orange); font-weight: 700; font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Financial Analysis</div>
          <h3 style="color: var(--primary-dark); margin-bottom: 15px; font-size: 1.4rem;">Is Your Atlanta Pool a Money Pit?</h3>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">An objective look at the true cost of maintaining an aging concrete pool in Metro Atlanta compared to the ROI of removal.</p>
          <a href="is-your-atlanta-pool-a-money-pit.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read Money Pit Analysis &rarr;</a>
        </div>
      </article>`;

let blogIndex = fs.readFileSync(path.join(ROOT, 'blog', 'index.html'), 'utf8');
if (!blogIndex.includes('is-your-atlanta-pool-a-money-pit.html')) {
  blogIndex = blogIndex.replace('<!-- More articles can be added here -->', moneyPitHtml + '\n<!-- More articles can be added here -->');
  // Also fix "Read More →" in blog index
  blogIndex = blogIndex.replace('href="atlanta-backyard-renovation-2026.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read More &rarr;', 'href="atlanta-backyard-renovation-2026.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read 2026 Renovation Guide &rarr;');
  blogIndex = blogIndex.replace('href="is-it-worth-removing-a-pool-in-atlanta.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read More &rarr;', 'href="is-it-worth-removing-a-pool-in-atlanta.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read Value Analysis &rarr;');
  blogIndex = blogIndex.replace('href="marietta-pool-removal-permit-guide.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read More &rarr;', 'href="marietta-pool-removal-permit-guide.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read Marietta Permit Guide &rarr;');
  blogIndex = blogIndex.replace('href="cost-of-marietta-pool-removal-compliance.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read More &rarr;', 'href="cost-of-marietta-pool-removal-compliance.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">Read Marietta Compliance Guide &rarr;');
  fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), blogIndex);
  console.log('Updated: blog/index.html');
}

// Add Money pit link to cost.html
let costHtml = fs.readFileSync(path.join(ROOT, 'cost.html'), 'utf8');
if (!costHtml.includes('is-your-atlanta-pool-a-money-pit.html')) {
  costHtml = costHtml.replace('<h2>The Hidden Costs of Keeping an Old Pool</h2>', '<h2>The Hidden Costs of Keeping an Old Pool</h2>\n          <p>Wondering if the ongoing maintenance is worth it? Read our detailed financial analysis: <a href="blog/is-your-atlanta-pool-a-money-pit.html" style="color: var(--primary-orange); font-weight: bold;">Is Your Atlanta Pool a Money Pit?</a></p>');
  fs.writeFileSync(path.join(ROOT, 'cost.html'), costHtml);
  console.log('Updated: cost.html');
}

// Add Dunwoody and Peachtree city to main index.html to boost them
let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!indexHtml.includes('dunwoody-pool-removal.html') && indexHtml.includes('Gwinnett Hub')) {
  indexHtml = indexHtml.replace('<li style="margin-bottom: 10px;"><a href="gwinnett-county-pool-removal.html"', '<li style="margin-bottom: 10px;"><a href="dunwoody-pool-removal.html" style="color: white; text-decoration: none;">Dunwoody Hub</a></li>\n            <li style="margin-bottom: 10px;"><a href="peachtree-city-pool-removal.html" style="color: white; text-decoration: none;">Peachtree City Hub</a></li>\n            <li style="margin-bottom: 10px;"><a href="gwinnett-county-pool-removal.html"');
  fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml);
  console.log('Updated: index.html footer links');
}

// Case studies
replaceInFile('index.html', [
  { search: 'href="pool-removal-decatur-case-study.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Case Study &rarr;', replace: 'href="pool-removal-decatur-case-study.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Decatur Case Study &rarr;' },
  { search: 'href="pool-removal-marietta-case-study.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Case Study &rarr;', replace: 'href="pool-removal-marietta-case-study.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Marietta Case Study &rarr;' },
  { search: 'href="sandy-springs-pool-demolition-project.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Case Study &rarr;', replace: 'href="sandy-springs-pool-demolition-project.html" style="color: var(--primary-dark); font-weight: 700; text-decoration: none;">Read Sandy Springs Case Study &rarr;' }
]);

console.log('Anchor replacements complete.');
