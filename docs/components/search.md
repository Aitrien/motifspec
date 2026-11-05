---
name: search
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.scrim
  - color.surface.base
  - color.surface.highlight
  - color.surface.hover
  - color.surface.raised
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - color.wash.scrim
  - font.family.mono
  - font.line-height.heading
  - font.line-height.ui
  - font.size.body
  - font.size.label
  - font.size.small
  - font.tracking.ui
  - font.weight.strong
  - radius.pill
  - size.column.card
  - size.target.touch
  - space.gutter.page
  - space.inline.sm
  - space.inline.xs
  - space.inset.md
  - space.inset.sm
  - space.inset.xs
  - space.section.sm
  - space.stack.xs
---

# Search

A search control in the header that opens a dialog of results as you type, from an index built with the site.

## When to use

- On a documentation site, where readers arrive with a question rather than a page in mind.
- On any static site with enough pages that the navigation alone is slow to scan.

## When not to use

- On a small site; the navigation is quicker.
- As the only way to reach a page. Every page must also be reachable from the navigation, or from a list of pages, without script.
- For filtering a list on the page; use a filter (`tag.md`) that changes the list in place.

## Markup

The trigger goes first in the header's end (`site-header.md`); the dialog can sit next to it.

```html {preview=true}
<button class="cx-search-trigger" type="button" data-search-open aria-haspopup="dialog" aria-controls="cx-search" hidden>
  <svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-search"></use></svg>
  <span class="cx-search-trigger__label">Search</span>
  <span class="cx-search-trigger__keys" aria-hidden="true"><kbd class="cx-kbd">Ctrl</kbd><kbd class="cx-kbd">K</kbd></span>
</button>
<dialog class="cx-search" id="cx-search" aria-labelledby="cx-search-label" data-search="/pagefind/pagefind.js">
  <form class="cx-search__form" role="search" method="dialog">
    <svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-search"></use></svg>
    <label class="cx-visually-hidden" id="cx-search-label" for="cx-search-input">Search the documentation</label>
    <input class="cx-search__input" id="cx-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Search" aria-describedby="cx-search-status">
    <button class="cx-search__close" type="button" aria-label="Close search" data-search-close><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
  </form>
  <p class="cx-search__status" id="cx-search-status" role="status"></p>
  <ol class="cx-search__results" aria-label="Results"></ol>
</dialog>
```

A result, as the script writes it:

```html
<li><a class="cx-search__result" href="/guide/checking/"><span class="cx-search__title">Checking a site</span><span class="cx-search__excerpt">Run the <mark>checker</mark> before you push…</span></a></li>
```

`data-search` is the address of Pagefind's script. Pagefind indexes the built site and writes its index and script into it, so search makes no requests to other hosts. In Hugo, set `params.motifspec.search = true` and run Pagefind after the build (`docs/hugo.md`).

## Do

- Show the shortcut beside the trigger's label: <kbd class="cx-kbd">Ctrl</kbd> <kbd class="cx-kbd">K</kbd>.
- Give each result its page title and an excerpt with the matched words marked.
- Say when there are no results, with the words searched for.

## Don't

- Don't ship the trigger visible; search needs script, so it starts `hidden`.
- Don't style Pagefind's own interface or load its stylesheet; this component is the interface.
- Don't send queries to a search service; the index is part of the site.

## Accessibility

- The trigger is a button with visible text ("Search"); on a phone, the label hides and its name stays in the DOM. The shortcut keys are `aria-hidden`; the shortcut is a convenience, never the only way in.
- The dialog is a modal `<dialog>`: focus moves into the field when it opens and returns to where it was when it closes; Escape closes it, even from the field; the page behind is inert.
- The field is labelled by its visually hidden label, which also names the dialog, and described by the status line, a polite live region that says how many results there are.
- Arrow keys move from the field into the results and between them; Up from the first result returns to the field.
- Pairs: `color.text.primary` and `color.text.secondary` on `color.surface.raised` and `color.surface.hover` (7:1); `color.text.primary` on `color.surface.highlight` for matched words (7:1); the trigger's boundary `color.border.strong` on `color.surface.base` (3:1).

## Behaviour

`dist/codex.js` does all of this; an app that renders search itself does the same.

- **Showing the trigger:** every trigger whose `aria-controls` names the dialog is shown.
- **Opening:** a click on a trigger, Ctrl+K or Cmd+K anywhere, or "/" when focus isn't in a text field. The field's text is selected, and Pagefind's script loads on the first open (`import()` of `data-search`), with `excerptLength: 24`.
- **Searching:** each input runs `debouncedSearch` (150 ms); the first eight results are shown with their title and excerpt. Only the text and `<mark>` elements of an excerpt are kept. Clearing the field clears the results.
- **Failing:** if Pagefind's script can't load, the status says "Search isn't available right now." and searching stops.
- **Closing:** Escape (handled on the dialog, because a search field would otherwise spend the first Escape clearing itself), the close button, or a click on the scrim. Focus returns to the element that had it before opening. Following a result navigates as a link does.
- **What's indexed:** Pagefind indexes the element with `data-pagefind-body` (the docs shell's `<main>`), skipping anything inside marked `data-pagefind-ignore`; the table of contents, page actions, page footer and pagination are marked.
