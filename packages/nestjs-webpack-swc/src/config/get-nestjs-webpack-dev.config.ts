import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

import { getNestJSWebpackGenericConfig } from './get-nestjs-webpack-generic.config';

import type { Configuration, WebpackPluginInstance } from 'webpack';
import type Webpack from 'webpack';

// ts-prune-ignore-next
export const getNestJSWebpackDevConfig = (options: Configuration, webpack: typeof Webpack): Configuration => ({
    ...getNestJSWebpackGenericConfig(options),
    // @ts-expect-error Improve this extending
    entry: ['webpack/hot/poll?100', options.entry],
    plugins: [
        ...(options.plugins as WebpackPluginInstance[]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.WatchIgnorePlugin({ paths: [/\.js$/u, /\.d\.ts$/u] }),
        new RunScriptWebpackPlugin({ name: options.output?.filename as string, autoRestart: false }),
    ],
});
