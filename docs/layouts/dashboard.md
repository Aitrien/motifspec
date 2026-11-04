# Dashboard layout

For tools and admin screens: an overview of systems, lists of things to act on, settings. Declare it with `layout = "dashboard"` (see `README.md`, Layouts).

## Status

In progress. The dashboard's own components arrive in later releases, so this file says what exists now and what doesn't.

- **Available now:** every shared component, including buttons, callouts, data tables, code blocks, tags, tooltips and icons.
- **Not available yet:** the app shell, side navigation, panels, stat tiles, meters, sparklines and charts, resource cards, the facts list, the event feed, the segmented control, compact buttons, form controls and the dialog.

Don't write classes for parts that aren't available. The checker fails on any `cx-` class MotifSpec doesn't define. Build what you can from the shared components, and say which parts MotifSpec doesn't have yet.

## Shell

Planned: a side navigation column (wordmark, grouped links, the theme toggle and a context line at its foot) beside the main region. Below `size.breakpoint.md`, the side navigation becomes a bar with a Menu disclosure that ships closed. Until it ships, use the site header and footer.

## Page templates

| Template | Order | Dominant | Secondary |
|---|---|---|---|
| **Overview** | Page head (title, when the readings were last updated, page-wide controls) → alerts as callouts → headline figures → the main column and a side column of sections | Alerts and headline figures | Detail sections |
| **List** | Page head → filters → a data table with row actions → pagination | The table | Filters |
| **Detail** | Page head with the item's status → its facts → its readings → related lists | Status and readings | Related lists |
| **Form** | Page head → grouped fields → actions at the end of the form | The fields | Help text |
| **Empty and error** | Page head → what's missing or what failed, and what to do next | The message | Links back |

## Components

Every shared component, plus the components whose doc lists `dashboard` under `layouts:`. Portfolio parts (catalogue numbers, accession labels, project cards, post rows, plates) don't belong on a dashboard.

## Decoration

- The backdrop fills the background of the main area, behind the content, for now; review this once a real dashboard has been used.
- No ornaments.

## Headings

- One `<h1>` per page: the page title.
- Section headings are `<h2>` with an id. On dashboard sections they take no heading anchor: sections are places on a screen, not parts of an article.

## Live data

MotifSpec doesn't fetch data; where an app gets its readings is the project's decision. How readings appear:

- Readings that update on a schedule aren't live regions, so a screen reader isn't interrupted on every update. New alerts and state changes are announced once, through one polite live region (`role="status"`) per page.
- The page says when its readings were last updated, as a `<time>`. A source that has gone quiet says so ("No readings since 13:58"); old numbers are never shown as current.
- Values change in place, with no counting animation and nothing flashing.
- A section whose source fails says so and when it last worked; the rest of the page keeps working.
- Recommended: the page requests readings only from its own backend, on the same origin, and the backend queries each service. That keeps API keys off the browser and gives one place to notice a source that has stopped.

## Choosing a stack

| The project | Use |
|---|---|
| Already has a stack | Keep it. MotifSpec adapts to the project, not the reverse. |
| A dashboard with live data or a lot of interaction (most dashboards) | React, or the app's own framework, with `@aitrien/motifspec` from npm and the components' markup. |
| A dashboard of reports that can be rebuilt on a schedule | Hugo with the module. |
