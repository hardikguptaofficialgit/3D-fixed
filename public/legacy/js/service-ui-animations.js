/**
 * KLYPERIX - Thematic UI Animations
 * Intercepts existing pages and overrides scrolling logic based on UI modes.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Only proceed if GSAP is available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);

    const is3DMode = document.body.classList.contains('ui-3d-mode');
    const is2DMode = document.body.classList.contains('ui-2d-mode');

    // Remove existing simple reveals from service-premium to apply custom triggers
    const panels = document.querySelectorAll('.glass-panel');
    
    if (is3DMode) {
        init3DScroll();
    } else if (is2DMode) {
        init2DScroll();
    }
});

function init3DScroll() {
    console.log("[Klyperix] Initializing 3D Volumetric Scroll Engine");
    
    // Set 3D perspective on all panels initially
    gsap.set('.glass-panel', {
        transformPerspective: 1500,
        transformStyle: "preserve-3d"
    });

    const panels = document.querySelectorAll('.glass-panel');
    
    panels.forEach((panel, i) => {
        // Create an organic floating effect for the cards within
        const cards = panel.querySelectorAll('.carousel-item');
        
        gsap.fromTo(panel, 
            { 
                opacity: 0, 
                z: -500,        // Start pushed back into screen
                rotationX: 10,  // Slightly tilted up
                y: 100
            },
            {
                opacity: 1,
                z: 0,           // Bring to zero Z
                rotationX: 0,
                y: 0,
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: panel,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1 // Link animation to scroll bar for true 3D parallax
                }
            }
        );

        // Make the individual media cards float inside the panel on scroll
        if (cards.length > 0) {
            gsap.to(cards, {
                z: 60, // Push cards out from the panel locally
                y: -30,
                rotationY: (index) => index % 2 === 0 ? -5 : 5, // Slight alternating twist
                stagger: 0.1,
                scrollTrigger: {
                    trigger: panel,
                    start: "top 70%",
                    end: "bottom 30%",
                    scrub: 2
                }
            });
        }
    });

    // Animate header title in 3D
    gsap.fromTo(".page-title", 
        { opacity: 0, z: -300, rotationX: -20, scale: 0.8 },
        { opacity: 1, z: 0, rotationX: 0, scale: 1, duration: 2, ease: "expo.out" }
    );
}

function init2DScroll() {
    console.log("[Klyperix] Initializing 2D Vector Scroll Engine");
    
    const panels = document.querySelectorAll('.glass-panel');

    panels.forEach((panel, index) => {
        // Alternate slide directions for a comic-book style reveal
        const isEven = index % 2 === 0;
        const xOffset = isEven ? -100 : 100;

        // Reset base transforms 
        gsap.set(panel, { opacity: 0, xPercent: xOffset });

        // Hard wipe / slide reveal
        gsap.to(panel, {
            opacity: 1,
            xPercent: 0,
            duration: 1,
            ease: "power4.out", // Sharp, fast ease for vector feel
            scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                toggleActions: "play none none reverse" // Play on enter, reverse on leave back
            }
        });

        // Masks revealing media cards
        const cards = panel.querySelectorAll('.media-card');
        if (cards.length > 0) {
            gsap.fromTo(cards, 
                { clipPath: isEven ? "polygon(0 0, 0 0, 0 100%, 0% 100%)" : "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" },
                { 
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    duration: 1.2,
                    ease: "expo.inOut",
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 60%"
                    }
                }
            );
        }
    });

    // Sharp title reveal (typewriter + mask style)
    gsap.fromTo(".page-title", 
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", x: -20 },
        { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", x: 0, duration: 1.5, ease: "power4.inOut" }
    );
}
