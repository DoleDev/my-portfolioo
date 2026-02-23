/* File: js/components/shop-cart.js */

/*
 * ============================================
 *  SHOPPING CART SYSTEM
 * ============================================
 *
 * A complete client-side cart for digital products.
 *
 * Architecture:
 * - Cart data stored in localStorage as JSON
 * - Cart object manages all operations (add, remove, update)
 * - UI rendering is separate from data logic
 * - Custom events notify other parts of the page about changes
 *
 * Cart item structure:
 * {
 *   id: 'product-1',
 *   name: 'Premium Template',
 *   price: 29.99,
 *   image: '🎨' or 'images/product.jpg',
 *   quantity: 1,
 *   category: 'template'
 * }
 *
 * The cart persists across:
 * - Page navigations (same site)
 * - Browser refreshes
 * - Browser restarts (localStorage)
 *
 * It does NOT persist across:
 * - Different browsers
 * - Clearing browser data
 * - Incognito/private mode sessions
 */

;(function () {
    'use strict';

    const ShopCart = {
        STORAGE_KEY: 'portfolio-shop-cart',
        items: [],

        /* ==========================================
           DATA OPERATIONS
           ========================================== */

        init() {
            this.load();
            this.bindEvents();
            this.updateNavBadge();
            this.renderDrawer();
        },

        /* Load cart from localStorage */
        load() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                this.items = stored ? JSON.parse(stored) : [];
            } catch (e) {
                this.items = [];
            }
        },

        /* Save cart to localStorage */
        save() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
            } catch (e) {
                console.warn('Could not save cart to localStorage:', e);
            }
            this.updateNavBadge();
            this.renderDrawer();
        },

        /* Add an item to cart */
        addItem(product) {
            const existing = this.items.find(item => item.id === product.id);

            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image || '📦',
                    quantity: 1,
                    category: product.category || ''
                });
            }

            this.save();
            this.dispatchEvent('cart:updated');
        },

        /* Remove an item from cart */
        removeItem(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.save();
            this.dispatchEvent('cart:updated');
        },

        /* Update quantity of an item */
        updateQuantity(productId, newQuantity) {
            const item = this.items.find(item => item.id === productId);
            if (!item) return;

            if (newQuantity <= 0) {
                this.removeItem(productId);
                return;
            }

            item.quantity = newQuantity;
            this.save();
            this.dispatchEvent('cart:updated');
        },

        /* Clear all items */
        clearCart() {
            this.items = [];
            this.save();
            this.dispatchEvent('cart:updated');
        },

        /* Get total number of items */
        getTotalItems() {
            return this.items.reduce((sum, item) => sum + item.quantity, 0);
        },

        /* Get subtotal price */
        getSubtotal() {
            return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },

        /* Format price as currency */
        formatPrice(amount) {
            return '$' + amount.toFixed(2);
        },

        /* Dispatch a custom event */
        dispatchEvent(name) {
            document.dispatchEvent(new CustomEvent(name, {
                detail: { items: this.items, total: this.getTotalItems(), subtotal: this.getSubtotal() }
            }));
        },

        /* ==========================================
           UI OPERATIONS
           ========================================== */

        /* Update the nav bar cart badge */
        updateNavBadge() {
            const badge = document.getElementById('cart-count');
            if (!badge) return;

            const count = this.getTotalItems();
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        },

        /* Render the cart drawer contents */
        renderDrawer() {
            const itemsContainer = document.getElementById('cart-items');
            const footerContainer = document.getElementById('cart-footer');
            const drawerCount = document.getElementById('cart-drawer-count');

            if (!itemsContainer) return;

            if (this.items.length === 0) {
                /* Show empty state */
                itemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <span class="cart-empty__icon">🛒</span>
                        <h3 class="cart-empty__title">Your cart is empty</h3>
                        <p class="cart-empty__text">Browse our shop and find something you love!</p>
                        <a href="shop.html" class="btn btn--primary btn--sm">Browse Shop</a>
                    </div>
                `;
                if (footerContainer) footerContainer.style.display = 'none';
                if (drawerCount) drawerCount.textContent = '0';
                return;
            }

            if (footerContainer) footerContainer.style.display = '';
            if (drawerCount) drawerCount.textContent = this.getTotalItems();

            /* Render cart items */
            itemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-cart-item-id="${item.id}">
                    <div class="cart-item__image">
                        ${item.image.startsWith('images/') || item.image.startsWith('http')
                            ? `<img src="${item.image}" alt="${item.name}">`
                            : item.image
                        }
                    </div>
                    <div class="cart-item__info">
                        <div class="cart-item__name" title="${item.name}">${item.name}</div>
                        <div class="cart-item__price">${this.formatPrice(item.price)}</div>
                        <div class="cart-item__controls">
                            <button class="cart-item__qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                            <span class="cart-item__qty">${item.quantity}</span>
                            <button class="cart-item__qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <button class="cart-item__remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"></path></svg>
                    </button>
                </div>
            `).join('');

            /* Update subtotal */
            const subtotalEl = document.getElementById('cart-subtotal');
            if (subtotalEl) {
                subtotalEl.textContent = this.formatPrice(this.getSubtotal());
            }
        },

        /* Open the cart drawer */
        openDrawer() {
            const drawer = document.getElementById('cart-drawer');
            const overlay = document.getElementById('cart-overlay');
            if (drawer) drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        /* Close the cart drawer */
        closeDrawer() {
            const drawer = document.getElementById('cart-drawer');
            const overlay = document.getElementById('cart-overlay');
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        /* ==========================================
           EVENT BINDING
           ========================================== */

        bindEvents() {
            /* Cart icon click — open drawer */
            const cartBtn = document.querySelector('.cart-btn');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openDrawer();
                });
            }

            /* Close drawer button */
            document.addEventListener('click', (e) => {
                if (e.target.closest('.cart-drawer__close')) {
                    this.closeDrawer();
                }
            });

            /* Overlay click — close drawer */
            document.addEventListener('click', (e) => {
                if (e.target.id === 'cart-overlay') {
                    this.closeDrawer();
                }
            });

            /* Escape key — close drawer */
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const drawer = document.getElementById('cart-drawer');
                    if (drawer && drawer.classList.contains('active')) {
                        this.closeDrawer();
                    }
                }
            });

            /* "Add to Cart" buttons on product cards */
            document.addEventListener('click', (e) => {
                const addBtn = e.target.closest('[data-add-to-cart]');
                if (!addBtn) return;

                e.preventDefault();

                const product = {
                    id: addBtn.getAttribute('data-product-id'),
                    name: addBtn.getAttribute('data-product-name'),
                    price: addBtn.getAttribute('data-product-price'),
                    image: addBtn.getAttribute('data-product-image') || '📦',
                    category: addBtn.getAttribute('data-product-category') || ''
                };

                this.addItem(product);

                /* Visual feedback — briefly show "Added!" */
                const originalText = addBtn.innerHTML;
                addBtn.classList.add('added');
                addBtn.innerHTML = 'Added! ✓';

                setTimeout(() => {
                    addBtn.classList.remove('added');
                    addBtn.innerHTML = originalText;
                }, 1500);
            });

            /* Cart item controls (increase, decrease, remove) */
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');
                const item = this.items.find(i => i.id === id);

                if (!item) return;

                switch (action) {
                    case 'increase':
                        this.updateQuantity(id, item.quantity + 1);
                        break;
                    case 'decrease':
                        this.updateQuantity(id, item.quantity - 1);
                        break;
                    case 'remove':
                        this.removeItem(id);
                        break;
                }
            });

            /* Clear cart button */
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-clear-cart]')) {
                    this.clearCart();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        ShopCart.init();
    });

    /* Make available globally */
    window.ShopCart = ShopCart;

})();