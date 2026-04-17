// ════════════════════════════════════════════════════════════════
// KLYPERIX — Supabase Configuration
// ════════════════════════════════════════════════════════════════

// KLYPERIX — Supabase Configuration (Next.js runtime-config driven)
// Pulls Supabase URL + anon key from /api/public-config so you can switch projects via .env.

let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";
let KLYPERIX_ADMINS = [];

// Singleton — create client once, reuse forever
let _sbInstance = null;

function loadCachedConfig() {
    try {
        const raw = localStorage.getItem('klyp_public_config');
        if (!raw) return;
        const cfg = JSON.parse(raw);
        if (cfg && typeof cfg === 'object') {
            SUPABASE_URL = cfg.supabaseUrl || SUPABASE_URL;
            SUPABASE_ANON_KEY = cfg.supabaseAnonKey || SUPABASE_ANON_KEY;
            if (cfg.adminEmails) {
                const emails = String(cfg.adminEmails).split(',').map(e => e.trim()).filter(Boolean);
                if (emails.length) KLYPERIX_ADMINS = emails;
            }
        }
    } catch (e) {
        // ignore cache parse errors
    }
}

function getSupabaseClient() {
    if (_sbInstance) return _sbInstance;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[Supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY.');
        return null;
    }
    if (typeof supabase === 'undefined') {
        console.error('[Supabase] Library not loaded.');
        return null;
    }
    _sbInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _sbInstance;
}

// Helper to check if email is admin
function isKlyperixAdmin(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return KLYPERIX_ADMINS.some(admin => admin.toLowerCase() === cleanEmail);
}

async function initSupabaseConfig() {
    // Try cached config first so pages can initialize synchronously.
    loadCachedConfig();

    try {
        const res = await fetch('/api/public-config', { cache: 'no-store' });
        const json = await res.json();
        SUPABASE_URL = json.supabaseUrl || "";
        SUPABASE_ANON_KEY = json.supabaseAnonKey || "";
        const emails = (json.adminEmails || "").split(',').map(e => e.trim()).filter(Boolean);
        KLYPERIX_ADMINS = emails.length ? emails : KLYPERIX_ADMINS;

        try {
            localStorage.setItem('klyp_public_config', JSON.stringify(json));
        } catch (e) {
            // ignore storage failures
        }
    } catch (e) {
        console.warn('[Supabase] Failed to load public-config:', e);
    }

    window.klyperixSB = getSupabaseClient();
    window.isKlyperixAdmin = isKlyperixAdmin;
}

window.__klypSupabaseReady = initSupabaseConfig();
