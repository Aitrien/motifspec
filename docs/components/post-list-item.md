---
name: post-list-item
status: stable
layouts: [portfolio]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.border.subtle
  - color.focus.ring
  - color.surface.hover
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.heading
  - font.line-height.ui
  - font.size.heading-4
  - font.size.label
  - font.size.small
  - font.tracking.heading
  - font.tracking.ui
  - font.weight.heading
  - font.weight.ui
  - motion.duration.fast
  - motion.easing.standard
  - size.column.card
  - size.column.sidebar
  - size.measure.prose
  - space.inline.lg
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.stack.lg
  - space.stack.sm
  - space.stack.xs
---

# Post list item

One ledger row in a list of writing: catalogue number, date and reading time beside the title, summary and tags.

## When to use

- On the writing index, grouped under year headings (`cx-posts__year`).
- For "Recent writing" on the home page (five rows, no year heading).
- For any dated, text-first list: changelogs, release notes, recipes by date.

## When not to use

- For projects with thumbnails; use `project-card`.
- For navigation between adjacent posts; use `pagination`.

## Markup

```html {preview=true}
<h2 class="cx-posts__year">2026</h2>
<ol class="cx-posts" reversed>
  <li class="cx-post">
    <p class="cx-post__meta">
      <span class="cx-id__no">LM-P-031</span>
      <time datetime="2026-10-02">2026-10-02</time>
      <span>6 min</span>
    </p>
    <div class="cx-post__main">
      <h3 class="cx-post__title"><a href="/writing/tokens-over-mcp/">Serving design tokens to AI assistants over MCP</a></h3>
      <p class="cx-post__summary">Why every token carries a usage rule.</p>
      <ul class="cx-tags"><li><a class="cx-tag" href="/tags/mcp/">mcp</a></li></ul>
    </div>
  </li>
</ol>
```

## Do

- Use `<ol reversed>`; newest first is an order the reader relies on.
- Keep the meta column to number, date and reading time, in that order.
- Write summaries as one plain sentence.

## Don't

- Don't add thumbnails; rows must scan as a column of titles.
- Don't truncate titles with ellipses. Let them wrap.

## Accessibility

- The title link's `::after` covers the row, so the whole row is clickable while only one link is announced.
- Focus on the title draws the ring around the row.
- Dates use `<time datetime>`.
- Pairs: `color.text.accent` number on `color.surface.base` (4.5:1); `color.text.muted` meta (4.5:1); `color.text.primary` title on `color.surface.hover` (7:1).
