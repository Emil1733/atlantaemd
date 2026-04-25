const fs = require('fs');
const path = require('path');

function getWordCount(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extract body content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (!bodyMatch) return 0;
    
    let text = bodyMatch[1];
    // Remove scripts
    text = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    // Remove styles
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    // Remove all HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    // Remove extra whitespace
    text = text.trim().replace(/\s+/g, ' ');
    
    return text.split(' ').filter(word => word.length > 0).length;
}

const rootFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const blogFiles = fs.readdirSync('blog').filter(f => f.endsWith('.html')).map(f => path.join('blog', f));

const allFiles = [...rootFiles, ...blogFiles];

console.log('| Page Filename | Word Count | Status |');
console.log('| :--- | :--- | :--- |');

allFiles.forEach(file => {
    try {
        const count = getWordCount(file);
        let status = count >= 2000 ? '✅ High Authority' : (count >= 1000 ? '🟡 Mid-Tier' : '🔴 Thin');
        if (file === 'index.html') status = '🏠 Homepage';
        console.log(`| ${file} | ${count.toLocaleString()} words | ${status} |`);
    } catch (e) {
        console.log(`| ${file} | Error counting | N/A |`);
    }
});
