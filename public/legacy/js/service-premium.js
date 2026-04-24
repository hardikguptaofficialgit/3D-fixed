/**
 * KLYPERIX PREMIUM SERVICE TEMPLATE LOGIC
 * Handles Theme, Hover-to-Play, and GSAP Animations
 * * OPTIMIZATIONS APPLIED:
 * 1. Theme initialization decoupled from the toggle button presence.
 * 2. Event Delegation for video hover to support dynamically injected elements.
 * 3. GSAP force3D and gsap.utils.toArray applied for maximum GPU performance.
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initHoverToPlay();
    initGSAPAnimations();
});

/**
 * Theme Manager
 * Detects system preference and site 'theme' state
 */
function initThemeManager() {
    const themeToggle = document.querySelector('.theme-toggle-btn');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-theme');
            if (themeToggle) themeToggle.textContent = 'Mode: Light';
        } else {
            document.body.classList.remove('light-theme');
            if (themeToggle) themeToggle.textContent = 'Mode: Dark';
        }
    }

    // Initial detection - Applies even if the toggle button is missing from the DOM
    const savedTheme = localStorage.getItem('klyperix-premium-theme');
    const initialIsLight = savedTheme ? (savedTheme === 'light') : !prefersDark.matches;
    applyTheme(initialIsLight);

    // Only bind the click listener if the button exists on this specific page
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('klyperix-premium-theme', isLight ? 'light' : 'dark');
            applyTheme(isLight);
            
            // Dispatch event for other listeners to sync
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
        });
    }
}

/**
 * Hover-to-Play logic for video thumbnails (Using Event Delegation)
 */
function initHoverToPlay() {
    // Prep all existing videos on load for autoplay compliance
    document.querySelectorAll('.media-wrapper video').forEach(video => {
        video.muted = true;
        video.playsInline = true;
    });

    document.addEventListener('mouseover', (e) => {
        const wrapper = e.target.closest('.media-wrapper');
        if (wrapper) {
            const video = wrapper.querySelector('video');
            if (video) {
                video.play().catch(err => console.warn('[Klyperix] Autoplay prevented:', err));
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const wrapper = e.target.closest('.media-wrapper');
        // Ensure we actually leave the wrapper entirely
        if (wrapper && !wrapper.contains(e.relatedTarget)) {
            const video = wrapper.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // Reset to start
            }
        }
    });
}

/**
 * GSAP Reveal Animations
 * Requires GSAP and ScrollTrigger
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[Klyperix] GSAP or ScrollTrigger not found. Animations disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Fade-in reveal for containers - Optimized with gsap.utils.toArray
    const revealElements = gsap.utils.toArray('.reveal-up');
    
    revealElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            force3D: true, // Force GPU acceleration
            delay: parseFloat(el.dataset.delay) || 0 // Safely parse strings to numbers
        });
    });

    // Weighted parallax effect for glass cards
    const glassCards = gsap.utils.toArray('.curved-glass');
    glassCards.forEach(card => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -20,
            ease: 'none',
            force3D: true // Force GPU acceleration
        });
    });
}