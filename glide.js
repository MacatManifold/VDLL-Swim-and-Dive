// Page-to-page transitions.
//
// 1. Nav hold: every tab switch is a real page load, and the nav is drawn by JS, so it used to vanish for a
//    moment and pop back in. On the way out we save a copy of the nav exactly as it looks; on the way in we
//    paint that copy before anything else, then swap it for the real nav once that has rendered.
// 2. Glide: the page content slides the same way the white pill in the nav does: out toward where you came
//    from, in from where you're going. Skipped for visitors who ask for reduced motion.
(function () {
  if (window.__glide) return;
  window.__glide = true;

  var ORDER = ['index', 'jv', 'varsity', 'coaches', 'equipment']; // left → right, same as the nav
  var MS = 380;            // matches the pill's glide in TopNav
  var KEY = 'vdl-glide', NAV_KEY = 'vdl-nav';
  var root = document.documentElement;
  var motion = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Everything inside the page except the sticky nav and the ripple canvas.
  var CONTENT = '#dc-root [data-ripple-host] > :not(canvas):not(.sc-host):not(.sc-placeholder)';
  var NAV_HOST = '#dc-root [data-ripple-host] > .sc-host';
  var PILL = ':scope > div > div', TABS = ':scope > div > a'; // inside TopNav's <nav>
  var INK_OFF = 'rgba(var(--ink, 238,242,248),.72)', INK_ON = '#00204e'; // tab label colors, as in TopNav
  var HOME_INK_ON = 'rgba(0,32,78,.8)', HOME_INK_OFF = 'rgba(200,212,230,.75)'; // logo capsule label, as in TopNav

  var css = document.createElement('style');
  css.textContent =
    // Same backdrop on the bare document as on the page itself, so the instant before content renders isn't a flat dark frame.
    'html:root{background-color:var(--page-base,#020a1d);background-image:var(--page-bg, none);background-attachment:fixed;}' +
    'html:root body{background:transparent;}' +
    '#nav-ghost{position:fixed;top:0;left:0;z-index:30;pointer-events:none;}' +
    // While the copy is up, the real nav renders underneath it, invisible, so nothing doubles up.
    'html[data-nav-hold] ' + NAV_HOST + '{visibility:hidden;}' +
    ':root{--glide-d:clamp(56px,14vw,180px);}' +
    '@keyframes glide-in{from{transform:translate3d(calc(var(--glide-dir) * var(--glide-d)),0,0);opacity:0;}}' +
    '@keyframes glide-out{to{transform:translate3d(calc(var(--glide-dir) * var(--glide-d) * -1),0,0);opacity:0;}}' +
    'html[data-glide="wait"] ' + CONTENT + '{opacity:0;}' +
    'html[data-glide="in"] ' + CONTENT + '{animation:glide-in ' + MS + 'ms cubic-bezier(.16,.72,.25,1) backwards;}' +
    'html[data-glide="out"] ' + CONTENT + '{animation:glide-out ' + MS + 'ms cubic-bezier(.65,0,.85,.45) forwards;pointer-events:none;}';
  document.head.appendChild(css);

  var pageOf = function (path) { return (path.split('/').pop() || 'index').replace(/\.html$/, ''); }; // /jv and /jv.html are the same page
  var here = pageOf(location.pathname);
  var clear = function () { root.removeAttribute('data-glide'); };
  var take = function (key) { // read once; ignore anything not written by a click in the last few seconds
    try {
      var v = JSON.parse(sessionStorage.getItem(key) || 'null');
      sessionStorage.removeItem(key);
      return v && Date.now() - v.t < 5000 ? v : null;
    } catch (e) { return null; }
  };
  var put = function (key, v) { try { v.t = Date.now(); sessionStorage.setItem(key, JSON.stringify(v)); } catch (e) {} };

  // ── Nav hold: arriving ────────────────────────────────────
  var ghost = null;
  var dropGhost = function () {
    if (ghost) ghost.remove();
    ghost = null;
    root.removeAttribute('data-nav-hold');
  };
  var holdNav = function (saved) {
    if (!saved || !saved.html) return;
    ghost = document.createElement('div');
    ghost.id = 'nav-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = saved.w + 'px';
    ghost.innerHTML = saved.html;
    root.appendChild(ghost); // <body> doesn't exist yet; this paints with the very first frame
    root.setAttribute('data-nav-hold', '');
    var t0 = performance.now(), steady = 0;
    var tick = function () {
      if (!ghost) return;
      var host = document.querySelector(NAV_HOST), nav = host && host.querySelector('nav');
      var ok = false;
      if (nav) {
        var pill = nav.querySelector(PILL), tab = nav.querySelector(TABS + '[href="' + here + '"]');
        var imgs = [].slice.call(nav.querySelectorAll('img'));
        ok = imgs.every(function (i) { return i.complete && i.naturalWidth > 0; }) &&
          (!document.fonts || document.fonts.status === 'loaded') &&
          (!tab || (pill && pill.style.opacity === '1'));
      }
      steady = ok ? steady + 1 : 0;
      // Two settled frames in a row, then swap. Never hold longer than 3s.
      if (steady >= 2 || performance.now() - t0 > 3000) return dropGhost();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ── Glide: arriving ───────────────────────────────────────
  // Content stays hidden until the page has rendered, then glides in.
  var enter = function (dir) {
    if (!dir || !motion) return clear();
    root.style.setProperty('--glide-dir', dir);
    root.setAttribute('data-glide', 'wait');
    var t0 = performance.now(), seen = 0;
    var tick = function () {
      var now = performance.now();
      var host = document.querySelector('#dc-root [data-ripple-host]');
      if (host && !seen) seen = now;
      // Go once content and nav are both up; don't hold the content more than a beat for the nav.
      var ready = host && (host.querySelector('nav') || now - seen > 250);
      if (!ready && now - t0 < 3000) return requestAnimationFrame(tick);
      root.setAttribute('data-glide', 'in');
      setTimeout(function () { if (root.getAttribute('data-glide') === 'in') clear(); }, MS + 80);
    };
    requestAnimationFrame(tick);
  };
  var arrive = function () {
    var nav = take(NAV_KEY), g = take(KEY);
    if (nav && nav.to === here) holdNav(nav);
    enter(g ? g.dir : 0);
  };
  if (document.prerendering) {
    // Chrome may build this page in the background before the click; hold it, then glide on reveal.
    if (motion) root.setAttribute('data-glide', 'wait');
    document.addEventListener('prerenderingchange', arrive, { once: true });
  } else {
    arrive();
  }
  // Back/forward can restore a page that was frozen mid-exit: show it again.
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(NAV_KEY); } catch (x) {}
    clear(); dropGhost();
    undo.forEach(function (u) { u[0].setAttribute('style', u[1]); }); // put back anything we restyled on the way out
    undo = [];
  });

  // ── Nav hold: leaving ─────────────────────────────────────
  // The nav's logos are <img>s, which a fresh page decodes a frame late. Keep their SVG source on hand so the
  // saved copy can carry them inline and paint immediately.
  var SVG = {};
  var learnLogos = function () {
    [].forEach.call(document.querySelectorAll(NAV_HOST + ' img'), function (img) {
      var src = img.getAttribute('src');
      if (!src || src in SVG || !/\.svg$/.test(src)) return;
      SVG[src] = '';
      fetch(src).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) { SVG[src] = t; }).catch(function () {});
    });
  };
  var waitNav = setInterval(function () {
    if (document.querySelector(NAV_HOST + ' nav img')) { clearInterval(waitNav); learnLogos(); }
  }, 300);
  setTimeout(function () { clearInterval(waitNav); }, 15000);

  // Put the nav (live or copy) into the state it will have on page `dest`: pill under that tab, or no pill on Home.
  var undo = [];
  var setNavFor = function (nav, dest, measureFrom, live) {
    var tabs = [].slice.call(nav.querySelectorAll(TABS)), pill = nav.querySelector(PILL);
    var liveTabs = [].slice.call(measureFrom.querySelectorAll(TABS));
    if (!pill) return;
    // Logo capsule: lit on Home, plain everywhere else.
    var home = dest === 'index', sel = function (q) { return [].slice.call(nav.querySelectorAll(q)); };
    var brand = sel('[data-home-on]').concat(sel('[data-home-off]'), sel('[data-home-ink]'));
    if (live) [pill].concat(tabs, brand).forEach(function (el) { undo.push([el, el.getAttribute('style') || '']); });
    sel('[data-home-on]').forEach(function (el) { el.style.opacity = home ? '1' : '0'; });
    sel('[data-home-off]').forEach(function (el) { el.style.opacity = home ? '0' : '1'; });
    sel('[data-home-ink]').forEach(function (el) { el.style.color = home ? HOME_INK_ON : HOME_INK_OFF; });
    var hit = -1;
    tabs.forEach(function (a, i) { var on = a.getAttribute('href') === dest; if (on) hit = i; a.style.color = on ? INK_ON : INK_OFF; });
    var shown = pill.style.opacity === '1';
    if (live) pill.style.transition = !motion ? 'none' : shown && hit >= 0
      ? 'left ' + MS + 'ms cubic-bezier(.65,0,.25,1), width ' + MS + 'ms cubic-bezier(.65,0,.25,1)' : 'opacity ' + MS + 'ms ease';
    if (hit < 0) { pill.style.opacity = '0'; return; }
    pill.style.left = liveTabs[hit].offsetLeft + 'px';
    pill.style.width = liveTabs[hit].offsetWidth + 'px';
    pill.style.opacity = '1';
  };
  var saveNav = function (dest, handledByNav) {
    var host = document.querySelector(NAV_HOST), nav = host && host.querySelector('nav');
    if (!nav) return;
    // Links the nav doesn't animate itself (logo → Home, cards → a tab): fade the pill to where it's headed.
    if (!handledByNav) setNavFor(nav, dest, nav, true);
    var copy = host.cloneNode(true), cnav = copy.querySelector('nav');
    setNavFor(cnav, dest, nav, false);
    [].forEach.call(copy.querySelectorAll('[style]'), function (el) { if (el.style.transition) el.style.transition = 'none'; });
    [].forEach.call(copy.querySelectorAll('img'), function (img) {
      var svg = SVG[img.getAttribute('src')];
      if (!svg) return;
      var t = document.createElement('template');
      t.innerHTML = svg.trim();
      var el = t.content.firstElementChild;
      if (!el || el.tagName.toLowerCase() !== 'svg') return;
      el.setAttribute('style', img.getAttribute('style') || '');
      el.removeAttribute('role'); el.removeAttribute('aria-label');
      img.replaceWith(el);
    });
    put(NAV_KEY, { html: copy.outerHTML, w: host.getBoundingClientRect().width, to: dest }); // exact width, so the copy lines up to the pixel
  };

  // ── Leaving ───────────────────────────────────────────────
  // Runs after the nav's own click handler, so tab links (which already wait for the pill) just get
  // the content glide added; any other link between pages gets the same short wait.
  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (x) { return; }
    if (url.origin !== location.origin) return;
    var dest = pageOf(url.pathname), from = ORDER.indexOf(here), to = ORDER.indexOf(dest);
    if (to < 0 || from < 0 || dest === here) return;
    try { saveNav(dest, e.defaultPrevented); } catch (x) {}
    if (!motion) return;
    var dir = to > from ? 1 : -1;
    put(KEY, { dir: dir });
    root.style.setProperty('--glide-dir', dir);
    root.setAttribute('data-glide', 'out');
    if (!e.defaultPrevented) {
      e.preventDefault();
      setTimeout(function () { location.href = url.href; }, MS);
    }
    // If the navigation never happens, don't leave the page blank.
    setTimeout(function () { if (root.getAttribute('data-glide') === 'out') clear(); }, 4000);
  });
})();
