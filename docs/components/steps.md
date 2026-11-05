---
name: steps
status: stable
layouts: [shared]
tokens:
  - border.width.hairline
  - color.border.subtle
  - color.text.accent
  - font.family.mono
  - font.line-height.body
  - font.line-height.heading
  - font.size.body
  - font.size.label
  - font.tracking.ui
  - font.weight.strong
  - size.target.min
  - space.inline.md
  - space.stack.md
  - space.stack.xs
---

# Steps

A numbered procedure: each step a short title and what to do, in order.

## When to use

- For a task the reader follows from start to finish: installing, setting up, releasing.
- When the order matters and the reader needs to keep their place.

## When not to use

- For items in no particular order; that is a list.
- For a single action; write it as a sentence.
- For more than about eight steps; split the task into stages with headings.

## Markup

```html {preview=true}
<ol class="cx-steps">
  <li><h3 class="cx-steps__title">Import the module</h3><p>Add it to your site's config.</p></li>
  <li><h3 class="cx-steps__title">Pin a version</h3><p>Run <code>hugo mod get</code> with the version you want.</p></li>
  <li><h3 class="cx-steps__title">Check the site</h3><p>Run the checker before you push.</p></li>
</ol>
```

In Markdown, write an ordered list whose items start with a bold lead-in, and put `{.cx-steps}` on the line after it. The site needs Goldmark's block attributes on (`docs/hugo.md`):

```markdown
1. **Import the module.** Add it to your site's config.
2. **Pin a version.** Run `hugo mod get` with the version you want.
{.cx-steps}
```

## Do

- Start each step with what the reader does, as a short imperative title.
- Keep one action per step; a step with "then" in it is two.
- Use the heading level that fits the page's outline for HTML titles (`h3` under an `h2`).

## Don't

- Don't nest steps inside steps.
- Don't number steps by hand; the list numbers them.

## Accessibility

- It is an `<ol>`, so the count and each step's position are announced.
- The visible numbers are generated, so they're not read twice.
- Pairs: `color.text.accent` on `color.surface.base` (4.5:1) for the numbers; `color.text.primary` on `color.surface.base` (7:1).
