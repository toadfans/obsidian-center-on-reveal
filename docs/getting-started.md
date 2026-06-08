---
title: Getting started
sidebar:
  order: 10
---

# Getting started

Obplugin is a starter template for building an Obsidian community plugin with Bun, esbuild,
TypeScript, tests, linting, release automation, and optional documentation publishing.

## Install

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
bun run build
```

The build bundles `src/main.ts` into `main.js` and then runs the local Obsidian sync script. Use
`bun run install:vault` when you want the script to install the built files into a configured vault.

## Adapt the template

1. Update `manifest.json` with the final plugin ID, name, description, author, and minimum Obsidian
   version.
2. Update `package.json` to use the same package name and version.
3. Replace the sample commands, settings, and modal in `src/`.
4. Replace `assets/logo.svg`, `assets/favicon.svg`, and the docs in this directory.
5. Keep `main.ts` focused on plugin lifecycle and move feature logic into smaller modules.
