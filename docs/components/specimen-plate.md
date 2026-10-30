---
name: specimen-plate
status: stable
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.backdrop.saturation
  - color.border.default
  - color.border.strong
  - color.focus.ring
  - color.ornament.muted
  - color.ornament.rest
  - color.ornament.strong
  - color.surface.hover
  - color.surface.raised
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.size.label
  - font.tracking.ui
  - motion.duration.drift
  - motion.duration.fast
  - motion.duration.plate
  - motion.easing.enter
  - motion.easing.standard
  - radius.pill
  - size.column.card
  - size.mark.tick
  - size.target.touch
  - space.inset.md
  - space.inset.sm
  - space.stack.sm
---

# Specimen plate

A contour survey of generated terrain: simplex-noise height lines drawn as a static SVG, which slowly reshape as the terrain drifts. Framed with registration ticks and captioned as Plate 0.

## When to use

- Once, beside the statement on a product's landing page that does not use the backdrop.
- As the only decorative graphic on that page, and its only looping motion.

## When not to use

- On a page with the backdrop (`backdrop.md`), which already draws the survey behind it: one kind of contour field per page. The showcase, which documents both, is the only exception.
- On article, index or 404 pages.
- As a loading indicator, or as a map of a real place. It is generated, not surveyed.
- Without its pause control.

## Markup

The build writes the plate to `dist/plate.html` (the contours at time zero) and ships the script as `dist/plate.js`. In Hugo, inline the markup and load the script; it finds every `.cx-plate[data-plate-seed]` on its own:

```html preview
<figure class="cx-plate-frame">
  <label class="cx-plate__pause" hidden>
    <input class="cx-visually-hidden" type="checkbox" aria-label="Pause animation">
    <svg class="cx-icon" data-when="running" aria-hidden="true" focusable="false"><use href="#cx-icon-pause"></use></svg>
    <svg class="cx-icon" data-when="paused" aria-hidden="true" focusable="false"><use href="#cx-icon-play"></use></svg>
    <span class="cx-tooltip" aria-hidden="true"><span data-when="running">Pause animation</span><span data-when="paused">Play animation</span></span>
  </label>
  {{ (resources.Get "motifspec/plate.html").Content | safeHTML }}
  <figcaption>Plate 0 <span class="cx-sep" aria-hidden="true">|</span> Contour survey <span class="cx-sep" aria-hidden="true">|</span> Simplex noise, 14 levels, index every fifth</figcaption>
</figure>
<script src="{{ (resources.Get "motifspec/plate.js" | minify | fingerprint).RelPermalink }}" defer></script>
```

## Do

- Keep the survey conventions: 14 contour levels, every fifth an index contour (`color.ornament.strong`, `border.width.emphasis`), the rest hairlines in `color.ornament.rest`, over a quarter grid in `color.ornament.muted`.
- Let each contour draw in once on load (`motion.duration.plate`, `motion.easing.enter`, staggered from the lowest line), then let the script start the drift: it eases up from rest over `motion.duration.plate`, then the terrain moves one noise unit every `motion.duration.drift`, linearly, and the lines are recomputed on every second frame.
- Change the terrain with `data-plate-seed` (and the matching `seed` option at build time), never by editing path data.
- Keep the caption factual: what it is, the method and the contour count.

## Don't

- Don't speed up the drift, add a second animated plate, or make it react to the pointer.
- Don't add elevation numbers, place names or a north arrow. It must not read as a real map.
- Don't put text or links inside the plate.

## Accessibility

- The plate is `aria-hidden`; the caption is the only text.
- WCAG 2.2.2 (Pause, Stop, Hide): the drift runs longer than five seconds, so the pause control (a native checkbox named "Pause animation") is reachable by keyboard and its checked state means paused. It ships `hidden` and the script reveals it only when the drift starts, so no dead control appears without JavaScript.
- The script stops drawing while the plate is off screen or the tab is hidden, and never starts under `prefers-reduced-motion: reduce`; there, the contours render complete and still and the pause control stays hidden.
- Contours are decorative: `color.ornament.rest` has no text-contrast requirement.
