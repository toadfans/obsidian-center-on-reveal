---
title: FAQ
sidebar:
  order: 40
---

# FAQ

### Why does this template use Bun?

The repository pins Bun in `package.json` and uses Bun scripts for install, build, lint, test, and
format commands. Keep that package manager unless you also replace the scripts and CI workflow.

### Why does the template use esbuild?

Obsidian community plugins load a single JavaScript entry file. esbuild keeps the build small and
fast while bundling dependencies into `main.js`.

### Which files are release assets?

Attach `manifest.json`, `main.js`, and `styles.css` to each GitHub release. `styles.css` is optional
only if the plugin has no CSS.

### Should generated files be committed?

Do not commit `node_modules/` or generated build output unless the project explicitly changes that
policy. Community plugin releases should publish generated assets through GitHub releases.

### How do I test inside Obsidian?

Build the plugin, copy `main.js`, `manifest.json`, and `styles.css` into
`<vault>/.obsidian/plugins/<plugin-id>/`, reload Obsidian, and enable the plugin under
**Settings -> Community plugins**.
