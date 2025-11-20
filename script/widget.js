/*
  VbC Widget — ultra-minimal version
  - Blank slate: injects a fixed colored rectangle on the left edge.
  - No API, no options, no Shadow DOM, no dependencies.
  - Safe to include multiple times (deduped by element id).
*/
(function(){
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var ID = 'vbc-widget-root';
  if (document.getElementById(ID)) return; // dedupe

  var el = document.createElement('div');
  el.id = ID;
  el.setAttribute('aria-hidden', 'true');
  // Bare minimum inline styles (blank slate)
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.top = '25%';
  el.style.width = '10px';
  el.style.height = '120px';
  el.style.background = '#0ea5e9';
  el.style.zIndex = '2147483640';
  el.style.pointerEvents = 'none';

  (document.body || document.documentElement).appendChild(el);
})();
