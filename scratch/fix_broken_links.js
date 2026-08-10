const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const replacements = [
  {
    file: 'kennesaw-pool-removal.html',
    fixes: [
      { from: 'blog/kennesaw-pool-removal-permit-guide.html', to: 'blog/marietta-pool-removal-permit-guide.html' },
      { from: 'blog/cost-of-kennesaw-pool-removal-compliance.html', to: 'blog/cost-of-marietta-pool-removal-compliance.html' },
      { from: 'pool-removal-kennesaw-case-study.html', to: 'pool-removal-marietta-case-study.html' }
    ]
  },
  {
    file: 'vinings-pool-removal.html',
    fixes: [
      { from: 'blog/vinings-pool-removal-permit-guide.html', to: 'blog/marietta-pool-removal-permit-guide.html' },
      { from: 'blog/cost-of-vinings-pool-removal-compliance.html', to: 'blog/cost-of-marietta-pool-removal-compliance.html' },
      { from: 'pool-removal-vinings-case-study.html', to: 'pool-removal-marietta-case-study.html' }
    ]
  },
  {
    file: 'woodstock-pool-removal.html',
    fixes: [
      { from: 'blog/woodstock-pool-removal-permit-guide.html', to: 'blog/marietta-pool-removal-permit-guide.html' },
      { from: 'blog/cost-of-woodstock-pool-removal-compliance.html', to: 'blog/cost-of-marietta-pool-removal-compliance.html' },
      { from: 'pool-removal-woodstock-case-study.html', to: 'pool-removal-marietta-case-study.html' }
    ]
  },
  {
    file: 'lawrenceville-pool-removal.html',
    fixes: [
      { from: 'lawrenceville_pool_removal_machinery_1777146180986.png', to: 'assets/hero.png' }
    ]
  }
];

replacements.forEach(r => {
  const filePath = path.join(ROOT, r.file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  r.fixes.forEach(fix => {
    content = content.replace(new RegExp(fix.from, 'g'), fix.to);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed links in ' + r.file);
  }
});
