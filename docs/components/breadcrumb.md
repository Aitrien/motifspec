---
name: breadcrumb
status: stable
layouts: [documentation]
group: navigation
tokens:
  - border.width.hairline
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.label
  - font.weight.ui
  - size.target.min
  - space.inline.sm
  - space.inline.xs
---

# Breadcrumb

The trail from the home page to the page's section, above its title, so a reader who arrived from search sees where the page sits.

## When to use

- On every page in the docs shell below a section: a guide page, a component, a reference page.

## When not to use

- On a section's own page, or a page at the top level; the trail would only be the home page, and the header's wordmark already goes there. `motifspec/breadcrumb.html` writes nothing for these.
- On the landing page.
- In a portfolio, whose pages are one level deep; a case study or post has the back link to its list instead (`button-and-link.md`).

## Markup

```html {preview=true}
<nav class="cx-breadcrumb" aria-label="Breadcrumb" data-pagefind-ignore>
  <ol class="cx-breadcrumb__list">
    <li><a href="/">MotifSpec</a></li>
    <li><a href="/components/">Components</a></li>
  </ol>
</nav>
```

It goes first in the page head, before the h1 (`docs-shell.md`). In Hugo, `partial "motifspec/breadcrumb.html" .` writes it from the page's ancestors: the home page as `site.Title`, then each section by its link title (`docs/hugo.md`).

## Do

- End the trail at the page's parent. The h1 straight after it names the page.
- Use the names the navigation uses, so the trail and the open group in the navigation agree.
- Keep it to one line on a phone; with sections one or two words long, it is.

## Don't

- Don't add the current page as a last item; it would repeat the h1.
- Don't use it for steps in a process; that's steps (`steps.md`).
- Don't put it in the header or above the docs shell. It belongs to the page, so it's in the main column, marked `data-pagefind-ignore` so search (`search.md`) doesn't index the trail as the page's text.

## Accessibility

- It's a `nav` named "Breadcrumb", so it's a landmark a screen reader can list, and the trail is an ordered list, so its length is announced.
- The slashes are drawn by CSS with empty alternative text, so they aren't read out between the links.
- Each link is at least `size.target.min` tall.
- Pairs: `color.text.secondary` for the links and `color.text.muted` for the slashes, on `color.surface.base`; `color.text.primary` on hover.

## Specimens

```html {specimen="To the section"}
<nav class="cx-breadcrumb" aria-label="Breadcrumb">
  <ol class="cx-breadcrumb__list">
    <li><a href="/">MotifSpec</a></li>
    <li><a href="/components/">Components</a></li>
  </ol>
</nav>
```
