# Changelog

Every release of MotifSpec (named brand-codex until 1.10.0), newest first. Entries before 1.10.0 keep the names they were released under. Versions follow the rules in `CONVENTIONS.md`: renaming or removing a semantic token is major, adding tokens, components or icons is minor, and changing a value or fixing a description is a patch. `npm run build` fails if the version in `package.json` has no entry here.

## [1.22.0] - 2026-11-06

### Added
- A documentation site's header (`cx-header--docs`, written by `site-header.html` when `params.motifspec.layout` is `"documentation"`) takes over the page navigation below `size.breakpoint.lg`. The bar is one row: the wordmark, "On this page", search and a menu. It sticks, and once the page scrolls the wordmark compacts and "On this page" appears.
  - The menu is a `<details>` whose sheet holds the page navigation, which scrolls, with the menu's external links, the changelog with the version, and the theme toggle fixed at the bottom. The page behind it doesn't scroll.
  - "On this page" is a panel under the bar with Back to top and the page's sections, the current one marked.
  - Both work without script. With `dist/codex.js`, one opens at a time, and each closes on Escape, a click outside it, or a link followed inside it.
- `docs-nav-groups.html` (the page navigation's groups, written in the side column and in the menu, with an id prefix each) and `theme-toggle.html`.

### Changed
- Search's trigger looks like the field it opens: square, on `color.surface.sunken` and as wide as `size.column.sidebar` allows, so it no longer reads as the current section's outlined pill. Below `size.breakpoint.lg` it is an icon.
- The docs shell's side column, and the side layer of the backdrop, start at `size.breakpoint.lg` instead of `size.breakpoint.md`. Below it, the navigation and "On this page" are in the header, and the article's own table of contents is hidden.
- From `size.breakpoint.lg` up, the documentation header compacts its wordmark on scroll and stays on one row, with the search field giving way first.

### Removed
- The docs shell's Menu control (`cx-docs-nav__menu`), replaced by the header's menu.

## [1.21.0] - 2026-11-05

### Added
- `specimen-plate.html`: a Hugo partial that frames any illustration as a specimen plate, with its pause control and "Plate 0" caption. It inlines an `.svg` or `.html` asset (`motifspec/plate.html` is the contour survey) or plays an `.mp4` or `.webm` video, takes a text alternative (`label`) for an illustration a reader needs, a `poster` for a video, and `wide` for a 16:10 plate (`cx-plate--wide`).
- `dist/codex.js` runs the pause control for any plate marked `data-plate-motion`: it reveals the control, pauses or plays CSS animations and SMIL in an inline SVG and video with it, sets `data-paused` on the frame, and sends a `cx-plate-pause` event for a scripted drawing. Under reduced motion nothing plays and the control stays hidden.

### Changed
- The specimen plate is now a frame for any moving illustration (an animated SVG, a short silent video or a scripted drawing), in a page's head beside or below the statement, with the contour survey as the one MotifSpec ships. It belongs to every layout (`layouts: [shared]`), not only the portfolio. Its drawing classes (`cx-plate__grid`, `cx-plate__line`, `cx-plate__line--index`) suit any line drawing.

### Fixed
- The specimen plate's and backdrop's examples on motifspec.com showed Hugo template code (`{{ (resources.Get "motifspec/plate.html").Content | safeHTML }}`) in their live previews. The plate's example is now HTML, the backdrop's is fenced as a Hugo template without a preview, and the code block hook fails the build on a previewed example with template syntax.

## [1.20.1] - 2026-11-05

### Changed
- The page footer links to a page's source with **View source**, given `params.motifspec.sourceURL` (the repository's address for viewing files). `editURL` still gives Edit this page. A page made from one section of a file opens at that heading (its `sourceAnchor` param), where an editor would open at the top of the file. A page's `data` param, the files its generated tables come from, shows as "Generated from" after the date, and `page-footer.md` lists the params.
- motifspec.com's pages about the tokens, icons and checker rules keep their wording in Markdown in `docs/foundations/` and `docs/reference/`, with a visible line such as "*Generated from `tokens/color.json`: the palette.*" where each table goes. View source opens that file, and the footer names the data. The build fails if a line names the wrong files or an element no page shows.

### Fixed
- motifspec.com's Type page showed "[object Object]" after the weight, leading and tracking table, from a misplaced bracket in the generator, and that table didn't widen like the others.
- On motifspec.com, Edit this page opened the whole README for pages made from one of its sections, and a data file for pages whose wording was in the generator. View source now opens the section, or the file with all of the page's wording.

## [1.20.0] - 2026-11-05

### Added
- motifspec.com is a documentation site built with the documentation layout from this repository (`site/`), in place of the one-page showcase. Every page is made from a file the repository already keeps: the component and layout docs, `docs/hugo.md`, the README's guide sections, `CONVENTIONS.md`, `CHANGELOG.md`, and pages generated from the tokens, icons and checker rules. It has search, a Markdown copy of every page, `llms.txt`, an A to Z page and a landing page. Links to the old page's sections (such as `/#components`) go to the pages that replaced them.
- `npm run docs`, `docs:check` and `docs:quality` build the site, check it, and run Lighthouse's accessibility audit on it. CI runs them, with a link check, on every pull request; a release publishes the site.
- Token table (`token-table.md`, documentation layout): colour tiles with their name and value written on them, a primitive palette, type samples, spacing bars and contrast samples in data tables, for reference pages generated from the tokens. motifspec.com's Colour, Type, Space and size, Motion, Icons, Ornaments, Tokens, Contrast pairs and Checker rules pages use it.
- A deprecated component's doc has a `deprecated:` line saying what replaces it and when it goes; the validator requires it. `docs-nav.html` says "(deprecated)" after the title of a page that sets `deprecated`.
- `article.html` takes `"toc" "never"`, for a page such as a changelog whose headings repeat.
- `page-footer.html` reads a page's `source` param, the repository path of the file a content adapter made the page from, so Edit this page works for pages with no file of their own.

### Changed
- A documentation site's home page is a landing page (`docs/layouts/documentation.md`, Landing, which replaces Docs home): full width outside the docs shell, with the head and foot of the backdrop as on a portfolio's home page. `body-start.html` writes the head there and the side on every other page.
- On a documentation site, `article.html` leaves out the end mark: the layout's only ornament is the footer band, as `docs/layouts/documentation.md` says.
- The README's setup is grouped as Getting started (Hugo, npm, an AI assistant), Checking a project and The MCP server, the sections motifspec.com renders as pages. Every table in the README, `CONVENTIONS.md` and the docs has a caption, in an HTML comment before it that GitHub doesn't show.

### Removed
- The showcase: `showcase/`, `dist/showcase.html` and `dist/showcase.standalone.html`, which the npm package never shipped. `npm run audit` now checks `dist/codex.css` directly. The `showcase` URL in `package.json`, `tokens.json` and `tokens.js` keeps its name and now means the docs site.

### Fixed
- On a phone, the search trigger in the header had no accessible name: its label was removed with `display: none`. It is now visually hidden, so the icon-only button is still announced as "Search".
- The site header no longer marks a menu entry without an `identifier`, such as an external link, as the current page on the home page, whose section is empty.
- The render hooks for tables, blockquotes, images and links, and `article.html`, no longer fail on a page that has no content file, such as one made by a content adapter.

## [1.19.0] - 2026-11-04

### Added
- Docs shell (`docs-shell.md`, documentation layout): grouped page navigation beside the page, with "On this page" on the right when there is room. On a phone the navigation sits behind a Menu control that ships closed and opens without script. With `dist/codex.js` it docks beside the page and scrolls on its own. The Hugo partial `docs-nav.html` writes it from the site's sections, and `docs/hugo.md` shows a documentation page.

- Page actions (`page-actions.md`, documentation layout): Copy page, which copies the page's Markdown, and View as Markdown. The copy button is shown by script; the link always works.
- A Markdown copy of each page: the module defines a `markdown` output format (`index.md` beside `index.html`) with templates for pages, sections and the home page. Sites turn it on with `outputs`.
- Page footer (`page-footer.md`, documentation layout): Last updated, and Edit this page from `params.motifspec.editURL`. Hugo partials `page-actions.html`, `page-footer.html`, and `pagination-docs.html` for previous and next in the docs navigation's order.

- Search (`search.md`, shared): a trigger in the header and a modal dialog of results as you type, from a Pagefind index built with the site. Ctrl+K, Cmd+K or "/" opens it, arrow keys move through the results, and Escape closes it. MotifSpec draws it with Pagefind's API, not Pagefind's own interface, and it makes no requests to other hosts. The trigger ships hidden and the script shows it.
- The site header can carry search (`params.motifspec.search`), the version linked to the changelog (`params.motifspec.version` and `changelog`), and external links in its nav with the outward arrow.
- Component preview (`component-preview.md`, documentation layout): an `html` fence with `{preview=true}` shows the example live above its code, in an iframe whose document has the system's stylesheet, script, theme snippet and icons, so an example's ids, sticky headers and landmarks can't clash with the page. `codex.js` sizes the frame to its example, keeps it in the page's theme, and stops its links navigating.
- Steps (`steps.md`, shared): a numbered procedure, from HTML or from a Markdown ordered list with `{.cx-steps}`.
- Tabs (`tabs.md`, shared): the same content in two to four forms. Without script every panel shows under its label; with it, an ARIA tab list with arrow keys, and sets that share a `data-tabs` name change together and are remembered.
- A side layer for the backdrop (`dist/backdrop-side.html`, `cx-backdrop-page--side`): on a documentation site, contours down the left edge behind the navigation, fixed as the page scrolls, with the page and header fading in across them so there is no edge across the page. On a phone the foot shows instead. `body-start.html` writes it on every page of a site whose layout is `documentation`.
- `color.scrim` and `color.wash.scrim`: the colour behind a modal dialog and how much of it is mixed in, dark in both themes.
- The Markdown render hooks and partials mark what isn't page content `data-pagefind-ignore` (heading anchors, code block bars, the end mark, the table of contents, page actions, page footer and docs pagination), so search excerpts are the page's own text. It changes nothing without Pagefind.

### Changed
- The checker decides a class's layouts from the component that owns it (its root class, `__elements` and `--modifiers`), not from every doc whose example shows it. Shared classes such as `cx-page-head`, `cx-lede` and `cx-meta`, which the new documentation docs show in their examples, stay shared. The map of each doc's own selectors moved from `scripts/build.mjs` to `scripts/lib.mjs`, where both use it.
- Component examples are fenced as ```` ```html {preview=true} ```` instead of ```` ```html preview ````. Hugo drops a bare word after the language but passes attributes to the render hook, which the component preview needs. GitHub still shows them as HTML. The build, the checker, the JSX conversion and the MCP server read the new form.

## [1.18.1] - 2026-11-04

### Fixed
- The checker read a Hugo site's `[params.motifspec]` only when the table started at the beginning of a line. An indented table, such as one under `[params]` in a config that indents its tables, was ignored, so the site was checked as portfolio whatever it declared. It now reads the table indented or not, and also dotted keys (`motifspec.layout = "dashboard"` under `[params]`, or `params.motifspec.layout` at the top) and inline tables (`motifspec = { layout = "dashboard" }`).

## [1.18.0] - 2026-11-04

### Added
- Layouts: `docs/layouts/` has one file each for the portfolio, dashboard and documentation layouts, and for à la carte (a project that fits none of them). Each gives the shell, page templates, components, decoration, heading rules and a table for choosing a stack. Dashboard and documentation are marked in progress, with what exists now and what doesn't.
- Every component doc says which layouts it belongs to (`layouts:` in its front matter), and the build fails if one doesn't. The README has a Layouts section, and its first rule for AI assistants is to choose the layout and keep the project's stack.
- The MCP server's `get_doc` serves the four layouts, and `get_component` lists each component with its layouts. Its instructions say to choose the layout first.
- Projects declare their layout: a Hugo site in `[params.motifspec]` (`layout`, and `components` for à la carte), anything else with the checker's `--layout` and `--components`. A project that declares nothing is checked as portfolio, as before.
- The checker warns when a component's classes or Hugo partial are used outside its layouts, or when an à la carte project uses a layout component it hasn't listed. These are warnings in this release and failures in a later one; warnings don't fail the run.
- An à la carte project may have a stylesheet of its own for its frame. The checker holds it to semantic tokens and fails any selector that targets a `cx-` class (`cx-override`). It fails an unknown layout or component name too.
- The MCP server's `check` takes `layout` and `components`, reports warnings separately from problems, and checks CSS as an à la carte project's own stylesheet.

- Status (`status.md`, shared): `cx-status` in five tones, `--success`, `--warning`, `--danger`, `--info` and `--muted` (a ring instead of a dot), for any list of states. The portfolio's `--live`, `--building` and `--archived` are named variants of them. Each status colour now declares `color.surface.hover`, so a status in a table row that's hovered is checked too (99 contrast pairs).
- Compact buttons (`cx-button--sm`) for table rows and toolbars, and data tables with a state cell (`td.is-state`) and an actions cell (`td.is-actions` with `cx-table__actions`).
- Disclosure (`disclosure.md`, shared): a styled native `<details>` with a turning chevron.
- Keyboard key (`keyboard-key.md`, shared): `cx-kbd`, the prose keycap outside prose.
- Thirteen icons for navigation and tools: `search`, `menu`, `close`, `edit`, `dashboard`, `notifications`, `dns`, `storage`, `lan`, `apps`, `settings`, `restart` and `logs`. `icon.md` allows icons before side navigation items and on toolbar controls in the dashboard and documentation layouts.
- A JSX form of every component example: the MCP server's `get_component` takes `form` (`html`, `jsx` or `hugo`) and returns only that markup, so answers are shorter. The JSX is converted from the HTML examples (renamed attributes, closed void elements, comments, fragments), and a test compiles every example with esbuild. The two examples written in Hugo template syntax say they have no JSX form.
- Behaviour sections in the docs of components with script (site header's theme toggle, code block's copy button, table of contents, tooltip) and in the disclosure's, so an app that renders them itself can match.

### Changed
- `docs/templates.md` is now `docs/layouts/portfolio.md`. `get_doc("templates")` still returns it.
- `cx-status` sets its own mono label type, so it can stand on its own in a table or a feed; inside accession labels and meta lines it looks the same as before.
- Rules that only suit a portfolio say so: catalogue numbers, the six page templates and the backdrop on every page are in the portfolio layout. Heading anchors are for reading text; dashboard sections have an id and no anchor. The seventh principle is now "One accent; decoration as the layout allows".
- The MCP server's tool descriptions are shorter, so what it sends with every request stays the same size despite the new options (+23 characters, from 3,689).
- The rule that JavaScript is enhancement says what it means in an app that needs script to render, and a new rule says MotifSpec's own files are served by the project, never a CDN, while an app's data is the project's business.

## [1.17.3] - 2026-11-04

### Fixed
- A data table with visually hidden text in a cell no longer widens the page on a phone. The hidden text was positioned against the page instead of the table's scroll box, so it stuck out past the edge; `.cx-table` is now positioned, which keeps it inside.

## [1.17.2] - 2026-11-04

### Changed
- The specimen plate's caption is shorter: the plate number and what it shows (`Plate 0 | Contour survey`). Its doc now says to keep captions to that.
- The showcase says what MotifSpec is: a design system proof of concept, shown in an example brand that a real one can replace.
  - The hero no longer repeats the version, token count, contrast result and font size in an accession label; the eyebrow and Checks already show them.
  - Section introductions and captions are shorter.
  - The motion principle matches the README again: the contour survey settles once and answers the pointer, rather than drifting behind every page.

## [1.17.1] - 2026-10-30

### Fixed
- The MCP server works with stricter clients, such as Gemini's custom connected apps:
  - A GET to `/mcp`, which some clients send after connecting to open a notification stream, now gets 405 at once. It used to wait out the Lambda's 10-second timeout and come back as an error.
  - DELETE gets 405 at once too, since the server has no sessions to end.
  - A request that doesn't accept both JSON and an event stream (`application/json` alone, `*/*`, or no `Accept` header) gets the same JSON answer instead of 406.
  - Browser-based clients can connect: preflights get 204, and every answer carries CORS headers. The server is read-only and has no sign-in, so any origin is allowed.

## [1.17.0] - 2026-10-30

### Changed
- The backdrop no longer drifts behind every page. People found the moving contours distracting, so it is now two still layers that scroll with the page:
  - the head, on the home page only, behind the header and the statement
  - the foot, on every page, behind the footer, on a different stretch of terrain (`dist/backdrop-foot.html`, new)

  The head settles into place over `motion.duration.settle` on arrival, then stays still. On both, the pointer warms the ground under it into a hill of rings that flattens again once it moves on, like an attention heatmap drawn as a survey. Under reduced motion nothing moves.
- The contours are sharp: the specimen plate's hairline and emphasis weights instead of a blurred 3px stroke, without the survey grid, under a lighter frost (`color.backdrop.tint` is now 18%).
- Where text sits on the frost, on the left and along the header, the contours keep `color.backdrop.calm` of their strength and come up to full strength towards the open side. The lines run behind the text, not around it.
- Hugo: `motifspec/body-start.html` inlines the head on the home page only, and `motifspec/body-end.html` now inlines the foot before `plate.js`. Both partials are called as before.
- `cx-backdrop-page` is now `position: relative`, so the layers can sit at its top and bottom.

### Added
- `motion.duration.settle` (3200ms): the backdrop's settle on arrival, and the timing of a warmed hill.
- `color.backdrop.calm` (22%): how much of their strength the contours keep where text sits.
- `cx-backdrop--head` and `cx-backdrop--foot`.

### Removed
- The backdrop pause control (`cx-backdrop__pause`) in the site header and its stored `cx-backdrop` preference. Nothing runs for more than five seconds any more, so WCAG 2.2.2 doesn't call for one. The specimen plate keeps its own.

### Deprecated
- `size.backdrop.blur` and `border.width.contour`: the contours are no longer blurred. `size.backdrop.height`: each layer is `size.backdrop.fade` tall. All three are removed in 2.0.0.

## [1.16.0] - 2026-10-29

### Added
- `showcase` in `package.json`, the published showcase at https://motifspec.com, also served as `showcase` in `dist/tokens.json` and `dist/tokens.js`.

### Changed
- Site footers link the MotifSpec version to the showcase instead of the changelog: `aria-label="Version x.y.z: view the MotifSpec showcase"`, tooltip "View showcase". The showcase's own footer still links to the changelog. `site-footer.md` is updated.

### Fixed
- "Back to top" now goes to the top. The site header had `id="top"`, and because the header is sticky, the browser scrolled to where it was stuck, which moved the page by a header's height. The header has no id now, so `#top` scrolls to the top of the document, as HTML defines for a `#top` link with no matching element.

## [1.15.0] - 2026-10-29

### Added
- Diagrams. `cx-diagram` classes draw an SVG inside a `cx-figure--diagram`, using only existing tokens, so diagrams follow light and dark themes:
  - nodes (`__node`, `--accent`), groups (`__group`), edges and arrowheads (`__edge`, `__head`, each with `--accent`)
  - text (`__title`, `__text`, `__label`, `--accent`)

  Every colour is a pair already checked on `color.surface.raised`, the frame's surface. Strokes stay a screen hairline at any scale. `figure.md` has the markup, the parts and the rules: viewBox at most 740 wide, ids prefixed.
- Hugo: an `.svg` in a page bundle, on its own line in Markdown, becomes a diagram figure. It is inlined, numbered like other plates, and gets `role="img"` with the alt text as its name. The build stops if the file sets its own role, label or `<title>`, or has no `cx-diagram` class.
- The checker reads `.svg` files, so a diagram with a raw colour, a style attribute or an unknown class fails like any template.

## [1.14.2] - 2026-10-29

### Fixed
- The Hugo shell partials publish the stylesheet and scripts at `/cx/` instead of `/motifspec/`. On GitHub Pages, a user site's `/motifspec/` path belongs to the motifspec repository's own Pages site, so turning on Pages for this repository hid aitrien.com's CSS and scripts. They stay one level below the root, so the stylesheet's `../fonts/` URLs still reach `/fonts/`. Asset paths inside Hugo (`resources.Get "motifspec/…"`) are unchanged.

## [1.14.1] - 2026-10-29

### Changed
- Site nav: the current page's pill has no fill. It is outlined with a `color.border.strong` hairline (inset, so the pill keeps its size), with `color.text.primary` text, instead of the `color.surface.highlight` fill and `color.accent.border` outline. The outline is 3.23:1 on `color.surface.base` in light and 4.21:1 in dark, above the 3:1 target. On hover it takes the same wash as the other links. `site-header.md` is updated.
- `color.surface.highlight`'s description: text selection and `<mark>` only, since the nav no longer uses it.

## [1.14.0] - 2026-10-28

### Added
- The MotifSpec MCP server, at `https://mcp.motifspec.com/mcp`, for any AI assistant that supports remote MCP servers. Read-only, no sign-in. Five tools:
  - `get_rules`: the README's rules and what the checker enforces.
  - `find_tokens`: semantic tokens matching a query, with usage rule, CSS property, light and dark values, and the surfaces a colour may sit on.
  - `get_component`: a component's doc with its Hugo partial and Markdown form, or the list.
  - `get_doc`: `docs/hugo.md` or `docs/templates.md`.
  - `check`: the rule checker on a piece of markup, Markdown or CSS.

  It answers from this release's own files and tells assistants which version it serves. Built with the official MCP SDK (stateless Streamable HTTP, JSON responses).
- Hosting: AWS Lambda behind an API Gateway HTTP API on the custom domain, rate-limited, defined in `infra/mcp.yml`. The release workflow bundles the server (`npm run mcp:bundle`, about 260 KB), tests the bundle, deploys it with a role GitHub assumes through OIDC (no stored AWS key; only main can use it, and it can only replace the function's code), and checks the live server reports the new version.
- `npm run test:mcp`, run in CI on the source and on the bundle: calls every tool through the Lambda handler.
- README: "Using it from an AI assistant", with how to connect Claude, Claude Code, VS Code and others.

The npm package is unchanged apart from the version: the server's SDK, zod and esbuild are dev dependencies, and `mcp/` and `infra/` aren't in the package.

## [1.13.3] - 2026-10-27

### Changed
- Docs: each fact now lives in one place. The README's Hugo section points to `docs/hugo.md` (which now has the stylesheet path note and the full front-matter example from `docs/templates.md`), the release process lives in `CONVENTIONS.md`, and `docs/hugo.md` points to the README's list of what the checker checks. Statements about an MCP server that doesn't exist yet are removed, as are the planned-only `mcp/README.md` and the SCSS row in `CONVENTIONS.md`, which the build has never generated. The npm install line pins whatever version is current instead of naming 1.13.0.
- `AGENTS.md` (with `CLAUDE.md` pointing to it): where a change goes in this repo, what to run before finishing, and how releasing works, linking to the README and `CONVENTIONS.md` for everything else. Repo-only; not in the npm package.

## [1.13.2] - 2026-10-27

### Fixed
- `package.json`'s `repository.url` now spells the repository `Aitrien/motifspec`, as GitHub does. npm compares it with the repository recorded in the provenance statement, and the lowercase spelling is the likely reason the workflow couldn't publish 1.13.1. 1.13.1 is tagged on GitHub but was never published to npm; this release has the same contents.
- When `npm publish` fails in the release workflow, npm's error lines now appear as annotations on the run.

## [1.13.1] - 2026-10-27

### Changed
- The release workflow can be run by hand from the Actions tab to retry publishing to npm. Run that way, it publishes main's version only if that version's tag is main's current commit and npm doesn't have it yet, and it never tags.
- No design changes. This is the first version published to npm by the release workflow (1.13.0 was published by hand), which completes the trusted-publishing setup.

## [1.13.0] - 2026-10-27

### Added
- Published to npm as `@aitrien/motifspec`. The package drops `"private"`, publishes as public, and ships the CSS, scripts, tokens, fonts and their licences, icons, component docs, Hugo templates and the checker. It leaves out the showcase pages, so it is about 238 KB packed instead of 540 KB.
- Exports for `fonts.css`, `chroma.css`, `icons.svg`, `check` (the checker's functions) and `fonts/*`, which were in the package but couldn't be imported.
- `npx motifspec-check`: the rule checker as a command. `--dirs` points it at a non-Hugo project's folders. It now also reads `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro` and `.mdx` files and `className` attributes, and skips `dist`, `build` and framework output folders.
- The release workflow publishes each new version to npm after tagging it, using npm trusted publishing, with provenance. It skips a version that is already on npm.
- `npm run pack:check`, run in CI: fails if the package is missing a file that an export, the command, the CSS's font URLs or the checker needs, or if it would ship the showcase.
- README: "Using it from npm".

## [1.12.0] - 2026-10-27

### Added
- `scripts/check.mjs`, the one rule checker for projects that use MotifSpec (`npm run check -- <dir>`). Sites run it from their pinned module, so they are checked against the release they use; the MCP server's `check_styles` will call the same code. It checks `layouts/` and `content/` and fails on:
  - a stylesheet in the project, or a `style` attribute
  - a raw colour, or a number with a length or time unit (zero is allowed)
  - a primitive, unknown or deprecated `--cx-` token
  - a `cx-` class that `dist/codex.css` and the shipped scripts don't define, or a `cx-icon-` that isn't in `icons/manifest.json`. Classes and icons built from Hugo template actions are skipped.
  - "·" used as a separator

  In GitHub Actions, each problem is also an annotation on the pull request; `--json` prints them as JSON. It exports `checkText` and `checkProject` for other tools.
- `npm run audit` now runs the checker on `layouts/` and on the HTML examples in `docs/components/`, so the markup sites copy passes the rules they're held to.
- `docs/hugo.md`: how a site runs the checker.

## [1.11.0] - 2026-10-26

### Added
- Hugo templates. The module now mounts `layouts/`, so a site gets the components as partials under `motifspec/` and the Markdown render hooks, instead of keeping its own copies that can drift from `docs/components/`. Moved from aitrien.com without changing their output:
  - Page shell: `head.html`, `body-start.html` (backdrop, icon sprite, skip link), `site-header.html` and `body-end.html`.
  - Components: `article.html`, `project-card.html`, `post-list-item.html`, `accession/label.html`, `accession/id.html`, `accession/status.html`, `figure.html`, `table-of-contents.html`, `tags.html`, `tag-filter.html`, `filed-under.html`, `pagination-entries.html`, `pagination-pages.html`, `back-link.html`, `section-heading.html`, plus `tokens.html` and `h2s.html` helpers.
  - Render hooks for headings, images, tables, code blocks, blockquotes and links.
- `docs/hugo.md`: every partial with its context and component doc, the front matter they read, the render hooks and the Markdown they expect, and the Goldmark settings they need.
- `npm run audit` also checks `layouts/`: no style attributes, raw colours, sizes or durations.

### Changed
- A figure in Markdown is numbered from Plate 2 when the page has a `hero` in front matter (the hero is Plate 1), and from Plate 1 otherwise. On aitrien.com this was keyed to the Work section, which is where every hero is, so its plates don't change.

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
