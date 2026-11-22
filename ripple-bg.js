/*
 *   Hey Eagle — if you're reading this, you looked under the hood. Of course you did.
 *
 *        ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~
 *            _o     <- you, mid-flip-turn
 *     ~ ~  /\/  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
 *           \
 *
 *   Hint: the pool listens. Try typing "eagles" anywhere on the page.
 *   (Or open the console and call splash().)
 *
 *   swim fast kid - Mac
 */
(function () {
  if (window.__rippleBg) return;
  window.__rippleBg = true;
  const root = document.documentElement.style;
  root.setProperty('--frost', `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`);
  const chromium = !!(navigator.userAgentData && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand))) || (/Chrome\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent));
  const addDefs = () => {
    if (document.getElementById('glass-defs')) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'glass-defs'; s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = '<filter id="glass-distort" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".018 .026" numOctaves="2" seed="7" result="t"/><feGaussianBlur in="t" stdDeviation="1.5" result="tb"/><feDisplacementMap in="SourceGraphic" in2="tb" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter>';
    document.body.appendChild(s);
  };
  if (chromium) {
    root.setProperty('--glass-bf', 'url(#glass-distort) blur(20px) saturate(130%) brightness(var(--bd-b, .55))');
    root.setProperty('--glass-bf-frost', 'url(#glass-distort) blur(30px) saturate(120%) brightness(var(--bd-b, .45))');
    root.setProperty('--glass-bf-strong', 'url(#glass-distort) blur(36px) saturate(130%) brightness(var(--bd-b, .5))');
  }
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onBody = fn => document.body ? fn() : document.addEventListener('DOMContentLoaded', fn);
  onBody(addDefs);
  if (reduce) return;
  const CURSOR_RIPPLES = false; // set true to bring back the cursor ripple
  const CELL = 6, DAMP = 0.975;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '-1', mixBlendMode: 'screen' });
  const ctx = cv.getContext('2d');
  let RC = [8, 26, 92, 85];
  const setTheme = mode => {
    const light = mode === 'light';
    RC = light ? [70, 105, 175, 70] : [8, 26, 92, 85];
    cv.style.mixBlendMode = light ? 'multiply' : 'screen';
  };
  setTheme(document.documentElement.dataset.theme);
  addEventListener('themechange', e => setTheme(e.detail));
  let W, H, a, b, img;
  const resize = () => {
    W = Math.ceil(innerWidth / CELL) + 2; H = Math.ceil(innerHeight / CELL) + 2;
    cv.width = W; cv.height = H;
    a = new Float32Array(W * H); b = new Float32Array(W * H);
    img = ctx.createImageData(W, H);
  };
  const place = () => {
    const host = document.querySelector('[data-ripple-host]');
    if (host && cv.parentNode !== host) host.insertBefore(cv, host.firstChild);
    return !!host;
  };
  const mount = () => {
    resize();
    if (!place()) document.body.appendChild(cv);
    new MutationObserver(() => { if (!cv.isConnected || !cv.parentNode.hasAttribute('data-ripple-host')) place(); }).observe(document.body, { childList: true, subtree: true });
  };
  onBody(mount);
  addEventListener('resize', resize);

  let raf = null, lx = null, ly = null, idle = 0;
  function disturb(x, y, amt, rad) {
    const cx = x / CELL | 0, cy = y / CELL | 0;
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
      const d = Math.hypot(i, j); if (d > rad) continue;
      const px = cx + i, py = cy + j;
      if (px < 1 || py < 1 || px >= W - 1 || py >= H - 1) continue;
      a[py * W + px] += amt * (Math.cos(d / rad * Math.PI) + 1) * 0.5;
    }
  }
  addEventListener('pointermove', e => {
    if (!CURSOR_RIPPLES) return;
    if (!a) return;
    const x = e.clientX, y = e.clientY;
    if (lx === null) { lx = x; ly = y; }
    const dist = Math.hypot(x - lx, y - ly), steps = Math.max(1, Math.ceil(dist / CELL / 2));
    const amt = Math.min(1.1, 0.18 + dist / 80);
    for (let s = 1; s <= steps; s++) disturb(lx + (x - lx) * s / steps, ly + (y - ly) * s / steps, amt / steps * 2, 3);
    lx = x; ly = y; idle = 0; kick();
  }, { passive: true });
  const splash = (x, y) => {
    if (!a) return;
    disturb(x, y, 10, 7); idle = 0; kick();
    setTimeout(() => { disturb(x, y, -6, 5); idle = 0; kick(); }, 90);
  };
  // 🥚 for the curious ones
  const wave = () => {
    const n = 9;
    for (let i = 0; i < n; i++) setTimeout(() => splash(innerWidth * (i + 0.5) / n, innerHeight * (0.35 + 0.3 * Math.sin(i * 0.9))), i * 110);
    console.log('%c🌊 Nice find, Eagle! 🌊%c\nYou found the easter egg. Now go drop a second off that 100. 🦅', 'font:600 18px system-ui;color:#7ec8f4', 'font:13px system-ui;color:#cfe0f5');
  };
  window.splash = wave;
  let typed = '';
  addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed === 'eagles') { typed = ''; wave(); }
  });
  document.addEventListener('mouseleave', () => { lx = null; });

  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  let acc = 0, energy = 0;
  const SPEED = 0.65;
  function tick() {
    raf = null;
    acc += SPEED;
    let stepped = false;
    if (acc >= 1) { acc -= 1; step(); stepped = true; }
    if (stepped) render();
    if (energy / (W * H) > 0.0006 || idle++ < 45) kick();
    else ctx.clearRect(0, 0, W, H);
  }
  function step() {
    energy = 0;
    for (let y = 1; y < H - 1; y++) {
      const r = y * W;
      for (let x = 1; x < W - 1; x++) {
        const k = r + x;
        const v = ((a[k - 1] + a[k + 1] + a[k - W] + a[k + W]) * 0.5 - b[k]) * DAMP;
        b[k] = v; energy += v < 0 ? -v : v;
      }
    }
    const t = a; a = b; b = t;
  }
  function render() {
    const px = img.data;
    for (let y = 1; y < H - 1; y++) {
      const r = y * W;
      for (let x = 1; x < W - 1; x++) {
        const k = r + x;
        const sx = a[k + 1] - a[k - 1], sy = a[k + W] - a[k - W];
        let l = (sx * 0.7 - sy * 0.7) * 0.9 + Math.abs(a[k]) * 0.25;
        l = l < 0 ? 0 : l > 1 ? 1 : l;
        const o = k * 4;
        px[o] = RC[0]; px[o + 1] = RC[1]; px[o + 2] = RC[2]; px[o + 3] = l * RC[3];
      }
    }
    ctx.putImageData(img, 0, 0);
  }
})();
