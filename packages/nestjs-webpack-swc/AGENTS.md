# @rnw-community/nestjs-webpack-swc

Pre-configured Webpack + SWC build configs for NestJS — dev (HMR) and prod (Terser minification). Replaces ts-loader with the faster swc-loader.

## Package Commands

```bash
yarn build && yarn ts && yarn lint:fix
```

This package has **no `test` or `test:coverage` script** in `package.json` — only `ts`, `build:esm`, `build:cjs`,
`build`, `lint`, `lint:fix`, `format`, `clear`, `clear:deps`. A `jest.config.js` exists (delegating to the shared
`get-jest.config.js` like every other package) but nothing invokes it — no script runs `jest` and no `.spec.ts` files
exist under `src/`. Treat the config as orphaned scaffolding, not a live coverage gate: there is no unit-test coverage
percentage to report for this package, and none should be assumed or backfilled without first adding a `test` script.

## Architecture

```
src/
  index.ts                                     — barrel: `export * from './typeorm'` + `export * from './hmr'`
                                                  (does NOT re-export config/ — see Subpath Exports)
  config/
    swc.config.ts                               — swcConfig: es2020 target, TS parser with decorators,
                                                    legacyDecorator + decoratorMetadata transforms, keepClassNames
    get-nestjs-webpack-generic.config.ts         — getNestJSWebpackGenericConfig(options, swcOptions?, allowList?):
                                                    shared base (never exported, internal-only)
    get-nestjs-webpack-dev.config.ts             — getNestJSWebpackDevConfig(options, webpack)
    get-nestjs-webpack-prod.config.ts            — getNestJSWebpackProdConfig(options, _webpack)
  hmr/
    index.ts                                     — barrel: HmrModuleInterface (type), handleNestJSWebpackHmr
    handle-nestjs-webpack-hmr.ts                  — handleNestJSWebpackHmr(app, webpackModule)
    hmr-module.interface.ts                       — HmrModuleInterface ({ hot?: { accept, dispose } })
  typeorm/
    index.ts                                      — barrel: importTypeormWebpackMigrations
    import-typeorm-webpack-migrations.util.ts     — importTypeormWebpackMigrations(requireContext)
```

### Subpath Exports

`./get-nestjs-webpack-dev.config`, `./get-nestjs-webpack-prod.config` — the two config factories are reached only via
these subpaths; the root `index.ts` barrel exports just `typeorm` and `hmr` (`HmrModuleInterface`,
`handleNestJSWebpackHmr`, `importTypeormWebpackMigrations`). `get-nestjs-webpack-generic.config.ts` and
`swc.config.ts` are never exported at all, from either the root or a subpath — they exist purely to be composed by
the dev/prod factories.

### Key Patterns

- Layered factory: `getNestJSWebpackGenericConfig(options, swcOptions?, allowList?)` is spread into by both
  `getNestJSWebpackDevConfig` and `getNestJSWebpackProdConfig`; it is never exported itself
- The generic config always injects `'webpack/hot/poll?100'` into the `webpack-node-externals` `allowlist` — even for
  the prod config — in addition to whatever `allowList` the caller passes (normalized via
  `Array.isArray(allowList) ? allowList : [allowList]`)
- `getNestJSWebpackProdConfig(options, _webpack)` calls the generic factory with `swcOptions = { minify: true }` and
  `allowList = '@rnw-community/nestjs-webpack-swc'` — the package allowlists **itself** by name in
  `webpack-node-externals` so its own runtime helpers aren't externalized out of the prod bundle; its second
  parameter (`_webpack`) is accepted for signature symmetry with the dev factory but is otherwise unused
- NestJS-safe Terser in prod: `mangle: false`, `keep_classnames: true` — NestJS's DI/reflection depends on
  constructor names surviving minification
- Dev config prepends `'webpack/hot/poll?100'` to `entry`, adds `HotModuleReplacementPlugin`,
  `WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] })`, and `RunScriptWebpackPlugin({ autoRestart: false })` — polling
  HMR is chosen over native filesystem watchers because it stays reliable in Docker/VM dev environments where inotify
  events don't propagate from bind mounts
- `webpack-node-externals` is configured with `modulesFromFile: true` (reads externals from `package.json` rather than
  scanning `node_modules`) on top of the allowlist described above
- Filesystem build cache lives at `path.resolve(process.cwd(), '.build_cache')` with `allowCollectingMemory: true`
- `handleNestJSWebpackHmr(app, webpackModule)` is a no-op unless `isDefined(webpackModule.hot)`; when present it calls
  `hot.accept()` and registers `hot.dispose(() => app.close())` so a hot-swapped module cleanly tears down the running
  Nest application before the replacement takes over
- `importTypeormWebpackMigrations(requireContext)` sorts `requireContext.keys()`, requires each module, and keeps only
  the exports whose value is a `function` — this is how TypeORM migration classes are collected from a Webpack
  `require.context` bundle without relying on filesystem globbing at runtime

### Dependencies

Peers: `@nestjs/common`, `@swc/cli`, `@swc/core`, `@swc/helpers`, `run-script-webpack-plugin`, `swc-loader`,
`terser-webpack-plugin`, `webpack`, `webpack-node-externals` (all consumer-supplied at their own compatible
versions — declared as `peerDependencies`, with matching `devDependencies` pins for building/type-checking this
package itself). Direct dependency: `@rnw-community/shared` (`isDefined`, used in `handleNestJSWebpackHmr`).
