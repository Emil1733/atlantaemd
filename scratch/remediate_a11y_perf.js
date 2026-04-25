const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/tevat/atlantaemd';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (f !== 'node_modules' && f !== '.git') {
            isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
        }
    });
}

walkDir(directoryPath, (filePath) => {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // 1. Add loading="lazy" to all images that don't have it
        content = content.replace(/<img(?!.*?loading="lazy")([^>]+)>/g, '<img loading="lazy"$1>');

        // 2. Fix Mobile Menu Button A11y
        content = content.replace(/class="mobile-menu-btn"/g, 'class="mobile-menu-btn" role="button" aria-label="Toggle Navigation"');

        // 3. Fix Calculator Options A11y
        content = content.replace(/class="calc-option"/g, 'class="calc-option" role="button" aria-label="Select Calculator Option"');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Remediated: ${filePath}`);
        }
    }
});
