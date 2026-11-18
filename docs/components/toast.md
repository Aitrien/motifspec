---
name: toast
status: stable
layouts: [shared]
group: messages
tokens:
  - border.focus.width
  - color.surface.inverse
  - color.text.inverse
  - font.line-height.ui
  - font.size.small
  - motion.distance.nudge
  - motion.duration.base
  - motion.easing.enter
  - motion.easing.exit
  - radius.control
  - size.column.card
  - size.target.min
  - space.gutter.page
  - space.inline.sm
  - space.inset.md
  - space.inset.sm
  - space.inset.xs
  - space.stack.sm
---

# Toast

A short confirmation that something the reader just did has worked, shown at the bottom of the screen for a few seconds.

## When to use

- After an action whose result isn't otherwise visible where the reader is: settings saved, a link copied, an item moved to another list.
- When the message needs nothing from the reader, and missing it costs nothing.

## When not to use

- For an error, or anything the reader has to act on; that's an alert (`alert.md`), which stays until it's dealt with.
- When the control can say it itself, as a copy button does by changing to "Copied" (`code-block.md`, `page-actions.md`).
- For a message the reader didn't cause, such as a new reading arriving; show it where it happened.

## Markup

`dist/codex.js` makes the toasts. A page sends one with an event:

```js
document.dispatchEvent(new CustomEvent('cx-toast', { detail: { text: 'Settings saved', kind: 'success' } }));
```

`text` is required, and is set as text, not HTML. `kind: 'success'` adds the check icon; leave it out for a plain message. The script keeps one region per page for them, `<div class="cx-toasts" role="status">` at the end of `<body>`, and makes it if the page has none. Each toast it adds:

```html {preview=true}
<div class="cx-toast">
  <svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-check"></use></svg>
  <p class="cx-toast__text">Settings saved</p>
  <button class="cx-toast__dismiss" type="button" aria-label="Dismiss"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
</div>
```

## Do

- Say what happened in a few words, in the past tense: "Settings saved", "Link copied".
- Send it as soon as the action has worked, not before.
- Keep one toast to one result. Three or more at once means the page should say it some other way.

## Don't

- Don't put a link or another control in it; the reader may not reach it before it goes. Anything they might need afterwards goes on the page.
- Don't send one when the page loads; nothing has happened yet.
- Don't make it the only record of something the reader needs to see again.

## Accessibility

- The region is a polite live region (`role="status"`), so a toast is read once, after what the screen reader is saying, and focus stays where it is.
- It stays for `motion.duration.toast`, and the time starts again while the pointer or focus is on it, so it can be read at any pace. Escape, inside it, or its button closes it.
- The dismiss button is named "Dismiss" and is at least `size.target.min`; its focus ring is `color.text.inverse`, which shows on the toast.
- It appears with a short fade and rise; under `prefers-reduced-motion` it appears at once.
- Pairs: `color.text.inverse` on `color.surface.inverse` (7:1).

## Behaviour

`dist/codex.js` does this; an app that renders toasts itself does the same.

- **Adding:** a `cx-toast` event on the document adds a `cx-toast` to the region, at the bottom of the stack, and shows it with `is-shown`.
- **Limit:** three at a time. A fourth closes the oldest.
- **Going:** each closes after `motion.duration.toast`, read from the token. The time stops while the pointer is over it or focus is in it, and starts again in full when both have left. Its button, or Escape with focus in it, closes it at once. If focus was in it, focus moves to `#main`.
- **Without script:** there are no toasts, so nothing a reader needs can depend on one.

## Specimens

```html {specimen="Plain, success"}
<div class="cx-toast">
  <p class="cx-toast__text">Moved to Archived</p>
  <button class="cx-toast__dismiss" type="button" aria-label="Dismiss"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
</div>
<div class="cx-toast">
  <svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-check"></use></svg>
  <p class="cx-toast__text">Settings saved</p>
  <button class="cx-toast__dismiss" type="button" aria-label="Dismiss"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
</div>
```
