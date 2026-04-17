const fs = require('fs');
const path = require('path');

const HEROPAGE_DIR = 'c:/Users/garva/OneDrive/Documents/heropage';

function updateAllPages() {
    const klyperixHtml = fs.readFileSync(path.join(HEROPAGE_DIR, 'klyperix.html'), 'utf8');

    // Extract exactly the variables block
    const cssMatch = klyperixHtml.match(/(:root\s*\{[\s\S]*?\}\s*\.light-theme\s*\{[\s\S]*?\})/);
    if (!cssMatch) {
        console.error("Could not extract CSS from klyperix.html");
        return;
    }
    const cssVars = cssMatch[1];

    // Extract exactly the SVG block
    const svgMatch = klyperixHtml.match(/(<svg[^>]*>\s*<filter[\s\S]*?<\/svg>)/);
    if (!svgMatch) {
        console.error("Could not extract SVG from klyperix.html");
        return;
    }
    const svgNode = svgMatch[1];

    console.log("Extracted CSS block.");
    console.log("Extracted SVG block.");

    // Files to update
    const filesToUpdate = fs.readdirSync(HEROPAGE_DIR).filter(f => 
        (f.startsWith('service-') && f.endsWith('.html')) ||
        f === 'update_klyperix.py' ||
        f === 'generate_pages.py'
    );

    for (const file of filesToUpdate) {
        const filePath = path.join(HEROPAGE_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (file.endsWith('.html')) {
            // Replace CSS Variables
            const oldCssPattern = /:root\s*\{[\s\S]*?\}\s*\.light-theme\s*\{[\s\S]*?\}/;
            if (oldCssPattern.test(content)) {
                content = content.replace(oldCssPattern, cssVars);
                modified = true;
            }

            // Replace SVG Filter Node
            const oldSvgPattern = /<svg[^>]*>[\s\S]*?<\/svg>/;
            if (oldSvgPattern.test(content)) {
                content = content.replace(oldSvgPattern, svgNode);
                modified = true;
            }
        } 
        else if (file.endsWith('.py')) {
            // In python files we replace the triple-quoted templates
            const pyCssPattern = /(:root\s*\{[\s\S]*?\}\s*\.light-theme\s*\{[\s\S]*?\})/;
            if (pyCssPattern.test(content)) {
                content = content.replace(pyCssPattern, cssVars);
                modified = true;
            }

            // Replace SVG within python string
            const pySvgPattern = /(<svg[^>]*>[\s\S]*?<\/svg>)/;
            if (pySvgPattern.test(content)) {
                content = content.replace(pySvgPattern, svgNode);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated successfully: ${file}`);
        } else {
            console.log(`No match found in: ${file}`);
        }
    }
}

updateAllPages();
