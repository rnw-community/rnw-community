import path from 'path';

import nodeExternals from 'webpack-node-externals';

import { swcConfig } from './swc.config';

import type { Configuration } from 'webpack';

export const getNestJSWebpackGenericConfig = (
    options: Configuration,
    swcOptions: Record<string, unknown> = {}
): Configuration => ({
    ...options,
    externals: [nodeExternals({ modulesFromFile: true, allowlist: ['webpack/hot/poll?100'] })],
    externalsPresets: { node: true },
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(process.cwd(), '.build_cache'),
        allowCollectingMemory: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/u,
                use: { loader: 'swc-loader', options: { ...swcConfig, ...swcOptions } },
                exclude: /(node_modules)/u,
            },
        ],
    },
});
