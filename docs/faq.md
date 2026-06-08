---
title: FAQ
sidebar:
  order: 30
---

# FAQ

### Does this replace Obsidian's auto reveal?

No. It enables and reuses Obsidian's built-in file explorer auto reveal, then adjusts the final
scroll position.

### Why does it require Obsidian 1.7.2?

The plugin handles deferred sidebar views through `WorkspaceLeaf.isDeferred` and
`WorkspaceLeaf.loadIfDeferred()`, which are available from Obsidian 1.7.2.

### Does it have settings?

No. v0.1.0 always enables built-in auto reveal, centers the active row, and flashes it.

### Does it move focus away from the editor?

No. It uses the built-in auto reveal path, which reveals the active file without focusing the file
explorer.

### Why can a row briefly appear near the edge before centering?

Obsidian first scrolls the row into view with its own nearest-edge behavior. Center on Reveal then
adjusts the same row to the middle. On slower machines, that can be visible for a moment.

### Which files are release assets?

Attach `manifest.json` and `main.js` to each GitHub release. There is no `styles.css` in v0.1.0.
