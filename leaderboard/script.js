// ==========================================
// ZNE Leaderboard - JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    loadLeaderboard();
});

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
// Load Leaderboard from API
// ------------------------------------------

const API_ENDPOINT = 'https://zne.breed.rip/api/leaderboard';
const leaderboardEl = document.getElementById('leaderboard');

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&#039;');
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function getDefaultAvatar(user) {
    return user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
}

function renderCommandPills(commands) {
    const entries = Object.entries(commands || {});
    if (!entries.length) {
        return '<div class="empty">No command history available for this user yet.</div>';
    }

    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    return '<div class="commands-grid">' + entries.map(([name, count]) => (
        '<div class="command-pill">' +
            '<span class="command-name">' + escapeHtml(name) + '</span>' +
            '<span class="command-count">x' + escapeHtml(count) + '</span>' +
        '</div>'
    )).join('') + '</div>';
}

function renderLeaderboard(data) {
    const users = Array.isArray(data?.users) ? data.users : [];

    document.getElementById('totalUsers').textContent = formatNumber(users.length);
    document.getElementById('totalCommands').textContent = formatNumber(
        data?.global_total_commands || users.reduce((sum, user) => sum + Number(user.total_commands || 0), 0)
    );
    document.getElementById('topUser').textContent = users[0] ? users[0].display_name || users[0].username : '—';

    if (!users.length) {
        leaderboardEl.innerHTML = '<div class="empty">No leaderboard data yet. The bot will publish stats after startup.</div>';
        return;
    }

    leaderboardEl.innerHTML = users.map(user => {
        const displayName = escapeHtml(user.display_name || user.username || user.userid);
        const username = escapeHtml(user.username || user.userid);
        const avatar = escapeHtml(getDefaultAvatar(user));
        const rank = Number(user.rank || 0);
        const total = Number(user.total_commands || 0);

        return '<article class="user-card" data-userid="' + escapeHtml(user.userid) + '">' +
            '<button class="user-main" type="button" aria-expanded="false">' +
                '<div class="rank">#' + escapeHtml(rank || '—') + '</div>' +
                '<div class="identity">' +
                    '<img class="avatar" src="' + avatar + '" alt="" loading="lazy">' +
                    '<div class="names">' +
                        '<div class="display-name">' + displayName + '</div>' +
                        '<div class="username">' + username + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="score">' +
                    '<div class="total">x' + escapeHtml(total) + '</div>' +
                    '<div class="label">commands</div>' +
                '</div>' +
            '</button>' +
            '<div class="commands-panel">' + renderCommandPills(user.commands || {}) + '</div>' +
        '</article>';
    }).join('');

    leaderboardEl.querySelectorAll('.user-card').forEach(card => {
        const button = card.querySelector('.user-main');
        button.addEventListener('click', () => {
            const isOpen = card.classList.toggle('open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

async function loadLeaderboard() {
    try {
        const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        renderLeaderboard(data);
    } catch (error) {
        console.error(error);
        leaderboardEl.innerHTML = '<div class="error">Failed to load leaderboard data. Please try again later.</div>';
    }
}
