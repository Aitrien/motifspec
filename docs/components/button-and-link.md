---
name: button-and-link
status: stable
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.accent.fill.hover
  - color.accent.fill.rest
  - color.border.strong
  - color.focus.ring
  - color.link.hover
  - color.link.rest
  - color.surface.hover
  - color.surface.raised
  - color.text.muted
  - color.text.on-accent
  - color.text.primary
  - font.family.body
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - motion.distance.nudge
  - motion.duration.fast
  - motion.easing.standard
  - radius.pill
  - size.target.control
  - size.target.min
  - space.inline.md
  - space.inline.sm
  - space.inline.xs
  - space.inset.lg
---

# Button and link

Buttons start actions or journeys; standalone links and back links move between pages.

## When to use

- `cx-button--primary`: the one main action in a view ("View work").
- `cx-button`: a secondary action beside it.
- `cx-link`: a standalone forward link at the end of a section ("All projects" plus a forward arrow).
- `cx-back`: the return link at the top of a post or case study (back arrow plus "All writing").

## When not to use

- For inline links in text; `prose` styles those.
- Two primary buttons in one view. Make the second one secondary.
- For navigation between sibling posts; use `pagination`.

## Markup

```html preview
<div class="cx-actions">
  <a class="cx-button cx-button--primary" href="/work/">View work <svg class="cx-icon cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></a>
  <a class="cx-button" href="/writing/">Read the writing</a>
  <button class="cx-button" type="button" disabled>Not yet published</button>
</div>
<a class="cx-link" href="/work/">All projects <svg class="cx-icon cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></a>
<a class="cx-back" href="/writing/"><svg class="cx-icon cx-icon--sm cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-back"></use></svg>All writing</a>
```

## Do

- Use `<a>` when it goes somewhere and `<button>` when it does something.
- Write labels as verb plus object, in sentence case.
- Keep `cx-button` pill-shaped (`radius.pill`). Pills are reserved for buttons, nav items and icon-only controls (the copy button, the theme toggle, the plate's pause, heading anchors), so a pill always means "you can press this".
- Use the `arrow-forward` and `arrow-back` icons (see `icon.md`) with `cx-button__arrow`; they nudge by `motion.distance.nudge` on hover, in their own direction.

## Don't

- Don't use buttons for decoration or as tags.
- Don't round anything else: cards, tags, labels, tooltips and inputs stay square.
- Don't make disabled buttons look clickable. They are dashed and muted, and should say why they're unavailable.
- Don't add icons beyond the direction arrow.

## Accessibility

- Buttons are 40px tall (`size.target.control`); links at least 24px.
- Focus shows `color.focus.ring` 2px off the element, so it never sits on the green fill.
- Pairs: `color.text.on-accent` on `color.accent.fill.rest` and `.hover` (4.5:1); `color.accent.fill.rest` against the page (3:1); secondary border `color.border.strong` (3:1); `color.link.rest` (7:1).
