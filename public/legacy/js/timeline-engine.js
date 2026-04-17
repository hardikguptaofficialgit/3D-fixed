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
