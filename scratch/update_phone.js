const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

// Also check the blog directory
const blogDir = path.join(ROOT, 'blog');
if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => {
        files.push(path.join('blog', f));
    });
}

let modifiedCount = 0;

files.forEach(f => {
    const fullPath = path.join(ROOT, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace the exact string (404) 555-7823 with (404) 649-0660
    if (content.includes('(404) 555-7823') || content.includes('404-555-7823') || content.includes('4045557823') || content.includes('404.555.7823')) {
        content = content.replace(/\(404\)\s*555-7823/g, '(404) 649-0660');
        content = content.replace(/404-555-7823/g, '404-649-0660');
        content = content.replace(/4045557823/g, '4046490660');
        content = content.replace(/404\.555\.7823/g, '404.649.0660');
        fs.writeFileSync(fullPath, content);
        modifiedCount++;
    }
});

console.log(`Updated the phone number in ${modifiedCount} files to (404) 649-0660`);
