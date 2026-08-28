const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let i = 0;
files.forEach(f => {
  const filePath = path.join(__dirname, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const oldContent = content;
  content = content.replace(/https:\/\/images\.unsplash\.com\/[^'\"\)]+/g, () => {
    return i++ % 2 === 0 ? 'assets/hero_excavator.jpg' : 'assets/hero_grading.jpg';
  });
  if (content !== oldContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + f);
  }
});
