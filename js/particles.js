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
      particleCount: 80,
      minSize: 1,
      maxSize: 3,
      speed: 0.3,
      connectionDistance: 120,
      colors: [
        'rgba(139, 92, 246, ',  // violet
        'rgba(167, 139, 250, ', // light violet
        'rgba(192, 132, 252, ', // accent
        'rgba(232, 121, 249, ', // pink
        'rgba(129, 140, 248, ', // blue
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
    // Adjust particle count for mobile
    const count = window.innerWidth < 768
      ? Math.floor(this.config.particleCount * 0.4)
      : this.config.particleCount;

    for (let i = 0; i < count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle() {
    const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
    const isStar = Math.random() < 0.35;
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: isStar ? (Math.random() * 2 + 2) : (Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize),
      speedX: (Math.random() - 0.5) * this.config.speed,
      speedY: (Math.random() - 0.5) * this.config.speed,
      color: color,
      shape: isStar ? 'star' : 'circle',
      opacity: Math.random() * 0.5 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  _bindEvents() {
    // Throttled resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this._resize();
        this._createParticles();
      }, 250);
    });

    // Mouse tracking
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Visibility API — pause when tab not visible
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
      // Basic movement
      p.x += p.speedX;
      p.y += p.speedY;

      // Pulse opacity
      p.currentOpacity = p.opacity + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.15;

      // Mouse interaction — subtle repulsion
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }
      }

      // Wrap around edges
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * 0.15;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of this.particles) {
      const alpha = Math.max(0.1, Math.min(1, p.currentOpacity || p.opacity));

      if (p.shape === 'star') {
        const s = Math.round(p.size);
        this.ctx.fillStyle = p.color + alpha + ')';
        // Center pixel
        this.ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
        // Horizontal arms
        this.ctx.fillRect(Math.round(p.x - s), Math.round(p.y - 0.5), s * 2, 1);
        // Vertical arms
        this.ctx.fillRect(Math.round(p.x - 0.5), Math.round(p.y - s), 1, s * 2);

        // Star glow
        this.ctx.fillStyle = p.color + (alpha * 0.2) + ')';
        this.ctx.fillRect(Math.round(p.x - s - 1), Math.round(p.y - 1.5), (s * 2) + 2, 3);
        this.ctx.fillRect(Math.round(p.x - 1.5), Math.round(p.y - s - 1), 3, (s * 2) + 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + alpha + ')';
        this.ctx.fill();

        // Subtle glow
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + (alpha * 0.15) + ')';
        this.ctx.fill();
      }
    }
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
