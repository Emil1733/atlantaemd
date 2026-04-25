const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/tevat/atlantaemd';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(directoryPath, (filePath) => {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/href="blog\/"/g, 'href="blog/index.html"');
        
        if (filePath.includes('blog\\index.html')) {
             newContent = newContent.replace(/href="\.\/"/g, 'href="index.html"');
        }

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
