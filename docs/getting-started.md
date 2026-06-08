---
title: Getting started
sidebar:
  order: 10
---

# Getting started

Center on Reveal is an Obsidian community plugin that centers and highlights the active file after
it is revealed in the file explorer.

## Requirements

- Obsidian 1.7.2 or newer.
- Bun 1.3.14, as pinned in `package.json`.

## Install dependencies

```bash
bun install
```

## Develop

```bash
bun run dev
```

This starts esbuild in watch mode and writes the bundled plugin entry to `main.js`.

## Build

```bash
bun run build:bundle
```

Release assets are `manifest.json` and `main.js`. There is no `styles.css` in v0.1.0.

## Test in Obsidian

Copy `manifest.json` and `main.js` into:

```text
<vault>/.obsidian/plugins/center-on-reveal/
```

Reload Obsidian and enable **Center on Reveal** under **Settings → Community plugins**.

## Verify locally

```bash
bun test
bun run lint
bun run unused
bun run build:bundle
```
