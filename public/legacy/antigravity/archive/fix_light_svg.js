const fs = require('fs');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.py'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the ugly 3-point light filter with a smooth 2-point filter
    const brokenLightR = `<feFuncR type="table" tableValues="0.957 0.180 0.180" />`;
    const brokenLightG = `<feFuncG type="table" tableValues="0.953 0.275 0.275" />`;
    const brokenLightB = `<feFuncB type="table" tableValues="0.929 0.192 0.192" />`;
    
    const fixedLightR = `<feFuncR type="table" tableValues="0.957 0.180" />`;
    const fixedLightG = `<feFuncG type="table" tableValues="0.953 0.275" />`;
    const fixedLightB = `<feFuncB type="table" tableValues="0.929 0.192" />`;
    
    if (content.includes(brokenLightR)) {
        content = content.replace(brokenLightR, fixedLightR);
        content = content.replace(brokenLightG, fixedLightG);
        content = content.replace(brokenLightB, fixedLightB);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
