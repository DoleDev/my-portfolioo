/* File: sw.js */
/*
 * ============================================
 *    SERVICE WORKER
 * ============================================
 *
 * Provides offline functionality for the site.
 *
 * Strategy: "Stale While Revalidate"
 * 1. When the browser requests a file:
 *    a. If it's in the cache → serve the cached version immediately (fast!)
 *    b. Simultaneously, fetch the latest version from the network
 *    c. Update the cache with the fresh version
 * 2. If the network is unavailable:
 *    a. If it's in the cache → serve the cached version
 *    b. If NOT in the cache → show offline.html
 *
 * This means:
 * - First visit: Files are fetched from network and cached
 * - Second visit: Cached files load instantly, fresh versions download in background
 * - Offline: Cached pages work, uncached pages show offline.html
 *
 * Cache versioning:
 * When you update your site, change the CACHE_VERSION number.
 * The service worker will create a new cache and delete old ones.
 *
 * ⚠️ This file MUST be in the project root directory.
 *    Service workers can only control pages at or below their level.
 */

/* ---- Configuration ---- */
/* 🔧 CUSTOMIZE: Increment this number whenever you deploy changes */
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;

/*
 * Files to pre-cache on install.
 * These are loaded into the cache immediately when the
 * service worker is first installed (before any page visit).
 *
 * 🔧 CUSTOMIZE: Update this list if you add/remove pages or key assets.
 */
const PRE_CACHE_URLS = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/portfolio.html',
    '/shop.html',
    '/blog.html',
    '/contact.html',
    '/offline.html',
    '/css/style.css',
    '/css/components/animations.css',
    '/css/components/buttons.css',
    '/css/components/preloader.css',
    '/css/components/header.css',
    '/css/components/cards.css',
    '/css/components/about.css',
    '/css/components/blog.css',
    '/css/components/blog-enhancements.css',
    '/css/components/shop.css',
    '/css/components/footer.css',
    '/css/components/command-palette.css',
    '/css/components/cookie-consent.css',
    '/css/components/notification-bar.css',
    '/css/components/skeleton.css',
    '/js/main.js',
    '/js/components/preloader.js',
    '/js/components/scroll-animations.js',
    '/js/components/back-to-top.js',
    '/js/components/command-palette.js',
    '/js/components/cookie-consent.js',
    '/js/components/content-loader.js',
    '/js/components/shop-cart.js',
    '/manifest.json',
    '/data/projects.json',
    '/data/services.json',
    '/data/testimonials.json',
    '/data/products.json',
    '/data/settings.json'
];


/* ==========================================
   INSTALL EVENT
   ==========================================
   Fired when the service worker is first installed.
   We open a cache and add all pre-cache URLs to it.
   ========================================== */
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker:', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching', PRE_CACHE_URLS.length, 'files');
                /*
                 * addAll() fetches all URLs and caches them.
                 * If ANY single fetch fails, the entire operation fails
                 * and the service worker won't install.
                 * That's why we only list files we KNOW exist.
                 */
                return cache.addAll(PRE_CACHE_URLS);
            })
            .then(() => {
                /*
                 * skipWaiting() forces this service worker to become
                 * the active one immediately, instead of waiting for
                 * all tabs to close. This ensures updates take effect faster.
                 */
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Pre-cache failed:', error);
            })
    );
});


/* ==========================================
   ACTIVATE EVENT
   ==========================================
   Fired when the service worker takes control.
   We clean up old caches from previous versions.
   ========================================== */
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                /*
                 * clients.claim() makes this service worker take control
                 * of all pages immediately, without requiring a page reload.
                 */
                return self.clients.claim();
            })
    );
});


/* ==========================================
   FETCH EVENT
   ==========================================
   Intercepts every network request from the site.
   Implements "stale while revalidate" strategy.
   ========================================== */
self.addEventListener('fetch', event => {
    const request = event.request;

    /*
     * Only handle GET requests.
     * POST, PUT, DELETE etc. should always go to the network.
     */
    if (request.method !== 'GET') return;

    /*
     * Skip cross-origin requests (CDNs, APIs, analytics, etc.)
     * We only cache our own files.
     */
    if (!request.url.startsWith(self.location.origin)) return;

    /*
     * Skip requests to the admin CMS
     * (Decap CMS handles its own caching)
     */
    if (request.url.includes('/admin')) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(request).then(cachedResponse => {

                /*
                 * Start a network fetch regardless of cache hit.
                 * This updates the cache with fresh content.
                 */
                const networkFetch = fetch(request)
                    .then(networkResponse => {
                        /*
                         * Only cache valid responses:
                         * - Status 200 (OK)
                         * - Type "basic" (same-origin)
                         */
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            /*
                             * Clone the response before caching.
                             * Response bodies can only be read once,
                             * so we need one copy for the cache and
                             * one to return to the browser.
                             */
                            const responseToCache = networkResponse.clone();
                            cache.put(request, responseToCache);
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        /*
                         * Network failed and no cache hit.
                         * If it's a page request, show offline.html.
                         * If it's an asset (CSS, JS, image), just fail silently.
                         */
                        if (request.headers.get('Accept') &&
                            request.headers.get('Accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        return null;
                    });

                /*
                 * Return cached version immediately if available,
                 * otherwise wait for the network fetch.
                 * The cache is updated in the background either way.
                 */
                return cachedResponse || networkFetch;
            });
        })
    );
});