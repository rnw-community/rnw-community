import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

import { getNestJSWebpackGenericConfig } from '../get-nestjs-webpack-generic/get-nestjs-webpack-generic.config';

import type { Configuration } from 'webpack';
import type Webpack from 'webpack';

export const getNestJSWebpackDevConfig = (options: Configuration, webpack: typeof Webpack): Configuration => ({
    ...getNestJSWebpackGenericConfig(options),
    // @ts-expect-error entry type mismatch
    entry: ['webpack/hot/poll?100', options.entry],
    plugins: [
        ...(options.plugins ?? []),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.WatchIgnorePlugin({ paths: [/\.js$/u, /\.d\.ts$/u] }),

        new RunScriptWebpackPlugin({ name: options.output?.filename as string, autoRestart: false }),
    ],
});
