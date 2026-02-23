/* File: js/components/preloader.js */

/*
 * ============================================
 *  PRELOADER CONTROLLER
 * ============================================
 *
 * Manages the loading screen that shows while the page loads.
 *
 * How it works:
 * 1. The preloader HTML is in the page with class "preloader"
 * 2. Body starts with class "loading" (prevents scrolling)
 * 3. We listen for the window 'load' event (fires when ALL resources are loaded)
 * 4. After a minimum display time (prevents flash), we add class "loaded"
 * 5. CSS transition fades it out
 * 6. After the fade completes, we remove the preloader from the DOM entirely
 *
 * Why a minimum display time?
 * If the page loads instantly (e.g., from cache), the preloader would
 * flash for a millisecond, which looks broken. The minimum time ensures
 * a smooth, intentional feel.
 */

;(function () {
    'use strict';

    const Preloader = {
        MIN_DISPLAY_TIME: 800, /* Minimum ms to show preloader */
        startTime: Date.now(),

        init() {
            this.preloader = document.getElementById('preloader');
            if (!this.preloader) return;

            /* Add loading class to body to prevent scrolling */
            document.body.classList.add('loading');

            /* Listen for page fully loaded */
            window.addEventListener('load', () => this.handleLoaded());

            /* Safety fallback: hide preloader after 5 seconds max
               (in case 'load' event doesn't fire for some reason) */
            setTimeout(() => this.hide(), 5000);
        },

        handleLoaded() {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.MIN_DISPLAY_TIME - elapsed);

            /* Wait for minimum display time, then hide */
            setTimeout(() => this.hide(), remaining);
        },

        hide() {
            if (!this.preloader) return;
            if (this.preloader.classList.contains('loaded')) return; /* Already hidden */

            /* Start fade-out animation (handled by CSS) */
            this.preloader.classList.add('loaded');
            document.body.classList.remove('loading');

            /* After the CSS transition completes, remove from DOM entirely */
            this.preloader.addEventListener('transitionend', () => {
                this.preloader.remove();
            }, { once: true });

            /* Fallback removal in case transitionend doesn't fire */
            setTimeout(() => {
                if (this.preloader && this.preloader.parentNode) {
                    this.preloader.remove();
                }
            }, 1000);
        }
    };

    /*
     * Initialize immediately — NOT on DOMContentLoaded.
     * The preloader needs to be active BEFORE the page finishes loading.
     * Since this script is at the bottom of <body>, the preloader HTML
     * is already in the DOM when this runs.
     */
    Preloader.init();

})();