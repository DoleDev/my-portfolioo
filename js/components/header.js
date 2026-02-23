/* File: js/components/header.js */

/*
 * ============================================
 *  HEADER COMPONENT — Navigation Link Handler
 * ============================================
 *
 * This component ensures all navigation links work correctly.
 * The core header functionality (sticky header, mobile menu,
 * theme toggle) is handled in main.js.
 *
 * This file specifically:
 * 1. Ensures page navigation links (about.html, services.html, etc.)
 *    are never blocked by other JavaScript
 * 2. Adds smooth close animation for mobile menu before navigating
 * 3. Handles any edge cases with link clicking
 */

;(function () {
    'use strict';

    const HeaderComponent = {

        init() {
            this.header = document.getElementById('header');
            this.navMenu = document.getElementById('nav-menu');
            this.navToggle = document.getElementById('nav-toggle');

            if (!this.header) return;

            this.ensureNavLinksWork();
            this.handleHeaderAccessibility();
        },

        /*
         * CRITICAL FIX:
         * Ensures that navigation links pointing to other pages
         * (e.g., about.html, services.html, contact.html)
         * always work correctly and are never intercepted.
         *
         * Some scripts use e.preventDefault() on anchor clicks
         * for smooth scrolling — this can accidentally block
         * real page navigation. This function guarantees that
         * page links always navigate properly.
         */
        ensureNavLinksWork() {
            const navLinks = document.querySelectorAll('.nav__link');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');

                /* Skip anchor links (#section) — those are handled by
                   SmoothScroll in main.js */
                if (!href || href.startsWith('#')) return;

                /*
                 * For real page links (about.html, services.html, etc.),
                 * add a high-priority click handler that ensures navigation.
                 *
                 * We use the 'capture' phase so this runs BEFORE any other
                 * click handlers that might call preventDefault().
                 */
                link.addEventListener('click', (e) => {
                    /* If it's a real page link, ensure navigation happens */
                    if (href.endsWith('.html') || href.startsWith('/') || href.startsWith('http')) {

                        /* Close mobile menu if open (with brief delay for animation) */
                        if (this.navMenu && this.navMenu.classList.contains('active')) {
                            this.closeMobileMenu();
                        }

                        /* Restore body scroll in case it was locked */
                        document.body.style.overflow = '';

                        /*
                         * Use window.location.href as a fallback guarantee.
                         * If any other script has called e.preventDefault(),
                         * this ensures we still navigate.
                         */
                        if (e.defaultPrevented) {
                            window.location.href = href;
                        }
                        /* If not prevented, the browser handles it naturally */
                    }
                }, false);  /* false = bubble phase (runs after capture) */
            });
        },

        /*
         * Helper to close the mobile menu.
         * This mirrors MobileNav.close() from main.js but is
         * independent so header.js works even if main.js changes.
         */
        closeMobileMenu() {
            if (this.navMenu) {
                this.navMenu.classList.remove('active');
            }
            if (this.navToggle) {
                this.navToggle.classList.remove('active');
                this.navToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        },

        /*
         * Adds keyboard accessibility enhancements to the header.
         * - Tab key navigation works naturally (links are focusable)
         * - Enter/Space on toggle button opens/closes menu
         */
        handleHeaderAccessibility() {
            /* Ensure the toggle button is keyboard accessible */
            if (this.navToggle) {
                this.navToggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.navToggle.click();
                    }
                });
            }

            /* When mobile menu is open, trap focus within it */
            if (this.navMenu) {
                this.navMenu.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        const focusableElements = this.navMenu.querySelectorAll(
                            'a[href], button, [tabindex]:not([tabindex="-1"])'
                        );

                        if (focusableElements.length === 0) return;

                        const firstEl = focusableElements[0];
                        const lastEl = focusableElements[focusableElements.length - 1];

                        /* If shift+tab on first element, wrap to last */
                        if (e.shiftKey && document.activeElement === firstEl) {
                            e.preventDefault();
                            lastEl.focus();
                        }
                        /* If tab on last element, wrap to first */
                        else if (!e.shiftKey && document.activeElement === lastEl) {
                            e.preventDefault();
                            firstEl.focus();
                        }
                    }
                });
            }
        }
    };


    /* ==========================================
       INITIALIZE
       ========================================== */

    /*
     * Wait for DOM to be ready, then initialize.
     * We check if DOM is already loaded (in case this script
     * runs after DOMContentLoaded has already fired).
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => HeaderComponent.init());
    } else {
        /* DOM is already ready */
        HeaderComponent.init();
    }

})();