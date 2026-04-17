const fs = require('fs');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Correct the duotone-light filter mapping!
    // Darks MUST map to GREEN (0.180), and Highlights to CREAM (0.957).
    // The previous 0.957 -> 0.180 created a negative effect.
    const brokenLightR = `<feFuncR type="table" tableValues="0.957 0.180" />`;
    const brokenLightG = `<feFuncG type="table" tableValues="0.953 0.275" />`;
    const brokenLightB = `<feFuncB type="table" tableValues="0.929 0.192" />`;
    
    const fixedLightR = `<feFuncR type="table" tableValues="0.180 0.957" />`;
    const fixedLightG = `<feFuncG type="table" tableValues="0.275 0.953" />`;
    const fixedLightB = `<feFuncB type="table" tableValues="0.192 0.929" />`;

    // Also catch the 3-point one just in case it's lingering
    const broken3LightR = `<feFuncR type="table" tableValues="0.957 0.180 0.180" />`;
    const broken3LightG = `<feFuncG type="table" tableValues="0.953 0.275 0.275" />`;
    const broken3LightB = `<feFuncB type="table" tableValues="0.929 0.192 0.192" />`;
    
    if (content.includes(brokenLightR)) {
        content = content.replace(brokenLightR, fixedLightR);
        content = content.replace(brokenLightG, fixedLightG);
        content = content.replace(brokenLightB, fixedLightB);
        changed = true;
    } else if (content.includes(broken3LightR)) {
        content = content.replace(broken3LightR, fixedLightR);
        content = content.replace(broken3LightG, fixedLightG);
        content = content.replace(broken3LightB, fixedLightB);
        changed = true;
    }

    // 2. Motion Polish
    const oldTransition = `transition: color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease !important;`;
    const newTransition = `transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;`;
    
    if (content.includes(oldTransition)) {
        content = content.replace(oldTransition, newTransition);
        changed = true;
    }
    
    // Expand the 'h1, h2, h3...' selector to be far more complete for cinematic effect
    const oldSelector = `h1, h2, h3, h4, p, span, a, .brand-text-logo {`;
    const newSelector = `h1, h2, h3, h4, p, span, a, button, .brand-text-logo, .btn, .nav-btn, .process-step::after {`;
    if (content.includes(oldSelector)) {
        content = content.replace(oldSelector, newSelector);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Polished ${file}`);
    }
});
