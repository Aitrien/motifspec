# Conventions

These rules are the contract between this repo and everything that consumes it. The validator (`npm run validate`) enforces the naming rules and every declared contrast pair; CI runs it on every push and PR.

## Token format

Tokens use the [Design Tokens Community Group (DTCG)](https://www.designtokens.org/) format (2025.10): every token is an object with `$value` and `$type`, and **should** have a `$description` saying when to use it. The description is not decoration: AI assistants read it to decide which token to use, so write it as a usage rule.

```json
{
  "color": {
    "accent": {
      "border": {
        "$value": "{primitive.color.sap.600}",
        "$type": "color",
        "$description": "Accent rules that mark the active item. Not for static decoration."
      }
    }
  }
}
```

Value shapes follow DTCG 2025.10: colours are `{ "colorSpace": "srgb", "components": [r, g, b], "hex": "#rrggbb" }`, dimensions are `{ "value": n, "unit": "px" | "rem" }`, durations are `{ "value": n, "unit": "ms" }`, easings are `cubicBezier` arrays.

## Two tiers

| Tier | Purpose | Example | Consumers use it? |
|---|---|---|---|
| **Primitive** | The raw palette and scales | `primitive.color.sap.600`, `primitive.space.4` | No. Only semantic tokens reference these |
| **Semantic** | Meaning, referenced by sites and components | `color.accent.border`, `space.inset.md` | Yes |

Primitives live under a root `primitive` group in each file and are marked `"$extensions": { "codex.tier": "primitive" }`. They hold raw values, never aliases. Every semantic token aliases a primitive and has a `$description`. Changing a primitive's value is fine; consumers only see it through semantic tokens.

## Naming

- Path segments are lowercase `kebab-case` or plain integers: `color.text.muted`, `primitive.color.sap.600`.
- Order: **category → role → variant → state**. `color.surface.raised`, `color.accent.fill.hover`.
- No raw values in names (`color.blue-2d55c8` ✗, `size.1104` ✗).
- Max depth 4 segments, counting the `primitive` group.
- A path is either a token or a group, never both. Where a role has states, every state is named: `color.accent.fill.rest` and `color.accent.fill.hover`.

Categories and their files:

| File | Category prefix | Covers |
|---|---|---|
| `tokens/color.json` | `color` | palette primitives, surface, text, link, border, accent, focus, ornament, status, syntax, data, the backdrop's tint, grain and saturation, the hover wash |
| `tokens/typography.json` | `font` | families, size scale, weights, line heights, tracking |
| `tokens/space.json` | `space` | spacing scale (4px base): inset, stack, inline, section, gutter |
| `tokens/size.json` | `size` | containers, measures, columns, targets, ornament sizes, ticks, breakpoints, the backdrop's blur and fade |
| `tokens/radius.json` | `radius` | corner radii |
| `tokens/border.json` | `border` | border widths, the backdrop contour stroke and the focus outline |
| `tokens/motion.json` | `motion` | durations, easings, the nudge distance |

## Extensions

| Key | On | Meaning |
|---|---|---|
| `codex.tier` | primitives | Always `"primitive"`. |
| `codex.modes` | semantic colours | `{ "dark": "{primitive.color…}" }`. `$value` is the light theme. Dark mode re-points semantic aliases at the same primitive palette; there is no second palette. |
| `codex.pairsWith` | foreground colours | `[{ "token": "color.surface.base", "min": 7 }]`. Every pair is measured in both themes by the validator. Targets: 7 for reading text, 4.5 for metadata and labels, 3 for controls, focus and graphics. |
| `codex.unit` | `number` tokens | A CSS unit DTCG dimensions don't allow (`em`, `ch`). The generator appends it. |
| `codex.fluid` | dimensions | `{ "min", "max"?, "viewport": { "min", "max" } }`. The generator emits `clamp()` between 360px and 1440px. `max` defaults to `$value`. |
| `codex.glyphs` | `font.family.ornament` | The approved Yarndings glyphs and the banned set. |

## Generated names

| Platform | Pattern | Example |
|---|---|---|
| CSS custom property | `--cx-` + path joined by `-` | `--cx-color-text-muted` |
| JS | camelCase path | `tokens.color.text.muted` |

The `cx` prefix keeps tokens from colliding with a consuming site's own variables. `--cx-primitive-*` properties exist in the generated CSS only so semantic properties can point at them; never use them directly.

Generated CSS has a single `:root` block. Semantic colours are `light-dark(light, dark)`; `:root` sets `color-scheme: light dark`, and `[data-theme="light" | "dark"]` on `<html>` pins one theme.

## Versioning (semver)

| Change | Bump |
|---|---|
| Rename or remove a semantic token | **major** |
| Add a token, add a component doc, add an icon to `icons/manifest.json`, deprecate a token | minor |
| Change a value, fix a description | patch |

Deprecate before removing. A semantic token that is no longer used gets a DTCG `$deprecated` string saying why and in which major it goes (`"Unused since the contour plate; removed in 2.0.0."`), and is listed under Deprecated in `CHANGELOG.md`. It stays in `tokens.css` (with a comment) and in `tokens.json` (with a `deprecated` field) until that major. The validator fails if a component, the Chroma mapping, a script or a component doc uses a deprecated token. Removal is the only major change, so the Go module path stays `github.com/aitrien/motifspec` until a removal is actually due.

Consumers pin to a tag. Releasing is automatic: bump `version` in `package.json` and add its `CHANGELOG.md` entry in the PR, and once it is merged and CI passes on main, `.github/workflows/release.yml` tags that commit, publishes a GitHub release with the entry as its notes, and publishes the commit to npm with provenance (npm trusted publishing, so no token is stored). A merge that doesn't change the version releases nothing. Don't tag by hand, and never move or delete a published tag: a version is released once, and if one turns out wrong, release the next patch.

Every version bump adds an entry to `CHANGELOG.md` (`## [x.y.z] - YYYY-MM-DD`, then Added / Changed / Removed / Fixed). `npm run build` fails if the version in `package.json` has none. The `changelog` URL in `package.json` points at the file on GitHub; version numbers in the showcase and site footers link to it.

## Files

- `dist/` is generated and committed with the change that produced it, because Hugo Modules fetch the tagged commit as-is. CI fails if it is stale.
- Icons live in `icons/manifest.json` (kebab-case keys → Material Symbols names and a usage rule) with their source SVGs in `icons/svg/` and the Apache-2.0 licence. The build compiles `dist/icons.svg` and fails on any `cx-icon-*` reference that isn't in the manifest.
- One component per file in `docs/components/`, following `_template.md`. The `tokens:` front matter is generated from `css/components.css` by `npm run build`; edit the CSS, not the list.
