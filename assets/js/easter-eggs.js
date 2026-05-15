(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('print').matches) return;

  // ----- Utilities -----

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function rectInDocument(node) {
    var r = node.getBoundingClientRect();
    return {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      width: r.width,
      height: r.height,
      cx: r.left + window.scrollX + r.width / 2,
      cy: r.top + window.scrollY + r.height / 2
    };
  }

  function makeKeyboardActivatable(node, handler) {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.style.cursor = 'pointer';
    node.addEventListener('click', handler);
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler(e);
      }
    });
  }

  // ----- 1. Rocket launch -----

  function initRocket() {
    var icon = document.querySelector('#skills .section-title svg.icon');
    if (!icon) return;
    icon.setAttribute('aria-label', 'Launch (try clicking)');

    var launching = false;

    function launch() {
      if (launching) return;
      launching = true;
      var origin = rectInDocument(icon);
      var rocket = el('div', 'ee-rocket');
      rocket.textContent = '🚀';
      rocket.style.left = origin.cx + 'px';
      rocket.style.top = origin.cy + 'px';
      document.body.appendChild(rocket);

      var dx = window.innerWidth * 0.85;
      var dy = -(window.innerHeight + origin.cy - window.scrollY) * 0.9;
      var duration = 1900;
      var start = performance.now();
      var lastParticle = 0;

      function tick(now) {
        var t = Math.min(1, (now - start) / duration);
        var ease = t * t;
        var x = dx * t;
        var y = dy * ease;
        rocket.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(-45deg)';
        rocket.style.opacity = t > 0.85 ? (1 - t) / 0.15 : 1;

        if (now - lastParticle > 35) {
          spawnTrail(origin.cx + x + 4, origin.cy + y + 4);
          lastParticle = now;
        }

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          rocket.remove();
          launching = false;
        }
      }
      requestAnimationFrame(tick);
    }

    function spawnTrail(x, y) {
      var p = el('div', 'ee-trail');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 700);
    }

    makeKeyboardActivatable(icon, launch);
  }

  // ----- 2. PASS stamp on PCI-DSS / SOC 2 / CISSP -----

  function initStamps() {
    var targets = ['PCI-DSS', 'SOC 2', 'CISSP'];
    var nodes = document.querySelectorAll('strong, .project-title');
    nodes.forEach(function (node) {
      if (targets.indexOf(node.textContent.trim()) === -1) return;
      node.classList.add('ee-stampable');
      makeKeyboardActivatable(node, function () { stampOn(node); });
      node.setAttribute('aria-label', node.textContent.trim() + ' — click to stamp PASS');
    });

    function stampOn(node) {
      var r = rectInDocument(node);
      var stamp = el('div', 'ee-stamp');
      stamp.textContent = 'PASS ✓';
      stamp.style.left = r.cx + 'px';
      stamp.style.top = r.cy + 'px';
      document.body.appendChild(stamp);
      requestAnimationFrame(function () { stamp.classList.add('ee-stamp--in'); });

      var colors = ['#e63946', '#f1c40f', '#4fb3bf', '#2ecc71', '#9b59b6'];
      for (var i = 0; i < 18; i++) {
        var c = el('div', 'ee-confetti');
        var angle = Math.random() * Math.PI * 2;
        var dist = 50 + Math.random() * 90;
        c.style.left = r.cx + 'px';
        c.style.top = r.cy + 'px';
        c.style.background = colors[i % colors.length];
        c.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        c.style.setProperty('--dy', (Math.sin(angle) * dist - 20) + 'px');
        c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        c.style.animationDelay = (Math.random() * 60) + 'ms';
        document.body.appendChild(c);
        setTimeout((function (n) { return function () { n.remove(); }; })(c), 1100);
      }

      setTimeout(function () {
        stamp.classList.add('ee-stamp--out');
        setTimeout(function () { stamp.remove(); }, 500);
      }, 1300);
    }
  }

  // ----- 3. Konami code -----

  function initKonami() {
    var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;
    var firing = false;

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === sequence[pos]) {
        pos++;
        if (pos === sequence.length) {
          pos = 0;
          if (!firing) accessGranted();
        }
      } else {
        pos = (key === sequence[0]) ? 1 : 0;
      }
    });

    function accessGranted() {
      firing = true;
      var banner = el('div', 'ee-banner');
      var inner = el('div', 'ee-banner__inner');
      inner.textContent = '> ACCESS GRANTED';
      banner.appendChild(inner);
      var cursor = el('span', 'ee-banner__cursor');
      cursor.textContent = '_';
      inner.appendChild(cursor);
      document.body.appendChild(banner);
      requestAnimationFrame(function () { banner.classList.add('ee-banner--in'); });

      var bursts = 6;
      for (var b = 0; b < bursts; b++) {
        setTimeout(firework, b * 320);
      }

      setTimeout(function () {
        banner.classList.add('ee-banner--out');
        setTimeout(function () { banner.remove(); firing = false; }, 600);
      }, 2600);
    }

    function firework() {
      var cx = window.scrollX + window.innerWidth * (0.2 + Math.random() * 0.6);
      var cy = window.scrollY + window.innerHeight * (0.2 + Math.random() * 0.5);
      var palette = ['#4fb3bf', '#67d0db', '#e63946', '#f1c40f', '#2ecc71', '#f39c12'];
      var color = palette[Math.floor(Math.random() * palette.length)];
      var count = 34;
      for (var i = 0; i < count; i++) {
        var p = el('div', 'ee-firework');
        var angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
        var dist = 70 + Math.random() * 90;
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.background = color;
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', (Math.sin(angle) * dist) + 'px');
        document.body.appendChild(p);
        setTimeout((function (n) { return function () { n.remove(); }; })(p), 1300);
      }
    }
  }

  // ----- Boot -----

  function boot() {
    try { initRocket(); } catch (e) { /* noop */ }
    try { initStamps(); } catch (e) { /* noop */ }
    try { initKonami(); } catch (e) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
