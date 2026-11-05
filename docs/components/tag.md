---
name: tag
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.accent.border
  - color.border.default
  - color.focus.ring
  - color.surface.sunken
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.ui
  - motion.duration.fast
  - motion.easing.standard
  - radius.none
  - size.target.min
  - space.inline.sm
  - space.inline.xs
  - space.inset.sm
  - space.stack.sm
---

# Tag

A small mono label for a topic or technology, optionally linking to its index.

## When to use

- For taxonomy terms on cards, post rows and post footers ("Filed under").
- As filters on index pages, with `aria-current="page"` on the active one.

## When not to use

- For status; use `status.md`.
- For actions; use `button-and-link`.
- For more than three tags on a card or five on a post.

## Markup

```html {preview=true}
<ul class="cx-tags">
  <li><a class="cx-tag" href="/tags/webgl/">webgl<span class="cx-tag__count">4</span></a></li>
  <li><a class="cx-tag" href="/tags/accessibility/" aria-current="page">accessibility</a></li>
  <li><span class="cx-tag">draft</span></li>
</ul>
```

## Do

- Write terms in lowercase kebab-case, matching the taxonomy slug.
- Show counts only on filter lists.
- Use `<span class="cx-tag">` when the tag doesn't link anywhere.

## Don't

- Don't colour tags by category.
- Don't round the corners or add icons.

## Accessibility

- Tags are at least 24px tall (`size.target.min`).
- Wrap groups in `<ul>` so the count is announced.
- The current filter uses `aria-current="page"` as well as the accent border.
- Pairs: `color.text.secondary` on `color.surface.sunken` (7:1); hover border `color.accent.border` (3:1).
