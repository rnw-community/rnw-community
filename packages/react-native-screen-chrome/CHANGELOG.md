# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.3](https://github.com/rnw-community/rnw-community/compare/v3.0.2...v3.0.3) (2026-10-23)

### Bug Fixes

- **react-native-screen-chrome:** keep compact edge chrome continuous and sharp outside the band ([#733](https://github.com/rnw-community/rnw-community/issues/733)) ([7c0c21e](https://github.com/rnw-community/rnw-community/commit/7c0c21e45b75faf329be9aae7bdd231e8364e690))

## [3.0.2](https://github.com/rnw-community/rnw-community/compare/v3.0.1...v3.0.2) (2026-10-23)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

## [3.0.1](https://github.com/rnw-community/rnw-community/compare/v3.0.0...v3.0.1) (2026-10-23)

### Bug Fixes

- **react-native-screen-chrome:** fade edge blur into the background ([#731](https://github.com/rnw-community/rnw-community/issues/731)) ([d3ccf3e](https://github.com/rnw-community/rnw-community/commit/d3ccf3ed137a09a2f2e11684802cb39ab79c3dd9))

# [3.0.0](https://github.com/rnw-community/rnw-community/compare/v2.29.5...v3.0.0) (2026-10-22)

- feat(react-native-screen-chrome)!: ship native progressive edge blur (#730) ([1a04e76](https://github.com/rnw-community/rnw-community/commit/1a04e767d431ab26ae13b685960938ee2684dc77)), closes [#730](https://github.com/rnw-community/rnw-community/issues/730)

### BREAKING CHANGES

- removes the blurMethod and blurTarget props and the tint render prop, drops the expo-blur, expo-linear-gradient and masked-view peers, requires the expo peer (Expo Modules) and a native rebuild; Expo Go is not supported and blur intensity and geometry change. See Migrating to 3.0 in the readme.

## [2.29.5](https://github.com/rnw-community/rnw-community/compare/v2.29.4...v2.29.5) (2026-10-22)

### Bug Fixes

- **react-native-screen-chrome:** resolve the native edge fade on iOS and Android ([#728](https://github.com/rnw-community/rnw-community/issues/728)) ([ebc621e](https://github.com/rnw-community/rnw-community/commit/ebc621ee405ef8ad7c4784d7dfbddde538721ece)), closes [#546](https://github.com/rnw-community/rnw-community/issues/546) [#719](https://github.com/rnw-community/rnw-community/issues/719)

## [2.29.3](https://github.com/rnw-community/rnw-community/compare/v2.29.2...v2.29.3) (2026-10-20)

### Bug Fixes

- **react-native-screen-chrome:** render the web edge-fade blur as non-overlapping slices ([#725](https://github.com/rnw-community/rnw-community/issues/725)) ([1ecb93f](https://github.com/rnw-community/rnw-community/commit/1ecb93f711c03bb3b8c1d24d60c804d2e00c4de7))

## [2.29.2](https://github.com/rnw-community/rnw-community/compare/v2.29.1...v2.29.2) (2026-10-19)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

## [2.29.1](https://github.com/rnw-community/rnw-community/compare/v2.29.0...v2.29.1) (2026-10-19)

### Bug Fixes

- **react-native-screen-chrome:** render the native edge-fade blur outside the wash mask ([#722](https://github.com/rnw-community/rnw-community/issues/722)) ([e053833](https://github.com/rnw-community/rnw-community/commit/e0538332291c02d55b7e30e38ecd1aa29584c554)), closes [#640](https://github.com/rnw-community/rnw-community/issues/640)

# [2.29.0](https://github.com/rnw-community/rnw-community/compare/v2.28.3...v2.29.0) (2026-10-19)

### Bug Fixes

- **react-native-collapsible-header,react-native-screen-chrome:** resolve web files from dist ([#719](https://github.com/rnw-community/rnw-community/issues/719)) ([149da14](https://github.com/rnw-community/rnw-community/commit/149da14f1b40c268aeddf622f5daf10df368fc49))
- **react-native-collapsible-header:** check the reanimated peer floor in CI and narrow it to 4.1 ([#685](https://github.com/rnw-community/rnw-community/issues/685)) ([5da168e](https://github.com/rnw-community/rnw-community/commit/5da168ea9aa9eda13c681db444d19d1ce789acc1))
- **react-native-screen-chrome:** consumer padding shorthands win; add includeTopSafeArea ([#712](https://github.com/rnw-community/rnw-community/issues/712)) ([364c199](https://github.com/rnw-community/rnw-community/commit/364c199f9f52f989a4b858489ceb53a358aa90bb)), closes [#595](https://github.com/rnw-community/rnw-community/issues/595)
- **react-native-screen-chrome:** ramp the web edge-fade blur progressively toward the edge ([#718](https://github.com/rnw-community/rnw-community/issues/718)) ([cd9cf75](https://github.com/rnw-community/rnw-community/commit/cd9cf75ccc14a57cd3e95e40c90d56c56699b4a6)), closes [#709](https://github.com/rnw-community/rnw-community/issues/709)

### Features

- **react-native-screen-chrome:** export useBottomChromeHeightPublisher with a declared height ([#713](https://github.com/rnw-community/rnw-community/issues/713)) ([8a330a9](https://github.com/rnw-community/rnw-community/commit/8a330a99a774b4ec6c618920c9125ac93d428684)), closes [#595](https://github.com/rnw-community/rnw-community/issues/595)
- **react-native-screen-chrome:** external scrollY source and useScrollInterpolation ([#680](https://github.com/rnw-community/rnw-community/issues/680)) ([cbefadc](https://github.com/rnw-community/rnw-community/commit/cbefadc2b84f8588e29f2a20b3a052b640eda67f))
- **react-native-screen-chrome:** forward view props and add named row styles ([#703](https://github.com/rnw-community/rnw-community/issues/703)) ([17f1340](https://github.com/rnw-community/rnw-community/commit/17f13402d84f6eb32f5a4fcefdf54e5e65973933)), closes [#591](https://github.com/rnw-community/rnw-community/issues/591)
- **react-native-screen-chrome:** lay ScreenChromeHeader out in flow with a growing row ([#715](https://github.com/rnw-community/rnw-community/issues/715)) ([2eeb5d7](https://github.com/rnw-community/rnw-community/commit/2eeb5d79d118b8e8cb7107c5a4ab9ef42ef2a156)), closes [#595](https://github.com/rnw-community/rnw-community/issues/595) [#589](https://github.com/rnw-community/rnw-community/issues/589)
- **react-native-screen-chrome:** render edge fades without the optional native modules ([#708](https://github.com/rnw-community/rnw-community/issues/708)) ([ae4af4e](https://github.com/rnw-community/rnw-community/commit/ae4af4ebb2a8380b3dc745e117604dede39a613d)), closes [#591](https://github.com/rnw-community/rnw-community/issues/591)
- **react-native-screen-chrome:** stack ScreenChromeFooter above other bottom chrome ([#714](https://github.com/rnw-community/rnw-community/issues/714)) ([6bba5dd](https://github.com/rnw-community/rnw-community/commit/6bba5dd64bf685ad165e1fc1d0ae08efc5ca02b5)), closes [#595](https://github.com/rnw-community/rnw-community/issues/595)
- **react-native-screen-chrome:** system color scheme, freeze spec, Android blur warning ([#686](https://github.com/rnw-community/rnw-community/issues/686)) ([059c813](https://github.com/rnw-community/rnw-community/commit/059c813ecd4fa770610f88817ba7ddf17dc2cf10))

## [2.28.2](https://github.com/rnw-community/rnw-community/compare/v2.28.1...v2.28.2) (2026-10-16)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

# [2.28.0](https://github.com/rnw-community/rnw-community/compare/v2.27.0...v2.28.0) (2026-10-15)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

# [2.25.0](https://github.com/rnw-community/rnw-community/compare/v2.24.1...v2.25.0) (2026-10-15)

### Features

- **react-native-screen-chrome:** add ScreenChromeFooter and bottom chrome inset contract ([#668](https://github.com/rnw-community/rnw-community/issues/668)) ([b0dc9a0](https://github.com/rnw-community/rnw-community/commit/b0dc9a03e38f4617dbf888096e3ed4a56c687a60))

# [2.24.0](https://github.com/rnw-community/rnw-community/compare/v2.23.2...v2.24.0) (2026-10-15)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

## [2.23.2](https://github.com/rnw-community/rnw-community/compare/v2.23.1...v2.23.2) (2026-10-15)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

# [2.23.0](https://github.com/rnw-community/rnw-community/compare/v2.22.0...v2.23.0) (2026-10-15)

### Features

- **react-native-screen-chrome:** add useScreenChromeScrollProps for arbitrary scrollables ([#657](https://github.com/rnw-community/rnw-community/issues/657)) ([3821dc0](https://github.com/rnw-community/rnw-community/commit/3821dc0e8d89ea4571dd505a61c4ac2e23426412))

# [2.22.0](https://github.com/rnw-community/rnw-community/compare/v2.21.1...v2.22.0) (2026-10-15)

### Features

- **react-native-screen-chrome:** add start-aligned expanded title and header layout metrics ([#649](https://github.com/rnw-community/rnw-community/issues/649)) ([701cde5](https://github.com/rnw-community/rnw-community/commit/701cde5ff18d99e7dd94d4f4c1467357e0a4da8e))

## [2.21.1](https://github.com/rnw-community/rnw-community/compare/v2.21.0...v2.21.1) (2026-10-15)

### Bug Fixes

- **react-native-screen-chrome-example:** install expo modules in the bare example app ([#654](https://github.com/rnw-community/rnw-community/issues/654)) ([0a1f2d1](https://github.com/rnw-community/rnw-community/commit/0a1f2d12114e37aa9861f4bc6ee22f6ac651a207))

# [2.21.0](https://github.com/rnw-community/rnw-community/compare/v2.20.1...v2.21.0) (2026-10-15)

### Features

- **react-native-screen-chrome:** pluggable edge-fade band renderer and configurable backdrop ([#663](https://github.com/rnw-community/rnw-community/issues/663)) ([dcf32db](https://github.com/rnw-community/rnw-community/commit/dcf32db6f6b4ba7c8f196025c350afba7a6c9886))

## [2.20.1](https://github.com/rnw-community/rnw-community/compare/v2.20.0...v2.20.1) (2026-10-15)

### Bug Fixes

- **react-native-screen-chrome:** inset the iOS scroll indicator past the chrome ([#646](https://github.com/rnw-community/rnw-community/issues/646)) ([d925248](https://github.com/rnw-community/rnw-community/commit/d925248616a434ed67b18147f10acfbca1a84d52))

# [2.20.0](https://github.com/rnw-community/rnw-community/compare/v2.19.14...v2.20.0) (2026-10-15)

### Features

- **react-native-screen-chrome:** marker-based optional header slots and collapsed header height ([#650](https://github.com/rnw-community/rnw-community/issues/650)) ([01d7ed6](https://github.com/rnw-community/rnw-community/commit/01d7ed6cb9e9a5646567e0e43106c756660546db))

## [2.19.14](https://github.com/rnw-community/rnw-community/compare/v2.19.13...v2.19.14) (2026-10-15)

### Bug Fixes

- **react-native-screen-chrome:** let header slots pass through touches and raise peer floor ([#644](https://github.com/rnw-community/rnw-community/issues/644)) ([7c48e5f](https://github.com/rnw-community/rnw-community/commit/7c48e5f7ad66318167055264fc5494eecb1ebceb))

## [2.19.13](https://github.com/rnw-community/rnw-community/compare/v2.19.12...v2.19.13) (2026-10-15)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

## [2.19.8](https://github.com/rnw-community/rnw-community/compare/v2.19.7...v2.19.8) (2026-10-15)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

## [2.19.7](https://github.com/rnw-community/rnw-community/compare/v2.19.6...v2.19.7) (2026-10-15)

### Bug Fixes

- **react-native-collapsible-header,react-native-screen-chrome:** stop shipping specs in dist ([#652](https://github.com/rnw-community/rnw-community/issues/652)) ([cdf1bde](https://github.com/rnw-community/rnw-community/commit/cdf1bde7948496c8ae8bb5d990c912206d8d55ea))

## [2.19.1](https://github.com/rnw-community/rnw-community/compare/v2.19.0...v2.19.1) (2026-10-03)

### Bug Fixes

- **react-native-screen-chrome:** fade native edge bands through a gradient mask ([#640](https://github.com/rnw-community/rnw-community/issues/640)) ([11e308f](https://github.com/rnw-community/rnw-community/commit/11e308f4b4c4d4b14e65924f702536523a308a64))

# [2.19.0](https://github.com/rnw-community/rnw-community/compare/v2.18.0...v2.19.0) (2026-08-31)

### Features

- **react-native-screen-chrome:** additive content insets and consumer ref on the scroll view ([#627](https://github.com/rnw-community/rnw-community/issues/627)) ([07fc5bb](https://github.com/rnw-community/rnw-community/commit/07fc5bb615b3b9d223e24bd7cb137d37b5076008))

# [2.18.0](https://github.com/rnw-community/rnw-community/compare/v2.17.3...v2.18.0) (2026-08-31)

### Features

- **react-native-collapsible-header:** opt-in native scroll offset sync ([#628](https://github.com/rnw-community/rnw-community/issues/628)) ([27fc1b6](https://github.com/rnw-community/rnw-community/commit/27fc1b6254450e315ac992e342a4d4220bdef3c3))

## [2.17.3](https://github.com/rnw-community/rnw-community/compare/v2.17.2...v2.17.3) (2026-08-29)

### Bug Fixes

- collapsible header safe-area layout, accessibility handoff, and shell hit testing ([#620](https://github.com/rnw-community/rnw-community/issues/620)) ([ac84c8c](https://github.com/rnw-community/rnw-community/commit/ac84c8c20b881d098479121e85f45cad76eae6fa)), closes [#619](https://github.com/rnw-community/rnw-community/issues/619) [#618](https://github.com/rnw-community/rnw-community/issues/618) [#621](https://github.com/rnw-community/rnw-community/issues/621)

## [2.17.2](https://github.com/rnw-community/rnw-community/compare/v2.17.1...v2.17.2) (2026-08-28)

### Bug Fixes

- **react-native-screen-chrome:** preserve child ref cleanups in mergeRefs ([#617](https://github.com/rnw-community/rnw-community/issues/617)) ([53a5404](https://github.com/rnw-community/rnw-community/commit/53a54041852daf2d35335f007d7757f0dbd58069))

## [2.17.1](https://github.com/rnw-community/rnw-community/compare/v2.17.0...v2.17.1) (2026-08-27)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

# [2.17.0](https://github.com/rnw-community/rnw-community/compare/v2.16.0...v2.17.0) (2026-08-27)

### Features

- **react-native-screen-chrome:** export mergeRefs for custom scrollable wiring ([#615](https://github.com/rnw-community/rnw-community/issues/615)) ([9af5e2d](https://github.com/rnw-community/rnw-community/commit/9af5e2d0600a766827e2d69af4f7c85cc0361553))

# [2.16.0](https://github.com/rnw-community/rnw-community/compare/v2.15.3...v2.16.0) (2026-08-27)

### Features

- **react-native-screen-chrome:** forward per-layer content container styles ([#616](https://github.com/rnw-community/rnw-community/issues/616)) ([8c4fb38](https://github.com/rnw-community/rnw-community/commit/8c4fb38b69267f16cd2f9f980f7d94d050fa68cd))

## [2.15.1](https://github.com/rnw-community/rnw-community/compare/v2.15.0...v2.15.1) (2026-08-26)

**Note:** Version bump only for package @rnw-community/react-native-screen-chrome

# [2.15.0](https://github.com/rnw-community/rnw-community/compare/v2.14.1...v2.15.0) (2026-08-26)

### Features

- **react-native-screen-chrome:** add composable screen chrome ([#546](https://github.com/rnw-community/rnw-community/issues/546)) ([675c7a9](https://github.com/rnw-community/rnw-community/commit/675c7a91e865340b0715677223cbe05f0cfa665e)), closes [#545](https://github.com/rnw-community/rnw-community/issues/545)

## Unreleased

### Features

- add provider-owned scroll coordination, validated configuration, and optional collapse snapping
- add safe-area screen structure and native/web progressive edge fades
- add compound large/small title chrome with leading and trailing controls mounted once
