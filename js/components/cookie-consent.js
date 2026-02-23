/* File: js/components/cookie-consent.js */
/*
 * ============================================
 *   COOKIE CONSENT BANNER
 * ============================================
 *
 * Shows a GDPR-style cookie consent banner on first visit.
 * Remembers the user's choice in localStorage.
 *
 * Also handles the notification/announcement bar dismiss.
 */

;(function () {
    'use strict';

    const CookieConsent = {

        storageKey: 'cookie-consent-accepted',
        notifKey: 'notification-bar-dismissed',

        init() {
            this.initCookieBanner();
            this.initNotificationBar();
        },

        /* ==========================================
           COOKIE CONSENT BANNER
           ========================================== */

        initCookieBanner() {
            /* Check if already answered */
            if (localStorage.getItem(this.storageKey) !== null) return;

            /* Create banner */
            this.banner = document.createElement('div');
            this.banner.className = 'cookie-consent';
            this.banner.setAttribute('role', 'alert');
            this.banner.innerHTML = `
                <div class="cookie-consent__inner">
                    <span class="cookie-consent__icon">🍪</span>
                    <div class="cookie-consent__text">
                        <div class="cookie-consent__title">This site uses cookies</div>
                        <div class="cookie-consent__description">
                            We use cookies to enhance your experience and analyze site traffic.
                            By clicking "Accept", you consent to our use of cookies.
                            <a href="#" target="_blank" rel="noopener">Privacy Policy</a>
                        </div>
                    </div>
                    <div class="cookie-consent__actions">
                        <button class="cookie-consent__btn cookie-consent__btn--decline" id="cookie-decline">Decline</button>
                        <button class="cookie-consent__btn cookie-consent__btn--accept" id="cookie-accept">Accept</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.banner);

            /* Show with slight delay for smooth entrance */
            setTimeout(() => {
                this.banner.classList.add('visible');
            }, 1500);

            /* Button handlers */
            document.getElementById('cookie-accept').addEventListener('click', () => {
                localStorage.setItem(this.storageKey, 'true');
                this.dismissBanner();
            });

            document.getElementById('cookie-decline').addEventListener('click', () => {
                localStorage.setItem(this.storageKey, 'false');
                this.dismissBanner();
            });
        },

        dismissBanner() {
            this.banner.classList.remove('visible');
            setTimeout(() => {
                if (this.banner.parentNode) {
                    this.banner.parentNode.removeChild(this.banner);
                }
            }, 500);
        },

        /* ==========================================
           NOTIFICATION BAR
           ========================================== */

        initNotificationBar() {
            const bar = document.getElementById('notification-bar');
            if (!bar) return;

            /* Check if already dismissed */
            if (localStorage.getItem(this.notifKey) === 'true') {
                bar.classList.add('dismissed');
                return;
            }

            /* Close button */
            const closeBtn = bar.querySelector('.notification-bar__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    bar.classList.add('dismissed');
                    localStorage.setItem(this.notifKey, 'true');
                });
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        CookieConsent.init();
    });
})();