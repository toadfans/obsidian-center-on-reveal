---
title: How it works
sidebar:
  order: 20
---

# How it works

## Project layout

- `src/main.ts` contains plugin lifecycle wiring, command registration, and settings tab setup.
- `src/settings.ts` contains persisted settings, defaults, and the settings UI.
- `src/changelog.ts` parses `CHANGELOG.md` for release notes.
- `src/release-notes-modal.ts` renders release notes inside Obsidian.
- `scripts/` contains local release and vault-sync helpers.

## Runtime model

Obsidian loads `main.js` from the plugin folder. During development, esbuild bundles the TypeScript
source and all runtime dependencies into that single file. Release assets are `main.js`,
`manifest.json`, and `styles.css`.

## Settings model

The template uses `loadData()` and `saveData()` for persisted plugin settings. It exposes
`getSettingDefinitions()` for newer Obsidian versions and keeps a `display()` fallback for older
versions, so plugins generated from the template can support both APIs.

## Release notes

The plugin stores the last version that displayed release notes in plugin settings. On layout ready,
it compares that value to `manifest.version`; if the installed version is newer and release notes are
enabled, it opens the release notes modal.

## Documentation

The GitHub Actions workflow can build this `docs/` directory through Starflow on `workflow_dispatch`
or on pushes to `main`. Update the workflow `base` value when the repository name changes.
