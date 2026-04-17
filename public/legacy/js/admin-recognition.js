// ════════════════════════════════════════════════════════════════
// KLYPERIX — Intelligent Admin Recognition
// ════════════════════════════════════════════════════════════════
// This script silently detects if the current user is an admin.
// If recognized, it injects a premium "Admin Dashboard" button.
// ════════════════════════════════════════════════════════════════

(function() {
    const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!sb) return;

    // Check recognition
    async function checkIdentity() {
        const { data: { session } } = await sb.auth.getSession();
        const isAdmin = session && window.isKlyperixAdmin(session.user.email);
        const isDeviceRecognized = localStorage.getItem('klyperix_admin_recognized') === 'true';

        if (isAdmin || isDeviceRecognized) {
            revealAdminUI();
        }
    }

    function revealAdminUI() {
        if (document.getElementById('klyperix-admin-pill')) return;

        const pill = document.createElement('div');
        pill.id = 'klyperix-admin-pill';
        pill.innerHTML = `
            <a href="panel.html" class="admin-pill-content">
                <div class="pill-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <span>Enterprise Dashboard</span>
            </a>
        `;

        // Style the pill with Apple-style glassmorphism
        const style = document.createElement('style');
        style.textContent = `
            #klyperix-admin-pill {
                position: fixed;
                bottom: 30px;
                left: 30px;
                z-index: 10000;
                animation: pillSlideIn 0.8s cubic-bezier(0.2, 1, 0.2, 1) both;
            }
            .admin-pill-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 18px 8px 8px;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 40px;
                color: white;
                text-decoration: none;
                font-family: 'Poppins', sans-serif;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                transition: all 0.4s cubic-bezier(0.2, 1, 0.2, 1);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .admin-pill-content:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: scale(1.05) translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                border-color: rgba(255, 255, 255, 0.25);
            }
            .pill-icon {
                width: 32px;
                height: 32px;
                background: white;
                color: black;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes pillSlideIn {
                from { opacity: 0; transform: translateX(-50px) scale(0.9); }
                to { opacity: 1; transform: translateX(0) scale(1); }
            }
            @media (max-width: 640px) {
                #klyperix-admin-pill { bottom: 20px; left: 20px; }
                .admin-pill-content span { display: none; }
                .admin-pill-content { padding: 4px; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(pill);
    }

    // Run recognition
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkIdentity);
    } else {
        checkIdentity();
    }
})();
