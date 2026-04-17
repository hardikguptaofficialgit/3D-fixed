// ═══════════════════════════════════════════════════════════════
// KLYPERIX — Live Design System Loader (v3 — Cached + Optimized)
// ═══════════════════════════════════════════════════════════════
// Loads color palette from Supabase and applies ALL CSS variables
// + 4-value Spline filter tints, vignette, ambient, nav, hero,
// cards, footer, chat widget, and loader colors
// v3: sessionStorage cache for instant theme toggles
// ═══════════════════════════════════════════════════════════════

(function () {
    const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!sb) return;

    function hexToRgba(hex, alpha) {
        if (!hex || hex.length < 7) return null;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function hexToRgb(hex) {
        if (!hex || hex.length < 7) return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    function hexToRgbNormalized(hex) {
        if (!hex || hex.length < 7) return null;
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return { r, g, b };
    }

    // Update an SVG feComponentTransfer filter with 4-value duotone (shadow → mid → highlight → peak)
    function updateDuotoneFilter4(filterId, shadow, mid, highlight, peak) {
        const filter = document.getElementById(filterId);
        if (!filter) return;
        const feFuncR = filter.querySelector('feFuncR[type="table"]');
        const feFuncG = filter.querySelector('feFuncG[type="table"]');
        const feFuncB = filter.querySelector('feFuncB[type="table"]');
        if (!feFuncR || !shadow) return;

        const s = hexToRgbNormalized(shadow);
        const m = hexToRgbNormalized(mid || shadow);
        const h = hexToRgbNormalized(highlight || peak || shadow);
        const p = hexToRgbNormalized(peak || highlight || shadow);
        if (!s || !p) return;

        feFuncR.setAttribute('tableValues', `${s.r.toFixed(3)} ${m.r.toFixed(3)} ${h.r.toFixed(3)} ${p.r.toFixed(3)}`);
        feFuncG.setAttribute('tableValues', `${s.g.toFixed(3)} ${m.g.toFixed(3)} ${h.g.toFixed(3)} ${p.g.toFixed(3)}`);
        feFuncB.setAttribute('tableValues', `${s.b.toFixed(3)} ${m.b.toFixed(3)} ${h.b.toFixed(3)} ${p.b.toFixed(3)}`);
    }

    const CACHE_KEY = 'klyperix_design_cache';

    // Accept cached settings or fetch from Supabase
    async function applyDesign(cachedSettings) {
        let s;
        if (cachedSettings) {
            s = cachedSettings;
        } else {
            const { data } = await sb.from('design_settings').select('*');
            if (!data || data.length === 0) return;
            s = {};
            data.forEach(d => { s[d.setting_key] = d.setting_value; });
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
        }

        const root = document.documentElement;
        const isLight = document.body.classList.contains('light-theme');

        if (isLight) {
            // ── LIGHT MODE ──
            if (s.lt_bg) {
                root.style.setProperty('--bg-color', s.lt_bg);
                root.style.setProperty('--bg-primary', s.lt_bg);
                root.style.setProperty('--bg-rgb', hexToRgb(s.lt_bg));
            }
            if (s.lt_surface) {
                root.style.setProperty('--surface-color', s.lt_surface);
                root.style.setProperty('--bg-secondary', s.lt_surface);
            }
            if (s.lt_text) {
                root.style.setProperty('--text-color', s.lt_text);
                root.style.setProperty('--text-heading', s.lt_text);
                root.style.setProperty('--text-main', s.lt_text);
            }
            if (s.lt_accent) {
                root.style.setProperty('--text-secondary', s.lt_accent);
                root.style.setProperty('--accent-color', s.lt_accent);
            }
            if (s.lt_btn_bg) {
                root.style.setProperty('--btn-bg', s.lt_btn_bg);
                root.style.setProperty('--btn-border', s.lt_btn_bg);
            }
            if (s.lt_btn_hover) {
                root.style.setProperty('--btn-hover-bg', s.lt_btn_hover);
            }
            if (s.lt_glass_tint) {
                root.style.setProperty('--glass-bg', hexToRgba(s.lt_glass_tint, 0.7));
            }
            if (s.lt_glass_accent) {
                root.style.setProperty('--glass-border', hexToRgba(s.lt_glass_accent, 0.15));
            }
            // Hero page overrides
            if (s.lt_hero_title) root.style.setProperty('--hero-title-color', s.lt_hero_title);
            if (s.lt_hero_tagline) root.style.setProperty('--hero-tagline-color', s.lt_hero_tagline);
            if (s.lt_hero_bg) root.style.setProperty('--hero-bg-color', s.lt_hero_bg);
            if (s.lt_hero_line) root.style.setProperty('--hero-line-color', s.lt_hero_line);
            // Navigation overrides
            if (s.lt_nav_bg) root.style.setProperty('--nav-bg', s.lt_nav_bg);
            if (s.lt_nav_text) root.style.setProperty('--nav-text', s.lt_nav_text);
            if (s.lt_nav_active) root.style.setProperty('--nav-active', s.lt_nav_active);
            // Section titles
            if (s.lt_section_title) root.style.setProperty('--section-title-color', s.lt_section_title);
            // Card overrides
            if (s.lt_card_bg) root.style.setProperty('--card-bg', s.lt_card_bg);
            if (s.lt_card_border) root.style.setProperty('--card-border', s.lt_card_border);
            if (s.lt_card_text) root.style.setProperty('--card-text', s.lt_card_text);
            // Footer overrides
            if (s.lt_footer_bg) root.style.setProperty('--footer-bg', s.lt_footer_bg);
            if (s.lt_footer_text) root.style.setProperty('--footer-text', s.lt_footer_text);
            // Scroll indicator
            if (s.lt_scroll_color) root.style.setProperty('--scroll-indicator-color', s.lt_scroll_color);
            // Vignette & Ambient
            if (s.lt_vignette) {
                root.style.setProperty('--vignette-color', s.lt_vignette);
                root.style.setProperty('--vignette-grad', `radial-gradient(circle at center, transparent 30%, ${hexToRgba(s.lt_vignette, 0.6)} 150%)`);
            }
            if (s.lt_ambient) {
                root.style.setProperty('--ambient-color', s.lt_ambient);
            }
            // Spline filters — light mode — 4 values
            updateDuotoneFilter4('duotone-dark', s.lt_spline_hero_shadow, s.lt_spline_hero_mid, s.lt_spline_hero_highlight, s.lt_spline_hero_peak);
            updateDuotoneFilter4('duotone-light', s.lt_spline_hero_shadow, s.lt_spline_hero_mid, s.lt_spline_hero_highlight, s.lt_spline_hero_peak);
        } else {
            // ── DARK MODE ──
            if (s.dk_bg) {
                root.style.setProperty('--bg-color', s.dk_bg);
                root.style.setProperty('--bg-primary', s.dk_bg);
                root.style.setProperty('--bg-rgb', hexToRgb(s.dk_bg));
            }
            if (s.dk_surface) {
                root.style.setProperty('--surface-color', s.dk_surface);
                root.style.setProperty('--bg-secondary', s.dk_surface);
            }
            if (s.dk_text) {
                root.style.setProperty('--text-color', s.dk_text);
                root.style.setProperty('--text-heading', s.dk_text);
                root.style.setProperty('--text-main', s.dk_text);
            }
            if (s.dk_accent) {
                root.style.setProperty('--text-secondary', s.dk_accent);
                root.style.setProperty('--accent-color', s.dk_accent);
            }
            if (s.dk_btn_border) {
                root.style.setProperty('--btn-border', s.dk_btn_border);
                root.style.setProperty('--btn-text', s.dk_btn_border);
            }
            if (s.dk_btn_hover) {
                root.style.setProperty('--btn-hover-bg', s.dk_btn_hover);
                root.style.setProperty('--btn-hover-text', s.dk_bg || '#050E07');
            }
            if (s.dk_glass_tint) {
                root.style.setProperty('--glass-bg', hexToRgba(s.dk_glass_tint, 0.45));
            }
            if (s.dk_glass_accent) {
                root.style.setProperty('--glass-border', hexToRgba(s.dk_glass_accent, 0.2));
            }
            // Hero page overrides
            if (s.dk_hero_title) root.style.setProperty('--hero-title-color', s.dk_hero_title);
            if (s.dk_hero_tagline) root.style.setProperty('--hero-tagline-color', s.dk_hero_tagline);
            if (s.dk_hero_bg) root.style.setProperty('--hero-bg-color', s.dk_hero_bg);
            if (s.dk_hero_line) root.style.setProperty('--hero-line-color', s.dk_hero_line);
            // Navigation overrides
            if (s.dk_nav_bg) root.style.setProperty('--nav-bg', s.dk_nav_bg);
            if (s.dk_nav_text) root.style.setProperty('--nav-text', s.dk_nav_text);
            if (s.dk_nav_active) root.style.setProperty('--nav-active', s.dk_nav_active);
            // Section titles
            if (s.dk_section_title) root.style.setProperty('--section-title-color', s.dk_section_title);
            // Card overrides
            if (s.dk_card_bg) root.style.setProperty('--card-bg', s.dk_card_bg);
            if (s.dk_card_border) root.style.setProperty('--card-border', s.dk_card_border);
            if (s.dk_card_text) root.style.setProperty('--card-text', s.dk_card_text);
            // Footer overrides
            if (s.dk_footer_bg) root.style.setProperty('--footer-bg', s.dk_footer_bg);
            if (s.dk_footer_text) root.style.setProperty('--footer-text', s.dk_footer_text);
            // Scroll indicator
            if (s.dk_scroll_color) root.style.setProperty('--scroll-indicator-color', s.dk_scroll_color);
            // Vignette & Ambient
            if (s.dk_vignette) {
                root.style.setProperty('--vignette-color', s.dk_vignette);
                root.style.setProperty('--vignette-grad', `radial-gradient(ellipse at 50% 50%, transparent 30%, ${hexToRgba(s.dk_vignette, 0.95)} 100%)`);
            }
            if (s.dk_ambient) {
                root.style.setProperty('--ambient-color', s.dk_ambient);
            }
            // Spline filters — dark mode — 4 values
            updateDuotoneFilter4('duotone-dark', s.dk_spline_hero_shadow, s.dk_spline_hero_mid, s.dk_spline_hero_highlight, s.dk_spline_hero_peak);
            updateDuotoneFilter4('duotone-light', s.dk_spline_hero_shadow, s.dk_spline_hero_mid, s.dk_spline_hero_highlight, s.dk_spline_hero_peak);
        }

        // Apply logo changes
        if (s.logo_dark || s.logo_light) {
            const darkLogos = document.querySelectorAll('.logo-dark');
            const lightLogos = document.querySelectorAll('.logo-light');
            if (s.logo_dark) darkLogos.forEach(el => { if (el.tagName === 'IMG') el.src = s.logo_dark; });
            if (s.logo_light) lightLogos.forEach(el => { if (el.tagName === 'IMG') el.src = s.logo_light; });
        }
    }

    // Run on load — try cache first for instant display, then refresh from network
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) applyDesign(JSON.parse(cached));
    } catch (e) { /* ignore */ }
    applyDesign(); // Always refresh from Supabase in background

    // Re-apply when theme toggles — instant from cache (no 100ms setTimeout delay)
    const observer = new MutationObserver(() => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) applyDesign(JSON.parse(cached));
        } catch (e) {
            applyDesign();
        }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
