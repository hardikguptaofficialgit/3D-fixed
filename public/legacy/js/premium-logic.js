/**
 * PREMIUM SERVICE TEMPLATE LOGIC
 * Handles Theme, Hover-to-Play, and GSAP Animations
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
    if (!themeToggle) return;

    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-theme');
            themeToggle.textContent = 'Mode: Light';
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.textContent = 'Mode: Dark';
        }
    }

    // Initial detection
    const savedTheme = localStorage.getItem('klyperix-premium-theme');
    if (savedTheme) {
        applyTheme(savedTheme === 'light');
    } else {
        applyTheme(!prefersDark.matches);
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('klyperix-premium-theme', isLight ? 'light' : 'dark');
        themeToggle.textContent = isLight ? 'Mode: Light' : 'Mode: Dark';
    });
}

/**
 * Hover-to-Play logic for video thumbnails
 */
function initHoverToPlay() {
    const videoWrappers = document.querySelectorAll('.media-wrapper');
    
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        if (!video) return;

        // Ensure video is muted for autoplay compliance
        video.muted = true;
        video.playsInline = true;

        wrapper.addEventListener('mouseenter', () => {
            video.play().catch(err => console.warn('Autoplay prevented:', err));
        });

        wrapper.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // Reset to start
        });
    });
}

/**
 * GSAP Reveal Animations
 * Requires GSAP and ScrollTrigger
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not found. Animations disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Fade-in reveal for containers
    const revealElements = document.querySelectorAll('.reveal-up');
    
    revealElements.forEach((el, index) => {
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
            delay: el.dataset.delay || 0
        });
    });

    // Weighted parallax effect for glass cards
    const glassCards = document.querySelectorAll('.curved-glass');
    glassCards.forEach(card => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -20,
            ease: 'none'
        });
    });
}
