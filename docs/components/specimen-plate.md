---
name: specimen-plate
status: stable
layouts: [shared]
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

A framed, captioned illustration that moves: an animated SVG, a short silent video or a scripted drawing, with a control to pause it. MotifSpec ships one, a contour survey of generated terrain that slowly drifts.

## When to use

- Once, in a page's head, beside or below the statement: a landing page, or the head of a case study or post whose subject is easier to show than to say.
- For a moving picture of the subject, such as a product's interface at work or a process running, or for the contour survey as the page's one decorative graphic.
- As the only illustration on the page that loops.

## When not to use

- For a still image or diagram; that is a figure (`figure.md`), numbered from Plate 1.
- More than once on a page, or beside another animation.
- The contour survey on a page with the backdrop (`backdrop.md`), which draws the same survey behind it: one kind of contour field per page. Another illustration can sit on a backdrop page.
- As a loading indicator, or for anything a reader must watch to follow the page.
- For an animated GIF, or an SVG in an `<img>`: neither can be paused.
- Without its pause control, when it moves for longer than five seconds.

## Markup

```html {preview=true}
<figure class="cx-plate-frame">
  <label class="cx-plate__pause" hidden>
    <input class="cx-visually-hidden" type="checkbox" aria-label="Pause animation">
    <svg class="cx-icon" data-when="running" aria-hidden="true" focusable="false"><use href="#cx-icon-pause"></use></svg>
    <svg class="cx-icon" data-when="paused" aria-hidden="true" focusable="false"><use href="#cx-icon-play"></use></svg>
    <span class="cx-tooltip" aria-hidden="true"><span data-when="running">Pause animation</span><span data-when="paused">Play animation</span></span>
  </label>
  <div class="cx-plate" data-plate-motion aria-hidden="true">
    <svg class="cx-plate__map" viewBox="0 0 240 240" focusable="false">
      <path class="cx-plate__grid" d="M80 0V240M160 0V240M0 80H240M0 160H240"/>
      <path class="cx-plate__line" pathLength="1" d="M0 200C60 150 90 190 130 120S200 60 240 70"/>
      <path class="cx-plate__line cx-plate__line--index" pathLength="1" d="M0 220C70 180 100 210 150 150S210 100 240 110"/>
      <path class="cx-plate__line" pathLength="1" d="M60 240C90 200 140 220 170 180S220 150 240 150"/>
    </svg>
  </div>
  <figcaption>Plate 0 <span class="cx-sep" aria-hidden="true">|</span> What it shows</figcaption>
</figure>
```

The frame (`cx-plate-frame`) holds the pause control, the plate (`cx-plate`) and the caption. The plate is square, or 16:10 with `cx-plate--wide`, and whatever is inside it fills it:

<!-- caption: What a plate can hold -->
| Illustration | How it moves | How it pauses |
|---|---|---|
| An inline SVG | CSS animations or SMIL in the drawing | `dist/codex.js` stops both |
| A video | Muted, looping, no sound track, with a poster | `dist/codex.js` pauses it |
| A scripted drawing (SVG or canvas) | The site's own script | The script listens for `cx-plate-pause` |
| The contour survey | `dist/plate.js` | `dist/plate.js` |

Mark a plate whose illustration moves for longer than five seconds with `data-plate-motion`. `dist/codex.js` then reveals the pause control, pauses or plays the illustration with it, and sets `data-paused` on the frame while it is paused. Under `prefers-reduced-motion: reduce`, nothing plays, the control stays hidden, and CSS animations inside the plate don't run. The example above only draws in once, so it would leave `data-plate-motion` off; it carries it here to show the control.

The plate's drawing classes suit any line drawing, not only contours: `cx-plate__grid` for a quarter grid in `color.ornament.muted`, `cx-plate__line` for a hairline in `color.ornament.rest` that draws in once on load (give each path `pathLength="1"`), and `cx-plate__line--index` for the emphasised line in `color.ornament.strong`.

### In Hugo

`partial "motifspec/specimen-plate.html"` writes the frame, the pause control and the caption around an asset, which it inlines (an `.svg` or `.html` file) or plays (an `.mp4` or `.webm` video):

```go-html-template
{{ partial "motifspec/specimen-plate.html" (dict "src" "illustrations/sync.svg" "caption" "A sync in progress" "label" "Two devices exchange changes, then show the same list.") }}
{{ partial "motifspec/specimen-plate.html" (dict "src" "illustrations/tour.mp4" "poster" "illustrations/tour.png" "caption" "The editor" "wide" true) }}
{{ partial "motifspec/specimen-plate.html" (dict "src" "motifspec/plate.html" "caption" "Contour survey") }}
```

`label` is the illustration's text alternative, for one that shows something a reader needs; without it the plate is decoration and `aria-hidden`. `dist/codex.js` and `dist/plate.js` load on every page through `head.html` and `body-end.html`.

### The contour survey

MotifSpec's own plate: simplex-noise height lines drawn as a static SVG, which slowly reshape as the terrain drifts. The build writes it to `dist/plate.html` (the contours at time zero), with `data-plate-seed` on the plate, and `dist/plate.js` finds and runs every such plate on its own.

- Keep the survey conventions: 14 contour levels, every fifth an index contour, the rest hairlines, over the quarter grid.
- Each contour draws in once on load (`motion.duration.plate`, `motion.easing.enter`, staggered from the lowest line). Then the script starts the drift: it eases up from rest over `motion.duration.plate`, then the terrain moves one noise unit every `motion.duration.drift`, linearly, and the lines are recomputed on every second frame.
- Change the terrain with `data-plate-seed` (and the matching `seed` option at build time), never by editing path data.
- Don't speed up the drift or make it react to the pointer, and don't add elevation numbers, place names or a north arrow: it must not read as a real map.

## Do

- Caption it "Plate 0" and what it shows, in a few words. Plate 0 is the one moving plate; figures count from 1.
- Colour an illustration of your own with MotifSpec's tokens (classes, or `var(--cx-color-…)` in the drawing's own styles), so it follows the theme.
- Time it with the motion tokens where it can (`var(--cx-motion-duration-…)`), and keep it slow: a loop the eye can rest on, not one that pulls at it.
- Draw it so it reads complete when still, at its first frame: that is what reduced motion, a paused plate and a page without script show.
- Give a video a poster, and no sound track.

## Don't

- Don't put text, links or controls inside the plate, other than the pause control.
- Don't flash: nothing in it changes brightness sharply more than three times a second.
- Don't start it with sound, or show a video's own controls.
- Don't use the plate for a second animation on a page that already has one.

## Accessibility

- A decorative plate is `aria-hidden`, and the caption is its only text. One that shows something a reader needs has a text alternative (`role="img"` and `aria-label`, or the partial's `label`), and its caption still says what it is.
- WCAG 2.2.2 (Pause, Stop, Hide): anything that moves for more than five seconds has the pause control, a native checkbox named "Pause animation" whose checked state means paused, reachable by keyboard. It ships `hidden`, and a script reveals it only when the illustration starts, so no dead control appears without JavaScript or under reduced motion.
- Under `prefers-reduced-motion: reduce` nothing plays: CSS animations don't run, SMIL and video stay paused, and the contour survey renders complete and still.
- WCAG 2.3.1 (Three Flashes): nothing flashes more than three times a second.
- The contour survey stops drawing while it is off screen or the tab is hidden.
- The drawing classes are decorative: `color.ornament.rest` has no text-contrast requirement.
