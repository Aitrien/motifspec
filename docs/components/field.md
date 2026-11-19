---
name: field
status: stable
layouts: [shared]
group: forms
tokens:
  - border.width.hairline
  - color.accent.border
  - color.border.strong
  - color.status.danger.border
  - color.status.danger.text
  - color.surface.raised
  - color.surface.sunken
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.ui
  - font.size.body
  - font.size.label
  - font.size.small
  - font.weight.strong
  - motion.duration.base
  - motion.easing.standard
  - radius.control
  - size.column.sidebar
  - size.icon.md
  - size.target.control
  - space.inline.xs
  - space.inset.sm
  - space.inset.xs
  - space.stack.md
  - space.stack.sm
  - space.stack.xs
---

# Field

A text field, select or text area, with its label on the top border: it rests where the text goes, and moves up to the border when the field has focus or a value.

## When to use

- For anything the reader types or picks from a list: a name, an address, a port, a setting.
- With a hint under the field when the reader needs to know the format or where to find the value.

## When not to use

- For a yes or no, or a choice of two to five options the reader should see at once; use a checkbox, radio buttons or a switch (`choice.md`).
- For a date; use the date picker (`date-picker.md`), which is a field with a calendar.
- For search; use search (`search.md`).

## Markup

```html {preview=true}
<div class="cx-field">
  <div class="cx-field__box">
    <input class="cx-field__control" id="service-name" placeholder="e.g. Sonarr" autocomplete="off">
    <label class="cx-field__label" for="service-name">Name</label>
  </div>
</div>
<div class="cx-field">
  <div class="cx-field__box">
    <input class="cx-field__control cx-field__control--mono" id="service-image" placeholder=" " value="lscr.io/linuxserver/sonarr:4.0.11" aria-describedby="service-image-hint">
    <label class="cx-field__label" for="service-image">Image</label>
  </div>
  <p class="cx-field__hint" id="service-image-hint">The registry, name and tag, as you would pull it.</p>
</div>
<div class="cx-field">
  <div class="cx-field__box">
    <input class="cx-field__control cx-field__control--mono cx-field__control--short" id="service-port" placeholder=" " inputmode="numeric" value="8096" aria-invalid="true" aria-describedby="service-port-error">
    <label class="cx-field__label" for="service-port">Port</label>
  </div>
  <p class="cx-field__error" id="service-port-error"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-danger"></use></svg>Port 8096 is already used by Jellyfin.</p>
</div>
<div class="cx-field">
  <div class="cx-field__box">
    <select class="cx-field__control" id="service-node"><option>tern</option><option>kea</option><option>ruru</option></select>
    <label class="cx-field__label" for="service-node">Node</label>
    <svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg>
  </div>
</div>
<div class="cx-field">
  <div class="cx-field__box cx-field__box--area">
    <textarea class="cx-field__control" id="service-notes" placeholder=" "></textarea>
    <label class="cx-field__label" for="service-notes">Notes <span class="cx-field__optional">(optional)</span></label>
  </div>
</div>
```

The label comes straight after the control, and the control has a `placeholder`: an example the reader sees once they're in the field ("e.g. Sonarr"), or a single space when there's none. The label uses it to tell an empty field from a filled one, with no script.

<!-- caption: Field parts -->
| Class | What it is |
|---|---|
| `cx-field` | The field: the box, then any hint or error |
| `cx-field__box` | The control and its label; `--area` for a text area, whose label rests at the top |
| `cx-field__control` | The `input`, `select` or `textarea`; `--mono` for values like paths and ports, `--short` for a value a few characters long |
| `cx-field__label` | The label, on the border once the field has focus or a value |
| `cx-field__optional` | "(optional)" after the label |
| `cx-field__hint` | Help under the field, linked with `aria-describedby` |
| `cx-field__error` | What's wrong and how to fix it, with the `danger` icon, linked the same way |
| `cx-fieldset` | A `fieldset` of related fields or choices, with its `legend` as the group's name |

Group related fields in a fieldset:

```html {preview=true}
<fieldset class="cx-fieldset">
  <legend>Where it runs</legend>
  <div class="cx-field">
    <div class="cx-field__box">
      <input class="cx-field__control cx-field__control--mono" id="where-address" placeholder="e.g. 192.168.1.40" inputmode="decimal" autocomplete="off">
      <label class="cx-field__label" for="where-address">Address</label>
    </div>
  </div>
</fieldset>
```

In Hugo, `motifspec/field.html` writes one (`docs/hugo.md`).

## Do

- Write the label as the thing it asks for, in a word or two ("Name", "Port"). It's 0.75rem once it moves, and a long one is cut off.
- Mark the optional fields with "(optional)", not the required ones: most fields are required.
- Put the format in a hint when it matters ("Day, month and year"), since the label covers the placeholder until the reader is in the field.
- Say in the error what went wrong and how to fix it, and show it only once the reader has left the field or sent the form.
- Use `--mono` for values that are code: paths, ports, image names, addresses.

## Don't

- Don't leave out the label, or put the only label in the placeholder.
- Don't put a hint or error between the label and the box; they go underneath.
- Don't disable a field without saying why in its hint.
- Don't round the box. Fields stay square (`radius.control`); pills are for what you press (`button-and-link.md`).

## Accessibility

- The label is a real `<label for>`, always visible, so a screen reader reads it and a click on it focuses the field.
- Hints and errors are linked with `aria-describedby`, and a field with an error has `aria-invalid="true"`, so both are read with the field.
- Focus doubles the field's border in `color.accent.border`. The inner line changes from the field's surface to accent (4.7:1 in light, 5.8:1 in dark), so the change shows without colour vision too.
- The field is `size.target.control` plus `space.inset.xs` above and below.
- The label moves with no animation under `prefers-reduced-motion`.
- Pairs: `color.text.primary` and `color.text.secondary` on `color.surface.raised`; `color.border.strong` against it (3:1); `color.status.danger.text` for errors.

## Specimens

```html {specimen="Empty, filled"}
<div class="cx-field">
  <div class="cx-field__box"><input class="cx-field__control" id="sp-field-a" placeholder=" "><label class="cx-field__label" for="sp-field-a">Name</label></div>
</div>
<div class="cx-field">
  <div class="cx-field__box"><input class="cx-field__control" id="sp-field-b" placeholder=" " value="Sonarr"><label class="cx-field__label" for="sp-field-b">Name</label></div>
</div>
```

```html {specimen="Hint, error"}
<div class="cx-field">
  <div class="cx-field__box"><input class="cx-field__control cx-field__control--mono" id="sp-field-c" placeholder=" " value="lscr.io/linuxserver/sonarr" aria-describedby="sp-field-c-hint"><label class="cx-field__label" for="sp-field-c">Image</label></div>
  <p class="cx-field__hint" id="sp-field-c-hint">The registry, name and tag.</p>
</div>
<div class="cx-field">
  <div class="cx-field__box"><input class="cx-field__control cx-field__control--mono" id="sp-field-d" placeholder=" " value="99999" aria-invalid="true" aria-describedby="sp-field-d-error"><label class="cx-field__label" for="sp-field-d">Port</label></div>
  <p class="cx-field__error" id="sp-field-d-error"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-danger"></use></svg>Enter a port from 1 to 65535.</p>
</div>
```

```html {specimen="Select, text area"}
<div class="cx-field">
  <div class="cx-field__box"><select class="cx-field__control" id="sp-field-e"><option>Unless stopped</option></select><label class="cx-field__label" for="sp-field-e">Restart policy</label><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></div>
</div>
<div class="cx-field">
  <div class="cx-field__box cx-field__box--area"><textarea class="cx-field__control" id="sp-field-f" placeholder=" "></textarea><label class="cx-field__label" for="sp-field-f">Notes <span class="cx-field__optional">(optional)</span></label></div>
</div>
```

```html {specimen="Disabled"}
<div class="cx-field">
  <div class="cx-field__box"><input class="cx-field__control cx-field__control--mono" id="sp-field-g" placeholder=" " value="/srv/sonarr" disabled aria-describedby="sp-field-g-hint"><label class="cx-field__label" for="sp-field-g">Volume</label></div>
  <p class="cx-field__hint" id="sp-field-g-hint">Stop the service to change it.</p>
</div>
```
