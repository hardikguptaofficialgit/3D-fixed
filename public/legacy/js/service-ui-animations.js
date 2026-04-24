/**
 * KLYPERIX - Thematic UI Animations
 * Intercepts existing pages and overrides scrolling logic based on UI modes.
 * * OPTIMIZATIONS:
 * 1. force3D: true added to offload complex animations to the GPU.
 * 2. gsap.utils.toArray() used for faster, native DOM array conversion.
 * 3. Scoped queries and null checks added to prevent silent errors.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Only proceed if GSAP is available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("[Klyperix] GSAP or ScrollTrigger missing.");
        return;
    }
    
    gsap.registerPlugin(ScrollTrigger);

    const is3DMode = document.body.classList.contains('ui-3d-mode');
    const is2DMode = document.body.classList.contains('ui-2d-mode');

    if (is3DMode) {
        init3DScroll();
    } else if (is2DMode) {
        init2DScroll();
    }
});

function init3DScroll() {
    console.log("[Klyperix] Initializing 3D Volumetric Scroll Engine");
    
    const panels = gsap.utils.toArray('.glass-panel');
    if (!panels.length) return;

    // Set 3D perspective on all panels initially
    gsap.set(panels, {
        transformPerspective: 1500,
        transformStyle: "preserve-3d"
    });
    
    panels.forEach((panel, i) => {
        // Scoped, optimized query for cards within this specific panel
        const cards = gsap.utils.toArray('.carousel-item', panel);
        
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
                force3D: true,  // Hardware acceleration
                scrollTrigger: {
                    trigger: panel,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1    // Link animation to scroll bar for true 3D parallax
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
                force3D: true,
                scrollTrigger: {
                    trigger: panel,
                    start: "top 70%",
                    end: "bottom 30%",
                    scrub: 2
                }
            });
        }
    });

    // Animate header title in 3D safely
    const pageTitle = document.querySelector(".page-title");
    if (pageTitle) {
        gsap.fromTo(pageTitle, 
            { opacity: 0, z: -300, rotationX: -20, scale: 0.8 },
            { opacity: 1, z: 0, rotationX: 0, scale: 1, duration: 2, ease: "expo.out", force3D: true }
        );
    }
}

function init2DScroll() {
    console.log("[Klyperix] Initializing 2D Vector Scroll Engine");
    
    const panels = gsap.utils.toArray('.glass-panel');
    if (!panels.length) return;

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
            force3D: true,
            scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                toggleActions: "play none none reverse" // Play on enter, reverse on leave back
            }
        });

        // Masks revealing media cards
        const cards = gsap.utils.toArray('.media-card', panel);
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

    // Sharp title reveal safely
    const pageTitle = document.querySelector(".page-title");
    if (pageTitle) {
        gsap.fromTo(pageTitle, 
            { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", x: -20 },
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", x: 0, duration: 1.5, ease: "power4.inOut", force3D: true }
        );
    }
}