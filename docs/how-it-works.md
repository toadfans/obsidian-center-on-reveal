---
title: How it works
sidebar:
  order: 20
---

# How it works

## What Obsidian already does

Obsidian's file explorer has a built-in auto reveal mode. When the active file changes, Obsidian
expands parent folders and scrolls the active row into view without moving editor focus.

Center on Reveal keeps that built-in behavior and only adjusts the final presentation.

## Runtime model

`src/main.ts` only wires the plugin lifecycle. `src/center-on-reveal.ts` contains the reveal,
centering, and flash logic.

On layout ready, the plugin finds the first `file-explorer` leaf, loads it if it is deferred, calls
the internal `setAutoReveal(true)` method, then calls `revealActiveFile()` when available.

On every `file-open` event, the plugin waits until the active file row is rendered, centers it inside
`.nav-files-container`, and applies Obsidian's built-in `is-flashing` class.

## Centering

The plugin compares the scroller and active row positions with `getBoundingClientRect()`, then updates
`scrollTop` so the row midpoint aligns with the file explorer viewport midpoint.

If the row is not rendered yet, the plugin retries for a few animation frames and then stops.

## Highlighting

The plugin reuses Obsidian's `is-flashing` class. It keeps one timeout, clears the previous flash when
the active row changes, and forces a reflow only when the same row is flashed again.

## Boundaries

The plugin does not implement its own file tree traversal. Obsidian remains responsible for finding
the active file, expanding parent folders, and rendering the row.

The plugin has no settings, commands, custom CSS, network calls, or telemetry in v0.1.0.
