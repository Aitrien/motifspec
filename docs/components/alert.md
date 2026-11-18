---
name: alert
status: stable
layouts: [shared]
group: messages
tokens:
  - border.focus.offset
  - border.focus.width
  - border.width.emphasis
  - border.width.hairline
  - color.focus.ring
  - color.status.danger.border
  - color.status.danger.surface
  - color.status.danger.text
  - color.status.info.border
  - color.status.info.surface
  - color.status.info.text
  - color.status.success.border
  - color.status.success.surface
  - color.status.success.text
  - color.status.warning.border
  - color.status.warning.surface
  - color.status.warning.text
  - color.surface.hover
  - color.text.primary
  - font.line-height.ui
  - font.weight.strong
  - radius.control
  - size.icon.md
  - size.measure.prose
  - size.target.min
  - space.inline.md
  - space.inset.md
  - space.inset.xs
  - space.stack.lg
  - space.stack.xs
---

# Alert

A message about the page or the system, at the top of the main column: an outage, a change that affects the reader, the result of a form that failed.

## When to use

- For something the reader should know before they use the page: a deprecation, planned maintenance, an incident, readings that have stopped.
- For the result of an action that the reader has to do something about, such as a form that couldn't be sent. It stays until they deal with it or dismiss it.
- On a dashboard's overview, for each alert in its sources (`docs/layouts/dashboard.md`).

## When not to use

- For a note about the text around it; that's a callout (`callout.md`), inside the article.
- To confirm that something worked and needs nothing more; that's a toast (`toast.md`).
- For a state shown beside the thing it describes; that's a status (`status.md`).

## Markup

```html {preview=true}
<div class="cx-alert cx-alert--warning">
  <svg class="cx-icon cx-alert__icon" aria-hidden="true" focusable="false"><use href="#cx-icon-warning"></use></svg>
  <div class="cx-alert__body">
    <p class="cx-alert__title">Planned maintenance</p>
    <p>Readings pause on Saturday 12 December from 02:00 to 03:00 NZDT. <a class="cx-link" href="/guide/">What stays available</a></p>
  </div>
  <button class="cx-alert__dismiss" type="button" data-alert-dismiss aria-label="Dismiss" hidden><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
</div>
```

<!-- caption: Alert kinds -->
| Kind | Class | Icon | For |
|---|---|---|---|
| Info | `cx-alert` | `note` | Something the reader should know, with nothing wrong |
| Success | `cx-alert--success` | `check` | A result that stays on the page, such as an import that finished with a report to read |
| Warning | `cx-alert--warning` | `warning` | Something that will affect the reader soon, or works only in part |
| Danger | `cx-alert--danger` | `danger` | Something has failed or stopped, and the reader may need to act |

In Hugo, `motifspec/alert.html` writes one (`docs/hugo.md`): `dict "kind" "warning" "title" "Planned maintenance" "text" "…" "dismiss" "maintenance-1212"`.

## Do

- Put it at the top of the main column, under the page head, so it's read before the content it affects.
- Say what happened and what the reader can do, in one or two sentences. A title helps when there are two.
- Link to more, or to the next step, with a text link (`button-and-link.md`).
- Let the reader dismiss an alert that's for information. Give the dismiss button a key when the alert shows on every page, so it stays dismissed.
- Take it away when the cause has gone: the incident is over, the form has been sent.

## Don't

- Don't show more than one or two on a page. If there are more, the page has a bigger problem than the alerts can describe.
- Don't let a danger alert about something unresolved be dismissed.
- Don't use one for marketing or announcements; that isn't a message about the page.
- Don't pick a kind for its colour. Pick it by what the reader should do.

## Accessibility

- An alert in the page when it loads is read in order, with the page; it has no live role, so it isn't announced over the page's title.
- An alert added after the page has loaded is announced once: give it `role="status"`, or `role="alert"` for a danger alert the reader must act on now.
- The kind is in the words (the title or the first sentence) as well as the icon and colour. The icon is hidden from assistive technology.
- The dismiss button is named "Dismiss" and is at least `size.target.min`. Dismissing moves focus to the main column, so it isn't lost.
- Pairs: `color.text.primary` on each `color.status.*.surface`; the icon is that kind's `color.status.*.text`, the rule its `color.status.*.border`.

## Behaviour

`dist/codex.js` does this; an app that renders alerts itself does the same.

- **Showing the button:** each `[data-alert-dismiss]` in an alert is `hidden` until the script shows it, so there's no button that does nothing without script.
- **Dismissing:** the button hides its alert and moves focus to `#main`. With a key, `data-alert-dismiss="maintenance-1212"`, it stores `cx-alert:maintenance-1212` in `localStorage`, and the alert is hidden on later pages until the key changes. Storage that's blocked is ignored.
- **Added later:** the script listens on the document, so an alert added after the page loads dismisses the same way.

## Specimens

```html {specimen="Info, dismissible" wide=true}
<div class="cx-alert">
  <svg class="cx-icon cx-alert__icon" aria-hidden="true" focusable="false"><use href="#cx-icon-note"></use></svg>
  <div class="cx-alert__body">
    <p>Version 2.0.0 removes the deprecated tokens. <a class="cx-link" href="/reference/changelog/">See what changes</a></p>
  </div>
  <button class="cx-alert__dismiss" type="button" aria-label="Dismiss"><svg class="cx-icon cx-icon--sm" aria-hidden="true" focusable="false"><use href="#cx-icon-close"></use></svg></button>
</div>
```

```html {specimen="Success, warning, danger" wide=true}
<div class="cx-alert cx-alert--success">
  <svg class="cx-icon cx-alert__icon" aria-hidden="true" focusable="false"><use href="#cx-icon-check"></use></svg>
  <div class="cx-alert__body"><p>Imported 214 readings. 3 were skipped.</p></div>
</div>
<div class="cx-alert cx-alert--warning">
  <svg class="cx-icon cx-alert__icon" aria-hidden="true" focusable="false"><use href="#cx-icon-warning"></use></svg>
  <div class="cx-alert__body"><p>No readings from the rain gauge since 13:58.</p></div>
</div>
<div class="cx-alert cx-alert--danger">
  <svg class="cx-icon cx-alert__icon" aria-hidden="true" focusable="false"><use href="#cx-icon-danger"></use></svg>
  <div class="cx-alert__body"><p class="cx-alert__title">Storage is down</p><p>New readings are queued and will be saved when it's back.</p></div>
</div>
```
