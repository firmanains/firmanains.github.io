// Theme toggle: system → light → dark → system. Saved per browser.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function current() {
    return root.getAttribute('data-theme') || 'system';
  }
  function label(mode) {
    return mode === 'system' ? 'Theme' : mode === 'dark' ? 'Dark' : 'Light';
  }
  function apply(mode) {
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    btn.textContent = label(mode);
    try {
      if (mode === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', mode);
    } catch (e) {}
  }

  btn.textContent = label(current());
  btn.addEventListener('click', function () {
    var next = { system: 'light', light: 'dark', dark: 'system' }[current()];
    apply(next);
  });
})();
