/* ============================================
   Retro OS & Arcade Engine
   Audio Synthesizer (Web Audio API) + CRT Mode + Pixel Sparks
   Portafolio Ana Córdoba
   ============================================ */

class RetroEngine {
  constructor() {
    this.audioCtx = null;
    this.sfxEnabled = localStorage.getItem('ana_sfx_enabled') !== 'false'; // default ON
    this.crtEnabled = localStorage.getItem('ana_crt_enabled') === 'true';  // default OFF

    this._initAudio();
    this._initCRT();
    this._bindControls();
    this._attachAudioListeners();
    this._initClickSparks();
  }

  _initAudio() {
    // Lazy initialize AudioContext on first user interaction
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
  }

  playBeep(type = 'click') {
    if (!this.sfxEnabled) return;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
      else return;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (type === 'click') {
      // 8-bit crisp jump tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'hover') {
      // Subtle 8-bit blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'powerup') {
      // 3-note arpeggio chime
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + (idx + 1) * 0.05);
      });
    } else if (type === 'toggle') {
      // Toggle click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  _initCRT() {
    const crtOverlay = document.getElementById('crt-overlay');
    const crtBtn = document.getElementById('crt-toggle');
    if (this.crtEnabled) {
      document.body.classList.add('crt-active');
      if (crtBtn) crtBtn.classList.add('active');
    }
    this._updateButtons();
  }

  _bindControls() {
    const sfxBtn = document.getElementById('sfx-toggle');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        this.sfxEnabled = !this.sfxEnabled;
        localStorage.setItem('ana_sfx_enabled', this.sfxEnabled);
        this._updateButtons();
        if (this.sfxEnabled) {
          this.playBeep('powerup');
        }
      });
    }

    const crtBtn = document.getElementById('crt-toggle');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        this.crtEnabled = !this.crtEnabled;
        localStorage.setItem('ana_crt_enabled', this.crtEnabled);
        document.body.classList.toggle('crt-active', this.crtEnabled);
        crtBtn.classList.toggle('active', this.crtEnabled);
        this._updateButtons();
        this.playBeep('toggle');
      });
    }
  }

  _updateButtons() {
    const sfxBtn = document.getElementById('sfx-toggle');
    if (sfxBtn) {
      const text = sfxBtn.querySelector('.retro-tool-text');
      const icon = sfxBtn.querySelector('.retro-tool-icon');
      if (text) text.textContent = this.sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
      if (icon) icon.textContent = this.sfxEnabled ? '🔊' : '🔇';
      sfxBtn.classList.toggle('active', this.sfxEnabled);
    }

    const crtBtn = document.getElementById('crt-toggle');
    if (crtBtn) {
      const text = crtBtn.querySelector('.retro-tool-text');
      if (text) text.textContent = this.crtEnabled ? 'CRT: ON' : 'CRT: OFF';
      crtBtn.classList.toggle('active', this.crtEnabled);
    }
  }

  _attachAudioListeners() {
    // Buttons & interactive elements click/hover SFX
    const attachSFX = (selector, clickSound = 'click', hoverSound = 'hover') => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.dataset.sfxBound) return;
        el.dataset.sfxBound = 'true';

        el.addEventListener('click', () => this.playBeep(clickSound));
        el.addEventListener('mouseenter', () => this.playBeep(hoverSound));
      });
    };

    attachSFX('.btn', 'click', 'hover');
    attachSFX('.navbar__link', 'click', 'hover');
    attachSFX('.footer__social-link', 'click', 'hover');
    attachSFX('.skill-card', 'powerup', 'hover');
    attachSFX('.window-titlebar__btn', 'click', 'hover');
    attachSFX('.about__highlight-item', 'click', 'hover');
  }

  _initClickSparks() {
    // Spawn 8-bit pixel sparkles upon clicking anywhere
    document.addEventListener('click', (e) => {
      // Don't spawn on touch
      if (window.matchMedia('(hover: none)').matches) return;

      const colors = ['#FDE047', '#C084FC', '#E879F9', '#818CF8', '#FFFFFF'];
      const numSparks = 6;

      for (let i = 0; i < numSparks; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-pixel-spark';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.floor(Math.random() * 4) + 4; // 4 to 7px square
        const angle = (Math.PI * 2 / numSparks) * i + (Math.random() * 0.4);
        const distance = Math.floor(Math.random() * 25) + 15;
        const vx = Math.cos(angle) * distance;
        const vy = Math.sin(angle) * distance;

        spark.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 1px 1px 0px #0A0814;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.35s steps(6, end), opacity 0.35s steps(6, end);
        `;

        document.body.appendChild(spark);

        requestAnimationFrame(() => {
          spark.style.transform = `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(0.6)`;
          spark.style.opacity = '0';
        });

        setTimeout(() => spark.remove(), 400);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.retroEngine = new RetroEngine();
});
