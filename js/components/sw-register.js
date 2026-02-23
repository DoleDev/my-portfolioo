/* File: js/components/sw-register.js */
/*
 * ============================================
 *    SERVICE WORKER REGISTRATION
 * ============================================
 *
 * Registers the service worker (sw.js) and handles
 * update notifications.
 *
 * What this does:
 * 1. Check if the browser supports service workers
 * 2. Register sw.js after the page finishes loading
 * 3. Listen for updates (new version of sw.js)
 * 4. Optionally show a notification to the user
 *    asking them to refresh for the latest version
 *
 * Why register after page load?
 * Service worker installation involves downloading and
 * caching many files. Doing this while the page is still
 * loading would compete for bandwidth and slow down the
 * initial page load. By waiting for the 'load' event,
 * we ensure the page itself loads quickly first.
 */

;(function () {
    'use strict';

    /* Check browser support */
    if (!('serviceWorker' in navigator)) {
        console.log('[SW Register] Service workers not supported in this browser.');
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('[SW Register] Service worker registered. Scope:', registration.scope);

                /*
                 * Listen for updates.
                 * When a new version of sw.js is found,
                 * the browser downloads and installs it,
                 * then fires the 'updatefound' event.
                 */
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        /*
                         * The new service worker is installed and waiting.
                         * This means there's a newer version of the site available.
                         *
                         * We can show a notification to the user.
                         */
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('[SW Register] Registration failed:', error);
            });
    });

    /*
     * Show a small notification bar at the bottom of the page
     * informing the user that a new version is available.
     * Clicking "Update" reloads the page to activate the new SW.
     */
    function showUpdateNotification() {
        /* Don't show if one already exists */
        if (document.querySelector('.sw-update-notification')) return;

        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <p>A new version of this site is available.</p>
            <button class="sw-update-btn" onclick="window.location.reload()">Update</button>
            <button class="sw-update-dismiss" aria-label="Dismiss" onclick="this.parentElement.remove()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        notification.style.cssText = `
            position: fixed;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card, #1a2332);
            border: 1px solid var(--border-color, #2d3748);
            border-radius: 12px;
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 9999;
            font-size: 0.875rem;
            color: var(--text-primary, #e6f1ff);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .sw-update-btn {
                background: var(--accent-primary, #64ffda);
                color: var(--text-on-accent, #0a192f);
                border: none;
                padding: 0.35rem 0.85rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.8rem;
                cursor: pointer;
                white-space: nowrap;
            }
            .sw-update-dismiss {
                background: none;
                border: none;
                color: var(--text-secondary, #8892b0);
                cursor: pointer;
                padding: 4px;
                display: flex;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(notification);
    }

})();