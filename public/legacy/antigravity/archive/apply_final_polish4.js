const fs = require('fs');
const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fixing SVG duotone-light to map mid-tones PRECISELY to Forest Green mathematically.
    // If black is Cream (0.957), and mid-tone is Green (0.180), and white is Pure Ink (0.000)
    // this perfectly preserves 3D depth without washing out or pancaking into a solid blob.
    
    const oldLightR = `<feFuncR type="table" tableValues="0.957 0.180 0.050" />`;
    const oldLightG = `<feFuncG type="table" tableValues="0.953 0.275 0.080" />`;
    const oldLightB = `<feFuncB type="table" tableValues="0.929 0.192 0.100" />`;
    
    const newLightR = `<feFuncR type="table" tableValues="0.957 0.180 0.000" />`;
    const newLightG = `<feFuncG type="table" tableValues="0.953 0.275 0.000" />`;
    const newLightB = `<feFuncB type="table" tableValues="0.929 0.192 0.000" />`;
    
    if (content.includes(oldLightR)) {
        content = content.replace(oldLightR, newLightR);
        content = content.replace(oldLightG, newLightG);
        content = content.replace(oldLightB, newLightB);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated SVG Ink Logic in ${file}`);
    }
});
