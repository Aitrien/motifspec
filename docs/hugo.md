# Using MotifSpec in Hugo

The module ships the components as Hugo partials and the Markdown render hooks that turn content into them, so a site writes its page templates and content and nothing else. The partials follow `docs/components/*.md`; when a partial and its doc disagree, the doc is the contract and the partial is the bug.

## Setup

```toml
[module]
  [[module.imports]]
    path = "github.com/aitrien/motifspec"

[markup.highlight]
  noClasses = false

[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false   # standalone images reach render-image.html, so they can become figures
  [markup.goldmark.parser.attribute]
    block = true                              # {caption="…"} on tables, {file="…"} on code, {width="prose"} on figures
```

Pin a release with `hugo mod get github.com/aitrien/motifspec@vX.Y.Z`. The module mounts `dist/` at `assets/motifspec`, `fonts/` at `static/fonts` and `layouts/` at `layouts`. The shell partials publish the stylesheet and scripts at `/cx/`: one level below the site root, because the stylesheet's font URLs are `../fonts/…`, and not `/motifspec/`, which on GitHub Pages belongs to the motifspec repository's own Pages site.

## The page shell

```go-html-template
<!doctype html>
<html lang="{{ site.Language.LanguageCode }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  {{ partial "motifspec/head.html" . }}
  {{/* the site's own <title>, meta description, favicon */}}
</head>
<body class="cx-backdrop-page">
  {{ partial "motifspec/body-start.html" . }}
  {{ partial "motifspec/site-header.html" . }}
  <main id="main" tabindex="-1">{{ block "main" . }}{{ end }}</main>
  {{/* the site's footer (site-footer.md) */}}
  {{ partial "motifspec/body-end.html" . }}
</body>
</html>
```

| Partial | What it writes |
|---|---|
| `motifspec/head.html` | The stored-theme snippet, font preloads, `codex.css` and `codex.js`, in that order. |
| `motifspec/body-start.html` | The backdrop, the icon sprite and the skip link to `#main`. |
| `motifspec/site-header.html` | `site-header.md`: wordmark from `site.Title` and `site.Params.role`, nav from `site.Menus.main`, the backdrop pause control and the theme toggle. A menu entry is current when its `identifier` is the page's section. |
| `motifspec/body-end.html` | `plate.js`, which drifts the backdrop and reveals the pause control. |

The footer stays in the site: its columns are the site's own links and colophon. Use the markup in `site-footer.md`.

## Component partials

Every partial below is called as `partial "motifspec/<name>.html" <context>`.

| Partial | Doc | Context |
|---|---|---|
| `article.html` | `prose.md`, `table-of-contents.md`, `ornament.md` | `dict "page" . "toc" "always"` or `"auto"` (auto shows the TOC at three or more h2s). Ends the prose with the end mark, so the content must end with a paragraph. |
| `project-card.html` | `project-card.md` | `dict "page" . "level" 2` (the heading level that fits the page outline; default 3). |
| `post-list-item.html` | `post-list-item.md` | `dict "page" . "level" 3`. Writes an `<li>`, so put it in `<ol class="cx-posts">`. |
| `accession/label.html` | `accession-label.md` | `dict "page" . "variant" "lead"` above the title, or `"card"` after the article (shown on a phone). |
| `accession/id.html` | `accession-label.md` | A page. The compact number, date and reading time line. |
| `accession/status.html` | `accession-label.md` | `live`, `building` or `archived`. |
| `figure.html` | `figure.md` | `dict "image" <resource> "alt" "…" "caption" <HTML> "plate" 1`, plus `"eager" true` for the largest image above the fold and `"prose" true` to keep it to the text measure. |
| `table-of-contents.html` | `table-of-contents.md` | A page. `article.html` already calls it. |
| `tags.html` | `tag.md` | `dict "page" . "max" 3`. |
| `tag-filter.html` | `tag.md` | `dict "section" "work" "current" nil` on a section page, or `dict "section" "" "current" .` on a term page. |
| `filed-under.html` | `tag.md`, `docs/templates.md` | A page. "Filed under" and its tags, after an article. |
| `pagination-entries.html` | `pagination.md` | `dict "page" . "label" "Post navigation" "noun" "Post"`. Previous and next in the page's section, oldest first. |
| `pagination-pages.html` | `pagination.md` | `dict "pager" $pager "label" "Writing pages"`. Pages of a paginated list; nothing when it fits on one page. |
| `back-link.html` | `button-and-link.md` | `dict "href" "…" "label" "All work"`. |
| `section-heading.html` | `heading-anchor.md` | `dict "id" "work" "title" "Selected work"`, inside a `<section id="work" aria-labelledby="work-title">`. |
| `tokens.html` | | Call with `partialCached "motifspec/tokens.html" "tokens"`. A map from token name to its entry in `dist/tokens.json`, for templates that need a token's value at build time. |
| `h2s.html` | | A page. Its h2 headings with their h3 children; used by the article and the TOC. |

## Front matter the partials read

```yaml
title: Interactive WebGL globe
accession: LM-W-001
date: 2026-03-14
summary: A React app that renders live routes on a 3D globe.
role: Sole engineer
stack: [React, WebGL, Vite]
status: live        # live | building | archived
tags: [react, webgl, a11y]
hero: { src: hero.png, alt: "…", caption: "…" }
```

| Field | Used by | Notes |
|---|---|---|
| `summary` | cards, rows | The lede and the card or row summary. |
| `tags` | tags, filters | At most five, lowercase kebab-case; cards show three. |
| `accession` | accession label, cards, rows | The catalogue number. The site checks its own numbering scheme. |
| `status` | accession label, cards | `live`, `building` or `archived`. |
| `role`, `stack` | accession label | `stack` is a list. |
| `hero` | cards, figures | `src`, `alt` and `caption`. With a hero, the hero is Plate 1 and figures in the content start at Plate 2. |
| `thumb` | cards | Optional SVG for the card instead of the cropped hero, for line drawings whose strokes must stay one pixel wide. |

## Render hooks

These apply to all Markdown content once the module is imported.

| Hook | Markdown | Doc |
|---|---|---|
| `render-heading.html` | Headings get ids; h2s get a `#` anchor. | `heading-anchor.md` |
| `render-image.html` | A standalone image is a numbered figure: `![alt](file.png "caption")`, image in the page bundle, alt and caption required. `{width="prose"}` on the next line keeps it to the text measure. Inline images stay plain. | `figure.md` |
| `render-table.html` | `{caption="Title \| subtitle"}` on the line after a table is required. Numeric columns align right; more than four columns break out. | `data-table.md` |
| `render-codeblock.html` | Header bar with language, optional `{file="path"}` and copy button. Breaks out when a line is longer than the prose measure. | `code-block.md` |
| `render-blockquote.html` | `> [!NOTE]`, `[!TIP]`, `[!WARNING]` and `[!CAUTION]` become callouts. A quotation must end with a line `— Name \| Source title`. | `callout.md`, `prose.md` |
| `render-link.html` | Internal links are resolved, and a broken one fails the build. External links get the outward arrow. | `icon.md` |

## Checking a site

Run `scripts/check.mjs` from the pinned module, so the site is checked against the release it uses. `hugo config mounts` prints one JSON object per module; MotifSpec's is the one that mounts `assets/motifspec` (under a local `HUGO_MODULE_REPLACEMENTS` too), and its `dir` is where the module is:

```js
// scripts/audit.mjs in the site
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const mounts = execFileSync('hugo', ['config', 'mounts'], { encoding: 'utf8' });
const motifspec = mounts.split(/\n(?=\{)/).map((m) => JSON.parse(m)).find((m) => m.mounts?.some((x) => x.target === 'assets/motifspec'));
execFileSync('node', [join(motifspec.dir, 'scripts', 'check.mjs'), '.'], { stdio: 'inherit' });
```

It checks `layouts/` and `content/` for what the README's Commands section lists. In GitHub Actions each problem is also an annotation on the pull request; `--json` prints the problems as JSON. In CI, give the step the same `HUGO_CACHEDIR` and `HUGO_MODULE_PROXY` as the build, because `hugo config mounts` downloads the module if it isn't cached.

## Overriding

A file in the site at the same path wins over the module's. Override a partial only to change content, never markup or classes. If a component needs to change, change it here and release it, so every site gets the fix.
