/**
 * Cinematic Timeline Engine for Klyperix (v3 - Performance Optimized)
 *
 * OPTIMIZATIONS:
 * 1. RAF stops completely when timeline is offscreen OR paused via hover.
 * Before: requestAnimationFrame ran 60fps indefinitely even when paused.
 * 2. DocumentFragment for ruler tick injection (single DOM write).
 * 3. Unified initialization logic to prevent missing function calls.
 */
(function () {
    function initTimeline() {
        const timeline = document.getElementById('cinematicTimeline');
        const playhead = document.getElementById('timelinePlayhead');
        const ruler = document.getElementById('timelineRuler');
        
        if (!timeline || !playhead || !ruler) return;

        // 1. Inject Ruler Ticks - batch via DocumentFragment
        ruler.innerHTML = '';
        const frag = document.createDocumentFragment();
        
        // Cache the loop limit
        const tickCount = 40; 
        for (let i = 0; i <= tickCount; i++) {
            const tick = document.createElement('div');
            tick.className = 'timeline-tick';
            frag.appendChild(tick);
        }
        ruler.appendChild(frag);

        // 2. Animation Logic - with strict visibility and interaction gating
        let progress = 0;
        const speed = 0.35;
        let isPaused = false;
        let isVisible = false;
        let rafId = null;

        function animate() {
            // If paused or invisible, do not schedule another frame.
            if (isPaused || !isVisible) {
                rafId = null;
                return;
            }

            progress += speed;
            if (progress > 100) progress = 0;
            playhead.style.left = progress + '%';
            
            rafId = requestAnimationFrame(animate);
        }

        function startRAF() {
            if (rafId === null && isVisible && !isPaused) {
                rafId = requestAnimationFrame(animate);
            }
        }

        function stopRAF() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        // Visibility gating - zero CPU when offscreen
        const timelineObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    startRAF();
                } else {
                    stopRAF();
                }
            });
        }, { threshold: 0 });
        
        timelineObserver.observe(timeline);

        // 3. Interaction Logic - Now stops the RAF loop entirely instead of running idle
        timeline.addEventListener('mouseenter', () => { 
            isPaused = true; 
            stopRAF(); 
        }, { passive: true });
        
        timeline.addEventListener('mouseleave', () => { 
            isPaused = false; 
            startRAF(); 
        }, { passive: true });
    }

    // Unify initialization to ensure all timelines start properly
    function initAll() {
        initTimeline();
        
        // Safety checks prevent errors if these are defined in a separate file
        if (typeof initWhyUsTimeline === 'function') {
            initWhyUsTimeline();
        }
        if (typeof initProcessBranchTimeline === 'function') {
            initProcessBranchTimeline();
        }
    }

    // Standardized load handling
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();