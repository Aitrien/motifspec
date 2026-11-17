---
name: component-name
status: draft          # draft | stable | deprecated
# deprecated: Use x instead; removed in 2.0.0.   # required when status is deprecated
layouts: [shared]      # [shared], or the layouts it belongs to: portfolio, dashboard, documentation
group: content         # the Components page heading it sits under: a key in docs/components/_groups.json
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

## Specimens

Last: each variant at a glance, for the Components page's catalogue. One block per variant, named in `specimen="…"`; `wide=true` gives it a whole row, `live=true` keeps it interactive (only for what shows on hover or focus, like a tooltip). Ids start "sp-" and are unique across every doc. Links go to real pages. A component that can't be shown in a snippet says "None: " and why, in a sentence.

```html {specimen="Default"}
<!-- the smallest markup that shows this variant -->
```
