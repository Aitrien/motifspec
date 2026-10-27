# MotifSpec

Liam Marshall's design system: the single source of truth for aitrien.com and every project after it. Tokens are [DTCG](https://www.designtokens.org/) JSON, components are documented rules with markup to copy, and an MCP server serves both to AI coding assistants.

## Principles

1. **Name the role, not the page.** Tokens and components describe the job they do, so a recipe app, a docs site and this portfolio can share them.
2. **Colour and type carry meaning.** Hue marks a link, a status or focus. Ornaments are decoration, always hidden from assistive tech.
3. **Measure it, don't eyeball it.** Reading text meets 7:1, controls and focus meet 3:1, and every pair is checked in both themes on every build.
4. **HTML first, script second.** Content, navigation and code work without JavaScript. Scripts add the theme toggle, copy buttons and TOC tracking.
5. **Square, hairline, labelled.** Structure is drawn with 1px rules, square corners and mono labels, like a field ledger. Buttons, nav items and icon-only controls are the one exception: they are pills, so anything you can press is recognisable at a glance.
6. **Motion confirms a change.** Only state changes animate, plus the pausable drift of the contour survey behind the page; text never moves, and reduced motion means none.
7. **One accent, one ornament.** Sap green marks action. Yarndings and the contour survey (the backdrop, or the specimen plate) are the only decoration, once per view.

## Rules for AI assistants

- Use semantic tokens only: `var(--cx-color-text-primary)`, never `--cx-primitive-*`, never a raw hex, px, rem or ms value.
- Read a token's `$description` before using it. It is the usage rule, including when *not* to use it.
- Put text on a surface only if the text token lists that surface in `codex.pairsWith`. If the pair isn't declared, pick a token that declares it.
- Build UI from `docs/components/*.md`. Copy the markup and class names; don't invent new `cx-` classes.
- In a Hugo site, call the `motifspec/` partials (`docs/hugo.md`) instead of writing component markup, and let the render hooks turn Markdown into figures, tables, code blocks and callouts. A component that needs changing is changed here, not overridden in the site.
- Ornaments come only from the 80 approved glyphs in `font.family.ornament` → `codex.glyphs.glyphs` (never `codex.glyphs.forbidden`), always `aria-hidden="true"`, at most one ornament group per viewport.
- Icons come only from `icons/manifest.json`, each for its listed role, as `<svg class="cx-icon"><use href="#cx-icon-{key}"></use></svg>` beside text that says the same thing. Never the icon font, never a CDN.
- Separate inline metadata with `<span class="cx-sep" aria-hidden="true">|</span>`. Never use "·" as a separator.
- Lay out with flex-wrap, auto-fill grids and `min()`. Width media queries can't read custom properties: when a layout must switch between alternate content at a width, write `@media (width < token(size.breakpoint.md))` in `css/components.css` and the build fills in the value. Nothing else may be written as `token(...)`.
- JavaScript is enhancement. Anything a reader needs must work without it; controls that need script ship `hidden` and are revealed by it.
- Use plain, functional labels: Work, Writing, About.
- Write sample and placeholder content from scratch. Never copy wording from reference or competitor sites; quote only with a named person and a traceable source in the blockquote footer.
- Give every section `<h2>` an id and a `cx-anchor` link (see `docs/components/heading-anchor.md`).

## What's here

```
LICENSE             MIT, for code, tokens and docs
CHANGELOG.md        Every release, newest first (the build fails without an entry for the current version)
tokens/             DTCG source of truth (color, typography, space, size, radius, border, motion)
css/components.css  Reference implementation of every component (tokens only)
syntax/chroma.json  Hugo Chroma class → token mapping
icons/              Approved Material Symbols (manifest.json, source SVGs, Apache-2.0 LICENSE)
docs/components/    One rule file per component (front-matter token lists generated from the CSS)
docs/templates.md   Content hierarchy for the six page templates
docs/hugo.md        The Hugo partials and render hooks, their contexts and the front matter they read
layouts/            Hugo partials (_partials/motifspec/) and Markdown render hooks (_markup/), mounted by the module
docs/syntax-highlighting.md
fonts/              Self-hosted WOFF2 (Latin subsets) and their OFL licences
scripts/            validate, build, audit and release
js/codex.js         Theme toggle, copy buttons, tooltip dismissal, TOC docking and active section (shared by sites and the showcase)
js/theme-init.js    One-line <head> snippet that applies a stored theme before first paint
js/plate.js         Contour survey generator for the backdrop and the specimen plate: draws the static contours at build time and animates them in the browser
showcase/           Source of the system's showcase page
mcp/                MCP server (Phase 3)
hugo.toml, go.mod   Hugo module definition and its mounts
dist/               Generated: tokens.css, components in codex.css, chroma.css, fonts.css, icons.svg (sprite), tokens.json (for MCP), tokens.js (ES module export), codex.js and theme-init.js (behaviour), backdrop.html, plate.html and plate.js (backdrop and specimen plate), contrast.md, showcase.html (fragment for publishing), showcase.standalone.html (open locally)
```

## Commands

```sh
npm run validate  # naming rules, tiers, aliases, DTCG value shapes, every contrast pair in both themes
npm run build     # validate, then write dist/ and refresh generated doc tables
npm run audit     # prove dist/showcase.html and the shipped scripts have no raw colour, size or duration outside :root
npm run release:check  # what merging this would release, and whether that release is valid
```

Releases are automatic. Bump `version` in `package.json` and add its `CHANGELOG.md` entry in the PR; once it is merged and CI passes on main, `.github/workflows/release.yml` tags that commit and publishes a GitHub release with the entry as its notes. A merge that doesn't change the version releases nothing.

Node 20 or later, no dependencies.

## Using it in Hugo

Import the module and pin a release with `hugo mod get github.com/aitrien/motifspec@vX.Y.Z`. It mounts `dist/` at `assets/motifspec`, `fonts/` at `static/fonts`, and `layouts/` at `layouts`, so a site gets the component partials and the Markdown render hooks as well as the CSS and scripts:

```toml
[module]
  [[module.imports]]
    path = "github.com/aitrien/motifspec"
```

A page template then needs only the shell partials around its own content:

```go-html-template
<head>
  {{ partial "motifspec/head.html" . }}
</head>
<body class="cx-backdrop-page">
  {{ partial "motifspec/body-start.html" . }}
  {{ partial "motifspec/site-header.html" . }}
  <main id="main" tabindex="-1">…</main>
  {{ partial "motifspec/body-end.html" . }}
</body>
```

`docs/hugo.md` lists every partial with its context, the front matter they read, the render hooks and the Markdown they expect, and the Goldmark settings they need. Keep the stylesheet's published path one level below the site root (Hugo publishes it at `/motifspec/`): its font URLs are `../fonts/…`, which resolve to the mounted `/fonts/`.

Outside Hugo, copy the markup from `docs/components/*.md` and load `dist/codex.css`, `dist/codex.js` and `dist/theme-init.js` yourself.

## The identity in brief

| | |
|---|---|
| Concept | A specimen ledger: an archival botanical compendium drawn as a technical catalogue, with a US national-park signage voice. |
| Colour | Five dye-plant hues generated in OKLCH: ash (neutral), sap (accent and success), woad (focus and info), weld (warning) and madder (danger). Cool paper in light mode, green-black in dark mode. |
| Type | National Park (display and body), JetBrains Mono (code and labels), Yarndings 12 (ornament). 88 KB total. |
| Signature | The accession label: every entry has a catalogue number (`LM-W-004`, `LM-P-031`) shown on a framed label with registration ticks. |
| Decoration | The backdrop: a contour survey of generated terrain that slowly drifts behind every page under a grainy frost, showing through above the header and below the footer. The same survey framed as the specimen plate (Plate 0) for landing pages, and a knitted Yarndings band in the footer. |
| Icons | 16 Material Symbols (Sharp, weight 300) as a self-hosted SVG sprite: direction arrows, theme, copy, callout kinds, RSS, external links. Functional only. |
| Separator | A muted pipe, `\|`, hidden from screen readers. |

See `CONVENTIONS.md` for naming, tiers, extensions and versioning.

## Licence

The code, tokens and docs are MIT (`LICENSE`). The fonts keep their SIL Open Font Licences (`fonts/OFL-*.txt`) and the icons their Apache-2.0 licence (`icons/LICENSE`).
