---
name: site-header
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.accent.fill.rest
  - color.border.default
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.link.rest
  - color.surface.base
  - color.surface.raised
  - color.text.muted
  - color.text.on-accent
  - color.text.primary
  - color.text.secondary
  - color.wash.hover
  - font.family.display
  - font.family.mono
  - font.line-height.ui
  - font.size.body
  - font.size.heading-4
  - font.size.label
  - font.size.small
  - font.tracking.heading
  - font.tracking.label
  - font.weight.display
  - font.weight.strong
  - font.weight.ui
  - motion.duration.base
  - motion.duration.fast
  - motion.duration.slow
  - motion.easing.standard
  - radius.pill
  - size.container.breakout
  - size.container.page
  - size.target.control
  - size.target.min
  - size.target.touch
  - space.gutter.page
  - space.inline.lg
  - space.inline.sm
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.inset.xs
  - space.stack.lg
  - space.stack.md
  - space.stack.sm
  - space.stack.xs
---

# Site header and nav

The bar at the top of every page: wordmark, primary nav and the theme toggle. On a backdrop page (`backdrop.md`) it sits on the frost and scrolls away with the page; elsewhere it is sticky.

## When to use

- On every page of a site, including the 404, so a reader is never stranded.
- For three to five primary destinations with plain, functional labels (Work, Writing, About).

## When not to use

- For in-page navigation; use `table-of-contents`.
- For more than five links. Move the rest to the footer.
- For calls to action. The header holds destinations, not buttons.

## Markup

```html {preview=true}
<a class="cx-skip-link" href="#main">Skip to content</a>
<header class="cx-header">
  <div class="cx-container cx-header__inner">
    <a class="cx-wordmark" href="/">Liam Marshall <span class="cx-wordmark__role">Web engineer</span></a>
    <div class="cx-header__end">
      <nav class="cx-nav" aria-label="Main">
        <ul>
          <li><a href="/work/" aria-current="page">Work</a></li>
          <li><a href="/writing/">Writing</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </nav>
      <button class="cx-theme-toggle" type="button" data-theme-toggle hidden aria-label="Switch to dark theme">
        <svg class="cx-icon" data-icon="to-dark" aria-hidden="true" focusable="false"><use href="#cx-icon-theme-dark"></use></svg>
        <svg class="cx-icon" data-icon="to-light" aria-hidden="true" focusable="false"><use href="#cx-icon-theme-light"></use></svg>
        <span class="cx-tooltip" aria-hidden="true">Switch to dark theme</span>
      </button>
    </div>
  </div>
</header>
```

### In a documentation site

A documentation site's header (`cx-header--docs`) also carries search, a link out to the source repository, the version linking to the changelog, and two `<details>` that take over below `size.breakpoint.lg`: "On this page" and a menu. Its nav holds only links out, since the page navigation lists the pages. The bar is one row of `size.target.touch` with `space.inset.xs` above and below, at every width and whatever size the wordmark is, which sits centred in it.

```html
<header class="cx-header cx-header--docs">
  <div class="cx-container cx-header__inner">
    <a class="cx-wordmark" href="/">MotifSpec <span class="cx-wordmark__role">Brand guidelines</span></a>
    <div class="cx-header__end">
      <details class="cx-header__toc" data-pagefind-ignore>
        <summary>On this page<svg class="cx-icon cx-icon--sm cx-header__chevron" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></summary>
        <nav class="cx-header__panel cx-toc" aria-label="On this page">
          <a class="cx-header__top" href="#top">Back to top<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-upward"></use></svg></a>
          <ol><li><a href="#install"><span class="cx-toc__no">01</span>Install</a></li></ol>
        </nav>
      </details>
      <button class="cx-search-trigger" type="button" data-search-open aria-haspopup="dialog" aria-controls="cx-search" hidden>…</button>
      <nav class="cx-nav" aria-label="Main">
        <ul>
          <li><a href="https://github.com/owner/repo">GitHub<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-outward"></use></svg></a></li>
        </ul>
      </nav>
      <a class="cx-header__version" href="/reference/changelog/">v1.22.0<span class="cx-visually-hidden">, changelog</span></a>
      <button class="cx-theme-toggle" type="button" data-theme-toggle hidden aria-label="Switch to dark theme">…</button>
      <details class="cx-header__menu">
        <summary aria-label="Menu"><svg class="cx-icon" data-when="closed" aria-hidden="true" focusable="false"><use href="#cx-icon-menu"></use></svg><svg class="cx-icon" data-when="open" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></summary>
        <div class="cx-header__sheet" data-pagefind-ignore>
          <nav class="cx-header__sheet-body cx-docs-nav" aria-label="Documentation"><!-- the page navigation: docs-shell.md --></nav>
          <div class="cx-header__sheet-foot">
            <ul class="cx-docs-nav__list">
              <li><a href="https://github.com/owner/repo">GitHub<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-outward"></use></svg></a></li>
              <li><a href="/reference/changelog/">Changelog<span class="cx-header__version">v1.22.0</span></a></li>
            </ul>
            <div class="cx-header__setting">Theme<button class="cx-theme-toggle" type="button" data-theme-toggle hidden aria-label="Switch to dark theme">…</button></div>
          </div>
        </div>
      </details>
    </div>
  </div>
</header>
```

<!-- caption: The documentation header by width -->
| | Below `size.breakpoint.lg` | From `size.breakpoint.lg` |
|---|---|---|
| At the top of the page | The wordmark in full, search (an icon) and the menu | The wordmark in full, search (a field), the links out, the version and the theme toggle |
| Scrolled | A compact wordmark, "On this page", search and the menu | The same, with a compact wordmark |
| The menu | A sheet under the bar: the page navigation scrolls; the external links, the changelog with the version, and the theme toggle stay at the bottom | Not shown: the side column has the navigation |
| "On this page" | A panel under the bar, with Back to top and the page's sections | Not shown: the article has its own |

"On this page" is written only for a page whose article shows a table of contents: three or more h2s, and no `toc: false`. In Hugo, `partial "motifspec/site-header.html" .` writes all of this when `params.motifspec.layout` is `"documentation"`, with the menu's page navigation from `docs-nav-groups.html` and the toggle from `theme-toggle.html` (`docs/hugo.md`). A portfolio's header has none of these.

### Scripts

The toggle needs two scripts, both shipped in `dist/`. The first is a one-line snippet (`dist/theme-init.js`) inlined in `<head>` before the stylesheet, so a stored choice is on `<html>` before the first paint and the page never flashes the wrong theme. The second is `dist/codex.js`, loaded with `defer`, which reveals the toggle and wires it up (it also sets the header's scroll state on backdrop pages, and runs copy buttons, tooltip dismissal and the table of contents).

```html
<head>
  <script>try{var t=localStorage.getItem('cx-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
  <link rel="stylesheet" href="/motifspec/codex.css">
  <script src="/motifspec/codex.js" defer></script>
</head>
```

Copy the snippet as it is: the build fails if this doc and `js/theme-init.js` differ. It reads the same `cx-theme` key that `codex.js` writes (`light` or `dark`; no key means follow the system), and does nothing when storage is blocked. In Hugo, inline it from the mounted file: `{{ with resources.Get "motifspec/theme-init.js" }}<script>{{ .Content | safeJS }}</script>{{ end }}`. If your Content-Security-Policy blocks inline scripts, allow this one by its hash.

## Do

- Mark the current section with `aria-current="page"`, including on child pages (a post marks Writing). It gets a `color.border.strong` hairline inside its edge and `color.text.primary` text: no fill and no underline.
- Nav items are pills (`radius.pill`), the same shape as the theme toggle, so every header control reads as one set.
- When the nav and controls wrap below the wordmark, `dist/codex.js` sets `data-wrapped` on the header: the nav moves to the start of its row and is offset by its pills' padding, so the link text lines up with the wordmark and the page text, while the controls stay at the end. Without the script the row stays right-aligned.
- Every header control rests in `color.text.secondary` and shares one hover, shown only where the pointer can hover (`@media (hover: hover)`), so it never sticks after a tap: `color.text.primary` text on a wash of `color.text.primary` at `color.wash.hover`. A solid `color.surface.hover` would all but match the frost.
- On a backdrop page, let the header start on the frost. `dist/codex.js` sets `data-scrolled` on it: from then on it is sticky, and as soon as the page leaves the top (`"true"`) its `color.surface.base` surface fades in over `motion.duration.slow`. Back at the top (`"false"`) the surface fades out and the frost shows through again. Without the script the header has no surface and scrolls away with the page.
- Keep labels to one functional word each.
- Ship the toggle with `hidden` and let the script reveal it, so no dead control appears without JavaScript.
- Make the toggle an icon-only circle that shows the action, not the state: a moon while light is showing, a sun while dark is showing. Its tooltip says the same ("Switch to dark theme").
- Each click flips the theme you see. If the result matches the system setting, clear the stored choice (`auto`) so the page follows the system again; otherwise store `light` or `dark` on `data-theme`.
- Include both icons. CSS picks the right one from `data-theme` and `prefers-color-scheme`, so the script only updates the label.

## Don't

- Don't hide a portfolio's nav behind a menu button at small widths; the list scrolls inside its row instead. A documentation site, whose navigation is a long list of pages, puts it in its menu below `size.breakpoint.lg`.
- Don't add icons or ornaments to nav items. The theme toggle, and on a documentation site the search icon and the menu, are the only header controls that are icons.
- Don't make the header sticky on a backdrop page without its surface; see-through, it would sit on the text below it. The `data-scrolled` rules keep the two together.
- Don't animate the header on scroll beyond that surface fade and, on a documentation site, the compact wordmark: no hiding or revealing the bar, and no change in its height.
- Don't list a documentation site's sections in its header's nav; the page navigation beside the page, or in the menu, already lists them.

## Accessibility

- The skip link is the first focusable element and targets `<main id="main">`.
- `<nav aria-label="Main">`; only one nav per page uses that label.
- Nav links, the toggle and the menu control are 44px (`size.target.touch`); the toggle is a pill with equal sides, so it renders as a circle.
- The menu's control is named "Menu" (`aria-label` on its summary), and its icon changes to a cross while it is open; "On this page" is named by its text. Both are `<details>`, so Enter or Space opens them without script, and the browser announces whether they are expanded.
- While the menu is open, the page behind it doesn't scroll. With `dist/codex.js`, Escape closes an open menu or panel and returns focus to its control.
- The toggle's `aria-label` is its action ("Switch to light theme"); the visible tooltip repeats it and is `aria-hidden`. Escape hides the tooltip without moving the pointer (see `tooltip.md`).
- `aria-current` carries the current state for assistive tech; the outline is the visual cue.
- Pairs: `color.text.secondary` and `color.text.primary` on `color.surface.base` (7:1); `color.border.strong` on `color.surface.base` (current outline, 3:1). On a backdrop page the frost is measured as `color.surface.base`; the contour lines beneath it are not part of the check.

## Behaviour

`dist/codex.js` adds this; an app that renders the header itself does the same.

- **Theme toggle:** ships `hidden` and is shown by script. A click switches between light and dark: it sets `data-theme` on `<html>`, or removes it when the choice matches the system again, so the page follows the system from then on. The choice is stored as `cx-theme` in `localStorage` (`light` or `dark`; removed for system), and `dist/theme-init.js` applies it before first paint. The toggle's `aria-label` and tooltip always name the action ("Switch to dark theme").
- **System changes:** while following the system, a change to the system theme updates the toggle's label.
- **Header height:** `--_header-height` on `<html>` is kept equal to the header's height, for scroll padding and the docked table of contents. When the nav wraps below the wordmark, the header gets `data-wrapped`.
- **On a backdrop page:** the header sticks once script runs, and `data-scrolled="true"` fades its surface in as soon as the page leaves the top. Without script it scrolls away with the page.
- **On a documentation site:** the header always sticks with its surface, and gets `data-scrolled` too, which compacts the wordmark and (below `size.breakpoint.lg`) shows "On this page" once the page leaves the top. Without script the bar stays compact, with "On this page" shown. Only one of the menu and "On this page" is open at a time; each closes on Escape, a click outside it, or a link followed inside it. The current section is marked in "On this page", as in the article's table of contents.
