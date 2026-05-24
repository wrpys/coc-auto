# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

coc-auto is an Auto.js-based automation tool for Clash of Clans that runs on Android devices. It automates login, resource raiding, building upgrades, and troop donations.

**Target Device:** Redmi Note8 Pro (1080x2340, DPI 440), Android 11+

## Development Environment

This project runs on Android via Auto.js Pro. There is no local build/test cycle - code must be deployed to an Android device with Auto.js installed.

**Deployment:**
- Import project into Auto.js Pro on device
- Or use Auto.js Pro's packager to build standalone APK

## Architecture

```
main.js           → Entry point, requests permissions, loads main_ui
ui/               → User interface modules (Auto.js UI system)
  main_ui.js      → Main screen with start/stop controls and feature toggles
  account_ui.js   → Account management (add/edit/delete accounts)
  upgrade_ui.js   → Building upgrade priority configuration
  settings_ui.js  → Runtime settings (thresholds, delays, schedule)
  floaty_ui.js    → Floating window overlay for in-game control
modules/
  common.js       → Shared utilities (click, swipe, delay, logging, color detection)
config/           → JSON configuration files (accounts, upgrade priority, settings)
```

**Data Flow:**
- UI modules load/save JSON configs via `files.read()`/`files.write()`
- `common.js` provides coordinate adaptation for different screen sizes (base: 1080x2340)
- All clicks include random delays to simulate human behavior (configurable in settings.json)

## Key Implementation Details

**Coordinate System:**
- All coordinates are written for 1080x2340 resolution
- `common.adaptCoord()` scales coordinates for other devices
- When adding new click targets, define coordinates relative to base resolution

**Delay System:**
- `clickDelay()`: 500-1500ms random delay before clicks
- `actionDelay()`: 1000-3000ms random delay between actions
- Configurable via settings.json `delay` section

**Screenshot & Color Detection:**
- `common.takeScreenshot()` requests permission once per session
- `common.checkColor(x, y, targetColor)` for detecting UI states
- `common.waitForColor()` polls until color matches or timeout

**Module Pattern:**
- All modules use `module.exports` for exports
- UI modules use `"ui";` directive at top for Auto.js UI mode
- Cross-module requires use absolute paths: `require("/modules/common.js")`

## Development Phases

- **Phase 1 (Complete):** UI framework, config management, common utilities
- **Phase 2 (Pending):** login.js, raid.js - core automation
- **Phase 3 (Pending):** upgrade.js, donate.js - extended features
- **Phase 4 (Pending):** Error handling, polish, APK packaging

## Configuration Files

| File | Purpose |
|------|---------|
| accounts.json | Account list with QQ numbers, priorities, run durations |
| upgrade_priority.json | Building type priorities with enable/disable flags |
| settings.json | Raid thresholds, donate config, delay ranges, schedule |

Config files are read at startup and saved when users modify settings in UI.

## Reference

Design spec: `docs/superpowers/specs/2026-05-24-coc-auto-design.md`
