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
    if (themeMeta) themeMeta.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#f4f7ff' : '#0a2058');
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
