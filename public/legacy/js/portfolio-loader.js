// ═══════════════════════════════════════════════════════════════
// KLYPERIX — Portfolio Dynamic Loader
// ═══════════════════════════════════════════════════════════════
// Fetches media from Supabase and populates portfolio carousels
// ═══════════════════════════════════════════════════════════════

(function() {
    if (window.__klyperixPortfolioLoaderInitialized) return;
    window.__klyperixPortfolioLoaderInitialized = true;

    const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!sb) { console.warn('[Portfolio Loader] Supabase not available'); return; }

    // Detect page name from URL (Improved for Windows compatibility)
    const path = window.location.pathname;
    let pageName = path.replace(/\\/g, '/').split('/').pop().replace('.html', '') || 'video-editing';
    
    // Handle local file paths cases
    if (pageName === 'index' || pageName === '') pageName = 'video-editing';
    
    console.log('[Klyperix Debug] Detected Page Name:', pageName);

    // Map ratio text to section_type keys (Updated for .panel-tag support)
    function detectPanelRatios() {
        const panels = document.querySelectorAll('.glass-panel');
        panels.forEach(panel => {
            const tag = panel.querySelector('.panel-tag') || panel.querySelector('.panel-desc');
            if (tag) {
                const text = tag.textContent;
                if (text.includes('9:16')) panel.dataset.ratio = '9:16';
                else if (text.includes('1:1')) panel.dataset.ratio = '1:1';
                else if (text.includes('16:9')) panel.dataset.ratio = '16:9';
                else if (text.includes('4:5')) panel.dataset.ratio = '4:5';
            }
        });
    }

    // Build a media element (video or image)
    function buildMediaEl(item, ratioClass) {
        const isVideo = item.media_type === 'video';
        const url = item.media_url || '';
        
        if (isVideo) {
            return `<div class="media-container ${ratioClass}" 
                        onmouseenter="klypHoverMedia(this, true)" 
                        onmouseleave="klypHoverMedia(this, false)" 
                        onclick="klypClickMedia(this)">
                <video 
                    src="${url}" 
                    loop muted playsinline 
                    preload="metadata" 
                    controlsList="nodownload nofullscreen noremoteplayback" 
                    disablePictureInPicture
                    style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;transition:all 0.5s cubic-bezier(0.2, 1, 0.2, 1);"
                ></video>
                <div class="media-interaction-overlay">
                    <svg class="play-hint" width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"></polygon></svg>
                </div>
            </div>`;
        } else {
            return `<div class="media-container ${ratioClass}" 
                        onmouseenter="klypHoverMedia(this, true)" 
                        onmouseleave="klypHoverMedia(this, false)" 
                        onclick="klypClickMedia(this)">
                <img 
                    src="${url}" 
                    alt="${item.title || ''}" 
                    loading="lazy" 
                    decoding="async"
                    style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;transition:all 0.5s cubic-bezier(0.2, 1, 0.2, 1);"
                >
            </div>`;
        }
    }

    // Interaction Handlers
    window.klypHoverMedia = function(container, isEnter) {
        const video = container.querySelector('video');
        const media = container.querySelector('video, img');
        
        if (isEnter) {
            // Play only while hovered
            if (video) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        video.muted = true;
                        video.play();
                    });
                }
            }
            if (media) media.style.filter = ''; // Reset filters
        } else {
            // Stop when cursor leaves
            if (video) video.pause();
        }
    };

    window.klypClickMedia = function(container) {
        const itemNode = container.closest('.carousel-item');
        const track = container.closest('.marquee-track') || container.closest('.carousel-track');
        const media = container.querySelector('video, img');
        
        // 1. Trigger Visual Pop Animation
        container.classList.add('media-animating');
        if (media) {
            media.style.transform = 'scale(1.15)';
            setTimeout(() => {
                media.style.transform = '';
                container.classList.remove('media-animating');
            }, 500);
        }

        // 2. Open Cinema Focus Mode if available
        if (typeof window.klypOpenFocus === 'function' && itemNode && track) {
            const allItems = Array.from(track.querySelectorAll('.carousel-item'));
            const index = allItems.indexOf(itemNode);
            if (index !== -1) {
                window.klypOpenFocus(index, allItems, itemNode);
            }
        }
    };

    // Build a carousel item
    function buildItem(item, itemClass, ratioClass) {
        return `
            <div class="carousel-item ${itemClass}">
                ${item.media_url ? buildMediaEl(item, ratioClass) : `<div class="media-container ${ratioClass}"><div class="media-placeholder"><svg class="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Empty Slot</span></div></div>`}
                ${item.meta_tag ? `<span class="portfolio-meta">${item.meta_tag}</span>` : ''}
                ${item.title ? `<h3 class="item-title">${item.title}</h3>` : ''}
            </div>`;
    }

    // Ratio → CSS class mapping
    const RATIO_MAP = {
        '9:16': { item: 'item-9-16', ratio: 'ratio-9-16' },
        '1:1':  { item: 'item-1-1',  ratio: 'ratio-1-1' },
        '16:9': { item: 'item-16-9', ratio: 'ratio-16-9' },
        '4:5':  { item: 'item-9-16', ratio: 'ratio-9-16' }
    };

    // Inject Necessary CSS
    function injectInteractionCSS() {
        if (document.getElementById('klypInteractionCss')) return;
        const style = document.createElement('style');
        style.id = 'klypInteractionCss';
        style.textContent = `
            .media-container {
                position: relative;
                overflow: hidden;
                cursor: pointer;
            }
            .media-interaction-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.1);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            .media-container:hover .media-interaction-overlay {
                opacity: 1;
            }
            .portfolio-meta {
                display: block;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                opacity: 0.5;
                margin-top: 1rem;
            }
            .item-title {
                margin-top: 0.5rem;
                font-family: 'Playfair Display', serif;
                font-size: 1.2rem;
            }
        `;
        document.head.appendChild(style);
    }

    // Reinitialize carousel controls after content loads
    function reinitCarousels() {
        document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
            const track = wrapper.querySelector('.carousel-track') || wrapper.querySelector('.marquee-track');
            if (!track) return;
            const items = Array.from(track.children);
            
            // Note: Service pages use CSS marquee, so we only need manual controls for non-marquee tracks
        });
    }

    // Main loader
    async function loadPortfolioMedia() {
        injectInteractionCSS();
        detectPanelRatios();

        const { data, error } = await sb.from('media_slots')
            .select('*')
            .eq('page_name', pageName)
            .order('sort_order', { ascending: true });

        console.log(`[Klyperix Debug] Database Result for "${pageName}":`, { count: data ? data.length : 0, error });

        if (error) { 
            console.error('[Portfolio Loader] Database Error:', error); 
            return; 
        }

        // Group by section_type
        const grouped = {};
        if (data && data.length > 0) {
            data.forEach(item => {
                if (!grouped[item.section_type]) grouped[item.section_type] = [];
                grouped[item.section_type].push(item);
            });
        }

        // Populate each panel
        document.querySelectorAll('.glass-panel[data-ratio]').forEach(panel => {
            const ratio = panel.dataset.ratio;
            const track = panel.querySelector('.carousel-track') || panel.querySelector('.marquee-track');
            if (!track) return;

            const items = grouped[ratio] || [];
            const classes = RATIO_MAP[ratio] || RATIO_MAP['9:16'];

            if (items.length > 0) {
                // Populate and duplicate for infinite scroll if it's a marquee
                const html = items.map(item => buildItem(item, classes.item, classes.ratio)).join('');
                if (track.classList.contains('marquee-track')) {
                    track.innerHTML = html + html; // Double for seamless loop
                    track.dataset.klypCloned = 'true';
                } else {
                    track.innerHTML = html;
                }
            }
        });

        reinitCarousels();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(loadPortfolioMedia, 200));
    } else {
        setTimeout(loadPortfolioMedia, 200);
    }
})();
