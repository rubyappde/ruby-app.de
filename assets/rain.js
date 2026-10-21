// Ruby – leise fallende Rubine im Hintergrund (nur Startseite und Einladungsseite).
// Wenige, kleine, halb durchsichtige Logos. Bei „Bewegung reduzieren“ gibt es keine.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var count = window.innerWidth < 700 ? 6 : 11;
  var css = document.createElement('style');
  css.textContent =
    '.ruby-rain{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}' +
    '.ruby-rain i{position:absolute;top:-40px;display:block;color:var(--ruby,#D10F55);animation:rr-fall linear infinite;will-change:transform}' +
    '.ruby-rain svg{display:block;width:100%;height:100%;animation:rr-sway ease-in-out infinite alternate}' +
    '@keyframes rr-fall{from{transform:translateY(0) rotate(0deg)}to{transform:translateY(calc(100vh + 80px)) rotate(var(--rot))}}' +
    '@keyframes rr-sway{from{transform:translateX(-14px)}to{transform:translateX(14px)}}';
  document.head.appendChild(css);
  var box = document.createElement('div');
  box.className = 'ruby-rain';
  box.setAttribute('aria-hidden', 'true');
  var gem = '<svg viewBox="0 0 100 100"><rect x="22" y="22" width="56" height="56" rx="12" transform="rotate(45 50 50)" fill="currentColor"/>' +
    '<rect x="40.5" y="40.5" width="19" height="19" rx="4" transform="rotate(45 50 50)" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5"/></svg>';
  for (var i = 0; i < count; i++) {
    var el = document.createElement('i');
    var size = 12 + Math.random() * 14;          // 12–26 px
    var dur = 16 + Math.random() * 14;           // 16–30 s pro Fall: ruhig
    el.style.left = (i + Math.random()) / count * 100 + '%';
    el.style.width = el.style.height = size + 'px';
    el.style.opacity = (0.12 + Math.random() * 0.18).toFixed(2);
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = -Math.random() * dur + 's'; // schon verteilt beim Laden
    el.style.setProperty('--rot', (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 180) + 'deg');
    el.innerHTML = gem;
    el.firstChild.style.animationDuration = 3 + Math.random() * 3 + 's';
    box.appendChild(el);
  }
  document.body.appendChild(box);
})();
