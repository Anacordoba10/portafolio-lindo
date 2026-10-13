/* ============================================
   Main — Orchestration & Effects
   Portafolio Ana Córdoba
   ============================================ */

// ---- Typing Effect ----
class TypingEffect {
  constructor(elementId, phrases, options = {}) {
    this.element = document.getElementById(elementId);
    if (!this.element) return;

    this.phrases = phrases;
    this.typeSpeed = options.typeSpeed || 60;
    this.deleteSpeed = options.deleteSpeed || 35;
    this.pauseBetween = options.pauseBetween || 2000;
    this.currentPhrase = 0;
    this.currentChar = 0;
    this.isDeleting = false;

    this._type();
  }

  _type() {
    const phrase = this.phrases[this.currentPhrase];

    if (this.isDeleting) {
      this.currentChar--;
    } else {
      this.currentChar++;
    }

    this.element.textContent = phrase.substring(0, this.currentChar);

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.currentChar === phrase.length) {
      delay = this.pauseBetween;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentChar === 0) {
      this.isDeleting = false;
      this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
      delay = 400;
    }

    setTimeout(() => this._type(), delay);
  }
}

// ---- 3D Tilt Effect on Project Cards ----
class TiltEffect {
  constructor(selector) {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    this.cards = document.querySelectorAll(selector);
    this._bindEvents();
  }

  _bindEvents() {
    this.cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => this._onMove(e, card));
      card.addEventListener('mouseleave', (e) => this._onLeave(e, card));
    });
  }

  _onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  }

  _onLeave(e, card) {
    card.style.transform = '';
  }
}

// ---- Smooth Scroll for anchor links ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ---- Initialize Lucide Icons ----
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    // Wait for Lucide to load
    window.addEventListener('load', () => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }
}

// ---- Parallax on hero blobs ----
function initParallaxBlobs() {
  if ('ontouchstart' in window) return;

  const blobs = document.querySelectorAll('.hero__blob');
  if (!blobs.length) return;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    blobs.forEach((blob, i) => {
      const speed = (i + 1) * 8;
      blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  }, { passive: true });
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Typing effect
  new TypingEffect('typing-text', [
    'Creo apps que enamoran ✨',
    'Diseño interfaces intuitivas 🎨',
    'Código limpio & escalable 🚀',
    'Del concepto al producto 💡',
    'Mobile-first siempre 📱'
  ]);

  // Tilt effect on project cards
  new TiltEffect('.project-card');

  // Smooth scroll
  initSmoothScroll();

  // Initialize Lucide icons
  initIcons();

  // Parallax blobs
  initParallaxBlobs();
});
