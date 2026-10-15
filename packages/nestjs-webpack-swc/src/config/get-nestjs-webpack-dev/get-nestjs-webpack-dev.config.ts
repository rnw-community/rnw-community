import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

import { isString } from '@rnw-community/shared';

import { getNestJSWebpackGenericConfig } from '../get-nestjs-webpack-generic/get-nestjs-webpack-generic.config';

import type { Configuration } from 'webpack';
import type Webpack from 'webpack';

const HOT_POLL_ENTRY = 'webpack/hot/poll?100';

const getHotReloadEntry = (entry: Configuration['entry']): string[] => {
    if (isString(entry)) {
        return [HOT_POLL_ENTRY, entry];
    }

    if (Array.isArray(entry)) {
        return [HOT_POLL_ENTRY, ...entry];
    }

    throw new TypeError('getNestJSWebpackDevConfig requires a string or string[] entry to prepend the hot-reload poll');
};

export const getNestJSWebpackDevConfig = (options: Configuration, webpack: typeof Webpack): Configuration => ({
    ...getNestJSWebpackGenericConfig(options),
    entry: getHotReloadEntry(options.entry),
    plugins: [
        ...(options.plugins ?? []),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.WatchIgnorePlugin({ paths: [/\.js$/u, /\.d\.ts$/u] }),

        new RunScriptWebpackPlugin({ name: options.output?.filename as string, autoRestart: false }),
    ],
});
