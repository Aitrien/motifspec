# AGENTS.md

MotifSpec is a design system that other projects install at a pinned version, so a change here reaches every site once it is released. Before changing anything, read:

- `README.md`: what's in the repo, the commands, and the rules for AI assistants, which apply here too.
- `CONVENTIONS.md`: token format, naming, versioning and releases.

## Where a change goes

- A token: `tokens/*.json`, with a `$description` that says when to use it. A foreground colour declares the surfaces it may sit on in `codex.pairsWith`.
- A component is three files kept in step: its CSS in `css/components.css` (tokens only), its rules and markup in `docs/components/<name>.md` (from `_template.md`), and its Hugo partial in `layouts/_partials/motifspec/` (listed in `docs/hugo.md`). The doc is the contract.
- Never edit `dist/` or a component doc's `tokens:` list by hand. `npm run build` writes them; commit what it writes.

## Before you finish

Run `npm run build`, `npm run audit`, `npm run release:check` and `npm run pack:check`. CI runs the same checks.

## Releasing

Anything consumers should get needs a version bump in `package.json` and a `CHANGELOG.md` entry; merging the PR releases it. Changes to tooling or repo docs alone don't bump. Never create or move a tag.
