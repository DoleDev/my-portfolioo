/* File: js/components/header.js */

/**
 * Header Navigation Controller
 * Ensures all navigation links work properly even if other scripts interfere
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavFix);
    } else {
        initNavFix();
    }

    function initNavFix() {
        // Get all navigation links
        const navLinks = document.querySelectorAll('.nav__link');

        navLinks.forEach(function(link) {
            // Remove any existing event listeners by cloning and replacing
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);

            // Add fresh click handler that forces navigation
            newLink.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Only handle actual page links (not # anchors)
                if (href && href !== '#' && !href.startsWith('#')) {

                    // Close mobile menu if open
                    const navMenu = document.getElementById('nav-menu');
                    const navToggle = document.getElementById('nav-toggle');

                    if (navMenu) {
                        navMenu.classList.remove('active');
                        navMenu.classList.remove('show-menu');
                    }
                    if (navToggle) {
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }

                    // Allow body to scroll again
                    document.body.style.overflow = '';

                    // Force navigation to the href
                    window.location.href = href;
                }
            });
        });

        console.log('✓ Navigation fix applied');
    }
})();