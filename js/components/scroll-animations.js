/* File: js/components/scroll-animations.js */

/*
 * ============================================
 *  ENHANCED SCROLL ANIMATIONS
 * ============================================
 *
 * This module enhances the basic scroll animation system from main.js.
 * It adds:
 *
 * 1. Staggered animations for groups of elements (children animate
 *    one after another, creating a cascading effect)
 * 2. Parallax-like scroll effects for background elements
 * 3. Section-based animation triggers
 *
 * The main.js ScrollAnimations object handles basic fade-in-up effects.
 * This file handles more complex, group-based animations.
 *
 * It works with the same data-animation attributes used in the HTML.
 * No changes needed to the HTML — this script automatically enhances
 * elements that are children of a .stagger-children container.
 */

;(function () {
    'use strict';

    const EnhancedScrollAnimations = {
        init() {
            if (!('IntersectionObserver' in window)) return;

            this.setupStaggerGroups();
            this.setupParallax();
        },

        /*
         * Stagger Groups
         * When a parent with [data-stagger] enters the viewport,
         * its children animate one by one with increasing delays.
         */
        setupStaggerGroups() {
            const staggerContainers = document.querySelectorAll('[data-stagger]');
            if (staggerContainers.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const container = entry.target;
                        const children = container.children;
                        const baseDelay = parseInt(container.dataset.stagger, 10) || 100;

                        Array.from(children).forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('animated');
                            }, index * baseDelay);
                        });

                        observer.unobserve(container);
                    }
                });
            }, { threshold: 0.15 });

            staggerContainers.forEach(container => {
                /* Set initial state for children */
                Array.from(container.children).forEach(child => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(20px)';
                    child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                });
                observer.observe(container);
            });

            /* Define what "animated" means for stagger children */
            const style = document.createElement('style');
            style.textContent = `
                [data-stagger] > .animated {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        },

        /*
         * Simple parallax-like effect for decorative elements.
         * Elements with [data-parallax] move at a different speed
         * than the scroll, creating depth.
         *
         * data-parallax="0.5" means it moves at half the scroll speed.
         */
        setupParallax() {
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            if (parallaxElements.length === 0) return;

            /* Only apply parallax on desktop (it can feel jarring on mobile) */
            const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (!isDesktop || prefersReducedMotion) return;

            let ticking = false;

            const updateParallax = () => {
                const scrollY = window.scrollY;

                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.5;
                    const rect = el.getBoundingClientRect();
                    const elementCenter = rect.top + rect.height / 2;
                    const viewportCenter = window.innerHeight / 2;
                    const distance = elementCenter - viewportCenter;

                    el.style.transform = `translateY(${distance * speed * -0.1}px)`;
                });

                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            }, { passive: true });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        EnhancedScrollAnimations.init();
    });

})();