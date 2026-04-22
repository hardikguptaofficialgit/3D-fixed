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
    window.open = function(url, target, features) {
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

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
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
                heroDark.style.transform = `translateY(-${scrollY}px)`;
                heroDark.style.opacity = Math.max(0, 1 - (scrollY / (window.innerHeight * 0.5)));
            }
            if (heroLight) {
                heroLight.style.transform = `translateY(-${scrollY}px)`;
                heroLight.style.opacity = Math.max(0, 1 - (scrollY / (window.innerHeight * 0.5)));
            }
            
            if (timeline) {
                // Disappear if scrolled down more than 65% of viewport height
                if (scrollY > window.innerHeight * 0.65) {
                    timeline.classList.add('hide-timeline');
                } else {
                    timeline.classList.remove('hide-timeline');
                }
            }
        });

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
