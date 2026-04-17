// ═══════════════════════════════════════════════════════════════
// KLYPERIX — Live Content Loader
// ═══════════════════════════════════════════════════════════════
// Loads editable text content from Supabase and applies to the page
// Uses data-content attributes on HTML elements
// ═══════════════════════════════════════════════════════════════

(function() {
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
