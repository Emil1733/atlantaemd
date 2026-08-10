const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 1. Fix Woodstock Orphan
const cobbPath = path.join(ROOT, 'cobb-county-pool-removal.html');
let cobbContent = fs.readFileSync(cobbPath, 'utf8');
if (!cobbContent.includes('woodstock-pool-removal.html')) {
  // Inject into the Cobb County local hub section
  cobbContent = cobbContent.replace(
    /<a href="vinings-pool-removal\.html".*?>Vinings →<\/a>/g,
    `<a href="vinings-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Vinings →</a>\n            <a href="woodstock-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Woodstock →</a>`
  );
  // If Vinings wasn't there (maybe it was added differently), let's fallback to Kennesaw or Marietta
  if (!cobbContent.includes('Woodstock →')) {
    cobbContent = cobbContent.replace(
      /<a href="marietta-pool-removal\.html".*?>Marietta →<\/a>/g,
      `<a href="marietta-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Marietta →</a>\n            <a href="kennesaw-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Kennesaw →</a>\n            <a href="vinings-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Vinings →</a>\n            <a href="woodstock-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Woodstock →</a>`
    );
  }
  fs.writeFileSync(cobbPath, cobbContent);
  console.log('Fixed Woodstock/Kennesaw/Vinings orphan status in cobb-county-pool-removal.html');
}

// Ensure index.html also links to them in the Local Neighborhood Hub
const indexPath = path.join(ROOT, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('woodstock-pool-removal.html')) {
  indexContent = indexContent.replace(
    /<a href="marietta-pool-removal\.html".*?>Marietta →<\/a>/g,
    `<a href="marietta-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Marietta →</a>\n            <a href="kennesaw-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Kennesaw →</a>\n            <a href="vinings-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Vinings →</a>\n            <a href="woodstock-pool-removal.html" style="color: var(--primary-orange); font-weight: 700;">Woodstock →</a>`
  );
  fs.writeFileSync(indexPath, indexContent);
  console.log('Fixed Woodstock/Kennesaw/Vinings orphan status in index.html');
}

// 2. Fix Blog Orphan
const blogIndexPath = path.join(ROOT, 'blog', 'index.html');
let blogContent = fs.readFileSync(blogIndexPath, 'utf8');
if (!blogContent.includes('is-your-atlanta-pool-a-money-pit.html')) {
  const newCard = `
        <div class="card">
          <p style="text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: var(--primary-orange); margin-bottom: 5px; font-size: 0.8rem;">Cost Analysis</p>
          <h2 style="margin-bottom: 15px;"><a href="is-your-atlanta-pool-a-money-pit.html">Is Your Atlanta Pool a Money Pit in 2026?</a></h2>
          <p style="margin-bottom: 20px; color: var(--text-muted);">A deep dive into the hidden costs of repairing aging pools versus reclaiming your yard completely.</p>
          <a href="is-your-atlanta-pool-a-money-pit.html" style="color: var(--primary-orange); font-weight: 600;">Read Financial Breakdown →</a>
        </div>`;
  
  // Inject right before the last closing </div> of the grid-2
  blogContent = blogContent.replace(
    /(<a href="cost-of-marietta-pool-removal-compliance\.html".*?<\/a>\s*<\/div>\s*)(<\/div>)/,
    `$1${newCard}\n      $2`
  );
  fs.writeFileSync(blogIndexPath, blogContent);
  console.log('Fixed blog orphan status in blog/index.html');
}
