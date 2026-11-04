---
name: rnw-community
description: The manual capture flows this repo still runs on Maestro, and their app ids
metadata:
    tags: rnw-community, react-native-collapsible-header, react-native-screen-chrome
---

## Where Maestro still runs

Tests and CI run on tester-army e2e (root `e2e/`, the iOS E2E and Android E2E workflows). Maestro only drives the manual
readme demo-GIF captures, run by hand and never in CI:

- `packages/react-native-collapsible-header-example/e2e/recording/`
- `packages/react-native-screen-chrome-example/e2e/recording/`, `e2e/manual/` and its `e2e/subflows/`

Each package's `e2e/readme.md` has the capture commands and the app ids.
