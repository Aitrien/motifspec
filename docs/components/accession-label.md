---
name: accession-label
status: stable
layouts: [portfolio]
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.border.default
  - color.border.subtle
  - color.link.rest
  - color.ornament.muted
  - color.status.danger.text
  - color.status.info.text
  - color.status.success.text
  - color.status.warning.text
  - color.surface.raised
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.label
  - font.tracking.ui
  - font.weight.ui
  - radius.round
  - size.mark.tick
  - space.inline.sm
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.stack.xs
---

# Accession label

The system's signature: a herbarium-style label that gives an entry its catalogue number and key facts, framed by registration ticks.

## When to use

- At the top of a project case study (full label) and on a 404 ("No. — / Not in collection").
- In compact form (`.cx-id`) on project cards, post rows and post meta lines.
- Wherever an entry needs a stable, citable identifier.

## When not to use

- For decorative badges or skill lists; use `tag`.
- For more than six fields. Move the rest into the prose.
- On pages that are not catalogued entries (home, indexes).

## Catalogue numbers

`LM-{collection}-{sequence}`, with the sequence zero-padded to three digits and never reused.

| Collection | Code | Example |
|---|---|---|
| Work (projects, case studies) | `W` | `LM-W-004` |
| Writing (posts) | `P` | `LM-P-031` |

Store the number in front matter (`accession: LM-W-004`) rather than deriving it from the date or slug, so it survives renames.

## Markup

```html preview
<dl class="cx-label" aria-label="Accession label">
  <div class="cx-label__id"><dt>No.</dt><dd>LM-W-001</dd></div>
  <div><dt>Filed</dt><dd><time datetime="2026-03-14">2026-03-14</time></dd></div>
  <div><dt>Role</dt><dd>Sole engineer</dd></div>
  <div><dt>Stack</dt><dd>React <span class="cx-sep" aria-hidden="true">|</span> WebGL <span class="cx-sep" aria-hidden="true">|</span> Vite</dd></div>
  <div><dt>Status</dt><dd><span class="cx-status cx-status--live">Live</span></dd></div>
</dl>

<!-- On a case study: the lead label above the title and the card after the article. Role and stack are
     cx-label__detail fields; below size.breakpoint.md the lead label hides them and the card shows everything. -->
<dl class="cx-label cx-label--lead" aria-label="Accession label">
  <div class="cx-label__id"><dt>No.</dt><dd>LM-W-001</dd></div>
  <div><dt>Filed</dt><dd><time datetime="2026-03-14">2026-03-14</time></dd></div>
  <div class="cx-label__detail"><dt>Role</dt><dd>Sole engineer</dd></div>
  <div class="cx-label__detail"><dt>Stack</dt><dd>React <span class="cx-sep" aria-hidden="true">|</span> WebGL <span class="cx-sep" aria-hidden="true">|</span> Vite</dd></div>
  <div><dt>Status</dt><dd><span class="cx-status cx-status--live">Live</span></dd></div>
</dl>
<!-- … the article … -->
<dl class="cx-label cx-label--card" aria-label="Accession label"><!-- the same five fields, no __detail classes --></dl>

<!-- Compact form -->
<p class="cx-id"><span class="cx-id__no">LM-P-031</span><time datetime="2026-10-02">2026-10-02</time><span>6 min read</span></p>
```

## Do

- Put the number first, then the date, then everything else.
- Use ISO dates (`2026-03-14`) in tabular figures.
- Separate items inside a field with `cx-sep` (a hidden "|"). The compact form adds its own "|" between items.
- Use `cx-status--live`, `--building` or `--archived` (`status.md`); each pairs a dot with a word.
- On a case study, pair a lead label (`cx-label--lead`) above the title with a card (`cx-label--card`) after the article, holding the same fields. Below `size.breakpoint.md` the lead label shows only the number, date and status, because role and stack are marked `cx-label__detail`, and the card shows the full label at the end. From `size.breakpoint.md` up the lead label is complete and the card is hidden. Only one of the two is ever complete on screen.
- Let the fields wrap. Each field grows to fill its row and carries a `color.border.subtle` rule on its right and below, so a label that wraps onto several rows reads as a ruled grid, with every row closed by a full-width rule; the frame stays `color.border.default`.

## Don't

- Don't use more than one full label per page. The lead label and its card count as one: at any width, only one of them shows role and stack.
- Don't put links to unrelated pages in the label; it describes the entry.
- Don't recolour the ticks or use them on other components except the specimen plate.

## Accessibility

- `<dl>` with `<dt>`/`<dd>` pairs is read as name–value pairs. Give the list `aria-label="Accession label"`.
- Hidden fields and the hidden card use `display: none`, so assistive tech reads the same fields a sighted reader sees: on a phone, number, date and status at the top and the whole label after the article.
- Status is a word plus a dot, never colour alone.
- The ticks are a background on a pseudo-element and are invisible to assistive tech.
- Pairs: `color.text.accent` on `color.surface.raised` (4.5:1); `color.text.muted` on `color.surface.raised` (4.5:1); `color.status.*.text` on `color.surface.raised` (4.5:1).
