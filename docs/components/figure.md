---
name: figure
status: stable
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.accent.border
  - color.border.default
  - color.border.strong
  - color.surface.raised
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.body
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.ui
  - size.column.card
  - size.container.breakout
  - size.measure.caption
  - size.measure.prose
  - space.inline.md
  - space.stack.lg
  - space.stack.sm
  - space.stack.xs
---

# Figure and caption

A framed image or diagram with a numbered plate label and a caption.

## When to use

- For screenshots, diagrams and charts in posts and case studies.
- For the hero image of a case study ("Plate 1").

## When not to use

- For decorative images; omit them.
- For code; use `code-block`. For tabular data; use `data-table`.

## Markup

```html preview
<figure class="cx-figure cx-figure--breakout cx-figure--diagram">
  <div class="cx-figure__frame">
    <svg class="cx-diagram" viewBox="0 0 720 120" role="img" aria-label="Tokens go through the build, which writes CSS for sites.">
      <defs><marker id="pipeline-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path class="cx-diagram__head" d="M0 0 10 5 0 10z"/></marker></defs>
      <rect class="cx-diagram__node" x="20" y="30" width="180" height="60"/>
      <text class="cx-diagram__title" x="110" y="57" text-anchor="middle">tokens/*.json</text>
      <text class="cx-diagram__text" x="110" y="77" text-anchor="middle">Values and usage rules</text>
      <path class="cx-diagram__edge" d="M200 60 H268" marker-end="url(#pipeline-head)"/>
      <rect class="cx-diagram__node cx-diagram__node--accent" x="270" y="30" width="180" height="60"/>
      <text class="cx-diagram__title" x="360" y="57" text-anchor="middle">npm run build</text>
      <text class="cx-diagram__text" x="360" y="77" text-anchor="middle">Validates every pair</text>
      <path class="cx-diagram__edge" d="M450 60 H518" marker-end="url(#pipeline-head)"/>
      <rect class="cx-diagram__node" x="520" y="30" width="180" height="60"/>
      <text class="cx-diagram__title" x="610" y="57" text-anchor="middle">dist/codex.css</text>
      <text class="cx-diagram__label" x="610" y="77" text-anchor="middle">For sites</text>
    </svg>
  </div>
  <figcaption><span class="cx-figure__plate">Plate 2</span>One build feeds every consumer.</figcaption>
</figure>
```

### Diagram parts

| Class | Draws |
|---|---|
| `cx-diagram` | The `<svg>`. Sets the body font. |
| `cx-diagram__node`, `--accent` | A box: raised fill, strong hairline; the accent version marks the step the diagram is about. |
| `cx-diagram__group` | An outline around related nodes, with no fill. |
| `cx-diagram__edge`, `--accent` | A connector line. Give it `marker-end` pointing at a marker drawn with `cx-diagram__head` (or `--accent`). |
| `cx-diagram__title`, `cx-diagram__text` | A node's name, and a short line under it. |
| `cx-diagram__label`, `--accent` | Mono, uppercase labels for groups and edges. |

## Do

- Number plates in order of appearance on the page, starting at 1. Plate 0 is reserved for the specimen plate.
- Write captions that say what to notice, not what the image is.
- Use `cx-figure--diagram` for SVG with text, so it scrolls instead of shrinking text below 12px on phones.
- Colour SVG through classes that use `color.*` tokens, never `fill="#…"`; diagrams then follow the theme. Draw diagrams with the `cx-diagram` classes above.
- Keep a diagram's `viewBox` at most 740 wide and set text only through the classes, so text stays at or above 12px at the diagram's minimum width.
- Prefix the ids inside a diagram (markers, gradients) with its name, since it is inlined into the page with everything else.
- In Hugo, save a diagram as an `.svg` in the page bundle and use it like an image, on its own line: `![Alt text](system-map.svg "Caption")`. It is inlined and gets `role="img"` with the alt text as its name.
- Use `color.data.1` to `color.data.5` in order for chart series, and label series directly.

## Don't

- Don't put text inside raster images.
- Don't stretch figures wider than `size.container.breakout`.

## Accessibility

- Informative images need `alt`, or `role="img"` and an accessible name for SVG. In Hugo the Markdown alt text becomes that name, so the `.svg` file sets no `role`, `aria-label` or `<title>` of its own. The caption doesn't replace alt text.
- The plate number is plain text inside `<figcaption>`.
- Pairs: `color.text.secondary` caption on `color.surface.base` (7:1); `color.text.accent` plate label (4.5:1); data series on `color.surface.raised` (3:1). Diagrams, all on `color.surface.raised`: `color.border.strong` nodes, groups and edges (3:1); `color.accent.border` accents (3:1); `color.text.primary` and `color.text.secondary` text (7:1); `color.text.muted` and `color.text.accent` labels (4.5:1).
