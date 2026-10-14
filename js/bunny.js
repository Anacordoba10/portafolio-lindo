/* ============================================
   Bunny Mascot — Interactive Companion (Conejo)
   Portafolio Ana Córdoba
   ============================================ */

class BunnyMascot {
  constructor() {
    this.name = 'Usagi';
    this.isSleeping = false;
    this.isJumping = false;
    this.isMinimized = localStorage.getItem('ana_bunny_minimized') === 'true';
    this.jumpCount = 0;
    this.bubbleTimeout = null;
    this.idleTimer = null;
    this.lastSection = '';

    // Audio context for bunny sfx
    this.audioCtx = null;

    this.quotes = {
      hero: ['¡Hola! Soy Usagi 🐰 ¡Bienvenid@!', '¡Explora el mundo de Ana! ✨', '¡Haz click sobre mí para verme saltar! 🦘'],
      about: ['¡Ana es súper creativa y detallista! 💜', '¡Le apasiona crear código hermoso! 🌸'],
      skills: ['¡Mira todas esas tecnologías! ⚡', 'Frontend, backend, animaciones... ¡Ana sabe de todo! 💻'],
      projects: ['¡Proyectos increíbles! 🚀', '¡Haz click en las tarjetas para verlos! ✨'],
      contact: ['¡Escríbele a Ana a cordobank@gmail.com! 💌', '¡Siempre lista para nuevos retos! 📬'],
      idle: [
        '¡Boing! 🐰✨',
        '¿Ya probaste el modo CRT en la barra de arriba? 🕹️',
        '¡Acaríciame o dame una zanahoria! 🥕',
        'Todo hecho con mucho amor y píxeles 💖',
        '¡Soy tu compañero de navegación! 🐾'
      ],
      feed: [
        '¡Ñam ñam ñam! ¡Deliciosa zanahoria! 🥕😋',
        '¡Muchas gracias! ¡Ahora tengo más energía para saltar! ⚡',
        '¡Qué rico! 💖🐰✨'
      ],
      petted: [
        '¡Aww, qué cariñito! 💖',
        '¡Me encantan las caricias! ✨🥰',
        '¡Purrrr! (Espera, ¿los conejos ronronean?) 🐰💕'
      ]
    };

    this._createDOM();
    this._bindEvents();
    this._initSectionObserver();
    this._startIdleLoop();
    this._startBlinkLoop();
  }

  /* ---- Create DOM Structure & Kawaii SVG ---- */
  _createDOM() {
    // Companion root wrapper
    this.el = document.createElement('div');
    this.el.className = 'bunny-companion' + (this.isMinimized ? ' is-hidden' : '');
    this.el.id = 'bunny-companion';
    this.el.setAttribute('role', 'region');
    this.el.setAttribute('aria-label', 'Mascota interactiva Usagi');

    // Mini action toolbar
    const actions = document.createElement('div');
    actions.className = 'bunny-actions';
    actions.innerHTML = `
      <button class="bunny-btn" data-action="jump" title="¡Haz saltar a Usagi!">🦘 Saltar</button>
      <button class="bunny-btn" data-action="feed" title="Alimentar con una zanahoria">🥕 Comer</button>
      <button class="bunny-btn" data-action="pet" title="Acariciar">💖 Mimar</button>
      <button class="bunny-btn" data-action="sleep" title="Dormir / Despertar">💤 <span class="sleep-text">Dormir</span></button>
    `;

    // Speech bubble
    this.bubble = document.createElement('div');
    this.bubble.className = 'bunny-bubble';
    this.bubble.textContent = '¡Hola! Soy Usagi 🐰 ¡Haz click en mí!';

    // Stage (Character & Shadow)
    const stage = document.createElement('div');
    stage.className = 'bunny-stage';

    // Minimize close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'bunny-toggle-tab';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Minimizar mascota';
    closeBtn.setAttribute('aria-label', 'Minimizar conejo');

    // SVG container
    const svgWrap = document.createElement('div');
    svgWrap.className = 'bunny-svg-wrap';

    // High quality Kawaii Bunny Vector SVG
    svgWrap.innerHTML = `
      <svg class="bunny-svg" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradients -->
          <linearGradient id="bunnyFur" x1="50" y1="20" x2="50" y2="105" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF"/>
            <stop offset="0.65" stop-color="#F4EEFF"/>
            <stop offset="1" stop-color="#E4D5FF"/>
          </linearGradient>
          <linearGradient id="bunnyPink" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#FFB3DE"/>
            <stop offset="1" stop-color="#F472B6"/>
          </linearGradient>
          <radialGradient id="bunnyCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F472B6" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#F472B6" stop-opacity="0"/>
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Fluffy Bunny Tail -->
        <circle class="bunny-tail" cx="20" cy="78" r="11" fill="url(#bunnyFur)" stroke="#D8B4FE" stroke-width="2"/>

        <!-- Left Ear -->
        <g class="bunny-ear-left">
          <ellipse cx="34" cy="28" rx="10" ry="24" transform="rotate(-8 34 28)" fill="url(#bunnyFur)" stroke="#C084FC" stroke-width="2"/>
          <ellipse cx="34" cy="30" rx="5.5" ry="17" transform="rotate(-8 34 30)" fill="url(#bunnyPink)"/>
        </g>

        <!-- Right Ear -->
        <g class="bunny-ear-right">
          <ellipse cx="66" cy="28" rx="10" ry="24" transform="rotate(8 66 28)" fill="url(#bunnyFur)" stroke="#C084FC" stroke-width="2"/>
          <ellipse cx="66" cy="30" rx="5.5" ry="17" transform="rotate(8 66 30)" fill="url(#bunnyPink)"/>
        </g>

        <!-- Chubby Body -->
        <ellipse cx="50" cy="80" rx="28" ry="24" fill="url(#bunnyFur)" stroke="#C084FC" stroke-width="2"/>

        <!-- Cute Bunny Head -->
        <ellipse cx="50" cy="56" rx="27" ry="23" fill="url(#bunnyFur)" stroke="#C084FC" stroke-width="2"/>

        <!-- Cheeks (Blushing) -->
        <ellipse class="bunny-cheek" cx="30" cy="62" rx="6" ry="3.5" fill="url(#bunnyCheek)"/>
        <ellipse class="bunny-cheek" cx="70" cy="62" rx="6" ry="3.5" fill="url(#bunnyCheek)"/>

        <!-- Kawaii Eyes with Double Highlights -->
        <g class="bunny-eyes">
          <!-- Left Eye -->
          <g class="bunny-eye bunny-eye-l" transform-origin="38 54">
            <ellipse cx="38" cy="54" rx="4.2" ry="5.2" fill="#2E1065"/>
            <circle cx="36.5" cy="52" r="1.8" fill="#FFFFFF"/>
            <circle cx="39.8" cy="55.5" r="0.8" fill="#FFFFFF"/>
          </g>
          <!-- Right Eye -->
          <g class="bunny-eye bunny-eye-r" transform-origin="62 54">
            <ellipse cx="62" cy="54" rx="4.2" ry="5.2" fill="#2E1065"/>
            <circle cx="60.5" cy="52" r="1.8" fill="#FFFFFF"/>
            <circle cx="63.8" cy="55.5" r="0.8" fill="#FFFFFF"/>
          </g>
        </g>

        <!-- Cute Twitchy Nose & Mouth -->
        <path d="M48 60 Q50 62 52 60" stroke="#F472B6" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M46 62 Q50 66 54 62" stroke="#7C3AED" stroke-width="1.8" stroke-linecap="round" fill="none"/>

        <!-- Whiskers -->
        <line x1="18" y1="59" x2="27" y2="60" stroke="#C084FC" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <line x1="19" y1="63" x2="27" y2="62.5" stroke="#C084FC" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <line x1="82" y1="59" x2="73" y2="60" stroke="#C084FC" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <line x1="81" y1="63" x2="73" y2="62.5" stroke="#C084FC" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>

        <!-- Front Cute Paws -->
        <ellipse class="bunny-paw" cx="40" cy="88" rx="6.5" ry="5" fill="#FFFFFF" stroke="#C084FC" stroke-width="1.8"/>
        <ellipse class="bunny-paw" cx="60" cy="88" rx="6.5" ry="5" fill="#FFFFFF" stroke="#C084FC" stroke-width="1.8"/>

        <!-- Feet -->
        <ellipse cx="30" cy="98" rx="9" ry="5.5" fill="#F4EEFF" stroke="#C084FC" stroke-width="1.8"/>
        <ellipse cx="70" cy="98" rx="9" ry="5.5" fill="#F4EEFF" stroke="#C084FC" stroke-width="1.8"/>
      </svg>
    `;

    // Dynamic ground shadow
    const shadow = document.createElement('div');
    shadow.className = 'bunny-shadow';

    stage.appendChild(closeBtn);
    stage.appendChild(svgWrap);
    stage.appendChild(shadow);

    this.el.appendChild(actions);
    this.el.appendChild(this.bubble);
    this.el.appendChild(stage);

    // Minimized Pill (Restore button)
    this.minimizedPill = document.createElement('button');
    this.minimizedPill.className = 'bunny-minimized-pill';
    this.minimizedPill.id = 'bunny-restore-btn';
    this.minimizedPill.innerHTML = `<span>🐰</span> Usagi`;
    this.minimizedPill.style.display = this.isMinimized ? 'flex' : 'none';
    this.minimizedPill.title = 'Mostrar mascota Usagi';

    document.body.appendChild(this.el);
    document.body.appendChild(this.minimizedPill);
  }

  /* ---- Audio Synthesizer for Jumps and SFX ---- */
  _playAudio(type = 'jump') {
    // If window.retroEngine is available, check sfxEnabled
    if (window.retroEngine && window.retroEngine.sfxEnabled === false) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'jump') {
        // High playful boing (sine/triangle with pitch slide)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.16);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'superjump') {
        // Double bounce arpeggio
        [440, 660, 880, 1100].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.08, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + (idx + 1) * 0.06);
        });
      } else if (type === 'nom') {
        // Cute crunch/nom sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /* ---- Particle Burst Effect ---- */
  _spawnParticles(count = 5, symbols = ['✨', '💖', '⭐', '🌸']) {
    const rect = this.el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'bunny-particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const distance = 40 + Math.random() * 45;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 35; // bias upward
      const trot = (Math.random() - 0.5) * 60;

      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.setProperty('--trot', `${trot}deg`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  /* ---- Jump Action ---- */
  jump(isSuper = false) {
    if (this.isJumping) return;
    this.isJumping = true;

    // Wake up if sleeping
    if (this.isSleeping) {
      this.wakeUp();
    }

    this.jumpCount++;

    // Super jump every 4th jump or when requested
    const doSuper = isSuper || (this.jumpCount % 5 === 0);

    if (doSuper) {
      this.el.classList.add('is-super-jump');
      this._playAudio('superjump');
      this._spawnParticles(8, ['⭐', '🌟', '💖', '✨', '🥕']);
      this.say('¡HIPER SALTO! 🚀🐰✨', 2500);
      setTimeout(() => {
        this.el.classList.remove('is-super-jump');
        this.isJumping = false;
      }, 850);
    } else {
      // Small random tilt on jump
      const tilt = (Math.random() - 0.5) * 16;
      this.el.style.setProperty('--jump-rot', `${tilt}deg`);
      this.el.classList.add('is-jumping');
      this._playAudio('jump');
      this._spawnParticles(4, ['✨', '💖', '🐾']);

      const happySounds = ['¡Boing! 🐰', '¡Hop! ✨', '¡Arriba! 💖', '¡Yupi! 🥕'];
      this.say(happySounds[Math.floor(Math.random() * happySounds.length)], 1800);

      setTimeout(() => {
        this.el.classList.remove('is-jumping');
        this.isJumping = false;
      }, 650);
    }
  }

  /* ---- Say something in speech bubble ---- */
  say(text, duration = 3500) {
    if (!this.bubble) return;

    this.bubble.textContent = text;
    this.bubble.classList.remove('is-fade-out');

    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    if (duration > 0) {
      this.bubbleTimeout = setTimeout(() => {
        this.bubble.classList.add('is-fade-out');
      }, duration);
    }
  }

  /* ---- Feed with Carrot ---- */
  feed() {
    this.wakeUp();
    this.say('¡Zanahoria para mí! 🥕✨', 2500);

    // Create projectile carrot
    const carrot = document.createElement('div');
    carrot.className = 'bunny-carrot-projectile';
    carrot.textContent = '🥕';

    const rect = this.el.getBoundingClientRect();
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight * 0.35;
    const targetX = rect.left + rect.width / 2 - 14;
    const targetY = rect.top + 30;

    carrot.style.setProperty('--start-x', `${startX}px`);
    carrot.style.setProperty('--start-y', `${startY}px`);
    carrot.style.setProperty('--target-x', `${targetX}px`);
    carrot.style.setProperty('--target-y', `${targetY}px`);

    document.body.appendChild(carrot);

    setTimeout(() => {
      carrot.remove();
      this._playAudio('nom');
      this._spawnParticles(6, ['🥕', '💖', '✨', '😋']);
      this.jump(false);
      const quote = this.quotes.feed[Math.floor(Math.random() * this.quotes.feed.length)];
      this.say(quote, 3200);
    }, 700);
  }

  /* ---- Pet Action ---- */
  pet() {
    this.wakeUp();
    this._playAudio('jump');
    this._spawnParticles(7, ['💖', '💕', '✨', '🌸', '🥰']);
    const quote = this.quotes.petted[Math.floor(Math.random() * this.quotes.petted.length)];
    this.say(quote, 3000);

    // Quick happy bounce
    const svgWrap = this.el.querySelector('.bunny-svg-wrap');
    if (svgWrap) {
      svgWrap.style.transform = 'scale(1.15, 0.9)';
      setTimeout(() => {
        svgWrap.style.transform = '';
      }, 250);
    }
  }

  /* ---- Sleep / Wake Toggle ---- */
  toggleSleep() {
    if (this.isSleeping) {
      this.wakeUp();
    } else {
      this.sleep();
    }
  }

  sleep() {
    this.isSleeping = true;
    this.el.classList.add('is-sleeping');
    const sleepBtn = this.el.querySelector('.sleep-text');
    if (sleepBtn) sleepBtn.textContent = 'Despertar';
    this.say('Zzz... Usagi durmiendo... 💤', 4000);
    this._spawnParticles(3, ['💤', '🌙', '⭐']);
  }

  wakeUp() {
    if (!this.isSleeping) return;
    this.isSleeping = false;
    this.el.classList.remove('is-sleeping');
    const sleepBtn = this.el.querySelector('.sleep-text');
    if (sleepBtn) sleepBtn.textContent = 'Dormir';
    this.say('¡Usagi despertó! ☀️ ¡Listo para saltar!', 2500);
    this._spawnParticles(4, ['✨', '☀️', '🌸']);
  }

  /* ---- Minimize & Restore ---- */
  minimize() {
    this.isMinimized = true;
    localStorage.setItem('ana_bunny_minimized', 'true');
    this.el.classList.add('is-hidden');
    if (this.minimizedPill) this.minimizedPill.style.display = 'flex';
  }

  restore() {
    this.isMinimized = false;
    localStorage.setItem('ana_bunny_minimized', 'false');
    this.el.classList.remove('is-hidden');
    if (this.minimizedPill) this.minimizedPill.style.display = 'none';
    this.jump(false);
    this.say('¡Aquí estoy de nuevo! 🐰💖', 2500);
  }

  /* ---- Blinking Loop ---- */
  _startBlinkLoop() {
    const blink = () => {
      if (!this.isSleeping) {
        this.el.classList.add('is-blinking');
        setTimeout(() => {
          this.el.classList.remove('is-blinking');
        }, 140);
      }
      setTimeout(blink, 2500 + Math.random() * 4000);
    };
    setTimeout(blink, 2000);
  }

  /* ---- Idle Chatter Loop ---- */
  _startIdleLoop() {
    this.idleTimer = setInterval(() => {
      if (this.isSleeping || this.isMinimized || this.isJumping) return;
      // 35% chance to say an idle quote
      if (Math.random() < 0.35) {
        const quote = this.quotes.idle[Math.floor(Math.random() * this.quotes.idle.length)];
        this.say(quote, 3200);
      }
    }, 20000);
  }

  /* ---- Section Detection Observer ---- */
  _initSectionObserver() {
    const sections = [
      { id: 'hero', key: 'hero' },
      { id: 'about', key: 'about' },
      { id: 'skills', key: 'skills' },
      { id: 'projects', key: 'projects' },
      { id: 'contact', key: 'contact' }
    ];

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isSleeping && !this.isMinimized) {
            const secId = entry.target.id;
            if (this.lastSection !== secId) {
              this.lastSection = secId;
              const quotesList = this.quotes[secId];
              if (quotesList && quotesList.length > 0) {
                const quote = quotesList[Math.floor(Math.random() * quotesList.length)];
                this.say(quote, 3500);
                this.jump(false);
              }
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---- Event Bindings ---- */
  _bindEvents() {
    // Click on Bunny to Jump
    const stage = this.el.querySelector('.bunny-stage');
    stage.addEventListener('click', (e) => {
      if (e.target.closest('.bunny-toggle-tab')) return;
      this.jump(false);
    });

    // Action toolbar buttons
    const actions = this.el.querySelector('.bunny-actions');
    actions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const act = btn.dataset.action;
      if (act === 'jump') this.jump(true);
      else if (act === 'feed') this.feed();
      else if (act === 'pet') this.pet();
      else if (act === 'sleep') this.toggleSleep();
    });

    // Close / Minimize button
    const closeBtn = this.el.querySelector('.bunny-toggle-tab');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize();
      });
    }

    // Restore button
    if (this.minimizedPill) {
      this.minimizedPill.addEventListener('click', () => this.restore());
    }

    // Dragging along horizontal bottom
    let isDragging = false;
    let startX = 0;
    let startRight = 28;

    const onMouseDown = (e) => {
      if (e.target.closest('.bunny-actions') || e.target.closest('.bunny-toggle-tab')) return;
      isDragging = true;
      startX = e.clientX;
      const currentRight = parseInt(window.getComputedStyle(this.el).right, 10) || 28;
      startRight = currentRight;
      this.el.style.transition = 'none';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = startX - e.clientX;
      let newRight = startRight + deltaX;
      // Clamp within viewport
      newRight = Math.max(10, Math.min(window.innerWidth - 100, newRight));
      this.el.style.right = `${newRight}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      this.el.style.transition = '';
    };

    stage.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Mobile touch drag
    stage.addEventListener('touchstart', (e) => {
      if (e.target.closest('.bunny-actions') || e.target.closest('.bunny-toggle-tab')) return;
      isDragging = true;
      startX = e.touches[0].clientX;
      const currentRight = parseInt(window.getComputedStyle(this.el).right, 10) || 16;
      startRight = currentRight;
      this.el.style.transition = 'none';
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaX = startX - e.touches[0].clientX;
      let newRight = startRight + deltaX;
      newRight = Math.max(10, Math.min(window.innerWidth - 90, newRight));
      this.el.style.right = `${newRight}px`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      this.el.style.transition = '';
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.bunnyMascot = new BunnyMascot();
});
