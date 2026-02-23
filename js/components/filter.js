/* File: js/components/filter.js */

/*
 * ============================================
 *  FILTER COMPONENT
 * ============================================
 *
 * A reusable filtering system for grids of items.
 * Used on the Portfolio page (filter by project category)
 * and the Shop page (filter by product category).
 *
 * How it works:
 * 1. Filter buttons have a data-filter attribute (e.g., data-filter="web")
 * 2. Grid items have a data-category attribute (e.g., data-category="web")
 * 3. Clicking a button shows only items whose category matches
 * 4. "all" shows everything
 * 5. Items animate in/out smoothly
 * 6. A counter updates to show how many items are visible
 *
 * Usage in HTML:
 *   <button class="filter-btn active" data-filter="all">All</button>
 *   <button class="filter-btn" data-filter="web">Web</button>
 *   ...
 *   <div class="project-card" data-category="web">...</div>
 *
 * The component auto-initializes on any element with
 * [data-filter-group] attribute.
 */

;(function () {
    'use strict';

    class FilterGrid {
        constructor(container) {
            this.container = container;
            this.filterGroupId = container.getAttribute('data-filter-group');

            /* Find the filter buttons and grid items */
            this.buttons = document.querySelectorAll(
                `.filter-btn[data-filter-group="${this.filterGroupId}"]`
            );
            this.items = Array.from(container.querySelectorAll('[data-category]'));
            this.counter = document.querySelector(
                `.project-counter[data-filter-group="${this.filterGroupId}"]`
            );
            this.emptyState = document.querySelector(
                `.portfolio-empty[data-filter-group="${this.filterGroupId}"]`
            );

            this.activeFilter = 'all';

            if (this.buttons.length === 0 || this.items.length === 0) return;

            this.totalCount = this.items.length;
            this.init();
        }

        init() {
            this.bindEvents();
            this.updateCounter(this.totalCount);
        }

        bindEvents() {
            this.buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    if (filter === this.activeFilter) return;

                    this.activeFilter = filter;
                    this.updateButtons(btn);
                    this.filterItems(filter);
                });
            });
        }

        /* Update active button styling */
        updateButtons(activeBtn) {
            this.buttons.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }

        /* Filter the grid items */
        filterItems(filter) {
            let visibleCount = 0;

            this.items.forEach((item, index) => {
                const category = item.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;

                if (shouldShow) {
                    visibleCount++;
                    /* Show item with staggered delay */
                    item.style.display = '';
                    item.classList.remove('filter-hidden');

                    /* Remove then re-add animation class for re-trigger */
                    item.classList.remove('filter-visible');
                    /* Force reflow before adding class (triggers re-animation) */
                    void item.offsetWidth;
                    item.classList.add('filter-visible');

                    /* Stagger delay based on position */
                    item.style.animationDelay = `${visibleCount * 0.05}s`;
                } else {
                    /* Hide item */
                    item.classList.remove('filter-visible');
                    item.classList.add('filter-hidden');

                    /* After animation completes, set display:none */
                    setTimeout(() => {
                        if (item.classList.contains('filter-hidden')) {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });

            this.updateCounter(visibleCount);

            /* Show/hide empty state */
            if (this.emptyState) {
                if (visibleCount === 0) {
                    this.emptyState.classList.add('visible');
                } else {
                    this.emptyState.classList.remove('visible');
                }
            }
        }

        /* Update the "Showing X of Y" counter */
        updateCounter(visible) {
            if (!this.counter) return;

            const currentSpan = this.counter.querySelector('.project-counter__current');
            const totalSpan = this.counter.querySelector('.project-counter__total');

            if (currentSpan) currentSpan.textContent = visible;
            if (totalSpan) totalSpan.textContent = this.totalCount;
        }
    }

    /* Auto-initialize all filter grids on the page */
    document.addEventListener('DOMContentLoaded', () => {
        const filterGrids = document.querySelectorAll('[data-filter-group]');
        /* Only initialize on grid containers, not buttons */
        const containers = new Set();
        filterGrids.forEach(el => {
            /* Find the grid container (the one with children that have data-category) */
            if (el.querySelector('[data-category]')) {
                containers.add(el);
            }
        });
        containers.forEach(container => new FilterGrid(container));
    });

    window.FilterGrid = FilterGrid;

})();