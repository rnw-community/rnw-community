# @rnw-community/log-decorator

Framework-agnostic `@Log` method decorator with pluggable transport, cycle-safe sanitizer, and optional duration measurement. Built on `@rnw-community/decorators-core`.

## Package Commands

```bash
yarn test               # Run tests
yarn test:coverage      # Tests with coverage
yarn build              # Build (dual ESM + CJS)
yarn ts                 # Type check
yarn lint:fix           # Fix lint issues
```

## Architecture

```
src/
  interface/
    log-transport-interface/
    create-log-options-interface/
  type/
    pre-log-input-type/
    post-log-input-type/
    error-log-input-type/
    sanitizer-fn-type/
  transport/
    console-transport/        — default consoleTransport + spec
  util/
    default-sanitizer/        — cycle-safe, Error/Date/RegExp/Map/Set aware, + spec
  factory/
    create-log-interceptor/   — internal (shared by stage-3 + legacy factories)
    create-log/               — stage-3 factory + spec
    create-legacy-log/        — legacy factory + spec
  index.ts
```

## Key Patterns

- One entity per folder
- `defaultSanitizer` is a **path-set** cycle guard — ancestor refs flagged as `[Circular]`; shared-reference DAGs (sibling positions pointing to the same node) serialize normally
- `Error` → `{name, message, stack}` (message is non-enumerable; native `Object.keys` would lose it)
- `Date` → ISO string; invalid Date → `'[Invalid Date]'` (never throws `RangeError`)
- `RegExp` → string form; `Map`/`Set` → `{_type, size}` summary
- String truncation at 200 chars → `<truncated:N>`; array length > 20 → `{length: N}`
- Observable support: pass `observableStrategy` from `@rnw-community/decorators-core/rxjs` via the `strategies` factory option

## Dependencies

- `@rnw-community/decorators-core` — interceptor engine
- `@rnw-community/shared` — `isDefined`

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
