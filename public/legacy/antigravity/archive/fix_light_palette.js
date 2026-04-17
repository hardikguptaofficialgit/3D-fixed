const fs = require('fs');

const panelPaths = ['c:/Users/garva/OneDrive/Documents/heropage/panel.html'];
const klyperixPaths = ['c:/Users/garva/OneDrive/Documents/heropage/klyperix.html'];

for (const p of panelPaths) {
    if(!fs.existsSync(p)) continue;
    let html = fs.readFileSync(p, 'utf-8');

    // Update DEFAULTS object
    const oldDefaults = `lt_bg:'#E0DBC5', lt_surface:'#FFFFFF', lt_text:'#2c9e50', lt_accent:'#4EBE67',
            lt_hero_title:'#2c9e50', lt_hero_tagline:'#4EBE67', lt_hero_bg:'#E0DBC5', lt_hero_line:'#4EBE67',
            lt_nav_bg:'#FFFFFF', lt_nav_text:'#2c9e50', lt_nav_active:'#4EBE67',
            lt_section_title:'#2c9e50',
            lt_card_bg:'#FFFFFF', lt_card_border:'#2C4937', lt_card_text:'#2c9e50',
            lt_btn_bg:'#4EBE67', lt_btn_hover:'#2C4937', lt_glass_tint:'#FFFFFF', lt_glass_accent:'#2C4937',
            lt_footer_bg:'#E0DBC5', lt_footer_text:'#2c9e50',
            lt_scroll_color:'#2c9e50',
            lt_spline_hero_shadow:'#E0DBC5', lt_spline_hero_mid:'#D1CCB7',
            lt_spline_hero_highlight:'#2C4937', lt_spline_hero_peak:'#4EBE67',
            lt_spline_bg_shadow:'#E0DBC5', lt_spline_bg_mid:'#C8C3AE',
            lt_spline_bg_highlight:'#2C4937', lt_spline_bg_peak:'#4EBE67',
            lt_vignette:'#D1CCB7', lt_ambient:'#C8B060'`;

    const newDefaults = `lt_bg:'#F8F6EF', lt_surface:'#FFFFFF', lt_text:'#113A22', lt_accent:'#52C570',
            lt_hero_title:'#113A22', lt_hero_tagline:'#113A22', lt_hero_bg:'#F8F6EF', lt_hero_line:'#52C570',
            lt_nav_bg:'#FFFFFF', lt_nav_text:'#113A22', lt_nav_active:'#52C570',
            lt_section_title:'#113A22',
            lt_card_bg:'#FFFFFF', lt_card_border:'#52C570', lt_card_text:'#113A22',
            lt_btn_bg:'#52C570', lt_btn_hover:'#113A22', lt_glass_tint:'#FFFFFF', lt_glass_accent:'#113A22',
            lt_footer_bg:'#F8F6EF', lt_footer_text:'#113A22',
            lt_scroll_color:'#113A22',
            lt_spline_hero_shadow:'#C4C8BE', lt_spline_hero_mid:'#90AB9B',
            lt_spline_hero_highlight:'#113A22', lt_spline_hero_peak:'#FFFFFF',
            lt_spline_bg_shadow:'#C4C8BE', lt_spline_bg_mid:'#90AB9B',
            lt_spline_bg_highlight:'#113A22', lt_spline_bg_peak:'#FFFFFF',
            lt_vignette:'#E4E5DF', lt_ambient:'#F8F6EF'`;

    html = html.replace(oldDefaults, newDefaults);

    // Also update all instances of data-default throughout the html DOM for light mode inputs
    // We can do a mass regex replace for lt_ keys inside input tags
    const lightOverrides = {
        '#E0DBC5': '#F8F6EF',
        '#2c9e50': '#113A22',
        '#4EBE67': '#52C570',
        '#2C4937': '#113A22',
        '#D1CCB7': '#C4C8BE',
        '#C8C3AE': '#90AB9B',
        '#C8B060': '#F8F6EF'
    };

    // Very carefully replace only inside the light mode tags section
    const startLt = html.indexOf('<!-- LIGHT MODE -->');
    if (startLt !== -1) {
        let lightHtml = html.substring(startLt);
        // replace old colors with new colors
        // this is safe because the old colors are highly specific hexes
        Object.entries(lightOverrides).forEach(([oldHex, newHex]) => {
            lightHtml = lightHtml.split(oldHex).join(newHex);
        });
        html = html.substring(0, startLt) + lightHtml;
    } else {
        console.log("Could not find <!-- LIGHT MODE --> in panel.html");
    }

    fs.writeFileSync(p, html);
    console.log("Updated panel.html light mode colors successfully.");
}

for (const p of klyperixPaths) {
    if(!fs.existsSync(p)) continue;
    let html = fs.readFileSync(p, 'utf-8');

    // Regex replace the entire .light-theme class rules
    const ltRegex = /\.light-theme \{[\s\S]*?\/\* ═══ ELEMENT-SPECIFIC CUSTOMIZABLE VARS ═══ \*\/[\s\S]*?--scroll-indicator-color:.*?;[\s]*\}/;

    const newLtClass = `.light-theme {
            --bg-color: #F8F6EF;
            --bg-rgb: 248, 246, 239;
            --surface-color: #FFFFFF;
            --text-color: #113A22;
            --text-heading: #113A22;
            --text-secondary: #52C570;

            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: rgba(17, 58, 34, 0.15);
            --glass-highlight: rgba(255, 255, 255, 0.9);
            --glass-shadow: rgba(17, 58, 34, 0.1);

            --canvas-filter: url('#duotone-light');
            --vignette-grad: radial-gradient(circle at center, transparent 30%, rgba(228, 229, 223, 0.45) 150%);

            --btn-bg: #52C570;
            --btn-border: #52C570;
            --btn-text: #FFFFFF;
            --btn-hover-bg: #113A22;
            --btn-hover-text: #F8F6EF;
            --btn-shadow: 0 8px 24px rgba(82, 197, 112, 0.25);

            --ambient-glow: none;
            --light-arc: none;

            /* ═══ ELEMENT-SPECIFIC CUSTOMIZABLE VARS ═══ */
            --hero-title-color: #113A22;
            --hero-tagline-color: #113A22;
            --hero-bg-color: #F8F6EF;
            --hero-line-color: #52C570;
            --nav-bg: rgba(255, 255, 255, 0.85);
            --nav-text: #113A22;
            --nav-active: #52C570;
            --section-title-color: #113A22;
            --card-bg: rgba(255, 255, 255, 0.85);
            --card-border: rgba(17, 58, 34, 0.15);
            --card-text: #113A22;
            --footer-bg: transparent;
            --footer-text: #113A22;
            --scroll-indicator-color: #113A22;
        }`;

    html = html.replace(ltRegex, newLtClass);

    // Update duotone-light table values
    const feCompRegex = /<feComponentTransfer>\s*<feFuncR type="table" tableValues="0.8784 0.6745 0.1725 0.3078" \/>\s*<feFuncG type="table" tableValues="0.8588 0.7529 0.2863 0.7451" \/>\s*<feFuncB type="table" tableValues="0.7725 0.5529 0.2157 0.4353" \/>\s*<\/feComponentTransfer>/;
    const newFeComp = `<feComponentTransfer>
                <feFuncR type="table" tableValues="0.768 0.564 0.066 1.000" />
                <feFuncG type="table" tableValues="0.784 0.670 0.227 1.000" />
                <feFuncB type="table" tableValues="0.745 0.607 0.133 1.000" />
            </feComponentTransfer>`;

    html = html.replace(feCompRegex, newFeComp);

    fs.writeFileSync(p, html);
    console.log("Updated klyperix.html light mode CSS and filters successfully.");
}
