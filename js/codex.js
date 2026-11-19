// MotifSpec behaviour: theme toggle, the backdrop header's scroll state, tooltip dismissal, code copy buttons,
// TOC docking and active section, alert dismissal, toasts, date pickers and dialogs.
// Shipped as dist/codex.js (@aitrien/motifspec/codex.js).
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
  }  // A length token in pixels, measured by the browser, so rem, clamp() and calc() values all resolve.
  function px(name) {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;inline-size:var(' + name + ')';
    (document.body || document.documentElement).appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
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
    // A docs header (cx-header--docs) is marked the same way, so it shows the wordmark in full at the top of the page
    // and compacts once the page scrolls.
    document.querySelectorAll('.cx-backdrop-page .cx-header, .cx-header--docs').forEach(function (header) {
      var queued = false;
      var set = function () { queued = false; header.setAttribute('data-scrolled', window.scrollY > 0 ? 'true' : 'false'); };
      set();
      window.addEventListener('scroll', function () { if (!queued) { queued = true; window.requestAnimationFrame(set); } }, { passive: true });
    });

    // The docs header's "On this page" and menu are <details>, so they open and close without script. With it, one
    // opens at a time, and they close on Escape, on a click outside them, and when a link in them is followed.
    var panels = Array.prototype.slice.call(document.querySelectorAll('.cx-header__toc, .cx-header__menu'));
    panels.forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) panels.forEach(function (o) { if (o !== d) o.open = false; }); });
      d.addEventListener('click', function (e) { if (e.target.closest('a[href]')) d.open = false; });
    });
    if (panels.length) {
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        panels.forEach(function (d) { if (d.open) { d.open = false; d.querySelector('summary').focus(); } });
      });
      document.addEventListener('click', function (e) { panels.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; }); });
    }

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
    // its theme. An open dialog or popover (a calendar) sits above the body, so while one is open the frame also grows
    // to hold it, and shrinks back when it closes. Inside a preview, links don't navigate.
    document.querySelectorAll('.cx-preview__frame').forEach(function (f) {
      var fit = function () {
        try {
          var d = f.contentDocument; if (!d || !d.body) return;
          var need = d.body.offsetHeight, room = px('--cx-space-section-sm');
          d.querySelectorAll('dialog[open], [popover]').forEach(function (o) {
            if (o.matches('dialog[open]')) {
              // its parts' full heights, since a dialog with too little room scrolls its body and reports less
              var h = 0;
              o.querySelectorAll(':scope > :not(form), :scope > form > *').forEach(function (c) { h += c.scrollHeight; });
              need = Math.max(need, h + 2 * room);
            }
            else if (o.matches(':popover-open')) need = Math.max(need, o.offsetTop + o.offsetHeight + room);
          });
          f.style.setProperty('--_frame-height', need + 'px');
        } catch (e) { /* cross-origin: keep the default height */ }
      };
      var start = function () {
        apply(theme); fit();
        try { if ('ResizeObserver' in window) new ResizeObserver(fit).observe(f.contentDocument.body); } catch (e) { /* keep the measured height */ }
        try {
          var d = f.contentDocument, later = function () { window.requestAnimationFrame(fit); };
          d.addEventListener('toggle', later, true);
          d.addEventListener('close', later, true);
          if ('MutationObserver' in window) new MutationObserver(later).observe(d.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
        } catch (e) { /* keep the measured height */ }
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

    // Alerts (alert.md): show each dismiss button, and hide its alert when pressed. With a key, data-alert-dismiss="x",
    // the alert stays hidden on later pages too (localStorage "cx-alert:x"). Focus moves to the main column, since the
    // button it was on has gone. One listener on the document, so an alert an app adds later works the same way.
    var dismissed = function (key) { try { return Boolean(key) && localStorage.getItem('cx-alert:' + key) === 'dismissed'; } catch (e) { return false; } };
    document.querySelectorAll('.cx-alert [data-alert-dismiss]').forEach(function (btn) {
      var alert = btn.closest('.cx-alert');
      if (dismissed(btn.dataset.alertDismiss)) alert.hidden = true; else btn.hidden = false;
    });
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.cx-alert [data-alert-dismiss]');
      if (!btn) return;
      var key = btn.dataset.alertDismiss;
      btn.closest('.cx-alert').hidden = true;
      if (key) { try { localStorage.setItem('cx-alert:' + key, 'dismissed'); } catch (err) { /* storage blocked: hidden for this view only */ } }
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    });

    // Toasts (toast.md): document.dispatchEvent(new CustomEvent('cx-toast', { detail: { text: 'Saved', kind: 'success' } })).
    // One polite live region per page, made here if the page has none, holds up to three; each goes after
    // motion.duration.toast, a time that starts again while the pointer or focus is on it. Escape inside one, or its
    // button, closes it. The text is set as text, never as HTML.
    var region = document.querySelector('.cx-toasts');
    if (!region) {
      region = document.createElement('div'); region.className = 'cx-toasts'; region.setAttribute('role', 'status');
      document.body.appendChild(region);
    }
    var toastIcon = function (id, cls) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'cx-icon cx-icon--sm' + (cls ? ' ' + cls : '')); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      var use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', '#cx-icon-' + id);
      svg.appendChild(use); return svg;
    };
    var closeToast = function (toast) {
      if (toast.classList.contains('is-leaving')) return;
      clearTimeout(toast._cxTimer);
      var hadFocus = toast.contains(document.activeElement);
      toast.classList.add('is-leaving'); toast.classList.remove('is-shown');
      setTimeout(function () { toast.remove(); }, ms('--cx-motion-duration-base'));
      if (hadFocus) { var main = document.getElementById('main'); if (main) main.focus({ preventScroll: true }); }
    };
    document.addEventListener('cx-toast', function (e) {
      var d = e.detail || {};
      if (!d.text) return;
      var toast = document.createElement('div'); toast.className = 'cx-toast';
      if (d.kind === 'success') toast.appendChild(toastIcon('check'));
      var p = document.createElement('p'); p.className = 'cx-toast__text'; p.textContent = d.text; toast.appendChild(p);
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cx-toast__dismiss'; btn.setAttribute('aria-label', 'Dismiss');
      btn.appendChild(toastIcon('close')); btn.addEventListener('click', function () { closeToast(toast); }); toast.appendChild(btn);
      var wait = function () { clearTimeout(toast._cxTimer); toast._cxTimer = setTimeout(function () { closeToast(toast); }, ms('--cx-motion-duration-toast')); };
      var hold = function () { clearTimeout(toast._cxTimer); };
      toast.addEventListener('mouseenter', hold); toast.addEventListener('focusin', hold);
      toast.addEventListener('mouseleave', function () { if (!toast.contains(document.activeElement)) wait(); });
      toast.addEventListener('focusout', function (ev) { if (!toast.contains(ev.relatedTarget) && !toast.matches(':hover')) wait(); });
      toast.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { ev.stopPropagation(); closeToast(toast); } });
      var live = region.querySelectorAll('.cx-toast:not(.is-leaving)');
      if (live.length >= 3) closeToast(live[0]);
      region.appendChild(toast);
      window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { toast.classList.add('is-shown'); }); });
      wait();
    });

    // Dialogs (dialog.md): [data-dialog-open="id"] opens a .cx-dialog with showModal(), which moves focus in, closes on
    // Escape and returns focus when closed. [data-dialog-close] inside one closes it, and so does a click on the
    // backdrop, unless the dialog has data-dialog-keep (a form, whose typing a stray click would lose).
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      var opener = t.closest('[data-dialog-open]');
      if (opener) {
        var d = document.getElementById(opener.dataset.dialogOpen);
        if (d && d.showModal && !d.open) d.showModal();
        return;
      }
      var dialog = t.closest('dialog.cx-dialog');
      if (!dialog) return;
      if (t.closest('[data-dialog-close]')) { dialog.close(); return; }
      if (t === dialog && !dialog.hasAttribute('data-dialog-keep')) {
        var r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
      }
    });

    // Date pickers (date-picker.md): each [data-date-picker] box gets its calendar button, and the page gets one
    // calendar, made the first time it's opened. Dates are day first (DD/MM/YYYY) and weeks start on Monday. The
    // calendar sits under its field, or above it when there's more room there, in page coordinates so it scrolls
    // with the field. Days, months and years are each a grid with one tab stop, moved by the arrow keys.
    var pickers = document.querySelectorAll('[data-date-picker]');
    if (pickers.length) {
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var PAGE = 20;
      var cal = null, calBody, calDays, calList, calTitle, monthBtn, yearBtn, navs;
      var field = null, opener = null, selected = null, focusDay = null, view = 'days';
      var today = function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
      var same = function (a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
      var pad = function (n) { return String(n).padStart(2, '0'); };
      var parse = function (v) {
        var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim());
        if (!m) return null;
        var d = new Date(+m[3], +m[2] - 1, +m[1]);
        return d.getMonth() === +m[2] - 1 ? d : null;
      };
      var clampDay = function (y, m, d) { return new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate())); };
      var icon = function (id) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'cx-icon'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
        var use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', '#cx-icon-' + id);
        svg.appendChild(use); return svg;
      };
      var el = function (tag, cls, attrs) {
        var n = document.createElement(tag); if (cls) n.className = cls;
        Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        return n;
      };
      var build = function () {
        cal = el('div', 'cx-calendar', { popover: '', role: 'dialog', 'aria-label': 'Choose a date' });
        var head = el('div', 'cx-calendar__head');
        var prev = el('button', 'cx-calendar__nav', { type: 'button', 'data-step': '-1' }); prev.appendChild(icon('arrow-back'));
        var next = el('button', 'cx-calendar__nav', { type: 'button', 'data-step': '1' }); next.appendChild(icon('arrow-forward'));
        var pick = el('div', 'cx-calendar__pickers');
        monthBtn = el('button', 'cx-calendar__pick', { type: 'button', 'aria-expanded': 'false' });
        yearBtn = el('button', 'cx-calendar__pick', { type: 'button', 'aria-expanded': 'false' });
        [monthBtn, yearBtn].forEach(function (b) { b.appendChild(document.createElement('span')); b.appendChild(icon('expand')); pick.appendChild(b); });
        head.appendChild(prev); head.appendChild(pick); head.appendChild(next);
        calTitle = el('p', 'cx-visually-hidden', { 'aria-live': 'polite' });
        calDays = el('table', 'cx-calendar__grid', { role: 'grid' });
        var thead = el('thead'), tr = el('tr');
        [1, 2, 3, 4, 5, 6, 0].forEach(function (i) { var th = el('th', '', { scope: 'col', abbr: DAYS[i] }); th.textContent = DAYS[i].slice(0, 2); tr.appendChild(th); });
        thead.appendChild(tr); calDays.appendChild(thead); calBody = el('tbody'); calDays.appendChild(calBody);
        calList = el('div', 'cx-calendar__list'); calList.hidden = true;
        var foot = el('div', 'cx-calendar__foot');
        var todayBtn = el('button', '', { type: 'button' }); todayBtn.textContent = 'Today';
        var closeBtn = el('button', '', { type: 'button' }); closeBtn.textContent = 'Close';
        foot.appendChild(todayBtn); foot.appendChild(closeBtn);
        [head, calTitle, calDays, calList, foot].forEach(function (n) { cal.appendChild(n); });
        document.body.appendChild(cal);
        navs = [prev, next];
        var labelId = 'cx-calendar-title'; calTitle.id = labelId; calDays.setAttribute('aria-labelledby', labelId);
        monthBtn.setAttribute('aria-controls', 'cx-calendar-list'); yearBtn.setAttribute('aria-controls', 'cx-calendar-list'); calList.id = 'cx-calendar-list';

        calBody.addEventListener('click', function (e) {
          var b = e.target.closest('.cx-calendar__day'); if (!b) return;
          var v = b.dataset.value.split('-'); choose(new Date(+v[0], +v[1], +v[2]));
        });
        calList.addEventListener('click', function (e) {
          var b = e.target.closest('.cx-calendar__cell'); if (!b) return;
          var v = +b.dataset.value;
          if (view === 'years') { focusDay = clampDay(v, focusDay.getMonth(), focusDay.getDate()); setView('months'); }
          else { focusDay = clampDay(focusDay.getFullYear(), v, focusDay.getDate()); setView('days'); }
        });
        monthBtn.addEventListener('click', function () { setView(view === 'months' ? 'days' : 'months'); });
        yearBtn.addEventListener('click', function () { setView(view === 'years' ? 'days' : 'years'); });
        navs.forEach(function (n) {
          n.addEventListener('click', function () {
            var st = +n.dataset.step, y = focusDay.getFullYear(), m = focusDay.getMonth(), d = focusDay.getDate();
            focusDay = view === 'days' ? clampDay(y, m + st, d) : view === 'months' ? clampDay(y + st, m, d) : clampDay(y + st * PAGE, m, d);
            render(false);
          });
        });
        todayBtn.addEventListener('click', function () { view = 'days'; focusDay = today(); render(true); });
        closeBtn.addEventListener('click', close);
        cal.addEventListener('toggle', function (e) { if (e.newState !== 'open') view = 'days'; });
        calBody.addEventListener('keydown', function (e) {
          var d = new Date(focusDay), k = e.key;
          if (k === 'ArrowLeft') d.setDate(d.getDate() - 1);
          else if (k === 'ArrowRight') d.setDate(d.getDate() + 1);
          else if (k === 'ArrowUp') d.setDate(d.getDate() - 7);
          else if (k === 'ArrowDown') d.setDate(d.getDate() + 7);
          else if (k === 'PageUp') d = clampDay(d.getFullYear(), d.getMonth() - 1, d.getDate());
          else if (k === 'PageDown') d = clampDay(d.getFullYear(), d.getMonth() + 1, d.getDate());
          else if (k === 'Home') d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
          else if (k === 'End') d.setDate(d.getDate() + (6 - (d.getDay() + 6) % 7));
          else return;
          e.preventDefault(); focusDay = d; render(true);
        });
        calList.addEventListener('keydown', function (e) {
          var cols = view === 'years' ? 4 : 3, k = e.key, y = focusDay.getFullYear(), m = focusDay.getMonth(), dd = focusDay.getDate(), delta = 0;
          if (k === 'ArrowLeft') delta = -1; else if (k === 'ArrowRight') delta = 1;
          else if (k === 'ArrowUp') delta = -cols; else if (k === 'ArrowDown') delta = cols;
          else if (k === 'PageUp') delta = view === 'years' ? -PAGE : -12; else if (k === 'PageDown') delta = view === 'years' ? PAGE : 12;
          else return;
          e.preventDefault();
          if (view === 'months' && Math.abs(delta) < 12) { if (m + delta < 0 || m + delta > 11) return; focusDay = clampDay(y, m + delta, dd); }
          else focusDay = view === 'years' ? clampDay(y + delta, m, dd) : clampDay(y + delta / 12, m, dd);
          render(true);
        });
        window.addEventListener('resize', place);
        document.addEventListener('scroll', place, true);
      };
      var cell = function (cls, text, label, o) {
        var b = el('button', cls, { type: 'button', 'aria-label': label, 'aria-pressed': o.pressed ? 'true' : 'false' });
        if (o.current) b.setAttribute('aria-current', 'date');
        b.textContent = text; b.tabIndex = o.focus ? 0 : -1; b.dataset.value = o.value;
        return b;
      };
      var render = function (moveFocus) {
        var y = focusDay.getFullYear(), m = focusDay.getMonth(), now = today();
        monthBtn.firstChild.textContent = MONTHS[m]; yearBtn.firstChild.textContent = y;
        monthBtn.setAttribute('aria-expanded', String(view === 'months')); yearBtn.setAttribute('aria-expanded', String(view === 'years'));
        monthBtn.setAttribute('aria-label', 'Choose the month, ' + MONTHS[m]); yearBtn.setAttribute('aria-label', 'Choose the year, ' + y);
        calDays.hidden = view !== 'days'; calList.hidden = view === 'days';
        var labels = { days: ['Previous month', 'Next month'], months: ['Previous year', 'Next year'], years: ['Previous ' + PAGE + ' years', 'Next ' + PAGE + ' years'] }[view];
        navs[0].setAttribute('aria-label', labels[0]); navs[1].setAttribute('aria-label', labels[1]);
        if (view === 'days') {
          calTitle.textContent = MONTHS[m] + ' ' + y;
          var first = new Date(y, m, 1), start = new Date(y, m, 1 - ((first.getDay() + 6) % 7));
          calBody.textContent = '';
          for (var w = 0; w < 6; w++) {
            var row = el('tr');
            for (var i = 0; i < 7; i++) {
              var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i), td = el('td');
              td.appendChild(cell('cx-calendar__day' + (d.getMonth() !== m ? ' is-other' : ''), d.getDate(),
                DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(),
                { pressed: same(d, selected), current: same(d, now), focus: same(d, focusDay), value: d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() }));
              row.appendChild(td);
            }
            calBody.appendChild(row);
          }
        } else if (view === 'months') {
          calTitle.textContent = 'Months of ' + y; calList.className = 'cx-calendar__list cx-calendar__list--months'; calList.textContent = '';
          MONTHS.forEach(function (name, i) {
            calList.appendChild(cell('cx-calendar__cell', name.slice(0, 3), name + ' ' + y,
              { pressed: selected && selected.getFullYear() === y && selected.getMonth() === i, current: now.getFullYear() === y && now.getMonth() === i, focus: i === m, value: i }));
          });
        } else {
          var from = Math.floor(y / PAGE) * PAGE;
          calTitle.textContent = from + ' to ' + (from + PAGE - 1); calList.className = 'cx-calendar__list cx-calendar__list--years'; calList.textContent = '';
          for (var k = from; k < from + PAGE; k++) {
            calList.appendChild(cell('cx-calendar__cell', k, String(k), { pressed: selected && selected.getFullYear() === k, current: now.getFullYear() === k, focus: k === y, value: k }));
          }
        }
        place();
        if (moveFocus) { var f = (view === 'days' ? calBody : calList).querySelector('[tabindex="0"]'); if (f) f.focus(); }
      };
      var setView = function (v) { view = v; render(true); };
      var place = function () {
        if (!cal || !field || !cal.matches(':popover-open')) return;
        var r = field.getBoundingClientRect(), vw = document.documentElement.clientWidth, h = cal.offsetHeight, w = cal.offsetWidth, gap = px('--cx-space-inline-xs'), edge = px('--cx-space-inline-sm');
        var below = window.innerHeight - r.bottom - gap, above = r.top - gap;
        var top = (below < h && above > below) ? r.top - h - gap : r.bottom + gap;
        cal.style.top = (top + window.scrollY) + 'px';
        cal.style.left = (Math.max(edge, Math.min(r.left, vw - w - edge)) + window.scrollX) + 'px';
      };
      var close = function () { cal.hidePopover(); if (opener) opener.focus(); };
      var choose = function (d) {
        selected = d;
        var input = field.querySelector('.cx-field__control');
        input.value = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
        input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
        close();
      };
      pickers.forEach(function (box) {
        var btn = box.querySelector('.cx-date__button');
        if (!btn || !HTMLElement.prototype.hasOwnProperty('popover')) return;
        btn.hidden = false;
        btn.addEventListener('click', function () {
          if (!cal) build();
          if (cal.matches(':popover-open') && opener === btn) { cal.hidePopover(); return; }
          if (cal.matches(':popover-open')) cal.hidePopover();
          opener = btn; field = box;
          selected = parse(box.querySelector('.cx-field__control').value);
          focusDay = new Date(selected || today()); view = 'days';
          cal.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Choose a date');
          cal.showPopover(); render(true);
        });
      });
    }

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
      // The docs header's "On this page" (site-header.md) lists the same sections, so it is marked too.
      var links = Array.prototype.slice.call(document.querySelectorAll('.cx-article .cx-toc a[href^="#"], .cx-header__toc li a[href^="#"]'));
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
        });
      }, { rootMargin: '0px 0px -70% 0px' });
      links.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) io.observe(t); });
    });

    // Specimen plates whose illustration moves (data-plate-motion): show the pause control, and pause or play what
    // is inside with it: CSS animations (through data-paused on the frame), SMIL in an inline SVG, and video. A
    // scripted drawing listens for the "cx-plate-pause" event. Under reduced motion nothing plays and the control
    // stays hidden. The contour survey (data-plate-seed) is run by dist/plate.js instead.
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.cx-plate[data-plate-motion]').forEach(function (plate) {
      var frame = plate.closest('.cx-plate-frame') || plate.parentElement;
      var toggle = frame.querySelector('.cx-plate__pause');
      var input = toggle && toggle.querySelector('input');
      var set = function (paused) {
        frame.toggleAttribute('data-paused', paused);
        plate.querySelectorAll('svg').forEach(function (svg) { if (svg.pauseAnimations) { if (paused) svg.pauseAnimations(); else svg.unpauseAnimations(); } });
        plate.querySelectorAll('video').forEach(function (v) { if (paused) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay refused: the poster stays */ }); } });
        frame.dispatchEvent(new CustomEvent('cx-plate-pause', { bubbles: true, detail: { paused: paused } }));
      };
      if (still) { set(true); return; }
      if (toggle) toggle.hidden = false;
      if (input) input.addEventListener('change', function () { set(input.checked); });
      set(Boolean(input && input.checked));
    });
  });
})();
