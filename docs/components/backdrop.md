---
name: backdrop
status: stable
layouts: [portfolio, documentation, dashboard]
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.backdrop.calm
  - color.backdrop.grain
  - color.backdrop.saturation
  - color.backdrop.tint
  - color.surface.base
  - color.text.primary
  - motion.duration.settle
  - motion.duration.slow
  - motion.easing.standard
  - size.backdrop.fade
  - size.column.sidebar
  - size.container.page
  - space.gutter.page
---

# Backdrop

Contour surveys drawn full-bleed behind the top of the home page and the bottom of every page (or, on a documentation site, down the left edge), under a light, grainy frost. The page's own surface fades out over its first and last `size.backdrop.fade`, so the contours show behind the header, the home page's statement and the footer, and reading happens on the plain surface. They don't drift. The home page's contours settle into place once on arrival, and the pointer warms the ground under it into a hill of rings, like an attention heatmap drawn as a survey.

## When to use

- The foot on every page of a portfolio, 404 included (`docs/layouts/portfolio.md`).
- The head on a portfolio's home page only, behind the statement: it is where a visitor starts. Every other page opens on the plain surface.
- The side on every page in a documentation site's docs shell, down the left edge behind the navigation, with the foot in its place on a phone. A documentation site's landing page has the head and foot, like a portfolio's home page (`docs/layouts/documentation.md`).
- On a dashboard, behind the main area, as `docs/layouts/dashboard.md` says.
- Once each per page, all inside `<body class="cx-backdrop-page">`: the head or the side as its first child, the foot after the footer.

## When not to use

- On the same page as the specimen plate: one kind of contour field per page.
- Inside a component or as a section background. The frost belongs to the page's top and bottom.
- Behind layouts that need the plain surface from the very top, such as a full-screen app or a print stylesheet.

## Markup

The page, as it reaches the browser. Each layer's contours are an SVG the build draws (left out here, so the preview shows only the frost):

```html {preview=true}
<body class="cx-backdrop-page">
  <div class="cx-backdrop cx-backdrop--head" aria-hidden="true" data-plate-seed="3" data-plate-cells="48"><!-- the contours: dist/backdrop.html --></div>
  <a class="cx-skip-link" href="#main">Skip to content</a>
  <header class="cx-header"><!-- site-header.md --></header>
  <main id="main"><!-- the template --></main>
  <footer class="cx-footer"><!-- site-footer.md --></footer>
  <div class="cx-backdrop cx-backdrop--foot" aria-hidden="true" data-plate-seed="7" data-plate-cells="48"><!-- the contours: dist/backdrop-foot.html --></div>
</body>
```

The build writes the head to `dist/backdrop.html` and the foot to `dist/backdrop-foot.html`: the contours at time zero, on a different stretch of terrain each, sliced to cover the layer. In Hugo, `motifspec/body-start.html` inlines the head on the home page, and `motifspec/body-end.html` inlines the foot and loads `dist/plate.js`:

```go-html-template
<body class="cx-backdrop-page">
  {{ (resources.Get "motifspec/backdrop.html").Content | safeHTML }}
  <!-- home page only: <div class="cx-backdrop cx-backdrop--head" aria-hidden="true" data-plate-seed="3" data-plate-cells="48"><svg class="cx-plate__map" preserveAspectRatio="xMidYMid slice" …>…</svg></div> -->
  <a class="cx-skip-link" href="#main">Skip to content</a>
  <header class="cx-header"><!-- site-header.md --></header>
  <main id="main"><!-- the template --></main>
  <footer class="cx-footer"><!-- site-footer.md --></footer>
  {{ (resources.Get "motifspec/backdrop-foot.html").Content | safeHTML }}
  <!-- every page: <div class="cx-backdrop cx-backdrop--foot" aria-hidden="true" data-plate-seed="7" data-plate-cells="48">…</div> -->
  <script src="{{ (resources.Get "motifspec/plate.js" | minify | fingerprint).RelPermalink }}" defer></script>
</body>
```

From the bottom up: the canvas (`color.surface.base`), the contours (the specimen plate's `color.ornament.rest` lines and `color.ornament.strong` index contours, at `border.width.hairline` and `border.width.emphasis`, with `color.backdrop.saturation`), the frost (`color.backdrop.tint` of the surface), the grain (monochrome noise at `color.backdrop.grain`), then the page, whose surface is solid between the two fades. Each layer is `size.backdrop.fade` tall and scrolls with the page: the head from the top of the page, the foot up from the bottom.

### The side

A documentation page reads from the top, so it has no head. The build writes a third layer, `dist/backdrop-side.html`, and `<body class="cx-backdrop-page cx-backdrop-page--side">` puts it down the left edge instead. From `size.breakpoint.md` up it is fixed, so it stays beside the navigation as the page scrolls, and it reaches the left edge of the main column: the page container's margin and gutter, then `size.column.sidebar`. The page's surface, and the header's, fade in across it from left to right, so the contours are strongest at the window's edge, keep `color.backdrop.calm` behind the navigation, and are gone before the article. There is no edge across the page, and the foot is hidden. Below `size.breakpoint.md` the side is hidden and the foot shows behind the footer, as on a portfolio.

In Hugo, with `params.motifspec.layout = "documentation"`, `motifspec/body-start.html` inlines the side on every page but the home page, which gets the head (`docs/hugo.md`). The home page's body has `cx-backdrop-page` without `--side`. Elsewhere, put the side's markup where the head would go and keep the foot after the footer.

### The calm side

Where text sits on the frost, the contours keep only `color.backdrop.calm` of their strength: on the left, where the statement and the footer start, and along the header. They come up to full strength towards the open side. The calm side is a mask, so the lines run behind the text rather than around it.

## Do

- Load `dist/plate.js` on every page. On the home page it eases the head into place over `motion.duration.settle`, quickly at first and then to a stop. On both layers, while they are on screen, the pointer warms the ground under it: a hill rises over two-thirds of a settle, stays while the pointer rests there, and flattens over two once it moves on. A tap does the same on a touch screen. Without the script the contours stay still.
- Let the header and footer sit on the frost. `cx-backdrop-page` removes their surfaces. Once the page scrolls, `dist/codex.js` makes the header sticky and fades its surface back in, so it never sits see-through on the text below; back at the top it returns to the frost (`site-header.md`). Without the script it scrolls away with the page.
- Tune the look through the backdrop tokens only.
- Keep the home page's statement inside the top fade, so it is the one piece of content that sits on the frost.

## Don't

- Don't give sections, panels or cards a frosted background of their own.
- Don't give `<body>` a `z-index`. `cx-backdrop-page` positions it so the layers can sit at its top and bottom; a `z-index` would lift its surface's stacking context over them, or put them on top of it.
- Don't put the head on pages other than the home page (a portfolio's, or a documentation site's landing page), or more than one head, side or foot on a page. The head and the side don't go on the same page.
- Don't make the backdrop drift, or animate it on a timer. Its only motion is the settle on arrival and the response to the pointer.
- Don't raise `color.backdrop.grain` until the noise competes with text, and don't give the grain a `mix-blend-mode`.
- Don't put text, links or controls in the backdrop.

## Accessibility

- The backdrop is `aria-hidden` and carries no information.
- WCAG 2.2.2 (Pause, Stop, Hide) doesn't apply: the settle is over in under five seconds, and every other change follows the reader's own pointer. So there is no pause control.
- Under `prefers-reduced-motion: reduce` the contours never move: no settle and no warming.
- Reading text between the fades sits on `color.surface.base`, so the declared pairs apply. Text over the frost (the header, the footer, the home page's statement, a documentation site's navigation, and all of a short page) is measured against `color.surface.base` too: by design, contrast is not checked against the contour lines beneath it, which are faint there by the calm side.
