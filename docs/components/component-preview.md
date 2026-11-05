---
name: component-preview
status: stable
layouts: [documentation]
tokens:
  - border.width.hairline
  - color.border.default
  - color.surface.base
  - size.column.card
  - space.inset.md
  - space.stack.lg
---

# Component preview

A live example above its markup, on a page that documents a component, so a reader sees it working and copies the same code.

## When to use

- On a design system's documentation pages, for each component example.
- Wherever a reader should see markup rendered with the system's styles and script before copying it.

## When not to use

- For code that isn't HTML for the system, such as a config file or a template; that is a code block (`code-block.md`).
- For a screenshot of a whole page; that is a figure (`figure.md`).
- In a portfolio case study; show the result as a figure.

## Markup

In Markdown, fence the example as ```` ```html {preview=true} ````; the code block render hook adds the preview. The hook writes:

```html {preview=true}
<div class="cx-preview">
  <iframe class="cx-preview__frame" title="Example: Callout" loading="lazy" srcdoc="&lt;!doctype html&gt;&lt;html lang=&quot;en&quot;&gt;&lt;head&gt;…&lt;/head&gt;&lt;body class=&quot;cx-preview-body&quot;&gt;…the example…&lt;/body&gt;&lt;/html&gt;"></iframe>
  <figure class="cx-code">…the example's code block…</figure>
</div>
```

The frame's document has the theme snippet (`dist/theme-init.js`), `codex.css`, `codex.js` and the icon sprite, and the example in a `<body class="cx-preview-body">`.

## Do

- Preview the same markup the doc asks readers to copy: the preview and the code block come from one fence.
- Keep each example to one component in one state; give other states their own fence.
- Write examples whose ids and landmarks make sense on their own; the frame keeps them apart from the page's.

## Don't

- Don't put a preview's markup straight into the page; a header or shell example would clash with the page's own.
- Don't rely on links in an example; they don't navigate.
- Don't preview examples that need data from the page around them.

## Accessibility

- The frame has a title ("Example: Callout"), so a screen reader announces it before its content; the content is the example's own, with its own landmarks.
- The code block after it is the text alternative: everything in the preview is in the code.
- Without script the frame keeps a fixed height and scrolls; with it, the frame is as tall as the example.
- Pairs: as the previewed component. The frame and its border: `color.surface.base` and `color.border.default`.

## Behaviour

`dist/codex.js` does this on the page and in the frame; a site that renders previews itself does the same.

- **Size:** when a frame loads, its height (`--_frame-height`) is set to the body of its document, and kept there with a ResizeObserver as the example changes.
- **Theme:** the frame's document reads the stored theme like any page, and when the page's theme toggle is used, `data-theme` is set on the frame's root too.
- **Links:** inside a preview (`body.cx-preview-body`), clicks on links don't navigate.
- **Scripts:** the example's own behaviour, such as a theme toggle or a copy button, runs inside the frame from `codex.js`.
