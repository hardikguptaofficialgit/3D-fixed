const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// FIX SVG DUOTONE FILTERS + REMAINING HARDCODED COLORS
//
// DARK duotone: shadows=#050E07 → highlights=#122418
//   (keeps the 3D scene dark/moody, not washed out)
//
// LIGHT duotone: shadows=#264331 → highlights=#E0DBC5
//   (cream/warm tones with forest green shadows)
// ═══════════════════════════════════════════════════════════

const darkFilter = `        <filter id="duotone-dark">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
            <feComponentTransfer>
                <feFuncR type="table" tableValues="0.0196 0.0706" />
                <feFuncG type="table" tableValues="0.0549 0.1412" />
                <feFuncB type="table" tableValues="0.0275 0.0941" />
            </feComponentTransfer>
        </filter>`;

const lightFilter = `        <filter id="duotone-light">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
            <feComponentTransfer>
                <feFuncR type="table" tableValues="0.1490 0.8784" />
                <feFuncG type="table" tableValues="0.2627 0.8588" />
                <feFuncB type="table" tableValues="0.1922 0.7725" />
            </feComponentTransfer>
        </filter>`;

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace dark duotone filter
    content = content.replace(
        /<filter id="duotone-dark">[\s\S]*?<\/filter>/,
        darkFilter
    );

    // Replace light duotone filter
    content = content.replace(
        /<filter id="duotone-light">[\s\S]*?<\/filter>/,
        lightFilter
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed filters: ' + file);
});

console.log('\nDone. Dark duotone: #050E07 -> #122418 | Light duotone: #264331 -> #E0DBC5');
