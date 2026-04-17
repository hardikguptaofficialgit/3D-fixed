const fs = require('fs');
let html = fs.readFileSync('panel.html', 'utf8');

const replacements = {
    // Backgrounds
    '<div class="color-thumb">🖥</div>': '<div class="color-thumb bg-preview" id="thumb_dk_bg"></div>',
    '<div class="color-row"><div class="color-thumb">🃏</div><input type="color" id="dk_surface"': '<div class="color-row"><div class="color-thumb bg-preview" id="thumb_dk_surface"></div><input type="color" id="dk_surface"',
    
    // Text
    '<div class="color-thumb">Aa</div>': '<div class="color-thumb" id="thumb_dk_text">Aa</div>',
    '<div class="color-thumb" style="color:#57C16F;">✦</div>': '<div class="color-thumb" id="thumb_dk_accent" style="color:#57C16F;">✦</div>',

    // Nav
    '<div class="color-thumb">▬</div>': '<div class="color-thumb bg-preview" id="thumb_dk_nav_bg"></div>',
    '<div class="color-thumb">Lk</div>': '<div class="color-thumb" id="thumb_dk_nav_text">Lk</div>',
    '<div class="color-thumb" style="color:#57C16F;">●</div>': '<div class="color-thumb" id="thumb_dk_nav_active" style="color:#57C16F;">●</div>',

    // Hero
    '<div class="color-thumb">H1</div>': '<div class="color-thumb element-preview" id="thumb_dk_hero_title" style="font-family:\'Playfair Display\',serif; font-size:10px; line-height:1; display:flex; align-items:center; justify-content:center;">Hero</div>',
    '<div class="color-thumb">T</div>': '<div class="color-thumb" id="thumb_dk_hero_tagline" style="font-size:10px;">Tag</div>',
    '<div class="color-thumb">BG</div>': '<div class="color-thumb bg-preview" id="thumb_dk_hero_bg"></div>',
    '<div class="color-thumb">━</div>': '<div class="color-thumb element-preview" id="thumb_dk_hero_line" style="border-bottom:3px solid #57C16F;"></div>',

    // Spline Hero
    '<div class="color-row"><div class="color-thumb">S</div><input type="color" id="dk_spline_hero_shadow"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_hero_shadow">S</div><input type="color" id="dk_spline_hero_shadow"',
    '<div class="color-row"><div class="color-thumb">M</div><input type="color" id="dk_spline_hero_mid"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_hero_mid">M</div><input type="color" id="dk_spline_hero_mid"',
    '<div class="color-row"><div class="color-thumb">H</div><input type="color" id="dk_spline_hero_highlight"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_hero_highlight">H</div><input type="color" id="dk_spline_hero_highlight"',
    '<div class="color-row"><div class="color-thumb">P</div><input type="color" id="dk_spline_hero_peak"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_hero_peak">P</div><input type="color" id="dk_spline_hero_peak"',

    // Spline BG
    '<div class="color-row"><div class="color-thumb">S</div><input type="color" id="dk_spline_bg_shadow"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_bg_shadow">S</div><input type="color" id="dk_spline_bg_shadow"',
    '<div class="color-row"><div class="color-thumb">M</div><input type="color" id="dk_spline_bg_mid"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_bg_mid">M</div><input type="color" id="dk_spline_bg_mid"',
    '<div class="color-row"><div class="color-thumb">H</div><input type="color" id="dk_spline_bg_highlight"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_bg_highlight">H</div><input type="color" id="dk_spline_bg_highlight"',
    '<div class="color-row"><div class="color-thumb">P</div><input type="color" id="dk_spline_bg_peak"': '<div class="color-row"><div class="color-thumb" id="thumb_dk_spline_bg_peak">P</div><input type="color" id="dk_spline_bg_peak"',

    // Section Titles
    '<div class="color-thumb">H2</div>': '<div class="color-thumb element-preview" id="thumb_dk_section_title" style="font-family:\'Playfair Display\',serif;font-size:10px;">H2</div>',

    // Cards
    '<div class="color-thumb">▢</div>': '<div class="color-thumb bg-preview" id="thumb_dk_card_bg"></div>',
    '<div class="color-thumb">◻</div>': '<div class="color-thumb element-preview" id="thumb_dk_card_border" style="border:1px solid #57C16F;">◻</div>',
    '<div class="color-thumb">Tt</div>': '<div class="color-thumb" id="thumb_dk_card_text">Tt</div>',

    // Buttons
    '<div class="color-thumb">BD</div>': '<div class="color-thumb element-preview" id="thumb_dk_btn_border" style="border:1px solid #E0DBC5;font-size:10px;">Btn</div>',
    '<div class="color-thumb">HV</div>': '<div class="color-thumb bg-preview" id="thumb_dk_btn_hover"></div>',

    // Glass
    '<div class="color-thumb">GL</div>': '<div class="color-thumb bg-preview" id="thumb_dk_glass_tint"></div>',
    '<div class="color-thumb" style="color:#57C16F;">◇</div>': '<div class="color-thumb element-preview" id="thumb_dk_glass_accent" style="border:1px solid #57C16F;">◇</div>',
    '<div class="color-thumb">🌑</div>': '<div class="color-thumb" id="thumb_dk_vignette">🌑</div>',
    '<div class="color-thumb">💡</div>': '<div class="color-thumb" id="thumb_dk_ambient">💡</div>',

    // Footer
    '<div class="color-row"><div class="color-thumb">BG</div><input type="color" id="dk_footer_bg"': '<div class="color-row"><div class="color-thumb bg-preview" id="thumb_dk_footer_bg"></div><input type="color" id="dk_footer_bg"',
    '<div class="color-thumb">Ft</div>': '<div class="color-thumb" id="thumb_dk_footer_text">Ft</div>',

    // Scroll
    '<div class="color-thumb">↓</div>': '<div class="color-thumb" id="thumb_dk_scroll_color">↓</div>'
};

for (const [search, replacement] of Object.entries(replacements)) {
    if(html.includes(search)) {
        // Only replace the first occurrence (since Light Mode inputs are separate underneath anyway, 
        // wait, the light mode are just <input type="color"> without color-thumbs currently!!
        html = html.replace(search, replacement);
    } else {
        console.log("Could not find:", search);
    }
}

// Ensure the specific text for Klyperix Production is in the Hero Label.
// The user asked "the text name is klyperix production Not only the klyperix"
// We will update the label div that says "Hero Title Text".
html = html.replace('<div class="color-label">Hero Title Text</div>', '<div class="color-label">Klyperix Production (Title)</div>');

// Address the JS Reset bug: Update thumbnail on reset
const bugSearch = `const hex = row.querySelector('.color-hex');
                        if (hex) hex.textContent = def.toUpperCase();
                    }`;
const bugReplacement = `const hex = row.querySelector('.color-hex');
                        if (hex) hex.textContent = def.toUpperCase();
                        updateThumbnailColor(key, def);
                    }`;

if(html.includes(bugSearch)) {
    html = html.replace(bugSearch, bugReplacement);
    console.log("Fixed the JS bug for color-reset-btn");
} else {
    console.log("Could not find JS bug string!");
}


fs.writeFileSync('panel.html', html);
console.log("Done updating literal previews.");
