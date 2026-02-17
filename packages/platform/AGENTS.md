# @rnw-community/platform

React Native/Web platform detection utilities, conditional styling helpers, and cross-platform env abstraction.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  platform/        — isWeb, isIOS, isAndroid, isMobile boolean constants + platform.mock.ts
  platform-style/  — webStyles, mobileStyles, iosStyles, androidStyles helpers
  get-env/         — getEnv (RN: react-native-config) / get-env.web.ts (Web: process.env)
```

### Key Patterns

- `.web.ts` suffix pattern for Metro/webpack platform resolution
- `platform.mock.ts` provides test overrides for platform booleans
- `platformStyles(condition)(style)` returns style only if platform matches, else `{}`
- `getEnv(key)` on web returns `process.env['REACT_APP_' + key]`
- Jest uses `'react-native'` preset

### Dependencies

Peers: `react`, `react-native`, `react-native-config`. No internal deps.

### Coverage

Default: **99.9%** all metrics.
```
