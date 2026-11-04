---
name: ornament
status: stable
layouts: [portfolio, documentation]
tokens:
  - border.width.hairline
  - color.border.subtle
  - color.ornament.rest
  - font.family.ornament
  - font.line-height.display
  - font.tracking.label
  - size.ornament.lg
  - size.ornament.md
  - size.ornament.sm
  - space.inline.sm
  - space.inset.md
---

# Ornament

Yarndings 12 knitting-chart glyphs: the footer band, the prose divider, the article end mark and one empty-state glyph.

## When to use

- `cx-band`: once per page, at the top of the footer.
- `<hr>` in prose (or `cx-divider`): a three-stitch break between major parts.
- `cx-end-mark`: the flower glyph after an article's last sentence.
- `cx-ornament--lg`: one sprout on an empty state or 404.
- `cx-ornament` (with `--lg` or default size): a single glyph from the catalogue elsewhere, for example a leaf beside a colophon or a snowflake on a seasonal post.

## When not to use

- As icons, bullets, status markers or anything that carries meaning.
- More than one ornament group in a viewport.
- On dashboards (`docs/layouts/dashboard.md`), which have no ornaments.
- Glyphs in `codex.glyphs.forbidden` (`u v w x y z [ ] { }`): faces, a robot, hearts and animals read as emoji and are never allowed.

## Markup

```html preview
<span class="cx-band" aria-hidden="true"></span>
<hr class="cx-divider">
<p>Last sentence of the article.<span class="cx-end-mark" aria-hidden="true">g</span></p>
<span class="cx-ornament cx-ornament--lg" aria-hidden="true">f</span>
<span class="cx-ornament" aria-hidden="true">h</span> <!-- leaf -->
```

## The catalogue

`font.family.ornament` → `$extensions["codex.glyphs"]` lists all 80 approved glyphs by name, with the key that types each one and its group:

| Group | Character | Examples (key) |
|---|---|---|
| botanical | Plants and flowers; the default choice | leaf `h`, sprout `f`, flower `g`, potted `c`, bloom `b`, blossom `m`, petals `P`, clover `E` |
| frost | Snowflakes, stars, bursts; dense, one at a time | snowflake `S`, snowflake-small `d`, burst `V`, frost `i` |
| stitch | Crosses, checks, small squares | band-small `k`, cross `A`, maltese `D`, checker-x `+`, knot `4`, pinwheel `>` |
| diamond | Diamonds and rings | diamond `–` (U+2013), diamond-nested `p`, ring `?` |
| mark | Corners, bars, dots, triangles | summit `·` (U+00B7), corner-top-left `/`, bar `(`, dot `.` |

`codex.glyphs.roles` fixes the glyphs for the system's own ornaments (band, divider, end mark, empty state); anything else may use any approved glyph. The showcase lists every glyph.

## Do

- Size glyphs on the 12px stitch grid (`size.ornament.sm`, `.md`, `.lg`).
- Use `font-display: block` for Yarndings and preload it (11 KB), so letters never flash in its place.
- Colour ornaments with `color.ornament.rest`.
- Refer to glyphs by catalogue name in docs and front matter (`leaf`), and look up the key, so content stays readable.
- Prefer botanical glyphs; mix at most two groups on a page.

## Don't

- Don't type glyphs into content where a text fallback would show letters to someone whose font failed. Use `aria-hidden` spans or generated content.
- Don't animate ornaments.

## Accessibility

- Every ornament is `aria-hidden="true"` or generated content with no text equivalent.
- `<hr>` keeps its separator role.
- Pair: `color.ornament.rest` on `color.surface.base` (3:1) so the band is visible, although it carries no information.
