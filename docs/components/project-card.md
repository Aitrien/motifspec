---
name: project-card
status: stable
layouts: [portfolio]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.surface.raised
  - color.surface.sunken
  - color.text.primary
  - color.text.secondary
  - font.line-height.heading
  - font.size.heading-4
  - font.size.small
  - font.tracking.heading
  - font.weight.heading
  - motion.duration.fast
  - motion.easing.standard
  - size.column.card
  - size.measure.caption
  - space.gutter.grid
  - space.inline.xs
  - space.inset.md
  - space.stack.sm
---

# Project card

A framed summary of one project that links to its case study.

## When to use

- In a `cx-cards` grid on the home page (two or three selected projects) and the project index.
- For any catalogued entry with an image: a recipe, an architecture study, a docs guide.

## When not to use

- For writing; use `post-list-item`, which scans faster as a ledger.
- For a single featured project with a long description; use a page heading and prose.
- Without a thumbnail. If there is no image, use `post-list-item` instead.

## Markup

```html preview
<ul class="cx-cards">
  <li>
    <article class="cx-card">
      <div class="cx-card__media"><img src="/work/globe/thumb.webp" alt="" width="640" height="400"></div>
      <div class="cx-card__body">
        <p class="cx-id"><span class="cx-id__no">LM-W-001</span><span>2026</span><span class="cx-status cx-status--live">Live</span></p>
        <h3 class="cx-card__title"><a class="cx-card__link" href="/work/globe/">Interactive WebGL globe</a></h3>
        <p class="cx-card__summary">A React app that renders live routes on a 3D globe.</p>
        <ul class="cx-tags"><li><a class="cx-tag" href="/tags/webgl/">webgl</a></li></ul>
      </div>
    </article>
  </li>
</ul>
```

## Do

- Make the title link the only card link; its `::after` stretches over the card.
- Keep summaries to one sentence (the caption measure is 52ch).
- Give thumbnails a 16:10 ratio and explicit `width`/`height` to prevent layout shift.
- Leave thumbnail `alt` empty when the title already names the project; describe it when the image shows something the text doesn't.

## Don't

- Don't nest buttons or other links inside the card except tags, which sit above the stretched link.
- Don't add shadows or rounded corners. Hover changes the border only.
- Don't show more than three tags.

## Accessibility

- Each card is an `<article>` with an `<h3>` (or the level that fits the page outline).
- Focus on the title link draws the focus ring around the whole card (`:has(:focus-visible)`).
- Tags stay keyboard-reachable after the title link.
- Pairs: `color.text.primary` on `color.surface.raised` (7:1); `color.text.secondary` summary (7:1); hover border `color.border.strong` (3:1).
