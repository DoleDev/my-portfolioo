/* File: js/components/modal.js */

/*
 * ============================================
 *  MODAL / LIGHTBOX COMPONENT
 * ============================================
 *
 * A reusable, accessible modal system.
 *
 * How it works:
 * 1. Elements with [data-modal-trigger] attribute trigger a modal on click
 * 2. The data-modal-trigger value matches the modal's id
 * 3. When triggered: overlay fades in, modal scales in, body scroll locks
 * 4. Close via: .modal__close button, clicking overlay, pressing Escape
 * 5. Focus is trapped inside the modal while it's open
 * 6. On close, focus returns to the trigger element
 *
 * Usage in HTML:
 *   Trigger:  <button data-modal-trigger="service-web">Learn More</button>
 *   Modal:    <div class="modal-overlay" id="service-web">
 *               <div class="modal" role="dialog" aria-modal="true">
 *                 ...modal content...
 *               </div>
 *             </div>
 */

;(function () {
    'use strict';

    const ModalManager = {
        activeModal: null,
        triggerElement: null,

        init() {
            this.bindTriggers();
            this.bindCloseButtons();
            this.bindOverlayClicks();
            this.bindKeyboard();
        },

        /* Find and bind all trigger buttons */
        bindTriggers() {
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('[data-modal-trigger]');
                if (!trigger) return;

                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-trigger');
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.open(modal, trigger);
                }
            });
        },

        /* Bind close buttons inside modals */
        bindCloseButtons() {
            document.addEventListener('click', (e) => {
                const closeBtn = e.target.closest('.modal__close');
                if (closeBtn && this.activeModal) {
                    this.close();
                }
            });
        },

        /* Close when clicking the overlay (outside the modal content) */
        bindOverlayClicks() {
            document.addEventListener('click', (e) => {
                if (this.activeModal && e.target.classList.contains('modal-overlay')) {
                    this.close();
                }
            });
        },

        /* Keyboard events */
        bindKeyboard() {
            document.addEventListener('keydown', (e) => {
                if (!this.activeModal) return;

                /* Close on Escape */
                if (e.key === 'Escape') {
                    this.close();
                    return;
                }

                /* Trap focus inside modal with Tab */
                if (e.key === 'Tab') {
                    this.trapFocus(e);
                }
            });
        },

        /* Open a modal */
        open(overlay, trigger) {
            this.activeModal = overlay;
            this.triggerElement = trigger;

            /* Show the modal */
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            /* Set ARIA attributes */
            overlay.setAttribute('aria-hidden', 'false');

            /* Focus the first focusable element inside the modal */
            const modal = overlay.querySelector('.modal');
            if (modal) {
                const firstFocusable = modal.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (firstFocusable) {
                    setTimeout(() => firstFocusable.focus(), 100);
                }
            }
        },

        /* Close the active modal */
        close() {
            if (!this.activeModal) return;

            this.activeModal.classList.remove('active');
            this.activeModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            /* Return focus to the trigger element */
            if (this.triggerElement) {
                this.triggerElement.focus();
            }

            this.activeModal = null;
            this.triggerElement = null;
        },

        /* Keep Tab focus inside the modal */
        trapFocus(e) {
            const modal = this.activeModal.querySelector('.modal');
            if (!modal) return;

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                /* Shift+Tab: if at first element, wrap to last */
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                /* Tab: if at last element, wrap to first */
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        ModalManager.init();
    });

    window.ModalManager = ModalManager;

})();