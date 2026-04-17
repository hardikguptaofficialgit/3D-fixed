/**
 * Admin Preview Bridge for Klyperix
 * Receives messages from the admin panel and updates the live site design.
 */
(function() {
    function hexToRgba(hex, a) {
        if (!hex || hex.length < 7) return null;
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

    function hexToRgb(hex) {
        if (!hex || hex.length < 7) return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    function hexToN(hex) {
        if (!hex || hex.length < 7) return { r: 0, g: 0, b: 0 };
        return { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 };
    }

    function updateFilter4(id, sh, md, hi, pk) {
        const f = document.getElementById(id);
        if (!f || !sh) return;
        const fR = f.querySelector('feFuncR[type="table"]');
        const fG = f.querySelector('feFuncG[type="table"]');
        const fB = f.querySelector('feFuncB[type="table"]');
        if (!fR) return;
        const s = hexToN(sh), m = hexToN(md || sh), h = hexToN(hi || pk || sh), p = hexToN(pk || hi || sh);
        fR.setAttribute('tableValues', `${s.r.toFixed(3)} ${m.r.toFixed(3)} ${h.r.toFixed(3)} ${p.r.toFixed(3)}`);
        fG.setAttribute('tableValues', `${s.g.toFixed(3)} ${m.g.toFixed(3)} ${h.g.toFixed(3)} ${p.g.toFixed(3)}`);
        fB.setAttribute('tableValues', `${s.b.toFixed(3)} ${m.b.toFixed(3)} ${h.b.toFixed(3)} ${p.b.toFixed(3)}`);
    }

    window.addEventListener('message', function(event) {
        if (!event.data || event.data.type !== 'klyperix-design-preview') return;
        const { theme, colors: c } = event.data;
        const root = document.documentElement;
        const body = document.body;

        // Switch theme class
        if (theme === 'light') body.classList.add('light-theme');
        else body.classList.remove('light-theme');

        if (theme === 'dark') {
            // ── Core ──
            if (c.dk_bg) { root.style.setProperty('--bg-color', c.dk_bg); root.style.setProperty('--bg-primary', c.dk_bg); root.style.setProperty('--bg-rgb', hexToRgb(c.dk_bg)); }
            if (c.dk_surface) { root.style.setProperty('--surface-color', c.dk_surface); root.style.setProperty('--bg-secondary', c.dk_surface); }
            if (c.dk_text) { root.style.setProperty('--text-color', c.dk_text); root.style.setProperty('--text-heading', c.dk_text); root.style.setProperty('--text-main', c.dk_text); }
            if (c.dk_accent) { root.style.setProperty('--text-secondary', c.dk_accent); root.style.setProperty('--accent-color', c.dk_accent); }
            // ── Buttons ──
            if (c.dk_btn_border) { root.style.setProperty('--btn-border', c.dk_btn_border); root.style.setProperty('--btn-text', c.dk_btn_border); }
            if (c.dk_btn_hover) { root.style.setProperty('--btn-hover-bg', c.dk_btn_hover); root.style.setProperty('--btn-hover-text', c.dk_bg || '#050E07'); }
            // ── Glass ──
            if (c.dk_glass_tint) root.style.setProperty('--glass-bg', hexToRgba(c.dk_glass_tint, 0.45));
            if (c.dk_glass_accent) root.style.setProperty('--glass-border', hexToRgba(c.dk_glass_accent, 0.2));
            // ── Hero ──
            if (c.dk_hero_title) root.style.setProperty('--hero-title-color', c.dk_hero_title);
            if (c.dk_hero_tagline) root.style.setProperty('--hero-tagline-color', c.dk_hero_tagline);
            if (c.dk_hero_bg) root.style.setProperty('--hero-bg-color', c.dk_hero_bg);
            if (c.dk_hero_line) root.style.setProperty('--hero-line-color', c.dk_hero_line);
            // ── Navigation ──
            if (c.dk_nav_bg) root.style.setProperty('--nav-bg', c.dk_nav_bg);
            if (c.dk_nav_text) root.style.setProperty('--nav-text', c.dk_nav_text);
            if (c.dk_nav_active) root.style.setProperty('--nav-active', c.dk_nav_active);
            // ── Section titles ──
            if (c.dk_section_title) root.style.setProperty('--section-title-color', c.dk_section_title);
            // ── Cards ──
            if (c.dk_card_bg) root.style.setProperty('--card-bg', c.dk_card_bg);
            if (c.dk_card_border) root.style.setProperty('--card-border', c.dk_card_border);
            if (c.dk_card_text) root.style.setProperty('--card-text', c.dk_card_text);
            // ── Footer ──
            if (c.dk_footer_bg) root.style.setProperty('--footer-bg', c.dk_footer_bg);
            if (c.dk_footer_text) root.style.setProperty('--footer-text', c.dk_footer_text);
            // ── Scroll ──
            if (c.dk_scroll_color) root.style.setProperty('--scroll-indicator-color', c.dk_scroll_color);
            // ── Vignette & Ambient ──
            if (c.dk_vignette) root.style.setProperty('--vignette-grad', `radial-gradient(ellipse at 50% 50%, transparent 30%, ${hexToRgba(c.dk_vignette, 0.95)} 100%)`);
            if (c.dk_ambient) root.style.setProperty('--ambient-color', c.dk_ambient);
            // ── Spline 4-value ──
            updateFilter4('duotone-dark', c.dk_spline_hero_shadow, c.dk_spline_hero_mid, c.dk_spline_hero_highlight, c.dk_spline_hero_peak);
        } else {
            // ── Core ──
            if (c.lt_bg) { root.style.setProperty('--bg-color', c.lt_bg); root.style.setProperty('--bg-primary', c.lt_bg); root.style.setProperty('--bg-rgb', hexToRgb(c.lt_bg)); }
            if (c.lt_surface) { root.style.setProperty('--surface-color', c.lt_surface); root.style.setProperty('--bg-secondary', c.lt_surface); }
            if (c.lt_text) { root.style.setProperty('--text-color', c.lt_text); root.style.setProperty('--text-heading', c.lt_text); root.style.setProperty('--text-main', c.lt_text); }
            if (c.lt_accent) { root.style.setProperty('--text-secondary', c.lt_accent); root.style.setProperty('--accent-color', c.lt_accent); }
            // ── Buttons ──
            if (c.lt_btn_bg) { root.style.setProperty('--btn-bg', c.lt_btn_bg); root.style.setProperty('--btn-border', c.lt_btn_bg); }
            if (c.lt_btn_hover) root.style.setProperty('--btn-hover-bg', c.lt_btn_hover);
            // ── Glass ──
            if (c.lt_glass_tint) root.style.setProperty('--glass-bg', hexToRgba(c.lt_glass_tint, 0.7));
            if (c.lt_glass_accent) root.style.setProperty('--glass-border', hexToRgba(c.lt_glass_accent, 0.15));
            // ── Hero ──
            if (c.lt_hero_title) root.style.setProperty('--hero-title-color', c.lt_hero_title);
            if (c.lt_hero_tagline) root.style.setProperty('--hero-tagline-color', c.lt_hero_tagline);
            if (c.lt_hero_bg) root.style.setProperty('--hero-bg-color', c.lt_hero_bg);
            if (c.lt_hero_line) root.style.setProperty('--hero-line-color', c.lt_hero_line);
            // ── Navigation ──
            if (c.lt_nav_bg) root.style.setProperty('--nav-bg', c.lt_nav_bg);
            if (c.lt_nav_text) root.style.setProperty('--nav-text', c.lt_nav_text);
            if (c.lt_nav_active) root.style.setProperty('--nav-active', c.lt_nav_active);
            // ── Section titles ──
            if (c.lt_section_title) root.style.setProperty('--section-title-color', c.lt_section_title);
            // ── Cards ──
            if (c.lt_card_bg) root.style.setProperty('--card-bg', c.lt_card_bg);
            if (c.lt_card_border) root.style.setProperty('--card-border', c.lt_card_border);
            if (c.lt_card_text) root.style.setProperty('--card-text', c.lt_card_text);
            // ── Footer ──
            if (c.lt_footer_bg) root.style.setProperty('--footer-bg', c.lt_footer_bg);
            if (c.lt_footer_text) root.style.setProperty('--footer-text', c.lt_footer_text);
            // ── Scroll ──
            if (c.lt_scroll_color) root.style.setProperty('--scroll-indicator-color', c.lt_scroll_color);
            // ── Vignette & Ambient ──
            if (c.lt_vignette) root.style.setProperty('--vignette-grad', `radial-gradient(circle at center, transparent 30%, ${hexToRgba(c.lt_vignette, 0.6)} 150%)`);
            if (c.lt_ambient) root.style.setProperty('--ambient-color', c.lt_ambient);
            // ── Spline 4-value ──
            updateFilter4('duotone-light', c.lt_spline_hero_shadow, c.lt_spline_hero_mid, c.lt_spline_hero_highlight, c.lt_spline_hero_peak);
        }
    });
})();
