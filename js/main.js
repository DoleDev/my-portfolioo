/* File: js/main.js */

/*
 * ============================================
 *  MAIN JAVASCRIPT — CORE FUNCTIONALITY
 * ============================================
 *
 * This is the "brain" of our website. It initializes and coordinates
 * all the interactive features.
 *
 * What this file handles:
 * 1. Theme (Dark/Light mode) toggle with localStorage persistence
 * 2. Mobile navigation menu toggle
 * 3. Sticky header behavior (adds "scrolled" class)
 * 4. Smooth scroll for anchor links
 * 5. Scroll-triggered animations (Intersection Observer)
 * 6. Active navigation link highlighting
 *
 * CODING STYLE NOTE:
 * We use an IIFE (Immediately Invoked Function Expression) to wrap our code.
 * This prevents our variables from polluting the global scope (a best practice).
 * Think of it as putting our code in a sealed container.
 */

;(function () {
    'use strict';
    /* 'use strict' enables strict mode — catches common coding mistakes
       and prevents the use of some error-prone features */


    /* ==========================================
       1. THEME TOGGLE (Dark/Light Mode)
       ========================================== */
    /*
     * How it works:
     * - We check for saved preference in localStorage (persists across visits)
     * - If none, we check the OS/browser preference (prefers-color-scheme)
     * - User can toggle anytime; choice is saved to localStorage
     *
     * The actual color change happens via CSS — we just swap the
     * data-theme attribute on <html>, and CSS variables do the rest.
     */

    const ThemeManager = {
        STORAGE_KEY: 'preferred-theme',

        init() {
            /* Determine initial theme */
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

            this.setTheme(theme);
            this.bindEvents();
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(this.STORAGE_KEY, theme);

            /* Update the meta theme-color for mobile browsers */
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a192f' : '#f8f9fc');
            }
        },

        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next);
        },

        bindEvents() {
            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.toggleTheme());
            }

            /* Also listen for OS theme changes (e.g., auto dark mode at night) */
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };


    /* ==========================================
       2. MOBILE NAVIGATION
       ========================================== */
    /*
     * On mobile screens, the nav links are hidden and replaced with a
     * hamburger button (☰). Clicking it slides the menu open.
     *
     * We also:
     * - Close the menu when a link is clicked (smooth navigation)
     * - Close the menu when clicking outside it
     * - Prevent body scroll when menu is open
     * - Update ARIA attributes for screen readers
     */

    const MobileNav = {
        init() {
            this.toggle = document.getElementById('nav-toggle');
            this.menu = document.getElementById('nav-menu');

            if (!this.toggle || !this.menu) return;

            this.isOpen = false;
            this.bindEvents();
        },

        open() {
            this.isOpen = true;
            this.toggle.classList.add('active');
            this.menu.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';  /* Prevent scroll behind menu */
        },

        close() {
            this.isOpen = false;
            this.toggle.classList.remove('active');
            this.menu.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        },

        toggleMenu() {
            this.isOpen ? this.close() : this.open();
        },

        bindEvents() {
            /* Toggle button click */
            this.toggle.addEventListener('click', () => this.toggleMenu());

            /* Close when a nav link is clicked */
            const navLinks = this.menu.querySelectorAll('.nav__link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            /* Close when pressing Escape key */
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                    this.toggle.focus(); /* Return focus to toggle button */
                }
            });

            /* Close when clicking outside menu area */
            document.addEventListener('click', (e) => {
                if (this.isOpen &&
                    !this.menu.contains(e.target) &&
                    !this.toggle.contains(e.target)) {
                    this.close();
                }
            });
        }
    };


    /* ==========================================
       3. STICKY HEADER
       ========================================== */
    /*
     * When the user scrolls down past a threshold, we add a "scrolled"
     * class to the header. This triggers the glassmorphism background
     * effect in CSS, making the nav bar visually distinct from the
     * page content behind it.
     */

    const StickyHeader = {
        init() {
            this.header = document.getElementById('header');
            if (!this.header) return;

            this.scrollThreshold = 50; /* pixels from top before activating */
            this.bindEvents();
            this.check(); /* Check initial scroll position (in case page loads scrolled) */
        },

        check() {
            if (window.scrollY > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        },

        bindEvents() {
            /* Use passive event listener for better scroll performance */
            window.addEventListener('scroll', () => this.check(), { passive: true });
        }
    };


    /* ==========================================
       4. SMOOTH SCROLL FOR ANCHOR LINKS
       ========================================== */
    /*
     * When you click a link like <a href="#services">, the page
     * should scroll smoothly to that section instead of jumping.
     *
     * Note: We already set scroll-behavior: smooth in CSS, but this
     * JS version gives us more control (like adjusting for header height).
     */

    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return; /* Skip empty hash links */

                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        const headerOffset = parseInt(
                            getComputedStyle(document.documentElement)
                                .getPropertyValue('--header-height')
                        ) || 72;

                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
    };


    /* ==========================================
       5. SCROLL-TRIGGERED ANIMATIONS
       ========================================== */
    /*
     * This uses the Intersection Observer API — a modern, performant
     * way to detect when elements scroll into view.
     *
     * HOW IT WORKS:
     * 1. We find all elements with [data-animation] attribute
     * 2. We create an "observer" that watches these elements
     * 3. When an element enters the viewport, the observer fires
     * 4. We add the "animated" class, which triggers the CSS animation
     * 5. We stop observing that element (it only animates once)
     *
     * WHY NOT USE A SCROLL EVENT LISTENER?
     * Scroll events fire hundreds of times per second, which is terrible
     * for performance. Intersection Observer is designed specifically for
     * this use case and is extremely efficient.
     */

    const ScrollAnimations = {
        init() {
            /* Check if browser supports Intersection Observer */
            if (!('IntersectionObserver' in window)) {
                /* If not supported (very old browsers), show everything immediately */
                document.querySelectorAll('[data-animation]').forEach(el => {
                    el.classList.add('animated');
                });
                return;
            }

            const options = {
                root: null,          /* null = viewport */
                rootMargin: '0px',
                threshold: 0.15     /* Trigger when 15% of element is visible */
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        this.observer.unobserve(entry.target); /* Only animate once */
                    }
                });
            }, options);

            /* Observe all elements with data-animation attribute */
            document.querySelectorAll('[data-animation]').forEach(el => {
                this.observer.observe(el);
            });
        }
    };


    /* ==========================================
       6. ACTIVE NAV LINK HIGHLIGHTING
       ========================================== */
    /*
     * Highlights the nav link corresponding to the current page.
     * We check the current URL and compare with each nav link's href.
     */

    const ActiveNavLink = {
        init() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.nav__link');

            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPage = link.getAttribute('href');
                if (linkPage === currentPage) {
                    link.classList.add('active');
                }
            });
        }
    };


    /* ==========================================
       7. STATS COUNTER ANIMATION
       ========================================== */
    /*
     * Animates numbers counting up from 0 to their target value.
     * Uses Intersection Observer to trigger only when visible.
     * Uses requestAnimationFrame for smooth, performant animation.
     */

        /* ==========================================
       7. STATS COUNTER ANIMATION
       ========================================== */

    const StatsCounter = {
        init() {
            /* Select ALL elements with data-target, regardless of class name */
            const statNumbers = document.querySelectorAll('[data-target]');
            if (statNumbers.length === 0) return;

            if (!('IntersectionObserver' in window)) {
                statNumbers.forEach(el => {
                    el.textContent = el.getAttribute('data-target');
                });
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            statNumbers.forEach(el => observer.observe(el));
        },

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target'), 10);
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(easedProgress * target);

                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target;
                }
            };

            requestAnimationFrame(update);
        }
    };


    /* ==========================================
       INITIALIZE EVERYTHING
       ========================================== */
    /*
     * DOMContentLoaded fires when the HTML is fully parsed (but before
     * images are loaded). This is the ideal time to initialize our JS.
     *
     * We use it instead of window.onload because we don't need to wait
     * for images — we just need the DOM structure ready.
     */

    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        MobileNav.init();
        StickyHeader.init();
        SmoothScroll.init();
        ScrollAnimations.init();
        ActiveNavLink.init();
        StatsCounter.init();

        console.log('%c🚀 Portfolio site initialized!', 'color: #64ffda; font-size: 14px; font-weight: bold;');
    });

})();