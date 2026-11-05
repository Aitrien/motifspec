---
name: token-table
status: stable
layouts: [documentation]
tokens:
  - border.width.hairline
  - color.accent.fill.rest
  - color.border.default
  - color.border.subtle
  - color.surface.base
  - color.surface.sunken
  - color.text.muted
  - color.text.primary
  - font.family.body
  - font.family.mono
  - font.line-height.heading
  - font.line-height.ui
  - font.size.label
  - font.weight.strong
  - font.weight.ui
  - size.target.control
  - size.target.min
  - size.target.touch
  - space.inline.sm
  - space.inline.xs
  - space.inset.sm
  - space.stack.xs
---

# Token table

A token shown as it looks, beside its name, value and rule: colour swatches, a primitive palette, type samples, spacing bars and contrast samples.

## When to use

- On the reference pages of a design system's documentation, where a reader compares tokens by eye as well as by name.
- Inside a data table (`data-table.md`), one sample per row, or as a palette of one hue's steps.

## When not to use

- To decorate a page; a swatch stands for a token and is always labelled with its name.
- For a colour that isn't a token. Show only what the tokens define.

## Markup

```html {preview=true}
<div class="cx-table cx-token-table" role="region" aria-labelledby="tokens-example" tabindex="0">
  <table>
    <caption id="tokens-example">Text colours</caption>
    <thead><tr><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Rule</th></tr></thead>
    <tbody>
      <tr><th scope="row"><code>color.text.primary</code></th><td><span class="cx-swatch"></span><code>ash.950</code></td><td>Body copy, headings and any text a reader must read.</td></tr>
    </tbody>
  </table>
</div>
<ol class="cx-palette" aria-label="ash">
  <li class="cx-palette__step"><span class="cx-swatch"></span><b>50</b><span>ash.50</span></li>
  <li class="cx-palette__step"><span class="cx-swatch"></span><b>100</b><span>ash.100</span></li>
</ol>
<span class="cx-pair-sample">Aa</span>
<span class="cx-token-sample">Type sample</span>
<span class="cx-token-bar"></span>
```

<!-- caption: Token table parts -->
| Class | Shows | Set by the generator |
|---|---|---|
| `cx-token-table` | On a data table: keeps each token's name, in the row header, on one line | |
| `cx-swatch` | A colour chip, before the colour's name or value | `--_swatch` |
| `cx-palette` and `cx-palette__step` | One hue's steps, each a chip, its step and its value | `--_swatch` on each chip |
| `cx-pair-sample` | "Aa" in a foreground on a background, beside the pair's ratio | `--_fg` and `--_bg` |
| `cx-token-sample` | Text at a size or in a family | `--_size`, `--_family` |
| `cx-token-bar` | A length, as a bar | `--_width` |

The value each part shows comes from a private custom property on the element, set in a `style` attribute by MotifSpec's docs generator (`scripts/docs-reference.mjs`) from `dist/tokens.json`. That's the only place MotifSpec writes a style attribute, and only in generated pages, which the checker doesn't read. Hand-written markup can't set them (the checker fails any `style` attribute), so it shows the neutral fallback, as above.

## Do

- Name the token in the same row as its sample, in `<code>`, and give its value in text: a reader who can't tell the colours apart reads the value.
- Show a semantic colour's light and dark values side by side, so a reader can check both themes in one view.
- Generate the tables from the tokens, so a changed value shows on the next build.

## Don't

- Don't write token tables by hand; they go out of date.
- Don't show a primitive outside the palette. Pages and components use semantic tokens.
- Don't let a sample carry meaning the text doesn't.

## Accessibility

- Swatches, bars and samples repeat what the text in the same row says; each table has a caption that names it (`data-table.md`).
- A palette is an ordered list named by its hue (`aria-label`).
- A pair sample's own contrast is the pair's: it is drawn in the colours it measures, so a failing pair looks like one.
- Pairs: the text around each sample is `color.text.primary` and `color.text.muted` on `color.surface.raised` (7:1 and 4.5:1); a chip's edge is `color.border.default`.
