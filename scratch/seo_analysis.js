const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/tevat/atlantaemd';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (f !== 'node_modules' && f !== '.git' && f !== 'assets') {
            isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
        }
    });
}

const seoResults = [];

walkDir(directoryPath, (filePath) => {
    if (filePath.endsWith('.html')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        // Extract Title
        const titleMatch = content.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'MISSING';

        // Extract H1
        const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const h1 = h1Match ? h1Match[1].trim() : 'MISSING';

        // Extract Meta Description
        const metaMatch = content.match(/<meta name="description" content="([^"]+)"/);
        const metaDesc = metaMatch ? metaMatch[1] : 'MISSING';

        // Determine target keyword based on filename
        let targetKeyword = fileName.replace('-pool-removal.html', '').replace(/-/g, ' ');
        if (fileName === 'index.html') targetKeyword = 'atlanta pool removal';
        
        // Check presence
        const inTitle = title.toLowerCase().includes(targetKeyword.toLowerCase());
        const inH1 = h1.toLowerCase().includes(targetKeyword.toLowerCase());
        
        // Keyword Density (Simple)
        const wordCount = content.split(/\s+/).length;
        const keywordCount = (content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
        const density = ((keywordCount * targetKeyword.split(' ').length) / wordCount * 100).toFixed(2);

        seoResults.push({
            file: fileName,
            target: targetKeyword,
            title: inTitle ? '✅' : '❌',
            h1: inH1 ? '✅' : '❌',
            density: density + '%',
            words: wordCount
        });
    }
});

console.log('--- ON-SITE SEO KEYWORD ANALYSIS ---');
console.table(seoResults);
console.log('\n--- ANALYSIS COMPLETE ---');
