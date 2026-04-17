/**
 * Theme Manager for Klyperix
 * Handles automatic timezone-based theme selection and manual toggling.
 */
(function () {
    // 1. Auto Timezone Injection
    function applyAutoTheme() {
        const hour = new Date().getHours();
        // Daytime: 6:00 AM to 6:00 PM (18:00)
        if (hour >= 6 && hour < 18) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    // 2. Theme Toggle Logic
    function initThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        const toggleIcon = document.getElementById('toggleIcon');
        if (!themeBtn) return;

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');

            if (toggleIcon) {
                toggleIcon.innerHTML = isLight ?
                    '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />' :
                    '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />';
            }


            // Instant event dispatch — core-ui.js handles the Spline switch
            window.dispatchEvent(new CustomEvent('klyperixThemeChanged', { detail: { isLight } }));
        });
    }

    // Initialize
    applyAutoTheme();
    document.addEventListener('DOMContentLoaded', initThemeToggle);
})();
