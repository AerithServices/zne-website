// ==========================================
// ZNE Website - JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initActiveState();
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

        // Close menu when a link is clicked
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
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
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ------------------------------------------
// Active State Management
// ------------------------------------------

function initActiveState() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Set active based on current path
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }

        // Handle click for SPA-like behavior
        link.addEventListener('click', (e) => {
            if (linkPath && linkPath.startsWith('/')) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// ------------------------------------------
// Intersection Observer for Animations
// ------------------------------------------

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature items for staggered animation
const featureItems = document.querySelectorAll('.features-list-item');
featureItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `opacity 0.5s ease ${0.1 * index}s, transform 0.5s ease ${0.1 * index}s`;
    observer.observe(item);
});
