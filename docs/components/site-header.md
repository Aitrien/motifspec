---
name: site-header
status: stable
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.accent.fill.rest
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.surface.base
  - color.text.muted
  - color.text.on-accent
  - color.text.primary
  - color.text.secondary
  - color.wash.hover
  - font.family.display
  - font.family.mono
  - font.line-height.ui
  - font.size.heading-4
  - font.size.label
  - font.tracking.heading
  - font.tracking.label
  - font.weight.display
  - font.weight.strong
  - font.weight.ui
  - motion.duration.fast
  - motion.duration.slow
  - motion.easing.standard
  - radius.pill
  - size.container.page
  - size.target.touch
  - space.gutter.page
  - space.inline.lg
  - space.inline.sm
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.inset.xs
---

# Site header and nav

The bar at the top of every page: wordmark, primary nav, the backdrop pause control and the theme toggle. On a backdrop page (`backdrop.md`) it sits on the frost and scrolls away with the page; elsewhere it is sticky.

## When to use

- On every page of a site, including the 404, so a reader is never stranded.
- For three to five primary destinations with plain, functional labels (Work, Writing, About).

## When not to use

- For in-page navigation; use `table-of-contents`.
- For more than five links. Move the rest to the footer.
- For calls to action. The header holds destinations, not buttons.

## Markup

```html preview
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
      <label class="cx-backdrop__pause" hidden>
        <input class="cx-visually-hidden" type="checkbox" aria-label="Pause background animation">
        <svg class="cx-icon" data-when="running" aria-hidden="true" focusable="false"><use href="#cx-icon-pause"></use></svg>
        <svg class="cx-icon" data-when="paused" aria-hidden="true" focusable="false"><use href="#cx-icon-play"></use></svg>
        <span class="cx-tooltip" aria-hidden="true"><span data-when="running">Pause background</span><span data-when="paused">Play background</span></span>
      </label>
      <button class="cx-theme-toggle" type="button" data-theme-toggle hidden aria-label="Switch to dark theme">
        <svg class="cx-icon" data-icon="to-dark" aria-hidden="true" focusable="false"><use href="#cx-icon-theme-dark"></use></svg>
        <svg class="cx-icon" data-icon="to-light" aria-hidden="true" focusable="false"><use href="#cx-icon-theme-light"></use></svg>
        <span class="cx-tooltip" aria-hidden="true">Switch to dark theme</span>
      </button>
    </div>
  </div>
</header>
```

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
- Nav items are pills (`radius.pill`), the same shape as the pause control and the theme toggle, so every header control reads as one set.
- When the nav and controls wrap below the wordmark, `dist/codex.js` sets `data-wrapped` on the header: the nav moves to the start of its row and is offset by its pills' padding, so the link text lines up with the wordmark and the page text, while the controls stay at the end. Without the script the row stays right-aligned.
- Every header control rests in `color.text.secondary` and shares one hover, shown only where the pointer can hover (`@media (hover: hover)`), so it never sticks after a tap: `color.text.primary` text on a wash of `color.text.primary` at `color.wash.hover`. A solid `color.surface.hover` would all but match the frost.
- Include the backdrop pause control on every backdrop page, between the nav and the theme toggle. It ships `hidden` and `dist/plate.js` reveals it when the drift starts; it never appears on a page without the backdrop. The choice is kept like the theme: `dist/plate.js` stores `paused` under `cx-backdrop` and restores it on every page.
- On a backdrop page, let the header start on the frost. `dist/codex.js` sets `data-scrolled` on it: from then on it is sticky, and as soon as the page leaves the top (`"true"`) its `color.surface.base` surface fades in over `motion.duration.slow`. Back at the top (`"false"`) the surface fades out and the frost shows through again. Without the script the header has no surface and scrolls away with the page.
- Keep labels to one functional word each.
- Ship the toggle with `hidden` and let the script reveal it, so no dead control appears without JavaScript.
- Make the toggle an icon-only circle that shows the action, not the state: a moon while light is showing, a sun while dark is showing. Its tooltip says the same ("Switch to dark theme").
- Each click flips the theme you see. If the result matches the system setting, clear the stored choice (`auto`) so the page follows the system again; otherwise store `light` or `dark` on `data-theme`.
- Include both icons. CSS picks the right one from `data-theme` and `prefers-color-scheme`, so the script only updates the label.

## Don't

- Don't hide the nav behind a menu button at small widths. The list scrolls inside its row instead.
- Don't add icons or ornaments to nav items. The pause control and the theme toggle are the only header controls with icons.
- Don't make the header sticky on a backdrop page without its surface; see-through, it would sit on the text below it. The `data-scrolled` rules keep the two together.
- Don't animate the header on scroll beyond that surface fade (no shrink, hide or reveal).

## Accessibility

- The skip link is the first focusable element and targets `<main id="main">`.
- `<nav aria-label="Main">`; only one nav per page uses that label.
- Nav links, the pause control and the toggle are 44px (`size.target.touch`); the pause control and the toggle are pills with equal sides, so they render as circles.
- The pause control is a native checkbox named "Pause background animation" (checked means paused), focusable by keyboard, with its focus ring on the round control.
- The toggle's `aria-label` is its action ("Switch to light theme"); the visible tooltip repeats it and is `aria-hidden`. Escape hides the tooltip without moving the pointer (see `tooltip.md`).
- `aria-current` carries the current state for assistive tech; the outline is the visual cue.
- Pairs: `color.text.secondary` and `color.text.primary` on `color.surface.base` (7:1); `color.border.strong` on `color.surface.base` (current outline, 3:1). On a backdrop page the frost is measured as `color.surface.base`; the contour lines beneath it are not part of the check.
