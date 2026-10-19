import TerserPlugin from 'terser-webpack-plugin';

import { getNestJSWebpackGenericConfig } from '../get-nestjs-webpack-generic/get-nestjs-webpack-generic.config';

import type { Configuration } from 'webpack';
import type Webpack from 'webpack';

/**
 * Builds the production webpack configuration for a NestJS app, compiling with minified SWC output and Terser that keeps class names.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-webpack-swc/readme.md#production-webpack-configuration
 */
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
                    mangle: false,
                },
            }),
        ],
    },
});
