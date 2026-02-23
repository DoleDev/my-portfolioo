/* File: js/components/accordion.js */
/*
 * ============================================
 *   FAQ ACCORDION
 * ============================================
 *
 * Expandable/collapsible FAQ items.
 *
 * Features:
 * - Click to toggle open/closed
 * - Only one item open at a time (optional)
 * - Smooth max-height animation
 * - Keyboard accessible (Enter/Space)
 * - ARIA attributes update dynamically
 *
 * HTML structure expected:
 * <div class="faq-item">
 *   <button class="faq-item__trigger" aria-expanded="false">
 *     <span>Question text</span>
 *     <svg class="faq-item__icon">...</svg>
 *   </button>
 *   <div class="faq-item__content" aria-hidden="true">
 *     <div class="faq-item__answer">Answer text</div>
 *   </div>
 * </div>
 */

;(function () {
    'use strict';

    const Accordion = {

        init() {
            this.items = document.querySelectorAll('.faq-item');
            if (this.items.length === 0) return;

            this.bindEvents();

            /* Ensure all items start closed */
            this.items.forEach(item => {
                const content = item.querySelector('.faq-item__content');
                if (content) {
                    content.style.maxHeight = '0';
                }
            });
        },

        toggle(item) {
            const isActive = item.classList.contains('active');
            const trigger = item.querySelector('.faq-item__trigger');
            const content = item.querySelector('.faq-item__content');

            if (!content) return;

            /* Close all other items first (single-open mode) */
            this.items.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    this.close(other);
                }
            });

            if (isActive) {
                this.close(item);
            } else {
                this.open(item);
            }
        },

        open(item) {
            const trigger = item.querySelector('.faq-item__trigger');
            const content = item.querySelector('.faq-item__content');
            const answer = item.querySelector('.faq-item__answer');
            if (!content || !answer) return;

            item.classList.add('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');

            /* Set max-height to the actual content height */
            content.style.maxHeight = answer.scrollHeight + 'px';
        },

        close(item) {
            const trigger = item.querySelector('.faq-item__trigger');
            const content = item.querySelector('.faq-item__content');
            if (!content) return;

            item.classList.remove('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');

            content.style.maxHeight = '0';
        },

        bindEvents() {
            this.items.forEach(item => {
                const trigger = item.querySelector('.faq-item__trigger');
                if (!trigger) return;

                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggle(item);
                });

                /* Keyboard support */
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle(item);
                    }
                });
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        Accordion.init();
    });
})();