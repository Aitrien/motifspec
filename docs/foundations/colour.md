---
weight: 3
---

# Colour

The primitive palette, and the semantic colours built on it that components and pages use, each with its light and dark value and its rule.

## Palette

Five hues generated in OKLCH so the steps are perceptually even, stored as sRGB. Primitives are never used directly in components or pages: they exist so semantic colours can point at them.

*Generated from `tokens/color.json`: the palette.*

## Semantic colours

Each semantic colour names a primitive for each theme, and the page switches with `light-dark()`, following the system unless the reader picks a theme. A text colour lists the surfaces it may sit on; [Contrast pairs](/reference/contrast/) measures every one.

*Generated from `tokens/color.json`: semantic colours.*
