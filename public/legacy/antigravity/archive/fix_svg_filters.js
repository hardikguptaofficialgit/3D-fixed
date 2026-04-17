const fs = require('fs');

const oldDarkSvg = `<feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.070 0.224 0.980" />
                <feFuncG type="table" tableValues="0.020 0.078 0.980" />
                <feFuncB type="table" tableValues="0.030 0.118 0.980" />
            </feComponentTransfer>`;

const oldLightSvg = `<feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.224 1.000" />
                <feFuncG type="table" tableValues="0.078 1.000" />
                <feFuncB type="table" tableValues="0.118 1.000" />
            </feComponentTransfer>`;

const newDarkSvg = `<feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.000 0.180 0.957" />
                <feFuncG type="table" tableValues="0.000 0.275 0.953" />
                <feFuncB type="table" tableValues="0.000 0.192 0.929" />
            </feComponentTransfer>`;

const newLightSvg = `<feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.180 0.957" />
                <feFuncG type="table" tableValues="0.275 0.953" />
                <feFuncB type="table" tableValues="0.192 0.929" />
            </feComponentTransfer>`;

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    let changed = false;
    if (content.includes(oldDarkSvg)) {
        content = content.replace(oldDarkSvg, newDarkSvg);
        changed = true;
    }
    if (content.includes(oldLightSvg)) {
        content = content.replace(oldLightSvg, newLightSvg);
        changed = true;
    }
    
    // Also fix hue-rotate in generate_pages.py
    if (content.includes('hue-rotate(315deg)')) {
        content = content.replace(/hue-rotate\(315deg\)/g, 'hue-rotate(85deg)');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
