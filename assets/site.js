// Ruby – kleine Helfer für alle Seiten (kein Tracking, keine Cookies)
(function () {
  var cfg = window.RUBY || {};

  // Helles / dunkles Design: Wahl wird nur im Browser gemerkt (kein Cookie)
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var applyTheme = function (t) {
    root.setAttribute('data-theme', t);
    if (meta) meta.setAttribute('content', t === 'light' ? '#F6F5F2' : '#0B0B0D');
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      var toLight = t !== 'light';
      b.setAttribute('aria-label', toLight ? 'Helles Design einschalten' : 'Dunkles Design einschalten');
      b.setAttribute('title', toLight ? 'Helles Design' : 'Dunkles Design');
    });
  };
  applyTheme(root.getAttribute('data-theme') || 'dark');
  document.querySelectorAll('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('ruby-theme', next); } catch (e) { /* privates Fenster: dann eben nur für diesen Besuch */ }
    });
  });
  // Ohne eigene Wahl: dem Handy bzw. Computer folgen, auch wenn es später umschaltet
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var follow = function () {
      var saved = null;
      try { saved = localStorage.getItem('ruby-theme'); } catch (e) {}
      if (saved !== 'light' && saved !== 'dark') applyTheme(mq.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
  }

  // Kopfzeile bekommt beim Scrollen eine feine Linie
  var top = document.querySelector('.top');
  if (top) {
    var onScroll = function () { top.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Sanftes Einblenden
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // E-Mail-Adresse einsetzen: data-email = Text + Link, data-mailto = nur Link
  if (cfg.email) {
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.textContent = cfg.email;
      if (el.tagName === 'A') el.href = 'mailto:' + cfg.email;
    });
    document.querySelectorAll('[data-mailto]').forEach(function (el) { el.href = 'mailto:' + cfg.email; });
  }

  // Trailer: spielt stumm, sobald er im Bild ist; Ton nur auf Wunsch
  var vid = document.getElementById('trailer');
  if (vid) {
    var frame = vid.parentNode;
    var playBtn = frame.querySelector('.vid-play');
    var soundBtn = frame.querySelector('.vid-sound');
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var userPaused = false;
    var play = function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
    vid.addEventListener('play', function () { frame.classList.add('playing'); soundBtn.hidden = false; });
    vid.addEventListener('pause', function () { frame.classList.remove('playing'); });
    playBtn.addEventListener('click', function () { userPaused = false; play(); });
    vid.addEventListener('click', function () {
      if (vid.paused) { userPaused = false; play(); } else { userPaused = true; vid.pause(); }
    });
    soundBtn.addEventListener('click', function () {
      vid.muted = !vid.muted;
      soundBtn.classList.toggle('unmuted', !vid.muted);
      soundBtn.setAttribute('aria-label', vid.muted ? 'Ton einschalten' : 'Ton ausschalten');
      if (!vid.muted && vid.paused) play();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            if (!calm && !userPaused) play();
          } else if (!vid.paused) {
            vid.pause();
          }
        });
      }, { threshold: [0, 0.5] }).observe(frame);
    }
  }

  // Jahr in der Fußzeile
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Warteliste
  document.querySelectorAll('form.waitlist').forEach(function (form) {
    var msg = form.parentNode.querySelector('.form-msg');
    var say = function (text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'form-msg ' + (ok ? 'ok' : 'err');
    };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = form.querySelector('input[type=email]');
      var mail = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        say('Bitte gib eine gültige E-Mail-Adresse ein.', false);
        input.focus();
        return;
      }
      if (!cfg.waitlistEndpoint) {
        // Ohne Formular-Dienst: vorbereitete E-Mail öffnen
        var body = 'Hallo Ruby-Team,\n\nich möchte Bescheid bekommen, wenn Ruby startet.\nMeine E-Mail: ' + mail + '\n';
        window.location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Warteliste Ruby') + '&body=' + encodeURIComponent(body);
        say('Dein E-Mail-Programm öffnet sich. Einfach abschicken, fertig.', true);
        return;
      }
      var btn = form.querySelector('button');
      btn.disabled = true;
      fetch(cfg.waitlistEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, quelle: 'ruby-app.de' }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          say('Danke! Wir sagen dir Bescheid, sobald Ruby startet.', true);
        })
        .catch(function () { say('Das hat nicht geklappt. Versuch es bitte später noch einmal.', false); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
