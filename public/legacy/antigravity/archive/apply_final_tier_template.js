const fs = require('fs');

const masterTemplate = fs.readFileSync('video-editing.html', 'utf8');

const pages = [
    { file: 'motion.html', title: 'Motion Graphics', desc: 'Kinetic typography and dynamic visual effects. Browse our portfolio archives below.', type: 'video' },
    { file: '2d-animation.html', title: '2D Animation', desc: 'Expressive character arcs and fluid traditional motion design. Browse our portfolio archives below.', type: 'video' },
    { file: '3d-animation-graphics.html', title: '3D Animation & Graphics', desc: 'Hyper-realistic product renders and spatial visual storytelling. Browse our portfolio archives below.', type: 'video' },
    { file: 'graphic-design.html', title: 'Graphic Design', desc: 'Bold typography and visually striking key art. Browse our portfolio archives below.', type: 'design' },
    { file: 'logo-design.html', title: 'Logo Design', desc: 'Minimalist brand marks and scalable corporate identities. Browse our portfolio archives below.', type: 'design' }
];

pages.forEach(page => {
    let content = masterTemplate;
    
    // Replace Title & Desc
    content = content.replace(/<title>Klyperix - Video Editing Portfolio<\/title>/g, `<title>Klyperix - ${page.title} Portfolio</title>`);
    content = content.replace(/<h1 class="page-title">Video Editing<\/h1>/g, `<h1 class="page-title">${page.title}</h1>`);
    content = content.replace(/<p class="page-desc">Premium cinematic grading and rhythmic narratives\. Browse our portfolio archives below\.<\/p>/g, `<p class="page-desc">${page.desc}</p>`);
    
    // For design pages, replace Shorts & Reels with Portraits & Posters
    if (page.type === 'design') {
        // Section 1 update
        content = content.replace(/<h2 class="panel-title">Shorts & Reels<\/h2>/g, '<h2 class="panel-title">Portraits & Posters</h2>');
        content = content.replace(/<span class="panel-desc">Vertical Format · 9:16<\/span>/g, '<span class="panel-desc">Poster Format · 4:5</span>');
        
        // Replace items HTML for 9:16 -> 4:5
        content = content.replace(/item-9-16/g, 'item-4-5');
        content = content.replace(/ratio-9-16/g, 'ratio-4-5');
        content = content.replace(/9:16 Reel Slot/g, '4:5 Poster Slot');
        
        // CSS rules inside the template (they are already present, but just in case, I added item-4-5 and ratio-4-5 to video-editing.html?
        // Let me check if I added ratio-4-5. I didn't add ratio-4-5 in video-editing.html. Let's make sure it's injected:
        if (!content.includes('ratio-4-5')) {
            content = content.replace(/\.ratio-9-16 { aspect-ratio: 9 \/ 16; width: 100%; }/g, `.ratio-9-16 { aspect-ratio: 9 / 16; width: 100%; }\n        .ratio-4-5 { aspect-ratio: 4 / 5; width: 100%; }`);
        }
    }
    
    fs.writeFileSync(page.file, content);
    console.log(`Updated ${page.file}`);
});
