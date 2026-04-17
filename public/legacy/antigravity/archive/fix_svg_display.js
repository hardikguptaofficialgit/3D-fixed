const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (let f of files) {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content.replace(
        /<svg style="display:\s*none;?" aria-hidden="true" focusable="false">/g,
        '<svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true" focusable="false">'
    );
    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        console.log('Fixed SVG in ' + f);
    }
}
console.log('Done.');
