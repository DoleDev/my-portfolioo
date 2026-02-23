/* File: js/components/toc-tracker.js */
/*
 * ============================================
 *    TABLE OF CONTENTS — ACTIVE HEADING TRACKER
 * ============================================
 *
 * Tracks which section heading the user has scrolled to
 * and highlights the corresponding link in the ToC sidebar.
 *
 * Also handles the mobile ToC toggle (collapsible on small screens).
 *
 * How active tracking works:
 * 1. Collect all <a> links inside .toc__list
 * 2. For each link, find the heading element it points to (via href="#id")
 * 3. On scroll, check which heading the user has scrolled past
 * 4. The LAST heading whose top is above the trigger line is "active"
 * 5. Add .active class to that link, remove from all others
 *
 * The "trigger line" is the header height + some padding (120px from top).
 * This means a heading becomes active when it crosses under the fixed header.
 *
 * Why iterate from bottom to top?
 * Because we want the LAST heading that's above the trigger line.
 * If we went top-to-bottom, we'd have to keep overwriting.
 * Going bottom-to-top, the first match is the correct one.
 *
 * Depends on:
 * - .toc (the sidebar container)
 * - .toc__link (each link in the ToC)
 * - .toc__toggle (mobile toggle button, optional)
 * - Headings with id attributes matching the href values
 */

;(function () {
    'use strict';

    const TocTracker = {

        /* ---- Configuration ---- */
        SCROLL_OFFSET: 120,  /* pixels from top — accounts for fixed header */
        THROTTLE_MS: 50,     /* minimum ms between scroll calculations */

        init() {
            this.toc = document.querySelector('.toc');
            this.tocLinks = document.querySelectorAll('.toc__link');

            if (!this.toc || this.tocLinks.length === 0) return;

            this.headings = this.collectHeadings();

            if (this.headings.length === 0) return;

            this.setupMobileToggle();
            this.bindEvents();
            this.update(); /* initial check */
        },

        /*
         * Build an array of { element, link } pairs.
         * Each pair connects a heading in the article to its ToC link.
         */
        collectHeadings() {
            const pairs = [];

            this.tocLinks.forEach(link => {
                const href = link.getAttribute('href');

                /* Only process anchor links (start with #) */
                if (!href || !href.startsWith('#')) return;

                const id = href.substring(1); /* remove the # */
                const heading = document.getElementById(id);

                if (heading) {
                    pairs.push({
                        element: heading,
                        link: link
                    });
                }
            });

            return pairs;
        },

        /*
         * Mobile toggle: show/hide the ToC list on small screens.
         * Looks for a button with class .toc__toggle inside .toc.
         */
        setupMobileToggle() {
            this.toggleBtn = this.toc.querySelector('.toc__toggle');

            if (!this.toggleBtn) return;

            this.toggleBtn.addEventListener('click', () => {
                const isOpen = this.toc.classList.toggle('toc--open');

                /* Update aria-expanded for accessibility */
                this.toggleBtn.setAttribute('aria-expanded', isOpen);

                /* Update the icon rotation (handled by CSS) */
            });

            /* Close ToC when a link is clicked (on mobile) */
            this.tocLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 1024) {
                        this.toc.classList.remove('toc--open');
                        this.toggleBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        },

        bindEvents() {
            let lastRun = 0;
            let ticking = false;

            window.addEventListener('scroll', () => {
                const now = Date.now();

                if (now - lastRun < this.THROTTLE_MS) return;
                lastRun = now;

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.update();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        },

        /*
         * Determine which heading is currently "active" and
         * update the ToC links accordingly.
         */
        update() {
            const scrollPos = window.scrollY + this.SCROLL_OFFSET;
            let activeIndex = -1;

            /*
             * Iterate from BOTTOM to TOP.
             * The first heading whose offsetTop is <= scrollPos
             * is the one the user is currently reading.
             */
            for (let i = this.headings.length - 1; i >= 0; i--) {
                if (scrollPos >= this.headings[i].element.offsetTop) {
                    activeIndex = i;
                    break;
                }
            }

            /* Remove .active from all links */
            this.tocLinks.forEach(link => link.classList.remove('active'));

            /* Add .active to the current one */
            if (activeIndex >= 0) {
                this.headings[activeIndex].link.classList.add('active');
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        TocTracker.init();
    });

})();