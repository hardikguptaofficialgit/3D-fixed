const fs = require('fs');
const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // ---------------------------------------------------------
    // 1. RE-CALIBRATE LIGHT MODE SVG FILTERS
    // ---------------------------------------------------------
    // Previous iterations mapped 0.0 to 0.957 (Cream), which inverted the scene
    // and made shadows bright Cream, creating an ugly washed-out inverted look.
    // For a print-ink look on light mode:
    // Darks(0.0) -> Deep Green
    // Mids(0.5)  -> Forest Green
    // Lights(1.0)-> Natural Cream
    
    // Replace any broken light filters with the perfect standard ink map
    content = content.replace(/<feFuncR type="table" tableValues="[^"]+" \/>/g, (match, offset, str) => {
        // We only want to replace inside duotone-light
        return match; // We will use a more robust regex just below
    });
    
    // Robust exact replacement block for <filter id="duotone-light">
    const lightFilterRegex = /<filter id="duotone-light">[\s\S]*?<\/filter>/;
    content = content.replace(lightFilterRegex, `<filter id="duotone-light">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="gray" />
            <feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.050 0.180 0.957" />
                <feFuncG type="table" tableValues="0.100 0.275 0.953" />
                <feFuncB type="table" tableValues="0.050 0.192 0.929" />
            </feComponentTransfer>
        </filter>`);

    // ---------------------------------------------------------
    // 2. RE-CALIBRATE DARK MODE SVG FILTERS
    // ---------------------------------------------------------
    // Deepen pure black shadows while keeping highlights Cream
    const darkFilterRegex = /<filter id="duotone-dark">[\s\S]*?<\/filter>/;
    content = content.replace(darkFilterRegex, `<filter id="duotone-dark">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="gray" />
            <feComponentTransfer color-interpolation-filters="sRGB">
                <feFuncR type="table" tableValues="0.000 0.000 0.180 0.957" />
                <feFuncG type="table" tableValues="0.000 0.000 0.275 0.953" />
                <feFuncB type="table" tableValues="0.000 0.000 0.192 0.929" />
            </feComponentTransfer>
        </filter>`);

    changed = true;

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fully fixed light mode SVG inversion in ${file}`);
    }
});
