// Ruby – kleine Helfer für alle Seiten (kein Tracking, keine Cookies)
(function () {
  var cfg = window.RUBY || {};

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
