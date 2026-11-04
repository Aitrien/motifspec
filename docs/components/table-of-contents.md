---
name: table-of-contents
status: stable
layouts: [portfolio, documentation]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.accent.border
  - color.border.default
  - color.border.strong
  - color.focus.ring
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.ui
  - motion.duration.base
  - motion.easing.standard
  - size.column.sidebar
  - size.target.min
  - size.target.touch
  - space.inline.sm
  - space.inset.md
  - space.inset.xs
  - space.section.sm
  - space.stack.xl
---

# Table of contents

A numbered list of an article's sections, beside the text on wide screens and above it on narrow ones.

## When to use

- On posts with three or more `<h2>` sections, and on every case study.
- Inside the `cx-article` layout, before `cx-article__main` in the DOM.

## When not to use

- On short posts (fewer than three sections).
- For site navigation; use `site-header`.

## Markup

```html preview
<div class="cx-article">
  <nav class="cx-toc" aria-labelledby="toc-title">
    <details open>
      <summary id="toc-title">On this page<svg class="cx-icon cx-icon--sm cx-toc__chevron" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></summary>
      <ol>
        <li><a href="#why"><span class="cx-toc__no">01</span>Why tokens need rules</a></li>
        <li><a href="#pairs"><span class="cx-toc__no">02</span>The pairs contract</a>
          <ol><li><a href="#fail"><span class="cx-toc__no">2.1</span>Failure modes</a></li></ol>
        </li>
      </ol>
    </details>
  </nav>
  <div class="cx-article__main cx-prose"><!-- content with matching ids --></div>
</div>
```

## Do

- Number sections because the order is real; nest `<h3>` entries one level only.
- Ship `<details open>` so it works without script. Readers can collapse it on phones; the chevron rotates with `motion.duration.base`.
- Let the script add `is-docked` (sticky) only when the TOC sits beside the text, and set `aria-current="true"` on the visible section.

## Don't

- Don't make the TOC sticky in CSS alone; when wrapped above the text it would cover content.
- Don't list more than about eight entries.

## Accessibility

- `<nav aria-labelledby>` points at the summary text.
- The active entry is announced through `aria-current`, not colour alone (it also gets the accent rule).
- Entries are at least 24px tall.
- Pairs: `color.text.secondary` on `color.surface.base` (7:1); active rule `color.accent.border` (3:1).
