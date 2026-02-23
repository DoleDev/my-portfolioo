/* File: js/components/blog-search.js */

/*
 * ============================================
 *  BLOG SEARCH COMPONENT
 * ============================================
 *
 * Real-time search that filters blog post cards as you type.
 * Searches through: titles, descriptions, categories, and tags.
 *
 * How it works:
 * 1. User types in the search input
 * 2. After a short debounce (250ms), we filter
 * 3. Each blog card is checked against the search query
 * 4. Non-matching cards are hidden with animation
 * 5. Results count is updated
 * 6. Clear button resets the search
 *
 * Debouncing prevents filtering on EVERY keystroke —
 * instead, it waits until the user pauses typing.
 */

;(function () {
    'use strict';

    const BlogSearch = {
        debounceTimer: null,

        init() {
            this.input = document.querySelector('.blog-search__input');
            this.clearBtn = document.querySelector('.blog-search__clear');
            this.resultsEl = document.querySelector('.blog-search__results');
            this.resultsCount = document.querySelector('.blog-search__results-count');
            this.noResults = document.querySelector('.blog-no-results');
            this.cards = Array.from(document.querySelectorAll('[data-searchable]'));
            this.grid = document.querySelector('.blog-grid');

            if (!this.input || this.cards.length === 0) return;

            this.totalCount = this.cards.length;
            this.bindEvents();
        },

        bindEvents() {
            /* Search on input with debounce */
            this.input.addEventListener('input', () => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => this.search(), 250);

                /* Show/hide clear button */
                if (this.clearBtn) {
                    this.clearBtn.classList.toggle('visible', this.input.value.length > 0);
                }
            });

            /* Clear button */
            if (this.clearBtn) {
                this.clearBtn.addEventListener('click', () => {
                    this.input.value = '';
                    this.clearBtn.classList.remove('visible');
                    this.search();
                    this.input.focus();
                });
            }

            /* Allow search on Enter (prevent form submission if in a form) */
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') e.preventDefault();
                if (e.key === 'Escape') {
                    this.input.value = '';
                    this.clearBtn.classList.remove('visible');
                    this.search();
                    this.input.blur();
                }
            });
        },

        search() {
            const query = this.input.value.toLowerCase().trim();
            let visibleCount = 0;

            this.cards.forEach(card => {
                const searchData = (card.getAttribute('data-searchable') || '').toLowerCase();
                const matches = query === '' || searchData.includes(query);

                if (matches) {
                    visibleCount++;
                    card.style.display = '';
                    card.style.opacity = '1';
                    card.style.transform = '';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 200);
                }
            });

            /* Update results count */
            if (this.resultsEl && query !== '') {
                this.resultsEl.classList.add('visible');
                if (this.resultsCount) this.resultsCount.textContent = visibleCount;
            } else if (this.resultsEl) {
                this.resultsEl.classList.remove('visible');
            }

            /* Show/hide no results state */
            if (this.noResults) {
                this.noResults.classList.toggle('visible', visibleCount === 0 && query !== '');
            }

            /* Hide/show grid */
            if (this.grid) {
                this.grid.style.display = (visibleCount === 0 && query !== '') ? 'none' : '';
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        BlogSearch.init();
    });

})();