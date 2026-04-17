const fs = require('fs');
const path = require('path');

const services = [
    {
        file: "video-editing.html",
        title: "Video Editing",
        description: "Premium cinematic grading and rhythmic narratives. Browse our portfolio archives below."
    },
    {
        file: "motion.html",
        title: "Motion Graphics",
        description: "Advanced motion systems and dynamic kinetic typography sequences."
    },
    {
        file: "3d-animation-graphics.html",
        title: "3D Animation",
        description: "Architectural 3D engineering and abstract dimensional simulations."
    },
    {
        file: "graphic-design.html",
        title: "Graphic Design",
        description: "Structural visual compositions built on immaculate spatial grids."
    },
    {
        file: "logo-design.html",
        title: "Logo Design",
        description: "Designing timeless, vector-based identity marks for global icons."
    },
    {
        file: "2d-animation.html",
        title: "2D Animation",
        description: "Fluid frame-by-frame vector sequences and expressive character physics."
    }
];

const getTemplate = (title, description) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klyperix - ${title} Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        :root {
            /* DEEP FOREST DARK MODE */
            --bg-primary: #050E07;
            --bg-secondary: #0A160D;
            --text-main: #2c9e50;
            --accent-color: #57C16F;
            --text-heading: #2c9e50;

            --bg-color: var(--bg-primary);
            --surface-color: var(--bg-secondary);
            --text-color: var(--text-main);
            --text-secondary: var(--accent-color);
            
            --glass-bg: rgba(18, 36, 24, 0.45);
            --glass-border: rgba(87, 193, 111, 0.2);
            --glass-highlight: rgba(224, 219, 197, 0.15);
            --glass-shadow: rgba(0, 0, 0, 0.95);

            --vignette-grad: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5, 14, 7, 0.9) 100%);
        }

        .light-theme {
            /* LIGHT MODE: SOFT CREAM */
            --bg-color: #E0DBC5;
            --surface-color: #FFFFFF;
            --text-color: #2c9e50;
            --text-secondary: #4EBE67;
            --text-heading: #2c9e50;

            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(44, 73, 55, 0.15);
            --glass-highlight: rgba(255, 255, 255, 0.7);
            --glass-shadow: rgba(44, 73, 55, 0.15);

            --vignette-grad: radial-gradient(circle at center, transparent 30%, rgba(209, 204, 183, 0.4) 150%);
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: 'Poppins', sans-serif;
            overflow-x: hidden;
            margin: 0;
            transition: background-color 0.8s cubic-bezier(0.2, 1, 0.2, 1), color 0.8s cubic-bezier(0.2, 1, 0.2, 1);
        }

        .vignette {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: var(--vignette-grad);
            transition: background 0.8s cubic-bezier(0.2, 1, 0.2, 1);
        }

        .noise-overlay {
            position: fixed;
            inset: 0;
            z-index: 999;
            pointer-events: none;
            opacity: 0.04;
            mix-blend-mode: soft-light;
            background: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E');
        }

        /* Navbar */
        header {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 60px;
            padding: 0.5rem 1.5rem;
            width: 92%;
            max-width: 1100px;
            box-shadow: inset 0 1px 0 var(--glass-highlight), 0 10px 40px var(--glass-shadow);
            transition: all 0.5s cubic-bezier(0.2, 1, 0.2, 1);
        }

        .light-theme header {
            box-shadow: 0 8px 30px rgba(38, 67, 49, 0.06);
        }

        .nav-link {
            color: var(--text-color);
            text-decoration: none;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.2em;
            font-weight: 500;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        .nav-link:hover { opacity: 1; }

        .theme-toggle {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.2, 1, 0.2, 1);
            color: var(--text-color);
        }
        .theme-toggle:hover { transform: scale(1.05); }

        /* Main Content */
        .container {
            margin-top: 100px;
            padding: 2rem;
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: calc(100vh - 100px);
        }

        .page-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2rem, 5vw, 4rem);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-align: center;
            color: var(--text-heading);
            margin-bottom: 1rem;
            animation: fadeInDown 0.8s ease-out;
            position: relative;
        }

        .page-desc {
            text-align: center;
            max-width: 800px;
            opacity: 0.8;
            margin-bottom: 3rem;
            font-size: 14px;
            line-height: 1.6;
            animation: fadeIn 1s ease-out 0.4s both;
        }

        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Carousel CSS */
        .carousel-wrapper {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 1s ease-out 0.6s both;
        }

        /* Navigation Buttons */
        .btn-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            color: var(--text-color);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            z-index: 20;
            box-shadow: 0 4px 15px var(--glass-shadow);
            transition: all 0.3s ease;
        }
        .btn-nav:hover {
            background: var(--text-color);
            color: var(--bg-color);
            transform: translateY(-50%) scale(1.1);
        }
        .btn-prev { left: -25px; }
        .btn-next { right: -25px; }

        /* Left/Right Previous/Next Thumbnails Tooltip */
        .btn-nav .thumbnail-preview {
            position: absolute;
            top: -70px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            backdrop-filter: blur(8px);
            color: var(--text-color);
        }
        .btn-nav:hover .thumbnail-preview { opacity: 1; }


        /* Slide Track */
        .carousel-track-container {
            width: 100%;
            overflow: hidden;
            border-radius: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            box-shadow: inset 0 1px 0 var(--glass-highlight), 0 20px 40px var(--glass-shadow);
            padding: 2rem;
            position: relative;
        }
        
        .light-theme .carousel-track-container {
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .carousel-track {
            display: flex;
            transition: transform 0.6s cubic-bezier(0.2, 1, 0.2, 1);
        }

        .carousel-slide {
            min-width: 100%;
            padding: 1rem;
            box-sizing: border-box;
            opacity: 0;
            transition: opacity 0.6s ease;
        }
        
        .carousel-slide.active-slide {
            opacity: 1;
        }

        /* Portfolio Item Container inside Slide */
        .portfolio-item {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        @media(min-width: 1024px) {
            .portfolio-item {
                flex-direction: row;
                align-items: flex-start;
            }
        }

        /* Ratio Containers for 16:9 and 9:16 - Using Flex */
        .media-container {
            position: relative;
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .light-theme .media-container {
            background: rgba(255,255,255,0.4);
        }
        
        .media-container video, .media-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .media-16-9 {
            width: 100%;
            aspect-ratio: 16/9;
            flex: 2;
        }

        .media-9-16 {
            width: 100%;
            max-width: 320px;
            aspect-ratio: 9/16;
            flex: 1;
        }

        /* Placeholders inside media */
        .media-placeholder {
            font-size: 10px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            opacity: 0.5;
            text-align: center;
            padding: 1rem;
        }

        .portfolio-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .portfolio-meta {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            padding: 4px 10px;
            border: 1px solid var(--text-secondary);
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 1rem;
            width: fit-content;
        }

        .portfolio-title {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .portfolio-desc {
            opacity: 0.7;
            line-height: 1.8;
            font-size: 14px;
        }

    </style>
</head>
<body class="light-theme">
    <div class="vignette"></div>
    <div class="noise-overlay"></div>

    <header id="dynamic-island">
        <a href="klyperix.html" class="nav-link flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            HQ
        </a>

        <!-- Logo representation -->
        <span class="font-serif italic opacity-70 text-lg">Klyperix</span>

        <div id="themeToggle" class="theme-toggle">
            <svg id="toggleIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>
    </header>

    <main class="container">
        <h1 class="page-title">${title}</h1>
        <p class="page-desc">${description}</p>

        <div class="carousel-wrapper">
            <button class="btn-nav btn-prev" aria-label="Previous Project">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <!-- Thumbnail tooltip for upcoming -->
                <span class="thumbnail-preview prev-thumb">Previous: Project Alpha</span>
            </button>

            <div class="carousel-track-container w-full">
                <div class="carousel-track" id="track">
                    
                    <!-- SLIDE 1 (Example combining 16:9 and Content) -->
                    <div class="carousel-slide active-slide">
                        <div class="portfolio-item">
                            <div class="media-container media-16-9">
                                <!-- Admin replaces this with <video>, <iframe>, or <img> -->
                                <div class="media-placeholder">
                                    <svg class="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    16:9 Media Asset Slot<br>(Video / Horizontal Image)
                                </div>
                            </div>
                            <div class="portfolio-details">
                                <span class="portfolio-meta">Showcase 01</span>
                                <h2 class="portfolio-title">Project Alpha Horizontal</h2>
                                <p class="portfolio-desc">
                                    This layout demonstrates the integration of horizontal 16:9 assets. Encased inside a polished glassmorphic interface, your content will stand out cleanly in both dark and light modes. Replace the placeholder area via admin control.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- SLIDE 2 (Example focusing on 9:16 vertical ratio) -->
                    <div class="carousel-slide">
                        <div class="portfolio-item" style="justify-content: center;">
                            <div class="portfolio-details" style="flex: initial; max-width: 400px; margin-right: 2rem;">
                                <span class="portfolio-meta">Showcase 02</span>
                                <h2 class="portfolio-title">Project Beta Vertical</h2>
                                <p class="portfolio-desc">
                                    This dedicated layout offers a 9:16 vertical container perfectly suited for mobile-first content, TikToks, Shorts, or Reels. It ensures vertical media is displayed professionally without distorted aspect ratios.
                                </p>
                            </div>
                            <div class="media-container media-9-16">
                                <!-- Admin replaces this with <video>, <iframe>, or <img> -->
                                <div class="media-placeholder">
                                    <svg class="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    9:16 Media Asset Slot<br>(Short / Reel / Vertical)
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SLIDE 3 (Gallery Layout) -->
                    <div class="carousel-slide">
                        <div class="portfolio-item">
                            <div class="media-container media-16-9" style="flex: 1;">
                                <div class="media-placeholder">Asset 1 (16:9)</div>
                            </div>
                            <div class="media-container media-16-9" style="flex: 1;">
                                <div class="media-placeholder">Asset 2 (16:9)</div>
                            </div>
                        </div>
                        <div class="portfolio-details" style="margin-top: 2rem; text-align: center;">
                            <span class="portfolio-meta">Showcase 03</span>
                            <h2 class="portfolio-title">Dual Horizon Showcase</h2>
                            <p class="portfolio-desc max-w-2xl mx-auto">
                                The fluid flexbox layout naturally adapts to support multiple media assets side-by-side, providing maximum visual impact and seamless transitions between portfolio entries.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <button class="btn-nav btn-next" aria-label="Next Project">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                <!-- Thumbnail tooltip for upcoming -->
                <span class="thumbnail-preview next-thumb">Next: Project Beta</span>
            </button>
        </div>
    </main>

    <script>
        // ── Theme Inversion Toggle ──
        const themeBtn = document.getElementById('themeToggle');
        const iconSvg = document.getElementById('toggleIcon');
        
        function updateIcon(isLight) {
            iconSvg.innerHTML = isLight ?
                '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />' :
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />';
        }

        // Initialize state
        updateIcon(document.body.classList.contains('light-theme'));

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            updateIcon(isLight);
        });


        // ── Carousel Logic ──
        const track = document.getElementById('track');
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.btn-next');
        const prevButton = document.querySelector('.btn-prev');
        const nextThumb = document.querySelector('.next-thumb');
        const prevThumb = document.querySelector('.prev-thumb');
        
        const slideTitles = [
            "Project Alpha Horizontal",
            "Project Beta Vertical",
            "Dual Horizon Showcase"
        ];

        let currentIndex = 0;

        function updateCarousel() {
            // Move track
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            
            // Fade classes
            slides.forEach((sl, index) => {
                if (index === currentIndex) sl.classList.add('active-slide');
                else sl.classList.remove('active-slide');
            });

            // Update Tooltips (Thumbnails logic)
            const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
            const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
            
            prevThumb.textContent = "Previous: " + slideTitles[prevIndex];
            nextThumb.textContent = "Upcoming: " + slideTitles[nextIndex];
        }

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
            updateCarousel();
        });

        // Initialize display
        updateCarousel();
    </script>
</body>
</html>`;

services.forEach(s => {
    const fullPath = "c:/Users/garva/OneDrive/Documents/heropage/" + s.file;
    fs.writeFileSync(fullPath, getTemplate(s.title, s.description));
    console.log(`Updated ${s.file}`);
});
