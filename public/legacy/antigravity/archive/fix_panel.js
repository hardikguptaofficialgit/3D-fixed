const fs = require('fs');
let html = fs.readFileSync('panel.html', 'utf8');

const startIndex = html.indexOf('<span class="undo-count" id="historyCount">0 changes</span>');
const endIndex = html.indexOf('<!-- ═══ MULTI-SECTION LIVE PREVIEW ═══ -->');

if(startIndex !== -1 && endIndex !== -1) {
    console.log('Found garbage range: ', startIndex, endIndex);
    const backup = html;
    html = html.substring(0, startIndex) + html.substring(endIndex);
    fs.writeFileSync('panel.html', html);
    console.log('Removed garbage blocks successfully.');
} else {
    console.log('Could not find the bounds');
}
