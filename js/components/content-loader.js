/* File: js/components/content-loader.js */
/*
 * ============================================
 *    DYNAMIC CONTENT LOADER
 * ============================================
 *
 * Fetches JSON data files and dynamically generates
 * HTML content (cards, sections, lists) from that data.
 *
 * Why dynamic loading?
 * Instead of hardcoding every project, service, and testimonial
 * in HTML, we store data in JSON files. This script reads those
 * files and builds the HTML at runtime. Benefits:
 * 1. Edit content in one place (JSON or CMS), not scattered HTML
 * 2. CMS writes to JSON → site automatically reflects changes
 * 3. Pages stay lightweight (small HTML + data loaded on demand)
 * 4. Easy to add/remove/reorder items
 *
 * How it works:
 * 1. Look for elements with [data-content] attribute
 *    e.g., <div data-content="projects"></div>
 * 2. Show skeleton loading placeholders
 * 3. Fetch the corresponding JSON file
 * 4. Generate HTML cards from the data
 * 5. Replace skeletons with real content
 *
 * Supported values for data-content:
 * - "projects"      → loads data/projects.json
 * - "projects-featured" → loads only featured projects
 * - "services"      → loads data/services.json
 * - "testimonials"  → loads data/testimonials.json
 * - "testimonials-featured" → loads only featured testimonials
 * - "products"      → loads data/products.json
 * - "products-featured" → loads only featured products
 *
 * Optional attributes:
 * - data-limit="3"  → only show first N items
 */

;(function () {
    'use strict';

    const ContentLoader = {

        /* ---- Cache fetched data to avoid re-fetching ---- */
        cache: {},

        /* ---- Data file paths ---- */
        paths: {
            projects:     'data/projects.json',
            services:     'data/services.json',
            testimonials: 'data/testimonials.json',
            products:     'data/products.json'
        },

        init() {
            this.containers = document.querySelectorAll('[data-content]');
            if (this.containers.length === 0) return;

            this.containers.forEach(container => {
                this.loadContent(container);
            });
        },

        /*
         * Determine what to load based on the data-content value,
         * then fetch the data and render it.
         */
        async loadContent(container) {
            const contentType = container.getAttribute('data-content');
            const limit = parseInt(container.getAttribute('data-limit')) || null;

            /* Show skeleton loading state */
            this.showSkeletons(container, contentType);

            try {
                let data;
                let html;

                switch (contentType) {
                    case 'projects':
                        data = await this.fetchData('projects');
                        html = this.renderProjects(data.projects, limit);
                        break;

                    case 'projects-featured':
                        data = await this.fetchData('projects');
                        const featuredProjects = data.projects.filter(p => p.featured);
                        html = this.renderProjects(featuredProjects, limit);
                        break;

                    case 'services':
                        data = await this.fetchData('services');
                        html = this.renderServices(data.services, limit);
                        break;

                    case 'testimonials':
                        data = await this.fetchData('testimonials');
                        html = this.renderTestimonials(data.testimonials, limit);
                        break;

                    case 'testimonials-featured':
                        data = await this.fetchData('testimonials');
                        const featuredTestimonials = data.testimonials.filter(t => t.featured);
                        html = this.renderTestimonials(featuredTestimonials, limit);
                        break;

                    case 'products':
                        data = await this.fetchData('products');
                        html = this.renderProducts(data.products, limit);
                        break;

                    case 'products-featured':
                        data = await this.fetchData('products');
                        const featuredProducts = data.products.filter(p => p.featured);
                        html = this.renderProducts(featuredProducts, limit);
                        break;

                    default:
                        console.warn('ContentLoader: Unknown content type:', contentType);
                        return;
                }

                /* Replace skeletons with real content */
                container.innerHTML = html;

                /* Re-trigger scroll animations on new elements */
                this.triggerAnimations(container);

            } catch (error) {
                console.error('ContentLoader: Failed to load', contentType, error);
                this.showError(container, contentType);
            }
        },

        /*
         * Fetch JSON data with caching.
         * If we already fetched this file, return cached version.
         */
        async fetchData(type) {
            if (this.cache[type]) {
                return this.cache[type];
            }

            const path = this.paths[type];
            if (!path) {
                throw new Error('No path configured for: ' + type);
            }

            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.cache[type] = data;
            return data;
        },


        /* ==========================================
           SKELETON LOADERS
           ========================================== */

        showSkeletons(container, type) {
            let count = 3;
            let skeletonClass = 'skeleton-card';

            if (type.includes('testimonials')) {
                skeletonClass = 'skeleton-testimonial';
            } else if (type.includes('services')) {
                skeletonClass = 'skeleton-service';
            }

            let skeletons = '';
            for (let i = 0; i < count; i++) {
                skeletons += `<div class="${skeletonClass}" aria-hidden="true">
                    <div class="skeleton-image skeleton-shimmer"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-line skeleton-line--short skeleton-shimmer"></div>
                        <div class="skeleton-line skeleton-shimmer"></div>
                        <div class="skeleton-line skeleton-line--medium skeleton-shimmer"></div>
                    </div>
                </div>`;
            }
            container.innerHTML = skeletons;
        },


        /* ==========================================
           RENDER FUNCTIONS
           ==========================================
           Each function takes an array of data objects
           and returns an HTML string.
           ========================================== */

        /* ---- Projects ---- */
        renderProjects(projects, limit) {
            if (!projects || projects.length === 0) {
                return '<p class="content-empty">No projects to display yet.</p>';
            }

            /* Sort by order field */
            const sorted = [...projects].sort((a, b) => (a.order || 99) - (b.order || 99));
            const items = limit ? sorted.slice(0, limit) : sorted;

            return items.map((project, index) => {
                const techTags = (project.technologies || [])
                    .map(tech => `<span class="card__tech-tag">${this.escapeHtml(tech)}</span>`)
                    .join('');

                const liveLink = project.liveUrl
                    ? `<a href="${this.escapeHtml(project.liveUrl)}" class="card__link" target="_blank" rel="noopener noreferrer" aria-label="Live demo">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                       </a>`
                    : '';

                const githubLink = project.githubUrl
                    ? `<a href="${this.escapeHtml(project.githubUrl)}" class="card__link" target="_blank" rel="noopener noreferrer" aria-label="View source code">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                       </a>`
                    : '';

                const imageHtml = project.image
                    ? `<img src="${this.escapeHtml(project.image)}" alt="${this.escapeHtml(project.title)}" loading="lazy">`
                    : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

                return `
                <article class="card card--project" data-animation="fade-in-up" data-delay="${index * 100}">
                    <div class="card__image-wrapper">
                        <div class="card__image-placeholder">${imageHtml}</div>
                        <span class="card__category-badge">${this.escapeHtml(project.category)}</span>
                    </div>
                    <div class="card__body">
                        <h3 class="card__title">${this.escapeHtml(project.title)}</h3>
                        <p class="card__description">${this.escapeHtml(project.description)}</p>
                        <div class="card__tech-stack">${techTags}</div>
                    </div>
                    <div class="card__footer">
                        <div class="card__links">
                            ${githubLink}
                            ${liveLink}
                        </div>
                    </div>
                </article>`;
            }).join('');
        },

        /* ---- Services ---- */
        renderServices(services, limit) {
            if (!services || services.length === 0) {
                return '<p class="content-empty">No services listed yet.</p>';
            }

            const sorted = [...services].sort((a, b) => (a.order || 99) - (b.order || 99));
            const items = limit ? sorted.slice(0, limit) : sorted;

            return items.map((service, index) => {
                const featureList = (service.features || [])
                    .slice(0, 6)
                    .map(f => `<li class="service-card__feature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${this.escapeHtml(f)}
                    </li>`)
                    .join('');

                const pricingHtml = (service.pricing && service.pricing.length > 0)
                    ? `<div class="service-card__pricing">
                         <span class="service-card__price-label">Starting at</span>
                         <span class="service-card__price">$${this.escapeHtml(service.pricing[0].price)}</span>
                       </div>`
                    : '';

                return `
                <div class="service-card" data-animation="fade-in-up" data-delay="${index * 100}">
                    <div class="service-card__icon">${service.icon || '⚡'}</div>
                    <h3 class="service-card__title">${this.escapeHtml(service.title)}</h3>
                    <p class="service-card__description">${this.escapeHtml(service.description)}</p>
                    <ul class="service-card__features">${featureList}</ul>
                    ${pricingHtml}
                    <a href="contact.html?service=${this.escapeHtml(service.id)}" class="btn btn--outline btn--sm service-card__cta">
                        <span>Get Quote</span>
                    </a>
                </div>`;
            }).join('');
        },

        /* ---- Testimonials ---- */
        renderTestimonials(testimonials, limit) {
            if (!testimonials || testimonials.length === 0) {
                return '<p class="content-empty">No testimonials yet.</p>';
            }

            const items = limit ? testimonials.slice(0, limit) : testimonials;

            return items.map((testimonial, index) => {
                const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));

                const avatarHtml = testimonial.avatar
                    ? `<img src="${this.escapeHtml(testimonial.avatar)}" alt="${this.escapeHtml(testimonial.name)}" loading="lazy">`
                    : `<span>${this.escapeHtml(testimonial.initials || '??')}</span>`;

                return `
                <div class="testimonial-card" data-animation="fade-in-up" data-delay="${index * 100}">
                    <div class="testimonial-card__stars" aria-label="${testimonial.rating} out of 5 stars">${stars}</div>
                    <blockquote class="testimonial-card__text">
                        <p>"${this.escapeHtml(testimonial.text)}"</p>
                    </blockquote>
                    <div class="testimonial-card__author">
                        <div class="testimonial-card__avatar">${avatarHtml}</div>
                        <div class="testimonial-card__info">
                            <div class="testimonial-card__name">${this.escapeHtml(testimonial.name)}</div>
                            <div class="testimonial-card__role">${this.escapeHtml(testimonial.role)}, ${this.escapeHtml(testimonial.company)}</div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        },

        /* ---- Products ---- */
        renderProducts(products, limit) {
            if (!products || products.length === 0) {
                return '<p class="content-empty">No products available yet.</p>';
            }

            const sorted = [...products].sort((a, b) => (a.order || 99) - (b.order || 99));
            const items = limit ? sorted.slice(0, limit) : sorted;

            return items.map((product, index) => {
                const featureList = (product.features || [])
                    .slice(0, 5)
                    .map(f => `<li class="product-card__feature">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${this.escapeHtml(f)}
                    </li>`)
                    .join('');

                const originalPriceHtml = product.originalPrice
                    ? `<span class="product-card__original-price">$${product.originalPrice}</span>`
                    : '';

                const imageHtml = product.image
                    ? `<img src="${this.escapeHtml(product.image)}" alt="${this.escapeHtml(product.title)}" loading="lazy">`
                    : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

                return `
                <div class="product-card" data-animation="fade-in-up" data-delay="${index * 100}"
                     data-product-id="${this.escapeHtml(product.id)}"
                     data-product-title="${this.escapeHtml(product.title)}"
                     data-product-price="${product.price}"
                     data-product-image="${this.escapeHtml(product.image || '')}">
                    <div class="product-card__image">${imageHtml}</div>
                    <div class="product-card__body">
                        <span class="product-card__category">${this.escapeHtml(product.category)}</span>
                        <h3 class="product-card__title">${this.escapeHtml(product.title)}</h3>
                        <p class="product-card__description">${this.escapeHtml(product.description)}</p>
                        <ul class="product-card__features">${featureList}</ul>
                        <div class="product-card__pricing">
                            <span class="product-card__price">$${product.price}</span>
                            ${originalPriceHtml}
                        </div>
                        <button class="btn btn--primary btn--sm product-card__add-to-cart" aria-label="Add ${this.escapeHtml(product.title)} to cart">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>`;
            }).join('');
        },


        /* ==========================================
           ERROR / FALLBACK
           ========================================== */
        showError(container, contentType) {
            container.innerHTML = `
                <div class="content-error">
                    <span class="content-error__icon">⚠️</span>
                    <p class="content-error__text">Unable to load ${contentType.replace(/-/g, ' ')}. Please try refreshing the page.</p>
                    <button class="btn btn--outline btn--sm content-error__retry" onclick="location.reload()">
                        <span>Retry</span>
                    </button>
                </div>`;
        },


        /* ==========================================
           UTILITIES
           ========================================== */

        /*
         * Escape HTML to prevent XSS attacks.
         * Even though we control the JSON data, it's good practice
         * to escape any data before inserting into innerHTML.
         */
        escapeHtml(str) {
            if (typeof str !== 'string') return str;
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        },

        /*
         * After dynamically inserting content, re-trigger
         * scroll animations so the new elements animate in.
         */
        triggerAnimations(container) {
            const animatedElements = container.querySelectorAll('[data-animation]');
            if (animatedElements.length === 0) return;

            /*
             * Check if ScrollAnimations module exists (from Batch 7).
             * If so, observe the new elements.
             */
            if (typeof window.ScrollAnimations !== 'undefined' && window.ScrollAnimations.observer) {
                animatedElements.forEach(el => {
                    window.ScrollAnimations.observer.observe(el);
                });
            } else {
                /*
                 * Fallback: If ScrollAnimations hasn't loaded yet,
                 * just make the elements visible immediately.
                 */
                animatedElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        ContentLoader.init();
    });

    /* Expose globally so other scripts can access the cache */
    window.ContentLoader = ContentLoader;

})();