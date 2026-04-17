const fs = require('fs');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const darkFilterOut = `        <filter id="duotone-dark">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
            <feComponentTransfer>
                <feFuncR type="table" tableValues="0.0196 0.0431" />
                <feFuncG type="table" tableValues="0.0549 0.1020" />
                <feFuncB type="table" tableValues="0.0275 0.0627" />
            </feComponentTransfer>
        </filter>`;
// Note: 0.0431 0.1020 0.0627 is #0B1A10

const lightFilterOut = `        <filter id="duotone-light">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
            <feComponentTransfer>
                <feFuncR type="table" tableValues="0.8784 0.1490" />
                <feFuncG type="table" tableValues="0.8588 0.2627" />
                <feFuncB type="table" tableValues="0.7725 0.1922" />
            </feComponentTransfer>
        </filter>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Update Dark Mode Surface Color
    content = content.replace(/--surface-color: #122418;/g, '--surface-color: #0B1A10;');
    
    // Update Dark Mode Button to be strictly outlined
    content = content.replace(/--btn-bg: rgba\(87, 193, 111, 0\.15\);/g, '--btn-bg: transparent;');
    content = content.replace(/--btn-border: rgba\(87, 193, 111, 0\.4\);/g, '--btn-border: #57C16F;');
    
    // Replace Filters
    content = content.replace(
        /<filter id="duotone-dark">[\s\S]*?<\/filter>/,
        darkFilterOut
    );

    content = content.replace(
        /<filter id="duotone-light">[\s\S]*?<\/filter>/,
        lightFilterOut
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed: ' + file);
});

console.log('Update complete!');
