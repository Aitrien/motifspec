---
name: choice
status: stable
layouts: [shared]
group: forms
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.accent.fill.rest
  - color.border.strong
  - color.focus.ring
  - color.surface.sunken
  - color.text.muted
  - color.text.on-accent
  - color.text.secondary
  - font.line-height.ui
  - font.size.small
  - motion.duration.fast
  - motion.easing.standard
  - radius.pill
  - size.icon.md
  - size.target.min
  - size.target.touch
  - space.inline.sm
  - space.stack.sm
  - space.stack.xs
---

# Choice

A checkbox, radio button or switch, with its label beside it: native inputs in the accent colour.

## When to use

- A checkbox for one thing that's on or off when the form is sent ("Start when the node starts"), or for each of several that can all be on.
- Radio buttons for one choice among two to five, all shown at once.
- A switch for a setting that takes effect as soon as it's changed ("Send alerts").

## When not to use

- For more than five options, or options that don't need to be seen together; use a select (`field.md`).
- For switching between views of the same content; that's tabs (`tabs.md`).
- A switch in a form that waits for Save. Use a checkbox there.

## Markup

```html {preview=true}
<fieldset class="cx-fieldset">
  <legend>When it fails</legend>
  <div class="cx-choices">
    <label class="cx-choice"><input type="radio" name="on-failure" value="restart" checked><span class="cx-choice__text">Restart it<span class="cx-field__hint">Up to 3 times, then stop and raise an alert.</span></span></label>
    <label class="cx-choice"><input type="radio" name="on-failure" value="stop"><span class="cx-choice__text">Leave it stopped</span></label>
  </div>
  <label class="cx-choice"><input type="checkbox" name="start-on-boot" checked><span class="cx-choice__text">Start when the node starts</span></label>
  <label class="cx-choice"><input type="checkbox" role="switch" name="alerts" checked><span class="cx-choice__text">Send alerts</span></label>
</fieldset>
```

A switch is a checkbox with `role="switch"`. Its label names the setting, and the switch shows whether it's on.

## Do

- Put radio buttons in a `fieldset` whose `legend` asks the question, and give them one `name`.
- Write each label as what happens when it's chosen, in a few words. A hint can go under it, inside `cx-choice__text`.
- Pick a sensible default for radio buttons, so one is always chosen.

## Don't

- Don't use one checkbox with a negative label ("Don't send alerts").
- Don't make a switch wait for a Save button.
- Don't hide a disabled choice's reason; say it in a hint.

## Accessibility

- Each input is inside its label, so the whole line can be clicked or tapped, and it's at least `size.target.min` tall.
- Radio buttons in a fieldset are announced as a group, with the legend; the arrow keys move between them.
- A switch is announced as a switch, on or off.
- Focus shows `color.focus.ring` around the input.
- Pairs: `color.accent.fill.rest` against `color.surface.base` (3:1) for a ticked box or an on switch; `color.text.on-accent` for the switch's knob; `color.border.strong` for an off switch.

## Specimens

```html {specimen="Checkboxes"}
<div class="cx-choices">
  <label class="cx-choice"><input type="checkbox" checked><span class="cx-choice__text">Start on boot</span></label>
  <label class="cx-choice"><input type="checkbox"><span class="cx-choice__text">Pull a new image nightly</span></label>
</div>
```

```html {specimen="Radio buttons"}
<div class="cx-choices">
  <label class="cx-choice"><input type="radio" name="sp-choice-r" checked><span class="cx-choice__text">Restart it</span></label>
  <label class="cx-choice"><input type="radio" name="sp-choice-r"><span class="cx-choice__text">Leave it stopped</span></label>
</div>
```

```html {specimen="Switch, on and off"}
<div class="cx-choices">
  <label class="cx-choice"><input type="checkbox" role="switch" checked><span class="cx-choice__text">Send alerts</span></label>
  <label class="cx-choice"><input type="checkbox" role="switch"><span class="cx-choice__text">Quiet hours</span></label>
</div>
```
