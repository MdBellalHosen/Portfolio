/* ==========================================================================
   Md Bellal Hosen — Portfolio scripts
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Typed headline ---------- */
  const typedText = $('#typedText');
  const words = ['Software Engineer', 'AI Developer', 'UI/UX Designer', 'Graphic Designer', 'Creative Problem Solver'];
  if (typedText && !reducedMotion) {
    let wordIndex = 0, charIndex = words[0].length, deleting = true;
    const tick = () => {
      if (deleting) {
        charIndex--;
        if (charIndex <= 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; }
      } else {
        charIndex++;
      }
      typedText.textContent = words[wordIndex].slice(0, Math.max(charIndex, 0));
      let delay = deleting ? 45 : 85;
      if (!deleting && charIndex >= words[wordIndex].length) { deleting = true; delay = 1800; }
      if (!deleting && charIndex === 0) delay = 300;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- Theme ---------- */
  const THEMES = ['default', 'light', 'cyber', 'glass', 'neon'];
  const LIGHT_THEMES = ['light', 'glass'];
  const themeListeners = [];
  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'default';
    root.dataset.theme = theme;
    store.set('portfolio-theme', theme);
    $$('.theme-option').forEach((b) => b.classList.toggle('active', b.dataset.theme === theme));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#070b16';
    themeListeners.forEach((fn) => fn(theme));
  }
  applyTheme(store.get('portfolio-theme') || root.dataset.theme || 'default');

  $('#themeToggle')?.addEventListener('click', () => {
    const isLight = LIGHT_THEMES.includes(root.dataset.theme);
    applyTheme(isLight ? 'default' : 'light');
  });
  $$('.theme-option').forEach((btn) => btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    toast(`Theme: ${btn.textContent.trim()}`);
  }));

  /* ---------- Mobile menu ---------- */
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle?.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('open') && !e.target.closest('#topbar')) setMenu(false);
  });

  /* ---------- Scroll: progress, header shadow, back-to-top ---------- */
  const progress = $('#scrollProgress');
  const topbar = $('#topbar');
  const backToTop = $('#backToTop');
  let scrollTicking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    topbar?.classList.toggle('scrolled', y > 10);
    backToTop?.classList.toggle('show', y > innerHeight);
    scrollTicking = false;
  }
  addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  /* ---------- Active nav link (scrollspy) ---------- */
  const navMap = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = navMap.get(entry.target.id);
      if (!link) return;
      navMap.forEach((a) => a.classList.remove('active'));
      link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Reveal on scroll ----------
     threshold 0 + rootMargin so very tall sections (e.g. Projects on mobile)
     still reveal — a ratio threshold could never be reached on small screens. */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  function animateCount(el) {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); counterObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach((el) => counterObserver.observe(el));

  /* ---------- Skill rings ---------- */
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); ringObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  const skillRings = $$('.skill-ring');
  skillRings.forEach((r) => ringObserver.observe(r));

  function bindFilter(buttons, items, attrBtn, attrItem) {
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      buttons.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
      const value = btn.dataset[attrBtn];
      items.forEach((item) => {
        const show = value === 'all' || item.dataset[attrItem] === value;
        item.classList.toggle('hide', !show);
        if (show) { item.classList.remove('pop'); void item.offsetWidth; item.classList.add('pop'); }
      });
    }));
  }
  bindFilter($$('.skill-chip'), skillRings, 'skill', 'category');
  bindFilter($$('.project-filter button'), $$('.project-card'), 'filter', 'type');

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reducedMotion) {
    $$('[data-tilt]').forEach((card) => {
      const max = Number(card.dataset.tiltMax) || 8;
      let raf = null;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.classList.add('tilting');
          card.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
          card.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
          card.style.setProperty('--mx', `${px * 100}%`);
          card.style.setProperty('--my', `${py * 100}%`);
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Cursor glow ---------- */
  const glow = $('.cursor-glow');
  if (glow && finePointer && !reducedMotion) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, running = false;
    const loop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('pointermove', (e) => {
      document.body.classList.add('has-pointer');
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---------- Code showcase with lightweight highlighting ---------- */
  const snippets = {
    html: { file: 'index.html', code:
`<section class="hero">
  <h1>Hi, I'm Bellal</h1>
  <p>I build digital experiences.</p>
  <a href="#projects" class="btn">View work</a>
</section>` },
    css: { file: 'styles.css', code:
`.hero {
  display: grid;
  place-items: center;
  min-height: 100vh;
  /* brand gradient */
  background: linear-gradient(120deg, #22d3ee, #a78bfa);
}` },
    js: { file: 'script.js', code:
`const greet = (name) => \`Hello, \${name}!\`;

// say hi to every visitor
console.log(greet('Bellal'));` },
    python: { file: 'portfolio.py', code:
`def build_portfolio(name: str) -> str:
    # ship it with style
    return f"Hello {name}, your site is ready"

print(build_portfolio("Bellal"))` },
    sql: { file: 'queries.sql', code:
`-- find AI-minded developers
SELECT name, role
FROM developers
WHERE skills LIKE '%AI%'
ORDER BY experience DESC;` }
  };
  const KEYWORDS = {
    js: 'const|let|var|function|return|if|else|new|class|import|from|export|await|async',
    python: 'def|return|import|from|class|if|else|elif|for|in|print|str|None|True|False',
    sql: 'SELECT|FROM|WHERE|LIKE|ORDER|BY|DESC|ASC|INSERT|INTO|VALUES|JOIN|ON|AND|OR',
    css: 'display|place-items|min-height|background|color|grid|center',
    html: ''
  };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const COMMENTS = {
    html: '<!--[\\s\\S]*?-->',
    css: '\\/\\*[\\s\\S]*?\\*\\/',
    js: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/',
    python: '#[^\\n]*',
    sql: '--[^\\n]*'
  };
  function highlight(code, lang) {
    const parts = [
      `(${COMMENTS[lang]})`,                                                        // 1 comment
      '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',    // 2 string
      lang === 'html' ? '(<\\/?[a-zA-Z][\\w-]*|\\/?>)' : '((?!x)x)',                                                 // 3 html tag
      '(#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:vh|px|deg|%)?)',                         // 4 number / colour
      KEYWORDS[lang] ? `(\\b(?:${KEYWORDS[lang]})\\b)` : '((?!x)x)',                       // 5 keyword
      lang === 'html' ? '(\\b[a-z-]+(?==))' : '((?!x)x)'                                 // 6 attribute
    ];
    const re = new RegExp(parts.join('|'), 'g');
    const classes = ['', 'tk-c', 'tk-s', 'tk-t', 'tk-n', 'tk-k', 'tk-a'];
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      if (!m[0]) { re.lastIndex++; continue; }
      const group = m.findIndex((g, i) => i > 0 && g !== undefined);
      out += esc(code.slice(last, m.index)) + `<span class="${classes[group]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }

  const codeSnippet = $('#codeSnippet');
  const codeLabel = $('#codeLabel');
  const codeTabs = $$('.code-tab');
  let currentLang = 'html';
  function updateSnippet(lang) {
    currentLang = lang;
    const s = snippets[lang];
    codeSnippet.innerHTML = highlight(s.code, lang);
    codeSnippet.classList.remove('typing'); void codeSnippet.offsetWidth; codeSnippet.classList.add('typing');
    codeLabel.textContent = s.file;
    codeTabs.forEach((t) => { t.classList.toggle('active', t.dataset.lang === lang); t.setAttribute('aria-selected', String(t.dataset.lang === lang)); });
  }
  codeTabs.forEach((tab) => tab.addEventListener('click', () => updateSnippet(tab.dataset.lang)));
  if (codeSnippet) updateSnippet('html');
  $('#copyCode')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(snippets[currentLang].code); toast('Code copied to clipboard'); }
    catch { toast('Copy not available in this browser'); }
  });

  /* ---------- Dialogs (accessible open/close with focus return) ---------- */
  let lastFocus = null;
  function openDialog(el) {
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => el.classList.add('open'));
    setTimeout(() => $('.close-btn', el)?.focus(), 50);
  }
  function closeDialog(el) {
    if (!el || el.hidden) return;
    el.classList.remove('open');
    document.body.classList.remove('modal-open');
    setTimeout(() => { el.hidden = true; }, 300);
    lastFocus?.focus?.();
  }
  $$('.overlay').forEach((ov) => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov || e.target.closest('[data-close]')) closeDialog(ov);
    });
    ov.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button, input, textarea', ov).filter((x) => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.overlay').forEach((ov) => closeDialog(ov));
      if (navLinks?.classList.contains('open')) setMenu(false);
    }
  });
  $('#hireHeader')?.addEventListener('click', () => openDialog($('#contactOverlay')));

  /* ---------- Project details modal ---------- */
  const projectDetails = {
    ai: { title: 'AI Assistant Platform', sections: [
      ['Overview', 'A smart assistant focused on productivity.'],
      ['Problem', 'Users needed faster access to documents and tasks.'],
      ['Solution', 'Built a conversational workspace with automation and smooth UI.'],
      ['Challenges', 'Balancing speed with accuracy.'],
      ['Result', 'Improved daily workflow and engagement.']] },
    ecommerce: { title: 'Modern E-commerce', sections: [
      ['Overview', 'A polished storefront with fast checkout and strong product storytelling.'],
      ['Problem', 'Conversion rate and trust were limiting growth.'],
      ['Solution', 'Redesigned the funnel and introduced richer product presentation.'],
      ['Result', 'Smoother browsing and better customer retention.']] },
    design: { title: 'Creative Design System', sections: [
      ['Overview', 'A scalable UI design system for launch-ready interfaces.'],
      ['Problem', 'Teams needed consistency across products.'],
      ['Solution', 'Created reusable components, tokens, and documentation.'],
      ['Result', 'Faster development and a stronger brand presence.']] }
  };
  const modal = $('#projectModal');
  function openProject(card) {
    const key = card.dataset.project;
    const title = $('h3', card).textContent;
    const desc = $('p', card).textContent;
    const detail = projectDetails[key];
    const sections = detail ? detail.sections : [['Overview', desc]];
    $('#modalTitle').textContent = detail ? detail.title : title;
    $('#modalBadge').textContent = $('.project-badge', card).textContent;
    $('#modalBadge').style.setProperty('--hue', card.style.getPropertyValue('--hue'));
    const body = $('#modalBody');
    body.innerHTML = '';
    const dl = document.createElement('dl');
    sections.forEach(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      dl.append(dt, dd);
    });
    body.appendChild(dl);
    $('#modalTags').innerHTML = $('.project-tags', card).innerHTML;
    const link = $('.project-link', card);
    $('#modalLink').href = link ? link.href : '#';
    openDialog(modal);
  }
  $$('.project-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.project-link')) return; // let the external link work normally
      openProject(card);
    });
  });

  /* ---------- Testimonials carousel ---------- */
  const slides = $$('.testimonial');
  const dotsWrap = $('#tDots');
  let tIndex = 0, tTimer = null;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    b.addEventListener('click', () => { goTo(i); restart(); });
    dotsWrap?.appendChild(b);
    return b;
  });
  function goTo(i) {
    if (!slides.length) return;
    const prev = slides[tIndex];
    tIndex = (i + slides.length) % slides.length;
    slides.forEach((s) => s.classList.remove('active', 'leaving'));
    if (prev !== slides[tIndex]) { prev.classList.add('leaving'); setTimeout(() => prev.classList.remove('leaving'), 600); }
    slides[tIndex].classList.add('active');
    dots.forEach((d, j) => d.classList.toggle('active', j === tIndex));
  }
  function restart() { clearInterval(tTimer); if (!reducedMotion) tTimer = setInterval(() => goTo(tIndex + 1), 5000); }
  $('#tPrev')?.addEventListener('click', () => { goTo(tIndex - 1); restart(); });
  $('#tNext')?.addEventListener('click', () => { goTo(tIndex + 1); restart(); });
  const carousel = $('.testimonial-carousel');
  carousel?.addEventListener('mouseenter', () => clearInterval(tTimer));
  carousel?.addEventListener('mouseleave', restart);
  let touchX = null;
  carousel?.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  carousel?.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { goTo(tIndex + (dx < 0 ? 1 : -1)); restart(); }
    touchX = null;
  });
  goTo(0); restart();

  /* ---------- AI assistant (rule-based) ---------- */
  const chatMessages = $('#chatMessages');
  const chatInput = $('#chatInput');
  function appendMessage(text, type = 'bot') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }
  const intents = [
    [/hi|hello|hey|salam|assalam/, 'Hello! 👋 I can tell you about Bellal’s projects, skills, education, experience, or how to reach him.'],
    [/about|who|bellal|yourself/, 'Md Bellal Hosen is a software engineer, AI developer and UI/UX designer from Dhaka, studying CSE at East West University. He builds AI-assisted apps, UI systems and interactive experiences.'],
    [/project|work|portfolio|demo/, 'Featured work includes an AI Productivity Hub, a modern e-commerce store, a creative agency site, a finance dashboard and more — see the Projects section and click any card for details.'],
    [/skill|stack|tech|language|react|node|python/, 'Frontend: React, Next.js, Vue · Backend: Node, Express, Laravel, Python, Java · Databases: MongoDB, MySQL, PostgreSQL, Firebase, Supabase · Design: Figma, Photoshop, Illustrator · Animation: Three.js, GSAP.'],
    [/resume|cv/, 'You can download the resume from the hero section or the Resume card right here in the Playground.'],
    [/educat|study|university|degree/, 'He is pursuing a BSc in Computer Science & Engineering at East West University, with a focus on AI and software engineering.'],
    [/experience|intern|freelance|job/, 'Experience spans an internship, freelance client work (websites, UI systems, branding), AI research and open-source contributions.'],
    [/contact|email|phone|hire|reach|whatsapp/, 'Email bellam546@gmail.com or call/WhatsApp +880 1855-087421. You can also use the contact form above.'],
    [/price|rate|cost|budget/, 'Rates depend on scope — send a short brief via the contact form and Bellal will reply with an estimate.'],
    [/thank/, 'You’re welcome! 😊 Anything else you’d like to know?']
  ];
  function answerPrompt(text) {
    const lower = text.toLowerCase();
    const hit = intents.find(([re]) => re.test(lower));
    return hit ? hit[1] : 'I can help with projects, skills, education, experience, resume, and contact details. Try one of the quick buttons!';
  }
  function ask(text) {
    if (!text) return;
    appendMessage(text, 'user');
    const typing = document.createElement('div');
    typing.className = 'message bot typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => { typing.remove(); appendMessage(answerPrompt(text)); }, 650);
  }
  $('#chatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = chatInput.value.trim();
    chatInput.value = '';
    ask(val);
  });
  $$('.chip-btn').forEach((b) => b.addEventListener('click', () => ask(b.dataset.prompt)));

  /* ---------- Typing sprint ---------- */
  const target = $('#gameTarget')?.textContent || 'I build digital experiences.';
  const gameInput = $('#gameInput');
  const gameStats = $('#gameStats');
  const gameResult = $('#gameResult');
  let gStart = 0, gTimer = null, gDone = false;
  function gReset() {
    clearInterval(gTimer); gStart = 0; gDone = false;
    gameInput.value = ''; gameInput.disabled = false;
    gameStats.textContent = '0.0s · 0 WPM';
    gameResult.textContent = ''; gameResult.className = '';
  }
  function gUpdate() {
    const secs = (performance.now() - gStart) / 1000;
    const wpm = secs > 0 ? Math.round((gameInput.value.length / 5) / (secs / 60)) : 0;
    gameStats.textContent = `${secs.toFixed(1)}s · ${wpm} WPM`;
    return { secs, wpm };
  }
  gameInput?.addEventListener('input', () => {
    if (gDone) return;
    if (!gStart) { gStart = performance.now(); gTimer = setInterval(gUpdate, 100); }
    const val = gameInput.value;
    if (target.startsWith(val)) { gameResult.textContent = ''; gameResult.className = ''; }
    else { gameResult.textContent = 'Typo — fix it to continue.'; gameResult.className = 'err'; }
    if (val === target) {
      clearInterval(gTimer); gDone = true;
      const { secs, wpm } = gUpdate();
      gameResult.textContent = `Perfect! ${secs.toFixed(1)}s at ${wpm} WPM 🎉`;
      gameResult.className = 'win';
      const best = Number(store.get('typing-best') || 0);
      if (wpm > best) { store.set('typing-best', String(wpm)); toast(`New personal best: ${wpm} WPM`); }
    }
  });
  $('#gameReset')?.addEventListener('click', () => { gReset(); gameInput.focus(); });

  /* ---------- Contact form → opens the visitor's email app ---------- */
  const form = $('#contactForm');
  const note = $('#formNote');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    let ok = true;
    $$('.field', form).forEach((f) => f.classList.remove('invalid'));
    const fail = (fieldName) => { ok = false; form.elements[fieldName].closest('.field').classList.add('invalid'); };
    if (!name) fail('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('email');
    if (!message) fail('message');
    if (!ok) {
      note.textContent = 'Please fill in your name, a valid email and a message.';
      note.className = 'form-note error';
      $('.field.invalid input, .field.invalid textarea', form)?.focus();
      return;
    }
    const body = `${message}\n\n— ${name} (${email})`;
    location.href = `mailto:bellam546@gmail.com?subject=${encodeURIComponent(subject || `Portfolio inquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Opening your email app… Thanks for reaching out!';
    note.className = 'form-note ok';
    form.reset();
  });
  form?.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('invalid'));

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ==========================================================================
     Three.js hero scene
     ========================================================================== */
  function initHero3D() {
    const canvas = $('#heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { return; } // WebGL unavailable — the page still looks complete without it

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const css = (v) => getComputedStyle(root).getPropertyValue(v).trim();
    const accent = new THREE.Color(css('--accent') || '#22d3ee');
    const accent2 = new THREE.Color(css('--accent-2') || '#a78bfa');

    const group = new THREE.Group();
    scene.add(group);

    // Glossy core
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.85, roughness: 0.2, emissive: accent2.clone().multiplyScalar(0.15) });
    const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.36, 220, 32, 2, 3), coreMat);
    group.add(core);

    // Wireframe cage
    const cageMat = new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.22 });
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), cageMat);
    group.add(cage);

    // Orbit rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.4 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: accent2, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.012, 8, 160), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.01, 8, 160), ringMat2);
    ring1.rotation.x = Math.PI / 2.4; ring2.rotation.x = Math.PI / 1.7; ring2.rotation.y = 0.5;
    group.add(ring1, ring2);

    // Small orbiting spheres
    const moonMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.8 });
    const moons = [0, 1, 2].map((i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.08 + i * 0.03, 16, 16), moonMat);
      group.add(m);
      return m;
    });

    // Particle field
    const COUNT = innerWidth < 700 ? 500 : 1100;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 4 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: accent, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const l1 = new THREE.PointLight(accent, 2.2, 30); l1.position.set(5, 3, 5);
    const l2 = new THREE.PointLight(accent2, 2.2, 30); l2.position.set(-5, -3, 4);
    const l3 = new THREE.DirectionalLight(0xffffff, 0.6); l3.position.set(0, 5, 5);
    scene.add(l1, l2, l3);

    // Theme sync
    themeListeners.push(() => {
      const a = new THREE.Color(css('--accent')), b = new THREE.Color(css('--accent-2'));
      const light = LIGHT_THEMES.includes(root.dataset.theme);
      cageMat.color.copy(a); ringMat1.color.copy(a); ringMat2.color.copy(b);
      moonMat.color.copy(a); moonMat.emissive.copy(a);
      pMat.color.copy(a); l1.color.copy(a); l2.color.copy(b);
      coreMat.color.set(light ? 0xe2e8f0 : 0x111827);
      coreMat.emissive.copy(b).multiplyScalar(light ? 0.05 : 0.15);
      cageMat.opacity = light ? 0.3 : 0.22;
      pMat.opacity = light ? 0.5 : 0.7;
    });
    themeListeners[themeListeners.length - 1]();

    // Layout: sit behind the photo card on desktop, centred on mobile
    function layout() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w > 900;
      const visibleW = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
      group.position.x = wide ? visibleW * 0.25 : 0;
      const visibleH = visibleW / camera.aspect;
      group.position.y = wide ? 0 : -visibleH * 0.3; // sit behind the photo card when stacked
      group.scale.setScalar(wide ? 1 : Math.min(1, w / 520));
    }
    layout();
    addEventListener('resize', layout);

    // Pointer parallax
    let mx = 0, my = 0;
    addEventListener('pointermove', (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    // Only render while visible
    let visible = true, rafId = null;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !rafId) rafId = requestAnimationFrame(frame);
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible && !rafId) rafId = requestAnimationFrame(frame);
    });

    const clock = new THREE.Clock();
    function frame() {
      rafId = null;
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      const scroll = Math.min(1, scrollY / innerHeight);
      const speed = reducedMotion ? 0 : 1;

      core.rotation.x = t * 0.25 * speed + scroll * 1.5;
      core.rotation.y = t * 0.35 * speed;
      cage.rotation.y = -t * 0.12 * speed;
      cage.rotation.z = t * 0.08 * speed;
      ring1.rotation.z = t * 0.2 * speed;
      ring2.rotation.z = -t * 0.15 * speed;
      particles.rotation.y = t * 0.02 * speed + mx * 0.05;
      particles.rotation.x = my * 0.03;
      moons.forEach((m, i) => {
        const a = t * (0.6 + i * 0.25) * speed + i * 2.1;
        const r = 2.9 + i * 0.35;
        m.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.8, Math.sin(a) * r);
      });

      // Ease group towards pointer for a 3D parallax feel
      group.rotation.y += ((mx * 0.35) - group.rotation.y) * 0.05;
      group.rotation.x += ((my * 0.25) - group.rotation.x) * 0.05;
      camera.position.y = -scroll * 1.2;
      camera.lookAt(0, camera.position.y * 0.5, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    canvas.classList.add('ready');
  }

  if (typeof THREE !== 'undefined') initHero3D();
  else addEventListener('load', initHero3D, { once: true });
})();
