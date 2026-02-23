/* File: js/components/carousel.js */

/*
 * ============================================
 *  CAROUSEL / SLIDER COMPONENT
 * ============================================
 *
 * A lightweight, custom-built carousel that works without any library.
 *
 * Features:
 * - Arrow navigation (prev/next buttons)
 * - Dot navigation (click dots to jump to a slide)
 * - Touch/swipe support for mobile
 * - Keyboard navigation (left/right arrow keys)
 * - Auto-play with pause on hover
 * - Accessible (ARIA attributes, keyboard support)
 * - Infinite loop option
 *
 * How it works:
 * 1. All slides sit side-by-side in .carousel__track (a flex row)
 * 2. .carousel has overflow: hidden, so only one slide is visible
 * 3. We translate the track left/right to show different slides
 * 4. The dots and arrows call goToSlide() which updates the translation
 *
 * Usage: Just add the carousel HTML structure (as in index.html)
 * and this script auto-initializes any element with class "carousel"
 */

;(function () {
    'use strict';

    class Carousel {
        constructor(element, options = {}) {
            this.carousel = element;
            this.track = element.querySelector('.carousel__track');
            this.slides = Array.from(element.querySelectorAll('.carousel__slide'));
            this.prevBtn = element.querySelector('.carousel__btn--prev');
            this.nextBtn = element.querySelector('.carousel__btn--next');
            this.dotsContainer = element.querySelector('.carousel__dots');

            /* If there are no slides or only one slide, no carousel needed */
            if (this.slides.length <= 1) return;

            /* Options with defaults */
            this.options = {
                autoPlay: options.autoPlay !== undefined ? options.autoPlay : true,
                autoPlayInterval: options.autoPlayInterval || 5000, /* 5 seconds */
                loop: options.loop !== undefined ? options.loop : true,
                ...options
            };

            /* State */
            this.currentIndex = 0;
            this.autoPlayTimer = null;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.isDragging = false;

            this.init();
        }

        init() {
            this.createDots();
            this.updateSlide();
            this.bindEvents();

            if (this.options.autoPlay) {
                this.startAutoPlay();
            }
        }

        /* Create dot indicators based on number of slides */
        createDots() {
            if (!this.dotsContainer) return;

            this.dotsContainer.innerHTML = '';
            this.slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('carousel__dot');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
            });

            this.dots = Array.from(this.dotsContainer.querySelectorAll('.carousel__dot'));
        }

        /* Navigate to a specific slide */
        goToSlide(index) {
            if (this.options.loop) {
                /* Wrap around if looping */
                if (index < 0) index = this.slides.length - 1;
                if (index >= this.slides.length) index = 0;
            } else {
                /* Clamp to valid range */
                if (index < 0) index = 0;
                if (index >= this.slides.length) index = this.slides.length - 1;
            }

            this.currentIndex = index;
            this.updateSlide();
        }

        goToNext() {
            this.goToSlide(this.currentIndex + 1);
        }

        goToPrev() {
            this.goToSlide(this.currentIndex - 1);
        }

        /* Update visual state (track position, dots, buttons) */
        updateSlide() {
            /* Move the track to show the current slide */
            const offset = this.currentIndex * -100;
            this.track.style.transform = `translateX(${offset}%)`;

            /* Update dots */
            if (this.dots) {
                this.dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === this.currentIndex);
                    dot.setAttribute('aria-selected', i === this.currentIndex ? 'true' : 'false');
                });
            }

            /* Update arrow button states (disabled if at start/end and not looping) */
            if (!this.options.loop) {
                if (this.prevBtn) {
                    this.prevBtn.disabled = this.currentIndex === 0;
                }
                if (this.nextBtn) {
                    this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;
                }
            }

            /* Update slide ARIA attributes */
            this.slides.forEach((slide, i) => {
                slide.setAttribute('aria-hidden', i !== this.currentIndex ? 'true' : 'false');
            });
        }

        /* Set up all event listeners */
        bindEvents() {
            /* Arrow buttons */
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.goToPrev();
                    this.resetAutoPlay();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.goToNext();
                    this.resetAutoPlay();
                });
            }

            /* Keyboard navigation */
            this.carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.goToPrev();
                    this.resetAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    this.goToNext();
                    this.resetAutoPlay();
                }
            });

            /* Pause auto-play on hover */
            this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.carousel.addEventListener('mouseleave', () => {
                if (this.options.autoPlay) this.startAutoPlay();
            });

            /* Touch/Swipe support for mobile */
            this.carousel.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.isDragging = true;
            }, { passive: true });

            this.carousel.addEventListener('touchend', (e) => {
                if (!this.isDragging) return;
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
                this.isDragging = false;
            }, { passive: true });

            /* Focus management — pause auto-play when a focusable element inside is focused */
            this.carousel.addEventListener('focusin', () => this.stopAutoPlay());
            this.carousel.addEventListener('focusout', () => {
                if (this.options.autoPlay) this.startAutoPlay();
            });
        }

        /* Determine swipe direction */
        handleSwipe() {
            const swipeThreshold = 50; /* Minimum px to count as a swipe */
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) < swipeThreshold) return;

            if (diff > 0) {
                /* Swiped left → go to next */
                this.goToNext();
            } else {
                /* Swiped right → go to previous */
                this.goToPrev();
            }
            this.resetAutoPlay();
        }

        /* Auto-play methods */
        startAutoPlay() {
            this.stopAutoPlay(); /* Clear any existing timer first */
            this.autoPlayTimer = setInterval(() => {
                this.goToNext();
            }, this.options.autoPlayInterval);
        }

        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        resetAutoPlay() {
            if (this.options.autoPlay) {
                this.stopAutoPlay();
                this.startAutoPlay();
            }
        }

        /* Clean up — call this if the carousel is removed from the DOM */
        destroy() {
            this.stopAutoPlay();
        }
    }

    /*
     * Auto-initialize all carousels on the page.
     * Any element with class "carousel" will become a working carousel.
     */
    document.addEventListener('DOMContentLoaded', () => {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(element => {
            new Carousel(element, {
                autoPlay: true,
                autoPlayInterval: 5000,
                loop: true
            });
        });
    });

    /* Make Carousel class available globally if needed by other scripts */
    window.Carousel = Carousel;

})();