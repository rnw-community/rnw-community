# @rnw-community/wdio

WebDriverIO test automation utilities — custom commands, Proxy-based typed page objects (Component / RootedComponent), platform-aware testID selectors, and capability detection.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  capability/       — isAndroid, isBrowser, isIOS detection
  command/          — Custom WDIO commands: testID$, testID$$, testID$$Index, el, els, swipe, clearInput, slowInput
    mobile/         — openDeepLink, relativeClick
  component/        — Component<T> base class (Proxy-based selector resolution)
  component$/       — Promise-returning component factory variants
  rooted-component/ — RootedComponent<T> (scoped child lookups to root element)
  rooted-component$/ — Promise-returning rooted component variants
  config/           — Default component configs, web selector constant ('data-test-id')
  selector/         — Platform-aware testID selectors (web: [data-test-id="x"], mobile: ~x)
  selector-element/ — SelectorElement Proxy (chains .el()/.els()/.byIdx() calls)
  interface/        — TestIDProps, AndroidTestIDProps, WebTestIDProps
  type/             — ElSelectorFn, ElsSelectorFn, ComponentConfigInterface, etc.
  util/             — getTestID, setTestID, setPropTestID
```

### Key Patterns

- **Proxy-based page objects**: `Component` constructor returns `new Proxy(this, ...)` — property access on selectors is intercepted and wrapped in `SelectorElement`
- **SelectorElement proxy chain**: `page.submitBtn.click()` works without `.el()` — property access is forwarded to the underlying `ChainablePromiseElement`
- **Platform-aware selectors**: `testIDSelector` checks `isBrowserCapability()` at runtime → `[data-test-id="id"]` (web) or `~id` (mobile)
- **`addWdioCommands(browser)`** must be called once (typically in `wdio.conf.ts` `before` hook) — registers commands at both browser and element level
- Import `ElementReference` from `@wdio/protocols` (not from deep `build/types` path)

### Dependencies

`@rnw-community/shared`, `@wdio/globals`, `@wdio/protocols`, `webdriverio`

### Coverage

Default: **99.9%** all metrics.
