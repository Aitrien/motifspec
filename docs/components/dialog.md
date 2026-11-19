---
name: dialog
status: stable
layouts: [shared]
group: messages
tokens:
  - border.focus.width
  - border.width.hairline
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.scrim
  - color.surface.hover
  - color.surface.raised
  - color.surface.sunken
  - color.text.primary
  - color.text.secondary
  - color.wash.scrim
  - font.line-height.heading
  - font.size.heading-4
  - font.weight.heading
  - motion.distance.nudge
  - motion.duration.base
  - motion.easing.enter
  - motion.easing.exit
  - radius.pill
  - size.column.card
  - size.measure.caption
  - size.measure.prose
  - size.target.control
  - space.gutter.page
  - space.inline.sm
  - space.inset.lg
  - space.inset.md
  - space.inset.sm
  - space.stack.md
---

# Dialog

A box over the page that asks the reader to confirm something, or to fill in a short form, before they go on.

## When to use

- To confirm an action that deletes or stops something, with a danger button (`button-and-link.md`).
- For a short form that belongs to the page behind it, such as adding an item to a list.

## When not to use

- For a message; use an alert (`alert.md`) or a toast (`toast.md`).
- For a long form or one with steps; give it a page.
- For something the reader didn't ask for, such as a sign-up when the page loads.

## Markup

```html {preview=true}
<button class="cx-button" type="button" data-dialog-open="remove-sonarr">Remove service</button>
<dialog class="cx-dialog" id="remove-sonarr" aria-labelledby="remove-sonarr-title" aria-describedby="remove-sonarr-text">
  <div class="cx-dialog__head">
    <h2 class="cx-dialog__title" id="remove-sonarr-title">Remove Sonarr?</h2>
    <button class="cx-dialog__close" type="button" aria-label="Close" data-dialog-close><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
  </div>
  <div class="cx-dialog__body">
    <p id="remove-sonarr-text">Sonarr stops and its container is deleted from tern. Its settings stay in <code>/srv/sonarr</code>, so you can add it again later.</p>
  </div>
  <div class="cx-dialog__actions">
    <button class="cx-button" type="button" data-dialog-close autofocus>Cancel</button>
    <button class="cx-button cx-button--danger" type="button">Remove service</button>
  </div>
</dialog>
```

For a form, add `cx-dialog--wide` and `data-dialog-keep`, and put the parts in a `form` (fields from `field.md`):

```html {preview=true}
<button class="cx-button" type="button" data-dialog-open="add-node">Add a node</button>
<dialog class="cx-dialog cx-dialog--wide" id="add-node" aria-labelledby="add-node-title" data-dialog-keep>
  <form method="dialog">
    <div class="cx-dialog__head">
      <h2 class="cx-dialog__title" id="add-node-title">Add a node</h2>
      <button class="cx-dialog__close" type="button" aria-label="Close" data-dialog-close><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
    </div>
    <div class="cx-dialog__body">
      <div class="cx-field">
        <div class="cx-field__box"><input class="cx-field__control" id="add-node-name" placeholder="e.g. tui" required autocomplete="off" autofocus><label class="cx-field__label" for="add-node-name">Name</label></div>
      </div>
      <div class="cx-field">
        <div class="cx-field__box"><input class="cx-field__control cx-field__control--mono" id="add-node-address" placeholder="e.g. 192.168.1.40" inputmode="decimal" autocomplete="off" aria-describedby="add-node-address-hint"><label class="cx-field__label" for="add-node-address">Address</label></div>
        <p class="cx-field__hint" id="add-node-address-hint">Its IP address or host name on your network.</p>
      </div>
    </div>
    <div class="cx-dialog__actions">
      <button class="cx-button" type="button" data-dialog-close>Cancel</button>
      <button class="cx-button cx-button--primary" type="submit">Add node</button>
    </div>
  </form>
</dialog>
```

<!-- caption: Dialog parts -->
| Class | What it is |
|---|---|
| `cx-dialog` | A `<dialog>`, opened with `showModal()`; `--wide` for a form |
| `cx-dialog__head` | The title and the close button, over a rule |
| `cx-dialog__title` | An `h2` that names the dialog, linked with `aria-labelledby` |
| `cx-dialog__close` | The close button, top right, named "Close" |
| `cx-dialog__body` | The question or the form; it scrolls when it's taller than the window |
| `cx-dialog__actions` | The buttons, in a recessed band: Cancel first, the main action last |

## Do

- Ask a question in the title, and say in the body what will happen ("Sonarr stops and its container is deleted").
- Name the main button for what it does ("Remove service"), never "OK" or "Yes".
- Start focus on Cancel when the action deletes or stops something (`autofocus`), and on the first field in a form.
- For something that can't be undone, ask the reader to type its name to turn the button on.

## Don't

- Don't open a dialog from a dialog.
- Don't let a click outside close a form; that's what `data-dialog-keep` is for.
- Don't put a danger button anywhere but a dialog's actions.

## Accessibility

- `showModal()` makes the rest of the page inert, moves focus into the dialog, closes it on Escape, and returns focus to the button that opened it.
- The title names the dialog (`aria-labelledby`), and a confirmation's text describes it (`aria-describedby`), so both are read when it opens.
- The page behind it doesn't scroll, and recedes behind `color.scrim` at `color.wash.scrim`.
- It fades and rises in by `motion.distance.nudge`, at `motion.duration.base`; under `prefers-reduced-motion` it appears at once.
- On a phone (below `size.breakpoint.md`), a confirmation docks to the bottom with full-width buttons, Cancel below, and a form fills the screen.
- Pairs: `color.text.primary` and `color.text.secondary` on `color.surface.raised`; the actions on `color.surface.sunken`.

## Behaviour

`dist/codex.js` does this; an app that renders dialogs itself does the same, or calls `showModal()` and `close()` itself.

- **Opening:** a click on `[data-dialog-open="id"]` calls `showModal()` on the dialog with that id.
- **Closing:** `[data-dialog-close]` inside the dialog closes it, as does Escape. A click on the backdrop closes it too, unless the dialog has `data-dialog-keep`.
- **Forms:** with `<form method="dialog">`, sending the form closes the dialog once the fields are valid; the page reads the values on the dialog's `close` event.

## Specimens

```html {specimen="Confirm" wide=true}
<div class="cx-dialog">
  <div class="cx-dialog__head"><h2 class="cx-dialog__title">Remove Sonarr?</h2><button class="cx-dialog__close" type="button" aria-label="Close"><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button></div>
  <div class="cx-dialog__body"><p>Sonarr stops and its container is deleted from tern. Its settings stay in <code>/srv/sonarr</code>.</p></div>
  <div class="cx-dialog__actions"><button class="cx-button" type="button">Cancel</button><button class="cx-button cx-button--danger" type="button">Remove service</button></div>
</div>
```
