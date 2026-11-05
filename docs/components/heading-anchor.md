---
name: heading-anchor
status: stable
layouts: [portfolio, documentation]
tokens:
  - border.focus.offset
  - border.focus.width
  - color.focus.ring
  - color.surface.hover
  - color.text.muted
  - color.text.primary
  - font.family.mono
  - font.line-height.ui
  - font.size.small
  - font.tracking.body
  - font.weight.ui
  - motion.duration.fast
  - motion.easing.standard
  - radius.pill
  - size.icon.lg
  - size.target.touch
  - space.inline.xs
---

# Heading anchor

A "#" link after a section heading, so readers can copy a link straight to that section.

## When to use

- On every `<h2>` that has an id in reading text: prose sections in posts and case studies, top-level sections of index and docs pages.
- On `<h3>` in long documentation where readers link to sub-sections.

## When not to use

- On the page `<h1>`; the page URL already points there.
- On headings without an id, or on card and list titles that are themselves links.
- On `<h4>` and below.
- On dashboard sections (`docs/layouts/dashboard.md`): they are places on a screen, not parts of an article. Give them an id and no anchor.

## Markup

```html {preview=true}
<!-- Prose: the heading carries the id -->
<h2 id="approach">Approach <a class="cx-anchor" href="#approach" aria-label="Link to Approach">#</a></h2>

<!-- Page section labelled by its heading: wrap the title text so the label excludes the anchor -->
<section id="components" aria-labelledby="components-title">
  <h2><span id="components-title">Components</span> <a class="cx-anchor" href="#components" aria-label="Link to Components">#</a></h2>
</section>
```

Hugo heading render hook (`layouts/_default/_markup/render-heading.html`):

```html
<h{{ .Level }} id="{{ .Anchor }}">{{ .Text | safeHTML }}{{ if eq .Level 2 }} <a class="cx-anchor" href="#{{ .Anchor }}" aria-label="Link to {{ .PlainText }}">#</a>{{ end }}</h{{ .Level }}>
```

## Do

- Keep the 44px round hit area (`size.target.touch`, `radius.pill`), the same shape as the theme toggle. It shows `color.surface.hover` behind the "#" on hover; the negative block margins stop it from changing the heading's line height.

- Put the anchor last in the heading, after a space, so it sits beside the final word.
- Name the destination in `aria-label` ("Link to Approach"), so a list of links reads clearly.
- Point the anchor at the section's own id. When a `<section>` holds the id, link to the section.

## Don't

- Don't replace "#" with an icon or ornament.
- Don't let the anchor wrap onto its own line with nothing else; keep the space before it so it moves with the last word.
- Don't put the anchor inside the text a `<section>`'s `aria-labelledby` points at.

## Accessibility

- It's a real link, reachable by Tab; it shows on focus as well as on hover, and stays visible on touch screens (`hover: none`).
- Its accessible name is the `aria-label`, not "#".
- The hit area is 44 × 44px, well above the 24px minimum.
- Pairs: `color.text.muted` on `color.surface.base` (4.5:1); on hover `color.text.primary` on `color.surface.hover` (7:1).
