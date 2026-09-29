/* =====================================================================
   PORTAFOLIO · ANDREY RICAURTE — comportamiento de la página
   (idioma ES/EN, tema oscuro/claro, menú móvil, diagrama, filtros)
   Normalmente NO necesitas editar este archivo.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Guardado seguro (algunos navegadores bloquean localStorage) */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* nada */ } }
  };

  /* ------------------------------ Idioma ------------------------------ */
  var lang = store.get('lang');
  if (!lang || !I18N[lang]) {
    lang = (navigator.language || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  }

  function t(key) {
    if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
    if (I18N.es[key] !== undefined) return I18N.es[key];
    return key;
  }

  var cap = $('#figCap');
  var capKey = 'fig_hint';
  function setCaption(key) { capKey = key; cap.textContent = t(key); }

  var firstRender = true;
  function applyLang(l) {
    lang = l;
    root.lang = l;
    store.set('lang', l);

    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });

    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });

    document.title = t('meta_title');
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', t('meta_desc'));

    $$('.seg [data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
    });

    setCaption(capKey);

    /* pequeño fundido al cambiar de idioma (no en la primera carga) */
    var mainEl = $('main');
    if (!firstRender && mainEl) {
      mainEl.classList.remove('swap'); void mainEl.offsetWidth; mainEl.classList.add('swap');
    }
    firstRender = false;
  }

  $$('.seg [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });

  /* ------------------------------ Tema ------------------------------ */
  var themeMeta = $('meta[name="theme-color"]');
  function syncThemeColor() {
    if (themeMeta) themeMeta.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#f4f7ff' : '#0e0e10');
  }
  syncThemeColor();

  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    setTimeout(function () { root.classList.remove('theme-anim'); }, 650);
    syncThemeColor();
  });

  /* ------------------------------ Menú móvil ------------------------------ */
  var burger = $('#burger');
  var mnav = $('#mobileNav');
  function closeMenu() { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = mnav.hidden;
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', mnav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) closeMenu(); });

  /* ------------------------------ Diagrama interactivo ------------------------------ */
  var nodes = $$('.node');
  function clearNodes() { nodes.forEach(function (n) { n.classList.remove('is-active'); }); }
  function activate(n) {
    clearNodes();
    n.classList.add('is-active');
    setCaption('cap_' + n.getAttribute('data-node'));
  }
  function reset() { clearNodes(); setCaption('fig_hint'); }

  nodes.forEach(function (n) {
    n.addEventListener('mouseenter', function () { activate(n); });
    n.addEventListener('focus', function () { activate(n); });
    n.addEventListener('click', function () { activate(n); });
    n.addEventListener('mouseleave', reset);
    n.addEventListener('blur', reset);
    n.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(n); }
    });
  });

  /* Si la persona prefiere menos movimiento, se detienen los "datos" que viajan */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var svg = $('#arch');
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
    $$('.packet').forEach(function (p) { p.remove(); });
  }

  /* ------------------------------ Filtro de proyectos ------------------------------ */
  var filterBtns = $$('.filters [data-filter]');
  var projects = $$('.proj');
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(/\s+/);
        p.hidden = !(f === 'all' || cats.indexOf(f) !== -1);
      });
    });
  });

  /* ------------------------------ Copiar correo ------------------------------ */
  var toast = $('#toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  var copyBtn = $('#copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      function done() { showToast(t('c_copied')); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* nada */ }
        document.body.removeChild(ta);
      }
    });
  }

  /* ------------------------------ Formulario de contacto (abre el correo) ------------------------------ */
  var form = $('#contactForm');
  if (form && copyBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = copyBtn.getAttribute('data-copy');
      var name = form.elements.name.value.trim();
      var msg = form.elements.message.value.trim();
      var body = msg + '\n\n' + name;
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(t('form_subject')) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ------------------------------ Sección activa en el menú ------------------------------ */
  var links = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) {
            a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id));
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------ Movimiento ------------------------------ */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Aparición al hacer scroll. Esta lista debe coincidir con la de styles.css (sección "Aparición al hacer scroll"). */
  var RV = '.sheet__head, .about__text, .photo, .offer__lead, .filters, .certs h3, .contact__lead, .contact__text, .cform, .quote, ' +
           '.offer__item, .layer, .proj, .certs li, .tl__item, .contact__list li, .tl';
  var targets = $$(RV);

  /* orden de escalonado (--i) dentro de cada contenedor y de cada grupo de fichas (--j) */
  var counts = [];
  targets.forEach(function (el) {
    var par = el.parentNode, rec = null;
    for (var k = 0; k < counts.length; k++) { if (counts[k][0] === par) { rec = counts[k]; break; } }
    if (!rec) { rec = [par, 0]; counts.push(rec); }
    el.style.setProperty('--i', Math.min(rec[1]++, 7));
  });
  $$('.chips').forEach(function (ul) {
    $$('li', ul).forEach(function (li, n) { li.style.setProperty('--j', n); });
  });

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    targets.forEach(function (el) { rio.observe(el); });
  }

  /* Luz que sigue al cursor sobre las tarjetas */
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.offer__item, .proj');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* Cruz de coordenadas (solo con mouse y sin "reducir movimiento") */
  var hero = $('#hero'), xh = $('#xhair'), xt = $('#xhT');
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (hero && xh && fine && !reduce) {
    var raf = 0, px = 0, py = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        xh.style.setProperty('--x', px + 'px');
        xh.style.setProperty('--y', py + 'px');
        xt.textContent = 'X ' + Math.round(px) + '   Y ' + Math.round(py);
        xh.classList.add('on');
      });
    });
    hero.addEventListener('pointerleave', function () { xh.classList.remove('on'); });
  }

  /* Barra de progreso: solo hace falta JavaScript si el navegador no soporta la versión CSS */
  var bar = $('#progress');
  if (bar && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))) {
    var tick = 0;
    var upd = function () {
      tick = 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    };
    window.addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  /* ------------------------------ Arranque ------------------------------ */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  applyLang(lang);
})();

/* =====================================================================
   TERMINAL ANIMADA — escribe código Python carácter a carácter
   ===================================================================== */
(function () {
  'use strict';
  var termBody = document.getElementById('termBody');
  if (!termBody) return;

  var LINES = [
    { type: 'prompt', text: '' },
    { type: 'cmd',    text: '# Portafolio de Andrey Ricaurte — CampusLands 2026' },
    { type: 'blank' },
    { type: 'prompt', text: '' },
    { type: 'kw',     text: 'class ' },
    { type: 'fn',     text: 'Developer' },
    { type: 'cmd',    text: ':' },
    { type: 'kw',     text: '    def ' },
    { type: 'fn',     text: '__init__' },
    { type: 'cmd',    text: '(self):' },
    { type: 'str',    text: '        self.name   ' },
    { type: 'cmd',    text: '= ' },
    { type: 'str',    text: '"Andrey Ricaurte"' },
    { type: 'nl' },
    { type: 'str',    text: '        self.stack  ' },
    { type: 'cmd',    text: '= [' },
    { type: 'str',    text: '"Python"' },
    { type: 'cmd',    text: ', ' },
    { type: 'str',    text: '"Java"' },
    { type: 'cmd',    text: ', ' },
    { type: 'str',    text: '"SQL"' },
    { type: 'cmd',    text: ', ' },
    { type: 'str',    text: '"JavaScript"' },
    { type: 'cmd',    text: ']' },
    { type: 'nl' },
    { type: 'str',    text: '        self.role   ' },
    { type: 'cmd',    text: '= ' },
    { type: 'str',    text: '"Software Developer"' },
    { type: 'nl' },
    { type: 'str',    text: '        self.status ' },
    { type: 'cmd',    text: '= ' },
    { type: 'str',    text: '"Disponible"' },
    { type: 'nl' },
    { type: 'blank' },
    { type: 'kw',     text: '    def ' },
    { type: 'fn',     text: 'build' },
    { type: 'cmd',    text: '(self, idea):' },
    { type: 'nl' },
    { type: 'comment',text: '        # Convierte ideas en soluciones reales' },
    { type: 'nl' },
    { type: 'kw',     text: '        return ' },
    { type: 'fn',     text: 'Solution' },
    { type: 'cmd',    text: '(idea, stack=self.stack)' },
    { type: 'nl' },
    { type: 'blank' },
    { type: 'prompt', text: '' },
    { type: 'cmd',    text: 'dev = Developer()' },
    { type: 'nl' },
    { type: 'prompt', text: '' },
    { type: 'cmd',    text: 'print(dev.name, dev.status)' },
    { type: 'nl' },
    { type: 'out',    text: 'Andrey Ricaurte  Disponible ✓' },
    { type: 'nl' },
    { type: 'prompt', text: '' },
    { type: 'cmd',    text: 'dev.build("Tu próximo proyecto")' },
    { type: 'nl' },
    { type: 'ok',     text: '<Solution ready — hablemos 🚀>' },
    { type: 'nl' },
  ];

  /* Construye el HTML de una línea */
  function spanClass(type) {
    return {
      prompt: 'term-prompt', cmd: 'term-cmd', kw: 'term-kw',
      str: 'term-str', fn: 'term-fn', num: 'term-num',
      comment: 'term-comment', out: 'term-out', ok: 'term-ok'
    }[type] || 'term-cmd';
  }

  /* Escritura carácter a carácter */
  var charsPerFrame = 2;
  var frameDelay = 28;         /* ms entre frames */
  var pauseAfterNl = 90;       /* ms de pausa entre líneas */
  var pauseBlank = 220;

  var cursor = document.createElement('span');
  cursor.className = 'term-cursor';

  var currentLine = null;
  var lineIdx = 0, charIdx = 0;
  var isPaused = false;

  function getCurrentSpan() {
    if (!currentLine) {
      currentLine = document.createElement('span');
      currentLine.className = 'term-line';
      termBody.appendChild(currentLine);
    }
    return currentLine;
  }

  function appendToLine(cls, ch) {
    var line = getCurrentSpan();
    /* reuse last child if same class */
    var last = line.lastChild;
    if (last && last.nodeType === 1 && last.className === cls) {
      last.textContent += ch;
    } else {
      var s = document.createElement('span');
      s.className = cls;
      s.textContent = ch;
      line.appendChild(s);
    }
    /* keep cursor at end */
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    line.appendChild(cursor);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function nextStep() {
    if (lineIdx >= LINES.length) {
      /* reset y vuelve a empezar después de 2.5 s */
      setTimeout(function () {
        termBody.innerHTML = '';
        currentLine = null; lineIdx = 0; charIdx = 0;
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        schedule();
      }, 2500);
      return;
    }

    var seg = LINES[lineIdx];

    if (seg.type === 'nl') {
      currentLine = null;
      lineIdx++; charIdx = 0;
      setTimeout(schedule, pauseAfterNl);
      return;
    }
    if (seg.type === 'blank') {
      var blankLine = document.createElement('span');
      blankLine.className = 'term-line';
      blankLine.innerHTML = '&nbsp;';
      termBody.appendChild(blankLine);
      currentLine = null; lineIdx++; charIdx = 0;
      setTimeout(schedule, pauseBlank);
      return;
    }
    if (seg.type === 'prompt') {
      getCurrentSpan();
      var ps = document.createElement('span');
      ps.className = 'term-prompt';
      ps.textContent = '>>> ';
      getCurrentSpan().appendChild(ps);
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      getCurrentSpan().appendChild(cursor);
      lineIdx++; charIdx = 0;
      setTimeout(schedule, 120);
      return;
    }

    /* char-by-char */
    var txt = seg.text;
    var cls = spanClass(seg.type);
    for (var i = 0; i < charsPerFrame && charIdx < txt.length; i++, charIdx++) {
      appendToLine(cls, txt[charIdx]);
    }
    if (charIdx >= txt.length) {
      lineIdx++; charIdx = 0;
      setTimeout(schedule, frameDelay);
    } else {
      setTimeout(schedule, frameDelay);
    }
  }

  function schedule() { requestAnimationFrame(nextStep); }

  /* Arranca cuando la terminal entra en el viewport */
  if ('IntersectionObserver' in window) {
    var termObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { termObs.disconnect(); schedule(); }
    }, { threshold: 0.2 });
    termObs.observe(document.getElementById('terminal'));
  } else {
    schedule();
  }
})();

/* =====================================================================
   CARNET ARRASTRABLE + FLIP AL HACER CLIC + BRILLO
   ===================================================================== */
(function () {
  'use strict';
  var card = document.getElementById('devCard');
  var inner = document.getElementById('devCardInner');
  if (!card || !inner) return;

  var isFlipped = false;
  var isDragging = false;
  var startX, startY, startLeft, startTop;
  var ox = 0, oy = 0;   /* offset de posición acumulada */

  /* --- Flip al clic (sólo si no fue un drag) --- */
  var didDrag = false;
  card.addEventListener('click', function (e) {
    if (didDrag) return;
    isFlipped = !isFlipped;
    inner.classList.toggle('is-flipped', isFlipped);
  });

  /* --- Brillo que sigue al puntero --- */
  card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    var sx = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
    var sy = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
    card.style.setProperty('--sx', sx);
    card.style.setProperty('--sy', sy);
  });

  /* --- Inclinación 3D al hover --- */
  card.addEventListener('mousemove', function (e) {
    if (isDragging) return;
    var r = card.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var rx = ((e.clientY - cy) / r.height * 2) * -14; /* deg */
    var ry = ((e.clientX - cx) / r.width * 2) * 14;
    inner.style.transform = (isFlipped ? 'rotateY(180deg) ' : '') +
      'rotateX(' + rx + 'deg) rotateY(' + (isFlipped ? 180 + ry : ry) + 'deg)';
  });
  card.addEventListener('mouseleave', function () {
    if (isDragging) return;
    inner.style.transform = isFlipped ? 'rotateY(180deg)' : '';
  });

  /* --- Drag con pointer events --- */
  card.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    didDrag = false;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = ox;
    startTop = oy;
    card.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  card.addEventListener('pointermove', function (e) {
    if (!card.hasPointerCapture || !card.hasPointerCapture(e.pointerId)) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      if (!isDragging) {
        isDragging = true; didDrag = true;
        card.classList.add('is-dragging');
      }
    }
    if (!isDragging) return;
    ox = startLeft + dx;
    oy = startTop + dy;
    card.style.transform = 'translate(' + ox + 'px, ' + oy + 'px)';
    e.preventDefault();
  });

  card.addEventListener('pointerup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('is-dragging');
    /* rebote suave de vuelta al centro */
    card.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
    card.style.transform = 'translate(0,0)';
    ox = 0; oy = 0;
    setTimeout(function () { card.style.transition = ''; }, 650);
  });

  card.addEventListener('pointercancel', function () {
    isDragging = false;
    card.classList.remove('is-dragging');
    card.style.transform = 'translate(0,0)';
    ox = 0; oy = 0;
  });
})();

/* =====================================================================
   CANVAS DE PARTÍCULAS DE CÓDIGO EN EL HERO
   ===================================================================== */
(function () {
  'use strict';
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var CHARS = '01{}[]()<>;:=+-*/&|!#abcdef0123456789ABCDEFxyzpqr'.split('');
  var particles = [];
  var W, H;

  function resize() {
    var hero = document.getElementById('hero');
    W = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.char = CHARS[Math.floor(Math.random() * CHARS.length)];
    this.size = 10 + Math.random() * 8;
    this.opacity = 0.04 + Math.random() * 0.12;
    this.speed = 0.2 + Math.random() * 0.5;
    this.drift = (Math.random() - 0.5) * 0.3;
    this.life = 0;
    this.maxLife = 120 + Math.random() * 200;
  };
  Particle.prototype.update = function () {
    this.y -= this.speed;
    this.x += this.drift;
    this.life++;
    if (this.life > this.maxLife || this.y < -20 || this.x < -20 || this.x > W + 20) {
      this.reset();
      this.y = H + 10;
    }
  };
  Particle.prototype.draw = function () {
    var fade = Math.min(this.life / 30, 1, (this.maxLife - this.life) / 30);
    ctx.globalAlpha = this.opacity * fade;
    ctx.fillStyle = '#ffc93c';
    ctx.font = this.size + 'px "Courier New", monospace';
    ctx.fillText(this.char, this.x, this.y);
  };

  /* Inicializar */
  resize();
  window.addEventListener('resize', resize, { passive: true });

  var N = Math.min(60, Math.floor(W * H / 18000));
  for (var i = 0; i < N; i++) {
    var p = new Particle();
    p.y = Math.random() * H; /* distribuir desde el principio */
    particles.push(p);
  }

  var rafId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var j = 0; j < particles.length; j++) {
      particles[j].update();
      particles[j].draw();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(loop);
  }

  /* Pausa cuando no está visible */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { if (!rafId) loop(); }
      else { cancelAnimationFrame(rafId); rafId = 0; }
    }, { threshold: 0 });
    io.observe(canvas);
  } else {
    loop();
  }
})();

/* =====================================================================
   TYPING DEL ROL EN EL HERO
   ===================================================================== */
(function () {
  'use strict';
  var el = document.getElementById('roleTyped');
  if (!el) return;

  /* Las frases se leen del i18n si está disponible, o se usan estas */
  var PHRASES = [
    'Desarrollador de software',
    'Backend & Frontend',
    'Arquitectura de software',
    'Bases de datos SQL',
    'Aprendiz de CampusLands'
  ];

  var phraseIdx = 0, charIdx = 0, deleting = false;
  var SPEED_TYPE = 65, SPEED_DEL = 30, PAUSE_FULL = 2200, PAUSE_EMPTY = 500;

  function tick() {
    var phrase = PHRASES[phraseIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx >= phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx <= 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  /* Arrancar después de que entra el nombre */
  setTimeout(tick, 1600);
})();

/* =====================================================================
   REPRODUCTOR DE MÚSICA FLOTANTE
   ===================================================================== */
(function () {
  'use strict';
  var player   = document.getElementById('musicPlayer');
  var audio    = document.getElementById('heroAudio');
  var playBtn  = document.getElementById('playBtn');
  var volBtn   = document.getElementById('volBtn');
  var vinyl    = document.getElementById('vinyl');
  var fill     = document.getElementById('trackFill');
  var timeEl   = document.getElementById('trackTime');
  var durEl    = document.getElementById('trackDur');
  var progress = document.getElementById('trackProgress');
  var toggle   = document.getElementById('mpToggle');
  var eq       = document.getElementById('eqBars');
  if (!player || !audio) return;

  /* Mostrar el reproductor tras 2 s de carga */
  setTimeout(function () { player.classList.add('is-visible'); }, 2000);

  /* Colapsar / expandir */
  var collapsed = false;
  if (toggle) {
    toggle.addEventListener('click', function () {
      collapsed = !collapsed;
      player.classList.toggle('is-collapsed', collapsed);
      toggle.textContent = collapsed ? '+' : '\u2212';
    });
  }

  /* Formato de tiempo mm:ss */
  function fmt(s) {
    s = Math.floor(s || 0);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  /* Botón play/pause */
  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(function () { /* autoplay bloqueado */ });
    } else {
      audio.pause();
    }
  }
  if (playBtn) playBtn.addEventListener('click', togglePlay);

  audio.addEventListener('play', function () {
    player.classList.add('is-playing');
    if (vinyl) vinyl.classList.add('is-spinning');
  });
  audio.addEventListener('pause', function () {
    player.classList.remove('is-playing');
    if (vinyl) vinyl.classList.remove('is-spinning');
  });

  /* Duración */
  audio.addEventListener('loadedmetadata', function () {
    if (durEl) durEl.textContent = fmt(audio.duration);
  });

  /* Progreso */
  audio.addEventListener('timeupdate', function () {
    var pct = audio.duration ? (audio.currentTime / audio.duration * 100) : 0;
    if (fill) fill.style.width = pct + '%';
    if (timeEl) timeEl.textContent = fmt(audio.currentTime);
    if (progress) progress.setAttribute('aria-valuenow', Math.round(pct));
  });

  /* Clic en la barra para saltar */
  if (progress) {
    progress.addEventListener('click', function (e) {
      var r = progress.getBoundingClientRect();
      var pct = (e.clientX - r.left) / r.width;
      if (audio.duration) audio.currentTime = pct * audio.duration;
    });
  }

  /* Botón de volumen / mute */
  if (volBtn) {
    volBtn.addEventListener('click', function () {
      audio.muted = !audio.muted;
      volBtn.style.opacity = audio.muted ? '.4' : '1';
    });
  }

  /* Nombre de la pista desde el src */
  var src = audio.src || '';
  var name = src.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  var titleEl = document.getElementById('trackTitle');
  if (titleEl && name && name !== 'track') {
    titleEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  }
})();

/* =====================================================================
   TILT 3D SUAVE — proyectos, servicios, certificados
   Máx. 8° de inclinación. Se resetea al salir del cursor.
   ===================================================================== */
(function () {
  'use strict';

  /* Omitir si el usuario prefiere menos movimiento */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* Solo dispositivos con puntero fino (mouse) */
  if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;

  var MAX_TILT   = 8;     /* grados máximos de inclinación */
  var MAX_SCALE  = 1.03;  /* escala al hacer hover */
  var PERSP      = 900;   /* perspectiva en px */

  /* Selectores de tarjetas a animar */
  var SELECTORS = '.proj, .offer__item, .certs li';

  function applyTilt(card, e) {
    var r = card.getBoundingClientRect();
    /* Posición relativa al centro de la tarjeta, de -1 a 1 */
    var cx = (e.clientX - r.left)  / r.width  - 0.5;
    var cy = (e.clientY - r.top)   / r.height - 0.5;

    /* rotateY positivo → lado derecho se aleja */
    var ry =  cx * MAX_TILT * 2;
    /* rotateX positivo → borde superior se acerca */
    var rx = -cy * MAX_TILT * 2;

    card.classList.remove('tilt-reset');
    card.style.transform =
      'perspective(' + PERSP + 'px) ' +
      'rotateX(' + rx.toFixed(2) + 'deg) ' +
      'rotateY(' + ry.toFixed(2) + 'deg) ' +
      'scale3d(' + MAX_SCALE + ',' + MAX_SCALE + ',1)';

    /* Actualizar la posición del brillo */
    card.style.setProperty('--mx', ((cx + 0.5) * 100).toFixed(1) + '%');
    card.style.setProperty('--my', ((cy + 0.5) * 100).toFixed(1) + '%');
  }

  function resetTilt(card) {
    card.classList.add('tilt-reset');
    card.style.transform =
      'perspective(' + PERSP + 'px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }

  /* Usar RAF para no saturar el hilo principal */
  var pending = null;

  function onMove(e) {
    var card = e.currentTarget;
    if (pending) { cancelAnimationFrame(pending); }
    pending = requestAnimationFrame(function () {
      applyTilt(card, e);
      pending = null;
    });
  }

  function onLeave(e) {
    if (pending) { cancelAnimationFrame(pending); pending = null; }
    resetTilt(e.currentTarget);
  }

  /* Adjuntar eventos a todas las tarjetas */
  function attachToCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(SELECTORS));
    cards.forEach(function (card) {
      /* Evitar doble registro */
      if (card._tiltBound) return;
      card._tiltBound = true;
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', onLeave, { passive: true });
    });
  }

  /* Ejecutar al cargar y también al revelar con IntersectionObserver
     (las tarjetas pueden aparecer después del primer render) */
  attachToCards();

  /* Re-ejecutar si hay tarjetas que entran al viewport dinámicamente */
  if ('MutationObserver' in window) {
    var mo = new MutationObserver(function () { attachToCards(); });
    var main = document.getElementById('main');
    if (main) mo.observe(main, { childList: true, subtree: true });
  }
})();

/* =====================================================================
   GENGAR CANVAS ANIMADO
   ===================================================================== */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var W = 65, H = 70; // Tamaño reducido
  var container = document.createElement('div');
  container.id = 'gengar-buddy';
  container.style.width = W + 'px';
  container.style.height = H + 'px';

  var img = document.createElement('img');
  img.src = 'https://play.pokemonshowdown.com/sprites/xyani/gengar.gif';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  // Filtro manejado desde CSS
  container.appendChild(img);

  var bubble = document.createElement('div');
  bubble.id = 'gengar-bubble';
  document.body.appendChild(container);
  document.body.appendChild(bubble);
  
  var x = Math.random() * (window.innerWidth - W);
  var y = window.scrollY + 100 + Math.random() * (window.innerHeight - 200);
  var tx = x, ty = y;
  var speed = 1.5;
  var paused = false;
  var pauseTimer = null;
  var facingLeft = true;
  
  var time = 0;
  
  function pickTarget() {
    var mainEl = document.getElementById('main');
    var maxH = mainEl ? (mainEl.offsetTop + mainEl.offsetHeight) : 3000;
    tx = Math.max(10, Math.min(Math.random() * window.innerWidth, window.innerWidth - W - 10));
    ty = Math.max(10, Math.min(Math.random() * maxH, maxH - H - 10));
  }

  var PHRASES = ['Boo! 👻', 'Loading scares...', 'System.out.haunt()', '404 Sleep Not Found'];
  function showBubble() {
    bubble.textContent = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    bubble.style.display = 'block';
    // Forzar reflow
    void bubble.offsetWidth;
    bubble.style.opacity = '1';
    setTimeout(function() {
      bubble.style.opacity = '0';
      setTimeout(function(){ bubble.style.display = 'none'; }, 350);
    }, 2500);
  }

  function loop(now) {
    time = now;
    
    if (!paused) {
      var dx = tx - x;
      var dy = ty - y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        paused = true;
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(function () {
          if (Math.random() < 0.3) showBubble();
          pickTarget();
          paused = false;
        }, 1000 + Math.random() * 3000);
      } else {
        var s = Math.min(speed, dist * 0.05);
        x += (dx / dist) * s;
        y += (dy / dist) * s;
        if (dx > 1) facingLeft = false;
        if (dx < -1) facingLeft = true;
      }
    }

    container.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
    
    var bRect = container.getBoundingClientRect();
    bubble.style.left = (bRect.left + W/2) + 'px';
    bubble.style.top = (bRect.top - 10) + 'px';

    // El sprite animado original mira hacia la izquierda por defecto
    img.style.transform = facingLeft ? 'scaleX(1)' : 'scaleX(-1)';
    
    requestAnimationFrame(loop);
  }

  pickTarget();
  requestAnimationFrame(loop);
})();

/* =====================================================================
   BACKGROUND BLACK HOLE WEBGL
   ===================================================================== */
(function() {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canvas = document.getElementById('bg-blackhole');
  if (!canvas) return;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.style.display='none'; return; }

  var vs = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  var fs = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    #define MAX_STEPS 80
    #define MAX_DIST 20.0
    
    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float hash(float n) { return fract(sin(n)*43758.5453); }
    float hash3(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                     mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                 mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                     mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    }

    float fbm(vec3 p) {
      float f = 0.0;
      float w = 0.5;
      for (int i=0; i<5; i++) {
        f += w * noise(p);
        p *= 2.0;
        w *= 0.5;
      }
      return f;
    }

    // Genera el fondo de la galaxia (polvo y estrellas)
    vec3 getBackground(vec3 dir) {
      // Banda horizontal galáctica
      float band = exp(-pow(abs(dir.y)*3.0, 1.5));
      
      // Ruido para el polvo estelar (nubes grises/azules/marrones)
      float n1 = fbm(dir * 12.0);
      float n2 = fbm(dir * 25.0);
      float dust = smoothstep(0.2, 0.8, n1) * band;
      float darkDust = smoothstep(0.3, 0.7, n2) * band * 0.8;
      
      // Color base del polvo
      vec3 dustCol = mix(vec3(0.05, 0.1, 0.15), vec3(0.7, 0.75, 0.8), n1);
      dustCol = mix(dustCol, vec3(0.1, 0.08, 0.05), darkDust); // venas oscuras
      dustCol *= dust * 1.5;
      
      // Estrellas
      float star = pow(hash3(dir * 200.0), 150.0);
      float star2 = pow(hash3(dir * 150.0 + 10.0), 80.0) * band;
      vec3 starCol = vec3(1.0, 0.9, 0.8) * star * 3.0 + vec3(0.6, 0.8, 1.0) * star2 * 1.5;
      
      // Luz central de la galaxia a la derecha
      float core = exp(-length(vec2(dir.x - 0.8, dir.y)) * 3.0);
      vec3 coreCol = vec3(1.0, 0.9, 0.7) * core * 1.2;
      
      // Fondo cósmico tenue
      vec3 ambient = vec3(0.02, 0.03, 0.05);
      
      return ambient + dustCol + starCol + coreCol;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      // Posicionamos el centro (agujero negro) en el 25% izquierdo de la pantalla
      uv.x -= 0.25;
      uv.y -= 0.5;
      // Mantenemos el aspecto
      uv.x *= u_resolution.x / min(u_resolution.x, u_resolution.y);
      uv.y *= u_resolution.y / min(u_resolution.x, u_resolution.y);
      
      // Cámara
      vec3 ro = vec3(0.0, 0.0, 5.0);
      vec3 rd = normalize(vec3(uv, -1.0));
      
      // Cámara fija
      ro.xy *= rot(0.1);
      rd.xy *= rot(0.1);
      // Inclinamos un poco para ver el disco
      ro.yz *= rot(-0.15);
      rd.yz *= rot(-0.15);

      vec3 p = ro;
      float dt = 0.08; // Mayor paso para que los rayos viajen más lejos
      float mass = 0.6; // Masa del agujero negro
      
      bool hitHorizon = false;
      vec3 diskColAcc = vec3(0.0);
      
      // Raymarching para curvar la luz (lente gravitacional) y leer el disco
      for(int i = 0; i < 120; i++) { // Más pasos
        float r = length(p);
        
        // Si cruza el horizonte de eventos
        if(r < mass * 0.9) {
          hitHorizon = true;
          break;
        }
        // Si se aleja lo suficiente, asumimos que escapó
        if(r > MAX_DIST) {
          break;
        }
        float currentMass = mass;
        
        // Gravedad: fuerza que curva el rayo hacia el origen
        vec3 force = -normalize(p) * (currentMass / (r * r));
        rd = normalize(rd + force * 0.04);
        
        p += rd * dt;
        
        // Disco de acreción con colores, destellos y movimiento
        float diskDist = abs(p.y);
        float diskRadius = length(p.xz);
        
        if (diskRadius > mass * 1.5 && diskRadius < mass * 3.5 && diskDist < 0.15) {
          float density = smoothstep(0.15, 0.0, diskDist) * smoothstep(mass*3.5, mass*1.5, diskRadius);
          
          float angle = atan(p.z, p.x);
          // El disco rota
          float t = u_time * 1.5;
          
          // Ruido para generar nubes y sombras moviéndose fluidamente en el disco
          float n = fbm(vec3(angle * 6.0 - t, diskRadius * 5.0 - t * 0.5, t * 0.3));
          
          density *= smoothstep(0.1, 0.9, n);
          
          // Colores de sombras blancas y frías fluyendo (sin puntitos)
          vec3 dCol = mix(vec3(0.6, 0.7, 0.85), vec3(1.0, 1.0, 1.0), n);
          
          // Efecto Doppler visual (un lado se acerca más brillante, el otro se aleja)
          float doppler = 1.0 + (p.x / diskRadius) * 0.5;
          dCol *= doppler;
          
          diskColAcc += dCol * density * 0.1; // Ajustado brillo del disco
        }
      }
      
      vec3 col = diskColAcc;
      
      if (!hitHorizon) {
        col += getBackground(rd); // SUMAR el fondo al disco, no sobreescribir
      }
      
      // Viñeteado para oscurecer los bordes y darle más foco
      float distCenter = length(gl_FragCoord.xy / u_resolution.xy - 0.5);
      col *= smoothstep(0.8, 0.2, distCenter * 0.8);
      
      // Ajuste de brillo para que sirva de fondo sutil (no tapar el texto)
      col *= 0.5;
      
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  var vertexShader = createShader(gl.VERTEX_SHADER, vs);
  var fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
  
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var resLoc = gl.getUniformLocation(program, 'u_resolution');
  var timeLoc = gl.getUniformLocation(program, 'u_time');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  function render(time) {
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(timeLoc, time * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
