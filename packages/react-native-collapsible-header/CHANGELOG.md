# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.18.0](https://github.com/rnw-community/rnw-community/compare/v2.17.3...v2.18.0) (2026-08-31)

### Features

- **react-native-collapsible-header:** opt-in native scroll offset sync ([#628](https://github.com/rnw-community/rnw-community/issues/628)) ([27fc1b6](https://github.com/rnw-community/rnw-community/commit/27fc1b6254450e315ac992e342a4d4220bdef3c3))

## [2.17.3](https://github.com/rnw-community/rnw-community/compare/v2.17.2...v2.17.3) (2026-08-29)

### Bug Fixes

- collapsible header safe-area layout, accessibility handoff, and shell hit testing ([#620](https://github.com/rnw-community/rnw-community/issues/620)) ([ac84c8c](https://github.com/rnw-community/rnw-community/commit/ac84c8c20b881d098479121e85f45cad76eae6fa)), closes [#619](https://github.com/rnw-community/rnw-community/issues/619) [#618](https://github.com/rnw-community/rnw-community/issues/618) [#621](https://github.com/rnw-community/rnw-community/issues/621)

## [2.15.1](https://github.com/rnw-community/rnw-community/compare/v2.15.0...v2.15.1) (2026-08-26)

### Bug Fixes

- **react-native-collapsible-header:** stop active title layer swallowing touches with box-none ([#610](https://github.com/rnw-community/rnw-community/issues/610)) ([0628e62](https://github.com/rnw-community/rnw-community/commit/0628e6243f0417e22f3b26931d64de86a1d53f55)), closes [#606](https://github.com/rnw-community/rnw-community/issues/606)

# [2.15.0](https://github.com/rnw-community/rnw-community/compare/v2.14.1...v2.15.0) (2026-08-26)

**Note:** Version bump only for package @rnw-community/react-native-collapsible-header

# [2.14.0](https://github.com/rnw-community/rnw-community/compare/v2.13.0...v2.14.0) (2026-08-18)

### Features

- **react-native-collapsible-header:** reduced-motion-aware snap and generic scrollable support ([1a81d93](https://github.com/rnw-community/rnw-community/commit/1a81d936f581ae3aa8fd2e8c4900ee5b3c48d0bc))

# [2.13.0](https://github.com/rnw-community/rnw-community/compare/v2.12.13...v2.13.0) (2026-08-18)

### Features

- **react-native-collapsible-header:** add composable animated header ([#545](https://github.com/rnw-community/rnw-community/issues/545)) ([8890ae3](https://github.com/rnw-community/rnw-community/commit/8890ae3c45fe492f93e0779d1cf62a83ba8a34f9)), closes [#579](https://github.com/rnw-community/rnw-community/issues/579) [vitalyiegorov/tart-runner-fleet#236](https://github.com/vitalyiegorov/tart-runner-fleet/issues/236) [rnw-community#579](https://github.com/rnw-community/issues/579)

## Unreleased

### Features

- add a generic Reanimated collapsible header with caller-owned content slots
- add persistent header content, non-zero collapse starts, and normalized motion configuration
- validate geometry and motion options while preserving the original animation defaults when optional props are omitted
