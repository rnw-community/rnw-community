# @rnw-community/nestjs-typed-config

Strongly-typed, Joi-validated NestJS configuration with Docker/K8s `_FILE` env variable support and in-memory caching.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  index.ts                          — barrel: module, service
  env.type.ts                       — EnvType<T, K extends keyof T> = T[K] (indexed access utility type)
  nest-js-typed-config.module.ts    — NestJSTypedConfigModule.create<Enum, C>(joiSchema)
  nest-js-typed-config.service.ts   — NestJSTypedConfigService<EnvEnum, EnvTypes, EnvKeys>
```

### Key Patterns

- `NestJSTypedConfigModule.create<Enum extends string, C extends Record<Enum, boolean | number | string>>(joiSchema:
  Joi.ObjectSchema<C>)` declares an inline `class Service extends NestJSTypedConfigService<Enum, C, Extract<keyof C,
  string>>` with no constructor override, wires `ConfigModule.forRoot({ cache: true, validationSchema: joiSchema,
  validationOptions: { abortEarly: false }, isGlobal: true })`, and returns `[DynamicModule, Type<Service>]` — the
  returned `DynamicModule` itself also sets `global: true`, so the module is global on two levels: NestJS's own
  `ConfigModule` and this module's own `providers`/`exports`
- `abortEarly: false` means Joi validation reports every failing env var at once instead of stopping at the first
  failure
- `NestJSTypedConfigService.get<T extends EnvKeys>(envVariable)` checks `envCache` (a `Map`) first; a cache hit
  short-circuits straight to the stored value plus a debug log, so file reads and `ConfigService.get` calls only ever
  happen once per key for the lifetime of the service instance
- On a cache miss, `get` reads `ConfigService.get(envVariable)` and branches on `envVariable.endsWith('_FILE')`:
  - **matches**: delegates to `handleFileEnvVariable`, which reads the `_FILE` key's own value as a candidate
    filesystem path (`isNotEmptyString(filePath)`); if that path is set, `readFileEnvFromFS` requires
    `existsSync(path)` (throwing `Error('Could not read file "<envVariable>"')` if it's missing) and returns
    `readFileSync(path).toString().trim()`; if the `_FILE` variable itself is unset, `readFileEnvFromEnvironment`
    falls back to `ConfigService.get` on the same key with the `_FILE` suffix stripped
  - **no match**: the raw `ConfigService.get` result is cached and returned directly
- Every branch writes its result into `envCache` before returning — including the file-path branch — so `_FILE`-backed
  values are only ever read from disk once
- `EnvType<T, K extends keyof T> = T[K]` exists purely to give `get()` a return type that narrows per the specific
  `envVariable` key passed in, rather than the union of all possible config value types

### Dependencies

Peers: `@nestjs/common`, `@nestjs/config`, `joi` (all declared in both `devDependencies` and `peerDependencies`, plus
`@types/hapi__joi` as a type-only devDependency). Direct dependency: `@rnw-community/shared` (`isNotEmptyString`, used
in production `src`).

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — no package-level
`coverageThreshold` override in `jest.config.js`.
