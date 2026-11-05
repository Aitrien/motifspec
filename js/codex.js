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
    // Component previews run in their own documents; keep them in the page's theme.
    document.querySelectorAll('.cx-preview__frame').forEach(function (f) {
      try { var r = f.contentDocument && f.contentDocument.documentElement; if (r) { if (pref === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', pref); } } catch (e) { /* not ready yet */ }
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

    // Component previews: size each frame to its document's body (the root is never shorter than the frame), and keep
    // its theme. Inside a preview, links don't navigate.
    document.querySelectorAll('.cx-preview__frame').forEach(function (f) {
      var fit = function () {
        try { var d = f.contentDocument; if (d && d.body) f.style.setProperty('--_frame-height', d.body.offsetHeight + 'px'); } catch (e) { /* cross-origin: keep the default height */ }
      };
      var start = function () {
        apply(theme); fit();
        try { if ('ResizeObserver' in window) new ResizeObserver(fit).observe(f.contentDocument.body); } catch (e) { /* keep the measured height */ }
      };
      f.addEventListener('load', start);
      try { if (f.contentDocument && f.contentDocument.readyState === 'complete' && f.contentDocument.body && f.contentDocument.body.childNodes.length) start(); } catch (e) { /* wait for load */ }
    });
    if (document.body.classList.contains('cx-preview-body')) {
      document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[href]')) e.preventDefault(); });
    }

    // Tabs: turn the labelled panels into a tab list with one panel shown. Sets that share data-tabs stay in step,
    // and the choice is remembered for the next page (cx-tabs:<name> in localStorage).
    document.querySelectorAll('.cx-tabs').forEach(function (set, n) {
      var panels = Array.prototype.slice.call(set.querySelectorAll(':scope > .cx-tabs__panel'));
      if (panels.length < 2) return;
      var list = document.createElement('div'); list.className = 'cx-tabs__list'; list.setAttribute('role', 'tablist');
      if (set.getAttribute('aria-label')) list.setAttribute('aria-label', set.getAttribute('aria-label'));
      var tabs = panels.map(function (panel, i) {
        var label = panel.querySelector('.cx-tabs__label');
        var id = 'cx-tabs-' + n + '-' + i;
        var tab = document.createElement('button'); tab.type = 'button'; tab.className = 'cx-tabs__tab'; tab.id = id + '-tab';
        tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panel.id || (panel.id = id + '-panel'));
        tab.textContent = label ? label.textContent : 'Tab ' + (i + 1);
        panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id); panel.tabIndex = 0;
        list.appendChild(tab);
        return tab;
      });
      var key = set.dataset.tabs ? 'cx-tabs:' + set.dataset.tabs : null;
      var select = function (i, focus) {
        tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j ? 'true' : 'false'); t.tabIndex = i === j ? 0 : -1; panels[j].hidden = i !== j; });
        if (focus) tabs[i].focus();
      };
      set.insertBefore(list, panels[0]); set.classList.add('is-tabbed');
      var stored = null; try { stored = key && localStorage.getItem(key); } catch (e) { /* storage blocked */ }
      var first = tabs.findIndex(function (t) { return t.textContent === stored; });
      select(first < 0 ? 0 : first);
      set.addEventListener('cx-tabs-sync', function (e) { var i = tabs.findIndex(function (t) { return t.textContent === e.detail; }); if (i >= 0) select(i); });
      var choose = function (i, focus) {
        select(i, focus);
        if (!key) return;
        try { localStorage.setItem(key, tabs[i].textContent); } catch (e) { /* storage blocked */ }
        document.querySelectorAll('.cx-tabs[data-tabs="' + set.dataset.tabs + '"]').forEach(function (other) {
          if (other !== set) other.dispatchEvent(new CustomEvent('cx-tabs-sync', { detail: tabs[i].textContent }));
        });
      };
      tabs.forEach(function (t, i) { t.addEventListener('click', function () { choose(i); }); });
      list.addEventListener('keydown', function (e) {
        var at = tabs.indexOf(document.activeElement), last = tabs.length - 1;
        var to = { ArrowRight: at + 1 > last ? 0 : at + 1, ArrowLeft: at - 1 < 0 ? last : at - 1, Home: 0, End: last }[e.key];
        if (to === undefined || at < 0) return;
        e.preventDefault(); choose(to, true);
      });
    });

    // Search: a dialog over a Pagefind index. The trigger is shown once this script runs; Pagefind's script loads on the
    // first open. Ctrl+K or Cmd+K, or "/" outside a text field, opens it; Escape closes it (native to <dialog>).
    document.querySelectorAll('.cx-search[data-search]').forEach(function (dialog) {
      var input = dialog.querySelector('.cx-search__input');
      var list = dialog.querySelector('.cx-search__results');
      var status = dialog.querySelector('.cx-search__status');
      var triggers = document.querySelectorAll('[data-search-open][aria-controls="' + dialog.id + '"]');
      var pagefind = null, failed = false, seq = 0;
      var load = function () {
        if (!pagefind) pagefind = import(dialog.dataset.search).then(function (pf) { return pf.options({ excerptLength: 24 }).then(function () { return pf; }); });
        return pagefind;
      };
      // Pagefind marks matches with <mark> in an escaped excerpt; keep the text and the marks, nothing else.
      var excerpt = function (html) {
        var out = document.createDocumentFragment();
        new DOMParser().parseFromString('<p>' + html + '</p>', 'text/html').body.firstChild.childNodes.forEach(function (n) {
          if (n.nodeName === 'MARK') { var m = document.createElement('mark'); m.textContent = n.textContent; out.appendChild(m); }
          else out.appendChild(document.createTextNode(n.textContent));
        });
        return out;
      };
      var render = function (items, query) {
        list.replaceChildren();
        items.forEach(function (r) {
          var li = document.createElement('li');
          var a = document.createElement('a'); a.className = 'cx-search__result'; a.href = r.url;
          var t = document.createElement('span'); t.className = 'cx-search__title'; t.textContent = (r.meta && r.meta.title) || r.url;
          var e = document.createElement('span'); e.className = 'cx-search__excerpt'; e.appendChild(excerpt(r.excerpt || ''));
          a.append(t, e); li.appendChild(a); list.appendChild(li);
        });
        status.textContent = !query ? '' : items.length ? items.length + (items.length === 1 ? ' result' : ' results') : 'No results for \u201c' + query + '\u201d';
      };
      var search = function () {
        var q = input.value.trim(), n = ++seq;
        if (!q) { render([], ''); return; }
        if (failed) return;
        load().then(function (pf) { return pf.debouncedSearch(q, {}, 150); }).then(function (s) {
          if (!s || n !== seq) return null;
          return Promise.all(s.results.slice(0, 8).map(function (r) { return r.data(); }));
        }).then(function (items) { if (items && n === seq) render(items, q); }, function () {
          failed = true; list.replaceChildren(); status.textContent = 'Search isn\u2019t available right now.';
        });
      };
      var back = null;
      var open = function () { if (!dialog.open) { back = document.activeElement; dialog.showModal(); input.select(); load().catch(function () {}); } };
      dialog.addEventListener('close', function () { if (back && back.isConnected && back.focus) back.focus(); back = null; });
      triggers.forEach(function (t) { t.hidden = false; t.addEventListener('click', open); });
      dialog.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      input.addEventListener('input', search);
      // Escape closes, even from the field (a search field would otherwise spend the first Escape clearing itself).
      // Arrow keys move between the field and the results; Enter follows a result as any link does.
      dialog.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); dialog.close(); return; }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var links = Array.prototype.slice.call(list.querySelectorAll('a'));
        if (!links.length) return;
        var at = links.indexOf(document.activeElement);
        var next = e.key === 'ArrowDown' ? (at < 0 ? 0 : Math.min(at + 1, links.length - 1)) : at - 1;
        e.preventDefault();
        if (next < 0) input.focus(); else links[next].focus();
      });
      document.addEventListener('keydown', function (e) {
        var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)) {
          e.preventDefault(); open();
        }
      });
    });

    // Copy page: copies the page's Markdown (its index.md) as plain text. ClipboardItem takes a promise, so the copy
    // still counts as part of the click while the file loads; without it, the text is fetched first.
    document.querySelectorAll('[data-copy-page]').forEach(function (btn) {
      var label = btn.querySelector('.cx-page-actions__label');
      var icon = btn.querySelector('use');
      var set = function (state, text, iconId) {
        btn.dataset.state = state; if (label) label.textContent = text;
        if (icon) icon.setAttribute('href', '#cx-icon-' + iconId);
      };
      var done = function (ok) {
        set(ok ? 'copied' : 'failed', ok ? 'Copied' : 'Couldn\u2019t copy', ok ? 'check' : 'content-copy');
        setTimeout(function () { set('', 'Copy page', 'content-copy'); }, ms('--cx-motion-duration-plate'));
      };
      if (!navigator.clipboard) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var text = fetch(btn.dataset.copyPage).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); });
        var copied = window.ClipboardItem && navigator.clipboard.write
          ? navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then(function (t) { return new Blob([t], { type: 'text/plain' }); }) })])
          : text.then(function (t) { return navigator.clipboard.writeText(t); });
        copied.then(function () { done(true); }, function () { done(false); });
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
