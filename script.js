/* ============================================
   Sanskar Bhumi English Medium High School
   Main JavaScript — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const hero = document.querySelector('.hero');
  const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const sections = document.querySelectorAll('section[id]');
  const scrollProgress = document.getElementById('scroll-progress');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     Mobile Menu Toggle
     ============================================ */
  function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
    const isOpen = mobileMenu.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  /* ============================================
     Navbar Scroll Effect
     ============================================ */
  function updateNavbar() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  }

  // Initial state
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  /* ============================================
     Active Navigation Link on Scroll
     ============================================ */
  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ============================================
     Scroll Progress Indicator
     ============================================ */
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      scrollProgress.style.width = '0%';
      return;
    }
    const scrolled = (window.scrollY / docHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
  }

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ============================================
     Smooth Scroll for Anchor Links
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetEl.offsetTop - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  /* ============================================
     Hero Load Animation
     ============================================ */
  setTimeout(() => {
    hero.classList.add('loaded');
  }, 200);

  /* ============================================
     Scroll-Triggered Animations (IntersectionObserver)
     ============================================ */
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  /* ============================================
     Gallery — Simple Grid & Lightbox
     ============================================ */

  // Array of 25 gallery photos
  const allGalleryPhotos = Array.from({ length: 25 }, (_, i) => `Life At Sanskar Bhumi/${i + 1}.jpeg`);

  // Masonry pattern for dynamic shapes
  const shapePattern = [
    'shape-large', 'shape-tall', 'shape-square', 'shape-wide',
    'shape-square', 'shape-tall', 'shape-square', 'shape-wide',
    'shape-square', 'shape-square'
  ];

  /* --- Render Photo Grid and Load More Logic --- */
  const photoGridContainer = document.getElementById('photo-gallery-grid');
  const INITIAL_VISIBLE_COUNT = 8;
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreIcon = document.getElementById('load-more-icon');
  const loadMoreText = document.getElementById('load-more-text');

  let isGalleryExpanded = false;
  let galleryItems = [];

  if (photoGridContainer) {
    allGalleryPhotos.forEach((photo, index) => {
      const item = document.createElement('div');
      const shapeClass = shapePattern[index % shapePattern.length];

      item.className = `gallery-item ${shapeClass}`;
      if (index >= INITIAL_VISIBLE_COUNT) {
        item.classList.add('d-none'); // Hide items after initial count
      } else {
        item.setAttribute('data-animate', 'fade-in');
        item.setAttribute('data-animate-delay', String((index % 4) + 1));
      }

      item.innerHTML = `
        <div class="gallery-item-inner">
          <img src="${photo}" alt="School Moment ${index + 1}" loading="lazy" />
          <div class="gallery-item-overlay">
            <span class="material-symbols-outlined">zoom_in</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => openLightbox(index));
      photoGridContainer.appendChild(item);

      // Keep reference
      galleryItems.push(item);

      // Observe initially visible ones for animation
      if (index < INITIAL_VISIBLE_COUNT) {
        observer.observe(item);
      }
    });

    if (loadMoreBtn && allGalleryPhotos.length > INITIAL_VISIBLE_COUNT) {
      loadMoreBtn.addEventListener('click', () => {
        isGalleryExpanded = !isGalleryExpanded;

        if (isGalleryExpanded) {
          // Show all
          galleryItems.forEach((item, idx) => {
            if (idx >= INITIAL_VISIBLE_COUNT) {
              item.classList.remove('d-none');

              // We trigger the smooth fade in
              // Timeout allows display update before opacity transition starts
              setTimeout(() => {
                item.classList.add('visible');
              }, 50 + (idx - INITIAL_VISIBLE_COUNT) * 40); // Slight stagger effect
            }
          });

          loadMoreIcon.textContent = 'expand_less';
          loadMoreText.textContent = 'Show Less';
        } else {
          // Hide again
          galleryItems.forEach((item, idx) => {
            if (idx >= INITIAL_VISIBLE_COUNT) {
              item.classList.add('d-none');
              item.classList.remove('visible');
            }
          });

          loadMoreIcon.textContent = 'expand_more';
          loadMoreText.textContent = 'View More';

          // Small smooth scroll back to top of gallery
          const gallerySection = document.getElementById('gallery');
          const navHeight = document.querySelector('.navbar').offsetHeight;
          window.scrollTo({
            top: gallerySection.offsetTop - navHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  /* --- Lightbox Viewer --- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentPhotoIndex = 0;

  function openLightbox(index) {
    currentPhotoIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  function updateLightboxImage() {
    lightboxImg.src = allGalleryPhotos[currentPhotoIndex];
    lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${allGalleryPhotos.length}`;
  }

  function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % allGalleryPhotos.length;
    updateLightboxImage();
  }

  function prevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + allGalleryPhotos.length) % allGalleryPhotos.length;
    updateLightboxImage();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextPhoto);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevPhoto);

  // Close lightbox on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-image-wrap')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
  });

  /* ============================================
     Enquiry Form Validation
     ============================================ */
  const enquiryForm = document.getElementById('enquiry-form');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = enquiryForm.querySelector('#student-name');
      const phone = enquiryForm.querySelector('#student-phone');
      const classEnquiry = enquiryForm.querySelector('#class-enquiry');
      const message = enquiryForm.querySelector('#student-message');

      let isValid = true;

      // Simple validation
      [name, phone].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef5350';
          isValid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (phone.value.trim() && !/^[\d\s\-\+]{10,}$/.test(phone.value.trim())) {
        phone.style.borderColor = '#ef5350';
        isValid = false;
      }

      if (isValid) {
        // Show success feedback
        const btn = enquiryForm.querySelector('.form-submit');
        const originalText = btn.textContent;
        btn.textContent = '✓ Submitted Successfully!';
        btn.style.background = 'linear-gradient(135deg, #43A047, #2E7D32)';
        btn.disabled = true;

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          enquiryForm.reset();
        }, 3000);
      }
    });
  }

  /* ============================================
     Counter Animation (Stats Section)
     ============================================ */
  function animateCounter(element, target, suffix = '') {
    const duration = 2000; // ms
    const frameDuration = 1000 / 60; // ~16ms per frame
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // ease-out: decelerating
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      const currentVal = Math.floor(progress * target);

      element.textContent = currentVal + suffix;

      if (frame >= totalFrames) {
        element.textContent = target + suffix;
        clearInterval(timer);
      }
    }, frameDuration);
  }

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    const statCards = statsSection.querySelectorAll('.stat-card');

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger each card entrance
          statCards.forEach(card => {
            const index = parseInt(card.getAttribute('data-stat-index')) || 0;
            const delay = index * 150; // 150ms stagger

            setTimeout(() => {
              card.classList.add('stat-visible');

              // Animate counter if it has a target (skip static values)
              const numberEl = card.querySelector('.stat-number');
              if (numberEl && numberEl.hasAttribute('data-target')) {
                const target = parseInt(numberEl.getAttribute('data-target'));
                const suffix = numberEl.getAttribute('data-suffix') || '';
                animateCounter(numberEl, target, suffix);
              }
            }, delay);
          });

          statsObserver.unobserve(entry.target); // only once
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  /* ============================================
     Theme Toggle (Dark / Light Mode)
     ============================================ */
  const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const THEME_KEY = 'sanskar-bhumi-theme';

  // Apply saved theme on load
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  }

  if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener('click', toggleTheme);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', toggleTheme);
  }
});
