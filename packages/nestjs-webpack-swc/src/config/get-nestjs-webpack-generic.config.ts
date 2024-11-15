import path from 'path';

import nodeExternals from 'webpack-node-externals';

import { swcConfig } from './swc.config';

import type { Configuration } from 'webpack';
import type webpackNodeExternals from 'webpack-node-externals';

export const getNestJSWebpackGenericConfig = (
    options: Configuration,
    swcOptions: Record<string, unknown> = {},
    allowList: webpackNodeExternals.Options['allowlist'] = []
): Configuration => ({
    ...options,
    externals: [
        // HINT: We need to include this package inside the build to handle missing dependencies errors, and tree-shake it
        nodeExternals({
            modulesFromFile: true,
            allowlist: ['webpack/hot/poll?100', ...(Array.isArray(allowList) ? allowList : [allowList])],
        }),
    ],
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
    node: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __dirname: false,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __filename: false,
    },
});
