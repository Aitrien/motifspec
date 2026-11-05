---
name: page-footer
status: stable
layouts: [documentation]
tokens:
  - border.width.hairline
  - color.border.subtle
  - space.inline.lg
  - space.section.sm
  - space.stack.lg
  - space.stack.md
  - space.stack.sm
---

# Page footer

After a documentation page's article: when the page last changed and a link to edit its source, then previous and next in the order of the navigation.

## When to use

- At the end of every documentation article, before the site footer.
- When pages are read in sequence, so a reader can go on without returning to the navigation.

## When not to use

- On portfolio pages; their pagination moves between entries of a collection (`pagination.md`).
- When the site has no public source; leave out the edit link, not the date.

## Markup

```html {preview=true}
<footer class="cx-page-footer">
  <p class="cx-meta">Last updated <time datetime="2026-11-04">4 November 2026</time></p>
  <a class="cx-link" href="https://github.com/owner/repo/edit/main/docs/guide/getting-started.md"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-edit"></use></svg>Edit this page<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-outward"></use></svg></a>
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

In Hugo, `partial "motifspec/page-footer.html" .` writes the footer (a page made by a content adapter from another file names that file's repository path as its `source` param, for the edit link) and `partial "motifspec/pagination-docs.html" .` the previous and next links, in the order `docs-nav.html` lists the pages (`docs/hugo.md`).

## Do

- Show the date the content last changed, from version control where possible, written as a reader would say it ("4 November 2026").
- Link "Edit this page" to the page's source file, not to a generated copy.
- Name the group in the pagination's middle cell, with the page's position in the whole set.

## Don't

- Don't show a date that changes on every build; a reader can't tell a fresh page from a rebuilt one.
- Don't open the edit link in a new window by force; the outward arrow says where it goes.

## Accessibility

- The date is a `<time>` with a machine-readable `datetime`.
- The edit link's text says what it does; both icons are `aria-hidden`, and the outward arrow repeats that it leaves the site.
- The pagination is a `<nav>` named "Documentation pages", separate from the navigation's "Documentation". Pairs and targets as `pagination.md`.
- Pairs: `color.text.muted` on `color.surface.base` (4.5:1) for the date; `color.link.rest` on `color.surface.base` (7:1).
