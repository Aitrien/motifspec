---
name: status
status: stable
layouts: [shared]
tokens:
  - border.width.emphasis
  - color.status.danger.text
  - color.status.info.text
  - color.status.success.text
  - color.status.warning.text
  - color.text.muted
  - font.family.mono
  - font.line-height.ui
  - font.size.label
  - font.tracking.label
  - radius.round
  - space.inline.xs
  - space.inset.sm
---

# Status

A short mono label with a dot that names a state: online, degraded, down, live, archived.

## When to use

- Beside something whose state changes and matters: a service, a node, a build, a project.
- In a table's state column (`td.is-state`), a card's meta line, an event in a feed.
- Wherever the state needs to be scanned at a glance, with the word carrying the meaning and the colour repeating it.

## When not to use

- For a topic or technology; that is a tag (`tag.md`).
- For a message the reader must read in full; that is a callout (`callout.md`).
- As the only sign of a problem on a page. A problem that needs action also gets a callout.

## Markup

```html {preview=true}
<span class="cx-status cx-status--success">Online</span>
<span class="cx-status cx-status--warning">Degraded</span>
<span class="cx-status cx-status--danger">Down</span>
<span class="cx-status cx-status--info">Updating</span>
<span class="cx-status cx-status--muted">Scheduled</span>
```

<!-- caption: Status tones -->
| Tone | For | Example words |
|---|---|---|
| `--success` | Working, passing, done | Online, Running, Passed, Done |
| `--warning` | Needs attention soon, or in progress | Degraded, Restarting, High, Building |
| `--danger` | Failed or stopped | Down, Offline, Failed |
| `--info` | Neutral and informative | Updating, Update, New |
| `--muted` | Not active: waiting, paused or finished with | Scheduled, Paused, Archived |

A portfolio's project statuses are named variants of these: `cx-status--live` (success), `--building` (warning) and `--archived` (muted). Use them on cards and accession labels (`accession-label.md`).

## Do

- Write the state as a word, always. The dot and colour repeat it.
- Keep it to one or two words, in the reader's terms ("Down", not "HTTP 503").
- Use the same word for the same state everywhere on a page: in the navigation, the table and the feed.

## Don't

- Don't use a tone for decoration or to mean something else, such as a category. Status colours are reserved for status.
- Don't pick a tone by how a word sounds; pick it by what the reader should do.
- Don't animate the dot to draw attention.

## Accessibility

- The word is the text, so the state reads without colour. The dot is a CSS pseudo-element and isn't announced.
- `--muted` draws a ring instead of a solid dot, so it differs in shape as well as colour.
- Pairs: each tone's `color.status.*.text` on `color.surface.base`, `color.surface.raised` and `color.surface.hover` (4.5:1); `color.text.muted` on the same surfaces (4.5:1).
- A status that changes while the page is open isn't a live region on its own. Announce changes once, as `docs/layouts/dashboard.md` (Live data) says.
