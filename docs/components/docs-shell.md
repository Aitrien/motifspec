---
name: docs-shell
status: stable
layouts: [documentation]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.accent.border
  - color.border.default
  - color.border.strong
  - color.focus.ring
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.line-height.ui
  - font.size.small
  - font.weight.strong
  - motion.duration.base
  - motion.easing.standard
  - size.column.sidebar
  - size.target.min
  - size.target.touch
  - space.gutter.grid
  - space.gutter.page
  - space.inline.sm
  - space.inset.md
  - space.inset.xs
  - space.section.sm
  - space.stack.md
  - space.stack.xs
---

# Docs shell

The frame of a documentation page: grouped page navigation on the left, the page beside it, and "On this page" on the right when there is room. Narrower than `size.breakpoint.lg`, both move into the header (`site-header.md`).

## When to use

- On every page of a documentation site except the landing page (`docs/layouts/documentation.md`), which is full width.
- When readers move between many pages in a set order: guides, reference, a changelog.

## When not to use

- On a portfolio; it has the site header's nav and no side column.
- On a dashboard; its side navigation is a different component, for places in an app rather than pages to read.
- For a site of fewer than about eight pages, where the header's nav is enough.

## Markup

The site header (`site-header.md`) and footer (`site-footer.md`) go around it as on any page. The main column holds the page head and a `cx-article`, whose table of contents (`table-of-contents.md`) is "On this page".

```html {preview=true}
<div class="cx-container cx-docs">
  <nav class="cx-docs-nav" aria-label="Documentation">
    <div class="cx-docs-nav__groups">
      <ul class="cx-docs-nav__list">
        <li><a href="/">Overview</a></li>
      </ul>
      <details class="cx-docs-nav__group" open>
        <summary id="docs-nav-guide">Guide<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></summary>
        <ul class="cx-docs-nav__list" aria-labelledby="docs-nav-guide">
          <li><a href="/guide/getting-started/" aria-current="page">Getting started</a></li>
          <li><a href="/guide/layouts/">Choosing a layout</a></li>
        </ul>
      </details>
      <details class="cx-docs-nav__group">
        <summary id="docs-nav-reference">Reference<svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></summary>
        <ul class="cx-docs-nav__list" aria-labelledby="docs-nav-reference">
          <li><a href="/reference/tokens/">Tokens</a></li>
          <li><a href="/reference/changelog/">Changelog</a></li>
        </ul>
      </details>
    </div>
  </nav>
  <main id="main" class="cx-docs__main" tabindex="-1" data-pagefind-body>
    <div class="cx-page-head">
      <h1>Getting started</h1>
      <p class="cx-lede">Install the module, import it, and check your site.</p>
    </div>
    <div class="cx-article">
      <div class="cx-article__main cx-prose">
        <p>The page's content.</p>
      </div>
    </div>
  </main>
</div>
```

In Hugo, `partial "motifspec/docs-nav.html" .` writes the navigation from the site's sections (`docs/hugo.md`), through `docs-nav-groups.html`, which the header's menu uses too. `data-pagefind-body` limits search (`search.md`) to the page's own content.

## Do

- Group pages by what the reader is trying to do, in the order they'll need them: a guide before reference.
- Keep group names to one or two words, and page titles short enough for one line in the column.
- Mark the current page with `aria-current="page"`.
- Say "(deprecated)" after the title of a page about something deprecated; `docs-nav.html` does when the page sets `deprecated`.
- Open the group that holds the current page and close the rest, so a reader sees where they are and every other group's name at a glance. `docs-nav-groups.html` does this.

## Don't

- Don't nest groups; one level of groups, then pages.
- Don't put the same page in two groups.
- Don't add icons to the docs navigation; the page titles are the labels.

## Accessibility

- The navigation is a `<nav>` named "Documentation", separate from the header's "Main".
- Each group's list is named by its summary (`aria-labelledby`), so a screen reader hears "Guide, list, 4 items".
- Below `size.breakpoint.lg` the side column is hidden, and the same navigation is in the header's menu, a `<details>` that opens with Enter or Space and works without script (`site-header.md`).
- Group summaries and links meet `size.target.min`.
- The current page is marked in words for assistive tech (`aria-current`) and by weight and the accent rule on screen, not colour alone.
- Pairs: `color.text.primary` and `color.text.secondary` on `color.surface.base` (7:1); the accent rule `color.accent.border` and hover rule `color.border.strong` on `color.surface.base` (3:1).

## Behaviour

- **Without script:** from `size.breakpoint.lg` up, the navigation is shown beside the page and scrolls with it. Narrower, it is in the header's menu, and the article's own "On this page" is hidden, since the header has one.
- **With `dist/codex.js`:** while the navigation sits beside the main column, it gets `is-docked`: it sticks below the header and scrolls on its own, sized from `--_viewport-height` and `--_header-height`, which the script keeps up to date. The current page is scrolled into the middle of the docked navigation on load. Docking is checked again on resize.
- An app that renders the shell itself does the same, or leaves it undocked.
