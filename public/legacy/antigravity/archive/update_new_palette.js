const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// NEW COLOR PALETTE — matching user's reference images exactly
// ═══════════════════════════════════════════════════════════
//
// DARK MODE:
//   Primary BG:    #050E07
//   Secondary BG:  #122418
//   Text Primary:  #E0DBC5
//   Text Secondary:#57C16F
//
// LIGHT MODE:
//   Primary BG:    #E0DBC5
//   Secondary BG:  #FFFFFF
//   Text Primary:  #264331
//   Text Secondary:#4EBE67
// ═══════════════════════════════════════════════════════════

const dark_vars = `        :root {
            /* DARK MODE: MIDNIGHT OBSIDIAN */
            --bg-color: #050E07;
            --surface-color: #122418;
            --text-color: #E0DBC5;
            --text-heading: #E0DBC5;
            --text-secondary: #57C16F;
            
            --glass-bg: rgba(18, 36, 24, 0.55);
            --glass-border: rgba(87, 193, 111, 0.15);
            --glass-highlight: rgba(87, 193, 111, 0.08);
            --glass-shadow: rgba(0, 0, 0, 0.6);

            --canvas-filter: url('#duotone-dark');
            --vignette-grad: radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(5, 14, 7, 0.4) 55%, rgba(5, 14, 7, 0.95) 100%);
            
            /* BRAND ACTION */
            --btn-bg: rgba(87, 193, 111, 0.15);
            --btn-border: rgba(87, 193, 111, 0.4);
            --btn-text: #E0DBC5;
            --btn-hover-bg: #57C16F;
            --btn-hover-text: #050E07;

            /* Cinematic atmosphere layers */
            --ambient-glow: radial-gradient(ellipse 80% 60% at 50% 45%, rgba(87, 193, 111, 0.08) 0%, rgba(18, 36, 24, 0.06) 40%, transparent 70%);
            --light-arc: radial-gradient(ellipse 50% 80% at 75% 30%, rgba(87, 193, 111, 0.04) 0%, transparent 60%);
        }`;

const light_vars = `        .light-theme {
            /* LIGHT MODE: WARM PARCHMENT */
            --bg-color: #E0DBC5;
            --surface-color: #FFFFFF;
            --text-color: #264331; 
            --text-heading: #264331;
            --text-secondary: #4EBE67;
            
            --glass-bg: rgba(38, 67, 49, 0.05);
            --glass-border: rgba(38, 67, 49, 0.12); 
            --glass-highlight: rgba(255, 255, 255, 0.5);
            --glass-shadow: rgba(38, 67, 49, 0.06);

            --canvas-filter: url('#duotone-light');
            --vignette-grad: radial-gradient(circle at center, transparent 30%, rgba(38, 67, 49, 0.04) 150%);

            /* BRAND ACTION: Fresh Green */
            --btn-bg: #4EBE67; 
            --btn-border: #4EBE67;
            --btn-text: #FFFFFF;
            --btn-hover-bg: #264331;
            --btn-hover-text: #E0DBC5;

            --ambient-glow: none;
            --light-arc: none;
        }`;

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // ── 1. Replace :root + .light-theme CSS variable blocks ──
    if (content.includes(':root {') && content.includes('.light-theme {')) {
        const newContent = content.replace(
            /        :root\s*\{[\s\S]*?\}\s*\n\s*\.light-theme\s*\{[\s\S]*?\}/,
            dark_vars + '\n\n' + light_vars
        );
        if (newContent !== content) { content = newContent; changed = true; }
    }
    
    // If only :root (service sub-pages without light-theme)
    if (!changed && content.includes(':root {')) {
        const newContent = content.replace(
            /        :root\s*\{[\s\S]*?\}/,
            dark_vars
        );
        if (newContent !== content) { content = newContent; changed = true; }
    }

    // ── 2. Loader background ──
    content = content.replace(
        /background:\s*#000000;(\s*display:\s*flex)/g,
        'background: #050E07;$1'
    );

    // ── 3. Loading line colors ──
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.3\)/g,
        'rgba(87, 193, 111, 0.3)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.7\)/g,
        'rgba(87, 193, 111, 0.7)'
    );

    // ── 4. Spline fallback gradients ──
    // Dark fallbacks: use new green tones
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.25\)/g,
        'rgba(18, 36, 24, 0.35)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.12\)/g,
        'rgba(18, 36, 24, 0.18)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.08\)/g,
        'rgba(18, 36, 24, 0.10)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.15\)/g,
        'rgba(18, 36, 24, 0.20)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.10\)/g,
        'rgba(18, 36, 24, 0.14)'
    );
    // Light fallbacks
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.06\)/g,
        'rgba(38, 67, 49, 0.08)'
    );
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.04\)/g,
        'rgba(38, 67, 49, 0.05)'
    );

    // ── 5. Light-theme header box-shadow ──
    content = content.replace(
        /rgba\(26,\s*47,\s*28,\s*0\.05\)/g,
        'rgba(38, 67, 49, 0.06)'
    );

    // ── 6. Explore line light color ──
    content = content.replace(
        /rgba\(26,47,28,0\.2\)/g,
        'rgba(38, 67, 49, 0.2)'
    );

    // ── 7. Light flip-card shadows ──
    content = content.replace(
        /rgba\(26,47,28,0\.05\)/g,
        'rgba(38, 67, 49, 0.05)'
    );
    content = content.replace(
        /rgba\(26,47,28,0\.03\)/g,
        'rgba(38, 67, 49, 0.03)'
    );
    content = content.replace(
        /rgba\(26,47,28,0\.06\)/g,
        'rgba(38, 67, 49, 0.06)'
    );

    // ── 8. Modal backdrop ──
    content = content.replace(
        /rgba\(8,\s*11,\s*9,\s*0\.92\)/g,
        'rgba(5, 14, 7, 0.92)'
    );

    // ── 9. Hero banner gradient (sub-pages) ──
    content = content.replace(
        /rgba\(46,\s*70,\s*49,\s*0\.3\)\s*0%,\s*#000000\s*70%/g,
        'rgba(18, 36, 24, 0.4) 0%, #050E07 70%'
    );

    // ── 10. SVG Duotone filters — Dark ──
    // Map shadows→#050E07, mids→#122418, highlights→#E0DBC5
    content = content.replace(
        /<feFuncR type="table" tableValues="0\.0000 0\.1803 0\.9922" \/>/g,
        '<feFuncR type="table" tableValues="0.0196 0.0706 0.8784" />'
    );
    content = content.replace(
        /<feFuncG type="table" tableValues="0\.0000 0\.2745 0\.9882" \/>/g,
        '<feFuncG type="table" tableValues="0.0549 0.1412 0.8588" />'
    );
    content = content.replace(
        /<feFuncB type="table" tableValues="0\.0000 0\.1921 0\.9725" \/>/g,
        '<feFuncB type="table" tableValues="0.0275 0.0941 0.7725" />'
    );

    // ── 11. SVG Duotone filters — Light ──
    // Map shadows→#264331, mids→#4EBE67, highlights→#E0DBC5
    content = content.replace(
        /<feFuncR type="table" tableValues="0\.9922 0\.5471 0\.1020" \/>/g,
        '<feFuncR type="table" tableValues="0.1490 0.3059 0.8784" />'
    );
    content = content.replace(
        /<feFuncG type="table" tableValues="0\.9882 0\.5863 0\.1843" \/>/g,
        '<feFuncG type="table" tableValues="0.2627 0.7451 0.8588" />'
    );
    content = content.replace(
        /<feFuncB type="table" tableValues="0\.9725 0\.5412 0\.1098" \/>/g,
        '<feFuncB type="table" tableValues="0.1922 0.4039 0.7725" />'
    );

    // ── 12. Also handle service-page style duotone variants ──
    content = content.replace(
        /<feFuncR type="table" tableValues="0\.0 0\.0 0\.18 0\.95" \/>/g,
        '<feFuncR type="table" tableValues="0.0196 0.0196 0.0706 0.8784" />'
    );
    content = content.replace(
        /<feFuncG type="table" tableValues="0\.0 0\.0 0\.27 0\.95" \/>/g,
        '<feFuncG type="table" tableValues="0.0549 0.0549 0.1412 0.8588" />'
    );
    content = content.replace(
        /<feFuncB type="table" tableValues="0\.0 0\.0 0\.19 0\.92" \/>/g,
        '<feFuncB type="table" tableValues="0.0275 0.0275 0.0941 0.7725" />'
    );
    content = content.replace(
        /<feFuncR type="table" tableValues="0\.2784 0\.2784 0\.9647" \/>/g,
        '<feFuncR type="table" tableValues="0.1490 0.3059 0.8784" />'
    );
    content = content.replace(
        /<feFuncG type="table" tableValues="0\.4824 0\.4824 0\.9569" \/>/g,
        '<feFuncG type="table" tableValues="0.2627 0.7451 0.8588" />'
    );
    content = content.replace(
        /<feFuncB type="table" tableValues="0\.3020 0\.3020 0\.9333" \/>/g,
        '<feFuncB type="table" tableValues="0.1922 0.4039 0.7725" />'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
});

console.log('\\n=== All files updated with new palette ===');
console.log('DARK:  BG=#050E07  Surface=#122418  Text=#E0DBC5  Accent=#57C16F');
console.log('LIGHT: BG=#E0DBC5  Surface=#FFFFFF  Text=#264331  Accent=#4EBE67');
