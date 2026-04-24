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
// ═══════════════════════════════════════════════════════════════
// KLYPERIX — Live Content Loader
// ═══════════════════════════════════════════════════════════════
// Loads editable text content from Supabase and applies to the page
// Uses data-content attributes on HTML elements
// ═══════════════════════════════════════════════════════════════

(function () {
    const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!sb) return;

    async function loadContent() {
        // 1. Text Content & Design Settings
        const { data: textData } = await sb.from('site_content').select('*');
        if (textData) {
            textData.forEach(item => {
                const elements = document.querySelectorAll(`[data-content="${item.section_key}"]`);
                elements.forEach(el => { el.textContent = item.content_value; });
                const hrefElements = document.querySelectorAll(`[data-content-href="${item.section_key}"]`);
                hrefElements.forEach(el => { el.href = item.section_key.includes('email') ? 'mailto:' + item.content_value : item.content_value; });
            });
        }

        const { data: settings } = await sb.from('design_settings').select('*');
        if (settings) {
            const settingsMap = Object.fromEntries(settings.map(s => [s.setting_key, s.setting_value]));

            // Handle Logos
            if (settingsMap.logo_dark) {
                const darkLogo = document.getElementById('logo-dark-img');
                if (darkLogo) darkLogo.src = settingsMap.logo_dark;
            }
            if (settingsMap.logo_light) {
                const lightLogo = document.getElementById('logo-light-img');
                if (lightLogo) lightLogo.src = settingsMap.logo_light;
            }

            // Handle Glass Effect
            const logoWrapper = document.getElementById('main-logo-wrapper');
            if (logoWrapper) {
                if (settingsMap.logo_glass_enabled === 'true') {
                    logoWrapper.style.backdropFilter = `blur(${settingsMap.logo_glass_blur || '10px'})`;
                    logoWrapper.style.webkitBackdropFilter = `blur(${settingsMap.logo_glass_blur || '10px'})`;
                    logoWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                    logoWrapper.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    logoWrapper.style.padding = '8px';
                    logoWrapper.style.borderRadius = '50%';
                } else {
                    logoWrapper.style.backdropFilter = 'none';
                    logoWrapper.style.background = 'transparent';
                    logoWrapper.style.border = 'none';
                    logoWrapper.style.padding = '0';
                }
            }
        }

        // 2. Dynamic Services
        const { data: services } = await sb.from('services').select('*').filter('is_active', 'eq', true).order('sort_order', { ascending: true });
        if (services && services.length > 0) {
            const grid = document.getElementById('services-grid');
            if (grid) {
                grid.innerHTML = services.map(s => `
                    <div class="flip-card">
                        <div class="flip-card-inner">
                            <div class="flip-card-front text-center">
                                <div class="gloss-line"></div>
                                <div class="card-icon">${s.icon_svg || ''}</div>
                                <h4 class="font-semibold text-lg tracking-wider">${s.title}</h4>
                            </div>
                            <div class="flip-card-back text-center">
                                <p class="service-desc text-xs opacity-75 mb-2 px-2 leading-relaxed font-light">${s.description || ''}</p>
                                <a href="${s.link_url || '#'}" class="btn-inverse">View Work</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 3. Dynamic Testimonials
        const { data: testimonials } = await sb.from('testimonials').select('*').filter('is_active', 'eq', true).order('sort_order', { ascending: true });
        if (testimonials && testimonials.length > 0) {
            const track = document.getElementById('testimonials-track');
            if (track) {
                const itemsHtml = testimonials.map(t => `
                    <div class="luxury-card">
                        <div class="stars" style="margin-bottom: 2rem; font-size: 1.2rem; text-align: left;">${'★'.repeat(t.stars || 5)}</div>
                        <div class="quote">"${t.quote}"</div>
                        <div class="client-meta">
                            <div class="client-name">${t.author_name}${t.author_role ? ' · ' + t.author_role : ''}</div>
                        </div>
                    </div>
                `).join('');
                track.innerHTML = itemsHtml + itemsHtml; // Duplicate for loop
            }
        }

        // 4. Dynamic Client Logos
        const { data: clients } = await sb.from('client_logos').select('*').filter('is_active', 'eq', true).order('sort_order', { ascending: true });
        if (clients && clients.length > 0) {
            const logoTrack = document.getElementById('clients-track');
            if (logoTrack) {
                const logosHtml = clients.map(c => `
                    <div class="luxury-logo" data-text="${c.client_name}">${c.client_name}</div>
                `).join('');
                logoTrack.innerHTML = logosHtml + logosHtml; // Duplicate for loop
            }
        }

        // 5. Dynamic Social Links
        const { data: social } = await sb.from('social_links').select('*').filter('is_active', 'eq', true).order('sort_order', { ascending: true });
        if (social && social.length > 0) {
            const socialGrid = document.getElementById('social-links-grid');
            if (socialGrid) {
                socialGrid.innerHTML = social.map(link => `
                    <a href="${link.url}" target="_blank" aria-label="${link.platform_name}" class="premium-social-btn" title="${link.platform_name}">
                        ${link.icon_svg || `<img src="https://cdn.simpleicons.org/${link.platform_name.toLowerCase()}/FFFFFF" alt="${link.platform_name}">`}
                    </a>
                `).join('');
            }
        }
    }

    // Run after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(loadContent, 300));
    } else {
        setTimeout(loadContent, 300);
    }
})();
// ════════════════════════════════════════════════════════════════
// KLYPERIX — Supabase Configuration
// ════════════════════════════════════════════════════════════════

// KLYPERIX — Supabase Configuration (Next.js runtime-config driven)
// Pulls Supabase URL + anon key from /api/public-config so you can switch projects via .env.

let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";
let KLYPERIX_ADMINS = [];

// Singleton — create client once, reuse forever
let _sbInstance = null;

function loadCachedConfig() {
    try {
        const raw = localStorage.getItem('klyp_public_config');
        if (!raw) return;
        const cfg = JSON.parse(raw);
        if (cfg && typeof cfg === 'object') {
            SUPABASE_URL = cfg.supabaseUrl || SUPABASE_URL;
            SUPABASE_ANON_KEY = cfg.supabaseAnonKey || SUPABASE_ANON_KEY;
            if (cfg.adminEmails) {
                const emails = String(cfg.adminEmails).split(',').map(e => e.trim()).filter(Boolean);
                if (emails.length) KLYPERIX_ADMINS = emails;
            }
        }
    } catch (e) {
        // ignore cache parse errors
    }
}

function getSupabaseClient() {
    if (_sbInstance) return _sbInstance;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[Supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY.');
        return null;
    }
    if (typeof supabase === 'undefined') {
        console.error('[Supabase] Library not loaded.');
        return null;
    }
    _sbInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _sbInstance;
}

// Helper to check if email is admin
function isKlyperixAdmin(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return KLYPERIX_ADMINS.some(admin => admin.toLowerCase() === cleanEmail);
}

async function initSupabaseConfig() {
    // Try cached config first so pages can initialize synchronously.
    loadCachedConfig();

    try {
        const res = await fetch('/api/public-config', { cache: 'no-store' });
        const json = await res.json();
        SUPABASE_URL = json.supabaseUrl || "";
        SUPABASE_ANON_KEY = json.supabaseAnonKey || "";
        const emails = (json.adminEmails || "").split(',').map(e => e.trim()).filter(Boolean);
        KLYPERIX_ADMINS = emails.length ? emails : KLYPERIX_ADMINS;

        try {
            localStorage.setItem('klyp_public_config', JSON.stringify(json));
        } catch (e) {
            // ignore storage failures
        }
    } catch (e) {
        console.warn('[Supabase] Failed to load public-config:', e);
    }

    window.klyperixSB = getSupabaseClient();
    window.isKlyperixAdmin = isKlyperixAdmin;
}

window.__klypSupabaseReady = initSupabaseConfig();
/**
 * Theme Manager for Klyperix
 * Handles automatic timezone-based theme selection and manual toggling.
 */
(function () {
    // 1. Auto Timezone Injection
    function applyAutoTheme() {
        const hour = new Date().getHours();
        // Daytime: 6:00 AM to 6:00 PM (18:00)
        if (hour >= 6 && hour < 18) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    // 2. Theme Toggle Logic
    function initThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        const toggleIcon = document.getElementById('toggleIcon');
        if (!themeBtn) return;

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');

            if (toggleIcon) {
                toggleIcon.innerHTML = isLight ?
                    '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />' :
                    '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />';
            }


            // Instant event dispatch — core-ui.js handles the Spline switch
            window.dispatchEvent(new CustomEvent('klyperixThemeChanged', { detail: { isLight } }));
        });
    }

    // Initialize
    applyAutoTheme();
    document.addEventListener('DOMContentLoaded', initThemeToggle);
})();
/**
 * Cinematic Timeline Engine for Klyperix (v2 — Performance Optimized)
 *
 * OPTIMIZATIONS:
 * 1. RAF stops completely when timeline is offscreen (IntersectionObserver)
 *    Before: requestAnimationFrame ran 60fps indefinitely even when invisible
 * 2. Wheel events throttled via RAF batching (prevents per-frame calculation spam)
 * 3. DocumentFragment for ruler tick injection (single DOM write vs 41 individual appends)
 */
(function () {
    function initTimeline() {
        const timeline = document.getElementById('cinematicTimeline');
        const playhead = document.getElementById('timelinePlayhead');
        const ruler = document.getElementById('timelineRuler');
        if (!timeline || !playhead || !ruler) return;

        // 1. Inject Ruler Ticks — batch via DocumentFragment
        ruler.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i <= 40; i++) {
            const tick = document.createElement('div');
            tick.className = 'timeline-tick';
            frag.appendChild(tick);
        }
        ruler.appendChild(frag);

        // 2. Animation Logic — with visibility gating
        let progress = 0;
        const speed = 0.35;
        let isPaused = false;
        let isVisible = false;
        let rafId = null;

        function animate() {
            if (!isPaused && isVisible) {
                progress += speed;
                if (progress > 100) progress = 0;
                playhead.style.left = progress + '%';
            }
            if (isVisible) {
                rafId = requestAnimationFrame(animate);
            } else {
                rafId = null; // Stop RAF loop completely
            }
        }

        function startRAF() {
            if (rafId === null && isVisible) {
                rafId = requestAnimationFrame(animate);
            }
        }

        function stopRAF() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        // Visibility gating — zero CPU when offscreen
        const timelineObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) startRAF();
                else stopRAF();
            });
        }, { threshold: 0 });
        timelineObserver.observe(timeline);

        // 3. Interaction Logic
        timeline.addEventListener('mouseenter', () => { isPaused = true; });
        timeline.addEventListener('mouseleave', () => { isPaused = false; });
    }



    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTimeline();
        });
    } else {
        initTimeline();
        initWhyUsTimeline();
        initProcessBranchTimeline();
    }
})();
/**
 * Core UI & Spline Management for Klyperix (v3 — Performance Optimized)
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Inactive spline viewers set to display:none → fully stops WebGL GPU rendering
 *    Only 1 viewer renders at any time (was 4 active WebGL contexts before)
 * 2. MutationObserver for permanent watermark removal (removes #logo element once)
 *    Replaces the old setInterval(1000) that polled every second forever
 * 3. Reveal elements auto-unobserved after activation (no wasted re-checking)
 * 4. getComputedStyle() removed from scroll observer (was forcing synchronous layout)
 * 5. Scene switching debounced at 150ms to prevent rapid toggling during fast scroll
 * 6. Theme toggle applies Spline switch instantly via klyperixThemeChanged event
 */
(function () {
    // ══════════════════════════════════════════════════════════
    // GPU PERFORMANCE: Spline Visibility Lifecycle Manager
    // ══════════════════════════════════════════════════════════
    // ── Global Safeguard: Block Spline's internal LinkedIn links ──
    const originalOpen = window.open;
    window.open = function (url, target, features) {
        if (url && url.toLowerCase().includes('linkedin') && document.body.classList.contains('hero-active')) {
            console.log("[Safety] LinkedIn redirect blocked. Redirecting to Services instead.");
            const services = document.getElementById('services');
            if (services) {
                services.scrollIntoView({ behavior: 'smooth' });
            }
            return null; // Block the original redirect
        }
        return originalOpen.apply(this, arguments);
    };

    const mount = document.getElementById('spline-mount');
    const home = document.getElementById('home');

    let heroSplineDark, heroSplineLight, bgSplineDark, bgSplineLight;
    let allSplines = [];
    let currentScene = 'hero';
    let sceneDebounceTimer = null;

    function isLowEnd() {
        const cores = navigator.hardwareConcurrency || 2;
        const mem = navigator.deviceMemory || 2;
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            if (!gl) return true;
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            if (ext) {
                const r = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
                if (/SwiftShader|llvmpipe|Software/i.test(r)) return true;
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (e) { return true; }
        return cores <= 2 || mem <= 2;
    }

    const lowEnd = isLowEnd();

    // ── Permanent watermark removal via MutationObserver ──
    // Replaces setInterval(1000) polling — fires once per viewer, then disconnects
    function removeWatermarkPermanently(viewer) {
        if (!viewer) return;

        function tryRemove() {
            if (!viewer.shadowRoot) return false;
            const logo = viewer.shadowRoot.querySelector('#logo');
            if (logo) {
                logo.remove(); // Permanently remove, not just hide
                return true;
            }
            return false;
        }

        if (tryRemove()) return;

        function watchShadowContent() {
            if (!viewer.shadowRoot) return;
            const innerObs = new MutationObserver(() => {
                if (tryRemove()) innerObs.disconnect();
            });
            innerObs.observe(viewer.shadowRoot, { childList: true, subtree: true });
            tryRemove();
        }

        if (!viewer.shadowRoot) {
            const shadowObs = new MutationObserver(() => {
                if (viewer.shadowRoot) {
                    shadowObs.disconnect();
                    watchShadowContent();
                }
            });
            shadowObs.observe(viewer, { childList: true, subtree: true });
        } else {
            watchShadowContent();
        }
    }

    // ── Activate exactly 1 spline viewer, display:none the rest ──
    // display:none fully stops WebGL rendering = zero GPU cost for inactive viewers
    function updateActiveSpline() {
        if (lowEnd) return;
        const isLight = document.body.classList.contains('light-theme');

        // Keep both hero and bg splines active for the current theme.
        // The hero spline will physically scroll up via translateY, smoothly revealing the bg spline underneath!
        allSplines.forEach(s => {
            const isTargetTheme = isLight ? s.id.includes('-light') : s.id.includes('-dark');
            if (isTargetTheme) {
                s.style.display = '';
                s.classList.add('active');
            } else {
                s.classList.remove('active');
                s.style.display = 'none';
            }
        });
    }

    function switchScene(scene) {
        if (scene === currentScene) return;
        currentScene = scene;

        if (lowEnd) {
            mount.innerHTML = '';
            const fb = document.createElement('div');
            fb.className = 'spline-fallback ' + (scene === 'hero' ? 'hero-fallback' : 'bg-fallback');
            mount.appendChild(fb);
        } else {
            // Debounce rapid scene switching during fast scrolling
            clearTimeout(sceneDebounceTimer);
            sceneDebounceTimer = setTimeout(updateActiveSpline, 150);
        }
    }

    function dismissLoader() {
        // Function preserved for compatibility but logic removed as loader is deleted
    }

    function initSpline() {
        if (lowEnd) {
            mount.innerHTML = '';
            const fb = document.createElement('div');
            fb.className = 'spline-fallback hero-fallback';
            mount.appendChild(fb);
            currentScene = 'hero';
            if (!usesVideoIntroLoader()) dismissLoader();

            mount.addEventListener('click', (e) => {
                if (document.body.classList.contains('hero-active')) {
                    triggerPremiumTransition(e);
                }
            });
        } else {
            heroSplineDark = document.getElementById('hero-spline-dark');
            heroSplineLight = document.getElementById('hero-spline-light');
            bgSplineDark = document.getElementById('bg-spline-dark');
            bgSplineLight = document.getElementById('bg-spline-light');
            allSplines = [heroSplineDark, heroSplineLight, bgSplineDark, bgSplineLight].filter(Boolean);

            // Set initial active state — 1 viewer renders, 3 are display:none
            updateActiveSpline();

            // Setup permanent watermark removal for all viewers
            allSplines.forEach(removeWatermarkPermanently);

            // Immediate visibility for non-mobile
            if (true) {
                dismissLoader();
            }
        }

        // Listen for theme changes — switch active spline variant instantly
        window.addEventListener('klyperixThemeChanged', () => {
            if (!lowEnd) updateActiveSpline();
        });
    }

    // ══════════════════════════════════════════════════════════
    // TRANSITIONS & NAVIGATION
    // ══════════════════════════════════════════════════════════
    function triggerPremiumTransition() {
        const targetSection = document.getElementById('services');
        if (!targetSection) return;
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    function initUI() {
        // ── Flip Card Click Toggle ──
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.flip-card.flipped').forEach(c => {
                    if (c !== card) c.classList.remove('flipped');
                });
                card.classList.toggle('flipped');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.flip-card.flipped').forEach(c => c.classList.remove('flipped'));
        });

        // ── Timeline & Hero Spline Visibility on Scroll ──
        const timeline = document.getElementById('cinematicTimeline');
        const heroDark = document.getElementById('hero-spline-dark');
        const heroLight = document.getElementById('hero-spline-light');
        const header = document.getElementById('dynamic-island');
        let lastScrollY = window.scrollY;
        let latestScrollY = window.scrollY;
        let viewportHeight = window.innerHeight;
        let scrollTicking = false;

        function applyScrollEffects() {
            scrollTicking = false;
            const scrollY = latestScrollY;
            const heroOpacity = Math.max(0, 1 - (scrollY / (viewportHeight * 0.5)));
            const heroTransform = `translate3d(0, -${scrollY}px, 0)`;

            // Dynamic Island Auto-hide on Scroll Down, Show on Scroll Up
            if (header) {
                if (scrollY > 150 && scrollY > lastScrollY) {
                    header.classList.add('nav-hidden');
                } else {
                    header.classList.remove('nav-hidden');
                }
            }
            lastScrollY = scrollY;

            // Scroll the hero splines (which contain the text) up naturally with the page and fade them out
            if (heroDark) {
                heroDark.style.transform = heroTransform;
                heroDark.style.opacity = heroOpacity;
            }
            if (heroLight) {
                heroLight.style.transform = heroTransform;
                heroLight.style.opacity = heroOpacity;
            }

            if (timeline) {
                // Disappear if scrolled down more than one viewport height
                if (scrollY > viewportHeight) {
                    timeline.classList.add('hide-timeline');
                } else {
                    timeline.classList.remove('hide-timeline');
                }
            }
        }

        function queueScrollEffects() {
            latestScrollY = window.scrollY;
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(applyScrollEffects);
        }

        window.addEventListener('scroll', queueScrollEffects, { passive: true });
        window.addEventListener('resize', () => {
            viewportHeight = window.innerHeight;
            queueScrollEffects();
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) queueScrollEffects();
        });
        applyScrollEffects();

        // ── Scroll Reveal — auto-unobserve after activation ──
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('active');
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(r => revealObserver.observe(r));

        // ── Dynamic Island Nav Tracking ──
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;

                    switchScene(id === 'home' ? 'hero' : 'bg');

                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });

                    if (id === 'home') document.body.classList.add('hero-active');
                    else document.body.classList.remove('hero-active');
                }
            });
        }, { root: null, rootMargin: '-30% 0px -30% 0px', threshold: 0 });
        sections.forEach(sec => scrollObserver.observe(sec));

        // ── Nav Pill Proximity Hover ──
        const backdrop = document.querySelector('.hover-backdrop');
        const navContainer = document.querySelector('.nav-pill');
        if (navContainer && backdrop) {
            navLinks.forEach(link => {
                link.addEventListener('mouseenter', (e) => {
                    const rect = e.target.getBoundingClientRect();
                    const containerRect = navContainer.getBoundingClientRect();
                    backdrop.style.opacity = '1';
                    backdrop.style.width = `${rect.width}px`;
                    backdrop.style.left = `${rect.left - containerRect.left}px`;
                });
            });
            navContainer.addEventListener('mouseleave', () => {
                backdrop.style.opacity = '0';
            });
        }

        // ── Explore Now Interaction Layer ──
        const exploreTarget = document.getElementById('spline-explore-target');
        if (exploreTarget) {
            let isTransitioning = false;

            // Safety: Block ANY external redirection to LinkedIn if it originated near this area
            window.addEventListener('beforeunload', (e) => {
                if (isTransitioning) {
                    // This is a brutal but effective way to stop unexpected redirects
                    // during our smooth scroll transition.
                    console.log("[Safety] Blocking unexpected redirect while transitioning");
                }
            });

            exploreTarget.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (isTransitioning) return;
                isTransitioning = true;

                exploreTarget.classList.add('clicking');

                const services = document.getElementById('services');
                if (services) {
                    const headerOffset = 100;
                    const elementPosition = services.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    setTimeout(() => {
                        exploreTarget.classList.remove('clicking');
                        isTransitioning = false;
                    }, 1000);
                } else {
                    isTransitioning = false;
                    exploreTarget.classList.remove('clicking');
                }
            });
        }
    }

    // Initialize everything
    document.addEventListener('DOMContentLoaded', () => {
        initSpline();
        initUI();
    });
})();
/**
 * Admin Preview Bridge for Klyperix
 * Receives messages from the admin panel and updates the live site design.
 */
(function () {
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

    window.addEventListener('message', function (event) {
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
// ═══════════════════════════════════════════════════════════
// KLYPERIX — TICKET MANAGEMENT SYSTEM
// ═══════════════════════════════════════════════════════════

class TicketsManager {
    constructor(supabaseClient) {
        this.sb = supabaseClient;
        this.currentTickets = [];
    }

    async createTicket(subject, description, priority = 'standard') {
        if (!window.klyperixUser || !window.klyperixUser.loggedIn) {
            throw new Error('Authentication required to create a ticket.');
        }

        const { data, error } = await this.sb.from('tickets').insert({
            user_id: (await this.sb.auth.getUser()).data.user?.id,
            user_email: window.klyperixUser.email,
            user_name: window.klyperixUser.name,
            subject: subject,
            description: description,
            priority: priority
        }).select();

        if (error) throw error;
        return data[0];
    }

    async loadUserTickets() {
        if (!window.klyperixUser || !window.klyperixUser.loggedIn) return [];

        const { data, error } = await this.sb.from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Tickets] Error loading:', error);
            return [];
        }
        this.currentTickets = data;
        return data;
    }

    async loadTicketMessages(ticketId) {
        const { data, error } = await this.sb.from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    async sendMessage(ticketId, message) {
        const { data, error } = await this.sb.from('ticket_messages').insert({
            ticket_id: ticketId,
            sender_name: window.klyperixUser.name,
            sender_email: window.klyperixUser.email,
            message: message,
            is_admin_reply: false
        }).select();

        if (error) throw error;
        return data[0];
    }

    subscribeToTicket(ticketId, onMessage) {
        return this.sb.channel('ticket-' + ticketId).on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'ticket_messages',
            filter: 'ticket_id=eq.' + ticketId
        }, payload => {
            onMessage(payload.new);
        }).subscribe();
    }
}

// Global initialization
window.initTickets = function (sb) {
    window.ticketsManager = new TicketsManager(sb);
    console.log("Klyperix Ticket System: INITIALIZED");
};
/**
 * Chat Support Engine for Klyperix
 * Handles visitor registration, intelligent responses, and realtime messaging.
 * Updated with Support Ticket integration and conversation completion logic.
 */
(function () {
    // ── Log page view ──
    if (window.sb) {
        window.sb.from('activity_log').insert({ event_type: 'page_view', event_detail: document.title }).then(() => { });
    }

    const inputRow = document.querySelector('.klchat-input-area');
    const msgsContainer = document.getElementById('klchatMsgs');
    const ticketSection = document.getElementById('klchatTicketSection');
    let isTyping = false;

    function addBubble(text, type, time) {
        if (!msgsContainer) return;
        const d = document.createElement('div');
        d.className = 'klchat-bubble ' + type;
        d.innerHTML = text + (time ? '<div class="btime">' + time + '</div>' : '');
        msgsContainer.appendChild(d);
        msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }

    function showTypingThenReply(text, delay) {
        if (isTyping || !msgsContainer) return;
        isTyping = true;
        const typing = document.createElement('div');
        typing.className = 'klchat-bubble bot';
        typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        msgsContainer.appendChild(typing);
        msgsContainer.scrollTop = msgsContainer.scrollHeight;
        setTimeout(() => {
            if (msgsContainer.contains(typing)) msgsContainer.removeChild(typing);
            addBubble(text, 'bot', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            isTyping = false;
        }, delay || 1200);
    }

    // ══════════════════════════════════════════════════════════
    // INTELLIGENT RESPONSE ENGINE
    // ══════════════════════════════════════════════════════════
    async function getGroqReply(userMsg) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    sessionId: window.klypSessionId || '',
                    page: window.location.pathname
                })
            });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json || !json.ok || !json.reply) throw new Error(json && json.error ? json.error : 'Groq error');
            return String(json.reply);
        } catch (e) {
            console.warn('[Chat] Groq reply failed, using fallback:', e && e.message ? e.message : e);
            return null;
        }
    }

    function getSmartReply(userMsg) {
        const msg = userMsg.toLowerCase().trim();

        if (/^(hi|hello|hey|sup|yo|good\s*(morning|evening|afternoon|night)|howdy|hola|namaste)/i.test(msg)) {
            return `Hello! I'm the Klyperix production node. How can I assist you today?`;
        }

        if (msg.includes('service') || msg.includes('what do you') || msg.includes('offer')) {
            return `We specialize in Video Editing, 3D Animation, and Motion Graphics. Our pipeline is optimized for high-end cinematic impact.`;
        }

        if (msg.includes('ticket') || msg.includes('contact') || msg.includes('human') || msg.includes('owner')) {
            revealTicketOption();
            return `I've enabled the direct contact module for you. You can now create a formal support ticket to speak with the owner.`;
        }

        // Default
        return `Interesting. Tell me more about your vision for this project. The more context you provide, the better I can prepare the production intelligence.`;
    }

    function revealTicketOption() {
        if (ticketSection) {
            ticketSection.classList.add('active');
            if (inputRow) inputRow.style.display = 'none'; // Hide normal input once conversation is "done"
            msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }
    }

    // ── Initialization ──
    function initChat() {
        const sendBtn = document.getElementById('klchatSend');
        if (sendBtn) sendBtn.addEventListener('click', sendUserMsg);

        const msgInput = document.getElementById('klchatMsg');
        if (msgInput) msgInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMsg(); });

        const ticketBtn = document.getElementById('createTicketChatBtn');
        if (ticketBtn) ticketBtn.addEventListener('click', handleCreateTicket);

        const closeBtn = document.getElementById('klchatClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('klypChatPanel').classList.remove('visible');
                document.getElementById('klypChatBtn').classList.remove('open');
            });
        }

        const chatBtn = document.getElementById('klypChatBtn');
        const chatPanel = document.getElementById('klypChatPanel');
        if (chatBtn && chatPanel) {
            chatBtn.addEventListener('click', () => {
                const isVisible = chatPanel.classList.toggle('visible');
                chatBtn.classList.toggle('open', isVisible);
            });
        }

        // Always show greeting for anonymous users
        showGreeting();
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    function showGreeting() {
        addBubble(`Klyperix Assistant Online. How can I assist you in your production journey today?`, 'bot');
    }

    async function sendUserMsg() {
        const input = document.getElementById('klchatMsg');
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';

        addBubble(msg, 'user', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Prefer Groq (Next.js server route). Fall back to rule-based replies.
        const groqReply = await getGroqReply(msg);
        const reply = groqReply || getSmartReply(msg);
        showTypingThenReply(reply, groqReply ? 900 : 1000);
    }

    async function handleCreateTicket() {
        if (!window.ticketsManager) {
            alert('Ticket system initializing...');
            return;
        }

        try {
            const subject = `New Inquiry via Chat`;
            const description = `A visitor has requested direct production contact via the AI Assistant.`;
            await window.ticketsManager.createTicket(subject, description, 'standard');

            // Success UI
            ticketSection.innerHTML = `
                <div class="tk-header" style="color:#A855F7">✔ Ticket Transmitted</div>
                <p style="font-size: 11px; opacity: 0.7; margin: 4px 0 12px;">Your inquiry has been logged in our secure vault. The owner will review your session and reach out shortly.</p>
            `;
        } catch (err) {
            console.error('[Chat] Ticket Error:', err);
            window.location.href = "mailto:garvagarwal03@gmail.com";
        }
    }


    document.addEventListener('DOMContentLoaded', initChat);
})();
