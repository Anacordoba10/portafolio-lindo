/* ============================================
   Particle System — Canvas Animation
   Portafolio Ana Córdoba
   ============================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    this.isRunning = false;

    // Config
    this.config = {
      particleCount: 90,
      minSize: 2,
      maxSize: 4,
      speed: 0.25,
      colors: [
        '#FDE047', // gold star
        '#C084FC', // accent lilac
        '#E879F9', // pastel pink
        '#A78BFA', // soft violet
        '#818CF8', // retro blue
        '#FFFFFF', // white twinkle
      ]
    };

    this._init();
  }

  _init() {
    this._resize();
    this._createParticles();
    this._bindEvents();
    this.start();
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  _createParticles() {
    this.particles = [];
    const count = window.innerWidth < 768
      ? Math.floor(this.config.particleCount * 0.45)
      : this.config.particleCount;

    for (let i = 0; i < count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle() {
    const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
    const shapes = ['cross-star', 'pixel-diamond', 'pixel-square', 'pixel-sparkle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.floor(Math.random() * (this.config.maxSize - this.config.minSize + 1)) + this.config.minSize,
      speedX: (Math.random() - 0.5) * this.config.speed,
      speedY: (Math.random() - 0.5) * this.config.speed,
      color: color,
      shape: shape,
      opacity: Math.random() * 0.5 + 0.35,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  _bindEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this._resize();
        this._createParticles();
      }, 250);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  _update() {
    const time = Date.now() * 0.001;

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      // Discrete stepped twinkle for retro feel
      const wave = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset);
      p.currentOpacity = Math.max(0.15, Math.min(1, p.opacity + (wave > 0.3 ? 0.35 : wave < -0.3 ? -0.2 : 0)));

      // Wrap around edges
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Disable image smoothing on canvas for sharp pixels
    this.ctx.imageSmoothingEnabled = false;

    // Draw retro pixel particles (all integer-snapped)
    for (const p of this.particles) {
      const x = Math.floor(p.x);
      const y = Math.floor(p.y);
      const s = p.size;
      const alpha = p.currentOpacity || p.opacity;

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'cross-star') {
        // ✦ 4-point pixel star
        // Center 2x2
        this.ctx.fillRect(x, y, 2, 2);
        // North, South, East, West 2px arms
        this.ctx.fillRect(x, y - s, 2, s);
        this.ctx.fillRect(x, y + 2, 2, s);
        this.ctx.fillRect(x - s, y, s, 2);
        this.ctx.fillRect(x + 2, y, s, 2);
      } else if (p.shape === 'pixel-diamond') {
        // Pixel rhombus ◆
        this.ctx.fillRect(x, y - 2, 2, 2);
        this.ctx.fillRect(x - 2, y, 6, 2);
        this.ctx.fillRect(x, y + 2, 2, 2);
      } else if (p.shape === 'pixel-sparkle') {
        // Tiny 2x2 star
        this.ctx.fillRect(x, y, 2, 2);
        if (alpha > 0.6) {
          this.ctx.fillRect(x - 1, y, 4, 1);
          this.ctx.fillRect(x, y - 1, 1, 4);
        }
      } else {
        // Pixel square block ■
        this.ctx.fillRect(x, y, s, s);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  _loop() {
    if (!this.isRunning) return;
    this._update();
    this._draw();
    this.animationId = requestAnimationFrame(() => this._loop());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.particleSystem = new ParticleSystem('particles-canvas');
});
