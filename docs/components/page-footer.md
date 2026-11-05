---
name: page-footer
status: stable
layouts: [documentation]
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.border.subtle
  - color.link.hover
  - color.link.rest
  - space.inline.lg
  - space.inline.xs
  - space.section.sm
  - space.stack.lg
  - space.stack.md
  - space.stack.sm
---

# Page footer

After a documentation page's article: when the page last changed, what any generated tables come from, and a link to its source, then previous and next in the order of the navigation.

## When to use

- At the end of every documentation article, before the site footer.
- When pages are read in sequence, so a reader can go on without returning to the navigation.

## When not to use

- On portfolio pages; their pagination moves between entries of a collection (`pagination.md`).
- When the site has no public source; leave out the edit link, not the date.

## Markup

```html {preview=true}
<footer class="cx-page-footer">
  <p class="cx-meta">Last updated <time datetime="2026-11-04">4 November 2026</time> <span class="cx-sep" aria-hidden="true">|</span> <span>Generated from <a href="https://github.com/owner/repo/blob/main/tokens/color.json">tokens/color.json</a></span></p>
  <a class="cx-link" href="https://github.com/owner/repo/blob/main/docs/foundations/colour.md">View source<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-outward"></use></svg></a>
</footer>
<nav class="cx-pagination" aria-label="Documentation pages">
  <a class="cx-pagination__link" href="/guide/" rel="prev">
    <span class="cx-pagination__dir"><svg class="cx-icon cx-icon--sm cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-back"></use></svg>Previous</span>
    <span class="cx-pagination__title">Overview</span>
  </a>
  <p class="cx-pagination__status">Guide<strong>2 / 12</strong></p>
  <a class="cx-pagination__link" href="/guide/choosing-a-layout/" rel="next">
    <span class="cx-pagination__dir">Next<svg class="cx-icon cx-icon--sm cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg></span>
    <span class="cx-pagination__title">Choosing a layout</span>
  </a>
</nav>
```

The link is **View source**, to the file on the repository's site, with `params.motifspec.sourceURL` (such as `https://github.com/owner/repo/blob/main/`). A site that would rather send readers straight to an editor sets `params.motifspec.editURL` instead, and the link is **Edit this page**, with the edit icon.

In Hugo, `partial "motifspec/page-footer.html" .` writes the footer and `partial "motifspec/pagination-docs.html" .` the previous and next links, in the order `docs-nav.html` lists the pages (`docs/hugo.md`).

### Pages made from other files

A page with no file of its own, such as one a content adapter makes from another file, sets these params:

<!-- caption: Page footer params -->
| Param | Is | Example |
|---|---|---|
| `source` | The repository path of the file the page is made from | `README.md` |
| `sourceAnchor` | The heading the page starts at, when it is one section of the file (View source only) | `getting-started` |
| `data` | The files its generated tables come from, shown as "Generated from" | `["tokens/color.json"]` |

## Do

- Show the date the content last changed, from version control where possible, written as a reader would say it ("4 November 2026").
- Link to the page's source file, not to a generated copy. A page made from one section of a file opens at that section (`sourceAnchor`, below); a file in an editor can't, so prefer View source for a site with such pages.
- Name the files a page's generated tables come from, after the date, so a reader knows where to change a value.
- Name the group in the pagination's middle cell, with the page's position in the whole set.

## Don't

- Don't show a date that changes on every build; a reader can't tell a fresh page from a rebuilt one.
- Don't open the edit link in a new window by force; the outward arrow says where it goes.

## Accessibility

- The date is a `<time>` with a machine-readable `datetime`.
- The link's text says what it does (View source, or Edit this page); its icons are `aria-hidden`, and the outward arrow repeats that it leaves the site.
- The pagination is a `<nav>` named "Documentation pages", separate from the navigation's "Documentation". Pairs and targets as `pagination.md`.
- The generated-from links are underlined, like links in prose, so they read as links in the mono line without relying on colour.
- Pairs: `color.text.muted` on `color.surface.base` (4.5:1) for the date; `color.link.rest` on `color.surface.base` (7:1).
