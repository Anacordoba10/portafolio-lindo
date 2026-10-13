/* ============================================
   Scroll Animations — Intersection Observer
   Portafolio Ana Córdoba
   ============================================ */

class ScrollAnimator {
  constructor() {
    this.observer = null;
    this.skillObserver = null;
    this._init();
  }

  _init() {
    // Enable reveal styles only now that JS is running
    document.documentElement.classList.add('has-scroll-reveal');

    // General reveal observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Don't unobserve — keep for scroll spy
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Skill cards — animate level bars when visible
    this.skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.skillObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    this._observe();
  }

  _observe() {
    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('revealed');
      }
      this.observer.observe(el);
    });

    // Observe skill cards for level bar animation
    document.querySelectorAll('.skill-card').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('revealed');
      } else {
        this.skillObserver.observe(el);
      }
    });

    // Safety fallback: reveal all elements after 2s
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
    }, 2000);
  }

  // Re-observe (useful if content is added dynamically)
  refresh() {
    this._observe();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollAnimator = new ScrollAnimator();
});
