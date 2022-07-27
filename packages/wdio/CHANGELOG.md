# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.1](https://github.com/rnw-community/rnw-community/compare/v0.19.0...v0.19.1) (2022-07-27)


### Bug Fixes

* **wdio:** fixed SelectorText return type ([31ab88e](https://github.com/rnw-community/rnw-community/commit/31ab88e781ed4b23d322825a20f6bdd88db30a6b))





# [0.19.0](https://github.com/rnw-community/rnw-community/compare/v0.18.4...v0.19.0) (2022-07-27)


### Features

* **wdio:** changed additional getVisibleComponent methods semantic ([f08ac1b](https://github.com/rnw-community/rnw-community/commit/f08ac1b83be00673089170b662417d8efefbd1a9))





## [0.18.4](https://github.com/rnw-community/rnw-community/compare/v0.18.3...v0.18.4) (2022-07-27)


### Bug Fixes

* **wdio:** added additional getVisibleComponent methods ([2386479](https://github.com/rnw-community/rnw-community/commit/2386479ac1befdcea9e521682a91ac9fc0b4b332))





## [0.18.3](https://github.com/rnw-community/rnw-community/compare/v0.18.2...v0.18.3) (2022-07-27)


### Bug Fixes

* **wdio:** fixed getVisibleComponent, added unit tests ([d3eea6b](https://github.com/rnw-community/rnw-community/commit/d3eea6bf25f80c339aabdf926f947cc31fa792a3))





## [0.18.1](https://github.com/rnw-community/rnw-community/compare/v0.18.0...v0.18.1) (2022-07-26)


### Bug Fixes

* **wdio:** fixed wdio commands args and usage ([d701c7a](https://github.com/rnw-community/rnw-community/commit/d701c7af795d6f743a22ff14c29d0a79c607630c))





# [0.18.0](https://github.com/rnw-community/rnw-community/compare/v0.17.1...v0.18.0) (2022-07-26)

**Note:** Version bump only for package @rnw-community/wdio





## [0.17.1](https://github.com/rnw-community/rnw-community/compare/v0.17.0...v0.17.1) (2022-07-26)


### Bug Fixes

* **wdio:** added RootEl to VisibleComponent to follow same semantic ([9eb6b1a](https://github.com/rnw-community/rnw-community/commit/9eb6b1a5f396bde3123adb95160d7d1f3fdf3b03))





# [0.17.0](https://github.com/rnw-community/rnw-community/compare/v0.16.0...v0.17.0) (2022-07-26)


### Bug Fixes

* **wdio:** fixed rootKey search in selectors enum ([fd8ad5c](https://github.com/rnw-community/rnw-community/commit/fd8ad5c584ea5bc6b873c42177b299c4cc954fda))





# [0.16.0](https://github.com/rnw-community/rnw-community/compare/v0.15.0...v0.16.0) (2022-07-26)


### Bug Fixes

* **wdio:** fixed missing global browser object in swipe command ([9893d87](https://github.com/rnw-community/rnw-community/commit/9893d870ae86bb074c044b7e0bd6ee6b8793d8e2))


### Features

* **wdio:** added automatic root element search in passed selectors enum ([13c6c38](https://github.com/rnw-community/rnw-community/commit/13c6c3849cb7c7e9939609211c240dbc9a725703))





# [0.15.0](https://github.com/rnw-community/rnw-community/compare/v0.14.2...v0.15.0) (2022-07-26)


### Bug Fixes

* **wdio:** fixed missing global browser object for the commands ([ff704a9](https://github.com/rnw-community/rnw-community/commit/ff704a9e34d83efb7a26aafa93d1a9cd969a3f67))


### Features

* **wdio:** added getVisibleComponent util ([0577895](https://github.com/rnw-community/rnw-community/commit/0577895f13ed276c657cc5d403a8827ad8fa6cfb))





## [0.14.2](https://github.com/rnw-community/rnw-community/compare/v0.14.1...v0.14.2) (2022-07-26)


### Bug Fixes

* **wdio:** added build command to concat types ([9a4e4ee](https://github.com/rnw-community/rnw-community/commit/9a4e4ee9f8da81ae79de91287c46af5a79218af8))
* **wdio:** added build command to concat types ([eef0949](https://github.com/rnw-community/rnw-community/commit/eef09491a5e58dbfcd4270c828f59bf51256764b))





## [0.14.1](https://github.com/rnw-community/rnw-community/compare/v0.14.0...v0.14.1) (2022-07-26)


### Bug Fixes

* **wdio:** added open deep link command to Browser types ([5e5c631](https://github.com/rnw-community/rnw-community/commit/5e5c6313f13d6011d58cb79e9a9e85f1c2a31c8a))
* **wdio:** fixed commands export ([b3522ad](https://github.com/rnw-community/rnw-community/commit/b3522ade6777b0db8d45f2db2f078400d740648c))
* **wdio:** fixed slow input command signature ([94adc7f](https://github.com/rnw-community/rnw-community/commit/94adc7fd903ca06109f90b1ff63d78532b177e9e))





# [0.14.0](https://github.com/rnw-community/rnw-community/compare/v0.13.0...v0.14.0) (2022-07-26)


### Bug Fixes

* fixed project config ([6fbeb76](https://github.com/rnw-community/rnw-community/commit/6fbeb763a6b0bfdc53ffd0b8fac26e054d36545d))
* **wdio:** added defaultTestID arg to setPropTestID ([2ab61ac](https://github.com/rnw-community/rnw-community/commit/2ab61ac5f966f70c25896e3abb28df27cf01f416))
* **wdio:** made testId field optional to match RN types ([40208cf](https://github.com/rnw-community/rnw-community/commit/40208cf1937ffb5a66ecea8a83ba8f79aed4f671))


### Features

* improved page size by removing tsbuildinfo ([a7a7e5a](https://github.com/rnw-community/rnw-community/commit/a7a7e5aad6155681c481825365dba72a2acef831))





# [0.13.0](https://github.com/rnw-community/rnw-community/compare/v0.12.1...v0.13.0) (2022-07-26)


### Features

* **wdio:** added setPropTestID helper for React components ([#73](https://github.com/rnw-community/rnw-community/issues/73)) ([fe07a9a](https://github.com/rnw-community/rnw-community/commit/fe07a9ada0de47f41b48e92e33c41d786fae4cf9))





## [0.12.1](https://github.com/rnw-community/rnw-community/compare/v0.12.0...v0.12.1) (2022-07-26)

### Bug Fixes

-   **wdio:** fixed setTestID typings ([#72](https://github.com/rnw-community/rnw-community/issues/72)) ([ecacd8f](https://github.com/rnw-community/rnw-community/commit/ecacd8f1492fdacab5ae7fa76976b287ca6d52ab))

# [0.12.0](https://github.com/rnw-community/rnw-community/tree/master/packages/wdio/compare/v0.11.0...v0.12.0) (2022-07-26)

### Features

-   Added wdio package ([#68](https://github.com/rnw-community/rnw-community/tree/master/packages/wdio/issues/68)) ([da771bb](https://github.com/rnw-community/rnw-community/tree/master/packages/wdio/commit/da771bb3ff73d9b02de6ff8c458dbde334b4b9e9))
