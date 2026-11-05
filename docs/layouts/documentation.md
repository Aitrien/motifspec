# Documentation layout

For product and system documentation: guides, reference pages and a changelog. motifspec.com will be its first site. Declare it with `layout = "documentation"` (see `README.md`, Layouts).

## Status

In progress. The documentation shell and its own components arrive in a later release, so this file says what exists now and what doesn't.

- **Available now:** the docs shell with its page navigation (`docs-shell.md`), every shared component including disclosures and keyboard keys, plus the table of contents, heading anchors and the ornaments.
- **Not available yet:** search and the version and repository link in the header, page actions (Copy page), the page footer (edit link, last updated, previous and next), the component preview, steps and tabs.

Don't write classes for parts that aren't available. The checker fails on any `cx-` class MotifSpec doesn't define. Build what you can from the shared components, and say which parts MotifSpec doesn't have yet.

## Shell

The site header and footer, and between them the docs shell (`docs-shell.md`): grouped page navigation on the left, the page in the middle and "On this page" (the table of contents) on the right when there is room. Below `size.breakpoint.lg` "On this page" moves above the article, and below `size.breakpoint.md` the page navigation sits behind a Menu control above the page. In Hugo, see `docs/hugo.md` (A documentation page).

Planned for the header: search, the version and a repository link.

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

- The head of the backdrop on the docs home, and its foot behind the footer on every page.
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
