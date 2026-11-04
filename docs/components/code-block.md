---
name: code-block
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
  - color.border.subtle
  - color.focus.ring
  - color.status.success.border
  - color.status.success.text
  - color.surface.raised
  - color.surface.sunken
  - color.syntax.attribute
  - color.syntax.comment
  - color.syntax.deleted
  - color.syntax.function
  - color.syntax.heading
  - color.syntax.inserted
  - color.syntax.keyword
  - color.syntax.line-highlight
  - color.syntax.line-number
  - color.syntax.meta
  - color.syntax.number
  - color.syntax.operator
  - color.syntax.string
  - color.syntax.tag
  - color.syntax.type
  - color.syntax.variable
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.line-height.code
  - font.line-height.ui
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.tracking.ui
  - font.weight.strong
  - font.weight.ui
  - radius.pill
  - size.container.breakout
  - size.measure.prose
  - size.target.control
  - size.target.min
  - space.inline.lg
  - space.inline.md
  - space.inline.xs
  - space.inset.lg
  - space.inset.md
  - space.inset.sm
  - space.stack.lg
---

# Code block

A framed block of syntax-highlighted code with a header bar for language, file name and a copy button.

## When to use

- For any code longer than one line, in posts, case studies and docs.
- For terminal sessions and diffs (use Chroma's `console` and `diff` lexers).

## When not to use

- For a single identifier or command inside a sentence; use inline `<code>` in `prose`.
- For configuration tables; use `data-table`.

## Markup

Hugo render hook (`layouts/_default/_markup/render-codeblock.html`):

```html preview
<figure class="cx-code">
  <figcaption class="cx-code__bar">
    <span>ts</span>
    <span class="cx-code__file">src/globe/arc-layer.ts</span>
    <button class="cx-code__copy" type="button" hidden><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use data-copy-icon href="#cx-icon-content-copy"></use></svg><span class="cx-code__copy-label">Copy</span></button>
  </figcaption>
  <div class="highlight"><pre tabindex="0" class="chroma"><code class="language-ts" data-lang="ts"><span class="line"><span class="cl"><span class="kd">const</span> <span class="nx">count</span> <span class="o">=</span> <span class="mi">6</span><span class="p">;</span>
</span></span></code></pre></div>
</figure>
```

## Do

- Show the file path when the reader would open that file.
- Use `hl_lines` to point at the one line the prose discusses.
- Add `.cx-code--breakout` inside prose when lines exceed 66 characters; the block fits 80ch.
- Keep the copy button a pill (`radius.pill`), like every button.
- Reveal the copy button from script (`hidden` by default). On success the script swaps `content-copy` for `check` and the label for "Copied", then reverts after `--cx-motion-duration-plate`.

## Don't

- Don't wrap long lines; the block scrolls horizontally.
- Don't use a generated Chroma theme. Colours come from `color.syntax.*` (see `syntax-highlighting.md`).
- Don't italicise comments.

## Accessibility

- `<pre tabindex="0">` makes the scroll region keyboard-reachable.
- The copy button says "Copied" on success. If the clipboard is refused, the code is selected and the button says to press Ctrl+C.
- Highlighted lines use an inset rule as well as a background, so the cue survives forced colours.
- Pairs: every `color.syntax.*` role on `color.surface.sunken` and `color.syntax.line-highlight` (4.5:1, both themes).
