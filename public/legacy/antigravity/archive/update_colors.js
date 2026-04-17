const fs = require('fs');

const path = require('path');

const cssRoot = `        :root {
            /* DARK MODE PALETTE - PREMIUM STUDIO ENFORCEMENT */
            --bg-color: #000000;
            --text-color: #F4F3ED;
            
            /* Premium Glass Elements (Ultra-subtle, polished crystal look) */
            --glass-bg: rgba(244, 243, 237, 0.05);
            --glass-border: rgba(244, 243, 237, 0.1);
            --glass-hover: rgba(244, 243, 237, 0.15);
            --glass-highlight: rgba(244, 243, 237, 0.2);
            --glass-shadow: rgba(0, 0, 0, 0.5);

            /* Enhanced 3D Filter & Rich Studio Vignette */
            --canvas-filter: url('#duotone-dark');
            --vignette-grad: radial-gradient(circle at center, transparent 15%, rgba(0, 0, 0, 0.8) 130%);
            --noise-opacity: 0.035;
            --noise-blend: overlay;

            /* Button variables */
            --btn-bg: #2E4631;
            --btn-border: #2E4631;
            --btn-text: #F4F3ED;
            --btn-hover-bg: #F4F3ED;
            --btn-hover-text: #000000;
        }

        .light-theme {
            /* LIGHT MODE PALETTE - PURE WHITE & MAROON */
            --bg-color: #F4F3ED;
            --text-color: #2E4631;
            
            /* Premium Glass Elements */
            --glass-bg: rgba(46, 70, 49, 0.05);
            --glass-border: rgba(46, 70, 49, 0.1);
            --glass-hover: rgba(46, 70, 49, 0.15);
            --glass-highlight: rgba(46, 70, 49, 0.2);
            --glass-shadow: rgba(0, 0, 0, 0.06);

            /* Canvas & Subtle Maroon Mix Vignette */
            --canvas-filter: url('#duotone-light');
            --vignette-grad: radial-gradient(circle at center, transparent 30%, rgba(46, 70, 49, 0.05) 150%);
            --noise-opacity: 0.025; 
            --noise-blend: normal;

            /* Button variables */
            --btn-bg: #2E4631;
            --btn-border: #2E4631;
            --btn-text: #F4F3ED;
            --btn-hover-bg: transparent;
            --btn-hover-text: #2E4631;
        }`;

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace CSS variables
    content = content.replace(/        :root\s*\{[\s\S]*?\}\s*\.light-theme\s*\{[\s\S]*?\}/, cssRoot);

    // Make buttons use the new variables
    content = content.replace(
        /\.btn-primary \{.*?\}/,
        '.btn-primary { display: inline-block; padding: 1rem 2.5rem; border: 1px solid var(--btn-border); border-radius: 30px; color: var(--btn-text); background: var(--btn-bg); font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s ease; text-decoration: none; cursor: pointer; }'
    );
    
    content = content.replace(
        /\.btn-primary:hover \{.*?\}/,
        '.btn-primary:hover { background: var(--btn-hover-bg); color: var(--btn-hover-text); border-color: var(--text-color); }'
    );

    content = content.replace(
        /\.btn-inverse \{.*?\}/,
        '.btn-inverse { display: inline-block; padding: 0.75rem 2rem; border: 1px solid var(--btn-border); border-radius: 30px; color: var(--btn-text); background: var(--btn-bg); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s ease; text-decoration: none; margin-top: 1.5rem; cursor: pointer; }'
    );
    
    content = content.replace(
        /\.btn-inverse:hover \{.*?\}/,
        '.btn-inverse:hover { background: var(--btn-hover-bg); color: var(--btn-hover-text); border-color: var(--text-color); }'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
