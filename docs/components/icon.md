---
name: icon
status: stable
layouts: [shared]
tokens:
  - color.text.muted
  - motion.duration.base
  - motion.easing.standard
  - size.icon.lg
  - size.icon.md
  - size.icon.sm
  - space.inline.xs
---

# Icon

A Material Symbols glyph from the MotifSpec sprite, used to reinforce a control's direction, state or kind.

## When to use

- Only for the roles listed in `icons/manifest.json`: direction arrows on buttons, links and pagination; the theme toggle; the copy button and its confirmation; callout titles; RSS; external links; back to top; the disclosure chevron; search, menu, close and edit; and, in the dashboard and documentation layouts, the items of a side navigation and the controls of a toolbar.
- Beside text that already says the same thing, so the icon is a second cue.

## When not to use

- As decoration, bullets or section markers. Decoration is the ornament set (Yarndings), not icons.
- In headings, tags or body copy, or in nav labels other than a side navigation's items in the dashboard and documentation layouts. A portfolio's header nav has none.
- For anything not in the manifest. A new icon is a new manifest entry and a minor version.
- As the only label of a control, unless the control has an accessible name (`aria-label`).

## Markup

Inline the sprite once per page, right after `<body>` (Hugo: `{{ readFile "assets/motifspec/icons.svg" | safeHTML }}` inside a hidden wrapper, or the build's inline sprite). Then reference symbols by id:

```html {preview=true}
<a class="cx-button cx-button--primary" href="/work/">
  View work
  <svg class="cx-icon cx-button__arrow" aria-hidden="true" focusable="false"><use href="#cx-icon-arrow-forward"></use></svg>
</a>

<p class="cx-callout__title">
  <svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-warning"></use></svg>
  Warning
</p>
```

Sizes: `cx-icon--sm` (16px, beside label-size mono text), default (20px, in buttons and the toggle), `cx-icon--lg` (24px, a control with no visible text).

## Do

- Use Material Symbols Sharp, weight 300, unfilled. Square terminals and a light stroke match the hairline system.
- Let icons inherit `currentColor`, so they take the text colour of their control and switch theme with it.
- Put forward arrows after the text and back arrows before it.
- Add `cx-button__arrow` to direction arrows so they nudge by `motion.distance.nudge` on hover, in their own direction.

## Don't

- Don't use the icon font or Google's CDN. The sprite is self-hosted and only carries approved icons.
- Don't mix in other icon sets, filled variants or emoji.
- Don't colour icons separately from their text.
- Don't animate icons except the arrow nudge and the disclosure chevron's rotation.

## Accessibility

- Icons beside text are `aria-hidden="true"` and `focusable="false"`. The text is the name.
- An icon-only control carries `aria-label` and uses `cx-icon--lg` inside a 44px target (`size.target.touch`).
- Icons share their text's contrast pair, because they inherit `currentColor`.
- Material Symbols is licensed under Apache-2.0 (`icons/LICENSE`); keep the licence with the sprite.
