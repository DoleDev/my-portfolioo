/* File: js/components/hero.js */

/*
 * ============================================
 *  HERO TYPING ANIMATION
 * ============================================
 *
 * Creates a typewriter effect that cycles through different
 * role descriptions in the hero section.
 *
 * How it works:
 * 1. We define an array of strings (your services/roles)
 * 2. We "type" each string character by character
 * 3. We pause briefly, then "delete" it character by character
 * 4. We move to the next string and repeat
 *
 * 🔧 CUSTOMIZE: Edit the 'words' array below to list YOUR services/roles!
 */

;(function () {
    'use strict';

    const TypingAnimation = {
        /* ==========================================
           🔧 CUSTOMIZE: Change these to YOUR services/roles
           ==========================================
           These are the words that cycle in the hero section.
           Add, remove, or reorder as you like!
        */
        words: [
            'Beautiful Websites',
            'Web Applications',
            'Mobile Apps',
            'Telegram Bots',
            'Telegram Mini Apps',
            'SaaS Tools',
            'Academic Papers',
            'Research Content',
            'Digital Solutions'
        ],

        /* Settings */
        typeSpeed: 80,        /* ms between each character typed */
        deleteSpeed: 50,      /* ms between each character deleted */
        pauseAfterType: 2000, /* ms to wait after typing a full word */
        pauseAfterDelete: 500,/* ms to wait after deleting before next word */

        /* State */
        currentWordIndex: 0,
        currentCharIndex: 0,
        isDeleting: false,
        element: null,

        init() {
            this.element = document.getElementById('typed-text');
            if (!this.element) return; /* Safety check: do nothing if element doesn't exist */

            this.type();
        },

        type() {
            const currentWord = this.words[this.currentWordIndex];

            if (this.isDeleting) {
                /* DELETING: Remove one character */
                this.currentCharIndex--;
                this.element.textContent = currentWord.substring(0, this.currentCharIndex);
            } else {
                /* TYPING: Add one character */
                this.currentCharIndex++;
                this.element.textContent = currentWord.substring(0, this.currentCharIndex);
            }

            /* Determine the delay before the next step */
            let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

            if (!this.isDeleting && this.currentCharIndex === currentWord.length) {
                /* Just finished typing — pause before deleting */
                delay = this.pauseAfterType;
                this.isDeleting = true;
            } else if (this.isDeleting && this.currentCharIndex === 0) {
                /* Just finished deleting — move to next word */
                this.isDeleting = false;
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                /* The % operator wraps around: after the last word, go back to the first */
                delay = this.pauseAfterDelete;
            }

            /* Schedule the next step */
            setTimeout(() => this.type(), delay);
        }
    };

    /* Initialize when DOM is ready */
    document.addEventListener('DOMContentLoaded', () => {
        TypingAnimation.init();
    });

})();