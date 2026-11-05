# MotifSpec

Liam Marshall's design system: the single source of truth for aitrien.com and every project after it. The documentation is at [motifspec.com](https://motifspec.com), which renders this README's guide sections, the docs and the changelog from this repository. Tokens are [DTCG](https://www.designtokens.org/) JSON, components are documented rules with markup to copy, one checker holds every project that uses it to those rules, and an MCP server gives AI assistants all three.


## Principles

1. **Name the role, not the page.** Tokens and components describe the job they do, so a recipe app, a docs site and this portfolio can share them.
2. **Colour and type carry meaning.** Hue marks a link, a status or focus. Ornaments are decoration, always hidden from assistive tech.
3. **Measure it, don't eyeball it.** Reading text meets 7:1, controls and focus meet 3:1, and every pair is checked in both themes on every build.
4. **HTML first, script second.** Content, navigation and code work without JavaScript. Scripts add the theme toggle, copy buttons and TOC tracking.
5. **Square, hairline, labelled.** Structure is drawn with 1px rules, square corners and mono labels, like a field ledger. Buttons, nav items and icon-only controls are the one exception: they are pills, so anything you can press is recognisable at a glance.
6. **Motion confirms a change.** Only state changes animate, plus the contour survey: it settles once on arrival and answers the pointer, and the specimen plate's drift can be paused. Text never moves, and reduced motion means none.
7. **One accent; decoration as the layout allows.** Sap green marks action. Yarndings and the contour survey (the backdrop, or the specimen plate) are the only decoration, once per view, where the layout allows them.

## Layouts

A layout is a kind of site: its shell, page templates, components, decoration and heading rules. Pick the one that fits before choosing components.

<!-- caption: Layouts -->
| Layout | For | File |
|---|---|---|
| Portfolio | Case studies, writing and an about page | `docs/layouts/portfolio.md` |
| Dashboard | Tools and admin screens (in progress) | `docs/layouts/dashboard.md` |
| Documentation | Guides, reference and a changelog | `docs/layouts/documentation.md` |
| À la carte | A project that fits none of them: chosen components, its own frame | `docs/layouts/a-la-carte.md` |

Each component doc says which layouts it belongs to in its front matter (`layouts:`). Shared components belong to every layout.

A project declares its layout so the checker can hold it to it. A Hugo site sets it in its config:

```toml
[params.motifspec]
  layout = "dashboard"
```

An à la carte project also lists the components it uses, by doc name: `components = ["table-of-contents", "heading-anchor"]`. Outside Hugo, pass `--layout` (and `--components`) to the checker. A project that declares nothing is checked as portfolio.

## Rules for AI assistants

- Choose the layout first (`docs/layouts/`), and use the project's stack if it has one; otherwise see the layout's stack table. Use shared components and the components of that layout only.
- Use semantic tokens only: `var(--cx-color-text-primary)`, never `--cx-primitive-*`, never a raw hex, px, rem or ms value.
- Read a token's `$description` before using it. It is the usage rule, including when *not* to use it.
- Put text on a surface only if the text token lists that surface in `codex.pairsWith`. If the pair isn't declared, pick a token that declares it.
- Build UI from `docs/components/*.md`. Copy the markup and class names; don't invent new `cx-` classes.
- In a Hugo site, call the `motifspec/` partials (`docs/hugo.md`) instead of writing component markup, and let the render hooks turn Markdown into figures, tables, code blocks and callouts. A component that needs changing is changed here, not overridden in the site.
- Before finishing, run the checker on the project: `node <module>/scripts/check.mjs .` (a Hugo site finds `<module>` with `hugo config mounts`; see `docs/hugo.md`). Fix what it reports; don't work around it.
- Ornaments come only from the 80 approved glyphs in `font.family.ornament` → `codex.glyphs.glyphs` (never `codex.glyphs.forbidden`), always `aria-hidden="true"`, at most one ornament group per viewport.
- Icons come only from `icons/manifest.json`, each for its listed role, as `<svg class="cx-icon"><use href="#cx-icon-{key}"></use></svg>` beside text that says the same thing. Never the icon font, never a CDN.
- Separate inline metadata with `<span class="cx-sep" aria-hidden="true">|</span>`. Never use "·" as a separator.
- Lay out with flex-wrap, auto-fill grids and `min()`. Width media queries can't read custom properties: when a layout must switch between alternate content at a width, write `@media (width < token(size.breakpoint.md))` in `css/components.css` and the build fills in the value. Nothing else may be written as `token(...)`.
- JavaScript is enhancement. In a site that renders without script, anything a reader needs must work without it; controls that need script ship `hidden` and are revealed by it. In an app that needs script to render at all, MotifSpec's components add no script of their own: native elements (`<details>`, `<meter>`, `<dialog>`, radio buttons) do the work.
- Serve MotifSpec's own files (CSS, fonts, icons, scripts) from the project, never from a CDN. Where an app gets its data is the project's decision, not a MotifSpec rule.
- Use plain, functional labels: Work, Writing, About.
- Write sample and placeholder content from scratch. Never copy wording from reference or competitor sites; quote only with a named person and a traceable source in the blockquote footer.
- Give every section `<h2>` in reading text an id and a `cx-anchor` link (see `docs/components/heading-anchor.md`). Dashboard sections have an id and no anchor.

## Getting started

MotifSpec reaches a project three ways: as a Hugo module, as an npm package, or through an AI assistant connected to its MCP server. Choose the layout first ([Layouts](#layouts)).

### In a Hugo site

Import `github.com/aitrien/motifspec` as a Hugo module and pin a release with `hugo mod get github.com/aitrien/motifspec@vX.Y.Z`. The site then gets the CSS, scripts, fonts, component partials and Markdown render hooks; `docs/hugo.md` covers setup, every partial and the front matter they read.

### From npm

```sh
npm install --save-exact @aitrien/motifspec
```

Pin an exact version, as a Hugo site pins a tag: the version you install is the version the checker holds you to. The package has the CSS, scripts, tokens, fonts, icons, component docs, Hugo templates and the checker; it leaves out the showcase.

<!-- caption: npm imports -->
| Import | What it is |
|---|---|
| `@aitrien/motifspec/codex.css` | Tokens, fonts and every component. Its font URLs are `../fonts/…`, so a bundler that copies assets (Vite, webpack, Parcel) resolves them from the package. Without a bundler, serve `dist/` and `fonts/` side by side. |
| `@aitrien/motifspec/tokens.css`, `fonts.css`, `chroma.css` | The parts on their own: tokens only, `@font-face` only, syntax highlighting only. |
| `@aitrien/motifspec/codex.js` | Behaviour: theme toggle, copy buttons, TOC, tooltips. Load with `defer`. |
| `@aitrien/motifspec/theme-init.js` | Inline it in `<head>` before the stylesheet so a stored theme applies before first paint. |
| `@aitrien/motifspec/plate.js`, `backdrop.html`, `backdrop-foot.html`, `backdrop-side.html` | The contour backdrop and its motion (`backdrop.md`). |
| `@aitrien/motifspec/icons.svg` | The icon sprite. Inline it once in `<body>`. |
| `@aitrien/motifspec/tokens.js`, `tokens.json` | Every token with its value, tier and CSS name, for build tools. |
| `@aitrien/motifspec/check` | `checkText` and `checkProject` from the rule checker. |
| `@aitrien/motifspec/fonts/*` | The WOFF2 files, for preloading. |

Copy component markup from `docs/components/*.md` (in the package under `node_modules/@aitrien/motifspec/docs/`). For React and similar, the MCP server's `get_component` with `form: "jsx"` gives the same examples as JSX, converted mechanically; components with script describe what to implement in their Behaviour section.

### With an AI assistant

The MCP server at `https://mcp.motifspec.com/mcp` serves the latest release to any assistant that supports remote MCP servers. It needs no sign-in and only reads. [The MCP server](#the-mcp-server) lists its tools.

To connect it:

- **Claude (web, desktop):** Customize → Connectors → Add custom connector, with the URL above and "No sign in".
- **Claude Code:** `claude mcp add --transport http motifspec https://mcp.motifspec.com/mcp`, or a project `.mcp.json`.
- **VS Code:** add it to `.vscode/mcp.json` with `"type": "http"` and the URL.
- **Others:** add a remote MCP server by URL.

## Checking a project

`scripts/check.mjs` is the one rule checker: this repo's audit runs it on `layouts/` and the component docs' markup, and projects run it from the version they pin. It checks a project's `layouts/` and `content/` against the release it comes from, and fails on:

- a stylesheet anywhere in the project, or a `style` attribute
- a raw colour, or a number with a length or time unit (zero is allowed)
- a primitive, unknown or deprecated `--cx-` token
- a `cx-` class that the stylesheet and scripts don't define, or a `cx-icon-` that isn't in `icons/manifest.json`
- "·" used as a separator
- an unknown layout, or an unknown component in an à la carte list
- in an à la carte project's own stylesheet, the same raw values and tokens, and any selector that targets a `cx-` class

It warns, without failing, when a component (its classes or its Hugo partial) is used outside its layouts, or an à la carte project uses a layout component it hasn't listed. These become failures in a later release.

In a Hugo site, run `node <module>/scripts/check.mjs .`, where `hugo config mounts` gives `<module>` (`docs/hugo.md`). Outside Hugo, run it from the package, pointing `--dirs` at the folders with your markup:

```sh
npx motifspec-check . --dirs src
```

Add `--layout dashboard` (or the project's layout) so components are checked against it; à la carte projects add `--components` with their list. It reads `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.md` and `.mdx` (both `class` and `className`), and skips `node_modules`, `dist` and `build`. Its stylesheet rule applies here too: a project using MotifSpec has no CSS of its own, except an à la carte project's frame (`docs/layouts/a-la-carte.md`).

## The MCP server

<!-- caption: MCP tools -->
| Tool | What it returns |
|---|---|
| `get_rules` | The [rules for AI assistants](#rules-for-ai-assistants), and what the checker enforces |
| `find_tokens` | Semantic tokens matching a query: CSS property, usage rule, light and dark values, the surfaces a colour may sit on |
| `get_component` | A component's doc (markup, do and don't, accessibility, behaviour). `form` picks the markup: `html`, `jsx` or `hugo` (with its partial); without it, the HTML and the partial. Without a name, the list with each component's layouts |
| `get_doc` | `docs/hugo.md`, or a layout from `docs/layouts/` (`portfolio`, `dashboard`, `documentation`, `a-la-carte`) |
| `check` | The checker's problems in a piece of markup, Markdown or CSS; with a `layout`, warnings for components from other layouts |

It serves the latest release. A project pinned to an older version can be offered something its version doesn't have yet; its own checker, at its pinned version, catches that.

## The identity in brief

<!-- caption: The identity in brief -->
| | |
|---|---|
| Concept | A specimen ledger: an archival botanical compendium drawn as a technical catalogue, with a US national-park signage voice. |
| Colour | Five dye-plant hues generated in OKLCH: ash (neutral), sap (accent and success), woad (focus and info), weld (warning) and madder (danger). Cool paper in light mode, green-black in dark mode. |
| Type | National Park (display and body), JetBrains Mono (code and labels), Yarndings 12 (ornament). 88 KB total. |
| Signature | The accession label: every entry has a catalogue number (`LM-W-004`, `LM-P-031`) shown on a framed label with registration ticks. |
| Decoration | The backdrop: contour surveys of generated terrain under a light, grainy frost, behind the home page's statement and every footer. They settle once on arrival and warm into hills under the pointer, like a heatmap. The same survey framed as the specimen plate (Plate 0) for landing pages, and a knitted Yarndings band in the footer. |
| Icons | 16 Material Symbols (Sharp, weight 300) as a self-hosted SVG sprite: direction arrows, theme, copy, callout kinds, RSS, external links. Functional only. |
| Separator | A muted pipe, `\|`, hidden from screen readers. |

See `CONVENTIONS.md` for naming, tiers, extensions and versioning.

## What's here

```
LICENSE             MIT, for code, tokens and docs
AGENTS.md           Instructions for AI agents changing this repo (CLAUDE.md points to it)
CHANGELOG.md        Every release, newest first (the build fails without an entry for the current version)
tokens/             DTCG source of truth (color, typography, space, size, radius, border, motion)
css/components.css  Reference implementation of every component (tokens only)
syntax/chroma.json  Hugo Chroma class → token mapping
icons/              Approved Material Symbols (manifest.json, source SVGs, Apache-2.0 LICENSE)
docs/components/    One rule file per component (front-matter token lists generated from the CSS)
docs/layouts/       One file per layout: shell, page templates, components, decoration, headings, stack
docs/hugo.md        The Hugo partials and render hooks, their contexts and the front matter they read
docs/foundations/, docs/reference/  The wording of motifspec.com's pages about the tokens, icons and checker rules; their tables are generated
layouts/            Hugo partials (_partials/motifspec/) and Markdown render hooks (_markup/), mounted by the module
docs/syntax-highlighting.md
fonts/              Self-hosted WOFF2 (Latin subsets) and their OFL licences
scripts/            validate, build, audit, check (the rule checker projects run), pack-check, release, and docs with docs-reference (motifspec.com and its generated pages)
js/codex.js         Theme toggle, copy buttons, tooltip dismissal, TOC docking and active section (shared by sites and the showcase)
js/theme-init.js    One-line <head> snippet that applies a stored theme before first paint
js/plate.js         Contour survey generator for the backdrop and the specimen plate: draws the static contours at build time and animates them in the browser
showcase/           Source of the system's showcase page
site/               motifspec.com: a Hugo site whose pages are made from this README's sections, docs/, CONVENTIONS.md and CHANGELOG.md
mcp/                The MCP server (server.mjs), its Lambda handler, bundle step and tests
infra/mcp.yml       The server's AWS stack and deploy role (CloudFormation, applied by hand)
hugo.toml, go.mod   Hugo module definition and its mounts
dist/               Generated: tokens.css, components in codex.css, chroma.css, fonts.css, icons.svg (sprite), tokens.json, tokens.js (ES module export), codex.js and theme-init.js (behaviour), backdrop.html, backdrop-foot.html and backdrop-side.html, plate.html and plate.js (backdrop and specimen plate), contrast.md, showcase.html (fragment for publishing), showcase.standalone.html (open locally)
```

## Commands

```sh
npm run validate  # naming rules, tiers, aliases, DTCG value shapes, every contrast pair in both themes
npm run build     # validate, then write dist/ and refresh generated doc tables
npm run audit     # prove dist/showcase.html and the shipped scripts have no raw colour, size or duration outside :root
npm run release:check  # what merging this would release, and whether that release is valid
npm run pack:check     # the npm package has every file the README and package.json promise
npm run check -- <dir>  # check a project that uses MotifSpec (Checking a project, above)
npm run test:mcp       # call every MCP tool through the Lambda handler
npm run mcp:bundle     # build/mcp.zip, the server's Lambda package
npm run docs           # build motifspec.com into site/public and index it for search (needs Hugo extended)
npm run docs:check     # run the checker on the site
```

Releases are automatic; `CONVENTIONS.md` (Versioning) says how.

Node 20 or later. The package has no dependencies; the MCP server's are dev dependencies, bundled into its deployment.

## Licence

The code, tokens and docs are MIT (`LICENSE`). The fonts keep their SIL Open Font Licences (`fonts/OFL-*.txt`) and the icons their Apache-2.0 licence (`icons/LICENSE`).
