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
