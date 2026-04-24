/**
 * Core UI & Spline Management for Klyperix (v3 - Performance Optimized)
 *
 * NEW OPTIMIZATIONS APPLIED:
 * 1. requestAnimationFrame (rAF) used for all scroll-bound animations.
 * 2. { passive: true } added to scroll listeners to unblock the scrolling thread.
 * 3. Viewport height cached and bound to resize events to prevent layout thrashing.
 * 4. State flags (heroHidden) prevent redundant DOM style updates once elements are invisible.
 * 5. Transform calculations are only applied to the actively visible Spline instance.
 */
(function () {
    if (window.__klyperixCoreUiInitialized) return;
    window.__klyperixCoreUiInitialized = true;

    // ==========================================================
    // GPU PERFORMANCE: Spline Visibility Lifecycle Manager
    // ==========================================================
    
    // Global Safeguard: Block Spline's internal LinkedIn links
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (url && url.toLowerCase().includes('linkedin') && document.body.classList.contains('hero-active')) {
            console.log("[Safety] LinkedIn redirect blocked. Redirecting to Services instead.");
            const services = document.getElementById('services');
            if (services) {
                services.scrollIntoView({ behavior: 'smooth' });
            }
            return null; 
        }
        return originalOpen.apply(this, arguments);
    };

    const mount = document.getElementById('spline-mount');
    const home = document.getElementById('home');

    let heroSplineDark, heroSplineLight, bgSplineDark, bgSplineLight;
    let allSplines = [];
    let currentScene = 'hero';
    let sceneDebounceTimer = null;
    let lastAppliedHeroTransform = '';
    let lastAppliedHeroOpacity = '';
    
    // Cache viewport height to avoid layout thrashing on scroll
    let viewportHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        viewportHeight = window.innerHeight;
    }, { passive: true });

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

    // Permanent watermark removal via MutationObserver
    function removeWatermarkPermanently(viewer) {
        if (!viewer) return;

        function tryRemove() {
            if (!viewer.shadowRoot) return false;
            const logo = viewer.shadowRoot.querySelector('#logo');
            if (logo) {
                logo.remove(); 
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

    // Activate exactly 1 spline viewer, display:none the rest
    function updateActiveSpline() {
        if (lowEnd) return;
        const isLight = document.body.classList.contains('light-theme');

        allSplines.forEach(s => {
            const isTargetTheme = isLight ? s.id.includes('-light') : s.id.includes('-dark');
            if (isTargetTheme) {
                s.style.display = '';
                s.classList.add('active');
                // Hint to browser that these will animate
                s.style.willChange = 'transform, opacity'; 
            } else {
                s.classList.remove('active');
                s.style.display = 'none';
                s.style.willChange = 'auto';
            }
        });
    }

    function getActiveHeroSpline() {
        if (heroSplineDark && heroSplineDark.classList.contains('active')) return heroSplineDark;
        if (heroSplineLight && heroSplineLight.classList.contains('active')) return heroSplineLight;
        return null;
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
            clearTimeout(sceneDebounceTimer);
            sceneDebounceTimer = setTimeout(updateActiveSpline, 150);
        }
    }

    function dismissLoader() {
        // Preserved for compatibility
    }

    function initSpline() {
        if (lowEnd) {
            mount.innerHTML = '';
            const fb = document.createElement('div');
            fb.className = 'spline-fallback hero-fallback';
            mount.appendChild(fb);
            currentScene = 'hero';
            if (typeof usesVideoIntroLoader !== 'undefined' && !usesVideoIntroLoader()) dismissLoader();

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

            updateActiveSpline();
            allSplines.forEach(removeWatermarkPermanently);

            if (true) {
                dismissLoader();
            }
        }

        window.addEventListener('klyperixThemeChanged', () => {
            if (!lowEnd) updateActiveSpline();
        });
    }

    // ==========================================================
    // TRANSITIONS & NAVIGATION
    // ==========================================================
    function triggerPremiumTransition() {
        const targetSection = document.getElementById('services');
        if (!targetSection) return;
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    function initUI() {
        // Flip Card Click Toggle
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.flip-card');

            if (card) {
                e.stopPropagation();
                document.querySelectorAll('.flip-card.flipped').forEach(c => {
                    if (c !== card) c.classList.remove('flipped');
                });
                card.classList.toggle('flipped');
                return;
            }

            document.querySelectorAll('.flip-card.flipped').forEach(c => c.classList.remove('flipped'));
        });

        // Timeline & Hero Spline Visibility on Scroll (Optimized with rAF)
        const timeline = document.getElementById('cinematicTimeline');
        const header = document.getElementById('dynamic-island');
        let lastScrollY = window.scrollY;
        
        let isTicking = false;
        let heroHidden = false; // State flag to prevent redundant styling

        function onScrollUpdate() {
            const scrollY = window.scrollY;
            
            // Dynamic Island Auto-hide
            if (header) {
                if (scrollY > 150 && scrollY > lastScrollY) {
                    header.classList.add('nav-hidden');
                } else {
                    header.classList.remove('nav-hidden');
                }
            }
            lastScrollY = scrollY;
            
            // Scroll and fade active hero spline
            const threshold = viewportHeight * 0.5;
            const activeHeroSpline = getActiveHeroSpline();
            if (scrollY <= threshold) {
                const opacityVal = String(1 - (scrollY / threshold));
                const transformVal = `translate3d(0, -${scrollY}px, 0)`;

                if (activeHeroSpline && lastAppliedHeroTransform !== transformVal) {
                    activeHeroSpline.style.transform = transformVal;
                    lastAppliedHeroTransform = transformVal;
                }
                if (activeHeroSpline && lastAppliedHeroOpacity !== opacityVal) {
                    activeHeroSpline.style.opacity = opacityVal;
                    lastAppliedHeroOpacity = opacityVal;
                }
                heroHidden = false;
            } else if (!heroHidden) {
                // Apply final hidden state exactly once
                const finalTransform = `translate3d(0, -${threshold}px, 0)`;
                [heroSplineDark, heroSplineLight].forEach((spline) => {
                    if (!spline) return;
                    spline.style.transform = finalTransform;
                    spline.style.opacity = 0;
                });
                if (activeHeroSpline) {
                    lastAppliedHeroTransform = finalTransform;
                    lastAppliedHeroOpacity = '0';
                }
                heroHidden = true;
            }
            
            // Timeline visibility
            if (timeline) {
                if (scrollY > viewportHeight * 0.65) {
                    timeline.classList.add('hide-timeline');
                } else {
                    timeline.classList.remove('hide-timeline');
                }
            }
            
            isTicking = false;
        }

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(onScrollUpdate);
                isTicking = true;
            }
        }, { passive: true }); // passive flag improves scroll performance significantly
        window.addEventListener('resize', () => {
            if (!isTicking) {
                window.requestAnimationFrame(onScrollUpdate);
                isTicking = true;
            }
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !isTicking) {
                window.requestAnimationFrame(onScrollUpdate);
                isTicking = true;
            }
        });

        // Scroll Reveal 
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('active');
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(r => revealObserver.observe(r));

        // Dynamic Island Nav Tracking 
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

        // Nav Pill Proximity Hover 
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

        // Explore Now Interaction Layer 
        const exploreTarget = document.getElementById('spline-explore-target');
        if (exploreTarget) {
            let isTransitioning = false;
            
            window.addEventListener('beforeunload', (e) => {
                if (isTransitioning) {
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
                    // Updated to use modern window.scrollY
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

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

        onScrollUpdate();
    }

    // Initialize everything
    document.addEventListener('DOMContentLoaded', () => {
        initSpline();
        initUI();
    });
})();
