/* File: js/components/back-to-top.js */

/*
 * ============================================
 *  BACK-TO-TOP BUTTON
 * ============================================
 *
 * A floating circular button that appears in the bottom-right
 * corner when the user scrolls down. Features:
 *
 * - Shows/hides based on scroll position
 * - Circular SVG progress indicator showing scroll progress
 * - Smooth scroll to top on click
 * - Keyboard accessible
 * - Respects reduced motion preferences
 *
 * The progress ring is an SVG circle with a "stroke-dashoffset"
 * that changes based on scroll percentage. This creates the visual
 * effect of the ring filling up as you scroll down.
 */

;(function () {
    'use strict';

    const BackToTop = {
        SHOW_THRESHOLD: 300, /* Show button after scrolling this many px */

        init() {
            this.button = document.getElementById('back-to-top');
            if (!this.button) return;

            this.progressCircle = this.button.querySelector('.back-to-top__progress');
            this.bindEvents();
            this.update(); /* Check initial scroll position */
        },

        /* Calculate how far down the page the user has scrolled (0 to 1) */
        getScrollProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollableHeight = docHeight - winHeight;

            if (scrollableHeight <= 0) return 0;
            return Math.min(scrollTop / scrollableHeight, 1);
        },

        /* Update button visibility and progress ring */
        update() {
            const scrollTop = window.scrollY;

            /* Show/hide button */
            if (scrollTop > this.SHOW_THRESHOLD) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }

            /* Update progress ring */
            if (this.progressCircle) {
                const progress = this.getScrollProgress();
                /*
                 * SVG circle circumference calculation:
                 * Our circle has r=20, so circumference = 2 * π * 20 ≈ 125.66
                 * stroke-dasharray is set to this value in CSS
                 * stroke-dashoffset at 125.66 = empty ring (0% progress)
                 * stroke-dashoffset at 0 = full ring (100% progress)
                 */
                const circumference = 125.66;
                const offset = circumference - (progress * circumference);
                this.progressCircle.style.strokeDashoffset = offset;
            }
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },

        bindEvents() {
            /* Scroll listener (passive for performance) */
            window.addEventListener('scroll', () => this.update(), { passive: true });

            /* Click to scroll to top */
            this.button.addEventListener('click', () => this.scrollToTop());

            /* Keyboard: Enter or Space to activate */
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        BackToTop.init();
    });

})();