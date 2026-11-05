---
name: keyboard-key
status: stable
layouts: [shared]
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.border.strong
  - color.surface.sunken
  - font.family.mono
  - font.size.code-inline
  - radius.control
  - space.inset.xs
---

# Keyboard key

A key the reader presses, set as a small keycap: Ctrl K, Esc, Enter.

## When to use

- To name a keyboard shortcut beside the control it opens, such as a search field's hint.
- In instructions that say which keys to press.

## When not to use

- For code or something the reader types; that is inline code (`prose.md`).
- For a button the reader clicks; write the button's label.
- Inside prose. Markdown and prose already style `<kbd>`, so add no class there.

## Markup

```html {preview=true}
<kbd class="cx-kbd">Ctrl</kbd> <kbd class="cx-kbd">K</kbd>
```

One `<kbd>` per key, with a space between keys that are pressed together.

## Do

- Name keys as they're printed on most keyboards: Ctrl, Shift, Esc, Enter, the letter in capitals.
- Show both forms when they differ by platform, separated by "or": <kbd class="cx-kbd">Ctrl</kbd> <kbd class="cx-kbd">K</kbd> or <kbd class="cx-kbd">⌘</kbd> <kbd class="cx-kbd">K</kbd>.

## Don't

- Don't use it for decoration or emphasis.
- Don't show a shortcut that doesn't work in the browser the reader is using.

## Accessibility

- `<kbd>` is announced as text, so the keys read in order.
- A shortcut is never the only way in: the control it opens has its own visible label.
- Pairs: `color.text.primary` on `color.surface.sunken` (7:1).
