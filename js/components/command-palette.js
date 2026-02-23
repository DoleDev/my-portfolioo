/* File: js/components/command-palette.js */
/*
 * ============================================
 *   COMMAND PALETTE (Ctrl+K / Cmd+K Search)
 * ============================================
 *
 * A Spotlight-style search overlay for quick navigation.
 *
 * Features:
 * - Ctrl+K (or Cmd+K on Mac) to open
 * - Escape to close
 * - Real-time fuzzy search filtering
 * - Keyboard navigation (↑ ↓ arrows + Enter)
 * - Categorized results (Pages, Services, Projects)
 * - Click or Enter to navigate
 *
 * The search index is defined inline below.
 * Update it whenever you add new pages or content.
 */

;(function () {
    'use strict';

    const CommandPalette = {

        /*
         * 🔧 CUSTOMIZE: Add/remove/edit search items below.
         * Each item needs:
         *   - title: What the user sees
         *   - desc:  Short description
         *   - url:   Where it links to
         *   - icon:  Emoji icon
         *   - category: Grouping label
         *   - keywords: Extra search terms (comma-separated)
         */
        searchIndex: [
            /* Pages */
            { title: 'Home',           desc: 'Main landing page',                   url: 'index.html',        icon: '🏠', category: 'Pages',    keywords: 'home, landing, main' },
            { title: 'About',          desc: 'Learn about me and my journey',       url: 'about.html',        icon: '👤', category: 'Pages',    keywords: 'about, bio, story, experience' },
            { title: 'Services',       desc: 'What I offer and pricing',            url: 'services.html',     icon: '⚡', category: 'Pages',    keywords: 'services, pricing, hire, packages' },
            { title: 'Portfolio',      desc: 'My featured projects',                url: 'portfolio.html',    icon: '💼', category: 'Pages',    keywords: 'portfolio, projects, work, showcase' },
            { title: 'Shop',           desc: 'Digital products and templates',      url: 'shop.html',         icon: '🛒', category: 'Pages',    keywords: 'shop, store, buy, templates, products' },
            { title: 'Blog',           desc: 'Articles and tutorials',              url: 'blog.html',         icon: '📝', category: 'Pages',    keywords: 'blog, articles, tutorials, posts' },
            { title: 'Contact',        desc: 'Get in touch with me',                url: 'contact.html',      icon: '📬', category: 'Pages',    keywords: 'contact, email, message, hire' },
            { title: 'Testimonials',   desc: 'Client reviews and feedback',         url: 'testimonials.html', icon: '⭐', category: 'Pages',    keywords: 'testimonials, reviews, feedback, clients' },
            { title: 'Client Portal',  desc: 'Coming soon — track your projects',   url: 'portal.html',       icon: '🔒', category: 'Pages',    keywords: 'portal, client, dashboard, login' },

            /* Services */
            { title: 'Web Development',    desc: 'Custom websites and web apps',        url: 'services.html#web-development',  icon: '🌐', category: 'Services', keywords: 'web, website, development, react, html, css' },
            { title: 'Telegram Bots',      desc: 'Custom Telegram bot development',     url: 'services.html#telegram-bots',    icon: '🤖', category: 'Services', keywords: 'telegram, bot, automation, chatbot' },
            { title: 'Telegram Mini Apps', desc: 'Mini apps inside Telegram',           url: 'services.html#telegram-bots',    icon: '📱', category: 'Services', keywords: 'telegram, mini app, twa, webapp' },
            { title: 'Academic Writing',   desc: 'Essays, research, dissertations',     url: 'services.html#academic-writing', icon: '📚', category: 'Services', keywords: 'academic, writing, essay, research, dissertation, thesis' },
            { title: 'SaaS Development',   desc: 'Software as a Service tools',         url: 'services.html',                  icon: '☁️', category: 'Services', keywords: 'saas, software, app, tool, startup' },

            /* Quick Actions */
            { title: 'Send Message',       desc: 'Open the contact form',               url: 'contact.html#contact-section',   icon: '✉️', category: 'Actions',  keywords: 'message, email, form, contact' },
            { title: 'WhatsApp Chat',      desc: 'Chat with me on WhatsApp',            url: 'https://wa.me/1234567890',       icon: '💬', category: 'Actions',  keywords: 'whatsapp, chat, instant, message' },
            { title: 'View Resume / CV',   desc: 'Download my resume',                  url: '#',                              icon: '📄', category: 'Actions',  keywords: 'resume, cv, download, hire' },
        ],

        init() {
            this.createDOM();
            this.bindEvents();
            this.highlightedIndex = -1;
            this.filteredItems = [...this.searchIndex];
        },

        createDOM() {
            /* Overlay */
            this.overlay = document.createElement('div');
            this.overlay.className = 'command-palette-overlay';
            this.overlay.setAttribute('aria-hidden', 'true');

            /* Modal */
            this.modal = document.createElement('div');
            this.modal.className = 'command-palette';
            this.modal.setAttribute('role', 'dialog');
            this.modal.setAttribute('aria-label', 'Search');

            this.modal.innerHTML = `
                <div class="command-palette__search">
                    <svg class="command-palette__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input class="command-palette__input" type="text" placeholder="Search pages, services, projects..." autocomplete="off" spellcheck="false">
                    <span class="command-palette__shortcut">ESC</span>
                </div>
                <div class="command-palette__results"></div>
                <div class="command-palette__footer">
                    <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Open</span>
                    <span><kbd>ESC</kbd> Close</span>
                </div>
            `;

            document.body.appendChild(this.overlay);
            document.body.appendChild(this.modal);

            this.input = this.modal.querySelector('.command-palette__input');
            this.resultsContainer = this.modal.querySelector('.command-palette__results');
        },

        bindEvents() {
            /* Ctrl+K / Cmd+K to toggle */
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggle();
                }

                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });

            /* Close on overlay click */
            this.overlay.addEventListener('click', () => this.close());

            /* Search input */
            this.input.addEventListener('input', () => {
                this.highlightedIndex = -1;
                this.search(this.input.value);
            });

            /* Keyboard navigation in results */
            this.input.addEventListener('keydown', (e) => {
                const items = this.resultsContainer.querySelectorAll('.command-palette__item');
                const count = items.length;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.highlightedIndex = (this.highlightedIndex + 1) % count;
                    this.updateHighlight(items);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.highlightedIndex = (this.highlightedIndex - 1 + count) % count;
                    this.updateHighlight(items);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.highlightedIndex >= 0 && items[this.highlightedIndex]) {
                        const url = items[this.highlightedIndex].getAttribute('href');
                        if (url) {
                            if (url.startsWith('http')) {
                                window.open(url, '_blank');
                            } else {
                                window.location.href = url;
                            }
                        }
                        this.close();
                    }
                }
            });
        },

        toggle() {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        },

        open() {
            this.overlay.classList.add('active');
            this.modal.classList.add('active');
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            /* Reset */
            this.input.value = '';
            this.highlightedIndex = -1;
            this.search('');

            /* Focus input after animation */
            setTimeout(() => this.input.focus(), 100);
        },

        close() {
            this.overlay.classList.remove('active');
            this.modal.classList.remove('active');
            this.overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        isOpen() {
            return this.modal.classList.contains('active');
        },

        search(query) {
            const q = query.toLowerCase().trim();

            if (q === '') {
                this.filteredItems = [...this.searchIndex];
            } else {
                this.filteredItems = this.searchIndex.filter(item => {
                    const searchStr = (
                        item.title + ' ' +
                        item.desc + ' ' +
                        item.keywords + ' ' +
                        item.category
                    ).toLowerCase();
                    return searchStr.includes(q);
                });
            }

            this.renderResults();
        },

        renderResults() {
            if (this.filteredItems.length === 0) {
                this.resultsContainer.innerHTML = `
                    <div class="command-palette__empty">
                        <span class="command-palette__empty-icon">🔍</span>
                        No results found. Try a different search term.
                    </div>
                `;
                return;
            }

            /* Group by category */
            const grouped = {};
            this.filteredItems.forEach(item => {
                if (!grouped[item.category]) grouped[item.category] = [];
                grouped[item.category].push(item);
            });

            let html = '';
            Object.keys(grouped).forEach(category => {
                html += `<div class="command-palette__category">${category}</div>`;
                grouped[category].forEach(item => {
                    html += `
                        <a class="command-palette__item" href="${item.url}">
                            <span class="command-palette__item-icon">${item.icon}</span>
                            <div class="command-palette__item-text">
                                <div class="command-palette__item-title">${item.title}</div>
                                <div class="command-palette__item-desc">${item.desc}</div>
                            </div>
                            <svg class="command-palette__item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </a>
                    `;
                });
            });

            this.resultsContainer.innerHTML = html;

            /* Re-bind click events */
            this.resultsContainer.querySelectorAll('.command-palette__item').forEach(el => {
                el.addEventListener('click', () => {
                    this.close();
                });
            });
        },

        updateHighlight(items) {
            items.forEach((el, i) => {
                if (i === this.highlightedIndex) {
                    el.classList.add('highlighted');
                    el.scrollIntoView({ block: 'nearest' });
                } else {
                    el.classList.remove('highlighted');
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        CommandPalette.init();
    });
})();