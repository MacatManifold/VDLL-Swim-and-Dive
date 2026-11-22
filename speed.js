// Warms up the other pages so tab switches don't start from zero.
// Chrome/Edge: speculation rules prefetch.
// Safari/Firefox: quietly fetch the pages into the HTTP cache once this page is idle.
(function () {
  if (window.__speed) return;
  window.__speed = true;
  var PAGES = ['index.html', 'jv.html', 'varsity.html', 'coaches.html', 'equipment.html'];
  var here = location.pathname.split('/').pop() || 'index.html';
  var others = PAGES.filter(function (p) { return p !== here; });
  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    var s = document.createElement('script');
    s.type = 'speculationrules';
    s.textContent = JSON.stringify({
      prefetch: [{ urls: others, eagerness: 'immediate' }],
    });
    document.head.appendChild(s);
    return;
  }
  var warm = function () {
    others.forEach(function (p) { fetch(p, { credentials: 'same-origin' }).catch(function () {}); });
  };
  var idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 600); })(warm); };
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle);
})();
