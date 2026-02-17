# @rnw-community/nestjs-webpack-swc

Pre-configured Webpack + SWC build configs for NestJS — dev (HMR) and prod (Terser minification). Replaces ts-loader with the faster swc-loader.

## Package Commands

```bash
yarn build && yarn ts && yarn lint:fix
```

Note: This package has **no unit tests** — it is a configuration/utility library.

## Architecture

```
src/
  config/
    swc.config.ts                       — Base SWC options (es2020, decorators, keepClassNames)
    get-nestjs-webpack-generic.config.ts — Shared base Webpack config factory (internal)
    get-nestjs-webpack-dev.config.ts     — Dev config (HMR via polling, WatchIgnorePlugin, RunScriptWebpackPlugin)
    get-nestjs-webpack-prod.config.ts    — Prod config (TerserPlugin, no mangle, keep_classnames)
  hmr/
    handle-nestjs-webpack-hmr.ts         — Wires HMR accept/dispose on NestJS app
    hmr-module.interface.ts              — HmrModuleInterface type
  typeorm/
    import-typeorm-webpack-migrations.util.ts — Loads TypeORM migrations from webpack require.context
```

### Subpath Exports

`./get-nestjs-webpack-dev.config`, `./get-nestjs-webpack-prod.config` — config factories are NOT in the root barrel (intended as targeted imports).

### Key Patterns

- Layered factory: `generic` → `dev` or `prod` (generic is internal, never exported)
- NestJS-safe Terser: `mangle: false`, `keep_classnames: true` (NestJS DI depends on class names)
- HMR via `webpack/hot/poll?100` (polling, robust in Docker/VM environments)
- `webpack-node-externals` with `modulesFromFile: true` (reads from package.json)
- Filesystem cache at `.build_cache/` for faster rebuilds

### Dependencies

Peers: `webpack`, `swc-loader`, `@swc/core`, `@swc/cli`, `@swc/helpers`, `run-script-webpack-plugin`, `terser-webpack-plugin`, `webpack-node-externals`, `@nestjs/common`. Internal: `@rnw-community/shared`.
