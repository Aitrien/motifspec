---
name: disclosure
status: stable
layouts: [shared]
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.hairline
  - color.border.default
  - color.focus.ring
  - color.surface.hover
  - color.text.primary
  - font.weight.strong
  - motion.duration.base
  - motion.easing.standard
  - size.target.control
  - space.inline.sm
  - space.inset.md
  - space.inset.sm
---

# Disclosure

A native `<details>` that shows and hides a block of content under a labelled row.

## When to use

- For content some readers need and others can skip: a table view of a chart, an FAQ answer, advanced settings, a long list of groups in a navigation.
- When the content still makes sense on the page, opened, without any script.

## When not to use

- To hide content every reader needs. Put it on the page.
- For navigation between views of the same data; that is tabs.
- For a choice the reader makes; use a form control.

## Markup

```html preview
<details class="cx-disclosure">
  <summary>Show as a table<svg class="cx-icon cx-icon--sm cx-disclosure__chevron" aria-hidden="true" focusable="false"><use href="#cx-icon-expand"></use></svg></summary>
  <div class="cx-disclosure__body">
    <p>The content that opens.</p>
  </div>
</details>
```

Add `open` to `<details>` to start it open. Disclosures that follow each other share their borders.

## Do

- Write the summary as what opens: "Show as a table", "Advanced settings".
- Keep the chevron (`expand`) after the text, as `cx-disclosure__chevron`; it turns when open.
- Start a disclosure open when most readers will want what's inside, such as the group that holds the current page.

## Don't

- Don't nest disclosures more than one level.
- Don't put the only copy of important information inside one that starts closed.
- Don't replace `<details>` with a scripted panel.

## Accessibility

- `<details>` and `<summary>` give the button role, the expanded state and keyboard support (Enter and Space) with no script.
- The summary meets `size.target.control`; focus shows the system focus ring.
- The chevron is `aria-hidden`; the summary's text is the name.
- Pairs: `color.text.primary` on `color.surface.raised` and `color.surface.hover` (7:1).

## Behaviour

- No script. The browser opens and closes it, and keeps the `open` attribute in step.
- In a framework, render `<details>` and `<summary>` as they are. If the app needs to know the state, listen for the `toggle` event; don't control it from app state, because the browser already owns it.
- The chevron's turn uses `motion.duration.base` and stops under reduced motion.
