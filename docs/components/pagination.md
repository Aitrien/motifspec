---
name: pagination
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.focus.ring
  - color.surface.hover
  - color.surface.raised
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - font.family.mono
  - font.line-height.heading
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - motion.distance.nudge
  - motion.duration.fast
  - motion.easing.standard
  - size.target.touch
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.stack.xs
---

# Pagination

A three-cell bar: previous with its title, current position, and next with its title.

## When to use

- At the end of a post or case study, to the previous and next entries in the collection.
- Below a paginated index ("Page 2 / 5"), with the page titles replaced by "Newer" and "Older".
- Between documentation pages, in the order of the docs navigation (`page-footer.md`, `pagination-docs.html`).

## When not to use

- For in-page jumps; use `table-of-contents`.
- When there are fewer than two items to move between.

## Markup

```html {preview=true}
<nav class="cx-pagination" aria-label="Post navigation">
  <a class="cx-pagination__link" href="/writing/instancing-arcs/" rel="prev">
    <span class="cx-pagination__dir"><svg class="cx-icon cx-icon--sm cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-back"></use></svg>Previous</span>
    <span class="cx-pagination__title">Instancing arcs on a WebGL globe</span>
  </a>
  <p class="cx-pagination__status">Post<strong>31 / 31</strong></p>
  <span class="cx-pagination__link" rel="next" aria-disabled="true">
    <span class="cx-pagination__dir">Next<svg class="cx-icon cx-icon--sm cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></span>
    <span class="cx-pagination__title">Latest entry</span>
  </span>
</nav>
```

## Do

- Keep both outer cells even when one direction is missing; render it as a disabled `<span>`.
- Use `rel="prev"` and `rel="next"`.
- Put the back arrow before "Previous" and the forward arrow after "Next"; both nudge on hover.

## Don't

- Don't show numbered page lists longer than the three cells; the position cell is enough.
- Don't truncate titles. They wrap.

## Accessibility

- `<nav>` with a specific `aria-label` ("Post navigation", "Writing pages").
- Disabled ends are not links, so they're skipped by Tab.
- Cells are at least 44px tall.
- Pairs: `color.text.primary` titles on `color.surface.raised` and `color.surface.hover` (7:1); `color.text.muted` labels (4.5:1).
