---
name: component-name
status: draft          # draft | stable | deprecated
# deprecated: Use x instead; removed in 2.0.0.   # required when status is deprecated
layouts: [shared]      # [shared], or the layouts it belongs to: portfolio, dashboard, documentation
tokens:                # semantic tokens this component uses
  - color.accent
  - space.md
---

# Component name

One sentence: what it is for.

## When to use

- …

## When not to use

- …

## Markup

```html {preview=true}
<!-- Minimal markup: the pattern to copy. -->
```

## Do

- …

## Don't

- …

## Accessibility

- Keyboard behaviour, roles, contrast pairs.

## Behaviour

Only for a component with behaviour: what changes on interaction, what script (if any) does it, and what an app that renders the component itself (React, say) must do to match.
