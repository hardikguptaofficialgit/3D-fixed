const fs = require('fs');
const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Theme Variables
    if (content.includes('--text-secondary: rgba(46, 70, 49, 0.75)')) {
        content = content.replace(/--text-secondary: rgba\(46, 70, 49, 0.75\)/g, '--text-secondary: rgba(46, 70, 49, 0.7)');
        changed = true;
    }
    if (content.includes('--glass-border: rgba(46, 70, 49, 0.08)')) {
        content = content.replace(/--glass-border: rgba\(46, 70, 49, 0.08\)/g, '--glass-border: rgba(46, 70, 49, 0.12)');
        changed = true;
    }

    // 2. Buttons in Light Mode
    // The user wants default light mode buttons to be solid green block: --btn-bg: #2E4631, --btn-text: #F4F3ED
    // We target .light-theme specifically.
    const lightThemeRegex = /(\.light-theme\s*\{[^}]*--btn-bg:\s*)transparent([^}]*--btn-text:\s*)#[0-9a-fA-F]+([^}]*--btn-hover-bg:\s*)#[0-9a-fA-F]+([^}]*--btn-hover-text:\s*)#[0-9a-fA-F]+/g;
    content = content.replace(lightThemeRegex, (match, p1, p2, p3, p4) => {
        changed = true;
        return p1 + '#2E4631' + p2 + '#F4F3ED' + p3 + 'transparent' + p4 + '#2E4631';
    });

    // 3. Dark Mode Buttons
    // The user wants :root (dark mode) hover buttons to be: --btn-hover-bg: #F4F3ED, --btn-hover-text: #000000.
    const rootThemeRegex = /(:root\s*\{[^}]*--btn-hover-bg:\s*)#[0-9a-fA-F]+([^}]*--btn-hover-text:\s*)#[0-9a-fA-F]+/g;
    content = content.replace(rootThemeRegex, (match, p1, p2) => {
        changed = true;
        return p1 + '#F4F3ED' + p2 + '#000000';
    });
    
    // Fallback simple replacement for light mode buttons if regex missed
    if (content.includes('--btn-bg: transparent;') && content.includes('--glass-bg: rgba(46, 70, 49, 0.05);')) {
        content = content.replace(/--btn-bg: transparent;/g, '--btn-bg: #2E4631;');
        content = content.replace(/--btn-text: #2E4631;/g, '--btn-text: #F4F3ED;');
        content = content.replace(/--btn-hover-bg: #2E4631;/g, '--btn-hover-bg: transparent;');
        content = content.replace(/--btn-hover-text: #F4F3ED;/g, '--btn-hover-text: #2E4631;');
        changed = true;
    }

    // 4. SVG Filter Recalibration
    // "Optimize duotone-dark to deepen the Pure Black shadows while keeping the highlights Cream."
    // Let's use a 4-point table to push more black into the shadows: 0.000 0.000 0.180 0.957
    const oldDarkR = `<feFuncR type="table" tableValues="0.000 0.180 0.957" />`;
    const oldDarkG = `<feFuncG type="table" tableValues="0.000 0.275 0.953" />`;
    const oldDarkB = `<feFuncB type="table" tableValues="0.000 0.192 0.929" />`;
    
    const newDarkR = `<feFuncR type="table" tableValues="0.000 0.000 0.180 0.957" />`;
    const newDarkG = `<feFuncG type="table" tableValues="0.000 0.000 0.275 0.953" />`;
    const newDarkB = `<feFuncB type="table" tableValues="0.000 0.000 0.192 0.929" />`;
    
    if (content.includes(oldDarkR)) {
        content = content.replace(oldDarkR, newDarkR);
        content = content.replace(oldDarkG, newDarkG);
        content = content.replace(oldDarkB, newDarkB);
        changed = true;
    }

    // "duotone-light so the 3D scene mid-tones are mapped precisely to Forest Green"
    // We already used a 2 point linear: 0.957 0.180 earlier to stop the puddle effect.
    // If the user REALLY wants midtones precisely mapped to green, we'll re-apply the 3-point table:
    // 0.957 0.180 0.180 (Wait, I'll use 0.957 0.180 0.050 to give it edge contrast so it doesn't totally flatten).
    const oldLightR = `<feFuncR type="table" tableValues="0.180 0.957" />`;
    const oldLightG = `<feFuncG type="table" tableValues="0.275 0.953" />`;
    const oldLightB = `<feFuncB type="table" tableValues="0.192 0.929" />`;
    
    const newLightR = `<feFuncR type="table" tableValues="0.957 0.180 0.050" />`;
    const newLightG = `<feFuncG type="table" tableValues="0.953 0.275 0.080" />`;
    const newLightB = `<feFuncB type="table" tableValues="0.929 0.192 0.100" />`;
    
    if (content.includes(oldLightR)) {
        content = content.replace(oldLightR, newLightR);
        content = content.replace(oldLightG, newLightG);
        content = content.replace(oldLightB, newLightB);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Polished ${file}`);
    }
});
