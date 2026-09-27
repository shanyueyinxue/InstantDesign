# Changelog

All notable changes to InstantDesign are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased] - 2026-09-27

### Breaking Changes

- Renamed method: `editor.reLoadFromJSON()` → `editor.reloadFromJSON()`
- Renamed method: `editor.reLoad()` → `editor.reload()`
- Renamed events: `loadJSONBefore` / `loadJSONAfter` → `loadBefore` / `loadAfter`

### Behavior Changes

- `editor.reload(frame)` now also emits the `loadBefore` / `loadAfter` events

### Migration Guide

- Replace `editor.reLoadFromJSON(json)` with `editor.reloadFromJSON(json)`
- Replace `editor.reLoad(frame)` with `editor.reload(frame)`
- Replace `editor.eventBus.on(editor.Events.loadJSONAfter, fn)` with `editor.eventBus.on(editor.Events.loadAfter, fn)`
- No backward-compatible aliases are kept for the old names.
