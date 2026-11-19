---
name: date-picker
status: stable
layouts: [shared]
group: forms
tokens:
  - border.focus.width
  - border.width.hairline
  - color.accent.border
  - color.border.strong
  - color.border.subtle
  - color.focus.ring
  - color.surface.hover
  - color.surface.raised
  - color.surface.selected
  - color.text.accent
  - color.text.muted
  - color.text.primary
  - color.text.secondary
  - font.family.mono
  - font.size.label
  - font.size.small
  - font.tracking.label
  - font.weight.strong
  - font.weight.ui
  - motion.duration.fast
  - motion.easing.standard
  - radius.pill
  - size.target.control
  - size.target.touch
  - space.inline.sm
  - space.inline.xs
  - space.inset.sm
  - space.inset.xs
---

# Date picker

A date field with a button that opens a calendar, where the month and the year can each be picked from a grid.

## When to use

- When the date matters in relation to the days around it, such as a weekday for maintenance.
- When the reader may need to go a long way back, as for a date of birth: the year grid goes twenty years at a time.
- Where the calendar should look like the rest of the page.

## When not to use

- When the browser's own date field is enough: `<input type="date">` in a field (`field.md`) gives the reader's own calendar, in their language and date order, and the system's date wheel on a phone. It's the better choice in most forms.
- For a range of dates, or to grey out dates that can't be chosen; this calendar doesn't do either yet.
- For a time of day.

## Markup

```html {preview=true}
<div class="cx-field">
  <div class="cx-field__box cx-field__box--date" data-date-picker>
    <input class="cx-field__control cx-field__control--mono" id="maintenance-date" placeholder="DD/MM/YYYY" inputmode="numeric" autocomplete="off" value="12/12/2026" aria-describedby="maintenance-date-hint">
    <label class="cx-field__label" for="maintenance-date">Maintenance date</label>
    <button class="cx-date__button" type="button" aria-label="Choose a maintenance date" aria-haspopup="dialog" hidden><svg class="cx-icon" aria-hidden="true" focusable="false"><use href="#cx-icon-calendar"></use></svg></button>
  </div>
  <p class="cx-field__hint" id="maintenance-date-hint">Day, month and year, like 12/12/2026.</p>
</div>
```

The browser's own date field is a field with `type="date"`:

```html {preview=true}
<div class="cx-field">
  <div class="cx-field__box">
    <input class="cx-field__control cx-field__control--mono" id="backup-date" type="date" value="2026-12-12">
    <label class="cx-field__label" for="backup-date">Backup date</label>
  </div>
</div>
```

## Do

- Keep the text field: typing a date is often quicker than finding it.
- Say the format in the hint ("Day, month and year, like 12/12/2026"). The calendar reads and writes day first.
- Name the button for what it chooses ("Choose a date of birth").

## Don't

- Don't make the field read-only so that the calendar is the only way in.
- Don't put two date pickers next to each other for a range. Use two fields with hints until a range picker exists.

## Accessibility

- The button is `hidden` until `codex.js` shows it, so without script the field still takes a typed date.
- The calendar is a non-modal dialog named by its button. Focus moves to the chosen date (or today) when it opens, and back to the button when it closes.
- The days, months and years are each a grid of buttons with one tab stop. Each day is named in full ("Saturday 12 December 2026"), today has `aria-current="date"`, the chosen date `aria-pressed="true"`, and the shown month is read out when it changes.
- Days are `size.target.touch` square, and the calendar is a fixed size, so its arrows never move under the pointer.
- Pairs: `color.text.primary` on `color.surface.selected` (the chosen date) and on `color.surface.raised`; `color.border.strong` outlines today.

## Behaviour

`dist/codex.js` does this; an app that renders the date picker itself does the same.

- **Opening:** the button opens one calendar for the page (a `popover`), on the field's date if it can read one, or today. Pressing it again closes it.
- **Placing:** under the field, or above it when there's more room there; left-aligned with it, kept inside the window, and in page coordinates, so it scrolls with the field.
- **Days:** the arrow keys move a day or a week, Page Up and Page Down a month, Home and End to the ends of the week (Monday to Sunday). Enter, Space or a click chooses the date, writes it as DD/MM/YYYY, fires `input` and `change` on the field, and closes the calendar.
- **Months and years:** the month and year at the top open a grid of the year's months, or of twenty years. The arrows at the sides then step a year, or twenty years. Choosing a year opens its months; choosing a month opens its days.
- **Closing:** Escape, a click outside, Close, or choosing a date. Today moves back to today.

## Specimens

None: the calendar opens from the field, so its page shows it working.
