# @rnw-community/platform

React Native/Web platform detection constants, conditional styling helpers, and a cross-platform env-variable getter.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  platform/
    platform.ts       — isWeb, isIOS, isAndroid, isMobile: booleans derived once from react-native's Platform.OS
    platform.mock.ts   — jest.mock('react-native', ...) stub forcing Platform.OS to the sentinel 'no'
  platform-style/
    platform-style.ts  — webStyles, mobileStyles, iosStyles, androidStyles (all built on one internal platformStyles helper)
  get-env/
    get-env.ts         — getEnv(key): reads react-native-config's Config[key] (native/RN target)
    get-env.web.ts      — getEnv(key): reads process.env[`REACT_APP_${key}`] (web target, resolved via the .web.ts suffix)
  index.ts             — re-exports the platform booleans, the 4 style helpers, and getEnv
```

### Key Patterns

- `.web.ts` suffix on `get-env.web.ts` is the Metro/webpack platform-resolution convention: bundlers pick it over
  `get-env.ts` when building for web, so `getEnv` has one call-site contract with two source implementations
- `platformStyles(isPlatform: boolean, style: T): R | object` is **not curried** — it takes both the platform flag and
  the style object as plain arguments and returns `style` if `isPlatform` is true, else `{}`; each exported helper
  (`webStyles`, `mobileStyles`, `iosStyles`, `androidStyles`) is a thin single-arg wrapper that closes over one of the
  imported `is*` booleans
- `platform.mock.ts` sets `Platform.OS` to the non-standard string `'no'` (not `'ios'`/`'android'`/`'web'`), so every
  boolean is `false` by default when a spec imports the mock; specs that need a specific platform then reassign the
  exported `const` directly (`constants.isWeb = true`) via `@ts-expect-error`, since the module has no setter API
- `getEnv` has no shared implementation between targets: the RN version delegates entirely to `react-native-config`'s
  default export indexed by `key`; the web version indexes `process.env` with a hardcoded `REACT_APP_` prefix
- Jest preset is `'react-native'` (second arg to `get-jest.config.js('platform', 'react-native')`), unlike the other
  packages in this document which pass no preset

### Dependencies

- No runtime `dependencies` — this package has none
- Peers: `react` (>=18), `react-native` (>=0.72), `react-native-config` (>=1.4) — all three are also devDependencies
  for local type-checking and the `platform.mock.ts` jest mock

### Coverage

Default monorepo threshold: 99.9% on all metrics.
