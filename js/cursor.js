/* ============================================
   Custom Cursor — Desktop Only
   Portafolio Ana Córdoba
   ============================================ */

class CustomCursor {
  constructor() {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    this.cursor = document.getElementById('custom-cursor');
    if (!this.cursor) return;

    this.dot = this.cursor.querySelector('.custom-cursor__dot');
    this.ring = this.cursor.querySelector('.custom-cursor__ring');
    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.isVisible = false;

    this._injectStyles();
    this._bindEvents();
    this._animate();
  }

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .custom-cursor {
        position: fixed;
        top: 0;
        left: 0;
        z-index: var(--z-cursor);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .custom-cursor.visible {
        opacity: 1;
      }

      .custom-cursor__dot {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #F1E8FF;
        border-radius: 0px;
        box-shadow: 2px 2px 0px #0A0814, 0 0 8px rgba(192, 132, 252, 0.9);
        transform: translate(-50%, -50%);
        transition: transform 0.15s steps(3, end), background 0.15s ease;
      }

      .custom-cursor__ring {
        position: absolute;
        width: 26px;
        height: 26px;
        border: 2px solid #C084FC;
        border-radius: 0px;
        transform: translate(-50%, -50%) rotate(0deg);
        transition: width 0.15s steps(4, end), height 0.15s steps(4, end), border-color 0.15s ease, transform 0.2s steps(4, end), box-shadow 0.15s ease;
        box-shadow: 2px 2px 0px #0A0814;
      }

      .custom-cursor.hovering .custom-cursor__dot {
        transform: translate(-50%, -50%) scale(1.4);
        background: #FDE047;
        box-shadow: 2px 2px 0px #4C1D95, 0 0 12px rgba(253, 224, 71, 1);
      }

      .custom-cursor.hovering .custom-cursor__ring {
        width: 38px;
        height: 38px;
        border-color: #FDE047;
        transform: translate(-50%, -50%) rotate(45deg);
        box-shadow: 3px 3px 0px #0A0814, 0 0 16px rgba(139, 92, 246, 0.6);
      }

      /* Hide default cursor */
      @media (hover: hover) and (pointer: fine) {
        * {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  _bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.cursor.classList.add('visible');
        // Snap to position immediately on first appearance
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
      }
    });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.cursor.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
      this.isVisible = true;
      this.cursor.classList.add('visible');
    });

    // Hover state on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card, .btn');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('hovering'));
    });
  }

  _animate() {
    // Smooth lerp for ring, instant for dot
    const ease = 0.15;
    this.pos.x += (this.target.x - this.pos.x) * ease;
    this.pos.y += (this.target.y - this.pos.y) * ease;

    if (this.dot) {
      this.dot.style.left = this.target.x + 'px';
      this.dot.style.top = this.target.y + 'px';
    }

    if (this.ring) {
      this.ring.style.left = this.pos.x + 'px';
      this.ring.style.top = this.pos.y + 'px';
    }

    requestAnimationFrame(() => this._animate());
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.customCursor = new CustomCursor();
});
