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
      if ($('.hv-art')) gsap.from('.hv-art', { opacity: 0, y: 24, duration: 1, ease: 'power2.out', delay: 0.2, clearProps: 'opacity,transform' });
      else {
        gsap.from('.hv-main', { clipPath: 'inset(100% 0 0 0 round 26px)', duration: 1.4, ease: 'power3.inOut', delay: 0.1, clearProps: 'clipPath' });
        gsap.from('.hv-main img', { scale: 1.12, duration: 2.2, ease: 'power3.out', clearProps: 'transform' });
      }
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
  var bBox = $('#bmi'), bH = $('#bmiH'), bW = $('#bmiW'), bHR = $('#bmiHR'), bWR = $('#bmiWR');
  var bRes = $('#bmiRes'), bVal = $('#bmiVal'), bBtn = $('#bmiBtn'), bNote = $('#bmiNote'), bCat = $('#bmiCatT');
  var bNeedle = $('#bmiNeedle'), bProg = $('#bmiProg');
  var bZones = $$('.bmi-zones li'), bSegs = $$('.bmi-seg'), bLegs = $$('.bmi-leg li');
  var bPart = {}, bState = { v: 16 }, bTween = null, bShown = false, bFast = false;
  $$('#bmiFig [data-p]').forEach(function (el) { bPart[el.getAttribute('data-p')] = el; });

  function bLerp(a, b, f) { return a + (b - a) * f; }
  function bN(x) { return Math.round(x * 10) / 10; }
  function bSeg(p0, p1, p2, p3) {
    return 'C' + bN(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + bN(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
      bN(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + bN(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + bN(p2[0]) + ' ' + bN(p2[1]);
  }
  function bPath(p, closed) {
    var n = p.length, s = 'M' + bN(p[0][0]) + ' ' + bN(p[0][1]), i;
    if (closed) { for (i = 0; i < n; i++) s += bSeg(p[(i - 1 + n) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]); return s + 'Z'; }
    for (i = 0; i < n - 1; i++) s += bSeg(p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(n - 1, i + 2)]);
    return s;
  }
  function bMirror(p) { return p.map(function (q) { return [140 - q[0], q[1]]; }); }
  function bBody(f) {
    var c = 70;
    return {
      hx: bLerp(12.5, 16, f), nk: bLerp(6.5, 11, f), sh: bLerp(27, 38, f), ch: bLerp(22.5, 40, f),
      wa: bLerp(18, 49, f), wy: bLerp(116, 126, f), hp: bLerp(23.5, 48, f), th: bLerp(23, 42, f),
      kn: bLerp(15.5, 25, f), cf: bLerp(15.5, 24, f), an: bLerp(10, 14.5, f),
      ae: bLerp(31.5, 55, f), ah: bLerp(33, 57, f), aw: bLerp(9.5, 18, f), c: c
    };
  }
  function bFigure(v) {
    if (!bPart.torso) return;
    var f = Math.min(1, Math.max(-0.14, (v - 19.5) / 28.5)), b = bBody(f), c = b.c;
    var half = [[c + b.nk, 36], [c + b.nk + 1, 46], [c + b.sh, 57], [c + b.ch, 84], [c + b.wa, b.wy], [c + b.hp, 148], [c + b.hp * .72, 168]];
    var torso = half.concat([[c, 173]], bMirror(half).reverse());
    var leg = [[c + b.hp - 1, 148], [c + b.th, 178], [c + b.kn, 212], [c + b.cf, 232], [c + b.an, 258], [c + b.an + 2.5, 269], [c + b.an - 4, 272],
      [c + 2.5, 268], [c + 3.5, 258], [c + 3, 232], [c + 2.5, 212], [c + 1, 180], [c + 2, 156]];
    var arm = 'M' + bN(c + b.sh - 4) + ' 63Q' + bN(c + b.ae + 1) + ' 96 ' + bN(c + b.ae) + ' 120T' + bN(c + b.ah) + ' 168';
    var armL = 'M' + bN(c - b.sh + 4) + ' 63Q' + bN(c - b.ae - 1) + ' 96 ' + bN(c - b.ae) + ' 120T' + bN(c - b.ah) + ' 168';
    bPart.torso.setAttribute('d', bPath(torso, true));
    bPart.legR.setAttribute('d', bPath(leg, true));
    bPart.legL.setAttribute('d', bPath(bMirror(leg), true));
    bPart.armR.setAttribute('d', arm); bPart.armL.setAttribute('d', armL);
    bPart.armR.setAttribute('stroke-width', bN(b.aw)); bPart.armL.setAttribute('stroke-width', bN(b.aw));
    bPart.head.setAttribute('rx', bN(b.hx));
  }
  function bGhost() {
    if (!bPart.ghost) return;
    var b = bBody((22 - 19.5) / 28.5), c = b.c;
    var side = [[c + b.sh, 57], [c + b.ch, 84], [c + b.wa, b.wy], [c + b.hp, 148], [c + b.th, 178], [c + b.kn, 212], [c + b.cf, 232], [c + b.an, 258]];
    bPart.ghost.setAttribute('d', bPath(side) + bPath(bMirror(side)));
  }
  function bDraw() {
    var v = bState.v, g = Math.min(50, Math.max(16, v)), k = (g - 16) / 34;
    if (bNeedle) bNeedle.setAttribute('transform', 'rotate(' + bN(k * 180) + ' 150 150)');
    if (bProg) bProg.style.strokeDasharray = bN(k * 100) + ' 100';
    if (bShown) bVal.textContent = v.toFixed(1).replace('.', ',');
    bFigure(v);
  }
  function bGo(v, dur) {
    if (bTween) { bTween.kill(); bTween = null; }
    if (reduce || !window.gsap || !dur) { bState.v = v; bDraw(); return; }
    bTween = window.gsap.to(bState, { v: v, duration: dur, ease: 'power3.out', onUpdate: bDraw, onComplete: bDraw });
  }
  function bFill(r) {
    if (!r) return;
    var a = +r.min, b = +r.max;
    r.style.setProperty('--p', bN((r.value - a) / (b - a) * 100) + '%');
  }
  function bmiCalc() {
    if (!bBox || !bH || !bW) return;
    var h = parseFloat(String(bH.value).replace(',', '.')), w = parseFloat(String(bW.value).replace(',', '.'));
    var ok = h >= 120 && h <= 220 && w >= 35 && w <= 300;
    var hello = 'Здравствуйте! ';
    if (!ok) {
      bShown = false;
      bBox.classList.remove('is-on');
      bVal.textContent = '-'; bRes.textContent = '';
      if (bCat) bCat.innerHTML = t('bmi.empty');
      if (bNote) bNote.classList.remove('on');
      bZones.concat(bSegs, bLegs).forEach(function (el) { el.classList.remove('on'); });
      bBtn.href = WA + encodeURIComponent(hello + 'Хочу обсудить лечение на консультации.');
      bGo(22, bFast ? .3 : .7);
      return;
    }
    var v = w / Math.pow(h / 100, 2), vs = v.toFixed(1).replace('.', ',');
    var c = v < 18.5 ? 'u' : v < 25 ? '0' : v < 30 ? '1' : v < 35 ? '2' : v < 40 ? '3' : '4';
    var z = v >= 40 ? 3 : v >= 35 ? 2 : v >= 30 ? 1 : 0;
    bShown = true;
    bBox.classList.add('is-on');
    bBox.style.setProperty('--cc', 'var(--c-' + c + ')');
    bRes.textContent = t(v < 27.5 ? 'bmi.low' : v < 30 ? 'bmi.asia' : 'bmi.ok').replace('{v}', vs);
    if (bCat) bCat.innerHTML = t('bmi.c' + c);
    if (bNote) bNote.classList.toggle('on', v >= 27.5 && v < 30);
    bZones.forEach(function (li) { li.classList.toggle('on', +li.getAttribute('data-z') === z); });
    bSegs.concat(bLegs).forEach(function (el) { el.classList.toggle('on', el.getAttribute('data-c') === c); });
    bBtn.href = WA + encodeURIComponent(hello + 'Мой рост ' + h + ' см, вес ' + w + ' кг, ИМТ ' + vs + '. Хочу обсудить лечение на консультации.');
    bGo(v, bFast ? .35 : .9);
  }
  function bBind(num, rng, other, otherRng) {
    if (!num || !rng) return;
    num.addEventListener('input', function () {
      var x = parseFloat(String(num.value).replace(',', '.'));
      if (num.value === '') { rng.value = rng.defaultValue; bFill(rng); }
      else if (x >= +rng.min && x <= +rng.max) { rng.value = Math.round(x); bFill(rng); }
      bFast = false; bmiCalc();
    });
    rng.addEventListener('input', function () {
      num.value = rng.value; bFill(rng);
      if (other && otherRng && other.value === '') other.value = otherRng.value;
      bFast = true; bmiCalc();
    });
    bFill(rng);
  }
  bBind(bH, bHR, bW, bWR); bBind(bW, bWR, bH, bHR);
  if (bBox) { bGhost(); bState.v = 22; bDraw(); }

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
