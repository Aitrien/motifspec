---
name: tabs
status: stable
layouts: [shared]
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
  - font.family.mono
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - size.target.control
  - space.inline.xs
  - space.inset.md
  - space.stack.lg
  - space.stack.sm
---

# Tabs

The same content in two to four forms, such as Hugo and npm, with one shown at a time.

## When to use

- When readers need one of several equivalent forms and the rest are noise to them: install commands for different stacks, an example as HTML or JSX.
- When the forms have the same purpose and similar length.

## When not to use

- For content a reader needs more than one of; show it all.
- For navigation between pages or sections; use links.
- For more than four forms, or labels longer than a word or two.

## Markup

```html {preview=true}
<div class="cx-tabs" data-tabs="stack" aria-label="Stack">
  <section class="cx-tabs__panel"><h3 class="cx-tabs__label">Hugo</h3><p>Import the module and call the partials.</p></section>
  <section class="cx-tabs__panel"><h3 class="cx-tabs__label">npm</h3><p>Install the package and copy the markup.</p></section>
</div>
```

`data-tabs` names the choice. Every set with the same name on a page changes together, and the choice is remembered for the next page.

## Do

- Label each panel with the form's name, short and parallel: "Hugo", "npm".
- Put the form most readers need first.
- Give sets of the same choice the same `data-tabs` name, so a reader picks once.

## Don't

- Don't hide content that isn't the same thing in another form.
- Don't nest tabs.
- Don't write the tab list yourself; the script builds it from the labels.

## Accessibility

- Without script, every panel shows under its heading, so nothing is hidden from anyone.
- With script, it follows the ARIA tabs pattern: a `tablist` named by the set's `aria-label`, each tab with `aria-selected` and `aria-controls`, each panel a `tabpanel` named by its tab and focusable.
- Left and Right move between tabs (wrapping), Home and End go to the first and last; the selected tab is the only one in the Tab order.
- The selected tab is marked by weight and the accent rule, not colour alone. Pairs: `color.text.primary` and `color.text.secondary` on `color.surface.base` (7:1); `color.accent.border` (3:1).

## Behaviour

`dist/codex.js` does this; an app that renders tabs itself does the same.

- **Building:** in each `.cx-tabs` with two or more `.cx-tabs__panel` children, a tab list is inserted before the first panel, with one button per panel, named by its `.cx-tabs__label`. The set gets `is-tabbed`, which hides the labels.
- **Choosing:** a click, or the arrow keys, Home and End, selects a tab and shows its panel; the others get `hidden`. Selection follows focus.
- **Keeping in step:** choosing in a set with `data-tabs` selects the same label in every other set with that name, and stores it as `cx-tabs:<name>` in `localStorage`, which the next page reads. Storage that's blocked is ignored.
