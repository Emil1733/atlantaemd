const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'pool-removal.html',
  'pool-demolition.html',
  'cost.html',
  'about.html',
  'contact.html',
  'blog/index.html',
  'blog/atlanta-backyard-renovation-2026.html',
  'blog/is-it-worth-removing-a-pool-in-atlanta.html',
  'blog/marietta-pool-removal-permit-guide.html',
  'blog/cost-of-marietta-pool-removal-compliance.html'
];

console.log('--- STARTING TECHNICAL INTEGRITY AUDIT ---');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Check for unclosed script tags or leaked code
  const scriptCount = (content.match(/<script/g) || []).length;
  const scriptCloseCount = (content.match(/<\/script>/g) || []).length;
  
  if (scriptCount !== scriptCloseCount) {
    console.error(`[FATAL] ${file}: Unbalanced <script> tags! (${scriptCount} open, ${scriptCloseCount} close)`);
  }

  // 2. Check for common leak patterns
  if (content.includes('const leadForm =') && !content.includes('<script>')) {
     console.error(`[FATAL] ${file}: Potential JS code leak detected (code found outside script tag).`);
  }

  // 3. Check for obvious syntax errors in script blocks
  const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/g) || [];
  scripts.forEach((script, i) => {
    // SKIP JSON-LD
    if (script.includes('type="application/ld+json"')) return;
    
    const js = script.replace(/<script[\s\S]*?>|<\/script>/g, '');
    try {
      new Function(js); 
    } catch (e) {
      console.error(`[ERROR] ${file} (Script #${i+1}): Syntax Error - ${e.message}`);
    }
  });

  // 4. Branding Check
  if (!content.includes('Atlanta Pool Removal Pros')) {
    console.warn(`[WARN] ${file}: Missing 'Atlanta Pool Removal Pros' branding.`);
  }

  if (content.includes('Top Pool Removal')) {
    console.error(`[ERROR] ${file}: Found 'Top Pool Removal' reference! (Nationwide conflict)`);
  }

  // 5. Link Integrity
  if (content.includes('href="blog/"') || content.includes('href="./"')) {
    if (!file.startsWith('blog/')) {
       console.error(`[ERROR] ${file}: Found broken directory link 'blog/'. Should be 'blog/index.html'.`);
    } else if (content.includes('href="./"') && content.includes('Expert Blog')) {
       console.error(`[ERROR] ${file}: Found broken directory link './' in expert blog button.`);
    }
  }
});

console.log('--- AUDIT COMPLETE ---');
