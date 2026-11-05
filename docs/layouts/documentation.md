# Documentation layout

For product and system documentation: guides, reference pages and a changelog. motifspec.com will be its first site. Declare it with `layout = "documentation"` (see `README.md`, Layouts).

## Status

Complete since 1.19.0: the docs shell with its page navigation (`docs-shell.md`), search (`search.md`) and the version and repository link in the header (`site-header.md`), page actions (`page-actions.md`), the page footer with previous and next (`page-footer.md`), a Markdown copy of each page, and the component preview (`component-preview.md`), with every shared component, including steps, tabs, disclosures and keyboard keys, plus the table of contents, heading anchors and the ornaments.

Not yet: tables generated from MotifSpec's own data (tokens, icons, checker rules) come with motifspec.com, the layout's first site. Don't write classes for anything MotifSpec doesn't define; the checker fails on them.

## Shell

The site header and footer, and between them the docs shell (`docs-shell.md`): grouped page navigation on the left, the page in the middle and "On this page" (the table of contents) on the right when there is room. Below `size.breakpoint.lg` "On this page" moves above the article, and below `size.breakpoint.md` the page navigation sits behind a Menu control above the page. In Hugo, see `docs/hugo.md` (A documentation page).

## Page templates

| Template | Order | Dominant | Secondary |
|---|---|---|---|
| **Docs home** | Header → statement (display h1, lede) → entry points to each section → what's new → footer | The statement and entry points | What's new |
| **Article** | Header → title and lede → TOC + prose with figures, code blocks, callouts and tables → edit link and last updated → previous and next → footer | The prose column | TOC, page actions |
| **Reference table** | Header → title and one-line intro → the table (tokens, icons, rules) → footer | The table | Intro |
| **Changelog** | Header → title → releases, newest first, each with its version, date and changes → footer | The releases | Dates |
| **404** | Header → h1 "Page not found" → links to the docs home and search → footer | Heading and the routes out | |

## Components

Every shared component, plus the components whose doc lists `documentation` under `layouts:`. Catalogue numbers, accession labels, project cards and post rows belong to the portfolio.

## Decoration

- The side of the backdrop on every page, down the left edge behind the navigation, fading out before the article (`backdrop.md`). On a phone, the foot behind the footer instead. No head, so every page, the docs home included, opens on the plain surface.
- The footer band. No other ornaments in articles.

## Headings

- One `<h1>` per page.
- Every `<h2>` in an article has an id and a heading anchor; `<h3>`s in long pages may have one too (`heading-anchor.md`).

## Choosing a stack

| The project | Use |
|---|---|
| Already has a stack | Keep it. MotifSpec adapts to the project, not the reverse. |
| A new documentation site | Hugo with the module (`docs/hugo.md`). |
| Documentation inside an app | The app's own framework, with `@aitrien/motifspec` from npm and the components' markup. |
