---
name: catalogue-grid
status: stable
layouts: [documentation]
group: collections
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.surface.hover
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - radius.pill
  - size.column.sidebar
  - size.target.min
  - size.target.touch
  - space.inline.sm
  - space.inline.xs
  - space.inset.lg
  - space.inset.md
  - space.inset.sm
  - space.inset.xs
  - space.stack.sm
  - space.stack.xs
---

# Catalogue grid

Specimens laid out like a printed catalogue: a hairline grid of cells, each showing one thing above a caption that names it and links to its full page.

## When to use

- On an overview page that lets a reader scan everything at once: every component variant, or a foundation's samples.
- When each cell has its own page to go to for the detail.

## When not to use

- For content a reader reads in order; use prose or a list.
- For tabular facts to compare; use a data table (`data-table.md`).
- As a card grid for work or writing; use project cards (`project-card.md`).

## Markup

```html {preview=true}
<div class="cx-catalogue">
  <ul class="cx-catalogue__list">
    <li class="cx-catalogue__item">
      <div class="cx-catalogue__specimen" inert><a class="cx-button cx-button--primary" href="/guide/">Get started</a></div>
      <div class="cx-catalogue__caption">
        <p class="cx-catalogue__variant">Primary</p>
        <a class="cx-catalogue__name" href="/components/button-and-link/">Button and link<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></a>
      </div>
    </li>
    <li class="cx-catalogue__item">
      <div class="cx-catalogue__specimen" inert><span class="cx-status cx-status--live">Live</span></div>
      <div class="cx-catalogue__caption">
        <p class="cx-catalogue__variant">Live</p>
        <a class="cx-catalogue__name" href="/components/status/">Status<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></a>
      </div>
    </li>
    <li class="cx-catalogue__item">
      <div class="cx-catalogue__specimen cx-catalogue__specimen--note">The contours behind a whole page.</div>
      <div class="cx-catalogue__caption">
        <p class="cx-catalogue__variant">Backdrop</p>
        <a class="cx-catalogue__name" href="/components/backdrop/">See the page<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></a>
      </div>
    </li>
  </ul>
</div>
```

<!-- caption: Catalogue grid parts -->
| Class | What it is |
|---|---|
| `cx-catalogue` | The frame: a rule along the top, and nothing on the outer sides |
| `cx-catalogue__list` | The cells, as many to a row as fit `size.column.sidebar` |
| `cx-catalogue__item` | One cell, with rules on its end and bottom; `--wide` takes a whole row |
| `cx-catalogue__specimen` | What the cell shows, centred; `--note` for a sentence in place of a specimen |
| `cx-catalogue__caption` | Under a hairline: the variant, then the name |
| `cx-catalogue__variant` | The variant's name, in `color.text.accent` |
| `cx-catalogue__name` | The thing's name in the label voice, linking to its page, with an arrow in a hairline circle |

In Hugo, `motifspec/catalogue-item.html` writes one cell (`docs/hugo.md`).

## Do

- Show the smallest markup that makes each variant recognisable, one variant to a cell.
- Make a specimen `inert` when it is a picture of something interactive: it then takes no clicks or tab stops, and assistive technology skips it, so the caption is what a reader hears. The page it links to has the working version.
- Leave out `inert` only for what shows on hover or focus, such as a tooltip.
- Give a cell `--wide` for something page-wide, such as a header, a footer or a table.
- Give every caption a link to the full page.

## Don't

- Don't put a heading in a caption; the section's heading names the group.
- Don't use it for a mix of things with no pages of their own to link to.
- Don't give ids in specimens that clash with the page's own.

## Accessibility

- The grid is a list, so a screen reader announces how many cells there are.
- Each caption's link names its destination; the variant name sits beside it as text.
- An `inert` specimen is hidden from assistive technology and can't be focused or clicked, so a page of specimens adds no headings, landmarks or tab stops of its own.
- Pairs: `color.text.accent` and `color.text.primary` on `color.surface.base`; the rules are `color.border.default`, under the caption `color.border.subtle`.

## Specimens

None: the Components page is one, from top to bottom.
