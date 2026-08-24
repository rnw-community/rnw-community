# @rnw-community/wdio

WebDriverIO test automation utilities — custom commands, Proxy-based typed page objects (Component / RootedComponent), platform-aware testID selectors, and capability detection.

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm lint:fix
```

## Architecture

```text
src/
  add-wdio-commands.ts — addWdioCommands(browser) entry point, registers every command below
  wdio.d.ts         — ambient `WebdriverIO` namespace augmentation (Element/Browser/MultiRemoteBrowser
                       command signatures) so `browser.testID$(...)` etc. type-check for consumers
  capability/       — isAndroidCapability, isBrowserCapability, isIOSCapability detection
  command/          — testID$, testID$$, el$, els$ (command/index.ts barrel); testID$$Index, byIndex$$ and
                       swipeCommand are imported by path (not re-exported from the barrel); clearInputCommand,
                       slowInputCommand
    mobile/         — openDeepLinkCommand, relativeClickCommand
  component/        — Component<T> base class (Proxy-based selector resolution); createComponent, getComponent,
                       getExtendedComponent factories
    mocks/          — *.mock.ts fixtures consumed by componnet.spec.ts and sibling specs (legacy scaffolding,
                       predates the "test-only code lives inside the spec" rule — see root AGENTS.md exception)
  component$/       — Promise-returning component factory variants (createComponent$, getComponent$,
                       getExtendedComponent$) + their own mocks/
  rooted-component/ — RootedComponent<T> extends Component<T>, scopes child lookups to a `RootEl` getter;
                       createRootedComponent, getRootedComponent, getExtendedRootedComponent + mocks/
  rooted-component$/ — Promise-returning rooted component variants + mocks/
  config/           — defaultComponentConfig (testID$/testID$$/testID$$Index-backed) and default$ComponentConfig
                       (el$/els$/byIndex$$-backed, for raw-selector component variants); web-selector.config.ts
                       exports the 'data-test-id' constant
  selector/         — Platform-aware testID selectors: testIDSelector picks web vs. mobile via
                       isBrowserCapability(); mobileTestIDSelector picks android vs. ios via isAndroidCapability()
                       (both mobile selectors currently render identical `~id` strings)
  selector-element/ — SelectorElement Proxy (chains .el()/.els()/.byIdx() calls)
  interface/        — TestIDProps, AndroidTestIDProps, WebTestIDProps
  type/             — ElSelectorFn, ElsSelectorFn, ElsIndexSelectorFn, ComponentConfigInterface, SwipeDirectionType, etc.
  util/             — getTestID, setTestID, setPropTestID
```

### Key Patterns

- **Proxy-based page objects**: `Component`'s constructor returns `new Proxy(this, { get: (client, field) => client.proxyGet(field, receiver) })` — a field found on `this` passes through via `Reflect.get`, a field found in `selectors` is wrapped in a `SelectorElement`, and anything unresolved falls back through `parentComponents` before an optional `notFoundFn`
- **`RootedComponent` extends `Component`**: it overrides `getChildEl`/`getChildEls`/`getChildElByIdx` to resolve against its own `RootEl` getter (`config.elSelectorFn(parentElInput)`) instead of the global `browser`, and its Proxy `get` trap falls back to `Reflect.get(client.RootEl, field, receiver)` for anything not found on the instance — that's what lets `rootedComponent.someRawElementMethod()` work without an explicit `.el()`
- **SelectorElement proxy chain**: `page.submitBtn.click()` works without `.el()` — property access is forwarded to the underlying `ChainablePromiseElement`
- **Platform-aware selectors**: `testIDSelector` checks `isBrowserCapability()` at runtime → `[data-test-id="id"]` (web) or `~id` (mobile, via `mobileTestIDSelector`)
- **`addWdioCommands(browser)`** must be called once (typically in `wdio.conf.ts` `before` hook) — registers `testID$`/`testID$$`/`openDeepLink` at the browser level and `testID$`/`testID$$`/`slowInput`/`clearInput`/`relativeClick`/`swipe` at the element level
- Import `ElementReference` from `@wdio/protocols` (used by `ElSelectorFn`/`ElsSelectorFn` in `src/type`), not from a deep `build/types` path
- **Legacy mock scaffolding**: every `component*`/`rooted-component*` folder keeps its fixtures in a colocated `mocks/*.mock.ts` rather than inlined in the spec — this predates the monorepo's "test-only code lives inside the spec" rule and is the documented exception in the root `AGENTS.md`; `.mock.ts` files are excluded from coverage via `coveragePathIgnorePatterns: ['.mock.ts']` in `get-jest.config.js`

### Dependencies

`@rnw-community/shared`, `@wdio/globals`, `@wdio/protocols`, `webdriverio`

### Coverage

Default monorepo threshold: **99.9%** for statements, branches, functions, and lines (`get-jest.config.js`, no
per-package override in `packages/wdio/jest.config.js`).
