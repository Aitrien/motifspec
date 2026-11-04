---
name: tooltip
status: stable
layouts: [shared]
tokens:
  - color.surface.inverse
  - color.text.inverse
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.ui
  - font.weight.ui
  - motion.duration.fast
  - motion.easing.standard
  - size.column.card
  - space.inset.sm
  - space.inset.xs
---

# Tooltip

A short label that appears beside an icon-only control on hover or keyboard focus, saying what the control does.

## When to use

- On icon-only controls, such as the theme toggle ("Switch to dark theme").
- On a version number that links to the changelog ("View changelog"), where the text alone doesn't say it's a link.
- When the label is an action of five words or fewer.

## When not to use

- On controls that already show text. Their label is enough.
- For explanations, definitions or anything a reader needs in order to continue. Put that in the page.
- On touch-only interactions, where hover doesn't exist. The control's accessible name has to carry the meaning on its own.
- For links, form errors or rich content.

## Markup

The tooltip is a child of the control, so hover and focus on the control reveal it:

```html preview
<button class="cx-theme-toggle" type="button" aria-label="Switch to dark theme">
  <svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-theme-dark"></use></svg>
  <span class="cx-tooltip" aria-hidden="true">Switch to dark theme</span>
</button>
```

It opens below the control, aligned to its right edge. Add `cx-tooltip--start` to align it to the left edge instead, for controls near the left of the screen, and `cx-tooltip--above` to open it above the control, for controls near the bottom of the page (the footer version link).

## Do

- Keep the text identical to the control's `aria-label`, and update both together when the action changes.
- Write the action, not the state: "Switch to dark theme", not "Light theme".
- Let Escape dismiss it (`is-tooltip-dismissed` on the control until the pointer leaves or focus moves).
- Use the inverse surface (`color.surface.inverse`, `color.text.inverse`) so it reads on every background, in both themes.

## Don't

- Don't round it. Tooltips are labels, and pills are reserved for buttons.
- Don't add a delay longer than `motion.duration.fast` or animate its position.
- Don't put interactive content inside it; it ignores the pointer.

## Accessibility

- The tooltip is `aria-hidden="true"` because it repeats the accessible name. Screen readers hear the `aria-label` once.
- It shows on `:focus-visible` as well as `:hover`, so keyboard users see it too.
- Escape hides it without moving the pointer or focus (WCAG 1.4.13).
- Pair: `color.text.inverse` on `color.surface.inverse` (7:1 in both themes).

## Behaviour

- Showing is CSS: the tooltip appears while its control is hovered or has `:focus-visible`.
- `dist/codex.js` adds dismissal: Escape adds `is-tooltip-dismissed` to every tooltip's control, hiding it without moving the pointer or focus. The class is removed when the pointer leaves the control or focus moves away. An app that renders tooltips itself does the same.
