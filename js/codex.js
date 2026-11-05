// MotifSpec behaviour: theme toggle, the backdrop header's scroll state, tooltip dismissal, code copy buttons,
// TOC docking and active section.
// Shipped as dist/codex.js (@aitrien/motifspec/codex.js) and inlined into the showcase, so there is one implementation.
// Enhancement only. Without this script: themes follow the system, code is selectable, the TOC is a plain open list,
// and every control that needs script stays hidden. Load it with `defer`; it also works inline at the end of <body>.
// Pair it with dist/theme-init.js inline in <head>, which applies a stored theme before first paint.
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'cx-theme';
  var system = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var sys = function () { return system && system.matches ? 'dark' : 'light'; };

  function read() { try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'auto'; } catch (e) { return 'auto'; } }
  function write(v) { try { if (v === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: theme still applies for this view */ } }
  var shown = function (pref) { return pref === 'auto' ? sys() : pref; };
  function apply(pref) {
    if (pref === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', pref);
    var label = 'Switch to ' + (shown(pref) === 'dark' ? 'light' : 'dark') + ' theme';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', label);
      var tip = b.querySelector('.cx-tooltip'); if (tip) tip.textContent = label;
    });
  }

  // Durations come from the tokens, never from literals in this file.
  function ms(name) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  }

  var theme = read();
  apply(theme);
  if (system && system.addEventListener) system.addEventListener('change', function () { apply(theme); });

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    apply(theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        var next = shown(theme) === 'dark' ? 'light' : 'dark';
        theme = next === sys() ? 'auto' : next; // matching the system again means following it again
        apply(theme); write(theme);
      });
    });

    // Escape hides any open tooltip without moving the pointer or focus (WCAG 1.4.13).
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.cx-tooltip').forEach(function (t) { t.parentElement.classList.add('is-tooltip-dismissed'); });
    });
    document.querySelectorAll('.cx-tooltip').forEach(function (t) {
      var host = t.parentElement;
      var reset = function () { host.classList.remove('is-tooltip-dismissed'); };
      host.addEventListener('mouseleave', reset);
      host.addEventListener('focusout', reset);
    });

    // The sticky header's height, for scroll-padding-top and the docked TOC: it wraps to two rows on narrow screens.
    var header = document.querySelector('.cx-header');
    if (header) {
      var end = header.querySelector('.cx-header__end'), mark = header.querySelector('.cx-wordmark');
      var measure = function () {
        root.style.setProperty('--_header-height', header.offsetHeight + 'px');
        root.style.setProperty('--_viewport-height', window.innerHeight + 'px');
        // When the nav and controls wrap below the wordmark, mark the header so the nav aligns with the page text.
        if (end && mark) header.toggleAttribute('data-wrapped', end.offsetTop > mark.offsetTop + mark.offsetHeight / 2);
      };
      measure();
      if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header); else window.addEventListener('resize', measure);
    }

    // Backdrop pages: the header starts on the frost and scrolls with the page. Once the script marks it, it sticks,
    // and data-scrolled="true" fades its surface in as soon as the page leaves the top; back at the top it fades out.
    // Without this script it keeps scrolling away, which is safe: it never sits see-through over the text.
    document.querySelectorAll('.cx-backdrop-page .cx-header').forEach(function (header) {
      var queued = false;
      var set = function () { queued = false; header.setAttribute('data-scrolled', window.scrollY > 0 ? 'true' : 'false'); };
      set();
      window.addEventListener('scroll', function () { if (!queued) { queued = true; window.requestAnimationFrame(set); } }, { passive: true });
    });

    // Copy buttons on code blocks.
    document.querySelectorAll('.cx-code').forEach(function (block) {
      var btn = block.querySelector('.cx-code__copy');
      var code = block.querySelector('pre code');
      if (!btn || !code) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var text = Array.prototype.map.call(code.querySelectorAll('.cl'), function (l) { return l.textContent; }).join('') || code.textContent;
        var label = btn.querySelector('.cx-code__copy-label');
        var icon = btn.querySelector('[data-copy-icon]');
        var set = function (state, text, iconId) {
          btn.dataset.state = state; label.textContent = text;
          if (icon) icon.setAttribute('href', '#cx-icon-' + iconId);
        };
        var done = function (ok) {
          set(ok ? 'copied' : 'selected', ok ? 'Copied' : 'Selected, press Ctrl+C', ok ? 'check' : 'content-copy');
          setTimeout(function () { set('', 'Copy', 'content-copy'); }, ms('--cx-motion-duration-plate'));
        };
        var select = function () { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, select);
        else select();
      });
    });

    // Docs navigation: dock it (sticky, scrolling on its own) while it sits beside the main column, as the TOC does.
    document.querySelectorAll('.cx-docs').forEach(function (docs) {
      var nav = docs.querySelector('.cx-docs-nav');
      var main = docs.querySelector('.cx-docs__main');
      if (!nav || !main) return;
      var dock = function () {
        root.style.setProperty('--_viewport-height', window.innerHeight + 'px');
        nav.classList.toggle('is-docked', Math.abs(nav.offsetTop - main.offsetTop) < 1);
      };
      dock(); window.addEventListener('resize', dock);
      // Bring the current page into view inside the docked navigation.
      var current = nav.querySelector('[aria-current="page"]');
      if (current && nav.classList.contains('is-docked') && current.offsetTop > nav.clientHeight / 2) nav.scrollTop = current.offsetTop - nav.clientHeight / 2;
    });

    // Table of contents: dock beside the article when there is room, and mark the current section.
    document.querySelectorAll('.cx-article').forEach(function (article) {
      var toc = article.querySelector('.cx-toc');
      var main = article.querySelector('.cx-article__main');
      if (!toc || !main) return;
      var dock = function () { toc.classList.toggle('is-docked', Math.abs(toc.offsetTop - main.offsetTop) < 1); };
      dock(); window.addEventListener('resize', dock);
      var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
        });
      }, { rootMargin: '0px 0px -70% 0px' });
      links.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) io.observe(t); });
    });
  });
})();
