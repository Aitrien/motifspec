# À la carte

For a project that fits none of the layouts, such as an app built around a full-screen canvas or map. It takes MotifSpec's tokens and the components it chooses, and brings its own frame. Declare it with `layout = "a-la-carte"` and list the components it uses (see `README.md`, Layouts).

## What it gets

- Every shared component, without listing them.
- The layout components it lists by doc name (the file name in `docs/components/` without `.md`), such as `table-of-contents` or `heading-anchor`, from any layout.

The checker treats any other layout component as a problem, so a project can't borrow parts by accident: add a component to the list when you mean to use it.

## Its own frame

There is no MotifSpec shell. The project lays out its own frame, for example controls placed over a canvas. That is the one case where a project using MotifSpec may have a stylesheet of its own, and the checker holds it to these rules:

- Every colour, size, radius, border width and duration is a semantic token (`var(--cx-…)`), as in MotifSpec's own CSS.
- No selector targets a `cx-` class: MotifSpec's components aren't restyled or overridden. A component that needs to change is changed in MotifSpec.
- The project's own class names don't start with `cx-`.

Use the stylesheet for the frame only. Anything that looks like a component belongs in MotifSpec first.

## Decoration

The project decides, within `backdrop.md` and `ornament.md`.

## Headings

One `<h1>` per page. Use heading anchors only on headings that start sections of reading text.

## Choosing a stack

| The project | Use |
|---|---|
| Already has a stack | Keep it. MotifSpec adapts to the project, not the reverse. |
| An app with state, live data or a lot of interaction | React, or the app's own framework, with `@aitrien/motifspec` from npm and the components' markup. |
| Mostly pages to read | Probably a layout, not à la carte: see `portfolio.md` and `documentation.md`. |
