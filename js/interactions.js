(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

  // ── Custom magnetic cursor ─────────────────────────────
  if (!isTouch && !reduceMotion) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-custom-cursor');

    let mx = innerWidth / 2, my = innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;
    let magnet = null;

    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const magnets = () => document.querySelectorAll('.magnetic, a, button, .card, .portfolio-item');
    magnets().forEach((el) => {
      el.addEventListener('mouseenter', () => { magnet = el; ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => { magnet = null; ring.classList.remove('is-hover'); el.style.transform = ''; });
      el.addEventListener('mousemove', (e) => {
        if (!el.classList.contains('magnetic')) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const tx = (e.clientX - cx) * 0.25;
        const ty = (e.clientY - cy) * 0.25;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    });

    const tick = () => {
      dx += (mx - dx) * 0.85;
      dy += (my - dy) * 0.85;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        rx += (r.left + r.width / 2 - rx) * 0.2;
        ry += (r.top + r.height / 2 - ry) * 0.2;
      } else {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
      }
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ── Gravity particles in hero ──────────────────────────
  if (!reduceMotion) {
    const hero = document.querySelector('.hero');
    if (hero) {
      const canvas = document.createElement('canvas');
      canvas.className = 'hero-canvas';
      hero.prepend(canvas);
      const ctx = canvas.getContext('2d');
      let w = 0, h = 0, parts = [];
      const mouse = { x: -9999, y: -9999, active: false };
      const count = Math.min(80, Math.floor(innerWidth / 16));

      const resize = () => {
        const r = hero.getBoundingClientRect();
        w = canvas.width = r.width * devicePixelRatio;
        h = canvas.height = r.height * devicePixelRatio;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        ctx.scale(devicePixelRatio, devicePixelRatio);
      };
      const seed = () => {
        parts = Array.from({ length: count }, () => ({
          x: Math.random() * (w / devicePixelRatio),
          y: Math.random() * (h / devicePixelRatio),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 0.8 + Math.random() * 1.8,
          a: 0.15 + Math.random() * 0.35,
        }));
      };

      const draw = () => {
        const W = w / devicePixelRatio, H = h / devicePixelRatio;
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          if (mouse.active) {
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 24000) {
              const f = (1 - d2 / 24000) * 0.18;
              p.vx += dx * f * 0.01;
              p.vy += dy * f * 0.01;
            }
          }
          p.vx *= 0.96; p.vy *= 0.96;
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,168,75,${p.a})`;
          ctx.fill();
        }
        // connect nearby particles with faint gold lines
        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j < parts.length; j++) {
            const a = parts[i], b = parts[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 9000) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(200,168,75,${0.08 * (1 - d2 / 9000)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      };

      resize(); seed(); draw();
      addEventListener('resize', () => { resize(); seed(); }, { passive: true });
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.active = true;
      });
      hero.addEventListener('mouseleave', () => { mouse.active = false; });
    }
  }

  // ── Parallax on scroll ─────────────────────────────────
  if (!reduceMotion) {
    const items = [...document.querySelectorAll('[data-parallax]')];
    if (items.length) {
      const onScroll = () => {
        const vh = innerHeight;
        for (const el of items) {
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2 - vh / 2;
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          el.style.setProperty('--py', `${-center * speed}px`);
        }
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // ── Portfolio thumb tilt ───────────────────────────────
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.portfolio-item').forEach((el) => {
      const inner = el.querySelector('.portfolio-thumb');
      if (!inner) return;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `scale(1.05) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
      });
      el.addEventListener('mouseleave', () => { inner.style.transform = ''; });
    });
  }
})();
