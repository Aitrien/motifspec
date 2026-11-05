---
name: data-table
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.border.subtle
  - color.focus.ring
  - color.surface.hover
  - color.surface.raised
  - color.surface.sunken
  - color.text.muted
  - color.text.secondary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - size.container.breakout
  - size.measure.prose
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.stack.lg
---

# Data table

A framed table for comparing values: mono headers, hairline rows, right-aligned figures, and horizontal scroll when needed.

## When to use

- For real tabular data: metrics, version histories, font budgets, recipe quantities, API parameters.
- In prose, with `cx-table--breakout` when it has more than four columns.

## When not to use

- For layout.
- For two-column key–value facts about an entry; use `accession-label`.

## Markup

```html {preview=true}
<div class="cx-table" role="region" aria-labelledby="tbl-fonts" tabindex="0">
  <table>
    <caption id="tbl-fonts">Font budget <span class="cx-sep" aria-hidden="true">|</span> Latin subset</caption>
    <thead><tr><th scope="col">Family</th><th scope="col">Role</th><th scope="col" class="is-num">KB</th></tr></thead>
    <tbody>
      <tr><th scope="row">National Park</th><td>Display, body</td><td class="is-num">38.1</td></tr>
    </tbody>
  </table>
</div>
```

A table of things to act on gives each row a state cell (`td.is-state`, with a status from `status.md`) and an actions cell (`td.is-actions`) of compact buttons. Each button's hidden text finishes its name, so a screen reader hears "Restart Jellyfin", not "Restart" six times:

```html {preview=true}
<div class="cx-table" role="region" aria-labelledby="tbl-services" tabindex="0">
  <table>
    <caption id="tbl-services">Services</caption>
    <thead><tr><th scope="col">Service</th><th scope="col">State</th><th scope="col" class="is-num">Uptime</th><th scope="col"><span class="cx-visually-hidden">Actions</span></th></tr></thead>
    <tbody>
      <tr>
        <th scope="row">Jellyfin</th>
        <td class="is-state"><span class="cx-status cx-status--success">Running</span></td>
        <td class="is-num">12 d</td>
        <td class="is-actions"><div class="cx-table__actions"><button class="cx-button cx-button--sm" type="button">Restart<span class="cx-visually-hidden"> Jellyfin</span></button><button class="cx-button cx-button--sm" type="button">Logs<span class="cx-visually-hidden"> for Jellyfin</span></button></div></td>
      </tr>
    </tbody>
  </table>
</div>
```

## Do

- Give every table a `<caption>`.
- Mark numeric columns `is-num` (right-aligned, tabular, mono).
- Use `<th scope="row">` for the first cell when it names the row.

## Don't

- Don't zebra-stripe; rows are separated by hairlines and highlight on hover.
- Don't put interactive controls in cells other than the actions cell, and keep those to two or three per row.

## Accessibility

- The wrapper is a focusable region named by the caption, so keyboard users can scroll it.
- Header cells use `scope`.
- Visually hidden text in a cell, such as a hidden column heading or the rest of a button's name, stays inside the scroll box, so a wide table never widens the page on a phone.
- Pairs: `color.text.secondary` headers on `color.surface.sunken` (7:1); `color.text.primary` cells on `color.surface.raised` and `color.surface.hover` (7:1).
