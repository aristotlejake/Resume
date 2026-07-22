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

  // ----- ACCESS GRANTED (shared by Konami code + secret profile triple-click) -----

  var accessFiring = false;

  function accessGranted() {
    if (accessFiring) return;
    accessFiring = true;
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
      setTimeout(function () { banner.remove(); accessFiring = false; }, 600);
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

  // ----- 3. Konami code -----

  function initKonami() {
    var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === sequence[pos]) {
        pos++;
        if (pos === sequence.length) {
          pos = 0;
          accessGranted();
        }
      } else {
        pos = (key === sequence[0]) ? 1 : 0;
      }
    });
  }

  // ----- 8. Harry Potter portrait: three rapid clicks → the photo briefly comes alive -----

  function initProfileTripleClick() {
    var photo = document.querySelector('.profile-img');
    if (!photo) return;
    var clicks = 0;
    var resetTimer = null;
    var animating = false;

    photo.addEventListener('click', function () {
      if (animating) return;
      clicks++;
      if (resetTimer) clearTimeout(resetTimer);
      if (clicks >= 3) {
        clicks = 0;
        wakePortrait();
        return;
      }
      resetTimer = setTimeout(function () { clicks = 0; }, 600);
    });

    function wakePortrait() {
      animating = true;
      var DURATION = 4000;
      var video = document.querySelector('.profile-video');

      if (video) {
        try {
          video.currentTime = 0;
          var p = video.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
          video.classList.add('is-playing');
        } catch (e) { /* noop */ }
      }

      setTimeout(function () {
        if (video) {
          video.classList.remove('is-playing');
          setTimeout(function () { try { video.pause(); } catch (e) {} }, 320);
        }
        animating = false;
      }, DURATION);
    }
  }

  // ----- 4. Profile scan: click user icon → scan line over photo + AUTHENTICATED -----

  function initProfileScan() {
    var icon = document.querySelector('#about .section-title svg.icon');
    var photo = document.querySelector('.profile-img');
    if (!icon || !photo) return;
    icon.setAttribute('aria-label', 'Authenticate (try clicking)');
    var scanning = false;

    function scan() {
      if (scanning) return;
      scanning = true;

      var photoRect = photo.getBoundingClientRect();
      var line = el('div', 'ee-scanline');
      line.style.left = (photoRect.left + window.scrollX) + 'px';
      line.style.top = (photoRect.top + window.scrollY) + 'px';
      line.style.width = photoRect.width + 'px';
      line.style.setProperty('--scan-distance', photoRect.height + 'px');
      document.body.appendChild(line);

      setTimeout(function () { line.remove(); }, 1300);

      setTimeout(function () {
        var r = photo.getBoundingClientRect();
        var badge = el('div', 'ee-auth');
        badge.innerHTML = '<span class="ee-auth__check">✓</span> AUTHENTICATED';
        badge.style.left = (r.left + window.scrollX + r.width / 2) + 'px';
        badge.style.top = (r.top + window.scrollY + r.height * 0.65) + 'px';
        document.body.appendChild(badge);
        requestAnimationFrame(function () { badge.classList.add('ee-auth--in'); });
        setTimeout(function () {
          badge.classList.add('ee-auth--out');
          setTimeout(function () { badge.remove(); scanning = false; }, 450);
        }, 1500);
      }, 1100);
    }

    makeKeyboardActivatable(icon, scan);
  }

  // ----- 5. CPU pulse: click cpu icon → concentric rings + sparkles -----

  function initCpuPulse() {
    var icon = document.querySelector('#ai .section-title svg.icon');
    if (!icon) return;
    icon.setAttribute('aria-label', 'Pulse (try clicking)');

    function pulse() {
      var r = rectInDocument(icon);
      for (var i = 0; i < 3; i++) {
        (function (delay) {
          setTimeout(function () {
            var ring = el('div', 'ee-ring');
            ring.style.left = r.cx + 'px';
            ring.style.top = r.cy + 'px';
            document.body.appendChild(ring);
            setTimeout(function () { ring.remove(); }, 1300);
          }, delay);
        })(i * 220);
      }
      for (var s = 0; s < 9; s++) {
        var sparkle = el('div', 'ee-sparkle');
        sparkle.textContent = '✨';
        sparkle.style.left = r.cx + 'px';
        sparkle.style.top = r.cy + 'px';
        var jitterX = (Math.random() - 0.5) * 80;
        var jitterY = -(60 + Math.random() * 80);
        sparkle.style.setProperty('--dx', jitterX + 'px');
        sparkle.style.setProperty('--dy', jitterY + 'px');
        sparkle.style.animationDelay = (s * 60) + 'ms';
        document.body.appendChild(sparkle);
        setTimeout((function (n) { return function () { n.remove(); }; })(sparkle), 1600 + s * 60);
      }
    }

    makeKeyboardActivatable(icon, pulse);
  }

  // ----- 6. Briefcase years: click briefcase → year balloons fly up -----

  function initBriefcaseYears() {
    var icon = document.querySelector('#experience .section-title svg.icon');
    if (!icon) return;
    icon.setAttribute('aria-label', 'Career timeline (try clicking)');
    var years = ['2013', '2015', '2018', '2021', '2025'];

    function release() {
      var r = rectInDocument(icon);
      years.forEach(function (year, i) {
        setTimeout(function () {
          var badge = el('div', 'ee-year');
          badge.textContent = year;
          badge.style.left = r.cx + 'px';
          badge.style.top = r.cy + 'px';
          var dx = (Math.random() - 0.5) * 220;
          var dy = -(140 + Math.random() * 100);
          badge.style.setProperty('--dx', dx + 'px');
          badge.style.setProperty('--dy', dy + 'px');
          document.body.appendChild(badge);
          setTimeout(function () { badge.remove(); }, 1700);
        }, i * 130);
      });
    }

    makeKeyboardActivatable(icon, release);
  }

  // ----- 7. Trophy achievement: click trophy → game-style banner -----

  function initTrophyAchievement() {
    var icon = document.querySelector('#achievements .section-title svg.icon');
    if (!icon) return;
    icon.setAttribute('aria-label', 'Unlock achievement (try clicking)');
    var titles = ['Easter Egg Hunter', 'Trophy Inspector', 'Resume Sleuth',
                  'Curious Recruiter', 'Keen Observer'];
    var showing = false;

    function unlock() {
      if (showing) return;
      showing = true;
      var title = titles[Math.floor(Math.random() * titles.length)];

      var banner = el('div', 'ee-achievement');
      banner.innerHTML =
        '<div class="ee-achievement__icon">🏆</div>' +
        '<div class="ee-achievement__body">' +
        '<div class="ee-achievement__label">ACHIEVEMENT UNLOCKED</div>' +
        '<div class="ee-achievement__title"></div>' +
        '</div>';
      banner.querySelector('.ee-achievement__title').textContent = title;
      document.body.appendChild(banner);
      requestAnimationFrame(function () { banner.classList.add('ee-achievement--in'); });

      setTimeout(function () {
        banner.classList.add('ee-achievement--out');
        setTimeout(function () { banner.remove(); showing = false; }, 500);
      }, 2500);
    }

    makeKeyboardActivatable(icon, unlock);
  }

  // ----- 9. Core Competencies threat map: click globe → incoming attacks, all blocked -----

  function initCompetencyThreatMap() {
    var icon = document.querySelector('#competencies .section-title svg.icon');
    if (!icon) return;
    icon.setAttribute('aria-label', 'Threat map (try clicking)');
    var firing = false;

    function run() {
      if (firing) return;
      firing = true;
      var target = rectInDocument(icon);
      var total = 14;
      var blocked = 0;

      var counter = el('div', 'ee-threatcount');
      counter.textContent = 'THREATS BLOCKED: 0';
      counter.style.left = target.cx + 'px';
      counter.style.top = (target.cy - 28) + 'px';
      document.body.appendChild(counter);
      requestAnimationFrame(function () { counter.classList.add('ee-threatcount--in'); });

      for (var i = 0; i < total; i++) {
        (function (delay) {
          setTimeout(function () { launchThreat(); }, delay);
        })(i * 110);
      }

      function launchThreat() {
        // Origin: a random point on the viewport edge, in document coordinates.
        var vw = window.innerWidth, vh = window.innerHeight;
        var edge = Math.floor(Math.random() * 4), ox, oy;
        if (edge === 0) { ox = Math.random() * vw; oy = 0; }
        else if (edge === 1) { ox = vw; oy = Math.random() * vh; }
        else if (edge === 2) { ox = Math.random() * vw; oy = vh; }
        else { ox = 0; oy = Math.random() * vh; }
        ox += window.scrollX;
        oy += window.scrollY;

        var dx = target.cx - ox, dy = target.cy - oy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;

        var line = el('div', 'ee-threat-line');
        line.style.left = ox + 'px';
        line.style.top = oy + 'px';
        line.style.width = dist + 'px';
        line.style.transform = 'rotate(' + angle + 'deg)';
        document.body.appendChild(line);

        var dot = el('div', 'ee-threat-dot');
        dot.style.left = ox + 'px';
        dot.style.top = oy + 'px';
        dot.style.setProperty('--dx', dx + 'px');
        dot.style.setProperty('--dy', dy + 'px');
        document.body.appendChild(dot);

        setTimeout(function () {
          line.remove();
          dot.remove();

          var pop = el('div', 'ee-threat-block');
          pop.textContent = '✓';
          pop.style.left = target.cx + 'px';
          pop.style.top = target.cy + 'px';
          document.body.appendChild(pop);
          requestAnimationFrame(function () { pop.classList.add('ee-threat-block--in'); });
          setTimeout(function () { pop.remove(); }, 600);

          blocked++;
          counter.textContent = 'THREATS BLOCKED: ' + blocked;
          if (blocked === total) setTimeout(finish, 250);
        }, 640);
      }

      function finish() {
        counter.textContent = '0 ACTIVE THREATS · SECURED';
        counter.classList.add('ee-threatcount--done');
        setTimeout(function () {
          counter.classList.add('ee-threatcount--out');
          setTimeout(function () { counter.remove(); firing = false; }, 500);
        }, 1200);
      }
    }

    makeKeyboardActivatable(icon, run);
  }

  // ----- Boot -----

  function boot() {
    try { initRocket(); } catch (e) { /* noop */ }
    try { initStamps(); } catch (e) { /* noop */ }
    try { initKonami(); } catch (e) { /* noop */ }
    try { initProfileScan(); } catch (e) { /* noop */ }
    try { initCpuPulse(); } catch (e) { /* noop */ }
    try { initBriefcaseYears(); } catch (e) { /* noop */ }
    try { initTrophyAchievement(); } catch (e) { /* noop */ }
    try { initProfileTripleClick(); } catch (e) { /* noop */ }
    try { initCompetencyThreatMap(); } catch (e) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
