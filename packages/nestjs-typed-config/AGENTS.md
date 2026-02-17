# @rnw-community/nestjs-typed-config

Strongly-typed, Joi-validated NestJS configuration with Docker/K8s `_FILE` env variable support and in-memory caching.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  env.type.ts                        — EnvType<T, K> utility type (indexed access)
  nest-js-typed-config.module.ts     — NestJSTypedConfigModule with create() factory
  nest-js-typed-config.service.ts    — NestJSTypedConfigService<EnvEnum, EnvTypes, EnvKeys>
```

### Key Patterns

- `NestJSTypedConfigModule.create<Enum, Config>(joiSchema)` returns `[DynamicModule, Type<Service>]` — same tuple pattern as other NestJS packages
- Module is `global: true` with `ConfigModule.forRoot({ cache: true, validationOptions: { abortEarly: false } })`
- `_FILE` env variables: if key ends in `_FILE`, reads filesystem path and returns file content (trimmed)
- Values cached in `private readonly envCache = new Map()` to avoid repeated lookups/file reads
- Falls back from `_FILE` to non-`_FILE` env var if file var is unset

### Dependencies

Peers: `@nestjs/common`, `@nestjs/config`, `joi`. Internal: `@rnw-community/shared`.

### Coverage

Default: **99.9%** all metrics.
