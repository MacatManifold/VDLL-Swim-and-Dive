// Vista navy & silver, dark mode only. Also clears any light-mode choice saved by an earlier version of the site.
(function () {
  try { localStorage.removeItem('vdl-theme'); } catch (e) {}
  const root = document.documentElement;
  const VISTA = {
    '--page-base': '#020a1d',
    '--page-bg': 'radial-gradient(70% 50% at 100% 0%, rgba(0,32,78,.9), transparent 70%), radial-gradient(55% 45% at 0% 35%, rgba(10,42,102,.38), transparent 70%), radial-gradient(70% 45% at 50% 105%, rgba(0,32,78,.55), transparent 70%), linear-gradient(180deg, #041434 0%, #020a1d 60%, #01060f 100%)',
    '--glass-rgb': '214,224,240',
    '--panel-rgb': '8,24,60',
    '--scrim-rgb': '1,6,18',
  };
  Object.keys(VISTA).forEach(k => root.style.setProperty(k, VISTA[k]));
  root.dataset.theme = 'dark';
  root.style.colorScheme = 'dark';
  window.__getTheme = () => 'dark';
})();
