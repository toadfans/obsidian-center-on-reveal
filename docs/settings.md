---
title: Settings reference
sidebar:
  order: 30
---

# Settings reference

The template ships with two sample settings under **Settings -> Obsidian Center on Reveal**.

| Setting                                  | Default   | What it does                                                      |
| ---------------------------------------- | --------- | ----------------------------------------------------------------- |
| **Secret demo**                          | `default` | Demonstrates a persisted text setting.                            |
| **Show release notes after each update** | On        | Opens the release notes modal after upgrading to a newer version. |

## Adding settings

1. Add the property to `ObsidianCenterOnRevealPluginSettings`.
2. Add its default value to `DEFAULT_SETTINGS`.
3. Add a matching definition in `getSettingDefinitions()`.
4. Add the same control to `display()` if the plugin still supports older Obsidian versions.
5. Save changes through `this.plugin.saveSettings()`.
