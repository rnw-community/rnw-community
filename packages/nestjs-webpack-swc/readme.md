# NestJS Webpack + SWC configuration

NestJS webpack and SWC configuration helpers, this can speed up your local NestJS development up to
10x.

-   [NestJS](https://docs.nestjs.com) offers [Webpack](https://webpack.js.org) configuration with [HMR](https://docs.nestjs.com/recipes/hot-reload) which significantly
    improves rebuild speed within local development especially if your project grows.
-   [SWC](https://swc.rs) is **next generation of fast developer tools** which transpiles typescript blazingly
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
module.exports =
    require('@rnw-community/nestjs-webpack-swc/dist/config/get-nestjs-webpack-dev.config').getNestJSWebpackDevConfig;
```

### Production webpack configuration

Create `webpack-prod.config.js` in root of the NestJS package:

```js
module.exports =
    require('@rnw-community/nestjs-webpack-swc/dist/config/get-nestjs-webpack-prod.config').getNestJSWebpackProdConfig;
```

### NestJS HMR

For blazing fast DX, this package provides utility to simplify [HMR configuration](https://docs.nestjs.com/recipes/hot-reload):

```ts
import { handleNestJSWebpackHmr } from '@rnw-community/nestjs-webpack-swc';

const bootstrap = async (): Promise<void> => {
    //...
    handleNestJSWebpackHmr(app, module);
};
```

### Scripts package.json

Change `package.json` `build`, `start:dev` scripts:

```json
{
    "build": "nest build --webpack --webpackPath webpack-prod.config.js",
    "start:dev": "nest build --webpack --webpackPath webpack-dev.config.js --watch"
}
```

### .gitignore

For maximum speed webpack is configured to generate [filesystem cache](https://webpack.js.org/configuration/cache/) and uses `.build_cache` folder
in package root, so you need to add it to your `.gitignore` file.

## Possible webpack issues

Due to webpack bundling approach you may encounter problems with packages that use absolute/relative paths, each of this
cases needs separate solutions. Feel free to open an issue.

### Typeorm migrations

If your project is using [TypeORM](https://typeorm.io), then you will face problems with running migrations from NestJS app,
this package provides utility for loading TypeORM migrations within webpack build.

1. Install additional dev dependencies:

-   [@types/webpack-env](https://www.npmjs.com/package/@types/webpack-env)

2. Add this package to your `tsconfig.*.json` files:

```json
{
    "compilerOptions": {
        "types": ["node", "@types/webpack-env"]
    }
}
```

3. Add code that will return class instances array that you can pass to TypeORM configuration, you will only need to provide
   path to the folder where all migrations are stored:

```ts
const migrations = importTypeormWebpackMigrations(require.context('./migration/', true, /\.ts$/u));
```

#### Typeorm CLI

With webpack in place you will not have your migrations transpiled into the dist folder anymore so to use typeorm cli
you will need additional changes:

1. Install additional dev dependencies:
    - [ts-node](https://github.com/TypeStrong/ts-node)
    - [tsconfig-paths](https://github.com/dividab/tsconfig-paths)
2. Add/change your `package.json` scripts(you should have `tsconfig.build.json` with `module:commonjs`):

```json
{
    "scripts": {
        "typeorm": "ts-node -P tsconfig.build.json -r tsconfig-paths/register ./node_modules/.bin/typeorm",
        "migrate:create": "yarn typeorm migration:create -d ./data-source.mjs",
        "migrate:down": "yarn typeorm migration:revert -d ./data-source.mjs",
        "migrate:generate": "yarn typeorm migration:generate -d ./data-source.mjs",
        "migrate:up": "yarn typeorm migration:run -d ./data-source.mjs"
    }
}
```

> `-d ./data-source.mjs` is a [TypeORM v3 breaking changes](https://github.com/typeorm/typeorm/blob/master/CHANGELOG.md#breaking-changes-1) you can remove it for v2

## SWC possible issues

### SWC bindings

If your project is running inside the docker container and your host system has different architecture
you may end up with `Error: Bindings not found` SWC error, this is happening because when you install
[SWC](https://swc.rs) it uses the bindings for your host machine, to fix this:

1. Create `.yarnrc` file in the project root:

```plain
--ignore-engines true
--ignore-platform true
```

2. Add swc bindings dependencies:

```json
{
    "@swc/core-linux-arm64-musl": "^1.2.242",
    "@swc/core-linux-x64-musl": "^1.2.242"
}
```

#
