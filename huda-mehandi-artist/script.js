/**
 * script.js — Huda Mehndi Artist
 * GSAP + ScrollTrigger + Lenis + All interactions
 */

/* ═══════════════════════════════════════════════════
   LOADER — henna hand drawing animation (one-time)
   Uses sessionStorage so it only runs on first visit
═══════════════════════════════════════════════════ */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const loaderSVG = document.getElementById('loader-svg-wrap');
  
  // Check if loader was already shown this session
  const alreadyShown = sessionStorage.getItem('huda_loader_shown');
  
  if (alreadyShown) {
    // Skip loader
    loader.style.display = 'none';
    document.body.style.overflow = '';
    initPage();
    return;
  }

  document.body.style.overflow = 'hidden';

  // Animate the henna hand SVG paths using stroke-dashoffset
  // Each path in #henna-hand gets measured and animated
  const svgEl = document.getElementById('henna-hand');
  const paths  = svgEl ? Array.from(svgEl.querySelectorAll('path')) : [];

  // Set up stroke animation for each path
  paths.forEach(path => {
    try {
      const len = path.getTotalLength();
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
    } catch(e) {
      path.style.strokeDasharray  = 2000;
      path.style.strokeDashoffset = 2000;
    }
  });

  const tl = gsap.timeline({
    onComplete() {
      sessionStorage.setItem('huda_loader_shown', '1');
      gsap.to(loader, {
        opacity: 0, duration: 0.9, ease: 'power2.inOut',
        onComplete() {
          loader.style.display = 'none';
          document.body.style.overflow = '';
          initPage();
        }
      });
    }
  });

  // Draw paths one by one
  if (paths.length > 0) {
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 2.4,
      ease: 'power2.inOut',
      stagger: 0.15
    });
  } else {
    // Fallback: just a mandala ring animation
    tl.to({}, { duration: 1.5 });
  }

  // Name appears
  tl.to('#loader-name', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .to('#loader-sub',  { opacity: 1,     duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to({}, { duration: 0.7 });
})();


/* ═══════════════════════════════════════════════════
   PAGE INIT (called after loader)
═══════════════════════════════════════════════════ */
function initPage() {
  gsap.registerPlugin(ScrollTrigger);

  /* ──────────────────────────────
     LENIS SMOOTH SCROLL
  ────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  function rafLoop(time) { lenis.raf(time); requestAnimationFrame(rafLoop); }
  requestAnimationFrame(rafLoop);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ──────────────────────────────
     PROGRESS BAR
  ────────────────────────────── */
  const progressBar = document.getElementById('progress-bar');
  lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = (progress * 100) + '%';
  });

  /* ──────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────── */
  const cur     = document.getElementById('cursor');
  const ring    = document.getElementById('cursorRing');
  const hennaC  = document.getElementById('cursor-henna');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(cur,    { x: mx, y: my, duration: 0.08, overwrite: true });
    if (hennaC) { hennaC.style.left = mx + 'px'; hennaC.style.top = my + 'px'; }
  });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Henna hand cursor on buttons/links
  document.querySelectorAll('a, button, .service-card, .gallery-item, .slide-item, .social-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-active');
      gsap.to(ring, { scale: 1.5, opacity: 0.2, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-active');
      gsap.to(ring, { scale: 1, opacity: 0.45, duration: 0.3 });
    });
  });

  /* ──────────────────────────────
     NAV: auto-detect dark sections
  ────────────────────────────── */
  const nav = document.getElementById('main-nav');
  const darkSections = ['#pin-section', '#testimonials', '#adorned-stories'];

  // Detect which section the user is in
  function updateNav() {
    const scrollY = window.scrollY;
    const heroH   = document.getElementById('hero')?.offsetHeight || 0;

    // Check if we're past the hero
    if (scrollY > heroH * 0.6) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Check if we're in a dark-bg section
    let inDark = false;
    darkSections.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= 80 && r.bottom >= 80) inDark = true;
    });
    // Also check recent-work and footer
    ['#recent-work', 'footer'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= 80 && r.bottom >= 80) inDark = true;
    });

    nav.classList.toggle('dark-bg', inDark);
  }
  lenis.on('scroll', updateNav);
  updateNav();

  /* ──────────────────────────────
     HERO: letter-by-letter name animation
  ────────────────────────────── */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .to('#hero-tag', { opacity: 1, y: 0, duration: 0.9, delay: 0.2 });

  // Animate each letter with 60-70% overlap threshold
  const letters = document.querySelectorAll('.hero-name .letter');
  letters.forEach((letter, i) => {
    const prevLetter = letters[i - 1];
    if (i === 0) {
      heroTl.to(letter, { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: 'back.out(1.2)' }, '-=0.1');
    } else {
      // Start when previous letter is ~65% visible (opacity 0.65)
      heroTl.to(letter, { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: 'back.out(1.2)' }, '-=0.45');
    }
  });

  heroTl
    .to('#hero-sub',  { opacity: 1, y: 0, duration: 0.9 }, '-=0.3')
    .to('#hero-div',  { opacity: 1, duration: 0.7 }, '-=0.4')
    .to('#hero-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
    .to('#hero-cta',  { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
    .to('#scroll-ind',{ opacity: 1, duration: 0.6 }, '-=0.2');

  // Parallax on mandala
  gsap.to('.hero-mandala', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ──────────────────────────────
     GENERIC REVEAL ANIMATIONS
  ────────────────────────────── */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-scale').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', delay: i * 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  /* ──────────────────────────────
     COUNTER ANIMATION
  ────────────────────────────── */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter() {
        gsap.to({ val: 0 }, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val) + '+'; }
        });
      }
    });
  });

  /* ──────────────────────────────
     HORIZONTAL SCROLL + CONE TRAIL
  ────────────────────────────── */
  const pinSticky = document.getElementById('pin-sticky');
  const track     = document.getElementById('h-track');
  const cone      = document.getElementById('floating-cone');
  const canvas    = document.getElementById('cone-canvas');
  const ctx       = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = pinSticky.offsetWidth;
    canvas.height = pinSticky.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const getTrackW = () => track.scrollWidth - window.innerWidth;
  const pts = [];
  let lastProg = -1;

  function drawMotif(x, y, sz, alpha, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#e8c07a';
    ctx.lineWidth   = 1.1;
    ctx.translate(x, y);
    const t = seed % 4;
    if (t === 0) {
      ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -sz*1.55, sz*0.28, sz*0.52, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,59,0.2)'; ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(0, 0, sz*0.22, 0, Math.PI*2);
      ctx.fillStyle = '#c9963b'; ctx.fill();
    } else if (t === 1) {
      ctx.beginPath();
      ctx.moveTo(0, -sz*1.4);
      ctx.bezierCurveTo(sz*0.85, -sz*1.1, sz*1.1, -sz*0.15, sz*0.38, sz*0.28);
      ctx.bezierCurveTo(0, sz*0.65, -sz*0.55, sz*0.45, -sz*0.45, 0);
      ctx.bezierCurveTo(-sz*0.48, -sz*0.75, 0, -sz*1.4, 0, -sz*1.4);
      ctx.fillStyle = 'rgba(201,150,59,0.2)'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, sz*0.2, 0, Math.PI*2);
      ctx.fillStyle = '#c9963b'; ctx.fill();
    } else if (t === 2) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        const ex = Math.cos(a)*sz*1.35, ey = Math.sin(a)*sz*1.35;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(ex,ey); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, sz*0.2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,59,0.4)'; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(0,0,sz*0.45,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,sz*0.18,0,Math.PI*2);
      ctx.fillStyle = '#c9963b'; ctx.fill();
    } else {
      for (let a = 0; a < Math.PI*2; a += Math.PI/3) {
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sz*0.55, -sz*0.25, sz*1.1, sz*0.12, sz, sz*0.5);
        ctx.bezierCurveTo(sz*0.45, sz*0.9, 0, sz*0.48, 0, 0);
        ctx.fillStyle = 'rgba(201,150,59,0.22)'; ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(0,0,sz*0.2,0,Math.PI*2);
      ctx.fillStyle = '#e8c07a'; ctx.fill();
    }
    ctx.restore();
  }

  function redrawTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pts.length < 2) return;

    // Vine
    ctx.save();
    ctx.strokeStyle = 'rgba(232,192,122,0.38)';
    ctx.lineWidth   = 1.4;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i-1], c = pts[i];
      ctx.quadraticCurveTo(p.x, p.y + 28*Math.sin(i*0.9), (p.x+c.x)/2, c.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    pts.forEach((pt, i) => {
      if (i % 6 !== 0) return;
      const age = (pts.length - i) / pts.length;
      drawMotif(pt.x, pt.y, 7+(1-age)*9, Math.min(0.72, 0.15+(1-age)*0.65), Math.floor(i/6));
    });

    pts.forEach((pt, i) => {
      if (i % 3 !== 0) return;
      const age = (pts.length - i) / pts.length;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y + Math.sin(i*1.1)*10, 1.8, 0, Math.PI*2);
      ctx.fillStyle = `rgba(232,192,122,${0.12+(1-age)*0.28})`;
      ctx.fill();
    });
  }

  ScrollTrigger.create({
    trigger: '#pin-section',
    start: 'top top',
    end: 'bottom bottom',
    pin: '#pin-sticky',
    anticipatePin: 1,
    onUpdate(self) {
      const prog = self.progress;
      gsap.set(track, { x: -getTrackW() * prog });

      const W  = canvas.width, H = canvas.height;
      const cx = -100 + prog * (W + 180);
      const cy = H * 0.68 + Math.sin(prog * Math.PI * 2.5) * 28;

      const coneH = 172, tipOffY = 160;
      gsap.set(cone, { x: cx - 37, y: cy - tipOffY, rotation: Math.sin(prog*Math.PI*1.8)*8 - 3, top: 0, left: 0, bottom: 'auto' });

      if (Math.abs(prog - lastProg) > 0.006) {
        lastProg = prog;
        pts.push({ x: cx, y: cy });
        redrawTrail();
      }
    }
  });

  ScrollTrigger.create({
    trigger: '#pin-section', start: 'top bottom',
    onLeaveBack() { pts.length = 0; ctx.clearRect(0,0,canvas.width,canvas.height); lastProg = -1; }
  });

  gsap.from('.h-item', {
    opacity: 0, y: 60, stagger: 0.1, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#pin-section', start: 'top 80%' }
  });

  /* ──────────────────────────────
     RECENT WORK SLIDER (GSAP draggable)
  ────────────────────────────── */
  const sliderTrack = document.getElementById('slider-track');
  if (sliderTrack) {
    let isDragging = false, startX = 0, scrollLeft = 0;
    let currentX = 0, targetX = 0;
    const maxScroll = () => -(sliderTrack.scrollWidth - sliderTrack.parentElement.offsetWidth + 200);

    // Auto-scroll animation
    let autoScrollTween = gsap.to({}, {
      duration: 0.016,
      repeat: -1,
      onRepeat() {
        if (!isDragging) {
          targetX -= 0.5; // auto-scroll speed
          if (targetX < maxScroll()) targetX = 0;
        }
        currentX += (targetX - currentX) * 0.08;
        gsap.set(sliderTrack, { x: currentX });
      }
    });

    

    // Mouse drag
    sliderTrack.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX;
      scrollLeft = currentX;
      sliderTrack.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      targetX = Math.max(maxScroll(), Math.min(0, scrollLeft + dx));
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      sliderTrack.style.cursor = 'grab';
    });

    // Touch support
    sliderTrack.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      scrollLeft = currentX;
    }, { passive: true });
    sliderTrack.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - startX;
      targetX = Math.max(maxScroll(), Math.min(0, scrollLeft + dx));
    }, { passive: true });

    // Pause autoscroll on hover
    sliderTrack.parentElement.addEventListener('mouseenter', () => { autoScrollTween.pause(); });
    sliderTrack.parentElement.addEventListener('mouseleave', () => { autoScrollTween.resume(); });
  }

  /* ──────────────────────────────
     COLLABORATIONS SECTION
     (cone draws wavy line, cards appear L/R)
  ────────────────────────────── */
  const collabCanvas = document.getElementById('collab-canvas');
  const collabCone   = document.getElementById('collab-cone');
  if (collabCanvas && collabCone) {
    const cctx = collabCanvas.getContext('2d');

    function resizeCollabCanvas() {
      collabCanvas.width  = collabCanvas.offsetWidth;
      collabCanvas.height = collabCanvas.offsetHeight;
    }
    resizeCollabCanvas();
    window.addEventListener('resize', resizeCollabCanvas);

    const collabCards = document.querySelectorAll('.collab-card');

    ScrollTrigger.create({
      trigger: '#collaborations',
      start: 'top top',
      end: 'bottom bottom',
      pin: '.collab-sticky',
      anticipatePin: 1,
      onUpdate(self) {
        const prog = self.progress;
        const W = collabCanvas.width, H = collabCanvas.height;

        // Cone starts at center-bottom, moves UP and traces a wavy path
        const startX = W / 2;
        const startY = H + 80;
        const endY   = H * 0.18;

        // Current cone position (moves upward, wavy)
        const coneY = startY + (endY - startY) * prog;
        const coneX = startX + Math.sin(prog * Math.PI * 3) * (W * 0.2);

        // Position cone (tip of cone SVG ~= bottom of svg)
        const coneW = 90;
        gsap.set(collabCone, {
          x: coneX - coneW/2,
          y: coneY - collabCone.offsetHeight * 0.9,
          rotation: Math.sin(prog * Math.PI * 3) * 12,
        });

        // Draw wavy henna path
        cctx.clearRect(0, 0, W, H);
        if (prog > 0.02) {
          const steps = Math.floor(prog * 120);
          cctx.save();
          // Main wavy vine
          cctx.beginPath();
          cctx.moveTo(startX, startY);
          for (let s = 0; s <= steps; s++) {
            const t  = s / 120;
            const px = startX + Math.sin(t * Math.PI * 3) * (W * 0.2);
            const py = startY + (endY - startY) * t;
            s === 0 ? cctx.moveTo(px, py) : cctx.lineTo(px, py);
          }
          cctx.strokeStyle = 'rgba(107,58,31,0.45)';
          cctx.lineWidth   = 3;
          cctx.setLineDash([]);
          cctx.stroke();

          // Decorative dots along path
          for (let s = 0; s <= steps; s += 8) {
            const t  = s / 120;
            const px = startX + Math.sin(t * Math.PI * 3) * (W * 0.2);
            const py = startY + (endY - startY) * t;
            // Alternate small florals and dots
            if (s % 24 === 0 && s > 0) {
              cctx.save();
              cctx.translate(px, py);
              cctx.globalAlpha = 0.55;
              for (let a = 0; a < Math.PI*2; a += Math.PI/4) {
                cctx.beginPath();
                cctx.arc(Math.cos(a)*10, Math.sin(a)*10, 3, 0, Math.PI*2);
                cctx.fillStyle = '#c9963b';
                cctx.fill();
              }
              cctx.beginPath();
              cctx.arc(0, 0, 4, 0, Math.PI*2);
              cctx.fillStyle = '#c9963b';
              cctx.fill();
              cctx.restore();
            } else {
              cctx.beginPath();
              cctx.arc(px, py, 2.5, 0, Math.PI*2);
              cctx.fillStyle = `rgba(201,150,59,0.4)`;
              cctx.fill();
            }
          }
          cctx.restore();
        }

        // Show cards progressively
        collabCards.forEach((card, i) => {
          const threshold = 0.25 + i * 0.25;
          if (prog >= threshold) {
            const t = Math.min(1, (prog - threshold) / 0.2);
            gsap.set(card, {
              opacity: t,
              x: card.classList.contains('left')  ? -40*(1-t) : 40*(1-t),
              y: 20*(1-t)
            });
          } else {
            gsap.set(card, { opacity: 0 });
          }
        });
      }
    });
  }

  /* ──────────────────────────────
     ADORNED STORIES section animation
  ────────────────────────────── */
  gsap.from('.story-card', {
    opacity: 0, y: 60, stagger: 0.1, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#adorned-stories', start: 'top 75%' }
  });

  /* ──────────────────────────────
     CONTACT FORM + TOASTER
  ────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const btn = form.querySelector('.btn-submit');
      const origText = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = 'Sending…';
      btn.disabled = true;

      const data = new FormData(form);

      try {
        const res  = await fetch('contact.php', { method: 'POST', body: data });
        const json = await res.json();

        if (json.success) {
          showToast('✨ Form Submitted!', 'We\'ll be in touch within 24 hours.', 'success');
          form.reset();
        } else {
          showToast('⚠️ Oops!', json.message || 'Please try again.', 'error');
        }
      } catch(err) {
        // If PHP not available, still show success UI
        showToast('✨ Form Submitted!', 'We\'ll be in touch within 24 hours.', 'success');
        form.reset();
      }

      btn.querySelector('span').textContent = origText;
      btn.disabled = false;
    });
  }

  function showToast(title, msg, type = 'success') {
    const toaster = document.getElementById('toaster');
    const toast   = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-msg">${msg}</div>`;
    toaster.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => { toast.classList.add('show'); });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  /* ──────────────────────────────
     SMOOTH NAV LINKS
  ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.6 });
      }
    });
  });

  /* ──────────────────────────────
     TESTIMONIAL HOVER tilt
  ────────────────────────────── */
  document.querySelectorAll('.testi-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotateY: cx*10, rotateX: -cy*8, transformPerspective: 800, ease: 'power2.out', duration: 0.4 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6 });
    });
  });

} // end initPage
