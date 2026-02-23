/* File: js/components/reading-progress.js */

/*
 * ============================================
 *  READING PROGRESS BAR
 * ============================================
 *
 * Shows a thin progress bar at the top of the viewport
 * that fills as the user scrolls through an article.
 *
 * How it works:
 * 1. Finds the .post-content element (the article body)
 * 2. Calculates how far through the article the user has scrolled
 * 3. Updates the width of .reading-progress bar
 *
 * Only activates on pages that have a .post-content element.
 */

;(function () {
    'use strict';

    const ReadingProgress = {
        init() {
            this.progressBar = document.querySelector('.reading-progress');
            this.article = document.querySelector('.post-content');

            if (!this.progressBar || !this.article) return;

            this.bindEvents();
            this.update();
        },

        update() {
            const articleRect = this.article.getBoundingClientRect();
            const articleTop = this.article.offsetTop;
            const articleHeight = this.article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            /* Calculate progress through the article */
            const start = articleTop;
            const end = articleTop + articleHeight - windowHeight;
            const current = scrollY;

            let progress = 0;
            if (current >= start && end > start) {
                progress = Math.min((current - start) / (end - start), 1);
            } else if (current >= end) {
                progress = 1;
            }

            this.progressBar.style.width = (progress * 100) + '%';
        },

        bindEvents() {
            window.addEventListener('scroll', () => this.update(), { passive: true });
            window.addEventListener('resize', () => this.update(), { passive: true });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        ReadingProgress.init();
    });

})();