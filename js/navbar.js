/* ============================================
   Navbar — Sticky, Scroll Spy, Mobile Menu
   Portafolio Ana Córdoba
   ============================================ */

class Navbar {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.toggle = document.getElementById('nav-toggle');
    this.links = document.getElementById('nav-links');
    this.navLinks = document.querySelectorAll('.navbar__link');
    this.sections = [];
    this.isOpen = false;
    this.lastScrollY = 0;

    if (!this.navbar) return;
    this._init();
  }

  _init() {
    // Collect sections for scroll spy
    this.navLinks.forEach((link) => {
      const id = link.getAttribute('href').substring(1);
      const section = document.getElementById(id);
      if (section) {
        this.sections.push({ id, element: section, link });
      }
    });

    this._bindEvents();
    this._onScroll(); // Initial check
  }

  _bindEvents() {
    // Scroll — sticky bg + scroll spy
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this._onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Mobile toggle
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this._toggleMenu());
    }

    // Close menu on link click
    this.navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (this.isOpen) this._toggleMenu();
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.links.contains(e.target) && !this.toggle.contains(e.target)) {
        this._toggleMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this._toggleMenu();
      }
    });
  }

  _onScroll() {
    const scrollY = window.scrollY;

    // Sticky background
    if (scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }

    // Scroll spy — highlight active section
    let currentSection = this.sections[0]?.id || '';

    for (const section of this.sections) {
      const rect = section.element.getBoundingClientRect();
      if (rect.top <= 150) {
        currentSection = section.id;
      }
    }

    this.navLinks.forEach((link) => {
      const id = link.getAttribute('href').substring(1);
      if (id === currentSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.lastScrollY = scrollY;
  }

  _toggleMenu() {
    this.isOpen = !this.isOpen;
    this.toggle.classList.toggle('open', this.isOpen);
    this.links.classList.toggle('open', this.isOpen);
    this.toggle.setAttribute('aria-expanded', this.isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.navbar = new Navbar();
});
