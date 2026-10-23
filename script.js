(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };

  // Uptime since the first production month, so neofetch never goes stale.
  var up = document.getElementById('uptime');
  if (up) {
    var now = new Date();
    var m = (now.getFullYear() - 2025) * 12 + now.getMonth() - 4; // May 2025
    var y = Math.floor(m / 12), r = m % 12;
    up.textContent = (y ? y + ' year' + (y > 1 ? 's' : '') : '') +
      (y && r ? ', ' : '') + (r ? r + ' month' + (r > 1 ? 's' : '') : '') + ' in production';
  }

  // tmux clock, Jakarta time
  var clock = document.getElementById('clock');
  function tick() {
    clock.textContent = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: '2-digit'
    }).replace(',', '');
  }
  if (clock) { tick(); setInterval(tick, 30000); }

  var hasIO = 'IntersectionObserver' in window;

  // ---- scroll-triggered typing: each command types itself, then its output prints line by line ----
  function linesOf(el) {
    if (el.matches('ul, dl, .body, .tree, .plan')) {
      return [].slice.call(el.children).reduce(function (a, c) { return a.concat(linesOf(c)); }, []);
    }
    return [el];
  }
  function outputOf(cmd) {
    var out = [], n = cmd.nextElementSibling;
    while (n && !n.matches('.cmd') && !n.querySelector('.cmd')) { out = out.concat(linesOf(n)); n = n.nextElementSibling; }
    return out;
  }

  var cmds = [].slice.call(document.querySelectorAll('.cmd')).filter(function (c) { return !c.querySelector('.typed'); });
  var typer = null, queue = Promise.resolve();

  function reveal(c) {
    if (!c._t || c._done) return;
    c._done = true;
    if (typer) typer.unobserve(c);
    c._t.textContent = c._text;
    if (c._cur) c._cur.remove();
    c._lines.forEach(function (l) { l.classList.remove('pending'); });
  }
  // Jumping to a section: everything above it is shown at once, so the queue never makes you wait.
  function fastForward(target) {
    if (!target) return;
    cmds.forEach(function (c) {
      if (c.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) reveal(c);
    });
  }
  async function play(c) {
    if (c._done) return;
    c._cur = document.createElement('span'); c._cur.className = 'cursor';
    c.appendChild(c._cur);
    for (var i = 1; i <= c._text.length; i++) {
      if (c._done) return;
      c._t.textContent = c._text.slice(0, i);
      await sleep(16 + Math.random() * 28);
    }
    await sleep(110);
    if (c._done) return;
    c._cur.remove();
    for (var j = 0; j < c._lines.length; j++) {
      if (c._done) return;
      c._lines[j].classList.remove('pending');
      c._lines[j].classList.add('line-in');
      await sleep(26);
    }
    c._done = true;
  }

  if (!reduce && hasIO) {
    cmds.forEach(function (c) {
      var ps1 = c.querySelector('.ps1');
      c._text = c.textContent.slice(ps1.textContent.length).trim();
      while (ps1.nextSibling) c.removeChild(ps1.nextSibling);
      c._t = document.createElement('span');
      c.appendChild(document.createTextNode(' '));
      c.appendChild(c._t);
      c._lines = outputOf(c);
      c._lines.forEach(function (l) { l.classList.add('pending'); });
    });
    typer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        typer.unobserve(e.target);
        queue = queue.then(function () { return play(e.target); });
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    cmds.forEach(function (c) { typer.observe(c); });
    if (location.hash) fastForward(document.querySelector(location.hash));
  }

  // ---- tmux: active window follows scroll; clicking jumps without waiting on animations ----
  var links = [].slice.call(document.querySelectorAll('.tmux nav a'));
  links.forEach(function (a) { a.addEventListener('click', function () { fastForward(document.querySelector(a.hash)); }); });
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.hash === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.hash); if (s) spy.observe(s); });
  }

  // ---- dock: always-visible prompt ----
  var dock = document.getElementById('dock'), input = document.getElementById('cmd'), dout = document.getElementById('dock-out');
  if (!dock) return;
  dock.hidden = false;
  var ps1html = dock.querySelector('.ps1').outerHTML, hist = [], hi = 0, busy = false;

  function go(id) { return function () { var t = document.getElementById(id); fastForward(t); t.scrollIntoView(); return ''; }; }
  function open(url) { return function () { window.open(url, '_blank', 'noopener'); return 'opening ' + url; }; }
  var table = {
    help: function () { return 'whoami  work  projects  log  contact  github  linkedin  email  history  clear\n(esc closes this, skips animations)'; },
    whoami: go('whoami'), neofetch: go('whoami'),
    ls: go('work'), work: go('work'),
    projects: go('projects'), tree: go('projects'),
    log: go('log'), journalctl: go('log'),
    contact: go('contact'), finger: go('contact'),
    github: open('https://github.com/firmanains'),
    linkedin: open('https://www.linkedin.com/in/firmanains'),
    email: function () { location.href = 'mailto:firmanains@gmail.com'; return 'opening mail client'; },
    history: function () { return hist.map(function (h, i) { return '  ' + (i + 1) + '  ' + h; }).join('\n'); },
    pwd: function () { return '/home/firman'; },
    date: function () { return new Date().toString(); },
    sudo: function (args) {
      return args.join(' ') === 'hire firman'
        ? '[sudo] password for recruiter: ********\naccess granted. firmanains@gmail.com is waiting for your message.'
        : 'firman is not in the sudoers file. This incident will be reported.';
    },
    rm: function () { return 'rm: refusing to touch production. read ~/work/kafka-high-availability.md instead.'; },
    exit: function () { return 'logout\n...there is nowhere to go. try `help`.'; },
    clear: function () { return null; }
  };

  function run(line) {
    line = line.trim();
    if (!line) return;
    hist.push(line); hi = hist.length;
    var parts = line.split(/\s+/), name = parts[0].toLowerCase(), res, err = false;
    if (name === 'echo') res = parts.slice(1).join(' ');
    else if (table.hasOwnProperty(name)) res = table[name](parts.slice(1));
    else { res = 'zsh: command not found: ' + parts[0]; err = true; }
    if (!res) { dout.hidden = true; return; }
    var echo = document.createElement('div');
    echo.innerHTML = ps1html + ' ';                    // trusted markup
    echo.appendChild(document.createTextNode(line));   // user text stays text
    var r = document.createElement('div');
    r.className = 'res' + (err ? ' err' : '');
    r.textContent = res;
    dout.textContent = '';
    dout.appendChild(echo); dout.appendChild(r);
    dout.hidden = false;
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      hi = Math.max(0, Math.min(hist.length, hi + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = hist[hi] || '';
    } else if (e.key === 'Enter') {
      run(input.value); input.value = '';
    }
  });

  // quick-command buttons type themselves into the prompt, then run
  [].slice.call(dock.querySelectorAll('[data-cmd]')).forEach(function (b) {
    b.addEventListener('click', async function () {
      if (busy) return;
      busy = true;
      var text = b.getAttribute('data-cmd');
      input.value = '';
      for (var i = 0; i < text.length; i++) { input.value += text[i]; await sleep(45); }
      await sleep(160);
      run(text); input.value = ''; busy = false;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dout.hidden = true; cmds.forEach(reveal); }
  });
})();
