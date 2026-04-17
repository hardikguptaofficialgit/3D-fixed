// ═══════════════════════════════════════════════════════════════
// KLYPERIX — Advanced Palette Extractor v2
// The world's smartest color palette extraction for websites
// Handles: extraction, mapping, preview, undo/redo, manual overrides
// ═══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ─── Wait for bridge ───
    const _wait = setInterval(() => {
        if (window._kxBridge) { clearInterval(_wait); boot(); }
    }, 150);

    function boot() {
        const B = window._kxBridge;
        const panel = document.getElementById('panel-design');
        if (!panel) return;

        // ═══ STATE ═══
        let mode = 'dark';                 // 'dark' | 'light'
        let extractedColors = [];          // sorted by luminance
        let currentPalette = {};           // key→hex of ALL changes this session
        let device = 'desktop';
        let sectionChecks = {              // which sections are active
            backgrounds: true, hero: true, typography: true,
            buttons: true, glass: true, spline_hero: true,
            spline_bg: true, vignette: true
        };

        // ═══ SECTION → KEYS MAPPING ═══
        const SECTIONS = {
            backgrounds: {
                label: 'Backgrounds', icon: '🎨',
                dk: ['dk_bg', 'dk_surface'], lt: ['lt_bg', 'lt_surface'],
                role: { 0: 'darkest', 1: 'dark-mid' }, // luminance role
                ltRole: { 0: 'lightest', 1: 'light-near' }
            },
            hero: {
                label: 'Hero Page', icon: '🏠',
                dk: ['dk_hero_bg', 'dk_hero_title', 'dk_hero_tagline', 'dk_hero_line'],
                lt: ['lt_hero_bg', 'lt_hero_title', 'lt_hero_tagline', 'lt_hero_line'],
                role: { 0: 'darkest', 1: 'lightest', 2: 'accent', 3: 'accent' },
                ltRole: { 0: 'lightest', 1: 'darkest', 2: 'accent', 3: 'accent' }
            },
            typography: {
                label: 'Text & Accent', icon: '✍️',
                dk: ['dk_text', 'dk_accent'], lt: ['lt_text', 'lt_accent'],
                role: { 0: 'lightest', 1: 'accent' },
                ltRole: { 0: 'darkest', 1: 'accent' }
            },
            buttons: {
                label: 'Buttons', icon: '🔘',
                dk: ['dk_btn_border', 'dk_btn_hover'], lt: ['lt_btn_bg', 'lt_btn_hover'],
                role: { 0: 'lightest', 1: 'lightest' },
                ltRole: { 0: 'accent', 1: 'dark-mid' }
            },
            glass: {
                label: 'Glass', icon: '🪟',
                dk: ['dk_glass_tint', 'dk_glass_accent'], lt: ['lt_glass_tint', 'lt_glass_accent'],
                role: { 0: 'dark-mid', 1: 'accent' },
                ltRole: { 0: 'lightest', 1: 'dark-mid' }
            },
            spline_hero: {
                label: 'Spline Hero 3D', icon: '🌀',
                dk: ['dk_spline_hero_shadow', 'dk_spline_hero_mid', 'dk_spline_hero_highlight', 'dk_spline_hero_peak'],
                lt: ['lt_spline_hero_shadow', 'lt_spline_hero_mid', 'lt_spline_hero_highlight', 'lt_spline_hero_peak'],
                role: { 0: 'darkest', 1: 'dark-mid', 2: 'mid', 3: 'lightest' },
                ltRole: { 0: 'lightest', 1: 'light-mid', 2: 'dark-mid', 3: 'accent' }
            },
            spline_bg: {
                label: 'Spline BG 3D', icon: '🌊',
                dk: ['dk_spline_bg_shadow', 'dk_spline_bg_mid', 'dk_spline_bg_highlight', 'dk_spline_bg_peak'],
                lt: ['lt_spline_bg_shadow', 'lt_spline_bg_mid', 'lt_spline_bg_highlight', 'lt_spline_bg_peak'],
                role: { 0: 'darkest', 1: 'dark-mid', 2: 'mid', 3: 'light-mid' },
                ltRole: { 0: 'lightest', 1: 'light-mid', 2: 'dark-mid', 3: 'accent' }
            },
            vignette: {
                label: 'Vignette', icon: '🌫️',
                dk: ['dk_vignette', 'dk_ambient'], lt: ['lt_vignette', 'lt_ambient'],
                role: { 0: 'darkest', 1: 'dark-mid' },
                ltRole: { 0: 'light-mid', 1: 'mid' }
            }
        };

        // ═══ SMART COLOR ROLES ═══
        // Given sorted colors and a role, pick the best one
        function pickByRole(sorted, role) {
            const n = sorted.length;
            if (n === 0) return '#000000';
            switch (role) {
                case 'darkest': return sorted[0].hex;
                case 'dark-mid': return sorted[Math.max(0, Math.floor(n * 0.2))].hex;
                case 'mid': return sorted[Math.floor(n * 0.5)].hex;
                case 'light-mid': return sorted[Math.floor(n * 0.7)].hex;
                case 'lightest': return sorted[n - 1].hex;
                case 'light-near': return sorted[Math.max(0, n - 2)].hex;
                case 'accent': return pickAccent(sorted);
                default: return sorted[Math.floor(n / 2)].hex;
            }
        }

        // Pick the most vibrant/saturated color as accent
        function pickAccent(sorted) {
            let best = sorted[0], bestSat = 0;
            for (const c of sorted) {
                const [r, g, b] = c.rgb;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                const sat = max === 0 ? 0 : (max - min) / max;
                const val = max / 255;
                const score = sat * 0.7 + val * 0.3;
                if (score > bestSat) { bestSat = score; best = c; }
            }
            return best.hex;
        }

        // ═══ K-MEANS++ COLOR EXTRACTION ═══
        function extractColors(media, k = 8) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            let w = media.naturalWidth || media.videoWidth || media.width;
            let h = media.naturalHeight || media.videoHeight || media.height;
            if (!w || !h) { w = 300; h = 300; }
            const scale = Math.min(250 / w, 250 / h, 1);
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Sample pixels
            const pixels = [];
            for (let i = 0; i < data.length; i += 12) { // every 3rd pixel
                const a = data[i + 3];
                if (a < 100) continue;
                pixels.push([data[i], data[i + 1], data[i + 2]]);
            }
            if (pixels.length < k) return [];

            // K-means++ initialization
            let centroids = [pixels[Math.floor(Math.random() * pixels.length)]];
            for (let c = 1; c < k; c++) {
                const dists = pixels.map(p => {
                    let min = Infinity;
                    centroids.forEach(ct => { const d = dist(p, ct); if (d < min) min = d; });
                    return min;
                });
                const total = dists.reduce((s, d) => s + d, 0);
                let r = Math.random() * total, acc = 0;
                for (let i = 0; i < pixels.length; i++) {
                    acc += dists[i]; if (acc >= r) { centroids.push([...pixels[i]]); break; }
                }
            }

            // 20 iterations
            for (let iter = 0; iter < 20; iter++) {
                const clusters = Array.from({ length: k }, () => []);
                for (const px of pixels) {
                    let minD = Infinity, minI = 0;
                    for (let j = 0; j < k; j++) {
                        const d = dist(px, centroids[j]);
                        if (d < minD) { minD = d; minI = j; }
                    }
                    clusters[minI].push(px);
                }
                for (let j = 0; j < k; j++) {
                    const cl = clusters[j];
                    if (!cl.length) continue;
                    centroids[j] = [
                        Math.round(cl.reduce((s, p) => s + p[0], 0) / cl.length),
                        Math.round(cl.reduce((s, p) => s + p[1], 0) / cl.length),
                        Math.round(cl.reduce((s, p) => s + p[2], 0) / cl.length)
                    ];
                }
            }

            // Deduplicate
            const deduped = [];
            for (const c of centroids) {
                if (!deduped.some(u => dist(u, c) < 2000)) deduped.push(c);
            }

            return deduped.map(c => ({
                hex: toHex(c), rgb: c,
                lum: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
            })).sort((a, b) => a.lum - b.lum);
        }

        function dist(a, b) { return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; }
        function toHex(c) { return '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); }
        function fmtBytes(b) {
            if (b < 1024) return b + ' B';
            if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
            if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
            return (b / 1073741824).toFixed(2) + ' GB';
        }

        // ═══ BUILD COMPLETE PALETTE FROM EXTRACTION ═══
        function buildPalette(colors, forMode) {
            const palette = {};
            const sorted = [...colors].sort((a, b) => a.lum - b.lum);

            for (const [secId, sec] of Object.entries(SECTIONS)) {
                if (!sectionChecks[secId]) continue;
                const keys = forMode === 'dark' ? sec.dk : sec.lt;
                const roles = forMode === 'dark' ? sec.role : sec.ltRole;
                keys.forEach((key, i) => {
                    palette[key] = pickByRole(sorted, roles[i]);
                });
            }
            return palette;
        }

        // ═══ INJECT UI ═══
        // Save original HTML (with color inputs), then build new UI ABOVE it
        const origHTML = panel.innerHTML;

        panel.innerHTML = `
            <div class="page-header"><h2>Design System</h2><span class="date" style="font-size:10px;color:var(--muted);">AI Palette Engine</span></div>

            <!-- UNDO/REDO -->
            <div class="undo-bar">
                <span class="undo-label">History</span>
                <span class="undo-count" id="pxHistCount">0 snapshots</span>
                <button class="btn-undo" id="pxUndo" disabled>↶ Undo</button>
                <button class="btn-redo" id="pxRedo" disabled>Redo ↷</button>
            </div>

            <!-- MODE SELECT -->
            <div class="data-card px-step-card">
                <div class="px-step-badge">1</div>
                <h3>Target Mode</h3>
                <p class="px-step-desc">Choose which theme to update — Dark Mode or Light Mode.</p>
                <div class="px-mode-row">
                    <button class="px-mode-btn active" data-m="dark"><span class="px-mode-icon">🌙</span>Dark Mode</button>
                    <button class="px-mode-btn" data-m="light"><span class="px-mode-icon">☀️</span>Light Mode</button>
                </div>
            </div>

            <!-- UPLOAD -->
            <div class="data-card px-step-card" style="margin-top:1rem;">
                <div class="px-step-badge">2</div>
                <h3>Upload Reference Image / Video</h3>
                <p class="px-step-desc">Drop any image or video. The AI will extract dominant colors and intelligently map them to your website's design tokens.</p>
                <div class="upload-zone" id="pxDrop">
                    <input type="file" id="pxFile" accept="image/*,video/*" style="display:none;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3;margin-bottom:8px;">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>Drag & drop your file here, or click to browse</p>
                    <p class="upload-hint">Images: JPG, PNG, WebP • Videos: MP4, MOV, WebM • Up to 1GB</p>
                </div>
                <div id="pxThumb" style="display:none;margin-top:1rem;"></div>
            </div>

            <!-- EXTRACTED PALETTE -->
            <div id="pxPaletteCard" class="data-card px-step-card" style="display:none;margin-top:1rem;">
                <div class="px-step-badge">3</div>
                <h3>Extracted Palette</h3>
                <p class="px-step-desc">These are the dominant colors found. The AI maps them to your sections below. You can click any color to manually override it.</p>
                <div id="pxSwatches" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;"></div>
            </div>

            <!-- SECTION TOGGLES + COLOR MAPPING -->
            <div id="pxMappingCard" class="data-card px-step-card" style="display:none;margin-top:1rem;">
                <div class="px-step-badge">4</div>
                <h3>Color Mapping — Review & Override</h3>
                <p class="px-step-desc">Toggle sections on/off. Click any proposed color to change it. Typography & text colors are included with each section.</p>
                <div id="pxMappingBody"></div>
            </div>

            <!-- DEVICE PREVIEW -->
            <div class="data-card px-step-card" style="margin-top:1rem;">
                <div class="px-step-badge">5</div>
                <h3>Live Preview — Current vs Proposed</h3>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:1rem;">
                    <div class="px-device-group">
                        <button class="px-device-btn active" data-dv="desktop">🖥 Desktop</button>
                        <button class="px-device-btn" data-dv="tablet">📱 Tablet</button>
                        <button class="px-device-btn" data-dv="mobile">📲 Mobile</button>
                    </div>
                    <button class="btn-undo" id="pxRefresh" style="margin-left:auto;">↻ Refresh</button>
                </div>
                <div class="px-preview-grid">
                    <div class="px-preview-col">
                        <div class="px-preview-header current">● CURRENT — SAVED STATE</div>
                        <div class="px-preview-frame" id="pxPrevCur"><iframe src="klyperix.html" sandbox="allow-scripts allow-same-origin" id="ifCur"></iframe></div>
                    </div>
                    <div class="px-preview-col">
                        <div class="px-preview-header proposed">● PROPOSED — WITH CHANGES</div>
                        <div class="px-preview-frame" id="pxPrevNew"><iframe src="klyperix.html" sandbox="allow-scripts allow-same-origin" id="ifNew"></iframe></div>
                    </div>
                </div>
            </div>

            <!-- ACTIONS -->
            <div class="data-card" style="margin-top:1rem;">
                <h3>Actions</h3>
                <div class="btn-row" style="flex-wrap:wrap;gap:8px;">
                    <button class="btn btn-primary" id="pxApply">✅ Apply Palette</button>
                    <button class="btn btn-primary" id="pxSave">💾 Save to Database</button>
                    <button class="btn btn-outline" id="pxReset">↩ Factory Defaults</button>
                    <button class="btn btn-outline" id="pxExport">⬇ Export JSON</button>
                    <button class="btn btn-outline" id="pxImport">⬆ Import JSON</button>
                    <input type="file" id="pxImpFile" accept=".json" style="display:none;">
                </div>
            </div>

            <!-- FINE TUNE (all color inputs live here) -->
            <div class="data-card" style="margin-top:1.5rem;">
                <h3 id="pxFTToggle" style="cursor:pointer;display:flex;align-items:center;gap:8px;">
                    <span class="ft-arrow">▸</span> Advanced — Fine-Tune Individual Colors
                </h3>
                <div id="pxFT" style="display:none;margin-top:1rem;"></div>
            </div>

            <!-- CONFIRM MODAL -->
            <div class="px-confirm-modal" id="pxModal" style="display:none;">
                <div class="px-confirm-dialog">
                    <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:1rem;color:var(--text);">Confirm Palette Changes</h3>
                    <div id="pxModalBody"></div>
                    <div class="btn-row" style="margin-top:1.5rem;justify-content:flex-end;">
                        <button class="btn btn-outline" id="pxModalNo">Cancel</button>
                        <button class="btn btn-primary" id="pxModalYes">✅ Confirm & Apply</button>
                    </div>
                </div>
            </div>
        `;

        // ═══ BUILD COLOR INPUTS IN FINE-TUNE ═══
        buildColorInputs();
        function buildColorInputs() {
            const ft = document.getElementById('pxFT');
            const darkKeys = B.COLOR_KEYS.filter(k => k.startsWith('dk_'));
            const lightKeys = B.COLOR_KEYS.filter(k => k.startsWith('lt_'));

            function rows(keys, title) {
                let h = `<div class="data-card" style="margin-bottom:1rem;"><h3>${title}</h3>`;
                for (const key of keys) {
                    const v = B.DEFAULTS[key] || '#000000';
                    const lbl = key.replace(/^(dk_|lt_)/, '').replace(/_/g, ' ');
                    h += `<div class="color-row"><input type="color" id="${key}" value="${v}">
                        <div><div class="color-label">${lbl}</div><div class="color-hex">${v}</div></div></div>`;
                }
                return h + '</div>';
            }
            ft.innerHTML = rows(darkKeys, '🌙 Dark Mode Colors') + rows(lightKeys, '☀️ Light Mode Colors');

            // Attach listeners
            ft.querySelectorAll('input[type="color"]').forEach(el => {
                el.addEventListener('input', () => {
                    const hex = el.closest('.color-row')?.querySelector('.color-hex');
                    if (hex) hex.textContent = el.value;
                    sendPreview(); // live preview
                });
                el.addEventListener('change', () => {
                    B.push(); updateHistUI();
                });
            });
        }

        // ═══ LOAD FROM DATABASE ═══
        async function loadFromDB() {
            const { data } = await B.sb.from('design_settings').select('*');
            if (data) data.forEach(d => {
                const el = document.getElementById(d.setting_key);
                if (el && el.type === 'color') {
                    el.value = d.setting_value;
                    const hex = el.closest('.color-row')?.querySelector('.color-hex');
                    if (hex) hex.textContent = d.setting_value;
                }
            });
            B.push(); // initial snapshot
            updateHistUI();
        }
        loadFromDB();

        // ═══ UNDO / REDO ═══
        const $undo = document.getElementById('pxUndo');
        const $redo = document.getElementById('pxRedo');
        $undo.addEventListener('click', () => { B.undo(); updateHistUI(); sendPreview(); });
        $redo.addEventListener('click', () => { B.redo(); updateHistUI(); sendPreview(); });

        function updateHistUI() {
            const h = B.getHistory();
            $undo.disabled = h.index <= 0;
            $redo.disabled = h.index >= h.length - 1;
            document.getElementById('pxHistCount').textContent =
                h.length + ' snapshots · #' + (h.index + 1);
        }

        // ═══ MODE TOGGLE ═══
        panel.querySelectorAll('.px-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.px-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mode = btn.dataset.m;
                // Re-map if we have colors
                if (extractedColors.length) rebuildMapping();
                sendPreview();
            });
        });

        // ═══ UPLOAD ═══
        const $drop = document.getElementById('pxDrop');
        const $file = document.getElementById('pxFile');
        $drop.addEventListener('click', () => $file.click());
        $drop.addEventListener('dragover', e => { e.preventDefault(); $drop.classList.add('dragover'); });
        $drop.addEventListener('dragleave', () => $drop.classList.remove('dragover'));
        $drop.addEventListener('drop', e => { e.preventDefault(); $drop.classList.remove('dragover'); if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]); });
        $file.addEventListener('change', () => { if ($file.files.length) handleUpload($file.files[0]); });

        function handleUpload(file) {
            const isVideo = file.type.startsWith('video');
            const isImage = file.type.startsWith('image');
            if (!isImage && !isVideo) { B.toast('Please upload an image or video', 'error'); return; }

            const url = URL.createObjectURL(file);
            const $thumb = document.getElementById('pxThumb');
            $thumb.style.display = '';
            $thumb.innerHTML = `<div style="display:flex;align-items:center;gap:1rem;padding:0.8rem;background:rgba(0,0,0,0.2);border-radius:12px;">
                ${isImage ? `<img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;">` :
                `<video src="${url}" autoplay muted loop playsinline style="width:80px;height:80px;object-fit:cover;border-radius:10px;"></video>`}
                <div><div style="font-size:13px;color:var(--text);font-weight:500;">${file.name}</div>
                <div style="font-size:11px;color:var(--muted);">${fmtBytes(file.size)}</div>
                <div style="font-size:11px;color:var(--accent);margin-top:4px;" id="pxStatus">⏳ Extracting colors…</div></div></div>`;

            if (isImage) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => { runExtraction(img); URL.revokeObjectURL(url); };
                img.onerror = () => { B.toast('Failed to load image', 'error'); };
                img.src = url;
            } else {
                const vid = document.createElement('video');
                vid.crossOrigin = 'anonymous'; vid.muted = true; vid.src = url;
                vid.addEventListener('loadeddata', () => { vid.currentTime = Math.min(1, vid.duration / 3); });
                vid.addEventListener('seeked', () => { runExtraction(vid); URL.revokeObjectURL(url); });
                vid.addEventListener('error', () => { B.toast('Failed to load video', 'error'); });
            }
        }

        function runExtraction(media) {
            extractedColors = extractColors(media, 8);
            if (!extractedColors.length) { B.toast('Could not extract colors', 'error'); return; }
            document.getElementById('pxStatus').textContent = '✓ ' + extractedColors.length + ' colors extracted';
            showPalette();
            rebuildMapping();
            sendPreview();
        }

        // ═══ SHOW EXTRACTED SWATCHES ═══
        function showPalette() {
            document.getElementById('pxPaletteCard').style.display = '';
            const $sw = document.getElementById('pxSwatches');
            $sw.innerHTML = extractedColors.map((c, i) => `
                <div style="text-align:center;cursor:pointer;" class="px-swatch-item" data-idx="${i}" title="Click to copy: ${c.hex}">
                    <div style="width:52px;height:52px;background:${c.hex};border-radius:12px;border:2px solid rgba(255,255,255,0.08);transition:transform 0.15s;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                    <div style="font-size:9px;color:var(--muted);margin-top:4px;font-family:monospace;">${c.hex}</div>
                </div>
            `).join('');
            $sw.querySelectorAll('.px-swatch-item').forEach(el => {
                el.addEventListener('click', () => navigator.clipboard.writeText(extractedColors[el.dataset.idx].hex));
            });
        }

        // ═══ BUILD SECTION MAPPING ═══
        function rebuildMapping() {
            currentPalette = buildPalette(extractedColors, mode);
            const $card = document.getElementById('pxMappingCard');
            const $body = document.getElementById('pxMappingBody');
            $card.style.display = '';

            let html = '';
            for (const [secId, sec] of Object.entries(SECTIONS)) {
                const keys = mode === 'dark' ? sec.dk : sec.lt;
                const checked = sectionChecks[secId] ? 'checked' : '';
                html += `<div class="px-section-block" data-sec="${secId}" style="margin-bottom:1rem;padding:1rem;background:rgba(0,0,0,0.15);border-radius:12px;border:1px solid rgba(87,193,111,${sectionChecks[secId] ? '0.12' : '0.03'});">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:0.8rem;">
                        <input type="checkbox" ${checked} class="px-sec-check" data-sec="${secId}" style="accent-color:var(--accent);width:16px;height:16px;">
                        <span style="font-size:13px;font-weight:600;color:var(--text);">${sec.icon} ${sec.label}</span>
                    </label>
                    <div class="px-sec-rows" style="${sectionChecks[secId] ? '' : 'opacity:0.3;pointer-events:none;'}">`;

                keys.forEach(key => {
                    const oldVal = document.getElementById(key)?.value || B.DEFAULTS[key] || '#000000';
                    const newVal = currentPalette[key] || oldVal;
                    const lbl = key.replace(/^(dk_|lt_)/, '').replace(/_/g, ' ');
                    const changed = oldVal.toLowerCase() !== newVal.toLowerCase();
                    html += `<div class="px-mapping-row" style="${changed ? 'background:rgba(87,193,111,0.04);padding:2px 8px;border-radius:8px;' : ''}">
                        <div class="px-mapping-label">${lbl}</div>
                        <div class="px-mapping-current" style="background:${oldVal};" title="Current: ${oldVal}"></div>
                        <div class="px-mapping-arrow">${changed ? '→' : '='}</div>
                        <input type="color" class="px-mapping-new px-override" value="${newVal}" data-key="${key}" title="Click to override">
                        <span class="px-mapping-hex px-hex-lbl">${newVal}</span>
                    </div>`;
                });

                html += '</div></div>';
            }
            $body.innerHTML = html;

            // Section toggle checkboxes
            $body.querySelectorAll('.px-sec-check').forEach(cb => {
                cb.addEventListener('change', () => {
                    sectionChecks[cb.dataset.sec] = cb.checked;
                    rebuildMapping();
                    sendPreview();
                });
            });

            // Manual override color pickers
            $body.querySelectorAll('.px-override').forEach(inp => {
                inp.addEventListener('input', () => {
                    currentPalette[inp.dataset.key] = inp.value;
                    inp.nextElementSibling.textContent = inp.value;
                    sendPreview();
                });
            });
        }

        // ═══ DEVICE PREVIEW ═══
        const DEVS = {
            desktop: { w: 1440, h: 900, s: 0.38 },
            tablet: { w: 768, h: 1024, s: 0.32 },
            mobile: { w: 375, h: 812, s: 0.42 }
        };

        panel.querySelectorAll('.px-device-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.px-device-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                device = btn.dataset.dv;
                resizeFrames();
            });
        });

        function resizeFrames() {
            const d = DEVS[device];
            ['pxPrevCur', 'pxPrevNew'].forEach(id => {
                const wrap = document.getElementById(id);
                const ifr = wrap?.querySelector('iframe');
                if (!ifr) return;
                ifr.style.width = d.w + 'px';
                ifr.style.height = d.h + 'px';
                ifr.style.transform = `scale(${d.s})`;
                wrap.style.height = Math.round(d.h * d.s) + 'px';
            });
        }

        // ═══ SEND PREVIEW TO IFRAMES ═══
        function sendPreview() {
            const snap = B.getSnapshot();
            // Current iframe — show saved state
            try {
                document.getElementById('ifCur')?.contentWindow?.postMessage({
                    type: 'klyperix-design-preview', theme: mode, colors: snap
                }, '*');
            } catch (e) { }

            // Proposed iframe — show saved + pending changes overlaid
            const proposed = { ...snap };
            if (Object.keys(currentPalette).length) {
                for (const [k, v] of Object.entries(currentPalette)) {
                    if (sectionChecks[getSectionForKey(k)]) proposed[k] = v;
                }
            }
            try {
                document.getElementById('ifNew')?.contentWindow?.postMessage({
                    type: 'klyperix-design-preview', theme: mode, colors: proposed
                }, '*');
            } catch (e) { }
        }

        function getSectionForKey(key) {
            for (const [sec, def] of Object.entries(SECTIONS)) {
                if (def.dk.includes(key) || def.lt.includes(key)) return sec;
            }
            return 'backgrounds';
        }

        // Send preview when iframes load
        document.getElementById('ifCur')?.addEventListener('load', () => setTimeout(sendPreview, 600));
        document.getElementById('ifNew')?.addEventListener('load', () => setTimeout(sendPreview, 600));
        setTimeout(() => { resizeFrames(); sendPreview(); }, 1500);

        // Refresh button
        document.getElementById('pxRefresh').addEventListener('click', () => {
            const cur = document.getElementById('ifCur');
            const nw = document.getElementById('ifNew');
            if (cur) cur.src = cur.src;
            if (nw) nw.src = nw.src;
            setTimeout(sendPreview, 2000);
        });

        // ═══ APPLY (with confirmation) ═══
        document.getElementById('pxApply').addEventListener('click', () => {
            if (!Object.keys(currentPalette).length) {
                B.toast('Upload an image first to extract a palette', 'error'); return;
            }
            // Build the confirmation modal
            const $modal = document.getElementById('pxModal');
            const $body = document.getElementById('pxModalBody');
            const activeKeys = Object.entries(currentPalette).filter(([k]) => sectionChecks[getSectionForKey(k)]);

            $body.innerHTML = `
                <p style="margin-bottom:1rem;font-size:13px;">Applying <strong>${activeKeys.length}</strong> color changes to <strong>${mode === 'dark' ? '🌙 Dark' : '☀️ Light'} Mode</strong>.</p>
                <div style="max-height:250px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:0.8rem;">
                    ${activeKeys.map(([key, val]) => {
                const old = document.getElementById(key)?.value || '#000';
                const changed = old.toLowerCase() !== val.toLowerCase();
                return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:11px;${changed ? 'background:rgba(87,193,111,0.04);padding:3px 6px;border-radius:6px;' : ''}">
                            <span style="color:var(--muted);min-width:160px;font-family:monospace;font-size:10px;">${key}</span>
                            <span style="width:16px;height:16px;border-radius:4px;background:${old};border:1px solid rgba(255,255,255,0.1);flex-shrink:0;"></span>
                            <span style="color:var(--accent);font-weight:700;">${changed ? '→' : '='}</span>
                            <span style="width:16px;height:16px;border-radius:4px;background:${val};border:1px solid rgba(255,255,255,0.1);flex-shrink:0;"></span>
                            <span style="font-family:monospace;color:var(--text);font-size:10px;">${val}</span>
                        </div>`;
            }).join('')}
                </div>
                <p style="font-size:11px;color:var(--muted);margin-top:1rem;">After confirming, click <strong>💾 Save to Database</strong> to push changes live.</p>`;
            $modal.style.display = 'flex';
        });

        document.getElementById('pxModalYes').addEventListener('click', () => {
            applyCurrentPalette();
            document.getElementById('pxModal').style.display = 'none';
        });
        document.getElementById('pxModalNo').addEventListener('click', () => {
            document.getElementById('pxModal').style.display = 'none';
        });

        function applyCurrentPalette() {
            let count = 0;
            for (const [key, val] of Object.entries(currentPalette)) {
                if (!sectionChecks[getSectionForKey(key)]) continue;
                const el = document.getElementById(key);
                if (el) {
                    el.value = val;
                    const hex = el.closest('.color-row')?.querySelector('.color-hex');
                    if (hex) hex.textContent = val;
                    count++;
                }
            }
            B.push();
            updateHistUI();
            sendPreview();
            B.toast(`✅ Applied ${count} color changes — Save to Database to go live`);
        }

        // ═══ SAVE TO DATABASE ═══
        document.getElementById('pxSave').addEventListener('click', async () => {
            const btn = document.getElementById('pxSave');
            btn.textContent = '⏳ Saving…'; btn.disabled = true;
            await B.save();
            btn.textContent = '💾 Save to Database'; btn.disabled = false;
            // Refresh "current" preview to show saved state
            const cur = document.getElementById('ifCur');
            if (cur) cur.src = cur.src;
            setTimeout(sendPreview, 2000);
        });

        // ═══ FACTORY DEFAULTS ═══
        document.getElementById('pxReset').addEventListener('click', () => {
            if (!confirm('Restore all colors to factory defaults?')) return;
            B.reset();
            updateHistUI();
            sendPreview();
            currentPalette = {};
            document.getElementById('pxMappingCard').style.display = 'none';
            document.getElementById('pxPaletteCard').style.display = 'none';
        });

        // ═══ EXPORT / IMPORT ═══
        document.getElementById('pxExport').addEventListener('click', () => B.exportPalette());
        document.getElementById('pxImport').addEventListener('click', () => document.getElementById('pxImpFile').click());
        document.getElementById('pxImpFile').addEventListener('change', (e) => {
            B.importPalette(e.target.files[0]);
            e.target.value = '';
            setTimeout(() => { updateHistUI(); sendPreview(); }, 500);
        });

        // ═══ FINE TUNE TOGGLE ═══
        document.getElementById('pxFTToggle').addEventListener('click', () => {
            const $ft = document.getElementById('pxFT');
            const open = $ft.style.display !== 'none';
            $ft.style.display = open ? 'none' : '';
            document.getElementById('pxFTToggle').querySelector('.ft-arrow').textContent = open ? '▸' : '▾';
        });

    } // end boot()
})();
