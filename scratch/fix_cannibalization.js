const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

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

const files = getHtmlFiles(ROOT);
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. "read more →"
  content = content.replace(/<a([^>]+href="[^"]*atlanta-backyard-renovation-2026\.html"[^>]*)>Read More →<\/a>/gi, '<a$1>Read Renovation Guide →</a>');
  content = content.replace(/<a([^>]+href="[^"]*is-it-worth-removing-a-pool-in-atlanta\.html"[^>]*)>Read More →<\/a>/gi, '<a$1>Read ROI Analysis →</a>');
  content = content.replace(/<a([^>]+href="[^"]*marietta-pool-removal-permit-guide\.html"[^>]*)>Read More →<\/a>/gi, '<a$1>Read Permit Guide →</a>');
  content = content.replace(/<a([^>]+href="[^"]*cost-of-marietta-pool-removal-compliance\.html"[^>]*)>Read More →<\/a>/gi, '<a$1>Read Compliance Cost Guide →</a>');

  // 2. "read case study →"
  content = content.replace(/<a([^>]+href="[^"]*pool-removal-marietta-case-study\.html"[^>]*)>Read Case Study →<\/a>/gi, '<a$1>Read Marietta Case Study →</a>');
  content = content.replace(/<a([^>]+href="[^"]*sandy-springs-pool-demolition-project\.html"[^>]*)>Read Case Study →<\/a>/gi, '<a$1>Read Sandy Springs Case Study →</a>');
  content = content.replace(/<a([^>]+href="[^"]*pool-removal-decatur-case-study\.html"[^>]*)>Read Case Study →<\/a>/gi, '<a$1>Read Decatur Case Study →</a>');

  // 3. "cobb county permit requirements" -> fix ambiguity
  content = content.replace(/<a([^>]+href="[^"]*cobb-county-pool-removal\.html"[^>]*)>\s*Cobb County Permit Requirements\s*<\/a>/gi, '<a$1>Cobb County Regional Guide</a>');

  // 4. "pool demolition in atlanta"
  content = content.replace(/<a([^>]+href="(?:index\.html|\/|https:\/\/atlantapoolremoval\.com\/?)"[^>]*)>\s*pool demolition in Atlanta\s*<\/a>/gi, '<a$1>Atlanta Pool Demolition Company</a>');

  // 5. "pool removal in atlanta"
  content = content.replace(/<a([^>]+href="[^"]*pool-removal\.html"[^>]*)>\s*pool removal in Atlanta\s*<\/a>/gi, '<a$1>Atlanta Pool Removal Guide</a>');

  // 6. "dekalb permits"
  content = content.replace(/<a([^>]+href="[^"]*dekalb-county-pool-removal\.html"[^>]*)>\s*DeKalb Permits\s*<\/a>/gi, '<a$1>DeKalb County Hub</a>');

  // 7. "atlanta home"
  content = content.replace(/<a([^>]+href="[^"]*cobb-county-pool-removal\.html"[^>]*)>\s*Atlanta Home\s*<\/a>/gi, '<a$1>Cobb County Hub</a>');
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${path.basename(file)}`);
    totalChanges++;
  }
}
console.log(`Total files updated: ${totalChanges}`);
