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

const results = [];

walkDir(directoryPath, (filePath) => {
    if (filePath.endsWith('.html')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const issues = [];

        // 1. CLS Audit (Images without width/height)
        const imgTags = content.match(/<img[^>]*>/g) || [];
        imgTags.forEach(img => {
            if (!img.includes('width=') || !img.includes('height=')) {
                issues.push(`[CLS] Image missing dimensions: ${img.substring(0, 50)}...`);
            }
            if (!img.includes('loading="lazy"')) {
                issues.push(`[PERF] Image missing loading="lazy": ${img.substring(0, 50)}...`);
            }
        });

        // 2. Heading Hierarchy Audit
        const h1s = (content.match(/<h1/g) || []).length;
        if (h1s === 0) issues.push(`[SEO] Missing H1 tag`);
        if (h1s > 1) issues.push(`[SEO] Multiple H1 tags (${h1s} found)`);

        // 3. Button/Link ARIA Audit
        const buttons = content.match(/<div[^>]*class="[^"]*btn[^"]*"[^>]*>/g) || [];
        buttons.forEach(btn => {
            if (!btn.includes('role="button"') && !btn.includes('aria-label')) {
                issues.push(`[A11Y] Button-like DIV missing ARIA role/label: ${btn.substring(0, 50)}...`);
            }
        });

        if (issues.length > 0) {
            results.push({ file: fileName, issues });
        }
    }
});

console.log('--- DEEP TECHNICAL SEO & PERF AUDIT ---');
results.forEach(res => {
    console.log(`\nFile: ${res.file}`);
    res.issues.forEach(issue => console.log(`  ${issue}`));
});
console.log('\n--- AUDIT COMPLETE ---');
