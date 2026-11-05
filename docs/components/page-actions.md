---
name: page-actions
status: stable
layouts: [documentation]
tokens:
  - space.inline.xs
---

# Page actions

Copy page and View as Markdown, under a documentation page's title, so a reader can hand the page to an AI assistant or read its source.

## When to use

- On documentation pages that have a Markdown copy beside them (`index.md` beside `index.html`; `docs/hugo.md`, A Markdown copy of each page).
- Under the page head's lede, before the article.

## When not to use

- On a page with no Markdown copy; there is nothing to copy.
- On portfolio case studies and posts; they are written to be read on the site.
- For actions on the site as a whole, such as search; those belong in the header.

## Markup

```html {preview=true}
<div class="cx-page-actions">
  <button class="cx-button cx-button--sm" type="button" data-copy-page="/guide/getting-started/index.md" hidden><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-content-copy"></use></svg><span class="cx-page-actions__label">Copy page</span></button>
  <a class="cx-button cx-button--sm" href="/guide/getting-started/index.md" type="text/markdown">View as Markdown</a>
</div>
```

In Hugo, `partial "motifspec/page-actions.html" .` writes it for a page that has the markdown output format, and nothing otherwise.

## Do

- Put them in the page head, after the lede, so they're found before the reader starts the article.
- Keep the labels as they are: "Copy page" says what goes on the clipboard, "View as Markdown" what opens.

## Don't

- Don't ship the copy button visible; it needs script, so it starts `hidden`.
- Don't add other actions here, such as share or print; the browser has them.

## Accessibility

- Both are compact buttons (`button-and-link.md`), at `size.target.min`, with visible text; the icon is `aria-hidden`.
- "View as Markdown" is a real link, so it works without script and opens in a new tab on request.
- The copy button's result is in its label ("Copied" or "Couldn't copy"), which a screen reader reads when focus returns to it.
- Pairs: as `button-and-link.md`.

## Behaviour

- **Without script:** only "View as Markdown" shows.
- **With `dist/codex.js`:** when the browser has a clipboard, the copy button is shown. A click fetches the address in `data-copy-page` and copies it as plain text. With `ClipboardItem`, the copy is written with a promise, so it still counts as part of the click while the file loads (Safari needs this); without it, the text is fetched first and written with `writeText`. The label becomes "Copied" with the `check` icon, or "Couldn't copy", and `data-state` is `copied` or `failed`; after `motion.duration.plate` it returns to "Copy page".
- An app that renders it itself does the same, or leaves only the link.
