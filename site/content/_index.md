---
title: MotifSpec
eyebrow: An experiment by Liam Marshall
statement: A design system an AI assistant can follow, one layer at a time.
description: An experiment in turning a brand kit into tokens and layered rules, served to AI coding assistants through an MCP server. The colours, type and contours are an example brand, ready to swap for a real one.
---

The longer a single rules file grows, the more an assistant has to hold at once, and the less of it it follows. MotifSpec splits a brand's rules into layers, so an assistant asks for the layout it is building, the components that layout uses and the tokens they name, and nothing more.

### Rules in layers, not one long file

Principles come first, then a layout, then each component's rules, then the tokens it names. The MCP server serves each layer on request, so an assistant's context holds the rules for the task in front of it. The aim is better instruction compliance than one monolithic `AGENTS.md`, in fewer tokens.

### Written once

<blockquote><p>Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.</p><footer>Andy Hunt and Dave Thomas <span class="cx-sep" aria-hidden="true">|</span> <cite>The Pragmatic Programmer</cite></footer></blockquote>

Each decision lives in one file in the repository. The CSS, these pages, the token and icon references, the npm package and the MCP server are all generated from it, so a changed value shows everywhere on the next build, and nothing has to be kept in step by hand.

### Checked every time

Every change is validated before it merges: contrast in both themes, naming, and the docs against the code. The checker holds each project to the release it pins, so a raw colour or an invented class is caught before it ships.

### Released by CI

Merging a new version tags it, publishes the npm package, deploys the MCP server and rebuilds this site. Each project moves to the new version when it is ready.
