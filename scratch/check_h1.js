const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const ROOT = path.join(__dirname, '..');
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const $ = cheerio.load(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  console.log(f + ' => ' + $('h1').text().trim());
});
