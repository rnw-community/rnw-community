[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://stand-with-ukraine.pp.ua)

# rnw-community

TypeScript packages for NestJS, React, React Native and React Native Web.

[![Pull Request](https://github.com/rnw-community/rnw-community/actions/workflows/pr.yml/badge.svg)](https://github.com/rnw-community/rnw-community/actions/workflows/pr.yml)
[![Release](https://github.com/rnw-community/rnw-community/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/rnw-community/rnw-community/actions/workflows/release.yml)
[![iOS Maestro E2E](https://github.com/rnw-community/rnw-community/actions/workflows/ios-maestro.yml/badge.svg?branch=master)](https://github.com/rnw-community/rnw-community/actions/workflows/ios-maestro.yml)
[![Android Maestro E2E](https://github.com/rnw-community/rnw-community/actions/workflows/android-maestro.yml/badge.svg?branch=master)](https://github.com/rnw-community/rnw-community/actions/workflows/android-maestro.yml)
[![codecov](https://codecov.io/gh/rnw-community/rnw-community/graph/badge.svg?token=T0THT8I97I)](https://codecov.io/gh/rnw-community/rnw-community)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

This pnpm + Turbo monorepo publishes every `@rnw-community/*` package from one place. The packages include shared type
guards and helpers, method decorators that work with any framework, NestJS RxJS modules, and React Native UI and
payments libraries. Each package:

- is published as both ESM and CommonJS, with type declarations
- requires Node 22 or later
- is checked with strict TypeScript, ESLint, publint and attw
- must keep unit-test coverage at 99.9%

## Packages

Each package directory has a `readme.md` (the public API, with an example for every export), an `AGENTS.md` (layout and
patterns) and an `llms.txt` (an entry point for agents). [`llms.txt`](./llms.txt) at the repository root indexes all
of them.

### Core utilities

| Package                                                          | npm                                                                                                                                     | Description                                                                         |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [@rnw-community/shared](./packages/shared)                       | [![npm](https://img.shields.io/npm/v/@rnw-community/shared)](https://www.npmjs.com/package/@rnw-community/shared)                       | Type guards, utility types and helpers (`isDefined`, `emptyFn`, `wait`, `Maybe`, …) |
| [@rnw-community/object-field-tree](./packages/object-field-tree) | [![npm](https://img.shields.io/npm/v/@rnw-community/object-field-tree)](https://www.npmjs.com/package/@rnw-community/object-field-tree) | Typed trees of nested field combinations, built from a data-generator callback      |
| [@rnw-community/rxjs-errors](./packages/rxjs-errors)             | [![npm](https://img.shields.io/npm/v/@rnw-community/rxjs-errors)](https://www.npmjs.com/package/@rnw-community/rxjs-errors)             | RxJS operators and error classes that filter and rethrow errors in observables      |
| [@rnw-community/redux-loadable](./packages/redux-loadable)       | [![npm](https://img.shields.io/npm/v/@rnw-community/redux-loadable)](https://www.npmjs.com/package/@rnw-community/redux-loadable)       | Redux slice, selectors and helpers that track loading and error state for requests  |

### Method decorators

| Package                                                                            | npm                                                                                                                                                       | Description                                                                              |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [@rnw-community/decorators-core](./packages/decorators-core)                       | [![npm](https://img.shields.io/npm/v/@rnw-community/decorators-core)](https://www.npmjs.com/package/@rnw-community/decorators-core)                       | Interceptor primitive, independent of any framework, used to build method decorators     |
| [@rnw-community/log-decorator](./packages/log-decorator)                           | [![npm](https://img.shields.io/npm/v/@rnw-community/log-decorator)](https://www.npmjs.com/package/@rnw-community/log-decorator)                           | Logs before a method runs, after it returns and when it throws; you supply the transport |
| [@rnw-community/histogram-metric-decorator](./packages/histogram-metric-decorator) | [![npm](https://img.shields.io/npm/v/@rnw-community/histogram-metric-decorator)](https://www.npmjs.com/package/@rnw-community/histogram-metric-decorator) | Records how long each method call takes, using any histogram transport                   |
| [@rnw-community/lock-decorator](./packages/lock-decorator)                         | [![npm](https://img.shields.io/npm/v/@rnw-community/lock-decorator)](https://www.npmjs.com/package/@rnw-community/lock-decorator)                         | Sequential and exclusive locks for methods that return a Promise or an Observable        |

### NestJS

| Package                                                              | npm                                                                                                                                         | Description                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [@rnw-community/nestjs-enterprise](./packages/nestjs-enterprise)     | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-enterprise)](https://www.npmjs.com/package/@rnw-community/nestjs-enterprise)     | Enterprise NestJS decorators and modules built on the decorator packages |
| [@rnw-community/nestjs-rxjs-logger](./packages/nestjs-rxjs-logger)   | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-rxjs-logger)](https://www.npmjs.com/package/@rnw-community/nestjs-rxjs-logger)   | NestJS logger wrapper that provides pipeable RxJS logging operators      |
| [@rnw-community/nestjs-rxjs-metrics](./packages/nestjs-rxjs-metrics) | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-rxjs-metrics)](https://www.npmjs.com/package/@rnw-community/nestjs-rxjs-metrics) | Prometheus metrics wrapper for RxJS streams in NestJS                    |
| [@rnw-community/nestjs-rxjs-redis](./packages/nestjs-rxjs-redis)     | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-rxjs-redis)](https://www.npmjs.com/package/@rnw-community/nestjs-rxjs-redis)     | Redis wrapper for RxJS streams in NestJS                                 |
| [@rnw-community/nestjs-rxjs-lock](./packages/nestjs-rxjs-lock)       | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-rxjs-lock)](https://www.npmjs.com/package/@rnw-community/nestjs-rxjs-lock)       | Distributed lock for NestJS and RxJS, backed by Redis                    |
| [@rnw-community/nestjs-typed-config](./packages/nestjs-typed-config) | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-typed-config)](https://www.npmjs.com/package/@rnw-community/nestjs-typed-config) | Strongly typed NestJS configuration                                      |
| [@rnw-community/nestjs-webpack-swc](./packages/nestjs-webpack-swc)   | [![npm](https://img.shields.io/npm/v/@rnw-community/nestjs-webpack-swc)](https://www.npmjs.com/package/@rnw-community/nestjs-webpack-swc)   | Webpack and SWC configuration helpers that speed up NestJS builds        |

### React Native and React Native Web

| Package                                                                                      | npm                                                                                                                                                                 | Description                                                                                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [@rnw-community/react-native-payments](./packages/react-native-payments)                     | [![npm](https://img.shields.io/npm/v/@rnw-community/react-native-payments)](https://www.npmjs.com/package/@rnw-community/react-native-payments)                     | W3C Payment Request API for React Native (Apple Pay on iOS, Google Pay on Android), with an Expo config plugin  |
| [@rnw-community/react-native-collapsible-header](./packages/react-native-collapsible-header) | [![npm](https://img.shields.io/npm/v/@rnw-community/react-native-collapsible-header)](https://www.npmjs.com/package/@rnw-community/react-native-collapsible-header) | Reanimated collapsible header built from slots, with scroll wiring through a provider, snap and an overlay mode |
| [@rnw-community/react-native-screen-chrome](./packages/react-native-screen-chrome)           | [![npm](https://img.shields.io/npm/v/@rnw-community/react-native-screen-chrome)](https://www.npmjs.com/package/@rnw-community/react-native-screen-chrome)           | Safe-area screen layout, progressive edge fades and compound collapsible chrome around a single scrollable      |
| [@rnw-community/platform](./packages/platform)                                               | [![npm](https://img.shields.io/npm/v/@rnw-community/platform)](https://www.npmjs.com/package/@rnw-community/platform)                                               | Platform detection constants and helpers for React Native Web                                                   |
| [@rnw-community/fast-style](./packages/fast-style)                                           | [![npm](https://img.shields.io/npm/v/@rnw-community/fast-style)](https://www.npmjs.com/package/@rnw-community/fast-style)                                           | Utilities for quick flex and font styling in React Native                                                       |

### Tooling

| Package                                                  | npm                                                                                                                             | Description                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [@rnw-community/wdio](./packages/wdio)                   | [![npm](https://img.shields.io/npm/v/@rnw-community/wdio)](https://www.npmjs.com/package/@rnw-community/wdio)                   | WebdriverIO commands, page objects and helpers for end-to-end tests             |
| [@rnw-community/eslint-plugin](./packages/eslint-plugin) | [![npm](https://img.shields.io/npm/v/@rnw-community/eslint-plugin)](https://www.npmjs.com/package/@rnw-community/eslint-plugin) | ESLint plugin with React and React Native rules, such as `no-complex-jsx-logic` |

Three private example packages are not published. Each has bare React Native CLI and Expo apps and a Maestro end-to-end
suite: [react-native-payments-example](./packages/react-native-payments-example),
[react-native-collapsible-header-example](./packages/react-native-collapsible-header-example) and
[react-native-screen-chrome-example](./packages/react-native-screen-chrome-example).

## Quick start

### Using a package

Install the packages you need from npm. Each one lists its own peer dependencies in its readme.

```bash
npm install @rnw-community/shared
```

```ts
import { isDefined } from '@rnw-community/shared';

const ids = [1, null, 2, undefined].filter(isDefined);
```

### Working on the monorepo

You need Node.js 22+ (see [`.nvmrc`](./.nvmrc)) and pnpm 11, which is pinned in `packageManager`. Run
`corepack enable` to use the pinned version.

```bash
git clone https://github.com/rnw-community/rnw-community.git
cd rnw-community
pnpm install
pnpm build
```

| Command            | What it does                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `pnpm build`       | Builds every package (dual ESM + CJS into each package's `dist/`)                                              |
| `pnpm ts`          | Type-checks every package                                                                                      |
| `pnpm ts:nodenext` | Type-checks sources and specs with `nodenext` resolution                                                       |
| `pnpm lint`        | Runs oxlint, then ESLint (`pnpm lint:fix` fixes what it can)                                                   |
| `pnpm test`        | Runs the Jest unit tests (`pnpm test:coverage` also enforces the coverage threshold)                           |
| `pnpm publint`     | Runs publint and `@arethetypeswrong/cli` on the built packages                                                 |
| `pnpm assert:pack` | Checks each npm tarball: required files present, `llms.txt` links resolve, no test or build artifacts          |
| `pnpm assert:docs` | Checks that every relative link and anchor in the root docs (`llms.txt`, `README.md`, `AGENTS.md`, …) resolves |
| `pnpm smoke:esm`   | Packs every publishable package and loads it through both `import` and `require()`                             |
| `pnpm deadcode`    | Finds unused files, exports and dependencies with knip                                                         |
| `pnpm cpd`         | Detects copy-pasted code                                                                                       |

Every script also runs inside a single package, for example `cd packages/shared && pnpm test --watch`.

## Contributing

Start with [CONTRIBUTING.md](./CONTRIBUTING.md), which covers setup, the checks a pull request has to pass and the
commit format. The coding conventions are in [AGENTS.md](./AGENTS.md). [RELEASE.md](./RELEASE.md) explains versioning
and npm publishing. Report vulnerabilities privately, as described in [SECURITY.md](./SECURITY.md).

## License

This project is licensed under the [MIT License](./LICENSE.md).
