(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = 'https://wa.me/77779014647?text=';
  var cur = d.currentScript;
  var VER = cur && cur.src.indexOf('?v=') > -1 ? cur.src.split('?v=')[1] : '1';
  var BASE = cur ? cur.src.replace(/script\.js.*$/, '') : '';
  var PAGE = d.body.getAttribute('data-page');
  root.classList.add('js');

  /* ---------- языки ---------- */
  var RU = {}, dict = { ru: RU }, lang = 'ru', splits = [];
  var STR = {
    'bmi.low': 'Ваш ИМТ - {v}. По критериям центра операция при таком индексе не рассматривается. Вопросы о лечении можно задать на консультации.',
    'bmi.asia': 'Ваш ИМТ - {v}. Для пациентов азиатского происхождения этот индекс входит в диапазон, при котором операцию обсуждают с врачом на консультации.',
    'bmi.ok': 'Ваш ИМТ - {v}. Это значение входит в диапазон, при котором операцию обсуждают с врачом на консультации.',
    'meta.title': d.title,
    'meta.desc': ($('meta[name="description"]') || {}).content || ''
  };
  Object.keys(STR).forEach(function (k) { RU[k] = STR[k]; });
  $$('[data-i18n]').forEach(function (el) { var k = el.getAttribute('data-i18n'); if (!(k in RU)) RU[k] = el.innerHTML; });
  $$('[data-i18n-alt]').forEach(function (el) { var k = el.getAttribute('data-i18n-alt'); if (!(k in RU)) RU[k] = el.getAttribute('alt'); });
  $$('[data-i18n-aria]').forEach(function (el) { var k = el.getAttribute('data-i18n-aria'); if (!(k in RU)) RU[k] = el.getAttribute('aria-label'); });
  function t(k) { var m = dict[lang] || RU; return (k in m) ? m[k] : RU[k]; }

  function applyLang(l) {
    lang = l;
    splits.forEach(function (s) { try { s.tw && s.tw.kill(); s.sp.revert(); } catch (e) {} });
    splits = [];
    $$('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    d.title = t('meta.title');
    var md = $('meta[name="description"]'); if (md) md.content = t('meta.desc');
    root.lang = l;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
    bmiCalc();
    measureHero();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  function setLang(l, save) {
    if (l !== 'kk' && l !== 'en') l = 'ru';
    if (save) { try { localStorage.setItem('lang', l); } catch (e) {} }
    if (dict[l]) return applyLang(l);
    function load(src, done) {
      var s = d.createElement('script');
      s.src = src + '?v=' + VER; s.onload = done; s.onerror = function () { applyLang('ru'); };
      d.head.appendChild(s);
    }
    var U = l === 'kk' ? 'KK' : 'EN';
    load(BASE + 'assets/lang/' + l + '.js', function () {
      var m = {}, k, src = window['SITE_' + U] || {};
      for (k in src) m[k] = src[k];
      if (!PAGE) { dict[l] = m; return applyLang(l); }
      load(BASE + 'assets/lang/' + PAGE + '-' + l + '.js', function () {
        var pg = window['PAGE_' + U] || {};
        for (k in pg) m[k] = pg[k];
        dict[l] = m; applyLang(l);
      });
    });
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });

  /* ---------- мобильный герой: сцена занимает остаток первого экрана ---------- */
  var heroTxt = $('.hero-txt'), lastW = window.innerWidth;
  function measureHero() { if (heroTxt) root.style.setProperty('--htxt', heroTxt.offsetHeight + 'px'); }
  measureHero();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(measureHero);
  window.addEventListener('resize', function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; measureHero(); });

  /* ---------- шапка, меню ---------- */
  var hdr = $('#hdr'), burger = $('#burger');
  function onScrollHdr() { hdr.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();
  function menu(open) {
    if (open === d.body.classList.contains('menu-open')) return;
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  burger.addEventListener('click', function () { menu(!d.body.classList.contains('menu-open')); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });

  /* ---------- плавная прокрутка ---------- */
  var lenis = null, gsap = window.gsap, ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);
  if (window.SplitText && gsap) gsap.registerPlugin(window.SplitText);
  if (window.Lenis && gsap && !reduce) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); return; }
    var el = $(id); if (!el) return;
    e.preventDefault(); menu(false);
    if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -84, duration: 1.3 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  /* ---------- сцена героя: время суток ---------- */
  var scene = $('#scene'), tl = $$('#tline li'), mobTw = null;
  function ss(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  var prog = { hero: 0, mid: 0, dawn: 0 };
  var bgEl = $('.bg');
  /* небо пишется только в слой фона: запись в корень заставляла пересчитывать стили всей страницы на каждом кадре */
  var bgL = bgEl ? [].slice.call(bgEl.children) : [], lastSky = -1;
  /* прозрачность слоёв фона считается здесь: закрытые верхним и прозрачные слои выключаются, на 2560px это главная экономия */
  function renderSky() {
    var k = 0.8 * (PAGE || !scene ? 1 : ss(0.3, 1, prog.hero)) + 1.2 * prog.mid + prog.dawn;
    k = Math.round(k * 200) / 200; if (k === lastSky || !bgL.length) return; lastSky = k;
    var c = function (v) { return Math.min(1, Math.max(0, v)); };
    var op = [1, c(k), c(k - 1), c(k - 2)], top = 0;
    op.forEach(function (o, i) { if (o >= 1) top = i; });
    for (var i = 0; i < 4; i++) {
      var el = bgL[i], on = op[i] > 0 && i >= top;
      el.style.visibility = on ? 'visible' : 'hidden'; if (on) el.style.opacity = op[i];
    }
    var st = c(0.7 - k * 0.6); bgL[4].style.visibility = st > 0 ? 'visible' : 'hidden'; bgL[4].style.opacity = st;
  }
  var MARKS = [0, 0.26, 0.5, 0.8], lastOn = 0;
  function setScene(p) {
    prog.hero = p;
    var s = root.style;
    s.setProperty('--p', p.toFixed(3));
    s.setProperty('--day', ss(0.5, 0.88, p).toFixed(3));
    s.setProperty('--dw', ss(0.26, 0.56, p).toFixed(3));
    s.setProperty('--dawn', (ss(0.26, 0.55, p) * (1 - ss(0.68, 0.95, p))).toFixed(3));
    s.setProperty('--nt', (1 - ss(0.2, 0.46, p)).toFixed(3));
    s.setProperty('--sunp', ss(0.36, 1, p).toFixed(3));
    s.setProperty('--lie', (1 - ss(0.44, 0.5, p)).toFixed(3));
    s.setProperty('--sit', (ss(0.46, 0.53, p) * (1 - ss(0.74, 0.8, p))).toFixed(3));
    s.setProperty('--stand', ss(0.76, 0.84, p).toFixed(3));
    var on = 0; MARKS.forEach(function (m, i) { if (p >= m - 0.001) on = i; });
    if (on !== lastOn) { lastOn = on; tl.forEach(function (li, i) { li.classList.toggle('on', i <= on); }); }
    renderSky();
  }

  if (gsap && ST) {
    var mm = gsap.matchMedia();
    var hp = { v: 0 };
    if (scene && !PAGE) mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      gsap.to(hp, { v: 1, ease: 'none', onUpdate: function () { setScene(hp.v); },
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=190%', pin: true, scrub: 0.7, anticipatePin: 1 } });
    });
    /* телефон: сцена сама проживает ночь -> утро в первом экране, без прокрутки */
    /* посадочные: рассвет проигрывается сам на любой ширине, без закреплённой прокрутки */
    if (tl.length) mm.add(PAGE || !scene ? '(prefers-reduced-motion: no-preference)' : '(max-width: 899px) and (prefers-reduced-motion: no-preference)', function () {
      hp.v = 0; setScene(0);
      mobTw = gsap.to(hp, { v: 1, duration: scene ? 7.5 : 4.5, delay: scene ? 1.2 : 0.9, ease: 'power1.inOut', onUpdate: function () { setScene(hp.v); } });
      return function () { mobTw && mobTw.kill(); mobTw = null; };
    });
    /* ось вех: закреплённый горизонтальный проезд */
    var axis = $('#axis'), track = $('#axisTrack'), view = axis && $('.axis-view', axis);
    if (axis) mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', function () {
      axis.classList.add('pinned'); view.scrollLeft = 0;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: axis, start: 'center center', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (self) { axis.style.setProperty('--ap', self.progress.toFixed(3)); } } });
      return function () { axis.classList.remove('pinned'); gsap.set(track, { x: 0 }); tw.kill(); };
    });
    if (view) view.addEventListener('scroll', function () {
      var m = view.scrollWidth - view.clientWidth; if (m > 0) axis.style.setProperty('--ap', (view.scrollLeft / m).toFixed(3));
    }, { passive: true });

    /* небо светлеет от полосы доверия к началу светлой части, последний шаг - на входе в неё */
    var mp = { v: 0 }, day = $('.day');
    renderSky();
    if (day && $('.trust')) gsap.to(mp, { v: 1, ease: 'none', onUpdate: function () { prog.mid = mp.v; renderSky(); },
      scrollTrigger: { trigger: '.trust', start: 'top bottom', endTrigger: day, end: 'top bottom', scrub: true } });
    /* светлая часть со своим фоном (styles.css .day), общий фон дальше сумерек не светлеет */

    /* вход героя */
    if (!reduce && scene) {
      gsap.from('.scene', { opacity: 0.3, duration: 1.2, ease: 'power2.out' });
      gsap.from('.hero-col > *', { opacity: 0, y: 26, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.15, clearProps: 'all' });
      gsap.from('.tline li', { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.6, clearProps: 'all' });
    }

    if (!reduce && $('.hv')) {
      gsap.from('.hv-main', { clipPath: 'inset(100% 0 0 0 round 26px)', duration: 1.4, ease: 'power3.inOut', delay: 0.1, clearProps: 'clipPath' });
      gsap.from('.hv-main img', { scale: 1.12, duration: 2.2, ease: 'power3.out', clearProps: 'transform' });
      gsap.from('.hv-col', { opacity: 0, y: 40, duration: 1.2, stagger: 0.12, ease: 'power3.out', delay: 0.35, clearProps: 'opacity,transform' });
    }
    if (reduce) setScene(1);

    /* заголовки по строкам */
    if (window.SplitText && !reduce) {
      $$('h2.spl').forEach(function (h) {
        ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
          var sp = new window.SplitText(h, { type: 'lines', linesClass: 'ln' });
          var rec = { sp: sp, tw: null };
          rec.tw = gsap.from(sp.lines, { opacity: 0, y: 34, duration: 1, stagger: 0.08, ease: 'power3.out',
            onComplete: function () { sp.revert(); splits = splits.filter(function (x) { return x !== rec; }); } });
          splits.push(rec);
        } });
      });
    }

    /* этапы: линия и смена кадра */
    var steps = $('#steps'), stepEls = steps ? $$('.step', steps) : [], phs = $$('#stepsPh img');
    var sv = { v: 0 };
    if (steps) gsap.to(sv, { v: 1, ease: 'none', onUpdate: function () { steps.style.setProperty('--sp', sv.v.toFixed(3)); },
      scrollTrigger: { trigger: steps, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } });
    function actStep(i) {
      stepEls.forEach(function (s, j) { s.classList.toggle('act', j <= i); });
      var n = i < 0 ? 0 : +stepEls[i].getAttribute('data-ph');
      phs.forEach(function (im, j) { im.classList.toggle('on', j === n); });
    }
    stepEls.forEach(function (el, i) {
      ST.create({ trigger: el, start: 'top 62%', onEnter: function () { actStep(i); }, onLeaveBack: function () { actStep(i - 1); } });
    });

    window.addEventListener('load', function () {
      ST.refresh();
      var h = location.hash, el = h && h.length > 1 && d.getElementById(h.slice(1));
      if (el) setTimeout(function () {
        var y = el.getBoundingClientRect().top + window.scrollY - 84;
        if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
      }, 60);
    });
  } else {
    setScene(0);
  }

  /* параллакс слоёв окна от курсора */
  if (gsap && !reduce && scene && window.matchMedia('(hover: hover)').matches) {
    var mo = { x: 0, y: 0 };
    $('.hero').addEventListener('pointermove', function (e) {
      gsap.to(mo, { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2, duration: 0.9, ease: 'power3.out', overwrite: true,
        onUpdate: function () { root.style.setProperty('--mx', mo.x.toFixed(3)); root.style.setProperty('--my', mo.y.toFixed(3)); } });
    });
  }

  /* появление блоков, пауза сцены вне экрана */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    $$('.rv,.ph').forEach(function (el, i) { io.observe(el); });
    if (!scene && $('.hv')) new IntersectionObserver(function (es) { $('.hero').classList.toggle('paused', !es[0].isIntersecting); }).observe($('.hero'));
    if (scene) new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      scene.classList.toggle('paused', !vis);
      if (mobTw) { vis ? mobTw.resume() : mobTw.pause(); }
    }).observe(scene);
    /* липкая панель: появляется, когда кнопки героя ушли с экрана */
    var hb = $('.hero .btns');
    if (hb && $('#mbar')) {
      d.body.classList.add('mbar-off');
      new IntersectionObserver(function (es) { d.body.classList.toggle('mbar-off', es[0].isIntersecting); }).observe(hb);
    }
  } else { $$('.rv,.ph').forEach(function (el) { el.classList.add('in'); }); }
  $$('.trust-in li,.dirs .dir,.rows li,.prep li,.faq details').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 0.07 + 's'; });

  /* листаемые ленты */
  function bindArrows(box, scroller, item) {
    if (!box || !scroller) return;
    var btns = $$('.arw', box);
    function step() { var el = $(item, scroller); return el ? el.getBoundingClientRect().width + 20 : 300; }
    function upd() {
      var m = scroller.scrollWidth - scroller.clientWidth;
      box.hidden = m < 4;
      btns[0].disabled = scroller.scrollLeft < 4; btns[1].disabled = scroller.scrollLeft > m - 4;
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { scroller.scrollBy({ left: step() * +b.getAttribute('data-dir'), behavior: reduce ? 'auto' : 'smooth' }); }); });
    scroller.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    window.addEventListener('load', upd);
  }
  bindArrows($('.arrows[data-for="patTrack"]'), $('#patTrack'), '.car-i');
  bindArrows($('.axis .arrows'), $('.axis-view'), '.ms');

  /* ---------- расчёт ИМТ ---------- */
  var bH = $('#bmiH'), bW = $('#bmiW'), bRes = $('#bmiRes'), bVal = $('#bmiVal'), bMark = $('#bmiMark'), bBtn = $('#bmiBtn'), bNote = $('#bmiNote');
  var zones = $$('.zones li'), zbars = $$('.scale-bar .z');
  function bmiCalc() {
    if (!bH) return;
    var h = parseFloat(bH.value), w = parseFloat(bW.value);
    var ok = h >= 120 && h <= 220 && w >= 35 && w <= 300;
    if (!ok) {
      bVal.textContent = '-'; bRes.textContent = ''; bMark.classList.remove('on'); if (bNote) bNote.classList.remove('on');
      zones.forEach(function (z) { z.classList.remove('on'); }); zbars.forEach(function (z) { z.classList.remove('on'); });
      bBtn.href = WA + encodeURIComponent('Здравствуйте! Хочу обсудить лечение на консультации.');
      return;
    }
    var v = w / Math.pow(h / 100, 2), vs = v.toFixed(1).replace('.', ',');
    bVal.textContent = vs;
    bRes.textContent = t(v < 27.5 ? 'bmi.low' : v < 30 ? 'bmi.asia' : 'bmi.ok').replace('{v}', vs);
    if (bNote) bNote.classList.toggle('on', v >= 27.5 && v < 30);
    bMark.style.left = Math.min(100, Math.max(0, (v - 20) / 30 * 100)) + '%'; bMark.classList.add('on');
    var z = v >= 40 ? 3 : v >= 35 ? 2 : v >= 30 ? 1 : 0;
    zones.forEach(function (li) { li.classList.toggle('on', +li.getAttribute('data-z') === z); });
    zbars.forEach(function (b, i) { b.classList.toggle('on', i === z); });
    bBtn.href = WA + encodeURIComponent('Здравствуйте! Мой рост ' + h + ' см, вес ' + w + ' кг, ИМТ ' + vs + '. Хочу обсудить лечение на консультации.');
  }
  [bH, bW].forEach(function (i) { if (i) i.addEventListener('input', bmiCalc); });

  /* ---------- форма записи ---------- */
  var form = $('#form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, name = f.name.value.trim(), phone = f.phone.value.trim();
    var bad = false;
    [[f.name, name.length < 2], [f.phone, phone.replace(/\D/g, '').length < 10]].forEach(function (p) { p[0].classList.toggle('bad', p[1]); if (p[1] && !bad) { bad = true; p[0].focus(); } });
    if (bad) return;
    var txt = 'Здравствуйте! Заявка на консультацию. Имя: ' + name + '. Телефон: ' + phone + '. Направление: ' + f.direction.value + '. ' + f.comment.value.trim();
    window.open(WA + encodeURIComponent(txt.trim()), '_blank', 'noopener');
    $('#formOk').hidden = false;
  });

  /* ---------- стартовый язык ---------- */
  var q = /[?&]lang=(ru|kk|en)\b/.exec(location.search), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var start = q ? q[1] : saved;
  if (start && start !== 'ru') setLang(start, false);
})();
