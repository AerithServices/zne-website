// ==========================================
// ZNE Commands Page - JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    loadCommands();
});

let allCommands = [];
let activeCategory = 'all';

// ------------------------------------------
// Navigation
// ------------------------------------------

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// ------------------------------------------
// Scroll Effects
// ------------------------------------------

function initScrollEffects() {
    const navContainer = document.getElementById('navContainer');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ------------------------------------------
// Load Commands from API
// ------------------------------------------

async function loadCommands() {
    const loadingEl = document.getElementById('commandsLoading');
    const contentEl = document.getElementById('commandsContent');
    const errorEl = document.getElementById('commandsError');
    const gridEl = document.getElementById('commandsGrid');
    const emptyEl = document.getElementById('commandsEmpty');
    const searchInput = document.getElementById('commandsSearch');
    const retryBtn = document.getElementById('retryBtn');

    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        const response = await fetch('https://zne.breed.rip/api/commands');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allCommands = data.commands || [];

        loadingEl.style.display = 'none';

        if (allCommands.length === 0) {
            contentEl.style.display = 'block';
            gridEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        contentEl.style.display = 'block';

        renderCategories(allCommands);
        filterCommands();

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterCommands();
            });
        }

    } catch (error) {
        console.error('Failed to load commands:', error);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.style.display = 'flex';
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            loadCommands();
        });
    }
}

// ------------------------------------------
// Render Category Pills
// ------------------------------------------

function renderCategories(commands) {
    const categoriesEl = document.getElementById('categories');
    if (!categoriesEl) return;

    const categories = new Set();
    commands.forEach(cmd => {
        if (cmd.category) {
            categories.add(cmd.category);
        }
    });

    categoriesEl.innerHTML = '<button class="category-pill active" data-category="all">All</button>';

    categories.forEach(category => {
        const pill = document.createElement('button');
        pill.className = 'category-pill';
        pill.dataset.category = category;
        pill.textContent = category;
        categoriesEl.appendChild(pill);
    });

    const pills = categoriesEl.querySelectorAll('.category-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category;
            filterCommands();
        });
    });
}

// ------------------------------------------
// Filter Commands
// ------------------------------------------

function filterCommands() {
    const gridEl = document.getElementById('commandsGrid');
    const emptyEl = document.getElementById('commandsEmpty');
    const searchInput = document.getElementById('commandsSearch');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = allCommands;

    if (activeCategory !== 'all') {
        filtered = filtered.filter(cmd => cmd.category === activeCategory);
    }

    if (query) {
        filtered = filtered.filter(cmd => {
            const name = (cmd.name || cmd).toLowerCase();
            const desc = (cmd.description || '').toLowerCase();
            return name.includes(query) || desc.includes(query);
        });
    }

    if (filtered.length === 0) {
        gridEl.innerHTML = '';
        emptyEl.style.display = 'block';
    } else {
        emptyEl.style.display = 'none';
        renderCommands(filtered, gridEl);
    }
}

// ------------------------------------------
// Render Commands
// ------------------------------------------

function renderCommands(commands, container) {
    container.innerHTML = commands.map(cmd => {
        const name = cmd.name || cmd;
        const description = cmd.description || 'No description available.';
        const category = cmd.category || '';

        return `
            <div class="command-card">
                <div class="command-name">${escapeHtml(name)}</div>
                <div class="command-description">${escapeHtml(description)}</div>
                ${category ? `<span class="command-category">${escapeHtml(category)}</span>` : ''}
            </div>
        `;
    }).join('');
}

// ------------------------------------------
// Utility: Escape HTML
// ------------------------------------------

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
