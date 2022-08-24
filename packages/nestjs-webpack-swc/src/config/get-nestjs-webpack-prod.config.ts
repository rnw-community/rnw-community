import TerserPlugin from 'terser-webpack-plugin';

import { getNestJSWebpackGenericConfig } from './get-nestjs-webpack-generic.config';

import type { Configuration } from 'webpack';
import type Webpack from 'webpack';

export const getNestJSWebpackProdConfig = (options: Configuration, _webpack: typeof Webpack): Configuration => ({
    ...getNestJSWebpackGenericConfig(options, { minify: true }, '@rnw-community/nestjs-webpack-swc'),
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    keep_classnames: true,
                },
            }),
        ],
    },
});
