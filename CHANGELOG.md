# Changelog

Every release of MotifSpec (named brand-codex until 1.10.0), newest first. Entries before 1.10.0 keep the names they were released under. Versions follow the rules in `CONVENTIONS.md`: renaming or removing a semantic token is major, adding tokens, components or icons is minor, and changing a value or fixing a description is a patch. `npm run build` fails if the version in `package.json` has no entry here.

## [1.10.4] - 2026-10-26

The changes below were meant for 1.10.3, but the `v1.10.3` tag was created a minute before they were merged, so it points at the same commit as 1.10.2. Versions are immutable once Go has fetched them, so they ship as 1.10.4 instead and 1.10.3 is the same as 1.10.2.

### Fixed
- Figures and code blocks in `cx-prose` now get the `space.stack.lg` gap above and below them that the prose rhythm sets. `.cx-figure` and `.cx-code` reset their margins to 0 with a class selector that came later in the stylesheet, which overrode the prose rule, so a figure or code block sat directly under the paragraph before it. The reset now has no specificity (`:where()`), so it only removes the browser's default `<figure>` margins.
- Code block header bar on narrow screens: when the language, file name and copy button wrap onto more than one row, the bar now has `space.inset.sm` padding above and below, so the rows no longer touch the bar's edges. A single-row bar is essentially unchanged: it grows by 1px, its bottom border, which the padding now pushes past `size.target.control`.
- Site header on a phone: when the nav wraps onto its own row, the row has `space.inset.xs` below it, so the current page's highlight no longer sits on the header's bottom border.

### Changed
- `color.surface.highlight` in dark mode is now `sap.800` instead of `sap.900`. On `color.surface.base` (`ash.900`) the old value was almost invisible (1.03:1); the new one is the brightest sap step that keeps `color.text.primary` on it above its 7:1 target (9.91:1; `sap.700` would be 5.99:1). It affects the current page in the site nav, text selection and `<mark>`.
- Site nav: the current page's pill now has a `color.accent.border` hairline inside its edge, in both themes, as well as the highlight fill. The fill alone is close to the header's surface (1.06:1 light, 1.28:1 dark); the outline stands out from it at 4.46:1 light and 6.57:1 dark. It's an inset box-shadow, so the pill doesn't change size.

## [1.10.3] - 2026-10-26

Tagged on the same commit as 1.10.2 by mistake; no changes. Use 1.10.4.

## [1.10.2] - 2026-10-23

### Fixed
- Site header on a phone: when the nav and controls wrap below the wordmark, the nav link text now lines up with the wordmark and the page text instead of starting about 17px further in. `dist/codex.js` marks the wrapped header with `data-wrapped`; the nav then starts at the left of its row and is offset by its pills' padding (a relative offset, so it can't change whether the header wraps), and the controls stay at the right. Without the script the row stays right-aligned as before.

## [1.10.1] - 2026-10-22

### Fixed
- Contour drift no longer starts abruptly. The backdrop used to sit still for `motion.duration.plate` (the specimen plate's draw-in time, which the backdrop doesn't have) and then jump to full speed. It now starts as soon as `dist/plate.js` runs, and every start, on the backdrop and the plate, eases from rest to full speed over `motion.duration.plate`: on load, after the pause control is released, and when a hidden tab or an off-screen plate comes back. Pausing still stops the drift at once.

## [1.10.0] - 2026-10-21

### Changed
- brand-codex is now **MotifSpec**. The repository is `github.com/Aitrien/motifspec` (GitHub redirects the old URL), the Hugo module path is `github.com/aitrien/motifspec`, the npm package is `@aitrien/motifspec`, and `hugo.toml` mounts `dist/` at `assets/motifspec` instead of `assets/brand-codex`. Docs, the README, the showcase, build banners and the planned MCP resource (`motifspec://readme`) use the new name.
- Unchanged on purpose: the `cx-` class and `--cx-` token prefix, the `codex.*` token extensions, the file names `codex.css` and `codex.js`, and the `cx-theme` and `cx-backdrop` storage keys, so markup, tokens and readers' saved settings carry over.

### Removed
- `look/`: four QA screenshots committed by mistake in 1.8.0. Nothing referenced them.

### Migrating a site
1. In the site's config, change the module import path to `github.com/aitrien/motifspec`, then run `hugo mod get github.com/aitrien/motifspec@v1.10.0` and drop the old `brand-codex` lines from `go.mod` and `go.sum`. Earlier tags still declare the old module path, so 1.10.0 is the first release that can be fetched under the new one.
2. Replace `resources.Get "brand-codex/…"` with `resources.Get "motifspec/…"`. The published asset folder becomes `/motifspec/`.

## [1.9.0] - 2026-10-20

### Changed
- Site header on backdrop pages: it still starts on the frost, but once the page scrolls it becomes sticky and its `color.surface.base` surface fades in over `motion.duration.slow`. Back at the top the surface fades out again. `dist/codex.js` sets `data-scrolled` on the header (`"false"` at the top, `"true"` once scrolled); without the script the header scrolls away as before. `site-header.md` and `backdrop.md` updated, including the rule against animating the header on scroll, which now allows this one fade.
- Linked headings and the docked table of contents clear the sticky header at its real height: `dist/codex.js` measures it into `--_header-height`, used by `scroll-padding-top` and the TOC's `top`. Before, one row was assumed, and a header wrapped to two rows on a narrow screen covered the heading.
- Site header on narrow screens: nav pills use half-way padding between `space.inset.sm` and `space.inset.md`, so Work, Writing, About, the pause control and the theme toggle fit one row on a 360px phone (a Galaxy S23) instead of the last link being cut off; narrower than that, the list still scrolls inside its row.
- Hover styles on the nav, the theme toggle and the pause controls apply only under `(hover: hover)`, so a tap on a touch screen no longer leaves the wash stuck on.
- Accession label on case studies: a lead label (`cx-label--lead`) above the title and a card (`cx-label--card`) after the article. Below `size.breakpoint.md` the lead label shows only the number, date and status (role and stack are `cx-label__detail` fields), so on a phone the title starts near the top of the screen, and the card shows the full label at the end. From `size.breakpoint.md` up nothing changes and the card is hidden. `accession-label.md` and the case study row in `templates.md` updated.
- Width media queries: `css/components.css` can write `@media (width < token(size.breakpoint.md))`, and the build fills in the breakpoint value. Only `size.breakpoint.*` tokens, only in `@media` conditions; the audit accepts those values there and nowhere else. The README rule and the breakpoint descriptions now say this instead of "SCSS only".
- Site footer: on a phone the link lists (Pages, Elsewhere) sit side by side in two columns and the colophon takes the row below, instead of every group stacking in one column. The groups are equal-width flex columns: a link list needs half of `size.column.sidebar`, prose a whole one.
- Backdrop: the layer's height is the large viewport (new `size.backdrop.height`, from primitive `size.viewport.1` = `100lvh`) instead of being pinned to the bottom of the screen. On a phone, reaching the bottom of a page slides the address bar away; the layer used to resize with it and the contours jumped.
- Accession label: when the fields wrap onto several rows, each row is now closed by a full-width `color.border.subtle` rule, as in a ruled card. Fields grow to fill their row, and the rules that reach the edge sit under the `color.border.default` frame (drawn again as an outline over the border). Before, wrapped rows were separated only by a gap.
- Backdrop pause control: the choice persists across pages, like the theme. `dist/plate.js` stores `paused` under the `cx-backdrop` key and restores it before the drift starts. The specimen plate's own pause is not stored.

## [1.8.0] - 2026-10-19

### Added
- Backdrop component (`docs/components/backdrop.md`, `cx-backdrop`, `cx-backdrop-page`): the contour survey drawn full-bleed behind every page under a grainy frost. The page surface fades out over its first and last 30rem, so the frost shows behind the header, the opening statement and the footer, and reading happens on the plain surface. Generated as `dist/backdrop.html` (`@aitrien/brand-codex/backdrop.html`); `dist/plate.js` drifts it.
- Backdrop pause control (`cx-backdrop__pause`) in the site header: a native checkbox pill like the theme toggle, revealed by `dist/plate.js` when the drift starts and hidden under reduced motion.
- Tokens: `size.backdrop.fade` (30rem), `size.backdrop.blur` (0.5rem), `border.width.contour` (3px; index contours twice that), `color.backdrop.tint` (40%), `color.backdrop.grain` (14%), `color.backdrop.saturation` (140%), and `color.wash.hover` (10%) for the header hover. Primitives `primitive.size.effect.*`, `primitive.border.width.3` and `primitive.color.amount.*` (percent, via `codex.unit`). The contours use the specimen plate's `color.ornament.rest` and `color.ornament.strong`.
- `cxPlate.backdrop()` in `js/plate.js`, alongside `markup()`.
- The blur is a CSS `filter` on the contours, over a layer three blur radii larger than the viewport. `backdrop-filter` was tried and rejected: Chromium blurs only what is on screen, which leaves lines sharp at the viewport edge.
- The grain is monochrome fractal noise with no blend mode (blending it brought sharp lines back in Chromium).
- Text over the frost is measured against `color.surface.base`; by design, contrast is not checked against the contour lines beneath it.

### Changed
- Every page template sits on the backdrop (`docs/templates.md`). The home statement sits on the frost inside the top fade instead of beside the specimen plate.
- Specimen plate: no longer used on a page with the backdrop (one contour field per page; the showcase, which documents both, is the exception).
- Site header: nav items are pills (`radius.pill`) like the icon-only controls. Nav links, the theme toggle and the pause control share one hover, a wash of `color.text.primary` at `color.wash.hover`, which stays visible on the frost. On a backdrop page the header and footer have no surface of their own and the header is no longer sticky.
- `motion.duration.drift` and the `pause` icon now describe the contour drift on the backdrop as well as the plate.
- README principles: pills include nav items; the contour survey (backdrop or plate) is the one decoration and the one loop per page.
- The showcase sits on the backdrop, with the pause control in its header.

## [1.7.0] - 2026-10-16

### Changed
- Specimen plate: a contour survey of simplex-noise terrain replaces the Vogel phyllotaxis seed head. The build draws the contours as a static SVG; `js/plate.js` (shipped as `dist/plate.js`) reshapes them as the terrain drifts. Index contours every fifth line, a quarter grid, and a once-only draw-in.
- `color.ornament.*` descriptions now name contour lines, index contours and the survey grid instead of seeds.
- The showcase no longer has its own script. It inlines `dist/theme-init.js` and `dist/codex.js`, the same files sites load, so there is one implementation.
- `npm run audit` also checks `dist/codex.js` and `dist/theme-init.js` on their own.

### Added
- `motion.duration.drift` (60000ms): time for the plate's terrain to drift one noise unit.
- `dist/plate.html` and `dist/plate.js` for sites that use the plate, exported as `@aitrien/brand-codex/plate.html` and `/plate.js`.
- `dist/codex.js` (`@aitrien/brand-codex/codex.js`), built from `js/codex.js`: the theme toggle (storage key `cx-theme`), tooltip dismissal on Escape, code copy buttons, and TOC docking with the active section. Timings come from `--cx-motion-*` tokens. Load it with `defer`.
- `dist/theme-init.js` (`@aitrien/brand-codex/theme-init.js`): the one-line `<head>` snippet that applies a stored theme before first paint, documented in `site-header.md`. The build fails if the doc and the file differ.
- `$deprecated` support: the validator requires a reason, rejects deprecated primitives, and fails if a component, the Chroma mapping, a script or a component doc uses a deprecated token. `tokens.css` marks them with a comment and `tokens.json` with a `deprecated` field. `CONVENTIONS.md` describes the deprecate-then-remove rule.

### Deprecated
- `motion.duration.pulse` and `motion.easing.pulse`, which only the seed-head pulse used. They stay published with `$deprecated` ("Unused since the contour plate; removed in 2.0.0.") so this release is minor and the module path stays `github.com/aitrien/brand-codex`. Nothing in the system uses them; move off them before 2.0.0.

### Fixed
- Without JavaScript, the theme toggle and code copy buttons appeared as dead controls: their `display` rules overrode `hidden`. A base `[hidden]` rule now keeps every script-revealed control hidden until the script reveals it (replacing the plate pause's own rule).
- The `pause` icon's usage rule named the plate's pulse; it now names the drift.

## [1.6.0] - 2026-10-16

### Added
- `CHANGELOG.md`, linked from every version number in the showcase (hero eyebrow, accession label, footers).
- Version link pattern (`cx-version`): the version number is a link to this file, with a "View changelog" tooltip and the `arrow-outward` icon because it leaves the site.
- `cx-tooltip--above` modifier for tooltips near the bottom of the page.
- Build check: the build stops if `CHANGELOG.md` has no entry for the current version.
- `dist/tokens.js`: the tokens as an ES module (`version`, `changelog`, `tokens`), exported as `@aitrien/brand-codex/tokens.js`.
- MIT `LICENSE` for the code, tokens and docs. Fonts and icons keep their own licences.

### Changed
- Header lede: "page templates for connected applications".
- The repo's `hugo.toml` now mounts `fonts/` at `static/fonts` as well as `dist/` at `assets/brand-codex`, so a site only needs the import line.

## [1.5.1] - 2026-10-15

### Changed
- Replaced the sample blockquote. It had reused a line from a reference site without attribution; it now carries an attributed quotation with its source in `<cite>`.
- `cite` inside blockquote footers is set upright, matching the mono label voice.

### Added
- Attribution rules in `prose.md` and the README: quote only with a named person and a traceable source; never copy wording from reference sites into sample content.

## [1.5.0] - 2026-10-15

### Added
- Full ornament catalogue: all 80 non-emoji Yarndings 12 glyphs, named and grouped (botanical, frost, stitch, diamond, mark) in `font.family.ornament` → `codex.glyphs`, with `roles` for the system's own ornaments and a `forbidden` set.
- Validator rules for the catalogue: kebab-case names, known groups, no shared glyphs, no forbidden glyphs.
- Showcase glyph section generated from the tokens.

### Fixed
- The footer ornament band stopped short on wide screens. It now covers more than an 8K display.

## [1.4.1] - 2026-10-15

### Fixed
- Specimen plate seeds now grow and shrink around their own centres. They were anchored at one corner because the centring transform was applied before the pulse scale.

## [1.4.0] - 2026-10-15

### Added
- Specimen plate pulse: seeds scale 1 → 1.5 → 1 with a phase offset by radius, so a wave travels from the centre outward.
- `motion.duration.pulse` and `motion.easing.pulse` tokens.
- Pause control for the plate: a native checkbox styled as an icon-only pill, so it works without JavaScript; `pause` and `play` icons.
- Tooltips on `<label>` controls.

### Changed
- Motion principle: state changes animate, plus the plate's pausable pulse; reduced motion stops it and removes the control.

## [1.3.1] - 2026-10-15

### Changed
- The current nav item is highlighted with `color.surface.highlight` instead of an underline; hover uses `color.surface.hover`.
- Heading anchors sit in a 44px round target, like the theme toggle.
- `radius.pill` covers buttons and icon-only controls.

## [1.3.0] - 2026-10-15

### Added
- Tooltip component, with `color.surface.inverse` and `color.text.inverse`.
- `ash.850` primitive for raised surfaces in dark mode.
- `dist/showcase.standalone.html`, a complete document for opening locally.

### Changed
- Theme toggle: an icon-only circle that shows the action ("Switch to dark theme"). Clicking flips the visible theme; returning to the system theme clears the stored choice.
- Copy button and theme toggle are pills; `radius.control` is square.
- Dark surfaces: page `ash.900`, raised `ash.850`, sunken `ash.950`, hover `ash.800` (slightly darkened so secondary text keeps 7:1).

### Removed
- `theme-auto` icon.

### Fixed
- The inline icon sprite could render as an empty box above the header outside the publishing host.
- Icons blocked hover on the controls that contain them.

## [1.2.0] - 2026-10-15

### Added
- `radius.pill` token; `cx-button` is pill-shaped.
- Heading anchor component, on every major section heading.

### Changed
- `radius.control` is square.

## [1.1.0] - 2026-10-15

### Added
- Material Symbols (Sharp, weight 300) as a self-hosted SVG sprite with `icons/manifest.json`; build fails on unknown icon references.
- Icon component and `size.icon.*` tokens.
- Separator component (`cx-sep`): a muted pipe hidden from screen readers.

### Changed
- Separators are "|" instead of "·".
- Button arrows, pagination, theme toggle, copy button, callout titles, TOC chevron and footer links use icons.

### Fixed
- Table row headers no longer take the uppercase column-header style.

## [1.0.0] - 2026-10-14

### Added
- DTCG tokens: colour, typography, space, size, radius, border and motion, with primitive and semantic tiers, dark mode via `codex.modes` and contrast pairs via `codex.pairsWith`.
- Component docs, Chroma syntax mapping, README principles and the showcase page.
- `npm run validate`, `build` and `audit`.

[1.10.2]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#1102---2026-10-23
[1.10.1]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#1101---2026-10-22
[1.10.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#1100---2026-10-21
[1.9.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#190---2026-10-20
[1.8.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#180---2026-10-19
[1.7.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#170---2026-10-16
[1.6.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#160---2026-10-16
[1.5.1]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#151---2026-10-15
[1.5.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#150---2026-10-15
[1.4.1]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#141---2026-10-15
[1.4.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#140---2026-10-15
[1.3.1]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#131---2026-10-15
[1.3.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#130---2026-10-15
[1.2.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#120---2026-10-15
[1.1.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#110---2026-10-15
[1.0.0]: https://github.com/Aitrien/motifspec/blob/main/CHANGELOG.md#100---2026-10-14
