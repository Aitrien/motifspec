---
name: prose
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.accent.border
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.link.hover
  - color.link.rest
  - color.ornament.rest
  - color.surface.highlight
  - color.surface.sunken
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.display
  - font.family.mono
  - font.family.ornament
  - font.line-height.display
  - font.line-height.heading
  - font.line-height.ui
  - font.size.code-inline
  - font.size.display
  - font.size.heading-1
  - font.size.heading-2
  - font.size.heading-3
  - font.size.heading-4
  - font.size.label
  - font.size.lede
  - font.size.small
  - font.tracking.display
  - font.tracking.heading
  - font.tracking.label
  - font.tracking.ui
  - font.weight.body
  - font.weight.display
  - font.weight.heading
  - font.weight.strong
  - font.weight.ui
  - radius.control
  - size.container.breakout
  - size.measure.caption
  - size.measure.code
  - size.measure.prose
  - size.ornament.sm
  - space.inline.md
  - space.inline.sm
  - space.inline.xs
  - space.inset.lg
  - space.inset.md
  - space.inset.xs
  - space.section.sm
  - space.stack.lg
  - space.stack.md
  - space.stack.sm
  - space.stack.xl
  - space.stack.xs
---

# Prose

Styles for Markdown-rendered long-form content: headings, paragraphs, lists, blockquotes, inline code, keys, marks, links and dividers.

## When to use

- Around Hugo's `{{ .Content }}` on posts, case studies, about pages and docs.
- Anywhere running text is longer than two paragraphs.

## When not to use

- For UI text in cards, nav or tables; components set their own type.
- For page titles; use `.cx-page-head` with an `<h1>` outside the prose wrapper.

## Markup

```html {preview=true}
<div class="cx-prose">
  <p>A token without a rule is a colour with a name, so the <a href="/writing/rules/">description becomes the contract</a>.</p>
  <h2 id="why">Why tokens need rules <a class="cx-anchor" href="#why" aria-label="Link to Why tokens need rules">#</a></h2>
  <p>Every semantic token carries a <strong>usage rule</strong> in its <code>$description</code>.</p>
  <ul>
    <li>Name the role, never the page.</li>
    <li>State when not to use it.</li>
  </ul>
  <blockquote><p>Things that are easy to build are also reliable.</p><footer>Jensen Huang <span class="cx-sep" aria-hidden="true">|</span> <cite>Jensen Huang gets mobbed by engineers in Taiwan</cite>, Lex Fridman</footer></blockquote>
  <p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search, or <mark>query the server</mark>.</p>
  <hr>
  <p>Last paragraph of the article.<span class="cx-end-mark" aria-hidden="true">g</span></p>
</div>
```

## Do

- Start content headings at `<h2>`; the page `<h1>` sits outside `.cx-prose`.
- Give every `<h2>` an id and a heading anchor (see `heading-anchor.md`).
- Use `.cx-figure--breakout`, `.cx-code--breakout` or `.cx-table--breakout` for wide content; everything else stops at 66ch.
- End articles with the flower end mark (`g` in `font.family.ornament`).
- Separate inline metadata with `<span class="cx-sep" aria-hidden="true">|</span>`, never "·". The pipe is muted and hidden from screen readers.
- Attribute every quotation in the blockquote's `<footer>`: who said it, then the source title in `<cite>`. Only quote words you can trace to that source.
- Use `<strong>` for emphasis that matters. National Park has no italic, so `<em>` renders as a synthetic oblique.

## Don't

- Don't present someone else's words as an unattributed principle or as your own, and never copy text from reference sites into sample content.

- Don't skip heading levels.
- Don't remove link underlines; colour is never the only cue.
- Don't use more than one `<hr>` per article. It renders as a three-stitch ornament.
- Don't set prose wider than `size.measure.prose`.

## Accessibility

- Links are underlined at rest and thicken on hover and focus.
- Heading anchors name their section in `aria-label` and appear on hover or focus (always on touch screens).
- `<hr>` keeps its separator role; the stitches are generated content with no text.
- Pairs: `color.text.primary` (7:1), `color.link.rest` and `color.link.hover` (7:1), `color.text.secondary` blockquotes (7:1) on `color.surface.base`.
