# NestJS Webpack + SWC configuration

NestJS webpack and SWC configuration helpers, this can speed up your local NestJS development up to
10x.

-   [NestJS](https://docs.nestjs.com) offers [Webpack](https://webpack.js.org) configuration with [HMR](https://docs.nestjs.com/recipes/hot-reload) which significantly
    improves rebuild speed within local development especially if your project grows.
-   [SWC](https://swc.rs) is **next generation of fast developer tools** which complies typescript blazingly
    fast compared to [Babel](https://babeljs.io), and it has webpack [swc-loader](https://github.com/swc-project/swc-loader)

> This package helps to easily configure NestJS webpack and SWC integration and make you DX good and quick again

## Installation

1. Install package `@rnw-community/nestjs-webpack-swc` using your package manager
2. Install additional peer dependencies:
    - [run-script-webpack-plugin](https://github.com/atassis/run-script-webpack-plugin)
    - [webpack](https://github.com/webpack/webpack)
    - [webpack-node-externals](https://github.com/liady/webpack-node-externals)
    - [swc-loader](https://github.com/swc-project/swc-loader)
    - [@swc/cli](https://github.com/swc-project/cli)
    - [@swc/core](https://github.com/swc-project/swc)
    - [@swc/helpers](https://github.com/swc-project/helpers)

## Configuration

### Development webpack configuration

Create `webpack-dev.config.js` in root of the NestJS package:

```js
module.exports = require('@rnw-community/nestjs-webpack-swc').getNestJSWebpackDevConfig;
```

### Production webpack configuration

Create `webpack-prod.config.js` in root of the NestJS package:

```js
module.exports = require('@dotgoclub/be-lib').getNestJSWebpackProdConfig;
```

### Scripts package.json

Change `package.json` `build`, `start:dev` scripts:

```json
"build": "nest build --webpack --webpackPath webpack-prod.config.js",
"start:dev": "nest build --webpack --webpackPath webpack-dev.config.js --watch"
```

## Typeorm migrations

If your project is using [TypeORM](https://typeorm.io), then you will face problems with running migrations from NestJS app,
this package provides utility for loading TypeORM migrations within webpack build.

Install additional peer dependencies:

-   [@types/webpack-env](https://www.npmjs.com/package/@types/webpack-env)

Following code will return class instances array that you can pass to TypeORM configuration, you will only need to provide
path to the folder where all migrations are stored:

```ts
const migrations = importTypeormWebpackMigrations(require.context('./migration/', true, /\.ts$/u));
```

## SWC bindings

If your project is running inside the docker container and your host system has different architecture
you may end up with `Error: Bindings not found` SWC error, this is happening because when you install
[SWC](https://swc.rs) it uses the bindings for your host machine, to fix this you can add the following
`package.json` script and add it to `postinstall` script:

```json
"swc-install-bindings": "npm install --no-save --loglevel=error --prefer-offline --no-audit --progress=false --force @swc/core-linux-arm64-musl @swc/core-linux-x64-musl",
"postinstall": "yarn swc-install-bindings"
```
