// ===== Mobile Menu Toggle =====
(function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    // Create overlay element for backdrop
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        nav.classList.add('is-open');
        toggle.classList.add('is-active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        overlay.classList.add('is-visible');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        overlay.classList.remove('is-visible');
        document.body.classList.remove('menu-open');
    }

    // Toggle button
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (nav.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Overlay click closes menu
    overlay.addEventListener('click', closeMenu);

    // Close menu when a nav link is clicked (do NOT preventDefault —
    // let the smooth-scroll handler do its job)
    nav.querySelectorAll('ul a').forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
        }
    });

    // Close when resizing up to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 900 && nav.classList.contains('is-open')) {
                closeMenu();
            }
        }, 150);
    });
})();

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = window.innerWidth < 768 ? 70 : 90;
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Contact form submission =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const form = this;
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        })
        .then(() => {
            submitBtn.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Message Sent!';
            submitBtn.style.backgroundColor = '#28a745';
            form.reset();
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
            }, 3000);
        })
        .catch(() => {
            submitBtn.innerHTML = '<i class="fas fa-times" style="margin-right: 8px;"></i> Error. Try Again.';
            submitBtn.style.backgroundColor = '#dc3545';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
            }, 3000);
        });
    });
}

// ===== Intersection Observer for stat counters (optional nicety) =====
const statNumbers = document.querySelectorAll('.stat-item .number');
if ('IntersectionObserver' in window && statNumbers.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    statNumbers.forEach(n => observer.observe(n));
}

// ===== Gallery Lightbox =====
(function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    if (!galleryItems.length || !lightbox) return;

    const stage     = document.getElementById('lightboxStage');
    const imgEl     = document.getElementById('lightboxImg');
    const captionEl = document.getElementById('lightboxCaption');
    const counterEl = document.getElementById('lightboxCounter');
    const closeBtn  = lightbox.querySelector('.lightbox-close');
    const prevBtn   = lightbox.querySelector('.lightbox-prev');
    const nextBtn   = lightbox.querySelector('.lightbox-next');

    // Build the image list from the gallery
    const images = Array.from(galleryItems).map((item) => {
        const img = item.querySelector('img');
        return {
            src: img ? img.getAttribute('src') : '',
            caption: item.dataset.caption || (img ? img.getAttribute('alt') : '') || ''
        };
    }).filter((i) => i.src);

    if (!images.length) return;

    let currentIndex = 0;
    let lastFocused = null;

    function render(index) {
        currentIndex = (index + images.length) % images.length;
        const data = images[currentIndex];

        lightbox.classList.remove('is-zoomed');
        stage.scrollTop = 0;
        stage.scrollLeft = 0;

        imgEl.src = data.src;
        imgEl.alt = data.caption;
        captionEl.textContent = data.caption;
        counterEl.textContent = (currentIndex + 1) + ' / ' + images.length;

        // Replay the zoom-in animation on every image change
        imgEl.style.animation = 'none';
        void imgEl.offsetWidth; // force reflow
        imgEl.style.animation = '';

        preloadNeighbours();
    }

    function preloadNeighbours() {
        [currentIndex + 1, currentIndex - 1].forEach((i) => {
            const idx = (i + images.length) % images.length;
            const pre = new Image();
            pre.src = images[idx].src;
        });
    }

    function open(index) {
        lastFocused = document.activeElement;
        render(index);
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        window.setTimeout(() => closeBtn.focus(), 60);
    }

    function close() {
        lightbox.classList.remove('is-open', 'is-zoomed');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    const next = () => render(currentIndex + 1);
    const prev = () => render(currentIndex - 1);

    // Make each gallery tile keyboard-accessible + clickable
    galleryItems.forEach((item, i) => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        if (!item.hasAttribute('aria-label')) {
            item.setAttribute('aria-label', 'View image ' + (i + 1) + ' larger');
        }

        item.addEventListener('click', () => open(i));

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                open(i);
            }
        });
    });

    // Controls
    closeBtn.addEventListener('click', close);

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prev();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        next();
    });

    // Click the backdrop (not the image) to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === stage) close();
    });

    // Tap the image to toggle full-size zoom
    imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        lightbox.classList.toggle('is-zoomed');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'ArrowRight') {
            next();
        } else if (e.key === 'ArrowLeft') {
            prev();
        }
    });

    // Swipe left/right to navigate (disabled while zoomed)
    let startX = 0, startY = 0, startTime = 0;

    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        if (lightbox.classList.contains('is-zoomed')) return;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const dt = Date.now() - startTime;

        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) && dt < 600) {
            dx < 0 ? next() : prev();
        }
    }, { passive: true });
})();