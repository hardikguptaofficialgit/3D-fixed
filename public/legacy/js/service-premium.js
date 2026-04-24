/**
 * KLYPERIX PREMIUM SERVICE CORE LOGIC
 * Handles Theme Sync, Marquee cloning, and Video interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeControl();
    initMarqueeCloning();
    initVideoInteractions();
    initSmoothReveals();
    initCinemaFocus();
});

/**
 * Handles unified theme management across service pages
 */
function initThemeControl() {
    const themeToggle = document.getElementById('themeToggle');
    const toggleIcon = document.getElementById('toggleIcon');
    
    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-theme');
            if (toggleIcon) toggleIcon.innerHTML = '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
        } else {
            document.body.classList.remove('light-theme');
            if (toggleIcon) toggleIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />';
        }
    }

    // Sync with main site theme if possible, else use localStorage
    const savedTheme = localStorage.getItem('klyperix-premium-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    const initialIsLight = savedTheme ? (savedTheme === 'light') : prefersLight;
    applyTheme(initialIsLight);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('klyperix-premium-theme', isLight ? 'light' : 'dark');
            applyTheme(isLight);
            
            // Dispatch event for other listeners
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
        });
    }
}

/**
 * Efficiently clones marquee children for infinite scrolling
 */
function initMarqueeCloning() {
    document.querySelectorAll('.marquee-track').forEach(track => {
        const items = Array.from(track.children);
        if (items.length === 0) return;

        // Clone twice to ensure seamless loop on all screen sizes
        for (let i = 0; i < 2; i++) {
            items.forEach(item => {
                const clone = item.cloneNode(true);
                // Ensure cloned videos are muted and set to inline
                const video = clone.querySelector('video');
                if (video) {
                    video.muted = true;
                    video.volume = 0;
                    video.playsInline = true;
                }
                track.appendChild(clone);
            });
        }
    });
}

/**
 * Hover-to-Play logic for video containers
 */
function initVideoInteractions() {
    const videoContainers = document.querySelectorAll('.media-card');
    
    videoContainers.forEach(container => {
        const video = container.querySelector('video');
        if (!video) return;

        video.muted = true;
        video.playsInline = true;

        container.addEventListener('mouseenter', () => {
            if (!video.paused) return;

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play was prevented
                    console.log("Playback prevented:", error);
                });
            }
        });

        container.addEventListener('mouseleave', () => {
            if (video.paused) return;
            video.pause();
        });
    });
}

/**
 * Basic scroll-reveal animations if GSAP is not loaded
 * (Can be extended with GSAP if requested later)
 */
function initSmoothReveals() {
    const panels = document.querySelectorAll('.glass-panel');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    panels.forEach(panel => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(40px)';
        panel.style.transition = 'opacity 1.2s cubic-bezier(0.2, 1, 0.2, 1), transform 1.2s cubic-bezier(0.2, 1, 0.2, 1)';
        observer.observe(panel);
    });
}

/**
 * Cinematic Focus Engine
 * Projected Media Viewport with Navigation
 * Handles dynamic aspect ratios and integrated background blur
 */
function initCinemaFocus() {
    // Expose closeFocus globally for external use
    window.klypCloseCinema = closeFocus;
    window.klypOpenFocus = openFocus;

    // 1. Create Overlay Structure with Navigation
    if (!document.getElementById('cinemaOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'cinemaOverlay';
        overlay.innerHTML = `
            <button class="cinema-nav-btn prev" aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div class="cinema-stage">
                <div id="cinemaContent" style="position:relative; width:100%; height:100%;"></div>
            </div>
            <button class="cinema-nav-btn next" aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg>
            </button>
        `;
        document.body.appendChild(overlay);
    }

    const overlay = document.getElementById('cinemaOverlay');
    const content = document.getElementById('cinemaContent');
    
    let currentGallery = [];
    let currentIndex = 0;
    let activeTrack = null;

    function closeFocus() {
        const clone = content.querySelector('.cinema-media');
        if (!clone) {
            cleanup();
            return;
        }

        // Return to original item's current position
        const item = currentGallery[currentIndex];
        const sourceMedia = item.querySelector('video, img');
        if (!sourceMedia) {
            cleanup();
            return;
        }
        
        const rect = sourceMedia.getBoundingClientRect();

        gsap.to(clone, {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            xPercent: 0,
            yPercent: 0,
            borderRadius: '20px',
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: cleanup
        });
    }

    function navigateFocus(dir) {
        if (!currentGallery.length) return;
        
        let nextIndex = currentIndex + dir;
        if (nextIndex < 0) nextIndex = currentGallery.length - 1;
        if (nextIndex >= currentGallery.length) nextIndex = 0;
        
        const nextItem = currentGallery[nextIndex];
        openFocus(nextIndex, currentGallery, nextItem, true);
    }

    function openFocus(index, gallery, itemNode, isNav = false) {
        currentGallery = gallery;
        currentIndex = index;
        
        // Pause marquee
        activeTrack = itemNode.closest('.marquee-track');
        if (activeTrack) activeTrack.style.animationPlayState = 'paused';

        document.body.classList.add('cinema-mode');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // MEASURE - The source item
        const sourceMedia = itemNode.querySelector('video, img');
        if (!sourceMedia) return;
        
        const rect = sourceMedia.getBoundingClientRect();
        
        // Handle crossfire navigation
        const prevClone = content.querySelector('.cinema-media');
        if (isNav && prevClone) {
            gsap.to(prevClone, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => prevClone.remove() });
        } else {
            content.innerHTML = '';
        }

        // CREATE CLONE
        const clone = sourceMedia.cloneNode(true);
        clone.className = 'cinema-media';
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '10002';
        clone.style.margin = '0';
        clone.style.opacity = isNav ? '0' : '1';
        
        if (clone.tagName === 'VIDEO') {
            clone.controls = false;
            clone.autoplay = true;
            clone.loop = true;
            clone.muted = false; // ENABLE SOUND ON CLICK
            clone.volume = 1.0;
            clone.setAttribute('playsinline', '');
            
            // Interaction trigger unmuting (redundant but safe)
            const playWithSound = () => {
                clone.muted = false;
                clone.play().catch(e => console.warn("[Cinema] Playback failed:", e));
            };
            playWithSound();
        }

        content.appendChild(clone);

        // ANIMATE - To Center with precise ratio calculation
        const naturalW = sourceMedia.videoWidth || sourceMedia.naturalWidth || rect.width;
        const naturalH = sourceMedia.videoHeight || sourceMedia.naturalHeight || rect.height;
        const ratio = naturalW / naturalH;

        let targetWidth, targetHeight;
        
        if (ratio > 1) {
            // Horizontal: Prioritize width (88vw) but cap height at 88vh
            targetWidth = window.innerWidth * 0.88;
            targetHeight = targetWidth / ratio;
            if (targetHeight > window.innerHeight * 0.88) {
                targetHeight = window.innerHeight * 0.88;
                targetWidth = targetHeight * ratio;
            }
        } else {
            // Vertical: Prioritize height (88vh) but cap width at 88vw
            targetHeight = window.innerHeight * 0.88;
            targetWidth = targetHeight * ratio;
            if (targetWidth > window.innerWidth * 0.88) {
                targetWidth = window.innerWidth * 0.88;
                targetHeight = targetWidth / ratio;
            }
        }

        gsap.to(clone, {
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50,
            width: targetWidth,
            height: targetHeight,
            borderRadius: '24px',
            opacity: 1,
            duration: 0.8,
            ease: "expo.out"
        });
    }

    function cleanup() {
        overlay.classList.remove('active');
        document.body.classList.remove('cinema-mode');
        content.innerHTML = '';
        document.body.style.overflow = 'auto';
        if (activeTrack) activeTrack.style.animationPlayState = 'running';
        activeTrack = null;
    }

    // Attach listeners to items
    document.querySelectorAll('.marquee-track, .carousel-track').forEach(track => {
        const allItems = Array.from(track.querySelectorAll('.carousel-item'));
        
        allItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (overlay.classList.contains('active')) return;
                openFocus(index, allItems, item);
            });
        });
    });

    // Navigation Listeners
    overlay.querySelector('.prev').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateFocus(-1);
    });
    overlay.querySelector('.next').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateFocus(1);
    });

    // Close on click outside (anywhere but the media)
    overlay.addEventListener('click', (e) => {
        const isMedia = e.target.classList.contains('cinema-media');
        const isNav = e.target.closest('.cinema-nav-btn');
        if (!isMedia && !isNav) {
            closeFocus();
        }
    });

    // Global close listeners
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeFocus();
        if (e.key === 'ArrowRight') navigateFocus(1);
        if (e.key === 'ArrowLeft') navigateFocus(-1);
    });
}
