// Page-to-page glide. When you switch tabs, the page content slides the same way the
// white pill in the nav does: out toward where you came from, in from where you're going.
// The nav itself stays put. Skipped entirely for visitors who ask for reduced motion.
(function () {
  if (window.__glide) return;
  window.__glide = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ORDER = ['index.html', 'jv.html', 'varsity.html', 'coaches.html', 'equipment.html']; // left → right, same as the nav
  var MS = 380;            // matches the pill's glide in TopNav
  var KEY = 'vdl-glide';
  var root = document.documentElement;
  // Everything inside the page except the sticky nav and the ripple canvas.
  var CONTENT = '#dc-root [data-ripple-host] > :not(canvas):not(.sc-host):not(.sc-placeholder)';

  var css = document.createElement('style');
  css.textContent =
    ':root{--glide-d:clamp(56px,14vw,180px);}' +
    '@keyframes glide-in{from{transform:translate3d(calc(var(--glide-dir) * var(--glide-d)),0,0);opacity:0;}}' +
    '@keyframes glide-out{to{transform:translate3d(calc(var(--glide-dir) * var(--glide-d) * -1),0,0);opacity:0;}}' +
    'html[data-glide="wait"] ' + CONTENT + '{opacity:0;}' +
    'html[data-glide="in"] ' + CONTENT + '{animation:glide-in ' + MS + 'ms cubic-bezier(.16,.72,.25,1) backwards;}' +
    'html[data-glide="out"] ' + CONTENT + '{animation:glide-out ' + MS + 'ms cubic-bezier(.65,0,.85,.45) forwards;pointer-events:none;}';
  document.head.appendChild(css);

  var pageOf = function (path) { return path.split('/').pop() || 'index.html'; };
  var here = pageOf(location.pathname);
  var clear = function () { root.removeAttribute('data-glide'); };
  var store = {
    take: function () {
      try {
        var v = JSON.parse(sessionStorage.getItem(KEY) || 'null');
        sessionStorage.removeItem(KEY);
        return v && Date.now() - v.t < 5000 ? v.dir : 0;
      } catch (e) { return 0; }
    },
  };

  // ── Arriving ──────────────────────────────────────────────
  // Content stays hidden until the page has rendered, then glides in.
  var enter = function (dir) {
    if (!dir) return clear();
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
  if (document.prerendering) {
    // Chrome may build this page in the background before the click; hold it, then glide on reveal.
    root.setAttribute('data-glide', 'wait');
    document.addEventListener('prerenderingchange', function () { enter(store.take()); }, { once: true });
  } else {
    enter(store.take());
  }
  // Back/forward can restore a page that was frozen mid-exit: show it again.
  addEventListener('pageshow', function (e) { if (e.persisted) { try { sessionStorage.removeItem(KEY); } catch (x) {} clear(); } });

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
    var dir = to > from ? 1 : -1;
    try { sessionStorage.setItem(KEY, JSON.stringify({ dir: dir, t: Date.now() })); } catch (x) {}
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
