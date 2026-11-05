# Portfolio layout

For a personal or studio portfolio: case studies, writing and an about page. aitrien.com uses it. Declare it with `layout = "portfolio"` (see `README.md`, Layouts); a project that declares nothing is checked as portfolio.

## Shell

The site header, the main region and the site footer, on a backdrop page. In Hugo the shell is the page shell in `docs/hugo.md`; elsewhere, copy the markup from `site-header.md`, `site-footer.md` and `backdrop.md`.

## Page templates

Every template sits on the backdrop (`backdrop.md`): its contours show behind the footer, and on the home page behind the header and the statement too. Every template keeps the full site header (Work, Writing, About, the theme toggle) and the footer.

<!-- caption: Page templates -->
| Template | Order | Dominant | Secondary |
|---|---|---|---|
| **Home** | Header → statement (eyebrow, display h1, lede, primary + secondary button) on the frost, inside the top fade → selected work (2–3 project cards) → recent writing (5 post rows) → capabilities table → footer | Statement and selected work | Writing rows, capabilities, the backdrop |
| **Project index** | Header → page head (h1 "Work", entry count, one-line intro) → tag filter → project cards or ledger, newest first → footer | The list of projects | Filter and intro |
| **Case study** | Header → back link "← All work" → accession label (`cx-label--lead`; on a phone, number, date and status only) → h1 and lede → hero figure (Plate 1) → article layout: TOC + prose (Problem, Constraints, Approach, Outcome with a data table, What I'd change) → on a phone, the full label as a card (`cx-label--card`) → pagination → footer | Title and hero, then prose | Label, TOC |
| **Writing list** | Header → page head (h1 "Writing", description, RSS link) → tag filter → post rows grouped by year → pagination → footer | Post titles | Numbers, dates, tags |
| **Blog post** | Header → back link "← All writing" → meta line (`cx-id`: number, date, reading time) → h1 and lede → article layout: TOC (when three or more h2s) + prose with figures, code blocks and callouts → end mark → "Filed under" tags → pagination → footer | The prose column | Meta, TOC |
| **404** | Header → sprout ornament (lg) → accession label "No. — / Not in collection" → h1 "Page not found" → the requested path in mono → three links: Home, Work, Writing → footer | Heading and the routes out | Ornament, path |

## Components

Every shared component, plus the components whose doc lists `portfolio` under `layouts:`: accession label, backdrop, heading anchor, ornament, post list item, project card and table of contents.

## Catalogue numbers

Catalogue numbers belong to this layout only.

- Work: `LM-W-001` onward. Writing: `LM-P-001` onward. Zero-padded, never reused, stored in front matter as `accession`.
- They appear on cards, post rows, post meta lines and case-study labels.

## Decoration

- The head of the backdrop on the home page, and its foot behind the footer on every page.
- Ornaments as `ornament.md` places them: the footer band, the prose divider, the article end mark and the 404 glyph.

## Headings

- One `<h1>` per page.
- Every `<h2>` section heading has an id and a heading anchor (`heading-anchor.md`).

## Front matter

The fields each template reads are in `docs/hugo.md` (Front matter the partials read).

## Choosing a stack

<!-- caption: Choosing a stack -->
| The project | Use |
|---|---|
| Already has a stack | Keep it. MotifSpec adapts to the project, not the reverse. |
| A new portfolio or content site | Hugo with the module (`docs/hugo.md`). |
| An app with state, live data or a lot of interaction | React, or the app's own framework, with `@aitrien/motifspec` from npm and the components' markup. |
