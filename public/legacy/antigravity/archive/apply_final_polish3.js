const fs = require('fs');
const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Glass Border Adjustments
    const oldGlass12 = '--glass-border: rgba(46, 70, 49, 0.12)';
    const newGlass15 = '--glass-border: rgba(46, 70, 49, 0.15)';
    const oldGlass08 = '--glass-border: rgba(46, 70, 49, 0.08)';
    
    if (content.includes(oldGlass12)) {
        content = content.replace(new RegExp(oldGlass12.replace('(', '\\(').replace(')', '\\)'), 'g'), newGlass15);
        changed = true;
    } else if (content.includes(oldGlass08)) {
        content = content.replace(new RegExp(oldGlass08.replace('(', '\\(').replace(')', '\\)'), 'g'), newGlass15);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated Glass Border in ${file}`);
    }
});
