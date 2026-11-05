---
name: callout
status: stable
layouts: [shared]
tokens:
  - border.width.emphasis
  - border.width.hairline
  - color.status.danger.border
  - color.status.danger.surface
  - color.status.danger.text
  - color.status.info.border
  - color.status.info.surface
  - color.status.info.text
  - color.status.success.border
  - color.status.success.surface
  - color.status.success.text
  - color.status.warning.border
  - color.status.warning.surface
  - color.status.warning.text
  - color.text.primary
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.label
  - font.weight.ui
  - size.measure.prose
  - space.inline.sm
  - space.inset.md
  - space.stack.lg
  - space.stack.sm
---

# Callout

A tinted note set apart from running text, in four kinds: note, tip, warning and danger.

## When to use

- For information the reader must not miss: a breaking change, a prerequisite, a safety warning.
- For a short aside that would interrupt the paragraph (note) or a shortcut (tip).

## When not to use

- More than twice per article. Callouts lose force when repeated.
- For quotations; use `<blockquote>`.
- For decoration or to make a paragraph "pop".

## Markup

Hugo shortcode output (`{{< callout warning >}}…{{< /callout >}}`):

```html {preview=true}
<div class="cx-callout cx-callout--warning" role="note">
  <p class="cx-callout__title"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-warning"></use></svg>Warning</p>
  <p>Renaming a semantic token is a major version bump.</p>
</div>
```

Kinds and their icons: no modifier with `note` (info hues), `--tip` with `tip`, `--warning` with `warning`, `--danger` with `danger`.

## Do

- Always include the title text; it names the kind. The icon is a second cue.
- Keep the body to one or two sentences.
- Use the kind that matches the consequence: danger only for data loss, breakage or security.

## Don't

- Don't use the icon in place of the title, or ornaments anywhere in a callout.
- Don't nest callouts or put code blocks inside them.

## Accessibility

- `role="note"` exposes the callout without adding a landmark.
- The kind is in text, so colour is a second signal.
- Pairs: `color.status.*.text` on `color.status.*.surface` (4.5:1); `color.text.primary` body on each status surface (7:1); `color.status.*.border` (3:1).
